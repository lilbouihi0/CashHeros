/**
 * @module utils/redisClient
 * @description Redis client for caching frequently accessed data
 */

const Redis = require('ioredis');
require('dotenv').config();

// Create Redis client
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = new Redis(redisUrl, {
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

// ioredis methods are already promisified
const getAsync = client.get.bind(client);
const setAsync = client.set.bind(client);
const delAsync = client.del.bind(client);
const flushAsync = client.flushall.bind(client);
const expireAsync = client.expire.bind(client);
const keysAsync = client.keys.bind(client);
const hgetAsync = client.hget.bind(client);
const hsetAsync = client.hset.bind(client);
const hgetallAsync = client.hgetall.bind(client);
const hdelAsync = client.hdel.bind(client);
const incrAsync = client.incr.bind(client);
const decrAsync = client.decr.bind(client);

/**
 * Cache middleware for Express routes
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Express middleware function
 */
const cache = (duration) => {
  return async (req, res, next) => {
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