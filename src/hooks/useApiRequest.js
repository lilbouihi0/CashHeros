import { useState, useCallback, useRef } from 'react';
import useApiError from './useApiError';
import useOfflineStatus from './useOfflineStatus';

/**
 * Custom hook for making API requests with loading state
 * 
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Options for the API request
 * @returns {Object} - API request utilities
 */
const useApiRequest = (apiFunction, options = {}) => {
  const {
    initialData = null,
    onSuccess,
    onError,
    autoProcess = false,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const requestCount = useRef(0);
  const { isOnline } = useOfflineStatus();
  const { 
    error, 
    fieldErrors, 
    handleError, 
    clearErrors 
  } = useApiError();

  /**
   * Execute the API request
   * 
   * @param {any} args - Arguments to pass to the API function
   * @returns {Promise<any>} - The response data
   */
  const execute = useCallback(async (...args) => {
    clearErrors();
    setLoading(true);
    setSuccess(false);
    requestCount.current += 1;
    const currentRequest = requestCount.current;

    try {
      const response = await apiFunction(...args);
      
      // Only update state if this is the most recent request
      if (currentRequest === requestCount.current) {
        setData(response);
        setSuccess(true);
        
        if (onSuccess) {
          onSuccess(response);
        }
      }
      
      return response;
    } catch (err) {
      // Only update state if this is the most recent request
      if (currentRequest === requestCount.current) {
        handleError(err, { onError });
        
        // Retry logic for network errors when online
        if (isOnline && err.message === 'Network Error' && retryCount > 0) {
          return retry(args, 1, retryCount, retryDelay);
        }
      }
      
      throw err;
    } finally {
      // Only update loading state if this is the most recent request
      if (currentRequest === requestCount.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, clearErrors, handleError, isOnline, onError, onSuccess, retryCount, retryDelay]);

  /**
   * Retry a failed request
   * 
   * @param {Array} args - Arguments to pass to the API function
   * @param {number} attempt - Current attempt number
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in milliseconds
   * @returns {Promise<any>} - The response data
   */
  const retry = useCallback(async (args, attempt, maxRetries, delay) => {
    console.log(`Retrying request (${attempt}/${maxRetries}) after ${delay}ms`);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      return await apiFunction(...args);
    } catch (err) {
      if (attempt < maxRetries && isOnline && err.message === 'Network Error') {
        // Exponential backoff
        const nextDelay = delay * 2;
        return retry(args, attempt + 1, maxRetries, nextDelay);
      }
      
      handleError(err, { onError });
      throw err;
    }
  }, [apiFunction, handleError, isOnline, onError]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setSuccess(false);
    clearErrors();
  }, [initialData, clearErrors]);

  // Auto-execute the API request if autoProcess is true
  // This is useful for data fetching on component mount
  // useEffect(() => {
  //   if (autoProcess) {
  //     execute();
  //   }
  // }, [autoProcess, execute]);

  return {
    data,
    loading,
    error,
    fieldErrors,
    success,
    execute,
    reset,
    setData
  };
};

export default useApiRequest;