/**
 * API Cache Utility
 * 
 * This utility provides functions for caching API responses in memory and localStorage
 * to reduce API calls and improve performance.
 */

// Default cache duration in milliseconds (5 minutes)
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

// In-memory cache for faster access
const memoryCache = {};

/**
 * Get a cached item from memory or localStorage
 * 
 * @param {string} key - The cache key
 * @param {number} duration - Cache duration in milliseconds
 * @param {boolean} useLocalStorage - Whether to use localStorage as a fallback
 * @returns {any|null} - The cached item or null if not found or expired
 */
export const getCachedItem = (key, duration = DEFAULT_CACHE_DURATION, useLocalStorage = true) => {
  // Try memory cache first
  if (memoryCache[key]) {
    const { data, timestamp } = memoryCache[key];
    if (Date.now() - timestamp < duration) {
      return data;
    }
  }

  // Try localStorage if enabled
  if (useLocalStorage) {
    try {
      const cachedItem = localStorage.getItem(`cache_${key}`);
      if (cachedItem) {
        const { data, timestamp } = JSON.parse(cachedItem);
        if (Date.now() - timestamp < duration) {
          // Update memory cache
          memoryCache[key] = { data, timestamp };
          return data;
        }
        // Remove expired item from localStorage
        localStorage.removeItem(`cache_${key}`);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }

  return null;
};

/**
 * Set an item in the cache
 * 
 * @param {string} key - The cache key
 * @param {any} data - The data to cache
 * @param {boolean} useLocalStorage - Whether to also store in localStorage
 */
export const setCachedItem = (key, data, useLocalStorage = true) => {
  const timestamp = Date.now();
  
  // Set in memory cache
  memoryCache[key] = { data, timestamp };
  
  // Set in localStorage if enabled
  if (useLocalStorage) {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({ data, timestamp }));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      
      // If localStorage is full, clear old cache items
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        clearOldCacheItems();
        
        // Try again
        try {
          localStorage.setItem(`cache_${key}`, JSON.stringify({ data, timestamp }));
        } catch (retryError) {
          console.error('Failed to cache item even after clearing old items:', retryError);
        }
      }
    }
  }
};

/**
 * Remove an item from the cache
 * 
 * @param {string} key - The cache key
 * @param {boolean} useLocalStorage - Whether to also remove from localStorage
 */
export const removeCachedItem = (key, useLocalStorage = true) => {
  // Remove from memory cache
  delete memoryCache[key];
  
  // Remove from localStorage if enabled
  if (useLocalStorage) {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

/**
 * Clear all cached items
 * 
 * @param {boolean} useLocalStorage - Whether to also clear localStorage
 */
export const clearCache = (useLocalStorage = true) => {
  // Clear memory cache
  Object.keys(memoryCache).forEach(key => {
    delete memoryCache[key];
  });
  
  // Clear localStorage if enabled
  if (useLocalStorage) {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage cache:', error);
    }
  }
};

/**
 * Clear old cache items from localStorage
 * This is used when localStorage is full
 */
const clearOldCacheItems = () => {
  try {
    const cacheKeys = [];
    
    // Get all cache keys and their timestamps
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          cacheKeys.push({
            key,
            timestamp: item.timestamp
          });
        } catch (e) {
          // If item is corrupted, remove it
          localStorage.removeItem(key);
        }
      }
    }
    
    // Sort by timestamp (oldest first)
    cacheKeys.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove the oldest 50% of items
    const itemsToRemove = Math.ceil(cacheKeys.length / 2);
    cacheKeys.slice(0, itemsToRemove).forEach(item => {
      localStorage.removeItem(item.key);
    });
  } catch (error) {
    console.error('Error clearing old cache items:', error);
  }
};

/**
 * Cache API responses using the fetch API
 * 
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} duration - Cache duration in milliseconds
 * @param {boolean} useLocalStorage - Whether to use localStorage
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<any>} - The response data
 */
export const cachedFetch = async (
  url, 
  options = {}, 
  duration = DEFAULT_CACHE_DURATION, 
  useLocalStorage = true,
  forceRefresh = false
) => {
  const cacheKey = `fetch_${url}_${JSON.stringify(options)}`;
  
  // Return cached data if available and not forcing refresh
  if (!forceRefresh) {
    const cachedData = getCachedItem(cacheKey, duration, useLocalStorage);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // Fetch fresh data
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the response
    setCachedItem(cacheKey, data, useLocalStorage);
    
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

/**
 * Cache API responses using axios
 * 
 * @param {Object} axiosInstance - The axios instance
 * @param {string} url - The URL to fetch
 * @param {Object} config - Axios config
 * @param {number} duration - Cache duration in milliseconds
 * @param {boolean} useLocalStorage - Whether to use localStorage
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<any>} - The response data
 */
export const cachedAxios = async (
  axiosInstance,
  url,
  config = {},
  duration = DEFAULT_CACHE_DURATION,
  useLocalStorage = true,
  forceRefresh = false
) => {
  const cacheKey = `axios_${url}_${JSON.stringify(config)}`;
  
  // Return cached data if available and not forcing refresh
  if (!forceRefresh) {
    const cachedData = getCachedItem(cacheKey, duration, useLocalStorage);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // Fetch fresh data
  try {
    const response = await axiosInstance.get(url, config);
    const data = response.data;
    
    // Cache the response
    setCachedItem(cacheKey, data, useLocalStorage);
    
    return data;
  } catch (error) {
    console.error('Error fetching data with axios:', error);
    throw error;
  }
};

/**
 * Create a cached version of any async function
 * 
 * @param {Function} fn - The async function to cache
 * @param {Function} getCacheKey - Function to generate a cache key from the arguments
 * @param {number} duration - Cache duration in milliseconds
 * @param {boolean} useLocalStorage - Whether to use localStorage
 * @returns {Function} - The cached function
 */
export const createCachedFunction = (
  fn,
  getCacheKey = (...args) => `fn_${JSON.stringify(args)}`,
  duration = DEFAULT_CACHE_DURATION,
  useLocalStorage = true
) => {
  return async (...args) => {
    const forceRefresh = args.find(arg => arg === true && typeof arg === 'boolean');
    const cacheKey = getCacheKey(...args);
    
    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedItem(cacheKey, duration, useLocalStorage);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Call the original function
    try {
      const result = await fn(...args);
      
      // Cache the result
      setCachedItem(cacheKey, result, useLocalStorage);
      
      return result;
    } catch (error) {
      console.error('Error in cached function:', error);
      throw error;
    }
  };
};

export default {
  getCachedItem,
  setCachedItem,
  removeCachedItem,
  clearCache,
  cachedFetch,
  cachedAxios,
  createCachedFunction
};