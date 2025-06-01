/**
 * Monitoring Script
 * 
 * This script provides a command-line interface for monitoring the application.
 * It displays real-time information about the database, cache, and system resources.
 * 
 * Usage:
 *   node scripts/monitor.js [interval]
 * 
 * Examples:
 *   node scripts/monitor.js       # Monitor with default interval (5 seconds)
 *   node scripts/monitor.js 10    # Monitor with 10-second interval
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase, getDatabaseStats } = require('../config/database');
const monitoring = require('../utils/monitoring');
const cache = require('../utils/cache');
const { getResourceUsage } = require('../config/scaling');

// Get interval from command line arguments (default: 5 seconds)
const interval = parseInt(process.argv[2]) || 5;

// Initialize monitoring
monitoring.initMonitoring();

// Connect to database
connectDatabase()
  .then(() => {
    console.log('Connected to database');
    startMonitoring();
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });

async function startMonitoring() {
  console.log(`Starting monitoring with ${interval}-second interval`);
  console.log('Press Ctrl+C to exit');
  
  // Display initial stats
  await displayStats();
  
  // Set up interval for continuous monitoring
  const intervalId = setInterval(displayStats, interval * 1000);
  
  // Handle exit
  process.on('SIGINT', async () => {
    clearInterval(intervalId);
    console.log('\nStopping monitoring...');
    
    // Close connections
    await mongoose.connection.close();
    await cache.close();
    
    console.log('Monitoring stopped');
    process.exit(0);
  });
}

async function displayStats() {
  try {
    // Clear console
    console.clear();
    
    // Get current timestamp
    const now = new Date().toISOString();
    
    // Get monitoring data
    const monitoringData = monitoring.getMonitoringData();
    
    // Get database stats
    const dbStats = await getDatabaseStats();
    
    // Get cache stats
    const cacheStats = await cache.getStats();
    
    // Get resource usage
    const resourceUsage = getResourceUsage();
    
    // Display header
    console.log('='.repeat(80));
    console.log(`SYSTEM MONITORING - ${now}`);
    console.log('='.repeat(80));
    
    // Display resource usage
    console.log('\nSYSTEM RESOURCES:');
    console.log(`  CPU Cores: ${resourceUsage.system.cpus}`);
    console.log(`  Memory: ${formatBytes(resourceUsage.system.freeMemory)} free of ${formatBytes(resourceUsage.system.totalMemory)} (${resourceUsage.system.memoryUsage.toFixed(2)}% used)`);
    console.log(`  Process Memory: ${formatBytes(resourceUsage.process.memory.rss)} (RSS), ${formatBytes(resourceUsage.process.memory.heapUsed)} (Heap Used)`);
    console.log(`  Uptime: ${formatDuration(resourceUsage.system.uptime)} (system), ${formatDuration(resourceUsage.process.uptime)} (process)`);
    
    // Display database stats
    console.log('\nDATABASE:');
    console.log(`  Connection: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`  Collections: ${dbStats.collections}`);
    console.log(`  Documents: ${dbStats.objects}`);
    console.log(`  Size: ${formatBytes(dbStats.dataSize)} (data), ${formatBytes(dbStats.storageSize)} (storage)`);
    console.log(`  Indexes: ${dbStats.indexes} (${formatBytes(dbStats.indexSize)})`);
    
    // Display query stats
    console.log('\nQUERIES:');
    console.log(`  Total: ${monitoringData.queries.count}`);
    console.log(`  Slow Queries: ${monitoringData.queries.slow.length}`);
    console.log(`  Errors: ${monitoringData.queries.errors.length}`);
    
    // Display cache stats
    console.log('\nCACHE:');
    console.log(`  Memory Cache: ${cacheStats.memory.keys} keys, ${cacheStats.memory.hits} hits, ${cacheStats.memory.misses} misses`);
    if (cacheStats.redis && !cacheStats.redis.error) {
      console.log(`  Redis: ${cacheStats.redis.connected ? 'Connected' : 'Disconnected'}`);
      console.log(`  Redis Keys: ${cacheStats.redis.keys ? cacheStats.redis.keys.length : 'N/A'}`);
    } else {
      console.log('  Redis: Not configured or error');
    }
    
    // Display slow queries if any
    if (monitoringData.queries.slow.length > 0) {
      console.log('\nSLOW QUERIES (Top 5):');
      monitoringData.queries.slow.slice(0, 5).forEach((query, index) => {
        console.log(`  ${index + 1}. ${query.collection}.${query.query ? 'find' : 'aggregate'} - ${query.duration}ms`);
      });
    }
    
    // Display footer
    console.log('\n' + '-'.repeat(80));
    console.log(`Monitoring interval: ${interval} seconds. Press Ctrl+C to exit.`);
  } catch (error) {
    console.error('Error displaying stats:', error);
  }
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper function to format duration
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}