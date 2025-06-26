const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');

// Firebase Functions config mapping
const functions = require('firebase-functions');

// Set default environment variables for Firebase Functions
try {
  if (functions.config().database && functions.config().database.mongo_uri) {
    process.env.MONGO_URI = functions.config().database.mongo_uri;
  }
  if (functions.config().secrets) {
    if (functions.config().secrets.jwt_secret) {
      process.env.JWT_SECRET = functions.config().secrets.jwt_secret;
    }
    if (functions.config().secrets.jwt_refresh_secret) {
      process.env.JWT_REFRESH_SECRET = functions.config().secrets.jwt_refresh_secret;
    }
  }
  if (functions.config().frontend) {
    if (functions.config().frontend.cors_origin) {
      process.env.CORS_ORIGIN = functions.config().frontend.cors_origin;
    }
    if (functions.config().frontend.url) {
      process.env.FRONTEND_URL = functions.config().frontend.url;
    }
  }
  if (functions.config().email) {
    if (functions.config().email.user) {
      process.env.EMAIL_USER = functions.config().email.user;
    }
    if (functions.config().email.password) {
      process.env.EMAIL_PASSWORD = functions.config().email.password;
    }
    if (functions.config().email.service) {
      process.env.EMAIL_SERVICE = functions.config().email.service;
    }
  }
  if (functions.config().redis && functions.config().redis.enabled) {
    process.env.REDIS_ENABLED = functions.config().redis.enabled;
  }
} catch (error) {
  console.warn('Firebase Functions config not available, using defaults:', error.message);
  // Set fallback values for development/testing
  process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cashheros';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-for-development';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-for-development';
}

// Explicitly set NODE_ENV for functions
process.env.NODE_ENV = 'production';

const app = express();

// Basic middleware
app.use(compression({ level: 6, threshold: 1024 }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(helmet());

// Enhanced CORS middleware - Fixed to handle multiple origins properly
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  
  // Handle CORS_ORIGIN environment variable (can be comma-separated)
  if (process.env.CORS_ORIGIN) {
    const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    
    // Check if the request origin is in the allowed origins list
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      // Set the specific origin that made the request, not all allowed origins
      res.header('Access-Control-Allow-Origin', requestOrigin || allowedOrigins[0]);
    } else {
      // Origin not allowed - don't set CORS headers
      console.warn('CORS blocked request from origin:', requestOrigin);
      return res.status(403).json({ error: 'Origin not allowed by CORS policy' });
    }
  } else {
    // Fallback: allow all origins (for development)
    res.header('Access-Control-Allow-Origin', requestOrigin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'CashHeros API' });
});

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

// Import and mount routes (with error handling)
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes loaded');
} catch (error) {
  console.error('Failed to load auth routes:', error.message);
}

try {
  const blogRoutes = require('./routes/blogRoutes');
  app.use('/api/blogs', blogRoutes);
} catch (error) {
  console.error('Failed to load blog routes:', error.message);
}

try {
  const cashbackRoutes = require('./routes/cashbackRoutes');
  app.use('/api/cashbacks', cashbackRoutes);
} catch (error) {
  console.error('Failed to load cashback routes:', error.message);
}

try {
  const couponRoutes = require('./routes/couponRoutes');
  app.use('/api/coupons', couponRoutes);
} catch (error) {
  console.error('Failed to load coupon routes:', error.message);
}

try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
} catch (error) {
  console.error('Failed to load user routes:', error.message);
}

try {
  const adminRoutes = require('./routes/adminRoutes');
  app.use('/api/admin', adminRoutes);
} catch (error) {
  console.error('Failed to load admin routes:', error.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database connection asynchronously (non-blocking)
const initializeDatabase = async () => {
  try {
    const { connectDatabase, createIndexes } = require('./config/database');
    
    await connectDatabase();
    console.log('MongoDB connected');
    
    // Create indexes in background
    createIndexes()
      .then(() => console.log('Database indexes created successfully'))
      .catch((error) => console.error('Error creating database indexes:', error));
      
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

// Start database initialization in background
setImmediate(initializeDatabase);

module.exports = app;