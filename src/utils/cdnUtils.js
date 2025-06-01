/**
 * CDN Utilities for handling static assets
 */

// Get the CDN URL based on the environment
const getCdnUrl = () => {
  const env = process.env.REACT_APP_ENV || 'development';
  
  switch (env) {
    case 'production':
      return 'https://static.cashheros.com';
    case 'staging':
      return 'https://static-staging.cashheros.com';
    default:
      return ''; // In development, use relative paths
  }
};

/**
 * Get the full URL for a static asset
 * @param {string} path - The path to the asset, e.g., '/images/logo.png'
 * @returns {string} The full URL to the asset
 */
export const getAssetUrl = (path) => {
  const cdnUrl = getCdnUrl();
  
  // If we're in development or the path is already absolute, return it as is
  if (!cdnUrl || path.startsWith('http')) {
    return path;
  }
  
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cdnUrl}${normalizedPath}`;
};

/**
 * Preload critical assets
 * @param {Array<string>} assetPaths - Array of asset paths to preload
 */
export const preloadAssets = (assetPaths) => {
  assetPaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = getAssetUrl(path);
    
    // Set appropriate as attribute based on file extension
    const extension = path.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      link.as = 'image';
    } else if (extension === 'css') {
      link.as = 'style';
    } else if (extension === 'js') {
      link.as = 'script';
    } else if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Upload an asset to the CDN (for admin use)
 * @param {File} file - The file to upload
 * @param {string} path - The path where the file should be stored
 * @returns {Promise<string>} A promise that resolves to the URL of the uploaded asset
 */
export const uploadAsset = async (file, path) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    
    const response = await fetch('/api/admin/upload-asset', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading asset:', error);
    throw error;
  }
};

export default {
  getAssetUrl,
  preloadAssets,
  uploadAsset
};