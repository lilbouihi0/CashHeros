/**
 * Cache Controller
 * 
 * This controller provides endpoints for managing and monitoring the cache.
 */

const cache = require('../utils/cache');

/**
 * Get cache statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Cache statistics
 */
const getStats = async (req, res) => {
  try {
    const stats = await cache.getStats();
    
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting cache statistics',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

/**
 * Clear cache by pattern
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Success status
 */
const clearCache = async (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: 'Pattern is required'
      });
    }
    
    await cache.clear(pattern);
    
    return res.status(200).json({
      success: true,
      message: `Cache cleared for pattern: ${pattern}`
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Error clearing cache',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

/**
 * Clear all cache
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Success status
 */
const clearAllCache = async (req, res) => {
  try {
    // Clear all cache by using an empty pattern
    await cache.clear('');
    
    return res.status(200).json({
      success: true,
      message: 'All cache cleared'
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Error clearing all cache',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

/**
 * Get cached value by key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Cached value
 */
const getCachedValue = async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Key is required'
      });
    }
    
    const value = await cache.get(key);
    
    if (value === null) {
      return res.status(404).json({
        success: false,
        message: `No cached value found for key: ${key}`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: value
    });
  } catch (error) {
    console.error('Error getting cached value:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting cached value',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

/**
 * Delete cached value by key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Success status
 */
const deleteCachedValue = async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Key is required'
      });
    }
    
    await cache.del(key);
    
    return res.status(200).json({
      success: true,
      message: `Cached value deleted for key: ${key}`
    });
  } catch (error) {
    console.error('Error deleting cached value:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting cached value',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

module.exports = {
  getStats,
  clearCache,
  clearAllCache,
  getCachedValue,
  deleteCachedValue
};