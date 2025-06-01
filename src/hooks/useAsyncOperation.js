import { useState, useCallback, useContext } from 'react';
import { AppContext } from '../context/AppContext';

/**
 * Custom hook for handling async operations with loading and error states
 * @param {Object} options - Configuration options
 * @param {string} options.operationName - Name of the operation for tracking loading/error states
 * @param {boolean} options.useGlobalState - Whether to use global app state for loading/errors
 * @param {boolean} options.showNotification - Whether to show notifications for success/error
 * @returns {Object} - Loading state, error state, and execute function
 */
const useAsyncOperation = ({
  operationName = 'operation',
  useGlobalState = true,
  showNotification = true
} = {}) => {
  // Local state for when not using global state
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [localSuccess, setLocalSuccess] = useState(null);

  // Global app state
  const {
    setLoading,
    setError,
    clearError,
    setSuccess,
    showNotification: notify,
    isLoading,
    getError
  } = useContext(AppContext);

  /**
   * Execute an async operation with loading and error handling
   * @param {Function} asyncFn - The async function to execute
   * @param {Object} options - Options for this specific execution
   * @param {string} options.successMessage - Message to show on success
   * @param {string} options.errorMessage - Message to show on error
   * @param {Function} options.onSuccess - Callback to run on success
   * @param {Function} options.onError - Callback to run on error
   * @returns {Promise<any>} - Result of the async function
   */
  const execute = useCallback(async (
    asyncFn,
    {
      successMessage,
      errorMessage = 'An error occurred',
      onSuccess,
      onError
    } = {}
  ) => {
    try {
      // Set loading state
      if (useGlobalState) {
        setLoading(operationName, true);
        clearError(operationName);
      } else {
        setLocalLoading(true);
        setLocalError(null);
      }

      // Execute the async function
      const result = await asyncFn();

      // Set success state
      if (useGlobalState && successMessage) {
        setSuccess(operationName, successMessage);
      } else if (!useGlobalState && successMessage) {
        setLocalSuccess(successMessage);
      }

      // Show success notification
      if (showNotification && successMessage) {
        notify(successMessage, 'success');
      }

      // Run success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      // Determine error message
      const message = error.response?.data?.message || error.message || errorMessage;

      // Set error state
      if (useGlobalState) {
        setError(operationName, message);
      } else {
        setLocalError(message);
      }

      // Show error notification
      if (showNotification) {
        notify(message, 'error');
      }

      // Run error callback
      if (onError) {
        onError(error);
      }

      // Re-throw the error for the caller to handle if needed
      throw error;
    } finally {
      // Clear loading state
      if (useGlobalState) {
        setLoading(operationName, false);
      } else {
        setLocalLoading(false);
      }
    }
  }, [
    operationName,
    useGlobalState,
    showNotification,
    setLoading,
    setError,
    clearError,
    setSuccess,
    notify
  ]);

  // Return appropriate loading and error states based on configuration
  return {
    loading: useGlobalState ? isLoading(operationName) : localLoading,
    error: useGlobalState ? getError(operationName) : localError,
    success: localSuccess,
    execute,
    setLoading: useGlobalState ? (isLoading) => setLoading(operationName, isLoading) : setLocalLoading,
    setError: useGlobalState ? (msg) => setError(operationName, msg) : setLocalError,
    clearError: useGlobalState ? () => clearError(operationName) : () => setLocalError(null),
    setSuccess: useGlobalState ? (msg) => setSuccess(operationName, msg) : setLocalSuccess
  };
};

export default useAsyncOperation;