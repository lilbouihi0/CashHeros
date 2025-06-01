// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { AuthContext } from './AuthContext';

// Create context
export const AppContext = createContext();

// Custom hook for using the app context
export const useApp = () => useContext(AppContext);

// App state reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value
        }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: null
        }
      };
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {}
      };
    case 'SET_SUCCESS':
      return {
        ...state,
        success: {
          ...state.success,
          [action.payload.key]: action.payload.value
        }
      };
    case 'CLEAR_SUCCESS':
      return {
        ...state,
        success: {
          ...state.success,
          [action.payload.key]: null
        }
      };
    case 'CLEAR_ALL_SUCCESS':
      return {
        ...state,
        success: {}
      };
    case 'SET_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: action.payload.id || Date.now(),
            type: action.payload.type || 'info',
            message: action.payload.message,
            duration: action.payload.duration || 5000,
            timestamp: Date.now()
          }
        ]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload.id
        )
      };
    case 'SET_OFFLINE_MODE':
      return {
        ...state,
        isOffline: action.payload
      };
    case 'ADD_PENDING_ACTION':
      return {
        ...state,
        pendingActions: [
          ...state.pendingActions,
          {
            id: action.payload.id,
            type: action.payload.type,
            data: action.payload.data,
            timestamp: Date.now()
          }
        ]
      };
    case 'REMOVE_PENDING_ACTION':
      return {
        ...state,
        pendingActions: state.pendingActions.filter(
          action => action.id !== action.payload.id
        )
      };
    case 'SET_APP_READY':
      return {
        ...state,
        isAppReady: true
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  loading: {},
  errors: {},
  success: {},
  notifications: [],
  isOffline: !navigator.onLine,
  pendingActions: [],
  isAppReady: false
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated } = useContext(AuthContext);

  // Set loading state
  const setLoading = useCallback((key, value) => {
    dispatch({
      type: 'SET_LOADING',
      payload: { key, value }
    });
  }, []);

  // Set error state
  const setError = useCallback((key, value) => {
    dispatch({
      type: 'SET_ERROR',
      payload: { key, value }
    });

    // Auto-clear error after 5 seconds
    setTimeout(() => {
      clearError(key);
    }, 5000);
  }, []);

  // Clear error state
  const clearError = useCallback((key) => {
    dispatch({
      type: 'CLEAR_ERROR',
      payload: { key }
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  // Set success state
  const setSuccess = useCallback((key, value) => {
    dispatch({
      type: 'SET_SUCCESS',
      payload: { key, value }
    });

    // Auto-clear success message after 5 seconds
    setTimeout(() => {
      clearSuccess(key);
    }, 5000);
  }, []);

  // Clear success state
  const clearSuccess = useCallback((key) => {
    dispatch({
      type: 'CLEAR_SUCCESS',
      payload: { key }
    });
  }, []);

  // Clear all success messages
  const clearAllSuccess = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_SUCCESS' });
  }, []);

  // Show notification
  const showNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    
    dispatch({
      type: 'SET_NOTIFICATION',
      payload: { id, message, type, duration }
    });

    // Auto-remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: { id }
    });
  }, []);

  // Add pending action (for offline mode)
  const addPendingAction = useCallback((type, data) => {
    const id = Date.now();
    
    dispatch({
      type: 'ADD_PENDING_ACTION',
      payload: { id, type, data }
    });

    return id;
  }, []);

  // Remove pending action
  const removePendingAction = useCallback((id) => {
    dispatch({
      type: 'REMOVE_PENDING_ACTION',
      payload: { id }
    });
  }, []);

  // Set app as ready
  const setAppReady = useCallback(() => {
    dispatch({ type: 'SET_APP_READY' });
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_OFFLINE_MODE', payload: false });
      showNotification('You are back online!', 'success');
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_OFFLINE_MODE', payload: true });
      showNotification('You are offline. Some features may be limited.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotification]);

  // Set app as ready when auth is initialized
  useEffect(() => {
    // This would typically check for all required initializations
    // For now, we'll just set it to true after a short delay
    const timer = setTimeout(() => {
      setAppReady();
    }, 1000);

    return () => clearTimeout(timer);
  }, [setAppReady]);

  return (
    <AppContext.Provider
      value={{
        // State
        loading: state.loading,
        errors: state.errors,
        success: state.success,
        notifications: state.notifications,
        isOffline: state.isOffline,
        pendingActions: state.pendingActions,
        isAppReady: state.isAppReady,

        // Actions
        setLoading,
        setError,
        clearError,
        clearAllErrors,
        setSuccess,
        clearSuccess,
        clearAllSuccess,
        showNotification,
        removeNotification,
        addPendingAction,
        removePendingAction,

        // Helper methods
        isLoading: (key) => !!state.loading[key],
        hasError: (key) => !!state.errors[key],
        hasSuccess: (key) => !!state.success[key],
        getError: (key) => state.errors[key],
        getSuccess: (key) => state.success[key]
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;