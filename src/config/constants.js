/**
 * Application Constants
 */

// API base URL - use environment variable if available, otherwise default to empty string
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// Authentication constants
export const AUTH_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Blog categories
export const BLOG_CATEGORIES = [
  'Deals', 
  'Savings Tips', 
  'Shopping Guide', 
  'Cashback', 
  'Coupons', 
  'Lifestyle', 
  'Technology', 
  'Fashion', 
  'Travel', 
  'Food'
];

// Feature flags
export const FEATURES = {
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: false,
  DARK_MODE: true,
  ANALYTICS: true
};

// Cache durations
export const CACHE_DURATIONS = {
  USER_PROFILE: 30 * 60 * 1000, // 30 minutes
  STORE_LIST: 60 * 60 * 1000, // 1 hour
  COUPON_LIST: 15 * 60 * 1000, // 15 minutes
  BLOG_LIST: 30 * 60 * 1000 // 30 minutes
};