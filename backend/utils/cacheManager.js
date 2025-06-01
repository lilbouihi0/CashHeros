/**
 * @module utils/cacheManager
 * @description Manages cache invalidation strategies
 */

const { clearCache } = require('./redisClient');

/**
 * Cache key patterns for different resources
 */
const CACHE_KEYS = {
  COUPONS: 'api:coupons:*',
  STORES: 'api:stores:*',
  CATEGORIES: 'api:categories:*',
  DEALS: 'api:deals:*',
  CASHBACK: 'api:cashback:*',
  POPULAR: 'api:popular:*',
  TRENDING: 'api:trending:*',
  SEARCH: 'api:search:*',
  HOME: 'api:home:*',
  ALL: 'api:*'
};

/**
 * Clear cache for coupons
 * @param {string} [couponId] - Specific coupon ID (optional)
 * @returns {Promise<number>} Number of keys cleared
 */
const clearCouponCache = async (couponId) => {
  if (couponId) {
    // Clear specific coupon cache
    return await clearCache(`api:coupons:${couponId}*`);
  }
  
  // Clear all coupon-related caches
  const couponKeys = await clearCache(CACHE_KEYS.COUPONS);
  const homeKeys = await clearCache(CACHE_KEYS.HOME);
  const popularKeys = await clearCache(CACHE_KEYS.POPULAR);
  const trendingKeys = await clearCache(CACHE_KEYS.TRENDING);
  
  return couponKeys + homeKeys + popularKeys + trendingKeys;
};

/**
 * Clear cache for stores
 * @param {string} [storeId] - Specific store ID (optional)
 * @returns {Promise<number>} Number of keys cleared
 */
const clearStoreCache = async (storeId) => {
  if (storeId) {
    // Clear specific store cache
    return await clearCache(`api:stores:${storeId}*`);
  }
  
  // Clear all store-related caches
  const storeKeys = await clearCache(CACHE_KEYS.STORES);
  const homeKeys = await clearCache(CACHE_KEYS.HOME);
  
  return storeKeys + homeKeys;
};

/**
 * Clear cache for categories
 * @param {string} [categoryId] - Specific category ID (optional)
 * @returns {Promise<number>} Number of keys cleared
 */
const clearCategoryCache = async (categoryId) => {
  if (categoryId) {
    // Clear specific category cache
    return await clearCache(`api:categories:${categoryId}*`);
  }
  
  // Clear all category-related caches
  const categoryKeys = await clearCache(CACHE_KEYS.CATEGORIES);
  const homeKeys = await clearCache(CACHE_KEYS.HOME);
  
  return categoryKeys + homeKeys;
};

/**
 * Clear cache for deals
 * @param {string} [dealId] - Specific deal ID (optional)
 * @returns {Promise<number>} Number of keys cleared
 */
const clearDealCache = async (dealId) => {
  if (dealId) {
    // Clear specific deal cache
    return await clearCache(`api:deals:${dealId}*`);
  }
  
  // Clear all deal-related caches
  const dealKeys = await clearCache(CACHE_KEYS.DEALS);
  const homeKeys = await clearCache(CACHE_KEYS.HOME);
  const popularKeys = await clearCache(CACHE_KEYS.POPULAR);
  
  return dealKeys + homeKeys + popularKeys;
};

/**
 * Clear cache for cashback offers
 * @param {string} [cashbackId] - Specific cashback ID (optional)
 * @returns {Promise<number>} Number of keys cleared
 */
const clearCashbackCache = async (cashbackId) => {
  if (cashbackId) {
    // Clear specific cashback cache
    return await clearCache(`api:cashback:${cashbackId}*`);
  }
  
  // Clear all cashback-related caches
  const cashbackKeys = await clearCache(CACHE_KEYS.CASHBACK);
  const homeKeys = await clearCache(CACHE_KEYS.HOME);
  
  return cashbackKeys + homeKeys;
};

/**
 * Clear search cache
 * @param {string} [query] - Specific search query (optional)
 * @returns {Promise<number>} Number of keys cleared
 */
const clearSearchCache = async (query) => {
  if (query) {
    // Clear specific search query cache
    return await clearCache(`api:search:${encodeURIComponent(query)}*`);
  }
  
  // Clear all search-related caches
  return await clearCache(CACHE_KEYS.SEARCH);
};

/**
 * Clear all caches
 * @returns {Promise<number>} Number of keys cleared
 */
const clearAllCache = async () => {
  return await clearCache(CACHE_KEYS.ALL);
};

/**
 * Cache invalidation middleware for Mongoose
 * Automatically clears relevant caches when documents are modified
 * @param {Object} model - Mongoose model
 * @param {Function} clearCacheFunction - Function to clear cache
 * @returns {void}
 */
const setupCacheInvalidation = (model, clearCacheFunction) => {
  // Clear cache after save
  model.post('save', async function() {
    await clearCacheFunction(this._id);
  });
  
  // Clear cache after update
  model.post('findOneAndUpdate', async function(doc) {
    if (doc) {
      await clearCacheFunction(doc._id);
    }
  });
  
  // Clear cache after delete
  model.post('findOneAndDelete', async function(doc) {
    if (doc) {
      await clearCacheFunction(doc._id);
    }
  });
  
  // Clear cache after deleteMany
  model.post('deleteMany', async function() {
    await clearCacheFunction();
  });
};

module.exports = {
  CACHE_KEYS,
  clearCouponCache,
  clearStoreCache,
  clearCategoryCache,
  clearDealCache,
  clearCashbackCache,
  clearSearchCache,
  clearAllCache,
  setupCacheInvalidation
};