// Test script to check what's being exported
console.log('Testing exports...');

try {
  const indexExports = require('./index');
  console.log('Index exports:', Object.keys(indexExports));
  console.log('api export type:', typeof indexExports.api);
  console.log('api export function length:', indexExports.api.length); // Should be 2 for (req, res)
} catch (error) {
  console.error('Error loading index:', error);
}

try {
  const serverExports = require('./server');
  console.log('Server exports type:', typeof serverExports);
} catch (error) {
  console.error('Error loading server:', error);
}