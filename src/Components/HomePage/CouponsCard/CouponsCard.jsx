import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './CouponsCards.module.css';
import img1 from '../../assets/1.jpg';
import PropTypes from 'prop-types';

export const CouponsCard = memo(({ brand, title, discount, expiryDate, code }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        })
        .catch(err => {
          console.error('Failed to copy code: ', err);
        });
    }
  };

  // Format expiry date
  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'Limited time offer';
    
    try {
      const date = new Date(dateString);
      return `Expires ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } catch (e) {
      return 'Limited time offer';
    }
  };

  return (
    <div className={styles.Card}>
      <div className={styles.Details}>
        <div className={styles.Logo}>{brand}</div>
        {discount && <div className={styles.Discount}>{discount}</div>}
        <div className={styles.Title}>{title}</div>
        
        {expiryDate && (
          <div className={styles.ExpiryDate}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{formatExpiryDate(expiryDate)}</span>
          </div>
        )}
        
        {code && (
          <div className={styles.CodeContainer}>
            <div className={styles.Code} onClick={handleCopyCode}>
              <span>{code}</span>
              <button className={styles.CopyButton}>
                {isCopied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            </div>
            <div className={styles.CopyStatus}>
              {isCopied ? 'Copied!' : 'Click to copy'}
            </div>
          </div>
        )}
        
        <div className={styles.Link}>
          <Link to={`/stores/${brand.toLowerCase().replace(/\s+/g, '-')}`} className={styles.ShopNowButton}>
            Shop Now
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>
      <div className={styles.Image}>
        <img src={img1} alt={brand} />
        {discount && <div className={styles.DiscountBadge}>{discount}</div>}
      </div>
    </div>
  );
});

CouponsCard.propTypes = {
  brand: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  discount: PropTypes.string,
  expiryDate: PropTypes.string,
  code: PropTypes.string
};

CouponsCard.displayName = 'CouponsCard';