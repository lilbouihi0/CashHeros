/**
 * CORS Configuration Middleware
 * 
 * This middleware configures Cross-Origin Resource Sharing (CORS) settings
 * to control which domains can access the API and what methods they can use.
 */

const cors = require('cors');

/**
 * Configure CORS options based on environment
 * @returns {Object} CORS middleware configuration
 */
const corsOptions = () => {
  // Debug logging
  console.log('CORS middleware - NODE_ENV:', process.env.NODE_ENV);
  console.log('CORS middleware - CORS_ORIGIN:', process.env.CORS_ORIGIN);
  console.log('CORS middleware - FRONTEND_URL:', process.env.FRONTEND_URL);
  
  // Define allowed origins
  let allowedOrigins = [];
  
  // Add origins from CORS_ORIGIN environment variable
  if (process.env.CORS_ORIGIN) {
    allowedOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  }
  
  // Add hardcoded origins for casheros.com
  const hardcodedOrigins = [
    'https://casheros.com',
    'https://www.casheros.com',
    'https://cashheros.com',
    'https://www.cashheros.com',
    'https://admin.cashheros.com'
  ];
  
  // Merge and deduplicate origins
  allowedOrigins = [...new Set([...allowedOrigins, ...hardcodedOrigins])];
  
  // Add FRONTEND_URL if it exists and is not already included
  if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }
  
  console.log('CORS middleware - Final allowed origins:', allowedOrigins);
  
  return {
    origin: function (origin, callback) {
      console.log('CORS middleware - Request origin:', origin);
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log('CORS origin allowed (no origin):', origin);
        callback(null, allowedOrigins[0]);
        return;
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        console.log('CORS origin allowed:', origin);
        callback(null, origin);
      } else {
        console.warn('CORS blocked request from origin:', origin);
        console.warn('Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
    exposedHeaders: ['X-CSRF-Token'],
    credentials: true, // Allow cookies to be sent with requests
    maxAge: 86400 // Cache preflight requests for 24 hours
  };
};

module.exports = () => cors(corsOptions());