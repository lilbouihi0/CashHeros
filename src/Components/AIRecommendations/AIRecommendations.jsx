import React, { useState, useEffect } from 'react';
import { FaRobot, FaThumbsUp, FaThumbsDown, FaInfoCircle, FaTag, FaStore } from 'react-icons/fa';
import styles from './AIRecommendations.module.css';

const AIRecommendations = ({ userId, preferences }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  // Mock data for recommendations
  const mockRecommendations = [
    {
      id: 1,
      type: 'coupon',
      title: '20% Off Electronics',
      store: 'TechWorld',
      code: 'TECH20',
      expiryDate: '2023-12-31',
      reason: 'Based on your recent electronics purchases',
      confidence: 0.89
    },
    {
      id: 2,
      type: 'store',
      title: 'Fashion World',
      cashbackRate: '7.5%',
      reason: 'Similar to stores you frequently shop at',
      confidence: 0.82
    },
    {
      id: 3,
      type: 'coupon',
      title: 'Buy One Get One Free',
      store: 'Healthy Foods',
      code: 'BOGO2023',
      expiryDate: '2023-12-15',
      reason: 'Matches your food & grocery preferences',
      confidence: 0.75
    },
    {
      id: 4,
      type: 'coupon',
      title: '$30 off $100 Purchase',
      store: 'Home Essentials',
      code: 'HOME30',
      expiryDate: '2023-12-20',
      reason: 'Recommended based on seasonal shopping patterns',
      confidence: 0.68
    }
  ];

  // Fetch recommendations on component mount
  useEffect(() => {
    // In a real implementation, this would be an API call
    // fetchRecommendations(userId, preferences);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [userId, preferences]);

  // Handle feedback on recommendations
  const handleFeedback = (id, isPositive) => {
    // Prevent multiple feedback on the same recommendation
    if (feedbackGiven[id]) return;
    
    // In a real implementation, this would send feedback to the API
    // sendFeedback(id, isPositive);
    
    // Update local state to show feedback was given
    setFeedbackGiven(prev => ({
      ...prev,
      [id]: isPositive ? 'positive' : 'negative'
    }));
    
    // Optionally, you could update recommendations based on feedback
    if (!isPositive) {
      // If negative feedback, you might want to remove or replace the recommendation
      setRecommendations(prev => 
        prev.filter(rec => rec.id !== id)
      );
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (dateString) => {
    const today = new Date();
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Generating personalized recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FaInfoCircle className={styles.errorIcon} />
        <p>Sorry, we couldn't load recommendations right now. Please try again later.</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <FaInfoCircle className={styles.infoIcon} />
        <p>We're still learning your preferences. Check back soon for personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div className={styles.recommendationsContainer}>
      <div className={styles.header}>
        <FaRobot className={styles.aiIcon} />
        <h2>AI-Powered Recommendations</h2>
      </div>
      
      <div className={styles.recommendationsList}>
        {recommendations.map(rec => (
          <div key={rec.id} className={styles.recommendationCard}>
            <div className={styles.recommendationHeader}>
              <div className={styles.typeIndicator}>
                {rec.type === 'coupon' ? (
                  <FaTag className={styles.typeIcon} />
                ) : (
                  <FaStore className={styles.typeIcon} />
                )}
                <span>{rec.type === 'coupon' ? 'Coupon' : 'Store'}</span>
              </div>
              <div className={styles.confidenceScore}>
                <div 
                  className={styles.confidenceMeter} 
                  style={{ 
                    '--confidence': `${rec.confidence * 100}%`,
                    '--color': rec.confidence > 0.8 ? '#4caf50' : rec.confidence > 0.6 ? '#ff9800' : '#f44336'
                  }}
                ></div>
                <span>{Math.round(rec.confidence * 100)}% match</span>
              </div>
            </div>
            
            <div className={styles.recommendationContent}>
              <h3>{rec.title}</h3>
              <p className={styles.storeInfo}>{rec.store}</p>
              
              {rec.type === 'coupon' && (
                <div className={styles.couponDetails}>
                  <div className={styles.couponCode}>
                    <span>Code:</span> {rec.code}
                  </div>
                  <div className={styles.expiryDate}>
                    <span>Expires:</span> {formatDate(rec.expiryDate)}
                    {getDaysUntilExpiry(rec.expiryDate) <= 7 && (
                      <span className={styles.expiryWarning}>
                        {getDaysUntilExpiry(rec.expiryDate) <= 0 
                          ? ' (Expired)' 
                          : ` (${getDaysUntilExpiry(rec.expiryDate)} days left)`}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {rec.type === 'store' && (
                <div className={styles.storeDetails}>
                  <div className={styles.cashbackRate}>
                    <span>Cashback:</span> {rec.cashbackRate}
                  </div>
                </div>
              )}
              
              <div className={styles.recommendationReason}>
                <FaInfoCircle className={styles.reasonIcon} />
                <p>{rec.reason}</p>
              </div>
            </div>
            
            <div className={styles.recommendationActions}>
              <button className={styles.actionButton}>
                {rec.type === 'coupon' ? 'Use Coupon' : 'Visit Store'}
              </button>
              
              <div className={styles.feedbackButtons}>
                <button 
                  className={`${styles.feedbackButton} ${feedbackGiven[rec.id] === 'positive' ? styles.active : ''}`}
                  onClick={() => handleFeedback(rec.id, true)}
                  disabled={feedbackGiven[rec.id] !== undefined}
                  aria-label="This recommendation is helpful"
                  title="This recommendation is helpful"
                >
                  <FaThumbsUp />
                </button>
                <button 
                  className={`${styles.feedbackButton} ${feedbackGiven[rec.id] === 'negative' ? styles.active : ''}`}
                  onClick={() => handleFeedback(rec.id, false)}
                  disabled={feedbackGiven[rec.id] !== undefined}
                  aria-label="This recommendation is not helpful"
                  title="This recommendation is not helpful"
                >
                  <FaThumbsDown />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;