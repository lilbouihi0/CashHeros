import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for handling offline status and capabilities
 * 
 * @returns {Object} - Offline status utilities
 */
const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial queue check
    updateQueueStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update queue status
  const updateQueueStatus = useCallback(async () => {
    const queue = await api.getOfflineQueue();
    setOfflineQueue(queue);
  }, []);

  // Process offline queue
  const processQueue = useCallback(async () => {
    if (!navigator.onLine || isProcessingQueue) return;

    setIsProcessingQueue(true);

    try {
      await api.processOfflineQueue();
      updateQueueStatus();
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      setIsProcessingQueue(false);
    }
  }, [isProcessingQueue, updateQueueStatus]);

  // Clear offline queue
  const clearQueue = useCallback(async () => {
    await api.clearOfflineQueue();
    updateQueueStatus();
  }, [updateQueueStatus]);

  // Check if a specific request is in the queue
  const isRequestQueued = useCallback((url, method = 'GET') => {
    return offlineQueue.some(request => 
      request.url.includes(url) && 
      request.method.toUpperCase() === method.toUpperCase()
    );
  }, [offlineQueue]);

  return {
    isOnline,
    offlineQueue,
    queueLength: offlineQueue.length,
    isProcessingQueue,
    processQueue,
    clearQueue,
    isRequestQueued
  };
};

export default useOfflineStatus;