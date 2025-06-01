/**
 * Error Handler Middleware
 * 
 * Provides centralized error handling for the API
 */

const { sendError, sendNotFound, sendValidationError, sendServerError } = require('../utils/responseUtil');
const { logger } = require('./loggingMiddleware');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler
 * Handles 404 errors for routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(`API endpoint not found: ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global error handler
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    statusCode: err.statusCode || 500
  });

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = [err.errors[key].message];
      return acc;
    }, {});
    
    return sendValidationError(res, errors, 'Validation failed');
  }

  // Handle Mongoose cast errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    return sendValidationError(res, { [err.path]: [`Invalid ${err.kind}`] }, 'Invalid parameter');
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendValidationError(res, { [field]: [`${field} already exists`] }, 'Duplicate key error');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    if (err.statusCode === 404) {
      return sendNotFound(res, err.message);
    }
    
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Handle unexpected errors
  return sendServerError(res, 
    process.env.NODE_ENV === 'production' ? null : err, 
    'Something went wrong on the server'
  );
};

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler
};