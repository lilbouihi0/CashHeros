/**
 * Monitoring Routes
 * 
 * This module defines routes for database monitoring.
 */

const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { requireApiKey } = require('../middleware/apiKeyMiddleware');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

// Apply API key authentication to all monitoring routes
router.use(requireApiKey(['admin']));

// Get monitoring data
router.get('/data', authMiddleware, requireAdmin, monitoringController.getMonitoringData);

// Reset monitoring data
router.post('/reset', authMiddleware, requireAdmin, monitoringController.resetMonitoringData);

// Update monitoring configuration
router.put('/config', authMiddleware, requireAdmin, monitoringController.updateConfig);

// Get database statistics
router.get('/stats', authMiddleware, requireAdmin, monitoringController.getDatabaseStatistics);

module.exports = router;