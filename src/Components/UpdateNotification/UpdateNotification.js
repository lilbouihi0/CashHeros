import React, { useState, useEffect } from 'react';
import './UpdateNotification.css';

/**
 * Component that shows a notification when a new version of the app is available
 * Works with service worker updates
 */
const UpdateNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // Listen for service worker update events
    const handleServiceWorkerUpdate = (event) => {
      const { detail } = event;
      if (detail && detail.waiting) {
        // A new service worker is waiting to activate
        setWaitingWorker(detail.waiting);
        setShowNotification(true);
      }
    };

    window.addEventListener('serviceWorkerUpdate', handleServiceWorkerUpdate);

    return () => {
      window.removeEventListener('serviceWorkerUpdate', handleServiceWorkerUpdate);
    };
  }, []);

  // Function to update the service worker
  const updateServiceWorker = () => {
    if (waitingWorker) {
      // Send a message to the waiting service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // After the service worker activates, reload the page
      waitingWorker.addEventListener('statechange', (event) => {
        if (event.target.state === 'activated') {
          window.location.reload();
        }
      });
    }
  };

  // Function to dismiss the notification
  const dismissNotification = () => {
    setShowNotification(false);
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="update-notification">
      <div className="update-notification-content">
        <p>A new version of the app is available!</p>
        <div className="update-notification-actions">
          <button 
            onClick={updateServiceWorker}
            className="update-notification-button update-now"
          >
            Update Now
          </button>
          <button 
            onClick={dismissNotification}
            className="update-notification-button update-later"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;