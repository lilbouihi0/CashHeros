// src/Components/HomePage/TopStore/TopStore.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaInfoCircle, FaTag } from 'react-icons/fa';
import styles from './TopStore.module.css';
import PropTypes from 'prop-types';
import placeholderImage from '../../../assets/placeholder.js';

const TopStore = ({ 
  percent, 
  brand = 'Unknown Store', 
  image = placeholderImage, 
  featured = false, 
  category = 'Other', 
  terms = '' 
}) => {
  const [showTerms, setShowTerms] = useState(false);
  
  const toggleTerms = (e) => {
    e.preventDefault();
    setShowTerms(!showTerms);
  };
  
  const numericPercent = parseFloat(percent);
  const isHighCashback = numericPercent >= 5;
  
  return (
    <div className={`${styles.card} ${featured ? styles.featured : ''}`}>
      {featured && (
        <div className={styles.featuredBadge}>
          <FaStar /> Featured
        </div>
      )}
      
      <div className={styles.imageWrapper}>
        <img src={image} alt={brand} className={styles.storeImage} />
      </div>
      
      <div className={styles.details}>
        <h3 className={styles.brand}>{brand}</h3>
        
        <div className={styles.categoryTag}>
          <FaTag className={styles.categoryIcon} />
          <span>{category}</span>
        </div>
        
        <p className={`${styles.percent} ${isHighCashback ? styles.highCashback : ''}`}>
          {percent} Cash Back
        </p>
        
        {terms && (
          <div className={styles.termsContainer}>
            <button 
              className={styles.termsToggle} 
              onClick={toggleTerms}
              aria-expanded={showTerms}
              aria-controls={`terms-${brand.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <FaInfoCircle /> Terms
            </button>
            
            {showTerms && (
              <div 
                id={`terms-${brand.replace(/\s+/g, '-').toLowerCase()}`}
                className={styles.termsPopup}
              >
                <p>{terms}</p>
              </div>
            )}
          </div>
        )}
        
        <Link 
          to={`/stores/${brand.toLowerCase().replace(/\s+/g, '-')}`} 
          className={styles.link}
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
};

TopStore.propTypes = {
  percent: PropTypes.string.isRequired,
  brand: PropTypes.string,
  image: PropTypes.string,
  featured: PropTypes.bool,
  category: PropTypes.string,
  terms: PropTypes.string,
};

// Choose one export style, not both
export default TopStore;