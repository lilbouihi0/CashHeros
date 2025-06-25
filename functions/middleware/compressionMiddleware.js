/**
 * @module middleware/compressionMiddleware
 * @description Middleware for compressing API responses
 */

const compression = require('compression');

/**
 * Determine if the request should be compressed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} Whether to compress the response
 */
const shouldCompress = (req, res) => {
  // Don't compress if client doesn't accept compression
  if (req.headers['x-no-compression']) {
    return false;
  }
  
  // Don't compress responses with status code >= 300
  if (res.statusCode >= 300) {
    return false;
  }
  
  // Use compression filter
  return compression.filter(req, res);
};

/**
 * Configure compression middleware
 * @param {Object} options - Compression options
 * @returns {Function} Express middleware function
 */
const compressionMiddleware = (options = {}) => {
  const defaultOptions = {
    level: 6, // Compression level (0-9, 9 being best compression but slowest)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: shouldCompress,
    memLevel: 8, // How much memory to use for the internal compression state (1-9)
    strategy: 0 // Compression strategy (0 = default, 1 = filtered, 2 = huffman only, 3 = RLE, 4 = fixed)
  };
  
  return compression({
    ...defaultOptions,
    ...options
  });
};

module.exports = compressionMiddleware;