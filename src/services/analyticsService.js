// src/services/analyticsService.js
import axios from 'axios';
import localforage from 'localforage';

// Configure analytics storage
const analyticsStorage = localforage.createInstance({
  name: 'cashHeros',
  storeName: 'analytics'
});

// Event types for tracking
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  COUPON_VIEW: 'coupon_view',
  COUPON_CLICK: 'coupon_click',
  COUPON_COPY: 'coupon_copy',
  STORE_VIEW: 'store_view',
  SEARCH: 'search',
  CATEGORY_FILTER: 'category_filter',
  SIGNUP: 'signup',
  LOGIN: 'login',
  ADD_TO_FAVORITES: 'add_to_favorites',
  REMOVE_FROM_FAVORITES: 'remove_from_favorites',
  CASHBACK_CLICK: 'cashback_click',
  SHARE: 'share',
  FEATURE_USE: 'feature_use',
  PREFERENCE_CHANGE: 'preference_change',
  ERROR: 'error',
  PERFORMANCE: 'performance',
};

// Analytics service for tracking user behavior
class AnalyticsService {
  constructor() {
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.isSending = false;
    this.initialized = false;
    this.consentGiven = false;
    this.trackingEnabled = true;
    this.performanceMetrics = {};
    
    // Initialize event listeners for online/offline status
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Initialize performance tracking
    if (window.performance && window.performance.timing) {
      this.trackPerformance();
    }
  }
  
  // Initialize analytics service
  async init() {
    if (this.initialized) return;
    
    try {
      // Load queued events from storage
      const storedEvents = await analyticsStorage.getItem('eventQueue') || [];
      this.queue = storedEvents;
      
      // Load user consent status
      const consentStatus = await analyticsStorage.getItem('analyticsConsent');
      this.consentGiven = consentStatus === true;
      
      // Load tracking preferences
      const trackingStatus = await analyticsStorage.getItem('trackingEnabled');
      this.trackingEnabled = trackingStatus !== false; // Default to true
      
      this.initialized = true;
      
      // Process queued events if online
      if (this.isOnline && this.queue.length > 0) {
        this.processQueue();
      }
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }
  
  // Set user ID for tracking
  setUserId(userId) {
    this.userId = userId;
    // Update user ID for all queued events
    this.queue = this.queue.map(event => ({
      ...event,
      userId: userId || event.userId
    }));
  }
  
  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           '_' + Date.now();
  }
  
  // Track user event
  trackEvent(eventType, eventData = {}) {
    if (!this.trackingEnabled || !this.consentGiven) {
      return;
    }
    
    const event = {
      eventType,
      eventData,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
    };
    
    this.queue.push(event);
    this.saveQueue();
    
    if (this.isOnline && !this.isSending) {
      this.processQueue();
    }
  }
  
  // Track page view
  trackPageView(pageName, pageData = {}) {
    this.trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
      pageName,
      ...pageData,
      path: window.location.pathname,
      title: document.title,
    });
  }
  
  // Track coupon interaction
  trackCouponInteraction(interactionType, couponData) {
    this.trackEvent(interactionType, {
      couponId: couponData.id,
      couponCode: couponData.code,
      couponTitle: couponData.title,
      storeId: couponData.storeId,
      storeName: couponData.storeName,
      discount: couponData.discount,
      category: couponData.category,
    });
  }
  
  // Track search
  trackSearch(query, resultsCount, filters = {}) {
    this.trackEvent(ANALYTICS_EVENTS.SEARCH, {
      query,
      resultsCount,
      filters,
    });
  }
  
  // Track feature usage
  trackFeatureUse(featureName, featureData = {}) {
    this.trackEvent(ANALYTICS_EVENTS.FEATURE_USE, {
      featureName,
      ...featureData,
    });
  }
  
  // Track error
  trackError(errorType, errorMessage, errorData = {}) {
    this.trackEvent(ANALYTICS_EVENTS.ERROR, {
      errorType,
      errorMessage,
      ...errorData,
    });
  }
  
  // Track performance metrics
  trackPerformance() {
    if (!window.performance) return;
    
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        const networkLatency = perfData.responseEnd - perfData.requestStart;
        
        this.performanceMetrics = {
          pageLoadTime,
          domReadyTime,
          networkLatency,
          timestamp: new Date().toISOString(),
        };
        
        this.trackEvent(ANALYTICS_EVENTS.PERFORMANCE, this.performanceMetrics);
      }, 0);
    });
    
    // Track client-side navigation performance for SPAs
    const originalPushState = window.history.pushState;
    window.history.pushState = (...args) => {
      originalPushState.apply(window.history, args);
      this.trackClientNavigation();
    };
    
    window.addEventListener('popstate', () => {
      this.trackClientNavigation();
    });
  }
  
  // Track client-side navigation performance
  trackClientNavigation() {
    const navigationStart = performance.now();
    
    // Wait for next tick to measure navigation completion
    setTimeout(() => {
      const navigationTime = performance.now() - navigationStart;
      
      this.trackEvent(ANALYTICS_EVENTS.PERFORMANCE, {
        navigationType: 'client',
        navigationTime,
        path: window.location.pathname,
      });
    }, 0);
  }
  
  // Process queued events
  async processQueue() {
    if (this.isSending || !this.isOnline || this.queue.length === 0) {
      return;
    }
    
    this.isSending = true;
    
    try {
      // Get batch of events (max 20)
      const batch = this.queue.slice(0, 20);
      
      // Send events to server
      await axios.post('/api/analytics/events', {
        events: batch,
      });
      
      // Remove sent events from queue
      this.queue = this.queue.slice(batch.length);
      this.saveQueue();
    } catch (error) {
      console.error('Failed to send analytics events:', error);
    } finally {
      this.isSending = false;
      
      // Continue processing if more events in queue
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }
  
  // Save queue to persistent storage
  async saveQueue() {
    try {
      await analyticsStorage.setItem('eventQueue', this.queue);
    } catch (error) {
      console.error('Failed to save analytics queue:', error);
    }
  }
  
  // Handle online status change
  handleOnline = () => {
    this.isOnline = true;
    if (this.queue.length > 0 && !this.isSending) {
      this.processQueue();
    }
  };
  
  // Handle offline status change
  handleOffline = () => {
    this.isOnline = false;
  };
  
  // Set user consent for tracking
  async setConsent(consentGiven) {
    this.consentGiven = consentGiven;
    try {
      await analyticsStorage.setItem('analyticsConsent', consentGiven);
      
      // Clear queue if consent withdrawn
      if (!consentGiven) {
        this.queue = [];
        this.saveQueue();
      }
    } catch (error) {
      console.error('Failed to save consent status:', error);
    }
  }
  
  // Enable or disable tracking
  async setTrackingEnabled(enabled) {
    this.trackingEnabled = enabled;
    try {
      await analyticsStorage.setItem('trackingEnabled', enabled);
    } catch (error) {
      console.error('Failed to save tracking preference:', error);
    }
  }
  
  // Get current tracking preferences
  getTrackingPreferences() {
    return {
      consentGiven: this.consentGiven,
      trackingEnabled: this.trackingEnabled,
    };
  }
  
  // Clean up resources
  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Initialize on import
analyticsService.init();

export default analyticsService;