/**
 * Cashback Service
 * 
 * Handles all cashback-related API calls
 */
import api from './api';

/**
 * Get all cashback offers with optional filtering
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} - The response promise
 */
export const getCashbackOffers = async (params = {}) => {
  const response = await api.get('/cashbacks', { 
    params,
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get a single cashback offer by ID
 * @param {string|number} id - Cashback offer ID
 * @returns {Promise} - The response promise
 */
export const getCashbackById = async (id) => {
  const response = await api.get(`/cashbacks/${id}`, {
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get cashback offers by store
 * @param {string|number} storeId - Store ID
 * @returns {Promise} - The response promise
 */
export const getCashbackByStore = async (storeId) => {
  const response = await api.get(`/cashbacks/store/${storeId}`, {
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get cashback offers by category
 * @param {string} category - Category name
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - The response promise
 */
export const getCashbackByCategory = async (category, params = {}) => {
  const response = await api.get(`/cashbacks/category/${category}`, { 
    params,
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Create a new cashback offer
 * @param {Object} cashbackData - Cashback offer data
 * @returns {Promise} - The response promise
 */
export const createCashback = async (cashbackData) => {
  const response = await api.post('/cashbacks', cashbackData);
  return response.data;
};

/**
 * Update an existing cashback offer
 * @param {string|number} id - Cashback offer ID
 * @param {Object} cashbackData - Updated cashback offer data
 * @returns {Promise} - The response promise
 */
export const updateCashback = async (id, cashbackData) => {
  const response = await api.put(`/cashbacks/${id}`, cashbackData);
  return response.data;
};

/**
 * Delete a cashback offer
 * @param {string|number} id - Cashback offer ID
 * @returns {Promise} - The response promise
 */
export const deleteCashback = async (id) => {
  const response = await api.delete(`/cashbacks/${id}`);
  return response.data;
};

/**
 * Get featured cashback offers
 * @param {number} limit - Number of offers to return
 * @returns {Promise} - The response promise
 */
export const getFeaturedCashbacks = async (limit = 10) => {
  const response = await api.get('/cashbacks/featured', { 
    params: { limit },
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get highest cashback offers
 * @param {number} limit - Number of offers to return
 * @returns {Promise} - The response promise
 */
export const getHighestCashbacks = async (limit = 10) => {
  const response = await api.get('/cashbacks/highest', { 
    params: { limit },
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get newest cashback offers
 * @param {number} limit - Number of offers to return
 * @returns {Promise} - The response promise
 */
export const getNewestCashbacks = async (limit = 10) => {
  const response = await api.get('/cashbacks/newest', { 
    params: { limit },
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Search cashback offers
 * @param {string} query - Search query
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - The response promise
 */
export const searchCashbacks = async (query, params = {}) => {
  const response = await api.get('/cashbacks/search', { 
    params: { query, ...params }
  });
  return response.data;
};

/**
 * Get cashback categories
 * @returns {Promise} - The response promise
 */
export const getCashbackCategories = async () => {
  const response = await api.get('/cashbacks/categories', {
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Track cashback click
 * @param {string|number} id - Cashback offer ID
 * @returns {Promise} - The response promise
 */
export const trackCashbackClick = async (id) => {
  const response = await api.post(`/cashbacks/${id}/track`);
  return response.data;
};

/**
 * Get user's cashback history
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} - The response promise
 */
export const getUserCashbackHistory = async (params = {}) => {
  const response = await api.get('/users/cashbacks/history', { params });
  return response.data;
};

/**
 * Get user's pending cashback
 * @returns {Promise} - The response promise
 */
export const getUserPendingCashback = async () => {
  const response = await api.get('/users/cashbacks/pending');
  return response.data;
};

/**
 * Get user's approved cashback
 * @returns {Promise} - The response promise
 */
export const getUserApprovedCashback = async () => {
  const response = await api.get('/users/cashbacks/approved');
  return response.data;
};

/**
 * Get user's total cashback
 * @returns {Promise} - The response promise
 */
export const getUserTotalCashback = async () => {
  const response = await api.get('/users/cashbacks/total');
  return response.data;
};

/**
 * Request cashback withdrawal
 * @param {Object} withdrawalData - Withdrawal request data
 * @returns {Promise} - The response promise
 */
export const requestCashbackWithdrawal = async (withdrawalData) => {
  const response = await api.post('/users/cashbacks/withdraw', withdrawalData);
  return response.data;
};

export default {
  getCashbackOffers,
  getCashbackById,
  getCashbackByStore,
  getCashbackByCategory,
  createCashback,
  updateCashback,
  deleteCashback,
  getFeaturedCashbacks,
  getHighestCashbacks,
  getNewestCashbacks,
  searchCashbacks,
  getCashbackCategories,
  trackCashbackClick,
  getUserCashbackHistory,
  getUserPendingCashback,
  getUserApprovedCashback,
  getUserTotalCashback,
  requestCashbackWithdrawal
};