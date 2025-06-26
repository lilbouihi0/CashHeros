const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
// const http = require('http'); // REMOVED: No longer needed for direct server creation


// For local development only - uncomment if needed
// require('dotenv').config();

// Explicitly set NODE_ENV for functions, as this is a production environment
process.env.NODE_ENV = 'production';

// Import routes
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const cashbackRoutes = require('./routes/cashbackRoutes');
const couponRoutes = require('./routes/couponRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// Import security middleware
const corsMiddleware = require('./middleware/corsMiddleware');
const { createRateLimiter, basicLimiter, apiLimiter, authLimiter } = require('./middleware/rateLimitMiddleware');
const { defaultSetCsrfToken, defaultVerifyCsrfToken } = require('./middleware/csrfMiddleware');
const { defaultSanitizeInputs, defaultPreventNoSqlInjection } = require('./middleware/sanitizationMiddleware');
const { defaultSecurityHeaders } = require('./middleware/securityHeadersMiddleware');
const { requireApiKey } = require('./middleware/apiKeyMiddleware');

// Import performance optimization middleware
const { routeCache } = require('./middleware/cacheMiddleware');
const { paginate, filter, sort, select, optimizeQuery, cacheResponse } = require('./middleware/queryMiddleware');
const { requestLogger, performanceLogger, errorLogger, logger } = require('./middleware/loggingMiddleware');
const compressionMiddleware = require('./middleware/compressionMiddleware');

// Import WebSocket server (Kept for module resolution, but WebSocket functionality will not work via HTTP Functions)
const { createWebSocketServer } = require('./websocket-server');

// Import scaling configuration
const { initializeScaling, getResourceUsage } = require('./config/scaling'); // Keeping require for getResourceUsage if it's used elsewhere

// Initialize auto-scaling if enabled - MODIFIED for Functions
// In Firebase Functions, scaling is handled automatically.
// This clustering logic is not needed and can be safely bypassed.
// MOCK `cluster.isMaster` to `true` to prevent `server.listen` from executing when `server.js` is required.
const cluster = { isMaster: true };
// If `initializeScaling()` has side effects other than clustering, consider if it should be removed or adapted.
// For a typical serverless environment, this call might not be relevant or could cause issues if it tries to fork processes.
// You might want to comment out initializeScaling() call if it strictly ties to Node.js clustering.
// For now, we'll keep it but rely on the `cluster.isMaster` mock.
// initializeScaling(); 

// Skip server initialization if this is the master process in cluster mode - MODIFIED
// This entire block is now effectively bypassed by mocking `cluster.isMaster` to `true`
if (cluster && cluster.isMaster) {
  // This return prevents the rest of the server.js file from executing directly,
  // which is fine because `index.js` will export `app` separately.
  // We keep this to match the original structure, but it's effectively a no-op due to `cluster = { isMaster: true }`.
}

const app = express();

// Basic middleware
app.use(compressionMiddleware({
  level: 6, // Compression level (0-9)
  threshold: 1024 // Only compress responses larger than 1KB
})); // Enhanced compression
app.use(express.json({ limit: '1mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser()); // Required for CSRF cookies

// Logging middleware
app.use(performanceLogger);
app.use(requestLogger);

// Security middleware
app.use(helmet()); // Sets basic security headers
app.use(corsMiddleware()); // Custom CORS configuration
app.use(defaultSecurityHeaders); // Enhanced comprehensive security headers
app.use(defaultPreventNoSqlInjection); // Enhanced MongoDB injection prevention
app.use(defaultSanitizeInputs); // Enhanced input sanitization

// CSRF protection - enhanced version
app.use(defaultSetCsrfToken); // Set CSRF token cookie with rotation

// Apply global rate limiting
app.use(basicLimiter);

// Apply stricter rate limiting to authentication routes
app.use('/api/auth', authLimiter);

// Apply query optimization middleware globally
app.use(optimizeQuery());

// Apply Redis caching to public routes (30 minutes cache)
const publicRoutesCache = cacheResponse({ duration: 1800 });

// In development mode, skip CSRF verification for easier testing - MODIFIED for Functions
// For Firebase Functions, we assume production environment for CSRF verification.
const csrfMiddleware = defaultVerifyCsrfToken; 

// Routes with enhanced CSRF protection for non-GET requests
// Temporarily skipping CSRF for testing the 404 error
console.log('Mounting auth routes at /api/auth');
app.use('/api/auth', authRoutes); // REMOVED csrfMiddleware for testing
app.use('/api/blogs', csrfMiddleware, publicRoutesCache, blogRoutes);
app.use('/api/cashbacks', csrfMiddleware, publicRoutesCache, cashbackRoutes);
app.use('/api/coupons', csrfMiddleware, publicRoutesCache, couponRoutes);
app.use('/api/users', csrfMiddleware, userRoutes);
app.use('/api/admin', csrfMiddleware, adminRoutes);

// Analytics routes require API key authentication
app.use('/api/analytics', requireApiKey(['analytics', 'admin']), analyticsRoutes);

// Recommendation routes
app.use('/api/recommendations', csrfMiddleware, recommendationRoutes);

// Import monitoring and cache routes
const monitoringRoutes = require('./routes/monitoringRoutes');
const cacheRoutes = require('./routes/cacheRoutes');

// Monitoring and cache routes require API key authentication
app.use('/api/monitoring', requireApiKey(['admin']), monitoringRoutes);
app.use('/api/cache', requireApiKey(['admin']), cacheRoutes);

// External API routes with API key authentication
app.use('/api/external', requireApiKey(), (req, res) => {
  res.json({ success: true, message: 'External API access granted' });
});

// Enhanced API health check endpoint (Firebase Functions compatible)
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 
              mongoose.connection.readyState === 2 ? 'connecting' : 'disconnected'
    },
    environment: 'firebase-functions'
  };
  
  res.status(200).json(healthData);
});

