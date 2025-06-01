/**
 * Error Handling Utility
 * 
 * This utility provides functions for consistent error handling across the application.
 */

// Error types
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Parse error from API response
 * 
 * @param {Error} error - The error object
 * @returns {Object} - Parsed error with type, message, and details
 */
export const parseError = (error) => {
  // Default error structure
  const parsedError = {
    type: ErrorTypes.UNKNOWN,
    message: 'An unexpected error occurred. Please try again.',
    details: null,
    originalError: error
  };

  // No error provided
  if (!error) {
    return parsedError;
  }

  // Network error (no response)
  if (error.message === 'Network Error' || !error.response) {
    return {
      ...parsedError,
      type: ErrorTypes.NETWORK,
      message: 'Unable to connect to the server. Please check your internet connection.'
    };
  }

  // Axios error with response
  if (error.response) {
    const { status, data } = error.response;

    // Authentication errors
    if (status === 401) {
      return {
        ...parsedError,
        type: ErrorTypes.AUTH,
        message: data?.message || 'Your session has expired. Please log in again.',
        details: data?.details || null
      };
    }

    // Permission errors
    if (status === 403) {
      return {
        ...parsedError,
        type: ErrorTypes.PERMISSION,
        message: data?.message || 'You do not have permission to perform this action.',
        details: data?.details || null
      };
    }

    // Validation errors
    if (status === 400 || status === 422) {
      return {
        ...parsedError,
        type: ErrorTypes.VALIDATION,
        message: data?.message || 'Please check your input and try again.',
        details: data?.details || data?.errors || null
      };
    }

    // Not found errors
    if (status === 404) {
      return {
        ...parsedError,
        type: ErrorTypes.NOT_FOUND,
        message: data?.message || 'The requested resource was not found.',
        details: data?.details || null
      };
    }

    // Server errors
    if (status >= 500) {
      return {
        ...parsedError,
        type: ErrorTypes.SERVER,
        message: data?.message || 'Server error. Please try again later.',
        details: data?.details || null
      };
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      return {
        ...parsedError,
        type: ErrorTypes.TIMEOUT,
        message: 'Request timed out. Please try again.',
        details: null
      };
    }

    // Other errors with response
    return {
      ...parsedError,
      message: data?.message || error.message || parsedError.message,
      details: data?.details || null
    };
  }

  // Regular Error object
  return {
    ...parsedError,
    message: error.message || parsedError.message
  };
};

/**
 * Format validation errors into a user-friendly object
 * 
 * @param {Object} validationErrors - The validation errors object
 * @returns {Object} - Formatted validation errors
 */
export const formatValidationErrors = (validationErrors) => {
  if (!validationErrors) return {};

  // If already in the right format, return as is
  if (typeof validationErrors === 'object' && !Array.isArray(validationErrors)) {
    return validationErrors;
  }

  // If it's an array of errors, convert to object
  if (Array.isArray(validationErrors)) {
    return validationErrors.reduce((acc, error) => {
      if (error.field) {
        acc[error.field] = error.message;
      }
      return acc;
    }, {});
  }

  return {};
};

/**
 * Log error to console and optionally to a monitoring service
 * 
 * @param {Object} error - The parsed error object
 * @param {Object} context - Additional context information
 */
export const logError = (error, context = {}) => {
  // Log to console
  console.error('Error:', error.message, {
    type: error.type,
    details: error.details,
    context,
    originalError: error.originalError
  });

  // In a production app, you would log to a monitoring service like Sentry
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error.originalError || new Error(error.message), {
  //     extra: {
  //       type: error.type,
  //       details: error.details,
  //       context
  //     }
  //   });
  // }
};

/**
 * Get user-friendly error message based on error type
 * 
 * @param {Object} error - The parsed error object
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  // Return the error message if it's already user-friendly
  if (error.message) {
    return error.message;
  }

  // Default messages based on error type
  switch (error.type) {
    case ErrorTypes.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    case ErrorTypes.AUTH:
      return 'Your session has expired. Please log in again.';
    case ErrorTypes.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorTypes.SERVER:
      return 'Server error. Please try again later.';
    case ErrorTypes.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorTypes.PERMISSION:
      return 'You do not have permission to perform this action.';
    case ErrorTypes.TIMEOUT:
      return 'Request timed out. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Handle API error with consistent approach
 * 
 * @param {Error} error - The original error
 * @param {Object} options - Options for error handling
 * @returns {Object} - Parsed error object
 */
export const handleApiError = (error, options = {}) => {
  const {
    logToConsole = true,
    logToService = process.env.NODE_ENV === 'production',
    context = {},
    defaultMessage = 'An unexpected error occurred. Please try again.'
  } = options;

  // Parse the error
  const parsedError = parseError(error);

  // Override with default message if specified
  if (defaultMessage && !parsedError.message) {
    parsedError.message = defaultMessage;
  }

  // Log the error
  if (logToConsole || logToService) {
    logError(parsedError, context);
  }

  return parsedError;
};

/**
 * Create an error handler for async functions
 * 
 * @param {Function} fn - The async function to wrap
 * @param {Object} options - Error handling options
 * @returns {Function} - Wrapped function with error handling
 */
export const withErrorHandling = (fn, options = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleApiError(error, options);
    }
  };
};

export default {
  ErrorTypes,
  parseError,
  formatValidationErrors,
  logError,
  getUserFriendlyMessage,
  handleApiError,
  withErrorHandling
};