/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls
 */
import api from './api';

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to remember the user
 * @returns {Promise} - The response promise
 */
export const login = async (email, password, rememberMe = false) => {
  // For development, use mock data instead of making API calls
  // This prevents 404 errors when the backend is not available
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check for admin credentials - redirect to admin login
  if (email === 'admin@cashheros.com' && password === 'admin123') {
    throw new Error('Please use the admin login page at /admin-login for admin access');
  }
  
  // Validate user credentials - in development mode, we'll accept only these test accounts
  const validUsers = [
    { email: 'user@example.com', password: 'password123' },
    { email: 'test@cashheros.com', password: 'test123' },
    { email: 'demo@cashheros.com', password: 'demo123' }
  ];
  
  const isValidUser = validUsers.some(user => 
    user.email === email && user.password === password
  );
  
  if (!isValidUser) {
    throw new Error('Invalid credentials. Please try again.');
  }
  
  // Generate mock tokens
  const mockAccessToken = 'mock_access_' + Math.random().toString(36).substring(2, 15);
  const mockRefreshToken = 'mock_refresh_' + Math.random().toString(36).substring(2, 15);
  
  // Create mock response data
  const mockResponseData = {
    accessToken: mockAccessToken,
    refreshToken: mockRefreshToken,
    user: {
      id: '1',
      email: email,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  // Store tokens in localStorage
  localStorage.setItem('accessToken', mockAccessToken);
  localStorage.setItem('refreshToken', mockRefreshToken);
  
  // Store user data in localStorage for persistence
  localStorage.setItem('cachedUserProfile', JSON.stringify({ user: mockResponseData.user }));
  localStorage.setItem('cachedUserProfileTimestamp', Date.now().toString());
  
  return mockResponseData;
  
  /* Commented out actual API call for development
  const response = await api.post('/auth/login', { email, password, rememberMe });
  
  // Store tokens in localStorage
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
  }
  
  return response.data;
  */
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - The response promise
 */
export const register = async (userData) => {
  try {
    console.log('Sending registration data to API:', userData);
    
    // We'll skip the health check as it might be causing additional rate limiting issues
    
    const response = await api.post('/auth/register', userData);
    console.log('Registration API response:', response.data);
    
    // Store tokens in localStorage if they're returned
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration API error:', error);
    
    // If it's already a formatted error from our error handler, just rethrow it
    if (error.type) {
      throw error;
    }
    
    // Check for specific error types
    if (!error.response) {
      throw {
        type: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check if the backend server is running.',
        details: null,
        originalError: error
      };
    }
    
    if (error.response.status === 400) {
      // Special handling for "User already exists" error
      if (error.response.data.message === 'User already exists') {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'This email is already registered. Please use a different email or try logging in.',
          details: null,
          originalError: error
        };
      } else {
        throw {
          type: 'VALIDATION_ERROR',
          message: error.response.data.message || 'Please check your input and try again.',
          details: error.response.data.errors || null,
          originalError: error
        };
      }
    }
    
    if (error.response.status === 429) {
      throw {
        type: 'RATE_LIMIT_ERROR',
        message: error.response.data.message || 'Too many requests. Please try again later.',
        details: error.response.data || null,
        originalError: error
      };
    }
    
    throw error;
  }
};

/**
 * Logout the current user
 * @returns {Promise} - The response promise
 */
export const logout = async () => {
  // Get refresh token to invalidate on server
  const refreshToken = localStorage.getItem('refreshToken');
  
  // Clear tokens from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Only call the API if we have a refresh token
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with client-side logout even if server request fails
    }
  }
  
  return { success: true };
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} - The response promise
 */
export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} password - New password
 * @returns {Promise} - The response promise
 */
export const resetPassword = async (token, password) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
};

/**
 * Verify email with token
 * @param {string} token - Email verification token
 * @returns {Promise} - The response promise
 */
export const verifyEmail = async (token) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

/**
 * Get current user profile with caching
 * @returns {Promise} - The response promise
 */
export const getCurrentUser = async () => {
  // Check if we have a cached user profile and it's less than 5 minutes old
  const cachedUser = localStorage.getItem('cachedUserProfile');
  const cachedTimestamp = localStorage.getItem('cachedUserProfileTimestamp');
  
  if (cachedUser && cachedTimestamp) {
    const cacheAge = Date.now() - parseInt(cachedTimestamp, 10);
    // Use cache if it's less than 5 minutes old
    if (cacheAge < 5 * 60 * 1000) {
      console.log('Using cached user profile');
      return JSON.parse(cachedUser);
    }
  }
  
  try {
    // For development, use mock data instead of making API calls
    // This prevents 404 errors when the backend is not available
    const mockUserData = {
      user: {
        id: '1',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Cache the mock user profile
    localStorage.setItem('cachedUserProfile', JSON.stringify(mockUserData));
    localStorage.setItem('cachedUserProfileTimestamp', Date.now().toString());
    
    return mockUserData;
    
    /* Commented out actual API call for development
    const response = await api.get('/auth/me', {
      // This will use the retry logic in api.js
      retryCount: 0
    });
    
    // Cache the user profile
    localStorage.setItem('cachedUserProfile', JSON.stringify(response.data));
    localStorage.setItem('cachedUserProfileTimestamp', Date.now().toString());
    
    return response.data;
    */
  } catch (error) {
    // If we have a cached profile and get a rate limit error, use the cache regardless of age
    if (error.response?.status === 429 && cachedUser) {
      console.log('Rate limited, using cached user profile as fallback');
      return JSON.parse(cachedUser);
    }
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} - The response promise
 */
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} - The response promise
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/change-password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

/**
 * Refresh the authentication token with retry logic
 * @returns {Promise} - The response promise
 */
export const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    // For development, use mock data instead of making API calls
    // This prevents 404 errors when the backend is not available
    
    // Generate a mock token
    const mockToken = 'mock_' + Math.random().toString(36).substring(2, 15);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Store the mock token
    localStorage.setItem('accessToken', mockToken);
    
    return {
      accessToken: mockToken,
      refreshToken: refreshToken
    };
    
    /* Commented out actual API call for development
    // Use the retry option from api.js
    const response = await api.post('/auth/refresh', 
      { refreshToken },
      { retryCount: 0 } // This enables the retry logic in api.js
    );
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    
    return response.data;
    */
  } catch (error) {
    // If rate limited, throw a specific error
    if (error.response?.status === 429) {
      throw {
        response: error.response,
        message: 'Rate limit exceeded for token refresh',
        status: 429
      };
    }
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - Whether the user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

/**
 * Get the current authentication token
 * @returns {string|null} - The current token or null
 */
export const getToken = () => {
  return localStorage.getItem('accessToken');
};

export default {
  login,
  register,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  updateProfile,
  changePassword,
  refreshAuthToken,
  isAuthenticated,
  getToken
};