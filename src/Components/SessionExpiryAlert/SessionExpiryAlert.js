import React, { useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './SessionExpiryAlert.css';

/**
 * SessionExpiryAlert Component
 * 
 * Displays an alert when the user's session is about to expire
 * and provides options to refresh the session or log out.
 */
const SessionExpiryAlert = () => {
  const { 
    sessionWarning, 
    clearSessionWarning, 
    refreshSession, 
    logout 
  } = useContext(AuthContext);

  // Handle session refresh
  const handleRefresh = useCallback(async () => {
    const success = await refreshSession();
    if (success) {
      clearSessionWarning();
    }
  }, [refreshSession, clearSessionWarning]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    clearSessionWarning();
  }, [logout, clearSessionWarning]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    clearSessionWarning();
  }, [clearSessionWarning]);

  if (!sessionWarning) {
    return null;
  }

  return (
    <div className="session-expiry-alert">
      <div className="session-expiry-alert-content">
        <div className="session-expiry-alert-header">
          <h3>Session Expiring Soon</h3>
          <button 
            className="session-expiry-alert-close" 
            onClick={handleDismiss}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="session-expiry-alert-body">
          <p>Your session is about to expire due to inactivity. Would you like to stay logged in?</p>
        </div>
        <div className="session-expiry-alert-footer">
          <button 
            className="session-expiry-alert-button session-expiry-alert-button-secondary" 
            onClick={handleLogout}
          >
            Log Out
          </button>
          <button 
            className="session-expiry-alert-button session-expiry-alert-button-primary" 
            onClick={handleRefresh}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryAlert;