/**
 * CSS Optimization Utilities
 * 
 * This module provides utilities for optimizing CSS delivery and performance.
 */

/**
 * Dynamically loads a CSS file only when needed
 * @param {string} href - The URL of the CSS file to load
 * @param {Object} options - Options for loading the CSS
 * @param {string} options.id - Optional ID for the stylesheet element
 * @param {Function} options.onLoad - Callback function when CSS is loaded
 * @param {Function} options.onError - Callback function when CSS fails to load
 * @returns {HTMLLinkElement} The created link element
 */
export const loadCssFile = (href, { id, onLoad, onError } = {}) => {
  // Check if the stylesheet is already loaded
  if (id && document.getElementById(id)) {
    return null;
  }
  
  // Create link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  if (id) link.id = id;
  
  // Add event listeners
  if (onLoad) link.addEventListener('load', onLoad);
  if (onError) link.addEventListener('error', onError);
  
  // Add to document head
  document.head.appendChild(link);
  
  return link;
};

/**
 * Unloads a CSS file when it's no longer needed
 * @param {string} id - The ID of the stylesheet to unload
 */
export const unloadCssFile = (id) => {
  const link = document.getElementById(id);
  if (link) {
    link.parentNode.removeChild(link);
  }
};

/**
 * Preloads a CSS file for future use
 * @param {string} href - The URL of the CSS file to preload
 * @param {string} id - Optional ID for the preload element
 */
export const preloadCssFile = (href, id) => {
  // Check if already preloaded
  if (id && document.getElementById(`preload-${id}`)) {
    return;
  }
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  if (id) link.id = `preload-${id}`;
  
  document.head.appendChild(link);
};

/**
 * Inlines critical CSS directly into the page
 * @param {string} css - The CSS string to inline
 * @param {string} id - Optional ID for the style element
 */
export const inlineCriticalCss = (css, id) => {
  // Check if already inlined
  if (id && document.getElementById(id)) {
    return;
  }
  
  const style = document.createElement('style');
  style.textContent = css;
  if (id) style.id = id;
  
  document.head.appendChild(style);
};

/**
 * Loads CSS for a specific feature only when that feature is used
 * @param {string} featureName - Name of the feature (used for the ID)
 * @param {string} cssPath - Path to the CSS file
 */
export const loadFeatureCss = (featureName, cssPath) => {
  const id = `css-feature-${featureName}`;
  loadCssFile(cssPath, { 
    id,
    onError: () => console.error(`Failed to load CSS for feature: ${featureName}`)
  });
};

/**
 * Optimizes images by setting appropriate loading attributes
 * @param {HTMLImageElement[]} images - Array of image elements to optimize
 */
export const optimizeImages = (images) => {
  images.forEach(img => {
    // Skip images that already have loading attributes
    if (img.loading) return;
    
    // Set loading="lazy" for images below the fold
    if (!isInViewport(img)) {
      img.loading = 'lazy';
    }
    
    // Add decoding="async" to all images
    img.decoding = 'async';
  });
};

/**
 * Checks if an element is in the viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if the element is in the viewport
 */
const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};