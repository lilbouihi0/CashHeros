/**
 * @module utils/cache
 * @description Advanced caching system with in-memory and Redis support
 * 
 * This module provides caching functionality for frequently accessed data.
 * It supports in-memory caching and Redis caching with automatic fallback.
 */

const NodeCache = require('node-cache');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const { client: redisClient, getAsync, setAsync, delAsync, keysAsync } = require('./redisClient');

// Configuration
const config = {
  // Cache TTL in seconds
  defaultTTL: 60 * 60, // 1 hour
  
  // Redis configuration
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'cashheros:'
  }
};

// Create cache instances
const memoryCache = new NodeCache({
  stdTTL: config.defaultTTL,
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Don't clone objects (better performance)
});

// Use the Redis client from redisClient.js if enabled, otherwise null
const useRedis = config.redis.enabled && redisClient;

/**
 * Generate a cache key
 * @param {string} prefix - Key prefix
 * @param {Object} params - Parameters to include in the key
 * @returns {string} Cache key
 */
const generateKey = (prefix, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
  
  return `${prefix}:${JSON.stringify(sortedParams)}`;
};

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached data or null
 */
const get = async (key) => {
  // Try memory cache first
  const memoryData = memoryCache.get(key);
  if (memoryData !== undefined) {
    return memoryData;
  }
  
  // Try Redis if enabled
  if (useRedis) {
    try {
      const redisData = await getAsync(key);
      if (redisData) {
        const parsedData = JSON.parse(redisData);
        // Store in memory cache for faster access next time
        memoryCache.set(key, parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }
  }
  
  return null;
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} Success status
 */
const set = async (key, data, ttl = config.defaultTTL) => {
  // Set in memory cache
  memoryCache.set(key, data, ttl);
  
  // Set in Redis if enabled
  if (useRedis) {
    try {
      await setAsync(key, JSON.stringify(data), 'EX', ttl);
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }
  
  return true;
};

/**
 * Delete data from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
const del = async (key) => {
  // Delete from memory cache
  memoryCache.del(key);
  
  // Delete from Redis if enabled
  if (useRedis) {
    try {
      await delAsync(key);
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }
  
  return true;
};

/**
 * Clear cache by pattern
 * @param {string} pattern - Key pattern to clear
 * @returns {Promise<boolean>} Success status
 */
const clear = async (pattern) => {
  // Clear from memory cache
  const memoryKeys = memoryCache.keys();
  const matchingKeys = memoryKeys.filter(key => key.includes(pattern));
  memoryCache.del(matchingKeys);
  
  // Clear from Redis if enabled
  if (useRedis) {
    try {
      const redisKeys = await keysAsync(`${config.redis.keyPrefix}*${pattern}*`);
      
      if (redisKeys.length > 0) {
        // Remove prefix from keys
        const keysWithoutPrefix = redisKeys.map(key => 
          key.replace(config.redis.keyPrefix, '')
        );
        
        // Delete keys in batches to avoid blocking Redis
        const batchSize = 100;
        for (let i = 0; i < keysWithoutPrefix.length; i += batchSize) {
          const batch = keysWithoutPrefix.slice(i, i + batchSize);
          await delAsync(batch);
        }
      }
    } catch (error) {
      console.error('Redis clear error:', error);
      return false;
    }
  }
  
  return true;
};

/**
 * Get data from cache or execute function and cache the result
 * @param {string} key - Cache key
 * @param {Function} fn - Function to execute if cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} Data from cache or function
 */
const getOrSet = async (key, fn, ttl = config.defaultTTL) => {
  // Try to get from cache
  const cachedData = await get(key);
  
  if (cachedData !== null) {
    return cachedData;
  }
  
  // Execute function
  const data = await fn();
  
  // Cache the result
  await set(key, data, ttl);
  
  return data;
};

/**
 * Cache middleware for Express
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttl = config.defaultTTL) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Skip caching for authenticated requests
    if (req.user) {
      return next();
    }
    
    const key = generateKey(`route:${req.originalUrl}`, {});
    
    try {
      const cachedData = await get(key);
      
      if (cachedData !== null) {
        return res.json(cachedData);
      }
      
      // Store original json method
      const originalJson = res.json;
      
      // Override json method
      res.json = function(data) {
        // Restore original json method
        res.json = originalJson;
        
        // Cache the response
        set(key, data, ttl);
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Mongoose query cache plugin
 * @param {mongoose.Schema} schema - Mongoose schema
 */
const mongooseCachePlugin = (schema) => {
  schema.statics.cacheQuery = async function(query, options = {}) {
    const model = this;
    const modelName = model.modelName.toLowerCase();
    const queryStr = JSON.stringify(query);
    const optionsStr = JSON.stringify(options);
    const key = generateKey(`db:${modelName}`, { query: queryStr, options: optionsStr });
    const ttl = options.ttl || config.defaultTTL;
    
    return getOrSet(key, async () => {
      const result = await model.find(query, options.projection || {}, options);
      return result;
    }, ttl);
  };
  
  schema.statics.cacheAggregate = async function(pipeline, options = {}) {
    const model = this;
    const modelName = model.modelName.toLowerCase();
    const pipelineStr = JSON.stringify(pipeline);
    const optionsStr = JSON.stringify(options);
    const key = generateKey(`db:${modelName}:aggregate`, { pipeline: pipelineStr, options: optionsStr });
    const ttl = options.ttl || config.defaultTTL;
    
    return getOrSet(key, async () => {
      const result = await model.aggregate(pipeline).option(options);
      return result;
    }, ttl);
  };
};

/**
 * Clear cache when a model is updated
 * @param {mongoose.Schema} schema - Mongoose schema
 * @param {string} modelName - Model name
 */
const clearCacheOnUpdate = (schema, modelName) => {
  const clearModelCache = async () => {
    await clear(`db:${modelName.toLowerCase()}`);
  };
  
  schema.post('save', clearModelCache);
  schema.post('remove', clearModelCache);
  schema.post('findOneAndUpdate', clearModelCache);
  schema.post('findOneAndDelete', clearModelCache);
  schema.post('updateOne', clearModelCache);
  schema.post('updateMany', clearModelCache);
  schema.post('deleteOne', clearModelCache);
  schema.post('deleteMany', clearModelCache);
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
const getStats = async () => {
  const memoryStats = memoryCache.getStats();
  
  let redisStats = null;
  if (useRedis) {
    try {
      // Get Redis info through the client
      const info = await redisClient.info();
      const keyspace = await redisClient.info('keyspace');
      
      redisStats = {
        connected: redisClient.status === 'ready',
        info: info,
        keyspace: keyspace,
        keys: await keysAsync(`${config.redis.keyPrefix}*`),
        keyCount: (await keysAsync(`${config.redis.keyPrefix}*`)).length
      };
    } catch (error) {
      console.error('Redis stats error:', error);
      redisStats = { error: error.message };
    }
  }
  
  return {
    memory: memoryStats,
    redis: redisStats,
    config: {
      defaultTTL: config.defaultTTL,
      redisEnabled: config.redis.enabled
    }
  };
};

/**
 * Close cache connections
 */
const close = async () => {
  // Redis client is managed by redisClient.js
  // Just clear the memory cache
  memoryCache.flushAll();
  console.log('Memory cache cleared');
};

module.exports = {
  generateKey,
  get,
  set,
  del,
  clear,
  getOrSet,
  cacheMiddleware,
  mongooseCachePlugin,
  clearCacheOnUpdate,
  getStats,
  close
};