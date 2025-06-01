/**
 * Image Utility Functions
 * 
 * Provides helper functions for handling images, including placeholders
 */

/**
 * Get a placeholder image URL
 * @param {number} width - Width of the placeholder image
 * @param {number} height - Height of the placeholder image
 * @param {string} text - Text to display on the placeholder
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = (width = 200, height = 150, text = 'No+Image') => {
  // Use a more reliable placeholder service with multiple fallbacks
  
  // First try: placehold.co (reliable external service)
  const placeholdCoUrl = `https://placehold.co/${width}x${height}/e0e0e0/808080?text=${text}`;
  
  // Second try: dummyimage.com (alternative service)
  const dummyImageUrl = `https://dummyimage.com/${width}x${height}/e0e0e0/808080&text=${text}`;
  
  // Third try: Data URI (works offline, most reliable)
  const dataUri = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23808080'%3ENo Image%3C/text%3E%3C/svg%3E`;
  
  // Try to load placehold.co first, with fallbacks
  return placeholdCoUrl;
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
  
  // If we're already using placehold.co and it failed, try dummyimage.com
  if (currentSrc.includes('placehold.co')) {
    const dummyImageUrl = `https://dummyimage.com/${width}x${height}/e0e0e0/808080&text=No+Image`;
    element.src = dummyImageUrl;
  } 
  // If we're using dummyimage.com and it failed, use data URI as final fallback
  else if (currentSrc.includes('dummyimage.com')) {
    const dataUri = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23808080'%3ENo Image%3C/text%3E%3C/svg%3E`;
    element.src = dataUri;
  }
  // Start with placehold.co
  else {
    element.src = getPlaceholderImage(width, height);
  }
  
  // Add a class to indicate it's a placeholder
  element.classList.add('placeholder-image');
  
  // Prevent infinite error loop if we're on our last fallback
  if (currentSrc.includes('dummyimage.com')) {
    element.onerror = null;
  }
};

export default {
  getPlaceholderImage,
  handleImageError
};