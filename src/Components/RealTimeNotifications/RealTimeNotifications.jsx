import React, { useEffect, useState } from 'react';
import { useWebSocket, WS_EVENTS } from '../../services/websocketService';
import { useApp } from '../../context/AppContext';
import styles from './RealTimeNotifications.module.css';
import { FaBell, FaCircle } from 'react-icons/fa';

const RealTimeNotifications = () => {
  const { isConnected, subscribe, unsubscribe } = useWebSocket();
  const { showNotification } = useApp();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Handle new notifications
  useEffect(() => {
    const handleNewCoupon = (data) => {
      addNotification({
        type: 'coupon',
        title: 'New Coupon Available',
        message: `${data.title} - ${data.description}`,
        timestamp: new Date(),
        data
      });
    };

    const handleCashbackReceived = (data) => {
      addNotification({
        type: 'cashback',
        title: 'Cashback Received',
        message: `$${data.amount} from ${data.store}`,
        timestamp: new Date(),
        data
      });
    };

    const handleRewardEarned = (data) => {
      addNotification({
        type: 'reward',
        title: 'Reward Earned',
        message: data.title,
        timestamp: new Date(),
        data
      });
    };

    const handleCustomOffer = (data) => {
      addNotification({
        type: 'offer',
        title: 'Special Offer',
        message: data.title,
        timestamp: new Date(),
        data
      });
    };

    const handleUserNotification = (data) => {
      addNotification({
        type: data.type || 'info',
        title: data.title || 'Notification',
        message: data.message,
        timestamp: new Date(),
        data
      });
    };

    // Subscribe to WebSocket events
    if (isConnected) {
      subscribe(WS_EVENTS.NEW_COUPON, handleNewCoupon);
      subscribe(WS_EVENTS.CASHBACK_RECEIVED, handleCashbackReceived);
      subscribe(WS_EVENTS.REWARD_EARNED, handleRewardEarned);
      subscribe(WS_EVENTS.CUSTOM_OFFER, handleCustomOffer);
      subscribe(WS_EVENTS.USER_NOTIFICATION, handleUserNotification);
    }

    return () => {
      // Unsubscribe from WebSocket events
      if (isConnected) {
        unsubscribe(WS_EVENTS.NEW_COUPON, handleNewCoupon);
        unsubscribe(WS_EVENTS.CASHBACK_RECEIVED, handleCashbackReceived);
        unsubscribe(WS_EVENTS.REWARD_EARNED, handleRewardEarned);
        unsubscribe(WS_EVENTS.CUSTOM_OFFER, handleCustomOffer);
        unsubscribe(WS_EVENTS.USER_NOTIFICATION, handleUserNotification);
      }
    };
  }, [isConnected, subscribe, unsubscribe]);

  // Add a new notification
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
    setNotificationCount(prev => prev + 1);
    setHasNewNotifications(true);
  };

  // Toggle notification panel
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewNotifications(false);
      setNotificationCount(0);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'coupon':
        return <span className={`${styles.icon} ${styles.couponIcon}`}>🏷️</span>;
      case 'cashback':
        return <span className={`${styles.icon} ${styles.cashbackIcon}`}>💰</span>;
      case 'reward':
        return <span className={`${styles.icon} ${styles.rewardIcon}`}>🎁</span>;
      case 'offer':
        return <span className={`${styles.icon} ${styles.offerIcon}`}>🔥</span>;
      case 'success':
        return <span className={`${styles.icon} ${styles.successIcon}`}>✅</span>;
      case 'error':
        return <span className={`${styles.icon} ${styles.errorIcon}`}>❌</span>;
      case 'warning':
        return <span className={`${styles.icon} ${styles.warningIcon}`}>⚠️</span>;
      default:
        return <span className={`${styles.icon} ${styles.infoIcon}`}>ℹ️</span>;
    }
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.notificationButton}
        onClick={toggleNotifications}
        aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} new)` : ''}`}
        aria-expanded={isOpen}
      >
        <FaBell />
        {hasNewNotifications && (
          <span className={styles.notificationBadge}>
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.notificationPanel} role="dialog" aria-label="Notifications">
          <div className={styles.notificationHeader}>
            <h3>Notifications</h3>
            <div className={styles.connectionStatus}>
              <FaCircle className={isConnected ? styles.connected : styles.disconnected} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className={`${styles.notificationItem} ${styles[notification.type]}`}>
                  {getNotificationIcon(notification.type)}
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <h4>{notification.title}</h4>
                      <span className={styles.timestamp}>{formatTime(notification.timestamp)}</span>
                    </div>
                    <p>{notification.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications;