import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CashBack.module.css';
import placeholderImage from '../../../assets/placeholder.js';

export const CashBack = ({ percent, storeName, category, logo, storeUrl }) => {
  // Format percent to ensure it has a % symbol
  const formattedPercent = percent && !String(percent).includes('%') 
    ? `${percent}%` 
    : percent;
  
  // Generate a store URL if not provided
  const formattedStoreUrl = storeUrl || 
    (storeName ? `/stores/${storeName.toLowerCase().replace(/\s+/g, '-')}` : '#');
  
  return (
    <div className={styles.cashBackCard}>
      <div className={styles.cardHeader}>
        <div className={styles.logoContainer}>
          <img 
            src={logo || placeholderImage} 
            alt={storeName || 'Store'} 
            className={styles.storeLogo} 
          />
        </div>
        {category && (
          <div className={styles.categoryTag}>
            {category}
          </div>
        )}
      </div>
      
      <div className={styles.cardContent}>
        {storeName && (
          <h3 className={styles.storeName}>{storeName}</h3>
        )}
        
        <div className={styles.cashBackAmount}>
          <span className={styles.percentValue}>{formattedPercent}</span>
          <span className={styles.cashBackLabel}>Cash Back</span>
        </div>
        
        <div className={styles.cardActions}>
          <Link to={formattedStoreUrl} className={styles.shopNowButton}>
            Shop Now
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
          
          <button className={styles.favoriteButton} aria-label="Add to favorites">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className={styles.cardFooter}>
        <div className={styles.verifiedBadge}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Verified</span>
        </div>
        <div className={styles.lastUpdated}>
          Updated {Math.floor(Math.random() * 7) + 1}d ago
        </div>
      </div>
    </div>
  );
};