// Simple root health check for Cloud Run health checks
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'CashHeros API' });
});

// Error logging middleware
app.use(errorLogger);

// Import error handler middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlerMiddleware');

// 404 handler for routes that don't exist
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Import database configuration
const { connectDatabase, createIndexes } = require('./config/database');
const monitoring = require('./utils/monitoring');
const cache = require('./utils/cache');

// Initialize database monitoring (non-blocking)
try {
  monitoring.initMonitoring();
} catch (error) {
  console.warn('Database monitoring initialization failed:', error.message);
}

// Connect to MongoDB asynchronously (completely non-blocking for Firebase Functions)
// This runs in the background and doesn't block the Express app from starting
setImmediate(() => {
  // Ensure we have the MONGO_URI before attempting connection
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    logger.error('MONGO_URI is not defined. Database connection skipped.');
    return;
  }
  
  connectDatabase(mongoUri)
    .then(async () => {
      logger.info('MongoDB connected');
      
      // Create database indexes in background
      createIndexes()
        .then(() => logger.info('Database indexes created successfully'))
        .catch((error) => logger.error('Error creating database indexes:', error));
    })
    .catch((err) => {
      logger.error('MongoDB connection error:', err);
      // Don't throw error to prevent function startup failure
    });
});

// Create HTTP server - REMOVED for Firebase Functions (handled by Functions runtime)
// const server = http.createServer(app);

// Initialize WebSocket server - REMOVED: Not supported by standard Firebase HTTP Functions
// const wsServer = createWebSocketServer(server);

// Make WebSocket server available globally - REMOVED: Not relevant
// app.set('wsServer', wsServer);

// Start Server - REMOVED: Functions runtime manages server startup
// const PORT = process.env.PORT || 5000;
// const WS_PORT = process.env.WS_PORT || 5001;
// server.listen(PORT, () => logger.info(`HTTP Server running on port ${PORT}`));

// Handle unhandled promise rejections & process termination - MODIFIED for Firebase Functions
// Process lifecycle and error handling are managed by Firebase Functions runtime.
// Keeping essential cleanup logic for DB/cache if needed.
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection (handled by Firebase Functions runtime):', err);
  gracefulShutdown(); // Call specific shutdown for DB/cache
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM received (handled by Firebase Functions runtime).');
    gracefulShutdown();
});
process.on('SIGINT', () => {
    logger.info('SIGINT received (handled by Firebase Functions runtime).');
    gracefulShutdown();
});


/**
 * Gracefully shut down the server and close connections
 * MODIFIED for Firebase Functions: Focus on DB/cache connections, as HTTP server and process exit are managed by Functions.
 */
async function gracefulShutdown() {
  logger.info('Shutting down gracefully...');
  
  try {
    // Close WebSocket connections - REMOVED / COMMENTED OUT (not supported by HTTP Functions)
    // if (wsServer && wsServer.clients) {
    //   wsServer.clients.forEach((client, userId) => {
    //     try {
    //       client.close(1000, 'Server shutting down');
    //     } catch (err) {
    //       logger.error(`Error closing WebSocket connection for user ${userId}:`, err);
    //     }
    //   });
    //   logger.info('WebSocket connections closed');
    // }
    
    // Close HTTP server - REMOVED / COMMENTED OUT (handled by Functions runtime)
    // await new Promise((resolve) => {
    //   server.close(resolve);
    // });
    // logger.info('HTTP server closed');
    
    // Close cache connections
    await cache.close();
    logger.info('Cache connections closed');
    
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('Database connection closed');
    }
    
    logger.info('Shutdown complete');
    // process.exit(0); // REMOVED: Functions runtime manages exit
  } catch (error) {
    logger.error('Error during shutdown:', error);
    // process.exit(1); // REMOVED: Functions runtime manages exit
  }
}

// Firebase Functions don't need direct server listening
// The Functions runtime handles HTTP server management

module.exports = app; // Export for Firebase Functions