/**
 * Coupon Service
 * 
 * Handles all coupon-related API calls
 */
import api from './api';

/**
 * Get all coupons with optional filtering
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise} - The response promise
 */
export const getCoupons = async (params = {}) => {
  const response = await api.get('/coupons', { params });
  return response.data;
};

/**
 * Get a single coupon by ID
 * @param {string|number} id - Coupon ID
 * @returns {Promise} - The response promise
 */
export const getCouponById = async (id) => {
  const response = await api.get(`/coupons/${id}`);
  return response.data;
};

/**
 * Get coupons by brand
 * @param {string} brand - Brand name
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - The response promise
 */
export const getCouponsByBrand = async (brand, params = {}) => {
  const response = await api.get(`/coupons/brand/${brand}`, { 
    params,
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get coupons by category
 * @param {string} category - Category name
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - The response promise
 */
export const getCouponsByCategory = async (category, params = {}) => {
  const response = await api.get(`/coupons/category/${category}`, { 
    params,
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Create a new coupon
 * @param {Object} couponData - Coupon data
 * @returns {Promise} - The response promise
 */
export const createCoupon = async (couponData) => {
  const response = await api.post('/coupons', couponData);
  return response.data;
};

/**
 * Update an existing coupon
 * @param {string|number} id - Coupon ID
 * @param {Object} couponData - Updated coupon data
 * @returns {Promise} - The response promise
 */
export const updateCoupon = async (id, couponData) => {
  const response = await api.put(`/coupons/${id}`, couponData);
  return response.data;
};

/**
 * Delete a coupon
 * @param {string|number} id - Coupon ID
 * @returns {Promise} - The response promise
 */
export const deleteCoupon = async (id) => {
  const response = await api.delete(`/coupons/${id}`);
  return response.data;
};

/**
 * Verify a coupon code
 * @param {string} code - Coupon code to verify
 * @returns {Promise} - The response promise
 */
export const verifyCouponCode = async (code) => {
  const response = await api.post('/coupons/verify', { code });
  return response.data;
};

/**
 * Track coupon usage
 * @param {string|number} id - Coupon ID
 * @returns {Promise} - The response promise
 */
export const trackCouponUsage = async (id) => {
  const response = await api.post(`/coupons/${id}/track`);
  return response.data;
};

/**
 * Get trending coupons
 * @param {number} limit - Number of coupons to return
 * @returns {Promise} - The response promise
 */
export const getTrendingCoupons = async (limit = 10) => {
  const response = await api.get('/coupons/trending', { 
    params: { limit },
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get expiring soon coupons
 * @param {number} days - Number of days until expiration
 * @param {number} limit - Number of coupons to return
 * @returns {Promise} - The response promise
 */
export const getExpiringSoonCoupons = async (days = 7, limit = 10) => {
  const response = await api.get('/coupons/expiring-soon', { 
    params: { days, limit },
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Get newest coupons
 * @param {number} limit - Number of coupons to return
 * @returns {Promise} - The response promise
 */
export const getNewestCoupons = async (limit = 10) => {
  const response = await api.get('/coupons/newest', { 
    params: { limit },
    // Enable offline caching for this endpoint
    offlineMode: 'cache-first'
  });
  return response.data;
};

/**
 * Search coupons
 * @param {string} query - Search query
 * @param {Object} params - Additional query parameters
 * @returns {Promise} - The response promise
 */
export const searchCoupons = async (query, params = {}) => {
  const response = await api.get('/coupons/search', { 
    params: { query, ...params }
  });
  return response.data;
};

/**
 * Get user's saved coupons
 * @returns {Promise} - The response promise
 */
export const getSavedCoupons = async () => {
  const response = await api.get('/users/coupons/saved');
  return response.data;
};

/**
 * Save a coupon
 * @param {string|number} id - Coupon ID
 * @returns {Promise} - The response promise
 */
export const saveCoupon = async (id) => {
  const response = await api.post(`/users/coupons/${id}/save`);
  return response.data;
};

/**
 * Unsave a coupon
 * @param {string|number} id - Coupon ID
 * @returns {Promise} - The response promise
 */
export const unsaveCoupon = async (id) => {
  const response = await api.delete(`/users/coupons/${id}/save`);
  return response.data;
};

export default {
  getCoupons,
  getCouponById,
  getCouponsByBrand,
  getCouponsByCategory,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  verifyCouponCode,
  trackCouponUsage,
  getTrendingCoupons,
  getExpiringSoonCoupons,
  getNewestCoupons,
  searchCoupons,
  getSavedCoupons,
  saveCoupon,
  unsaveCoupon
};