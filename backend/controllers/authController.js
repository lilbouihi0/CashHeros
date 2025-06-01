/**
 * @module controllers/authController
 * @description Authentication controller for user login, registration, and token management
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  refreshAccessToken,
  blacklistToken,
  revokeUserTokens
} = require('../utils/jwtUtils');
const { resetLoginRateLimit } = require('../middleware/rateLimitMiddleware');
const { 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendTwoFactorCode,
  sendBackupCodesEmail,
  sendAccountActivityEmail
} = require('../utils/emailUtils');
const {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode
} = require('../utils/twoFactorUtils');

/**
 * Generate a random token
 * @returns {string} Random token
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Generate verification token
    const verificationToken = generateRandomToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with verification token
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      verificationToken,
      verificationTokenExpires: tokenExpiry,
      verified: false,
      joinDate: new Date(),
      referralCode: crypto.randomBytes(6).toString('hex')
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in user document
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      device: req.headers['user-agent'] || 'unknown',
      ip: req.ip,
      lastUsed: new Date()
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // If user doesn't exist, return generic error
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (user.accountLocked) {
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        const minutesLeft = Math.ceil((user.accountLockedUntil - new Date()) / (1000 * 60));
        return res.status(403).json({ 
          success: false,
          message: `Account is locked. Please try again in ${minutesLeft} minute(s)`,
          code: 'ACCOUNT_LOCKED',
          locked: true,
          lockExpires: user.accountLockedUntil
        });
      } else {
        // If lock period has expired, unlock the account
        user.accountLocked = false;
        user.loginAttempts = 0;
        user.accountLockedUntil = null;
        await user.save();
      }
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.accountLocked = true;
        // Lock for 30 minutes
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30);
        user.accountLockedUntil = lockUntil;
        
        // Record the failed login attempt
        if (!user.loginHistory) {
          user.loginHistory = [];
        }
        
        user.loginHistory.push({
          timestamp: new Date(),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          successful: false
        });
        
        await user.save();
        
        return res.status(403).json({ 
          success: false,
          message: 'Account locked due to too many failed login attempts. Please try again in 30 minutes.',
          code: 'ACCOUNT_LOCKED',
          locked: true,
          lockExpires: lockUntil
        });
      }
      
      // Record the failed login attempt
      if (!user.loginHistory) {
        user.loginHistory = [];
      }
      
      user.loginHistory.push({
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        successful: false
      });
      
      await user.save();
      
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        attemptsLeft: 5 - user.loginAttempts
      });
    }

    // If login successful, reset login attempts
    user.loginAttempts = 0;
    user.accountLocked = false;
    user.accountLockedUntil = null;
    
    // Update login history
    if (!user.loginHistory) {
      user.loginHistory = [];
    }
    
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      successful: true
    });
    
    // Reset rate limiter for this IP and email
    resetLoginRateLimit(req.ip, email);
    
    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate a temporary token for 2FA verification
      const tempToken = crypto.randomBytes(32).toString('hex');
      
      // Store the token with 10-minute expiry
      const tokenExpiry = new Date();
      tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 10);
      
      user.twoFactorTempToken = tempToken;
      user.twoFactorTempTokenExpires = tokenExpiry;
      await user.save();
      
      // Send 2FA code via email
      await sendTwoFactorCode(user.email, 'Your login verification code');
      
      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication required',
        userId: user._id,
        tempToken,
        requiresTwoFactor: true,
        code: 'TWO_FACTOR_REQUIRED'
      });
    }
    
    // If 2FA is not enabled, proceed with normal login
    // Update last login time
    user.lastLogin = new Date();
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token in user document
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      device: req.headers['user-agent'] || 'unknown',
      ip: req.ip,
      lastUsed: new Date()
    });
    
    // Limit the number of refresh tokens per user (keep the 5 most recent)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Verify two-factor authentication
 * @route   POST /api/auth/verify-2fa
 * @access  Public
 */
