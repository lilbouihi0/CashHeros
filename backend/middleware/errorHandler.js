/**
 * @module middleware/errorHandler
 * @description Error handling middleware for API requests
 */

const mongoose = require('mongoose');
const { handleDBError } = require('../utils/dbErrorHandler');

/**
 * Map error types to HTTP status codes
 */
const ERROR_STATUS_CODES = {
  ValidationError: 400,
  CastError: 400,
  DuplicateKeyError: 409,
  NotFoundError: 404,
  AuthenticationError: 401,
  AuthorizationError: 403,
  RateLimitError: 429,
  DatabaseError: 500
};

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle Mongoose/MongoDB errors
  if (
    err instanceof mongoose.Error ||
    (err.name && err.name.includes('Mongo')) ||
    err.code
  ) {
    const formattedError = handleDBError(err);
    const statusCode = ERROR_STATUS_CODES[formattedError.type] || 500;
    
    return res.status(statusCode).json({
      success: false,
      error: formattedError
    });
  }
  
  // Handle custom errors with type property
  if (err.type && ERROR_STATUS_CODES[err.type]) {
    return res.status(ERROR_STATUS_CODES[err.type]).json({
      success: false,
      error: err
    });
  }
  
  // Handle errors with status property
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || 'An error occurred',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * Not found error handler middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

/**
 * Async handler to catch errors in async route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create a custom error with type and status
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {number} status - HTTP status code
 * @returns {Error} Custom error object
 */
const createError = (message, type, status) => {
  const error = new Error(message);
  error.type = type;
  error.status = status || ERROR_STATUS_CODES[type] || 500;
  return error;
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createError
};