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
  // In production, only allow specific origins
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://cashheros.com',
      'https://www.cashheros.com',
      'https://admin.cashheros.com'
    ].filter(Boolean); // Filter out any undefined values
    
    return {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
      exposedHeaders: ['X-CSRF-Token'],
      credentials: true, // Allow cookies to be sent with requests
      maxAge: 86400 // Cache preflight requests for 24 hours
    };
  } 
  // In development, use CORS_ORIGIN if available, otherwise allow all origins
  else {
    // Check if CORS_ORIGIN is defined in .env
    if (process.env.CORS_ORIGIN) {
      const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
      
      return {
        origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
        exposedHeaders: ['X-CSRF-Token'],
        credentials: true,
        maxAge: 86400
      };
    } else {
      // If CORS_ORIGIN is not defined, allow all origins in development
      return {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
        exposedHeaders: ['X-CSRF-Token'],
        credentials: true,
        maxAge: 86400
      };
    }
  }
};

module.exports = () => cors(corsOptions());