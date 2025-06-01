/**
 * Response Utility
 * 
 * Provides standardized response formats for API endpoints
 */

/**
 * Send a success response
 * 
 * @param {Object} res - Express response object
 * @param {Object|Array} data - Data to send in the response
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Additional metadata (e.g., pagination)
 */
const sendSuccess = (res, data = null, message = 'Operation successful', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data
  };

  // Add metadata if provided
  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * 
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 400)
 * @param {Object|Array} errors - Detailed error information
 */
const sendError = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message
  };

  // Add detailed errors if provided
  if (errors) {
    response.errors = errors;
  }

  // Add stack trace in development environment
  if (process.env.NODE_ENV !== 'production' && errors && errors.stack) {
    response.stack = errors.stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 * 
 * @param {Object} res - Express response object
 * @param {Object|Array} errors - Validation errors
 * @param {String} message - Error message (default: 'Validation failed')
 */
const sendValidationError = (res, errors, message = 'Validation failed') => {
  return sendError(res, message, 422, errors);
};

/**
 * Send a not found error response
 * 
 * @param {Object} res - Express response object
 * @param {String} message - Error message (default: 'Resource not found')
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

/**
 * Send an unauthorized error response
 * 
 * @param {Object} res - Express response object
 * @param {String} message - Error message (default: 'Unauthorized access')
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, message, 401);
};

/**
 * Send a forbidden error response
 * 
 * @param {Object} res - Express response object
 * @param {String} message - Error message (default: 'Forbidden access')
 */
const sendForbidden = (res, message = 'Forbidden access') => {
  return sendError(res, message, 403);
};

/**
 * Send a server error response
 * 
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {String} message - Error message (default: 'Internal server error')
 */
const sendServerError = (res, error, message = 'Internal server error') => {
  return sendError(res, message, 500, error);
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendServerError
};