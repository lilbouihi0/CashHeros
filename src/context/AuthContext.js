import { createContext, useState, useEffect, useCallback, useReducer, useContext } from 'react';
import api from '../services/api';
import authService from '../services/authService';
import { handleApiError } from '../utils/errorHandler';

// Temporary JWT decode function until the package is installed
const jwtDecode = (token) => {
  try {
    // Check if token is null or undefined
    if (!token) {
      console.warn('Token is null or undefined');
      return { exp: 0 }; // Return a default expiration time of 0
    }
    
    // Split the token into header, payload, and signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    // Decode the payload (middle part)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return { exp: 0 }; // Return a default expiration time of 0
  }
};

// Auth reducer for more predictable state updates
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null,
        isAuthenticated: true
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SESSION_WARNING':
      return {
        ...state,
        sessionWarning: true
      };
    case 'CLEAR_SESSION_WARNING':
      return {
        ...state,
        sessionWarning: false
      };
    default:
      return state;
  }
};

// Initial auth state
const initialAuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
  initialized: false,
  sessionWarning: false
};

export const AuthContext = createContext();

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [initialized, setInitialized] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [sessionRefreshInterval, setSessionRefreshInterval] = useState(null);

  // Clear error message
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Clear session warning
  const clearSessionWarning = useCallback(() => {
    dispatch({ type: 'CLEAR_SESSION_WARNING' });
  }, []);

  // Set up session timeout based on token expiry
  const setupSessionTimeout = useCallback((token) => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    if (sessionRefreshInterval) {
      clearInterval(sessionRefreshInterval);
    }

    try {
      // Decode JWT to get expiration time
      const decoded = jwtDecode(token);
      const expiresIn = decoded.exp * 1000 - Date.now();
      
      // Set timeout to warn user before session expires
      if (expiresIn > 0) {
        // Warn 2 minutes before expiry
        const warningTime = Math.max(expiresIn - (2 * 60 * 1000), 0); 
        
        const timeout = setTimeout(() => {
          // Dispatch session expiry warning
          dispatch({ type: 'SESSION_WARNING' });
        }, warningTime);
        
        setSessionTimeout(timeout);

        // Set up auto refresh interval (refresh token every 10 minutes)
        const refreshInterval = setInterval(async () => {
          try {
            // Only refresh if we're more than 15 minutes from expiry
            const timeToExpiry = decoded.exp * 1000 - Date.now();
            if (timeToExpiry < 15 * 60 * 1000 && timeToExpiry > 0) {
              await refreshUserSession();
            }
          } catch (error) {
            console.error('Error refreshing session:', error);
          }
        }, 10 * 60 * 1000); // Check every 10 minutes
        
        setSessionRefreshInterval(refreshInterval);
      }
    } catch (error) {
      console.error('Error setting up session timeout:', error);
    }
  }, [sessionTimeout, sessionRefreshInterval]);

  // Helper function to add delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Refresh user session with rate limit handling
  const refreshUserSession = useCallback(async (retryCount = 0) => {
    try {
      // If we've already retried too many times, back off
      if (retryCount > 2) {
        console.log('Too many refresh attempts, backing off');
        return false;
      }
      
      const result = await authService.refreshAuthToken();
      
      if (result.accessToken) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: state.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken || state.refreshToken
          }
        });

        // Set up new session timeout
        setupSessionTimeout(result.accessToken);
        
        // Clear any session warnings
        dispatch({ type: 'CLEAR_SESSION_WARNING' });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      
      // If rate limited, wait and retry with exponential backoff
      if (error.response?.status === 429 && retryCount < 3) {
        const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited during session refresh. Retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/3)`);
        
        // Wait for the backoff period
        await delay(backoffDelay);
        
        // Retry with incremented count
        return refreshUserSession(retryCount + 1);
      }
      
      return false;
    }
  }, [state.user, state.refreshToken, setupSessionTimeout]);

  // Check if user is already logged in on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token && isMounted) {
        dispatch({ type: 'AUTH_START' });
        
        try {
          // Add a small delay to avoid rate limiting on initial load
          // This is especially important if multiple components are mounting at the same time
          await delay(1500);
          
          // Check if component is still mounted after delay
          if (!isMounted) return;
          
          const userData = await authService.getCurrentUser();
          
          if (!isMounted) return;
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: userData.user,
              accessToken: token,
              refreshToken: localStorage.getItem('refreshToken')
            }
          });

          // Set up session timeout
          setupSessionTimeout(token);
        } catch (error) {
          if (!isMounted) return;
          
          console.error('Error checking authentication:', error);
          
          // Clear tokens if they're invalid
          if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            dispatch({ type: 'AUTH_LOGOUT' });
          } else if (error.response?.status === 429) {
            // For rate limiting, don't show an error, just mark as initialized
            // The cached user profile will be used if available
            console.log('Rate limited during auth check, continuing with cached data if available');
            
            // Try to use cached user data
            const cachedUser = localStorage.getItem('cachedUserProfile');
            if (cachedUser) {
              const userData = JSON.parse(cachedUser);
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                  user: userData.user,
                  accessToken: token,
                  refreshToken: localStorage.getItem('refreshToken')
                }
              });
              
              // Set up session timeout
              setupSessionTimeout(token);
            } else {
              // If no cached data, just mark as initialized but don't show error
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          } else {
            dispatch({
              type: 'AUTH_FAILURE',
              payload: 'Failed to authenticate. Please log in again.'
            });
          }
        } finally {
          if (isMounted) {
            setInitialized(true);
          }
        }
      } else if (isMounted) {
        setInitialized(true);
      }
    };

    checkAuth();

    // Clean up on unmount
    return () => {
      isMounted = false;
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
      if (sessionRefreshInterval) {
        clearInterval(sessionRefreshInterval);
      }
    };
  }, [setupSessionTimeout, sessionTimeout, sessionRefreshInterval]);

  // Login function
  const handleLogin = async (email, password, rememberMe = false) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const result = await authService.login(email, password, rememberMe);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });

      // Set up session timeout
      setupSessionTimeout(result.accessToken);

      return result;
    } catch (error) {
      const parsedError = handleApiError(error);
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: parsedError.message
      });
      
      throw parsedError;
    }
  };

  // Signup function
  const handleSignup = async (userData) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const result = await authService.register(userData);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });

      // Set up session timeout
      setupSessionTimeout(result.accessToken);

      return result;
    } catch (error) {
      // If the error is already formatted by authService, use it directly
      // This prevents double-parsing which can cause error type changes
      const parsedError = error.type ? error : handleApiError(error);
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: parsedError.message
      });
      
      throw parsedError;
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear session timeout
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }
      
      if (sessionRefreshInterval) {
        clearInterval(sessionRefreshInterval);
        setSessionRefreshInterval(null);
      }
      
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Forgot password function
  const handleForgotPassword = async (email) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const result = await authService.requestPasswordReset(email);
      dispatch({ type: 'SET_LOADING', payload: false });
      return result;
    } catch (error) {
      const parsedError = handleApiError(error);
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: parsedError.message
      });
      
      throw parsedError;
    }
  };

  // Reset password function
  const handleResetPassword = async (token, password) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const result = await authService.resetPassword(token, password);
      dispatch({ type: 'SET_LOADING', payload: false });
      return result;
    } catch (error) {
      const parsedError = handleApiError(error);
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: parsedError.message
      });
      
      throw parsedError;
    }
  };

  // Verify email function
  const handleVerifyEmail = async (token) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const result = await authService.verifyEmail(token);
      
      // If user is logged in, update their verified status
      if (state.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: { emailVerified: true }
        });
      }
      
      return result;
    } catch (error) {
      const parsedError = handleApiError(error);
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: parsedError.message
      });
      
      throw parsedError;
    }
  };

  // Resend verification email function
  const handleResendVerificationEmail = async () => {
    dispatch({ type: 'AUTH_START' });

    try {
      // This endpoint doesn't exist in our service yet, but we'll add it
      const result = await api.post('/auth/resend-verification');
      dispatch({ type: 'SET_LOADING', payload: false });
      return result.data;
    } catch (error) {
      const parsedError = handleApiError(error);
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: parsedError.message
      });
      
      throw parsedError;
    }
  };

  // Update profile function
  const handleUpdateProfile = async (userData) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const result = await authService.updateProfile(userData);
      
      dispatch({
        type: 'UPDATE_USER',
        payload: result.user
      });
      
      return result;
    } catch (error) {
      const parsedError = handleApiError(error);
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: parsedError.message
      });
      
      throw parsedError;
    }
  };

  // Change password function
  const handleChangePassword = async (currentPassword, newPassword) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      dispatch({ type: 'SET_LOADING', payload: false });
      return result;
    } catch (error) {
      const parsedError = handleApiError(error);
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: parsedError.message
      });
      
      throw parsedError;
    }
  };

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return state.user && state.user.role === role;
  }, [state.user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    return state.user && state.user.permissions && 
           state.user.permissions.includes(permission);
  }, [state.user]);

  // Get user's authentication status
  const getAuthStatus = useCallback(() => {
    return {
      isAuthenticated: state.isAuthenticated,
      isAdmin: hasRole('admin'),
      isVerified: state.user?.emailVerified || false,
      isLoading: state.loading,
      isInitialized: initialized,
      sessionWarning: state.sessionWarning
    };
  }, [state.isAuthenticated, state.loading, state.user, initialized, hasRole, state.sessionWarning]);

  return (
    <AuthContext.Provider
      value={{
        // State
        user: state.user,
        loading: state.loading,
        error: state.error,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        initialized,
        sessionWarning: state.sessionWarning,
        
        // Auth methods
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
        forgotPassword: handleForgotPassword,
        resetPassword: handleResetPassword,
        verifyEmail: handleVerifyEmail,
        resendVerificationEmail: handleResendVerificationEmail,
        updateProfile: handleUpdateProfile,
        changePassword: handleChangePassword,
        refreshSession: refreshUserSession,
        clearError,
        clearSessionWarning,
        
        // Helper methods
        hasRole,
        hasPermission,
        getAuthStatus,
        
        // API instance for components to use
        api
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};