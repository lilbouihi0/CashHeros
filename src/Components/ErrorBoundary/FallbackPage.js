import React from 'react';
import { Link } from 'react-router-dom';
import './FallbackPage.css';

/**
 * Fallback page displayed when a component fails to load
 * Used as a fallback for lazy-loaded components
 */
const FallbackPage = () => {
  return (
    <div className="fallback-page">
      <div className="fallback-container">
        <h2>Something went wrong</h2>
        <p>We're sorry, but we couldn't load this page.</p>
        <div className="fallback-actions">
          <button 
            onClick={() => window.location.reload()}
            className="fallback-button reload"
          >
            Reload Page
          </button>
          <Link to="/" className="fallback-button home">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FallbackPage;