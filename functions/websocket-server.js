// backend/websocket-server.js
const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
const functions = require('firebase-functions');
const { logger } = require('./middleware/loggingMiddleware');
// require('dotenv').config(); // COMMENTED OUT: Not needed for Firebase Functions

// WebSocket event types
const WS_EVENTS = {
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

// Create WebSocket server
const createWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ noServer: true });
  
  // Store active connections
  const clients = new Map();
  
  // Handle new WebSocket connection
  wss.on('connection', (ws, request, userId) => {
    logger.info(`WebSocket connection established for user: ${userId}`);
    
    // Store client connection with userId
    clients.set(userId, ws);
    
    // Send welcome message
    sendToClient(ws, WS_EVENTS.USER_NOTIFICATION, {
      message: 'Connected to real-time notifications',
      type: 'success'
    });
    
    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        logger.info(`Received message from user ${userId}:`, data);
        
        // Handle different message types here
        // This is where you would implement specific message handling logic
      } catch (error) {
        logger.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle connection close
    ws.on('close', () => {
      logger.info(`WebSocket connection closed for user: ${userId}`);
      clients.delete(userId);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      logger.error(`WebSocket error for user ${userId}:`, error);
      clients.delete(userId);
    });
  });
  
  // Handle HTTP server upgrade (WebSocket handshake)
  server.on('upgrade', (request, socket, head) => {
    const { pathname, query } = url.parse(request.url, true);
    
    // Only handle WebSocket connections to the /ws endpoint
    if (pathname === '/ws') {
      // Authenticate the connection
      authenticateConnection(request, query)
        .then(userId => {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request, userId);
          });
        })
        .catch(error => {
          logger.error('WebSocket authentication failed:', error);
          socket.destroy();
        });
    } else {
      socket.destroy();
    }
  });
  
  // Authenticate WebSocket connection using JWT
  const authenticateConnection = async (request, query) => {
    try {
      const { userId, token } = query;
      
      if (!userId || !token) {
        throw new Error('Missing userId or token');
      }
      
      // Verify JWT token
      const decoded = jwt.verify(token, functions.config().secrets.jwt_secret);
      
      if (decoded.id !== userId) {
        throw new Error('User ID mismatch');
      }
      
      return userId;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  };
  
  // Send message to a specific client
  const sendToClient = (client, type, payload) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, payload }));
    }
  };
  
  // Send message to a specific user
  const sendToUser = (userId, type, payload) => {
    const client = clients.get(userId);
    if (client) {
      sendToClient(client, type, payload);
      return true;
    }
    return false;
  };
  
  // Broadcast message to all connected clients
  const broadcast = (type, payload, excludeUserId = null) => {
    clients.forEach((client, userId) => {
      if (excludeUserId !== userId) {
        sendToClient(client, type, payload);
      }
    });
  };
  
  // Send notification about new coupon
  const notifyNewCoupon = (couponData, targetUserIds = null) => {
    if (targetUserIds) {
      // Send to specific users
      targetUserIds.forEach(userId => {
        sendToUser(userId, WS_EVENTS.NEW_COUPON, couponData);
      });
    } else {
      // Broadcast to all users
      broadcast(WS_EVENTS.NEW_COUPON, couponData);
    }
  };
  
  // Send notification about cashback received
  const notifyCashbackReceived = (userId, cashbackData) => {
    sendToUser(userId, WS_EVENTS.CASHBACK_RECEIVED, cashbackData);
  };
  
  // Send notification about reward earned
  const notifyRewardEarned = (userId, rewardData) => {
    sendToUser(userId, WS_EVENTS.REWARD_EARNED, rewardData);
  };
  
  // Send custom notification to user
  const sendUserNotification = (userId, message, type = 'info') => {
    sendToUser(userId, WS_EVENTS.USER_NOTIFICATION, { message, type });
  };
  
  // Return public API
  return {
    clients,
    sendToUser,
    broadcast,
    notifyNewCoupon,
    notifyCashbackReceived,
    notifyRewardEarned,
    sendUserNotification,
    WS_EVENTS
  };
};

module.exports = { createWebSocketServer };