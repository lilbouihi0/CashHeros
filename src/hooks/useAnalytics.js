// src/hooks/useAnalytics.js
import { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService, { ANALYTICS_EVENTS } from '../services/analyticsService';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook for using analytics in React components
 */
export const useAnalytics = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useContext(AuthContext);
  
  // Set user ID when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      analyticsService.setUserId(user.id);
    }
  }, [isAuthenticated, user]);
  
  // Track page views on route change
  useEffect(() => {
    const pageName = getPageNameFromPath(location.pathname);
    analyticsService.trackPageView(pageName, {
      path: location.pathname,
      search: location.search,
    });
  }, [location.pathname, location.search]);
  
  // Helper to get page name from path
  const getPageNameFromPath = (path) => {
    // Remove leading slash and split by remaining slashes
    const parts = path.substring(1).split('/');
    
    // Use first part as page name, or 'home' if empty
    const pageName = parts[0] || 'home';
    
    // Convert to title case
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  };
  
  // Return analytics methods for use in components
  return {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackCouponInteraction: analyticsService.trackCouponInteraction.bind(analyticsService),
    trackSearch: analyticsService.trackSearch.bind(analyticsService),
    trackFeatureUse: analyticsService.trackFeatureUse.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
    setConsent: analyticsService.setConsent.bind(analyticsService),
    setTrackingEnabled: analyticsService.setTrackingEnabled.bind(analyticsService),
    getTrackingPreferences: analyticsService.getTrackingPreferences.bind(analyticsService),
    ANALYTICS_EVENTS,
  };
};

export default useAnalytics;