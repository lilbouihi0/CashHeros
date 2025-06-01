/**
 * @module middleware/rateLimitMiddleware
 * @description Rate limiting middleware for API endpoints
 * 
 * This middleware implements rate limiting to prevent API abuse.
 * It uses an in-memory store for simplicity, but in production,
 * you should use Redis or another distributed store.
 */

const User = require('../models/User');

// Simple in-memory store for rate limiting
const rateLimitStore = {};

// Store for tracking failed login attempts
const loginAttemptStore = {};

/**
 * Base rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests in the time window
 * @param {string|Object} options.message - Error message to return when rate limit is exceeded
 * @param {Function} options.keyGenerator - Function to generate a unique key for each request (defaults to IP address)
 * @param {boolean} options.skipSuccessfulRequests - Whether to skip incrementing the counter for successful requests
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute by default
    max = 100, // 100 requests per windowMs by default
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    skipSuccessfulRequests = false
  } = options;

  // Clean up old entries every windowMs
  setInterval(() => {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach(key => {
      if (now - rateLimitStore[key].timestamp > windowMs) {
        delete rateLimitStore[key];
      }
    });
  }, windowMs);

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or update the rate limit entry
    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 1,
        timestamp: now
      };
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      
      return next();
    }

    // Reset count if the window has passed
    if (now - rateLimitStore[key].timestamp > windowMs) {
      rateLimitStore[key] = {
        count: 1,
        timestamp: now
      };
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      
      return next();
    }

    // Increment count and check if limit is exceeded
    rateLimitStore[key].count++;
    if (rateLimitStore[key].count > max) {
      // Calculate retry after time
      const retryAfterSeconds = Math.ceil((rateLimitStore[key].timestamp + windowMs - now) / 1000);
      
      // Set retry-after header
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((rateLimitStore[key].timestamp + windowMs) / 1000));
      
      // Return error response
      return res.status(429).json(
        typeof message === 'object' 
          ? message 
          : {
              success: false,
              message,
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfter: retryAfterSeconds
            }
      );
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - rateLimitStore[key].count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((rateLimitStore[key].timestamp + windowMs) / 1000));

    // If skipSuccessfulRequests is true, decrement the counter after a successful response
    if (skipSuccessfulRequests) {
      const originalEnd = res.end;
      res.end = function(...args) {
        if (res.statusCode < 400) {
          rateLimitStore[key].count--;
        }
        originalEnd.apply(res, args);
      };
    }

    next();
  };
};

/**
 * Basic rate limiter for all routes
 */
const basicLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * API rate limiter for general API endpoints
 */
const apiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many API requests from this IP, please try again after an hour',
    code: 'API_RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Authentication rate limiter for login, signup, and password reset endpoints
 */
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 20 : 100, // More lenient in development
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after an hour',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Strict rate limiter for sensitive operations like password reset
 */
const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: {
    success: false,
    message: 'Too many sensitive operations from this IP, please try again after an hour',
    code: 'STRICT_RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Progressive rate limiter for login attempts
 * This middleware tracks failed login attempts and implements progressive delays
 * It also updates the user's loginAttempts field in the database
 */
const loginRateLimiter = async (req, res, next) => {
  const ipAddr = req.ip || req.connection.remoteAddress;
  const email = req.body.email;
  
  if (!email) {
    return next();
  }
  
  const key = `${ipAddr}:${email}`;
  const now = Date.now();
  const maxAttempts = 5;
  const blockDuration = 30 * 60 * 1000; // 30 minutes
  
  // Initialize or get the login attempt entry
  if (!loginAttemptStore[key]) {
    loginAttemptStore[key] = {
      attempts: 0,
      lastAttempt: now,
      blockedUntil: null
    };
  }
  
  const attemptInfo = loginAttemptStore[key];
  
  // Check if the user is blocked
  if (attemptInfo.blockedUntil && now < attemptInfo.blockedUntil) {
    // Calculate retry after time
    const retryAfterSeconds = Math.ceil((attemptInfo.blockedUntil - now) / 1000);
    
    // Set retry-after header
    res.setHeader('Retry-After', String(retryAfterSeconds));
    
    return res.status(429).json({
      success: false,
      message: 'Too many failed login attempts. Account temporarily locked.',
      code: 'ACCOUNT_LOCKED',
      retryAfter: retryAfterSeconds,
      lockExpires: new Date(attemptInfo.blockedUntil)
    });
  }
  
  // If the user was blocked but the block has expired, reset the attempts
  if (attemptInfo.blockedUntil && now >= attemptInfo.blockedUntil) {
    attemptInfo.attempts = 0;
    attemptInfo.blockedUntil = null;
  }
  
  // Track this attempt
  attemptInfo.attempts++;
  attemptInfo.lastAttempt = now;
  
  // Check if the user has exceeded the maximum attempts
  if (attemptInfo.attempts >= maxAttempts) {
    // Block the user
    attemptInfo.blockedUntil = now + blockDuration;
    
    // Update the user's account status in the database
    try {
      const user = await User.findOne({ email });
      
      if (user) {
        // Lock the account
        user.accountLocked = true;
        
        // Lock for 30 minutes
        const lockUntil = new Date(attemptInfo.blockedUntil);
        user.accountLockedUntil = lockUntil;
        
        // Record the failed login attempt
        if (!user.loginHistory) {
          user.loginHistory = [];
        }
        
        user.loginHistory.push({
          timestamp: new Date(),
          ipAddress: ipAddr,
          userAgent: req.headers['user-agent'],
          successful: false
        });
        
        await user.save();
      }
    } catch (error) {
      console.error('Error updating user account status:', error);
    }
    
    // Calculate retry after time
    const retryAfterSeconds = Math.ceil(blockDuration / 1000);
    
    // Set retry-after header
    res.setHeader('Retry-After', String(retryAfterSeconds));
    
    return res.status(429).json({
      success: false,
      message: 'Too many failed login attempts. Account temporarily locked.',
      code: 'ACCOUNT_LOCKED',
      retryAfter: retryAfterSeconds,
      lockExpires: new Date(attemptInfo.blockedUntil)
    });
  }
  
  // Add a warning header with attempts left
  res.setHeader('X-RateLimit-Remaining', String(maxAttempts - attemptInfo.attempts));
  
  // Proceed to next middleware
  next();
  
  // Add a hook to reset the counter on successful login
  const originalEnd = res.end;
  res.end = function(...args) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Successful login, reset the counter
      delete loginAttemptStore[key];
    }
    originalEnd.apply(res, args);
  };
};

/**
 * Reset rate limit for a specific IP and email combination
 * This is used after a successful login to reset the failed attempt counter
 * 
 * @param {string} ip - IP address
 * @param {string} email - Email address
 */
const resetLoginRateLimit = (ip, email) => {
  const key = `${ip}:${email}`;
  delete loginAttemptStore[key];
};

// Clean up old login attempt entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(loginAttemptStore).forEach(key => {
    const attemptInfo = loginAttemptStore[key];
    
    // Remove entries that are no longer blocked and haven't been attempted in the last hour
    if ((!attemptInfo.blockedUntil || now >= attemptInfo.blockedUntil) && 
        now - attemptInfo.lastAttempt > 60 * 60 * 1000) {
      delete loginAttemptStore[key];
    }
  });
}, 60 * 60 * 1000);

module.exports = {
  createRateLimiter,
  basicLimiter,
  apiLimiter,
  authLimiter,
  strictLimiter,
  loginRateLimiter,
  resetLoginRateLimit
};