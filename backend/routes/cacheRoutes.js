/**
 * Cache Routes
 * 
 * This module defines routes for cache management and monitoring.
 */

const express = require('express');
const router = express.Router();
const cacheController = require('../controllers/cacheController');
const { requireApiKey } = require('../middleware/apiKeyMiddleware');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

// Apply API key authentication to all cache routes
router.use(requireApiKey(['admin']));

// Get cache statistics
router.get('/stats', authMiddleware, requireAdmin, cacheController.getStats);

// Clear cache by pattern
router.post('/clear', authMiddleware, requireAdmin, cacheController.clearCache);

// Clear all cache
router.post('/clear-all', authMiddleware, requireAdmin, cacheController.clearAllCache);

// Get cached value by key
router.get('/value/:key', authMiddleware, requireAdmin, cacheController.getCachedValue);

// Delete cached value by key
router.delete('/value/:key', authMiddleware, requireAdmin, cacheController.deleteCachedValue);

module.exports = router;