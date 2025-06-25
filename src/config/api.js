/**
 * API Configuration
 * Centralized API endpoint configuration
 */

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    LOGOUT: '/auth/logout'
  },
  
  // User endpoints
  USERS: {
    PROFILE: '/users/profile',
    ACTIVITY: '/users/activity',
    FAVORITES: '/users/favorites'
  },
  
  // Cashback endpoints
  CASHBACK: {
    DASHBOARD: '/cashback/dashboard',
    REDEEM: '/cashback/redeem'
  },
  
  // Support endpoints
  SUPPORT: {
    TICKETS: '/support/tickets'
  },
  
  // Feedback endpoints
  FEEDBACK: {
    SUBMIT: '/feedback/submit',
    SUBMISSIONS: '/feedback/submissions'
  },
  
  // Admin endpoints
  ADMIN: {
    SYSTEM: '/admin/system',
    REPORTS: '/admin/reports/generate',
    ANALYTICS: {
      USER_ACTIVITY: '/admin/analytics/user-activity',
      COUPON_USAGE: '/admin/analytics/coupon-usage',
      CASHBACK_STATS: '/admin/analytics/cashback-stats'
    }
  },
  
  // General endpoints
  COUPONS: '/coupons',
  STORES: '/stores',
  CATEGORIES: '/categories',
  HEALTH: '/health'
};