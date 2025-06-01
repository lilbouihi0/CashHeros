import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Deals.module.css';
import img1 from '../../assets/1.jpg';

export const Deals = ({ 
  brand, 
  title, 
  discount, 
  originalPrice, 
  salePrice, 
  expiryDate, 
  category, 
  image, 
  dealUrl 
}) => {
  // Format prices
  const formattedOriginalPrice = originalPrice ? 
    (typeof originalPrice === 'number' ? `$${originalPrice.toFixed(2)}` : originalPrice) : 
    '$99.99';
  
  const formattedSalePrice = salePrice ? 
    (typeof salePrice === 'number' ? `$${salePrice.toFixed(2)}` : salePrice) : 
    '$49.99';
  
  // Calculate discount percentage if not provided
  const discountPercentage = discount || 
    (originalPrice && salePrice ? 
      Math.round((1 - (parseFloat(salePrice) / parseFloat(originalPrice))) * 100) + '%' : 
      '50% OFF');
  
  // Format expiry date
  const formatExpiryDate = () => {
    if (!expiryDate) return 'Limited time';
    
    try {
      const date = new Date(expiryDate);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Limited time';
    }
  };
  
  // Generate deal URL
  const formattedDealUrl = dealUrl || 
    (brand ? `/deals/${brand.toLowerCase().replace(/\s+/g, '-')}` : '#');
  
  return (
    <div className={styles.dealCard}>
      <div className={styles.dealHeader}>
        {discount && <div className={styles.discountBadge}>{discountPercentage}</div>}
        {category && <div className={styles.categoryTag}>{category}</div>}
      </div>
      
      <div className={styles.dealImageContainer}>
        <img 
          src={image || img1} 
          alt={title || brand} 
          className={styles.dealImage} 
        />
        <div className={styles.dealOverlay}>
          <Link to={formattedDealUrl} className={styles.viewDealButton}>
            View Deal
          </Link>
        </div>
      </div>
      
      <div className={styles.dealContent}>
        <div className={styles.brandContainer}>
          <h4 className={styles.brandName}>{brand}</h4>
          <div className={styles.verifiedBadge}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Verified</span>
          </div>
        </div>
        
        <h3 className={styles.dealTitle}>{title}</h3>
        
        <div className={styles.priceContainer}>
          <div className={styles.prices}>
            <span className={styles.salePrice}>{formattedSalePrice}</span>
            <span className={styles.originalPrice}>{formattedOriginalPrice}</span>
          </div>
          <div className={styles.expiryDate}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Ends {formatExpiryDate()}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.dealFooter}>
        <div className={styles.dealStats}>
          <div className={styles.dealStat}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>{Math.floor(Math.random() * 500) + 100}</span>
          </div>
          <div className={styles.dealStat}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>{Math.floor(Math.random() * 1000) + 500}</span>
          </div>
        </div>
        
        <button className={styles.saveButton} aria-label="Save deal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};