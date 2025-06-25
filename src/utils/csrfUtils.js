/**
 * CSRF Token Utilities
 * Handles CSRF token management for API requests
 */

/**
 * Get CSRF token from cookie
 * @returns {string|null} CSRF token or null if not found
 */
export const getCsrfToken = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrfToken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

/**
 * Get CSRF token from meta tag (alternative method)
 * @returns {string|null} CSRF token or null if not found
 */
export const getCsrfTokenFromMeta = () => {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
};

/**
 * Set CSRF token in axios headers
 * @param {Object} axiosInstance - Axios instance to configure
 */
export const setupCsrfToken = (axiosInstance) => {
  // Add request interceptor to include CSRF token
  axiosInstance.interceptors.request.use(
    (config) => {
      // Skip CSRF token for GET requests
      if (config.method && config.method.toLowerCase() === 'get') {
        return config;
      }

      // Get CSRF token
      const csrfToken = getCsrfToken() || getCsrfTokenFromMeta();
      
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle CSRF token updates
  axiosInstance.interceptors.response.use(
    (response) => {
      // Check if response contains a new CSRF token
      const newCsrfToken = response.headers['x-csrf-token'];
      if (newCsrfToken) {
        // Update the token in a meta tag for future requests
        let metaTag = document.querySelector('meta[name="csrf-token"]');
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', 'csrf-token');
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', newCsrfToken);
      }
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

/**
 * Initialize CSRF token by making a GET request to get the token
 * @param {Object} axiosInstance - Axios instance to use
 * @returns {Promise<string|null>} Promise that resolves to the CSRF token
 */
export const initializeCsrfToken = async (axiosInstance) => {
  try {
    // Make a GET request to initialize CSRF token
    const response = await axiosInstance.get('/auth/csrf-token');
    const csrfToken = response.headers['x-csrf-token'];
    
    if (csrfToken) {
      // Store token in meta tag
      let metaTag = document.querySelector('meta[name="csrf-token"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'csrf-token');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', csrfToken);
      return csrfToken;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to initialize CSRF token:', error);
    return null;
  }
};