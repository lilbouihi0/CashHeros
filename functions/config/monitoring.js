/**
 * Monitoring and Alerting Configuration
 */

const winston = require('winston');
const functions = require('firebase-functions');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Environment configuration
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';

// Sentry configuration (if enabled)
let Sentry;
if (functions.config().monitoring?.sentry_dsn) {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: functions.config().monitoring.sentry_dsn,
    environment,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: null }), // Will be set later
      new Sentry.Integrations.Mongo()
    ]
  });
}

// Custom format for console logs
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : ''}`;
});

// Create Winston logger
const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'cashheros-backend' },
  transports: [
    // Write logs to files in production and staging
    ...(isProduction || isStaging ? [
      new transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 10
      }),
      new transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 10485760, // 10MB
        maxFiles: 10
      })
    ] : []),
    
    // Console transport for all environments
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        consoleFormat
      )
    })
  ]
});

// Add CloudWatch transport in production if configured
if (isProduction && functions.config().aws?.cloudwatch_enabled === 'true') {
  const CloudWatchTransport = require('winston-cloudwatch');
  
  logger.add(new CloudWatchTransport({
    logGroupName: functions.config().aws?.cloudwatch_group || 'cashheros-backend',
    logStreamName: `${environment}-${new Date().toISOString().split('T')[0]}`,
    awsAccessKeyId: functions.config().aws?.access_key_id,
    awsSecretKey: functions.config().aws?.secret_access_key,
    awsRegion: functions.config().aws?.region || 'us-east-1',
    messageFormatter: ({ level, message, ...meta }) => JSON.stringify({
      level,
      message,
      ...meta
    })
  }));
}

// Health check function
const healthCheck = async () => {
  const mongoose = require('mongoose');
  const Redis = require('ioredis');
  
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    version: functions.config().app?.version || '1.0.0',
    services: {
      database: {
        status: 'unknown'
      }
    }
  };
  
  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.ping();
      
      checks.services.database = {
        status: result.ok === 1 ? 'ok' : 'error',
        latency: result.ok === 1 ? result.operationTime.getTime() : null
      };
    } else {
      checks.services.database = {
        status: 'error',
        message: 'Database not connected'
      };
      checks.status = 'error';
    }
  } catch (error) {
    checks.services.database = {
      status: 'error',
      message: error.message
    };
    checks.status = 'error';
  }
  
  // Check Redis connection if enabled
  if (functions.config().redis?.enabled === 'true') {
    checks.services.redis = {
      status: 'unknown'
    };
    
    try {
      const redis = new Redis({
        host: functions.config().redis?.host,
        port: functions.config().redis?.port,
        password: functions.config().redis?.password || undefined
      });
      
      const startTime = Date.now();
      const result = await redis.ping();
      const latency = Date.now() - startTime;
      
      checks.services.redis = {
        status: result === 'PONG' ? 'ok' : 'error',
        latency
      };
      
      redis.disconnect();
    } catch (error) {
      checks.services.redis = {
        status: 'error',
        message: error.message
      };
      checks.status = 'error';
    }
  }
  
  // Check disk space
  try {
    const { execSync } = require('child_process');
    const diskInfo = execSync('df -h / | tail -1').toString().trim().split(/\s+/);
    
    checks.services.disk = {
      status: 'ok',
      usage: diskInfo[4],
      available: diskInfo[3]
    };
    
    // Alert if disk usage is above 85%
    const diskUsage = parseInt(diskInfo[4].replace('%', ''));
    if (diskUsage > 85) {
      checks.services.disk.status = 'warning';
      
      if (diskUsage > 95) {
        checks.services.disk.status = 'error';
        checks.status = 'error';
      }
    }
  } catch (error) {
    checks.services.disk = {
      status: 'unknown',
      message: 'Could not check disk space'
    };
  }
  
  // Check memory usage
  checks.services.memory = {
    status: 'ok',
    usage: process.memoryUsage()
  };
  
  // If any service is in error state, the overall status is error
  for (const service in checks.services) {
    if (checks.services[service].status === 'error') {
      checks.status = 'error';
      break;
    }
  }
  
  return checks;
};

// Setup monitoring middleware for Express
const setupMonitoring = (app) => {
  // Set up Sentry request handler
  if (Sentry) {
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }
  
  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const healthStatus = await healthCheck();
      
      // Set appropriate status code
      const statusCode = healthStatus.status === 'ok' ? 200 : 
                         healthStatus.status === 'warning' ? 200 : 500;
      
      res.status(statusCode).json(healthStatus);
      
      // Log health check results if there are issues
      if (healthStatus.status !== 'ok') {
        logger.warn('Health check warning', healthStatus);
      }
    } catch (error) {
      logger.error('Health check error', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Detailed health check for admin
  app.get('/health/detailed', async (req, res) => {
    // Check if request has admin authorization
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== functions.config().admin?.api_key) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const healthStatus = await healthCheck();
      
      // Add more detailed information for admin
      healthStatus.env = {
        node_env: process.env.NODE_ENV,
        node_version: process.version,
        uptime: process.uptime()
      };
      
      // Add process info
      healthStatus.process = {
        pid: process.pid,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      };
      
      res.json(healthStatus);
    } catch (error) {
      logger.error('Detailed health check error', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Set up Sentry error handler
  if (Sentry) {
    app.use(Sentry.Handlers.errorHandler());
  }
  
  // Log all requests in development
  if (!isProduction) {
    app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
      });
      
      next();
    });
  }
  
  // Log all errors
  app.use((err, req, res, next) => {
    logger.error('Express error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
    
    next(err);
  });
};

module.exports = {
  logger,
  Sentry,
  setupMonitoring,
  healthCheck
};