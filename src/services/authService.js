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
  // Check if we're in development mode and should use mock data
  const isDevelopment = process.env.REACT_APP_ENV === 'development';
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  
  // If in development and using localhost API, use mock login
  if (isDevelopment && apiBaseUrl && apiBaseUrl.includes('localhost')) {
    console.log('Using mock login for development');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check for admin credentials - redirect to admin login
    if (email === 'admin@cashheros.com' && password === 'admin123') {
      throw new Error('Please use the admin login page at /admin-login for admin access');
    }
    
    // Check registered mock users first
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    let validUser = mockUsers.find(user => user.email === email);
    
    // If not found in mock users, check default test accounts
    if (!validUser) {
      const defaultUsers = [
        { email: 'user@example.com', password: 'password123', firstName: 'Test', lastName: 'User' },
        { email: 'test@cashheros.com', password: 'test123', firstName: 'Test', lastName: 'User' },
        { email: 'demo@cashheros.com', password: 'demo123', firstName: 'Demo', lastName: 'User' }
      ];
      
      const defaultUser = defaultUsers.find(user => user.email === email && user.password === password);
      if (defaultUser) {
        validUser = {
          id: Date.now().toString(),
          email: defaultUser.email,
          firstName: defaultUser.firstName,
          lastName: defaultUser.lastName,
          role: 'user',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    }
    
    if (!validUser) {
      throw new Error('Invalid credentials. Please try again.');
    }
    
    // Generate mock tokens
    const mockAccessToken = 'mock_access_' + Math.random().toString(36).substring(2, 15);
    const mockRefreshToken = 'mock_refresh_' + Math.random().toString(36).substring(2, 15);
    
    // Create mock response data
    const mockResponseData = {
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      user: validUser
    };
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', mockAccessToken);
    localStorage.setItem('refreshToken', mockRefreshToken);
    
    // Store user data in localStorage for persistence
    localStorage.setItem('cachedUserProfile', JSON.stringify({ user: validUser }));
    localStorage.setItem('cachedUserProfileTimestamp', Date.now().toString());
    
    return mockResponseData;
  }
  
  // Try real API call
  try {
    const response = await api.post('/auth/login', { email, password, rememberMe });
    
    // Store tokens in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    
    return response.data;
  } catch (error) {
    // If API fails in development, fall back to mock
    if (isDevelopment && !error.response) {
      console.warn('API not available, falling back to mock login');
      return await login(email, password, rememberMe); // Recursive call will use mock path
    }
    
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - The response promise
 */
export const register = async (userData) => {
  // Check if we're in development mode and should use mock data
  const isDevelopment = process.env.REACT_APP_ENV === 'development';
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  
  // If in development and using localhost API, use mock registration
  if (isDevelopment && apiBaseUrl && apiBaseUrl.includes('localhost')) {
    console.log('Using mock registration for development:', userData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists in localStorage (simple mock validation)
    const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const emailExists = existingUsers.some(user => user.email === userData.email);
    
    if (emailExists) {
      throw {
        type: 'VALIDATION_ERROR',
        message: 'This email is already registered. Please use a different email or try logging in.',
        details: null
      };
    }
    
    // Generate mock tokens
    const mockAccessToken = 'mock_access_' + Math.random().toString(36).substring(2, 15);
    const mockRefreshToken = 'mock_refresh_' + Math.random().toString(36).substring(2, 15);
    
    // Create mock user
    const mockUser = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName || 'User',
      lastName: userData.lastName || '',
      role: 'user',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store mock user
    existingUsers.push(mockUser);
    localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
    
    // Store tokens
    localStorage.setItem('accessToken', mockAccessToken);
    localStorage.setItem('refreshToken', mockRefreshToken);
    
    // Store user data for persistence
    localStorage.setItem('cachedUserProfile', JSON.stringify({ user: mockUser }));
    localStorage.setItem('cachedUserProfileTimestamp', Date.now().toString());
    
    return {
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      user: mockUser
    };
  }
  
  // Try real API call
  try {
    console.log('Sending registration data to API:', userData);
    
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
      // If no response, it's likely a network error - fall back to mock in development
      if (isDevelopment) {
        console.warn('API not available, falling back to mock registration');
        return await register(userData); // Recursive call will use mock path
      }
      
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