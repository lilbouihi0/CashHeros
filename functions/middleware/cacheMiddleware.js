/**
 * Cache Middleware
 * 
 * This middleware provides route-level caching for API responses.
 */

const cache = require('../utils/cache');

/**
 * Route caching middleware
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 * @param {Function} keyGenerator - Optional function to generate custom cache keys
 * @returns {Function} Express middleware
 */
const routeCache = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Skip caching for authenticated requests unless explicitly allowed
    if (req.user && !req.allowAuthCache) {
      return next();
    }
    
    // Generate cache key
    const key = keyGenerator 
      ? keyGenerator(req)
      : cache.generateKey(`route:${req.originalUrl}`, {
          query: req.query,
          params: req.params
        });
    
    try {
      // Try to get from cache
      const cachedData = await cache.get(key);
      
      if (cachedData !== null) {
        return res.json(cachedData);
      }
      
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache the response
      res.json = function(data) {
        // Restore original json method
        res.json = originalJson;
        
        // Cache the response
        cache.set(key, data, ttl).catch(err => {
          console.error('Error caching response:', err);
        });
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Clear cache for specific routes
 * @param {string} pattern - Cache key pattern to clear
 * @returns {Promise<boolean>} Success status
 */
const clearRouteCache = async (pattern) => {
  return await cache.clear(pattern || 'route:');
};

module.exports = {
  routeCache,
  clearRouteCache
};