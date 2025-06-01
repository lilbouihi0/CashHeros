// src/services/websocketService.js
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';

// WebSocket connection URL - should be configured based on environment
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5001';

// WebSocket event types
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  NEW_COUPON: 'new_coupon',
  COUPON_EXPIRING: 'coupon_expiring',
  CASHBACK_RECEIVED: 'cashback_received',
  REWARD_EARNED: 'reward_earned',
  OFFER_CLAIMED: 'offer_claimed',
  PRICE_DROP: 'price_drop',
  CUSTOM_OFFER: 'custom_offer',
  USER_NOTIFICATION: 'user_notification',
};

// WebSocket service for handling real-time connections
class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 seconds
    this.listeners = new Map();
    this.connected = false;
    this.connecting = false;
    this.userId = null;
    this.authToken = null;
  }

  // Initialize WebSocket connection
  connect(userId, authToken) {
    if (this.socket && (this.connected || this.connecting)) {
      return;
    }

    this.userId = userId;
    this.authToken = authToken;
    this.connecting = true;

    try {
      // Connect with authentication parameters
      this.socket = new WebSocket(`${WS_URL}?userId=${userId}&token=${authToken}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.notifyListeners(WS_EVENTS.CONNECT);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type && this.listeners.has(data.type)) {
            this.listeners.get(data.type).forEach(callback => callback(data.payload));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyListeners(WS_EVENTS.ERROR, error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.connected = false;
        this.connecting = false;
        this.notifyListeners(WS_EVENTS.DISCONNECT);
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      this.connecting = false;
      this.attemptReconnect();
    }
  }

  // Attempt to reconnect after connection failure
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId && this.authToken) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(this.userId, this.authToken);
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
      this.connecting = false;
      this.userId = null;
      this.authToken = null;
    }
  }

  // Subscribe to a specific event type
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  // Unsubscribe from a specific event type
  unsubscribe(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners of a specific event type
  notifyListeners(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => callback(data));
    }
  }

  // Send message to the server
  send(type, payload) {
    if (this.socket && this.connected) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  // Check if WebSocket is connected
  isConnected() {
    return this.connected;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

// React hook for using WebSocket in components
export const useWebSocket = () => {
  const { isAuthenticated, user, token } = useContext(AuthContext);
  const { showNotification } = useContext(AppContext);
  const [isConnected, setIsConnected] = useState(websocketService.isConnected());
  
  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && user && token) {
      websocketService.connect(user.id, token);
      
      // Setup listeners for connection status
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      
      websocketService.subscribe(WS_EVENTS.CONNECT, handleConnect);
      websocketService.subscribe(WS_EVENTS.DISCONNECT, handleDisconnect);
      
      // Setup notification listeners
      const handleNewCoupon = (data) => {
        showNotification(`New coupon available: ${data.title}`, 'info');
      };
      
      const handleCashbackReceived = (data) => {
        showNotification(`Cashback received: $${data.amount} from ${data.store}`, 'success');
      };
      
      const handleRewardEarned = (data) => {
        showNotification(`Reward earned: ${data.title}`, 'success');
      };
      
      const handleCustomOffer = (data) => {
        showNotification(`Special offer just for you: ${data.title}`, 'info');
      };
      
      const handleUserNotification = (data) => {
        showNotification(data.message, data.type || 'info');
      };
      
      // Subscribe to notification events
      websocketService.subscribe(WS_EVENTS.NEW_COUPON, handleNewCoupon);
      websocketService.subscribe(WS_EVENTS.CASHBACK_RECEIVED, handleCashbackReceived);
      websocketService.subscribe(WS_EVENTS.REWARD_EARNED, handleRewardEarned);
      websocketService.subscribe(WS_EVENTS.CUSTOM_OFFER, handleCustomOffer);
      websocketService.subscribe(WS_EVENTS.USER_NOTIFICATION, handleUserNotification);
      
      return () => {
        // Cleanup listeners on unmount
        websocketService.unsubscribe(WS_EVENTS.CONNECT, handleConnect);
        websocketService.unsubscribe(WS_EVENTS.DISCONNECT, handleDisconnect);
        websocketService.unsubscribe(WS_EVENTS.NEW_COUPON, handleNewCoupon);
        websocketService.unsubscribe(WS_EVENTS.CASHBACK_RECEIVED, handleCashbackReceived);
        websocketService.unsubscribe(WS_EVENTS.REWARD_EARNED, handleRewardEarned);
        websocketService.unsubscribe(WS_EVENTS.CUSTOM_OFFER, handleCustomOffer);
        websocketService.unsubscribe(WS_EVENTS.USER_NOTIFICATION, handleUserNotification);
      };
    } else {
      // Disconnect if not authenticated
      websocketService.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated, user, token, showNotification]);
  
  // Return WebSocket service and connection status
  return {
    isConnected,
    subscribe: websocketService.subscribe.bind(websocketService),
    unsubscribe: websocketService.unsubscribe.bind(websocketService),
    send: websocketService.send.bind(websocketService),
  };
};

export default websocketService;