exports.verifyTwoFactor = async (req, res) => {
  try {
    const { userId, tempToken, code } = req.body;
    
    if (!userId || !tempToken || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }
    
    const user = await User.findOne({ 
      _id: userId, 
      twoFactorTempToken: tempToken,
      twoFactorTempTokenExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Verify the 2FA code
    const isValid = verifyToken(user.twoFactorSecret, code);
    
    if (!isValid) {
      // Check if it's a backup code
      const isBackupCode = await verifyBackupCode(user, code);
      
      if (!isBackupCode) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid verification code',
          code: 'INVALID_CODE'
        });
      }
    }
    
    // Clear the temporary token
    user.twoFactorTempToken = undefined;
    user.twoFactorTempTokenExpires = undefined;
    
    // Update last login time
    user.lastLogin = new Date();
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token in user document
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      device: req.headers['user-agent'] || 'unknown',
      ip: req.ip,
      lastUsed: new Date()
    });
    
    // Limit the number of refresh tokens per user (keep the 5 most recent)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token is required',
        code: 'MISSING_TOKEN'
      });
    }
    
    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Update the last used timestamp for this refresh token
    const tokenIndex = user.refreshTokens.findIndex(t => t.token === refreshToken);
    if (tokenIndex !== -1) {
      user.refreshTokens[tokenIndex].lastUsed = new Date();
      await user.save();
    }
    
    // Generate a new access token
    const accessToken = generateAccessToken(user);
    
    res.status(200).json({
      success: true,
      accessToken,
      expiresIn: 900 // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const token = req.token;
    
    if (token) {
      // Blacklist the current access token
      blacklistToken(token);
    }
    
    if (refreshToken && req.user) {
      // Remove the refresh token from the user's document
      await User.updateOne(
        { _id: req.user.userId },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
exports.logoutAll = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Revoke all tokens for this user
    await revokeUserTokens(req.user.userId);
    
    // Clear all refresh tokens
    await User.updateOne(
      { _id: req.user.userId },
      { $set: { refreshTokens: [] } }
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Logged out from all devices successfully' 
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token',
        code: 'INVALID_TOKEN'
      });
    }

    // Update user as verified
    user.verified = true;
    user.verificationToken = undefined; // Clear the token
    user.verificationTokenExpires = undefined; // Clear the expiry
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
exports.resendVerification = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified',
        code: 'ALREADY_VERIFIED'
      });
    }

    // Generate new verification token
    const verificationToken = generateRandomToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours
    
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = tokenExpiry;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({ 
      success: true, 
      message: 'Verification email sent' 
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }
    
    const user = await User.findOne({ email });

    // Don't reveal if user exists or not for security
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'If your email is registered, you will receive a password reset link' 
      });
    }

    // Generate reset token and expiry
    const resetToken = generateRandomToken();
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1); // Token expires in 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpiry;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({ 
      success: true, 
      message: 'If your email is registered, you will receive a password reset link' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required',
        code: 'MISSING_PASSWORD'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token',
        code: 'INVALID_TOKEN'
      });
    }

    // Update password and clear reset token
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastPasswordChange = new Date();
    
    // Revoke all tokens for this user
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    
    // Clear all refresh tokens
    user.refreshTokens = [];
    
    await user.save();
    
    // Send account activity notification
    await sendAccountActivityEmail(user.email, {
      type: 'password_reset',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successful' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Setup two-factor authentication
 * @route   POST /api/auth/2fa/setup
 * @access  Private
 */
exports.setupTwoFactor = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Generate a new secret
    const secret = generateSecret(user.email);
    
    // Generate QR code
    const qrCode = await generateQRCode(secret.otpauth_url);
    
    // Store the secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Two-factor authentication setup initiated',
      secret: secret.base32,
      qrCode
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Verify and enable two-factor authentication
 * @route   POST /api/auth/2fa/enable
 * @access  Private
 */
exports.enableTwoFactor = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token is required',
        code: 'MISSING_TOKEN'
      });
    }
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    if (!user.twoFactorSecret) {
      return res.status(400).json({ 
        success: false, 
        message: 'Two-factor authentication not set up',
        code: 'NOT_SETUP'
      });
    }
    
    // Verify the token
    const isValid = verifyToken(user.twoFactorSecret, token);
    
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(code => hashBackupCode(code));
    
    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashedBackupCodes;
    await user.save();
    
    // Send backup codes via email
    await sendBackupCodesEmail(user.email, backupCodes);
    
    // Log the activity
    await sendAccountActivityEmail(user.email, {
      type: '2fa_enabled',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
      backupCodes
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Disable two-factor authentication
 * @route   POST /api/auth/2fa/disable
 * @access  Private
 */
exports.disableTwoFactor = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token and password are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ 
        success: false, 
        message: 'Two-factor authentication is not enabled',
        code: 'NOT_ENABLED'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password',
        code: 'INVALID_PASSWORD'
      });
    }
    
    // Verify the token
    const isValid = verifyToken(user.twoFactorSecret, token);
    
    if (!isValid) {
      // Check if it's a backup code
      const isBackupCode = await verifyBackupCode(user, token);
      
      if (!isBackupCode) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid verification token',
          code: 'INVALID_TOKEN'
        });
      }
    }
    
    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    
    // Revoke all tokens for this user
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    
    await user.save();
    
    // Log the activity
    await sendAccountActivityEmail(user.email, {
      type: '2fa_disabled',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const user = await User.findById(req.user.userId).select('-password -refreshTokens -twoFactorSecret -twoFactorBackupCodes');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const { firstName, lastName, phone, address } = req.body;
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }
    
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.lastPasswordChange = new Date();
    
    // Revoke all tokens for this user
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    
    // Clear all refresh tokens
    user.refreshTokens = [];
    
    await user.save();
    
    // Send account activity notification
    await sendAccountActivityEmail(user.email, {
      type: 'password_changed',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Change email
 * @route   POST /api/auth/change-email
 * @access  Private
 */
exports.changeEmail = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const { newEmail, password } = req.body;
    
    if (!newEmail || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'New email and password are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if new email is already in use
    const emailExists = await User.findOne({ email: newEmail });
    
    if (emailExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already in use',
        code: 'EMAIL_IN_USE'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }
    
    // Generate verification token
    const verificationToken = generateRandomToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours
    
    // Store new email and verification token
    user.newEmail = newEmail;
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = tokenExpiry;
    await user.save();
    
    // Send verification email to new email
    await sendVerificationEmail(newEmail, verificationToken, 'email-change');
    
    res.status(200).json({
      success: true,
      message: 'Verification email sent to new email address'
    });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Verify email change
 * @route   GET /api/auth/verify-email-change/:token
 * @access  Public
 */
exports.verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
      newEmail: { $exists: true, $ne: null }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Update email
    const oldEmail = user.email;
    user.email = user.newEmail;
    user.newEmail = undefined;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    
    // Revoke all tokens for this user
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    
    // Clear all refresh tokens
    user.refreshTokens = [];
    
    await user.save();
    
    // Send account activity notification to both old and new email
    await sendAccountActivityEmail(oldEmail, {
      type: 'email_changed',
      timestamp: new Date(),
      newEmail: user.email
    });
    
    await sendAccountActivityEmail(user.email, {
      type: 'email_changed',
      timestamp: new Date(),
      oldEmail: oldEmail
    });
    
    res.status(200).json({
      success: true,
      message: 'Email changed successfully'
    });
  } catch (error) {
    console.error('Verify email change error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Get active sessions
 * @route   GET /api/auth/sessions
 * @access  Private
 */
exports.getSessions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Get active sessions (refresh tokens)
    const sessions = user.refreshTokens.map(token => ({
      id: token._id,
      device: token.device,
      ip: token.ip,
      lastUsed: token.lastUsed,
      expiresAt: token.expiresAt,
      isCurrentSession: token.token === req.body.refreshToken
    }));
    
    res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * @desc    Revoke session
 * @route   DELETE /api/auth/sessions/:id
 * @access  Private
 */
exports.revokeSession = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const { id } = req.params;
    
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Remove the session
    await User.updateOne(
      { _id: req.user.userId },
      { $pull: { refreshTokens: { _id: id } } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};