/**
 * API Service
 * 
 * Centralized API service with interceptors, error handling, retry logic,
 * token refresh, offline capabilities, and request/response logging.
 */
import axios from 'axios';
import { handleApiError, ErrorTypes } from '../utils/errorHandler';
import { setupCsrfToken, initializeCsrfToken } from '../utils/csrfUtils';

// Temporary implementation until we have the full apiCache utility
const getCachedItem = (key) => null;
const setCachedItem = (key, data) => {};

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const DEFAULT_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Enable cookies for CSRF tokens
});

// Setup CSRF token handling
setupCsrfToken(api);

// Request queue for offline mode
let requestQueue = [];
let isOffline = !navigator.onLine;

// Track if token refresh is in progress
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Subscribe to token refresh
 * @param {Function} callback - Function to call after token refresh
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers that token has been refreshed
 * @param {string} token - The new access token
 */
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

/**
 * Refresh the authentication token
 * @returns {Promise<string>} - The new access token
 */
const refreshToken = async () => {
  try {
    // Get refresh token from localStorage
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Call the token refresh endpoint
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken
    });
    
    const { accessToken, newRefreshToken } = response.data;
    
    // Store the new tokens
    localStorage.setItem('accessToken', accessToken);
    
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return accessToken;
  } catch (error) {
    // If refresh fails, log out the user
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login page
    window.location.href = '/login?session=expired';
    
    throw error;
  }
};

/**
 * Add a request to the offline queue
 * @param {Object} request - The request configuration
 */
const addToOfflineQueue = (request) => {
  requestQueue.push(request);
  
  // Store queue in localStorage for persistence
  try {
    localStorage.setItem('offlineRequestQueue', JSON.stringify(requestQueue));
  } catch (e) {
    console.error('Failed to store offline request queue:', e);
  }
  
  return {
    data: null,
    status: 'queued',
    message: 'Request queued for when connection is restored'
  };
};

/**
 * Process the offline request queue
 */
const processOfflineQueue = async () => {
  if (requestQueue.length === 0) return;
  
  console.log(`Processing offline queue: ${requestQueue.length} requests`);
  
  const queue = [...requestQueue];
  requestQueue = [];
  
  // Clear the stored queue
  localStorage.removeItem('offlineRequestQueue');
  
  for (const request of queue) {
    try {
      // Use axios directly to avoid adding failed requests back to the queue
      await axios(request);
      console.log('Processed offline request:', request.url);
    } catch (error) {
      console.error('Failed to process offline request:', error);
      
      // If still offline, add back to queue
      if (!navigator.onLine) {
        requestQueue.push(request);
      }
    }
  }
  
  // Update stored queue if there are still items
  if (requestQueue.length > 0) {
    localStorage.setItem('offlineRequestQueue', JSON.stringify(requestQueue));
  }
};

// Load offline queue from localStorage on startup
try {
  const storedQueue = localStorage.getItem('offlineRequestQueue');
  if (storedQueue) {
    requestQueue = JSON.parse(storedQueue);
    console.log(`Loaded offline queue: ${requestQueue.length} requests`);
  }
} catch (e) {
  console.error('Failed to load offline request queue:', e);
}

// Set up online/offline event listeners
window.addEventListener('online', () => {
  console.log('Connection restored. Processing offline queue...');
  isOffline = false;
  processOfflineQueue();
});

