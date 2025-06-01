/**
 * @module middleware/csrfMiddleware
 * @description Enhanced CSRF Protection Middleware
 * 
 * This middleware implements CSRF protection using the double submit cookie pattern
 * with additional security features:
 * - Token rotation on each request
 * - Per-session tokens
 * - Cryptographically secure random tokens
 * - Automatic token refresh
 * - Support for SPA applications
 */

const crypto = require('crypto');
const { getAsync, setAsync, delAsync } = require('../utils/redisClient');

/**
 * Generate a cryptographically secure random CSRF token
 * @param {string} [sessionId] - Optional session ID to bind token to
 * @returns {Object} Token object with value and timestamp
 */
const generateToken = (sessionId = '') => {
  // Generate a random token
  const tokenValue = crypto.randomBytes(32).toString('hex');
  
  // Create a token object with timestamp
  const token = {
    value: tokenValue,
    timestamp: Date.now(),
    sessionId: sessionId || undefined
  };
  
  return token;
};

/**
 * Store token in Redis for validation
 * @param {string} tokenValue - Token value
 * @param {Object} tokenData - Token data
 * @returns {Promise<boolean>} Success status
 */
const storeToken = async (tokenValue, tokenData) => {
  try {
    // Store token with 24-hour expiry
    await setAsync(`csrf:${tokenValue}`, JSON.stringify(tokenData), 'EX', 24 * 60 * 60);
    return true;
  } catch (error) {
    console.error('Error storing CSRF token:', error);
    return false;
  }
};

/**
 * Validate token against stored tokens
 * @param {string} tokenValue - Token to validate
 * @param {string} [sessionId] - Optional session ID to validate against
 * @returns {Promise<boolean>} Whether token is valid
 */
const validateToken = async (tokenValue, sessionId = '') => {
  try {
    // Get token data from Redis
    const tokenData = await getAsync(`csrf:${tokenValue}`);
    
    if (!tokenData) {
      return false;
    }
    
    const parsedToken = JSON.parse(tokenData);
    
    // Check if token is expired (older than 24 hours)
    const tokenAge = Date.now() - parsedToken.timestamp;
    if (tokenAge > 24 * 60 * 60 * 1000) {
      // Delete expired token
      await delAsync(`csrf:${tokenValue}`);
      return false;
    }
    
    // If session ID is provided, validate against it
    if (sessionId && parsedToken.sessionId && parsedToken.sessionId !== sessionId) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating CSRF token:', error);
    return false;
  }
};

/**
 * Middleware to set CSRF token cookie
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
const setCsrfToken = (options = {}) => {
  const {
    cookieName = 'csrfToken',
    headerName = 'X-CSRF-Token',
    cookieOptions = {},
    rotateTokens = true,
    bindToSession = true
  } = options;
  
  return async (req, res, next) => {
    try {
      // Skip for non-browser requests (like API calls from mobile apps)
      const userAgent = req.headers['user-agent'] || '';
      const isBrowser = userAgent.includes('Mozilla') || 
                        userAgent.includes('Chrome') || 
                        userAgent.includes('Safari') || 
                        userAgent.includes('Firefox') || 
                        userAgent.includes('Edge');
                        
      if (!isBrowser) {
        return next();
      }
      
      // Get session ID if available
      const sessionId = req.session?.id || req.cookies?.sessionId || '';
      
      // Determine if we need a new token
      const needsNewToken = !req.cookies[cookieName] || rotateTokens;
      
      if (needsNewToken) {
        // Generate a new token
        const tokenObj = generateToken(bindToSession ? sessionId : '');
        const tokenValue = tokenObj.value;
        
        // Store token in Redis
        await storeToken(tokenValue, tokenObj);
        
        // Set default cookie options
        const defaultCookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax', // 'strict' can cause issues with redirects
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        };
        
        // Set cookie with token
        res.cookie(cookieName, tokenValue, {
          ...defaultCookieOptions,
          ...cookieOptions
        });
        
        // Expose the token to the frontend via a custom header
        res.setHeader(headerName, tokenValue);
      } else {
        // If token exists in cookie, expose it via header
        res.setHeader(headerName, req.cookies[cookieName]);
      }
      
      next();
    } catch (error) {
      console.error('CSRF token generation error:', error);
      next();
    }
  };
};

/**
 * Middleware to verify CSRF token
 * This should be applied to routes that modify data (POST, PUT, DELETE, etc.)
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
const verifyCsrfToken = (options = {}) => {
  const {
    cookieName = 'csrfToken',
    headerName = 'X-CSRF-Token',
    bodyName = '_csrf',
    ignoreMethods = ['GET', 'HEAD', 'OPTIONS'],
    bindToSession = true,
    errorMessage = 'CSRF token validation failed',
    errorCode = 'CSRF_ERROR'
  } = options;
  
  return async (req, res, next) => {
    try {
      // Skip for non-browser requests
      const userAgent = req.headers['user-agent'] || '';
      const isBrowser = userAgent.includes('Mozilla') || 
                        userAgent.includes('Chrome') || 
                        userAgent.includes('Safari') || 
                        userAgent.includes('Firefox') || 
                        userAgent.includes('Edge');
                        
      if (!isBrowser) {
        return next();
      }
      
      // Skip for safe methods
      if (ignoreMethods.includes(req.method)) {
        return next();
      }
      
      // Get tokens from various sources
      const cookieToken = req.cookies[cookieName];
      const headerToken = req.headers[headerName.toLowerCase()];
      const bodyToken = req.body && req.body[bodyName];
      
      // Use the first available token
      const submittedToken = headerToken || bodyToken;
      
      // Get session ID if available and if binding to session
      const sessionId = bindToSession ? (req.session?.id || req.cookies?.sessionId || '') : '';
      
      // Validate token
      if (!cookieToken || !submittedToken) {
        return res.status(403).json({
          success: false,
          message: errorMessage,
          code: errorCode,
          reason: 'Missing CSRF token'
        });
      }
      
      // First check if tokens match
      if (cookieToken !== submittedToken) {
        return res.status(403).json({
          success: false,
          message: errorMessage,
          code: errorCode,
          reason: 'Token mismatch'
        });
      }
      
      // Then validate against stored tokens
      const isValid = await validateToken(submittedToken, sessionId);
      
      if (!isValid) {
        return res.status(403).json({
          success: false,
          message: errorMessage,
          code: errorCode,
          reason: 'Invalid or expired token'
        });
      }
      
      // If validation passes, delete the used token to prevent replay attacks
      // and generate a new one
      await delAsync(`csrf:${submittedToken}`);
      
      // Generate a new token
      const tokenObj = generateToken(sessionId);
      const tokenValue = tokenObj.value;
      
      // Store token in Redis
      await storeToken(tokenValue, tokenObj);
      
      // Set cookie with new token
      res.cookie(cookieName, tokenValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Expose the new token to the frontend via a custom header
      res.setHeader(headerName, tokenValue);
      
      next();
    } catch (error) {
      console.error('CSRF token validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during CSRF validation',
        code: 'SERVER_ERROR'
      });
    }
  };
};

/**
 * Create default middleware instances with standard configuration
 */
const defaultSetCsrfToken = setCsrfToken();
const defaultVerifyCsrfToken = verifyCsrfToken();

module.exports = {
  setCsrfToken,
  verifyCsrfToken,
  defaultSetCsrfToken,
  defaultVerifyCsrfToken,
  generateToken,
  validateToken
};