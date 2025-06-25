/**
 * @module middleware/authMiddleware
 * @description Authentication middleware for protecting routes
 */

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwtUtils');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies the JWT token from the Authorization header and adds the decoded user data to the request object
 * 
 * @function authMiddleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Usage in route definition
 * router.get('/protected-route', authMiddleware, controllerFunction);
 * 
 * // In the controller, access the authenticated user
 * function controllerFunction(req, res) {
 *   const userId = req.user.userId;
 *   // Process the request with authenticated user data
 * }
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Check if Authorization header exists and has the correct format
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Verify the token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Check if user exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Check if token version matches (for token revocation)
    if (decoded.tokenVersion !== (user.tokenVersion || 0)) {
      return res.status(401).json({ 
        success: false,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }
    
    // Add the decoded user data and full user object to the request
    req.user = decoded;
    req.userDetails = user;
    req.token = token;
    
    // Update last active timestamp
    User.findByIdAndUpdate(user._id, { 
      lastActive: new Date() 
    }).exec();
    
    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional authentication middleware
 * Similar to authMiddleware but doesn't require authentication
 * If a valid token is provided, it adds the user data to the request
 * If no token or invalid token is provided, it still proceeds to the next middleware
 * 
 * @function optionalAuthMiddleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    // Check if Authorization header exists and has the correct format
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      // No token provided, but that's okay
      return next();
    }

    // Verify the token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      // Invalid token, but that's okay
      return next();
    }
    
    // Check if user exists
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && decoded.tokenVersion === (user.tokenVersion || 0)) {
      // Add the decoded user data to the request
      req.user = decoded;
      req.userDetails = user;
      req.token = token;
      
      // Update last active timestamp
      User.findByIdAndUpdate(user._id, { 
        lastActive: new Date() 
      }).exec();
    }
    
    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Error, but proceed anyway since auth is optional
    console.error('Optional auth middleware error:', err);
    next();
  }
};

/**
 * Admin authorization middleware
 * Verifies that the authenticated user has admin role
 * Must be used after authMiddleware
 * 
 * @function requireAdmin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const requireAdmin = (req, res, next) => {
  // Check if user exists and has admin role
  if (!req.userDetails || !req.userDetails.role || req.userDetails.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  // User is an admin, proceed
  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireAdmin
};