window.addEventListener('offline', () => {
  console.log('Connection lost. Requests will be queued.');
  isOffline = true;
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Start request timer for logging
    config.metadata = { startTime: new Date() };
    
    // Get CSRF token from cookie or header
    const getCsrfToken = () => {
      // Try to get from cookie
      const cookies = document.cookie.split(';');
      let csrfToken = null;
      
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrfToken') {
          csrfToken = value;
          break;
        }
      }
      
      // If not in cookie, try to get from localStorage (might have been saved from header)
      if (!csrfToken) {
        csrfToken = localStorage.getItem('csrfToken');
      }
      
      return csrfToken;
    };
    
    // Add CSRF token to all non-GET requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
        
        // Also add to body for form submissions
        if (config.data && typeof config.data === 'object') {
          config.data._csrf = csrfToken;
        }
      } else {
        console.warn('CSRF token not found for non-GET request:', config.url);
      }
    }
    
    // Skip auth header for auth endpoints
    if (config.url.includes('/auth/login') || config.url.includes('/auth/refresh') || config.url.includes('/auth/register')) {
      return config;
    }
    
    // Check if we're offline
    if (isOffline && config.offlineMode !== 'disabled') {
      // For GET requests, try to return cached data
      if (config.method === 'get' && config.offlineMode !== 'queue-only') {
        const cacheKey = `offline_${config.url}_${JSON.stringify(config.params || {})}`;
        const cachedData = getCachedItem(cacheKey);
        
        if (cachedData) {
          console.log('Returning cached data for offline request:', config.url);
          
          // Create a resolved promise with cached data
          return Promise.resolve({
            data: cachedData,
            status: 200,
            statusText: 'OK (Cached)',
            headers: {},
            config,
            cached: true
          });
        }
      }
      
      // For non-GET requests or when no cache is available, queue the request
      if (config.offlineMode !== 'cache-only') {
        console.log('Queueing request for when connection is restored:', config.url);
        return Promise.reject({
          config,
          response: {
            status: 0,
            data: addToOfflineQueue(config)
          }
        });
      }
    }
    
    // Add auth token to request
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration for logging
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    // Log successful response
    console.log(`[API] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    
    // Save CSRF token from response header if present
    const csrfToken = response.headers['x-csrf-token'];
    if (csrfToken) {
      localStorage.setItem('csrfToken', csrfToken);
      console.log('Saved CSRF token from response headers');
    }
    
    // For GET requests, cache the response for offline use
    if (response.config.method === 'get' && !response.cached) {
      const cacheKey = `offline_${response.config.url}_${JSON.stringify(response.config.params || {})}`;
      setCachedItem(cacheKey, response.data);
    }
    
    return response;
  },
  async (error) => {
    // If no response or request, it's a network error
    if (!error.response || !error.config) {
      return Promise.reject(error);
    }
    
    const { config, response } = error;
    
    // Calculate request duration for logging
    const endTime = new Date();
    const duration = endTime - config.metadata.startTime;
    
    // Log error response
    console.error(`[API] ${config.method.toUpperCase()} ${config.url} - ${response?.status || 'NETWORK ERROR'} (${duration}ms)`);
    
    // Handle token expiration (401 Unauthorized)
    if (response && response.status === 401 && !config.url.includes('/auth/refresh')) {
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          // Try to refresh the token
          const newToken = await refreshToken();
          
          // Update the Authorization header with new token
          config.headers.Authorization = `Bearer ${newToken}`;
          
          // Notify all subscribers about the new token
          onTokenRefreshed(newToken);
          
          isRefreshing = false;
          
          // Retry the original request with new token
          return api(config);
        } catch (refreshError) {
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      } else {
        // Token refresh is already in progress, wait for it to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(api(config));
          });
        });
      }
    }
    
    // Implement retry logic for specific errors
    if (
      config.retryCount === undefined &&
      (response?.status === 408 || response?.status === 429 || response?.status >= 500) &&
      config.method === 'get'
    ) {
      config.retryCount = 0;
      
      return retryRequest(config);
    }
    
    // Parse and enhance error before rejecting
    const parsedError = handleApiError(error, {
      logToConsole: true,
      context: {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data
      }
    });
    
    return Promise.reject(parsedError);
  }
);

/**
 * Retry a failed request
 * @param {Object} config - The request configuration
 * @returns {Promise} - The retry promise
 */
const retryRequest = async (config) => {
  config.retryCount = config.retryCount + 1;
  
  if (config.retryCount > MAX_RETRIES) {
    return Promise.reject({
      message: `Request failed after ${MAX_RETRIES} retries`
    });
  }
  
  // Wait before retrying (with exponential backoff)
  const delay = RETRY_DELAY * Math.pow(2, config.retryCount - 1);
  console.log(`Retrying request (${config.retryCount}/${MAX_RETRIES}) after ${delay}ms:`, config.url);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return api(config);
};

/**
 * Enhanced GET method with offline support and caching
 * @param {string} url - The URL to request
 * @param {Object} options - Request options
 * @returns {Promise} - The response promise
 */
const get = (url, options = {}) => {
  const { params, headers, timeout, offlineMode = 'cache-first', ...rest } = options;
  
  return api.get(url, {
    params,
    headers,
    timeout,
    offlineMode,
    ...rest
  });
};

/**
 * Enhanced POST method with offline queueing
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @param {Object} options - Request options
 * @returns {Promise} - The response promise
 */
const post = (url, data, options = {}) => {
  const { headers, timeout, offlineMode = 'queue', ...rest } = options;
  
  return api.post(url, data, {
    headers,
    timeout,
    offlineMode,
    ...rest
  });
};

/**
 * Enhanced PUT method with offline queueing
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @param {Object} options - Request options
 * @returns {Promise} - The response promise
 */
const put = (url, data, options = {}) => {
  const { headers, timeout, offlineMode = 'queue', ...rest } = options;
  
  return api.put(url, data, {
    headers,
    timeout,
    offlineMode,
    ...rest
  });
};

/**
 * Enhanced PATCH method with offline queueing
 * @param {string} url - The URL to request
 * @param {Object} data - The data to send
 * @param {Object} options - Request options
 * @returns {Promise} - The response promise
 */
const patch = (url, data, options = {}) => {
  const { headers, timeout, offlineMode = 'queue', ...rest } = options;
  
  return api.patch(url, data, {
    headers,
    timeout,
    offlineMode,
    ...rest
  });
};

/**
 * Enhanced DELETE method with offline queueing
 * @param {string} url - The URL to request
 * @param {Object} options - Request options
 * @returns {Promise} - The response promise
 */
const del = (url, options = {}) => {
  const { headers, timeout, offlineMode = 'queue', ...rest } = options;
  
  return api.delete(url, {
    headers,
    timeout,
    offlineMode,
    ...rest
  });
};

/**
 * Get the current offline request queue
 * @returns {Array} - The offline request queue
 */
const getOfflineQueue = () => {
  return [...requestQueue];
};

/**
 * Clear the offline request queue
 */
const clearOfflineQueue = () => {
  requestQueue = [];
  localStorage.removeItem('offlineRequestQueue');
};

/**
 * Check if the device is currently offline
 * @returns {boolean} - Whether the device is offline
 */
const isDeviceOffline = () => {
  return isOffline;
};

// Export the API service
const apiService = {
  get,
  post,
  put,
  patch,
  delete: del,
  instance: api,
  getOfflineQueue,
  clearOfflineQueue,
  isOffline: isDeviceOffline,
  processOfflineQueue
};

export default apiService;