/**
 * Monitoring Controller
 * 
 * This controller provides endpoints for monitoring database performance and health.
 */

const monitoring = require('../utils/monitoring');
const { getDatabaseStats } = require('../config/database');

/**
 * Get monitoring data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Monitoring data
 */
const getMonitoringData = async (req, res) => {
  try {
    const data = monitoring.getMonitoringData();
    
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting monitoring data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting monitoring data',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

/**
 * Reset monitoring data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Success status
 */
const resetMonitoringData = async (req, res) => {
  try {
    monitoring.resetMonitoringData();
    
    return res.status(200).json({
      success: true,
      message: 'Monitoring data reset successfully'
    });
  } catch (error) {
    console.error('Error resetting monitoring data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resetting monitoring data',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

/**
 * Update monitoring configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Updated configuration
 */
const updateConfig = async (req, res) => {
  try {
    const newConfig = req.body;
    
    if (!newConfig || Object.keys(newConfig).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No configuration provided'
      });
    }
    
    const updatedConfig = monitoring.updateConfig(newConfig);
    
    return res.status(200).json({
      success: true,
      message: 'Monitoring configuration updated successfully',
      data: updatedConfig
    });
  } catch (error) {
    console.error('Error updating monitoring configuration:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating monitoring configuration',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

/**
 * Get database statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Database statistics
 */
const getDatabaseStatistics = async (req, res) => {
  try {
    const stats = await getDatabaseStats();
    
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting database statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting database statistics',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

module.exports = {
  getMonitoringData,
  resetMonitoringData,
  updateConfig,
  getDatabaseStatistics
};