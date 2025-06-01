/**
 * Admin Authentication Service
 * 
 * This is a temporary service to enable admin login in development mode
 */

// Mock admin user data
const mockAdminUser = {
  id: 'admin1',
  userId: 'admin1', // Added userId to match expected format
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@cashheros.com',
  role: 'admin',
  permissions: ['manage_users', 'manage_content', 'manage_settings'],
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Generate a mock JWT token
const generateMockToken = (user, expiresIn = '24h') => {
  // Create a simple mock token with an expiration time
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (expiresIn === '24h' ? 86400 : parseInt(expiresIn, 10));
  
  // Create a base64-encoded payload
  const payload = btoa(JSON.stringify({
    sub: user.id,
    userId: user.id, // Added userId to match expected format
    email: user.email,
    role: user.role,
    exp
  }));
  
  // Return a mock JWT token
  return `mock.${payload}.signature`;
};

/**
 * Login with admin credentials
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise} - The response promise
 */
export const adminLogin = async (email, password) => {
  // For development, use mock data with admin role
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if using admin credentials
  const isAdmin = email === 'admin@cashheros.com' && password === 'admin123';
  
  if (!isAdmin) {
    throw new Error('Invalid admin credentials');
  }
  
  // Generate mock tokens
  const accessToken = generateMockToken(mockAdminUser);
  const refreshToken = generateMockToken(mockAdminUser, '7d');
  
  // Create mock response data with admin role
  const mockResponseData = {
    accessToken,
    refreshToken,
    user: mockAdminUser
  };
  
  // Store tokens in localStorage
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  // Store user data in localStorage for persistence
  localStorage.setItem('cachedUserProfile', JSON.stringify({ user: mockAdminUser }));
  localStorage.setItem('cachedUserProfileTimestamp', Date.now().toString());
  
  return mockResponseData;
};

/**
 * Get current admin user
 * @returns {Promise} - Promise that resolves to user data
 */
export const getCurrentUser = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if token exists
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw {
      response: {
        status: 401,
        data: {
          message: 'Not authenticated'
        }
      }
    };
  }
  
  // Check if we have a cached user profile
  const cachedUser = localStorage.getItem('cachedUserProfile');
  if (cachedUser) {
    try {
      const userData = JSON.parse(cachedUser);
      if (userData.user && userData.user.role === 'admin') {
        return userData;
      }
    } catch (e) {
      console.error('Error parsing cached user profile:', e);
    }
  }
  
  // Return mock admin user
  return {
    user: mockAdminUser
  };
};

/**
 * Refresh authentication token
 * @returns {Promise} - Promise that resolves to new token
 */
export const refreshAuthToken = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if refresh token exists
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw {
      response: {
        status: 401,
        data: {
          message: 'No refresh token'
        }
      }
    };
  }
  
  // Generate new access token
  const accessToken = generateMockToken(mockAdminUser);
  
  // Store new access token
  localStorage.setItem('accessToken', accessToken);
  
  return {
    accessToken,
    refreshToken, // Return the refresh token as well
    message: 'Token refreshed successfully'
  };
};

/**
 * Logout function
 * @returns {Promise} - Promise that resolves to logout status
 */
export const logout = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Remove tokens and user data from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('cachedUserProfile');
  localStorage.removeItem('cachedUserProfileTimestamp');
  
  return {
    message: 'Logout successful'
  };
};

export default {
  adminLogin,
  getCurrentUser,
  refreshAuthToken,
  logout
};