/**
 * Image Utility Functions
 * 
 * Provides helper functions for handling images, including placeholders
 */

// Get the API base URL for the proxy endpoint
const getApiBaseUrl = () => {
  // Use the same logic as api.js to determine the base URL
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  
  // For production, use the Cloud Run service URL
  if (process.env.NODE_ENV === 'production' || window.location.hostname === 'casheros.com') {
    return 'https://cashheros-api-121222242956.us-central1.run.app/api';
  }
  
  return apiBaseUrl;
};

/**
 * Get a placeholder image URL using our proxy endpoint
 * @param {number} width - Width of the placeholder image
 * @param {number} height - Height of the placeholder image
 * @param {string} text - Text to display on the placeholder
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = (width = 200, height = 150, text = 'No+Image') => {
  const apiBaseUrl = getApiBaseUrl();
  
  // Use our proxy endpoint to avoid CORS issues
  const placeholderUrl = `https://via.placeholder.com/${width}x${height}/e0e0e0/808080?text=${text}`;
  const proxyUrl = `${apiBaseUrl}/proxy-image?url=${encodeURIComponent(placeholderUrl)}`;
  
  return proxyUrl;
};

/**
 * Handle image loading errors by replacing with a placeholder
 * @param {Event} event - The error event
 */
export const handleImageError = (event) => {
  const element = event.target;
  const width = element.width || 200;
  const height = element.height || 150;
  
  // Track which fallback we're using
  const currentSrc = element.src || '';
  
  // If we're already using the proxy and it failed, use data URI as final fallback
  if (currentSrc.includes('/proxy-image')) {
    const dataUri = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23808080'%3ENo Image%3C/text%3E%3C/svg%3E`;
    element.src = dataUri;
    element.onerror = null; // Prevent infinite loop
  }
  // Start with proxy endpoint
  else {
    element.src = getPlaceholderImage(width, height);
  }
  
  // Add a class to indicate it's a placeholder
  element.classList.add('placeholder-image');
};

export default {
  getPlaceholderImage,
  handleImageError
};