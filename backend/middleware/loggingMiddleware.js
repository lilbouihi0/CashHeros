/**
 * Logging Middleware
 * 
 * This middleware provides request logging and performance monitoring.
 */

const morgan = require('morgan');
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a stream for Morgan
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Custom Morgan token for response time in a more readable format
morgan.token('response-time-formatted', (req, res) => {
  const time = res.responseTime;
  if (time < 10) return `${time.toFixed(2)}ms`;
  if (time < 100) return `${time.toFixed(1)}ms`;
  if (time < 1000) return `${Math.round(time)}ms`;
  return `${(time / 1000).toFixed(2)}s`;
});

// Custom Morgan token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user.userId : 'anonymous';
});

// Custom Morgan token for request body (sanitized)
morgan.token('request-body', (req) => {
  if (!req.body) return '';
  
  // Create a sanitized copy of the request body
  const sanitized = { ...req.body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) sanitized[field] = '[REDACTED]';
  });
  
  return JSON.stringify(sanitized);
});

// Custom Morgan format
const morganFormat = process.env.NODE_ENV === 'production'
  ? ':remote-addr - :user-id [:date[iso]] ":method :url HTTP/:http-version" :status :response-time-formatted ":referrer" ":user-agent"'
  : ':method :url :status :response-time-formatted - :user-id';

/**
 * Request logging middleware
 */
const requestLogger = morgan(morganFormat, {
  stream: morganStream,
  skip: (req) => {
    // Skip logging for health check endpoints
    return req.url.includes('/health') || req.url.includes('/ping');
  }
});

/**
 * Performance monitoring middleware
 * Tracks response time for each request
 */
const performanceLogger = (req, res, next) => {
  const start = process.hrtime();
  
  // Add response time tracking
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to milliseconds
    res.responseTime = time;
    
    // Log slow requests
    if (time > 1000) { // Requests taking more than 1 second
      logger.warn({
        message: 'Slow request detected',
        method: req.method,
        url: req.originalUrl,
        responseTime: time,
        userId: req.user ? req.user.userId : 'anonymous'
      });
    }
  });
  
  next();
};

/**
 * Error logging middleware
 */
const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user ? req.user.userId : 'anonymous',
    body: req.body
  });
  
  next(err);
};

module.exports = {
  logger,
  requestLogger,
  performanceLogger,
  errorLogger
};