/**
 * Store Service
 * 
 * Handles all store-related API calls
 */
import api from './api';

/**
 * Get all stores with optional filtering
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} - The response promise
 */
export const getStores = async (params = {}) => {
  const response = await api.get('/stores', { 
    params,
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get a single store by ID
 * @param {string|number} id - Store ID
 * @returns {Promise} - The response promise
 */
export const getStoreById = async (id) => {
  const response = await api.get(`/stores/${id}`, {
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get a store by slug/name
 * @param {string} slug - Store slug or name
 * @returns {Promise} - The response promise
 */
export const getStoreBySlug = async (slug) => {
  const response = await api.get(`/stores/slug/${slug}`, {
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get stores by category
 * @param {string} category - Category name
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - The response promise
 */
export const getStoresByCategory = async (category, params = {}) => {
  const response = await api.get(`/stores/category/${category}`, { 
    params,
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Create a new store
 * @param {Object} storeData - Store data
 * @returns {Promise} - The response promise
 */
export const createStore = async (storeData) => {
  const response = await api.post('/stores', storeData);
  return response.data;
};

/**
 * Update an existing store
 * @param {string|number} id - Store ID
 * @param {Object} storeData - Updated store data
 * @returns {Promise} - The response promise
 */
export const updateStore = async (id, storeData) => {
  const response = await api.put(`/stores/${id}`, storeData);
  return response.data;
};

/**
 * Delete a store
 * @param {string|number} id - Store ID
 * @returns {Promise} - The response promise
 */
export const deleteStore = async (id) => {
  const response = await api.delete(`/stores/${id}`);
  return response.data;
};

/**
 * Get featured stores
 * @param {number} limit - Number of stores to return
 * @returns {Promise} - The response promise
 */
export const getFeaturedStores = async (limit = 10) => {
  const response = await api.get('/stores/featured', { 
    params: { limit },
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get popular stores
 * @param {number} limit - Number of stores to return
 * @returns {Promise} - The response promise
 */
export const getPopularStores = async (limit = 10) => {
  const response = await api.get('/stores/popular', { 
    params: { limit },
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get newest stores
 * @param {number} limit - Number of stores to return
 * @returns {Promise} - The response promise
 */
export const getNewestStores = async (limit = 10) => {
  const response = await api.get('/stores/newest', { 
    params: { limit },
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Search stores
 * @param {string} query - Search query
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - The response promise
 */
export const searchStores = async (query, params = {}) => {
  const response = await api.get('/stores/search', { 
    params: { query, ...params }
  });
  return response.data;
};

/**
 * Get store categories
 * @returns {Promise} - The response promise
 */
export const getStoreCategories = async () => {
  const response = await api.get('/stores/categories', {
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get coupons for a store
 * @param {string|number} id - Store ID
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - The response promise
 */
export const getStoreCoupons = async (id, params = {}) => {
  const response = await api.get(`/stores/${id}/coupons`, { 
    params,
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get cashback offers for a store
 * @param {string|number} id - Store ID
 * @returns {Promise} - The response promise
 */
export const getStoreCashback = async (id) => {
  const response = await api.get(`/stores/${id}/cashback`, {
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get user's favorite stores
 * @returns {Promise} - The response promise
 */
export const getFavoriteStores = async () => {
  const response = await api.get('/users/stores/favorites');
  return response.data;
};

/**
 * Add a store to favorites
 * @param {string|number} id - Store ID
 * @returns {Promise} - The response promise
 */
export const addFavoriteStore = async (id) => {
  const response = await api.post(`/users/stores/${id}/favorite`);
  return response.data;
};

/**
 * Remove a store from favorites
 * @param {string|number} id - Store ID
 * @returns {Promise} - The response promise
 */
export const removeFavoriteStore = async (id) => {
  const response = await api.delete(`/users/stores/${id}/favorite`);
  return response.data;
};

export default {
  getStores,
  getStoreById,
  getStoreBySlug,
  getStoresByCategory,
  createStore,
  updateStore,
  deleteStore,
  getFeaturedStores,
  getPopularStores,
  getNewestStores,
  searchStores,
  getStoreCategories,
  getStoreCoupons,
  getStoreCashback,
  getFavoriteStores,
  addFavoriteStore,
  removeFavoriteStore
};