import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import styles from './NotificationSystem.module.css';

const NotificationSystem = () => {
  const { notifications, removeNotification } = useContext(AppContext);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.notificationContainer} aria-live="polite">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`${styles.notification} ${styles[notification.type]}`}
          role="alert"
        >
          <div className={styles.notificationIcon}>
            {notification.type === 'success' && <FaCheckCircle />}
            {notification.type === 'error' && <FaExclamationTriangle />}
            {notification.type === 'warning' && <FaExclamationTriangle />}
            {notification.type === 'info' && <FaInfoCircle />}
          </div>
          <div className={styles.notificationContent}>
            <p>{notification.message}</p>
          </div>
          <button 
            className={styles.closeButton}
            onClick={() => removeNotification(notification.id)}
            aria-label="Close notification"
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;