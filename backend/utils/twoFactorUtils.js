const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a new secret key for two-factor authentication
 * @returns {Object} Object containing secret in different formats
 */
const generateSecret = (email) => {
  return speakeasy.generateSecret({
    name: `CashHeros:${email}`,
    length: 20
  });
};

/**
 * Generate a QR code for the secret
 * @param {string} secret The secret in otpauth_url format
 * @returns {Promise<string>} The QR code as a data URL
 */
const generateQRCode = async (otpauthUrl) => {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Verify a TOTP token
 * @param {string} secret The secret key
 * @param {string} token The token to verify
 * @returns {boolean} Whether the token is valid
 */
const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 1 step before and after for time drift
  });
};

/**
 * Generate backup codes for 2FA recovery
 * @param {number} count Number of backup codes to generate
 * @returns {Array<string>} Array of backup codes
 */
const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate a random 8-character code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
};

/**
 * Hash a backup code for secure storage
 * @param {string} code The backup code to hash
 * @returns {string} The hashed backup code
 */
const hashBackupCode = (code) => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

/**
 * Verify a backup code
 * @param {string} providedCode The code provided by the user
 * @param {Array<string>} hashedCodes Array of hashed backup codes
 * @returns {Object} Object containing whether the code is valid and the index of the code
 */
const verifyBackupCode = (providedCode, hashedCodes) => {
  const normalizedCode = providedCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const formattedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4)}`;
  const hashedProvidedCode = hashBackupCode(formattedCode);
  
  const index = hashedCodes.findIndex(code => code === hashedProvidedCode);
  return {
    valid: index !== -1,
    index
  };
};

/**
 * Generate a temporary token for 2FA verification
 * @returns {string} A random token
 */
const generateTempToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  generateTempToken
};