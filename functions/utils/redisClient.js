/**
 * @module utils/redisClient
 * @description Redis client for caching frequently accessed data
 */

const Redis = require('ioredis');
const functions = require('firebase-functions');

// Check if Redis is enabled
const isRedisEnabled = functions.config().redis?.enabled === 'true';
let client = null;

if (isRedisEnabled) {
  // Create Redis client only if enabled
  const redisUrl = functions.config().redis?.url || 'redis://localhost:6379';
  client = new Redis(redisUrl, {
    retryStrategy: function(times) {
      if (times > 10) {
        // End reconnecting after 10 attempts
        return undefined;
      }
      // Reconnect after
      return Math.min(times * 100, 3000);
    }
  });

  // Handle Redis connection events
  client.on('connect', () => {
    console.log('Connected to Redis server');
  });

  client.on('error', (err) => {
    console.error('Redis error:', err);
  });
} else {
  console.log('Redis is disabled');
}

// ioredis methods are already promisified - only bind if client exists
const getAsync = client ? client.get.bind(client) : async () => null;
const setAsync = client ? client.set.bind(client) : async () => 'OK';
const delAsync = client ? client.del.bind(client) : async () => 0;
const flushAsync = client ? client.flushall.bind(client) : async () => 'OK';
const expireAsync = client ? client.expire.bind(client) : async () => 1;
const keysAsync = client ? client.keys.bind(client) : async () => [];
const hgetAsync = client ? client.hget.bind(client) : async () => null;
const hsetAsync = client ? client.hset.bind(client) : async () => 1;
const hgetallAsync = client ? client.hgetall.bind(client) : async () => ({});
const hdelAsync = client ? client.hdel.bind(client) : async () => 0;
const incrAsync = client ? client.incr.bind(client) : async () => 1;
const decrAsync = client ? client.decr.bind(client) : async () => 0;

/**
 * Cache middleware for Express routes
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Express middleware function
 */
const cache = (duration) => {
  return async (req, res, next) => {
    // Skip caching if Redis is disabled
    if (!isRedisEnabled) {
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated requests
    if (req.user) {
      return next();
    }

    // Generate a cache key based on the URL and query parameters
    const key = `api:${req.originalUrl || req.url}`;

    try {
      // Try to get cached response
      const cachedResponse = await getAsync(key);

      if (cachedResponse) {
        // Parse the cached response
        const parsedResponse = JSON.parse(cachedResponse);
        
        // Send the cached response
        return res.status(200).json(parsedResponse);
      }

      // If no cached response, continue to the route handler
      // Monkey patch res.json to cache the response
      const originalJson = res.json;
      res.json = function(body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Cache the response
          setAsync(key, JSON.stringify(body), 'EX', duration)
            .catch(err => console.error('Redis cache error:', err));
        }
        
        // Call the original json method
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Redis cache middleware error:', error);
      next();
    }
  };
};

/**
 * Clear cache for a specific key pattern
 * @param {string} pattern - Key pattern to clear (e.g., 'api:coupons:*')
 * @returns {Promise<number>} Number of keys cleared
 */
const clearCache = async (pattern) => {
  if (!isRedisEnabled) {
    return 0;
  }

  try {
    const keys = await keysAsync(pattern);
    
    if (keys.length > 0) {
      const pipeline = client.pipeline();
      keys.forEach(key => pipeline.del(key));
      await pipeline.exec();
    }
    
    return keys.length;
  } catch (error) {
    console.error('Redis clear cache error:', error);
    throw error;
  }
};

/**
 * Rate limiting using Redis
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests in the time window
 * @param {string} options.prefix - Key prefix for rate limiting
 * @returns {Function} Express middleware function
 */
const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute by default
    max = 100, // 100 requests per windowMs by default
    prefix = 'rate-limit:'
  } = options;

  return async (req, res, next) => {
    // Skip rate limiting if Redis is disabled
    if (!isRedisEnabled) {
      return next();
    }

    try {
      // Generate a key based on IP address or user ID
      const key = `${prefix}${req.ip || req.user?.userId || 'anonymous'}`;
      
      // Get current count
      let count = await getAsync(key);
      
      // If key doesn't exist, create it
      if (!count) {
        await setAsync(key, 1, 'EX', Math.floor(windowMs / 1000));
        count = 1;
      } else {
        // Increment count
        count = parseInt(count, 10) + 1;
        await setAsync(key, count, 'EX', Math.floor(windowMs / 1000));
      }
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
      
      // Check if limit is exceeded
      if (count > max) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }
      
      next();
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      next();
    }
  };
};

module.exports = {
  client,
  getAsync,
  setAsync,
  delAsync,
  flushAsync,
  expireAsync,
  keysAsync,
  hgetAsync,
  hsetAsync,
  hgetallAsync,
  hdelAsync,
  incrAsync,
  decrAsync,
  cache,
  clearCache,
  rateLimiter
};