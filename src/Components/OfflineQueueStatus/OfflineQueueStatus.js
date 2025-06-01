import React, { useState } from 'react';
import useOfflineStatus from '../../hooks/useOfflineStatus';
import './OfflineQueueStatus.css';

/**
 * OfflineQueueStatus Component
 * 
 * Displays the status of the offline request queue
 */
const OfflineQueueStatus = () => {
  const { 
    isOnline, 
    offlineQueue, 
    queueLength, 
    isProcessingQueue, 
    processQueue, 
    clearQueue 
  } = useOfflineStatus();
  
  const [expanded, setExpanded] = useState(false);

  // If online and no queue, don't render anything
  if (isOnline && queueLength === 0) {
    return null;
  }

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  // Process queue
  const handleProcessQueue = (e) => {
    e.stopPropagation();
    processQueue();
  };

  // Clear queue
  const handleClearQueue = (e) => {
    e.stopPropagation();
    clearQueue();
  };

  // Format request for display
  const formatRequest = (request) => {
    const method = request.method.toUpperCase();
    const url = request.url.replace(/^.*\/api\//, '');
    return `${method} ${url}`;
  };

  return (
    <div className="offline-queue-status">
      <div 
        className="offline-queue-status-header" 
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div className="offline-queue-status-icon">
          {isOnline ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-10h2v8h-2z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z" />
            </svg>
          )}
        </div>
        <div className="offline-queue-status-summary">
          <span className="offline-queue-status-title">
            {isOnline ? 'Pending Requests' : 'Offline Mode'}
          </span>
          <span className="offline-queue-status-count">
            {queueLength} {queueLength === 1 ? 'request' : 'requests'} pending
          </span>
        </div>
        <div className="offline-queue-status-toggle">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            width="18" 
            height="18"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </div>
      </div>
      
      {expanded && (
        <div className="offline-queue-status-content">
          {queueLength > 0 ? (
            <>
              <div className="offline-queue-status-list">
                {offlineQueue.map((request, index) => (
                  <div key={index} className="offline-queue-status-item">
                    {formatRequest(request)}
                  </div>
                ))}
              </div>
              <div className="offline-queue-status-actions">
                {isOnline && (
                  <button 
                    className="offline-queue-status-button offline-queue-status-button-primary"
                    onClick={handleProcessQueue}
                    disabled={isProcessingQueue}
                  >
                    {isProcessingQueue ? 'Processing...' : 'Process Queue'}
                  </button>
                )}
                <button 
                  className="offline-queue-status-button offline-queue-status-button-secondary"
                  onClick={handleClearQueue}
                  disabled={isProcessingQueue}
                >
                  Clear Queue
                </button>
              </div>
            </>
          ) : (
            <div className="offline-queue-status-empty">
              No pending requests
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflineQueueStatus;