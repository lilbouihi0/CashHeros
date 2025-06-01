import React, { useState, useEffect } from 'react';
import './Loading.css';

/**
 * Loading component
 * 
 * Displays a loading spinner with a message that changes if loading takes too long.
 * 
 * @returns {React.ReactNode} - The loading component
 */
const Loading = () => {
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);
  
  // Show a different message if loading takes more than 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDelayedMessage(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="loading-container" aria-live="polite" role="status">
      <div className="loading-spinner"></div>
      <p>{showDelayedMessage 
        ? "Still loading... This might take a moment." 
        : "Loading..."}
      </p>
      {showDelayedMessage && (
        <p className="loading-suggestion">
          If this persists, try refreshing the page.
        </p>
      )}
    </div>
  );
};

export default Loading;