/**
 * @module utils/jwtUtils
 * @description Utility functions for JWT token management
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const functions = require('firebase-functions');
const User = require('../models/User');

// In-memory token blacklist (should be replaced with Redis in production)
const tokenBlacklist = new Set();

/**
 * Generate an access token for a user
 * @param {Object} user - User object
 * @param {string} expiresIn - Token expiration time (default: '15m')
 * @returns {string} JWT access token
 */
const generateAccessToken = (user, expiresIn = '15m') => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
      verified: user.verified,
      tokenVersion: user.tokenVersion || 0
    },
    functions.config().secrets.jwt_secret,
    { expiresIn }
  );
};

/**
 * Generate a refresh token for a user
 * @param {Object} user - User object
 * @param {string} expiresIn - Token expiration time (default: '7d')
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user, expiresIn = '7d') => {
  return jwt.sign(
    {
      userId: user._id,
      tokenVersion: user.tokenVersion || 0,
      tokenId: crypto.randomBytes(16).toString('hex')
    },
    functions.config().secrets.jwt_refresh_secret,
    { expiresIn }
  );
};

/**
 * Verify an access token
 * @param {string} token - JWT access token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyAccessToken = (token) => {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return null;
    }
    
    return jwt.verify(token, functions.config().secrets.jwt_secret);
  } catch (error) {
    return null;
  }
};

/**
 * Verify a refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, functions.config().secrets.jwt_refresh_secret);
  } catch (error) {
    return null;
  }
};

/**
 * Refresh an access token using a refresh token
 * @param {string} refreshToken - JWT refresh token
 * @returns {Promise<Object>} Object containing new access token and user info
 * @throws {Error} If refresh token is invalid
 */
const refreshAccessToken = async (refreshToken) => {
  // Verify the refresh token
  const decoded = verifyRefreshToken(refreshToken);
  
  if (!decoded) {
    throw new Error('Invalid refresh token');
  }
  
  // Find the user
  const user = await User.findById(decoded.userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if token version matches (for token revocation)
  if (decoded.tokenVersion !== (user.tokenVersion || 0)) {
    throw new Error('Token has been revoked');
  }
  
  // Generate a new access token
  const accessToken = generateAccessToken(user);
  
  return {
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      verified: user.verified
    }
  };
};

/**
 * Blacklist a token (for logout)
 * @param {string} token - JWT token to blacklist
 */
const blacklistToken = (token) => {
  try {
    // Verify the token to get its expiration
    const decoded = jwt.decode(token);
    
    if (decoded && decoded.exp) {
      // Add to blacklist
      tokenBlacklist.add(token);
      
      // Set a timeout to remove from blacklist after expiration
      // This helps prevent memory leaks in the blacklist Set
      const expiresIn = decoded.exp * 1000 - Date.now();
      if (expiresIn > 0) {
        setTimeout(() => {
          tokenBlacklist.delete(token);
        }, expiresIn);
      }
    }
  } catch (error) {
    console.error('Error blacklisting token:', error);
  }
};

/**
 * Revoke all tokens for a user by incrementing their token version
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const revokeUserTokens = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Increment token version to invalidate all existing tokens
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} JWT token or null if not found
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
  blacklistToken,
  revokeUserTokens,
  extractTokenFromHeader
};