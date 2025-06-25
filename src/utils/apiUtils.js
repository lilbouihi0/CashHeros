import axios from 'axios';

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Handle API errors in a consistent way
 * @param {Error} error - The error object from axios
 * @returns {Object} - Standardized error object
 */
export const handleApiError = (error) => {
  let errorMessage = 'An unexpected error occurred';
  let statusCode = 500;
  let errorData = null;

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    statusCode = error.response.status;
    errorData = error.response.data;
    errorMessage = error.response.data?.message || `Error ${statusCode}: ${error.response.statusText}`;
    
    // Handle specific status codes
    switch (statusCode) {
      case 401:
        errorMessage = 'Authentication required. Please log in again.';
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 422:
        errorMessage = 'Validation error. Please check your input.';
        break;
      case 429:
        errorMessage = 'Too many requests. Please try again later.';
        break;
      default:
        // Use the message from the server if available
        break;
    }
  } else if (error.request) {
    // The request was made but no response was received
    statusCode = 0;
    errorMessage = 'No response from server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message;
  }

  return {
    message: errorMessage,
    statusCode,
    data: errorData,
    originalError: error
  };
};

/**
 * Add auth token to requests
 * @param {string} token - The auth token
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Make a GET request with error handling
 * @param {string} url - The URL to request
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
export const get = async (url, options = {}) => {
  try {
    const response = await api.get(url, options);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a POST request with error handling
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
export const post = async (url, data = {}, options = {}) => {
  try {
    const response = await api.post(url, data, options);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a PUT request with error handling
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
export const put = async (url, data = {}, options = {}) => {
  try {
    const response = await api.put(url, data, options);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a PATCH request with error handling
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
export const patch = async (url, data = {}, options = {}) => {
  try {
    const response = await api.patch(url, data, options);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a DELETE request with error handling
 * @param {string} url - The URL to request
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response data
 */
export const del = async (url, options = {}) => {
  try {
    const response = await api.delete(url, options);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default api;