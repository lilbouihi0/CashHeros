/**
 * Cache Clear Script
 * 
 * This script provides a command-line interface for clearing the application cache.
 * It can be used to clear specific cache patterns or the entire cache.
 * 
 * Usage:
 *   node scripts/clear-cache.js [pattern]
 * 
 * Examples:
 *   node scripts/clear-cache.js                  # Clear all cache
 *   node scripts/clear-cache.js coupons:         # Clear all coupon-related cache
 *   node scripts/clear-cache.js route:/api/blogs # Clear blog route cache
 */

require('dotenv').config();
const cache = require('../utils/cache');

// Get pattern from command line arguments
const pattern = process.argv[2] || '';

async function clearCache() {
  try {
    console.log(`Clearing cache${pattern ? ` with pattern: ${pattern}` : ' (all)'}`);
    
    await cache.clear(pattern);
    
    console.log('Cache cleared successfully');
    
    // Get cache stats after clearing
    const stats = await cache.getStats();
    console.log('Current cache stats:', JSON.stringify(stats, null, 2));
    
    // Close cache connections
    await cache.close();
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing cache:', error);
    process.exit(1);
  }
}

clearCache();