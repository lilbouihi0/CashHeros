import { useState, useCallback } from 'react';
import { handleApiError } from '../utils/errorHandler';

/**
 * Custom hook for handling API errors in components
 * 
 * @returns {Object} - Error handling utilities
 */
const useApiError = () => {
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Handle API error and set appropriate error states
   * 
   * @param {Error} err - The error object
   * @param {Object} options - Error handling options
   */
  const handleError = useCallback((err, options = {}) => {
    const parsedError = handleApiError(err, {
      logToConsole: true,
      ...options
    });

    setError(parsedError.message);

    // Set field errors if available
    if (parsedError.details && typeof parsedError.details === 'object') {
      setFieldErrors(parsedError.details);
    }

    // Call onError callback if provided
    if (options.onError) {
      options.onError(parsedError);
    }

    return parsedError;
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  /**
   * Clear a specific field error
   * 
   * @param {string} field - The field name
   */
  const clearFieldError = useCallback((field) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Check if a field has an error
   * 
   * @param {string} field - The field name
   * @returns {boolean} - Whether the field has an error
   */
  const hasFieldError = useCallback((field) => {
    return !!fieldErrors[field];
  }, [fieldErrors]);

  /**
   * Get the error message for a field
   * 
   * @param {string} field - The field name
   * @returns {string|null} - The error message or null
   */
  const getFieldError = useCallback((field) => {
    return fieldErrors[field] || null;
  }, [fieldErrors]);

  /**
   * Wrap an async function with error handling
   * 
   * @param {Function} fn - The async function to wrap
   * @param {Object} options - Error handling options
   * @returns {Function} - The wrapped function
   */
  const withErrorHandling = useCallback((fn, options = {}) => {
    return async (...args) => {
      try {
        clearErrors();
        return await fn(...args);
      } catch (err) {
        handleError(err, options);
        throw err;
      }
    };
  }, [clearErrors, handleError]);

  return {
    error,
    fieldErrors,
    handleError,
    clearErrors,
    clearFieldError,
    hasFieldError,
    getFieldError,
    withErrorHandling
  };
};

export default useApiError;