const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const { authLimiter, strictLimiter, loginRateLimiter } = require('../middleware/rateLimitMiddleware');
const authController = require('../controllers/authController');
require('dotenv').config();

// Register a new user
router.post('/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty if provided'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty if provided')
  ],
  (req, res, next) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  },
  authController.register
);

// Verify email
router.get('/verify-email/:token', authController.verifyEmail);

// Resend verification email
router.post('/resend-verification', 
  authLimiter,
  authMiddleware, 
  authController.resendVerification
);

// Forgot password
router.post('/forgot-password',
  strictLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  (req, res, next) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  },
  authController.forgotPassword
);

// Reset password
router.post('/reset-password/:token',
  strictLimiter,
  [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  (req, res, next) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  },
  authController.resetPassword
);

// Login
router.post('/login',
  authLimiter,
  loginRateLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  (req, res, next) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  },
  authController.login
);

// Verify two-factor authentication
router.post('/verify-2fa',
  authLimiter,
  [
    body('userId').isMongoId().withMessage('Invalid user ID'),
    body('tempToken').notEmpty().withMessage('Temporary token is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
  ],
  (req, res, next) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  },
  authController.verifyTwoFactor
);

// Refresh token
router.post('/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ],
  (req, res, next) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  },
  authController.refreshToken
);

// Logout
router.post('/logout',
  authMiddleware,
  [
    body('refreshToken').optional()
  ],
  authController.logout
);

// Logout from all devices
router.post('/logout-all',
  authMiddleware,
  authController.logoutAll
);

// Setup two-factor authentication
router.post('/2fa/setup', 
  authMiddleware,
  authController.setupTwoFactor
);

// Verify and enable two-factor authentication
router.post('/2fa/enable', 
  authMiddleware,
  [
    body('token').isString().isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits')
  ],
  (req, res, next) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  },
  authController.enableTwoFactor
);

