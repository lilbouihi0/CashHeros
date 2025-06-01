// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
require('dotenv').config();

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

// Import WebSocket server
const { createWebSocketServer } = require('./websocket-server');

// Import scaling configuration
const { initializeScaling, getResourceUsage } = require('./config/scaling');

// Initialize auto-scaling if enabled
const cluster = initializeScaling();

// Skip server initialization if this is the master process in cluster mode
if (cluster && cluster.isMaster) {
  return;
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

// In development mode, skip CSRF verification for easier testing
const csrfMiddleware = process.env.NODE_ENV === 'production' ? defaultVerifyCsrfToken : (req, res, next) => next();

// Routes with enhanced CSRF protection for non-GET requests
app.use('/api/auth', csrfMiddleware, authRoutes);
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

// Enhanced API health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    },
    resources: getResourceUsage()
  };
  
  res.status(200).json(healthData);
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

// Initialize database monitoring
monitoring.initMonitoring();

// Connect to MongoDB
connectDatabase()
  .then(async () => {
    logger.info('MongoDB connected');
    
    // Create database indexes
    try {
      await createIndexes();
      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating database indexes:', error);
    }
  })
  .catch((err) => logger.error('MongoDB connection error:', err));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wsServer = createWebSocketServer(server);

// Make WebSocket server available globally
app.set('wsServer', wsServer);

// Start Server
const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 5001;

server.listen(PORT, () => logger.info(`HTTP Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  gracefulShutdown();
});

// Handle SIGTERM and SIGINT (Ctrl+C)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * Gracefully shut down the server and close connections
 */
async function gracefulShutdown() {
  logger.info('Shutting down gracefully...');
  
  try {
    // Close WebSocket connections
    if (wsServer && wsServer.clients) {
      wsServer.clients.forEach((client, userId) => {
        try {
          client.close(1000, 'Server shutting down');
        } catch (err) {
          logger.error(`Error closing WebSocket connection for user ${userId}:`, err);
        }
      });
      logger.info('WebSocket connections closed');
    }
    
    // Close HTTP server
    await new Promise((resolve) => {
      server.close(resolve);
    });
    logger.info('HTTP server closed');
    
    // Close cache connections
    await cache.close();
    logger.info('Cache connections closed');
    
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('Database connection closed');
    }
    
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

module.exports = app; // Export for testing