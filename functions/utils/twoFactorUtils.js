/**
 * Two-Factor Authentication Utilities
 * 
 * This module provides utilities for handling two-factor authentication
 * including TOTP (Time-based One-Time Password) generation and verification.
 */

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Generate a secret for TOTP
 * @param {string} name - Service name
 * @param {string} account - User account/email
 * @returns {Object} Secret object with base32 and otpauth_url
 */
const generateSecret = (name = 'CashHeros', account) => {
  return speakeasy.generateSecret({
    name: `${name} (${account})`,
    length: 32
  });
};

/**
 * Generate QR code for TOTP setup
 * @param {string} otpauth_url - The otpauth URL from generateSecret
 * @returns {Promise<string>} Base64 encoded QR code image
 */
const generateQRCode = async (otpauth_url) => {
  try {
    return await qrcode.toDataURL(otpauth_url);
  } catch (error) {
    throw new Error('Failed to generate QR code: ' + error.message);
  }
};

/**
 * Verify TOTP token
 * @param {string} token - The 6-digit token from user
 * @param {string} secret - The base32 secret
 * @param {number} window - Time window for verification (default: 2)
 * @returns {boolean} True if token is valid
 */
const verifyToken = (token, secret, window = 2) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: window
  });
};

/**
 * Generate backup codes for 2FA
 * @param {number} count - Number of backup codes to generate (default: 10)
 * @returns {Array<string>} Array of backup codes
 */
const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
};

/**
 * Hash a backup code for storage
 * @param {string} code - The backup code to hash
 * @returns {Promise<string>} Hashed backup code
 */
const hashBackupCode = async (code) => {
  const saltRounds = 12;
  return await bcrypt.hash(code, saltRounds);
};

/**
 * Verify a backup code against its hash
 * @param {string} code - The backup code to verify
 * @param {string} hash - The stored hash
 * @returns {Promise<boolean>} True if code matches hash
 */
const verifyBackupCode = async (code, hash) => {
  return await bcrypt.compare(code, hash);
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode
};