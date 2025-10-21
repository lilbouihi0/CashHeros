const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

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
const { createRateLimiter, basicLimiter, apiLimiter, authLimiter, csrfLimiter } = require('./middleware/rateLimitMiddleware');
const { defaultSanitizeInputs, defaultPreventNoSqlInjection } = require('./middleware/sanitizationMiddleware');
const { defaultSecurityHeaders } = require('./middleware/securityHeadersMiddleware');
const { requireApiKey } = require('./middleware/apiKeyMiddleware');
const { cacheResponse } = require('./middleware/queryMiddleware');
const { requestLogger, performanceLogger, errorLogger } = require('./middleware/loggingMiddleware');
const compressionMiddleware = require('./middleware/compressionMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlerMiddleware');

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

const app = express();

// Basic middleware
app.use(compressionMiddleware({ level: 6, threshold: 1024 }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Logging middleware
app.use(performanceLogger);
app.use(requestLogger);

// Security middleware
app.use(helmet());
app.use(corsMiddleware());
app.use(defaultSecurityHeaders);
app.use(defaultPreventNoSqlInjection);
app.use(defaultSanitizeInputs);

// Rate limiting
app.use(basicLimiter);
app.use('/api/auth', authLimiter);

// Caching
const publicRoutesCache = cacheResponse({ duration: 1800 });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', publicRoutesCache, blogRoutes);
app.use('/api/cashbacks', publicRoutesCache, cashbackRoutes);
app.use('/api/coupons', publicRoutesCache, couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', requireApiKey(['analytics', 'admin']), analyticsRoutes);
app.use('/api/recommendations', requireApiKey(['analytics', 'admin']), recommendationRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'CashHeros API is running successfully!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error logging middleware
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

exports.api = app;