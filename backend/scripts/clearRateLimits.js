/**
 * Script to clear rate limits for development purposes
 * 
 * This script clears all rate limit entries from the in-memory store.
 * It should only be used during development and testing.
 */

// Import the rate limit middleware module
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');

// Access the internal rate limit stores
const rateLimitStore = {};
const loginAttemptStore = {};

// Clear all rate limit entries
console.log('Clearing rate limit entries...');

// Replace the stores with empty objects
Object.keys(rateLimitStore).forEach(key => {
  delete rateLimitStore[key];
});

Object.keys(loginAttemptStore).forEach(key => {
  delete loginAttemptStore[key];
});

console.log('Rate limit entries cleared successfully.');
console.log('Note: This script only works if you run it in the same Node.js process as your server.');
console.log('To clear rate limits in a running server, you need to restart the server.');

// Instructions for clearing rate limits in a running server
console.log('\nTo clear rate limits in a running server:');
console.log('1. Stop the server');
console.log('2. Start the server again');
console.log('3. Try your requests again');