// Disable two-factor authentication
router.post('/2fa/disable', 
  authMiddleware,
  [
    body('token').isString().isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits'),
    body('password').isString().notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { token, password } = req.body;
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ message: 'Two-factor authentication not enabled' });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      
      // Verify the token
      const isValid = verifyToken(user.twoFactorSecret, token);
      
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid token' });
      }
      
      // Disable 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.twoFactorBackupCodes = [];
      await user.save();
      
      // Log the activity
      await sendAccountActivityEmail(user.email, {
        type: '2fa_disabled',
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.status(200).json({
        message: 'Two-factor authentication disabled successfully'
      });
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * @route   POST /api/auth/2fa/login
 * @desc    Complete login with 2FA
 * @access  Public
 */
router.post('/2fa/login',
  [
    body('userId').isMongoId().withMessage('Invalid user ID'),
    body('tempToken').isString().notEmpty().withMessage('Temporary token is required'),
    body('token').isString().withMessage('Token is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { userId, tempToken, token, useBackupCode = false } = req.body;
      
      const user = await User.findOne({
        _id: userId,
        twoFactorTempToken: tempToken,
        twoFactorTempTokenExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid or expired session' });
      }
      
      let isValid = false;
      
      if (useBackupCode) {
        // Verify backup code
        const backupResult = verifyBackupCode(token, user.twoFactorBackupCodes);
        isValid = backupResult.valid;
        
        if (isValid) {
          // Remove the used backup code
          user.twoFactorBackupCodes.splice(backupResult.index, 1);
        }
      } else {
        // Verify TOTP token
        isValid = verifyToken(user.twoFactorSecret, token);
      }
      
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid authentication code' });
      }
      
      // Clear temporary token
      user.twoFactorTempToken = undefined;
      user.twoFactorTempTokenExpires = undefined;
      
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
      
      // Update last login time
      user.lastLogin = Date.now();
      await user.save();
      
      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
      
      refreshTokens.add(refreshToken);
      
      res.json({
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
      console.error('2FA login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * @route   POST /api/auth/2fa/send-email-code
 * @desc    Send a 2FA code via email
 * @access  Public
 */
router.post('/2fa/send-email-code',
  [
    body('email').isEmail().withMessage('Valid email is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { email } = req.body;
      const user = await User.findOne({ email });
      
      if (!user) {
        // Don't reveal if user exists
        return res.status(200).json({ message: 'If your email is registered, you will receive a code' });
      }
      
      // Generate a 6-digit code
      const code = generateOTP(6);
      
      // Hash the code
      const hashedCode = await bcrypt.hash(code, 10);
      
      // Store the code with 10-minute expiry
      const codeExpiry = new Date();
      codeExpiry.setMinutes(codeExpiry.getMinutes() + 10);
      
      user.twoFactorTempToken = hashedCode;
      user.twoFactorTempTokenExpires = codeExpiry;
      await user.save();
      
      // Send the code via email
      await sendTwoFactorCode(email, code);
      
      res.status(200).json({ 
        message: 'If your email is registered, you will receive a code',
        userId: user._id // Only for legitimate requests
      });
    } catch (error) {
      console.error('Send email code error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * @route   POST /api/auth/2fa/verify-email-code
 * @desc    Verify a 2FA code sent via email
 * @access  Public
 */
router.post('/2fa/verify-email-code',
  [
    body('userId').isMongoId().withMessage('Invalid user ID'),
    body('code').isString().isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { userId, code } = req.body;
      const user = await User.findOne({
        _id: userId,
        twoFactorTempTokenExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid or expired code' });
      }
      
      // Verify the code
      const isCodeValid = await bcrypt.compare(code, user.twoFactorTempToken);
      
      if (!isCodeValid) {
        return res.status(401).json({ message: 'Invalid code' });
      }
      
      // Generate a temporary token for the next step
      const tempToken = generateTempToken();
      
      // Store the token with 10-minute expiry
      const tokenExpiry = new Date();
      tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 10);
      
      user.twoFactorTempToken = tempToken;
      user.twoFactorTempTokenExpires = tokenExpiry;
      await user.save();
      
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
      
      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
      
      refreshTokens.add(refreshToken);
      
      res.json({
        accessToken,
        refreshToken,
        tempToken,
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
      console.error('Verify email code error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * @route   GET /api/auth/2fa/status
 * @desc    Check if 2FA is enabled for the user
 * @access  Private
 */
router.get('/2fa/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      enabled: user.twoFactorEnabled,
      backupCodesCount: user.twoFactorBackupCodes ? user.twoFactorBackupCodes.length : 0
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/auth/2fa/generate-backup-codes
 * @desc    Generate new backup codes
 * @access  Private
 */
router.post('/2fa/generate-backup-codes', 
  authMiddleware,
  [
    body('token').isString().isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { token } = req.body;
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ message: 'Two-factor authentication not enabled' });
      }
      
      // Verify the token
      const isValid = verifyToken(user.twoFactorSecret, token);
      
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid token' });
      }
      
      // Generate new backup codes
      const backupCodes = generateBackupCodes();
      const hashedBackupCodes = backupCodes.map(code => hashBackupCode(code));
      
      // Update backup codes
      user.twoFactorBackupCodes = hashedBackupCodes;
      await user.save();
      
      // Send backup codes via email
      await sendBackupCodesEmail(user.email, backupCodes);
      
      res.status(200).json({
        message: 'New backup codes generated successfully',
        backupCodes
      });
    } catch (error) {
      console.error('Generate backup codes error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google
 * @access  Public
 */
router.post('/google',
  [
    body('idToken').isString().notEmpty().withMessage('ID token is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { idToken } = req.body;
      
      // Verify the Google token
      const userData = await verifyGoogleToken(idToken);
      
      // Check if user exists
      let user = await User.findOne({ email: userData.email });
      
      if (user) {
        // User exists, update OAuth info
        user.oauthProvider = 'google';
        user.oauthId = userData.oauthId;
        user.oauthProfileData = userData;
        user.verified = true; // Google verifies emails
        
        // Update profile info if missing
        if (!user.firstName) user.firstName = userData.firstName;
        if (!user.lastName) user.lastName = userData.lastName;
        if (!user.profilePicture) user.profilePicture = userData.profilePicture;
        
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
        
        // Update last login time
        user.lastLogin = Date.now();
      } else {
        // Create new user
        user = new User({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicture: userData.profilePicture,
          password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Random password
          oauthProvider: 'google',
          oauthId: userData.oauthId,
          oauthProfileData: userData,
          verified: true, // Google verifies emails
          joinDate: new Date(),
          lastLogin: new Date(),
          loginHistory: [{
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            successful: true
          }]
        });
      }
      
      await user.save();
      
      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
      
      refreshTokens.add(refreshToken);
      
      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          verified: user.verified,
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      console.error('Google authentication error:', error);
      res.status(401).json({ message: 'Google authentication failed', error: error.message });
    }
  }
);

/**
 * @route   POST /api/auth/google/code
 * @desc    Authenticate with Google using authorization code
 * @access  Public
 */
router.post('/google/code',
  [
    body('code').isString().notEmpty().withMessage('Authorization code is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { code } = req.body;
      
      // Exchange code for tokens and user data
      const userData = await exchangeGoogleCode(code);
      
      // Check if user exists
      let user = await User.findOne({ email: userData.email });
      
      if (user) {
        // User exists, update OAuth info
        user.oauthProvider = 'google';
        user.oauthId = userData.oauthId;
        user.oauthProfileData = userData;
        user.oauthAccessToken = userData.accessToken;
        user.oauthRefreshToken = userData.refreshToken;
        user.oauthTokenExpiry = userData.tokenExpiry;
        user.verified = true; // Google verifies emails
        
        // Update profile info if missing
        if (!user.firstName) user.firstName = userData.firstName;
        if (!user.lastName) user.lastName = userData.lastName;
        if (!user.profilePicture) user.profilePicture = userData.profilePicture;
        
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
        
        // Update last login time
        user.lastLogin = Date.now();
      } else {
        // Create new user
        user = new User({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicture: userData.profilePicture,
          password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Random password
          oauthProvider: 'google',
          oauthId: userData.oauthId,
          oauthProfileData: userData,
          oauthAccessToken: userData.accessToken,
          oauthRefreshToken: userData.refreshToken,
          oauthTokenExpiry: userData.tokenExpiry,
          verified: true, // Google verifies emails
          joinDate: new Date(),
          lastLogin: new Date(),
          loginHistory: [{
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            successful: true
          }]
        });
      }
      
      await user.save();
      
      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
      
      refreshTokens.add(refreshToken);
      
      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          verified: user.verified,
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      console.error('Google code authentication error:', error);
      res.status(401).json({ message: 'Google authentication failed', error: error.message });
    }
  }
);

/**
 * @route   POST /api/auth/facebook
 * @desc    Authenticate with Facebook
 * @access  Public
 */
router.post('/facebook',
  [
    body('accessToken').isString().notEmpty().withMessage('Access token is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { accessToken } = req.body;
      
      // Verify the Facebook token
      const userData = await verifyFacebookToken(accessToken);
      
      // Check if user exists
      let user = await User.findOne({ email: userData.email });
      
      if (user) {
        // User exists, update OAuth info
        user.oauthProvider = 'facebook';
        user.oauthId = userData.oauthId;
        user.oauthProfileData = userData;
        user.oauthAccessToken = accessToken;
        user.verified = true; // Facebook verifies emails
        
        // Update profile info if missing
        if (!user.firstName) user.firstName = userData.firstName;
        if (!user.lastName) user.lastName = userData.lastName;
        if (!user.profilePicture) user.profilePicture = userData.profilePicture;
        
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
        
        // Update last login time
        user.lastLogin = Date.now();
      } else {
        // Create new user
        user = new User({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicture: userData.profilePicture,
          password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Random password
          oauthProvider: 'facebook',
          oauthId: userData.oauthId,
          oauthProfileData: userData,
          oauthAccessToken: accessToken,
          verified: true, // Facebook verifies emails
          joinDate: new Date(),
          lastLogin: new Date(),
          loginHistory: [{
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            successful: true
          }]
        });
      }
      
      await user.save();
      
      // Generate tokens
      const jwtAccessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
      
      refreshTokens.add(refreshToken);
      
      res.json({
        accessToken: jwtAccessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          verified: user.verified,
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      console.error('Facebook authentication error:', error);
      res.status(401).json({ message: 'Facebook authentication failed', error: error.message });
    }
  }
);

module.exports = router;