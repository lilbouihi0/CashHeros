// src/pages/CashBackPage/CashBackCard.jsx
import React, { useState } from 'react';
import { FaFire, FaStore, FaTag, FaExternalLinkAlt, FaClock, FaHeart, FaRegHeart, FaInfoCircle } from 'react-icons/fa';
import styles from './CashBackCard.module.css';

const CashBackCard = ({ 
  discount, 
  name, 
  image, 
  link, 
  storeName = "Featured Store", 
  cashbackRate = "Up to 10%",
  expiryDate,
  isHot = false,
  terms = "Standard terms and conditions apply"
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  const handleCheckPrice = () => {
    console.log(`Checking price for ${name}`);
    window.location.href = link;
  };
  
  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // Here you would typically save this to user preferences
    console.log(`${isFavorite ? 'Removed from' : 'Added to'} favorites: ${name}`);
  };
  
  const toggleTerms = (e) => {
    e.stopPropagation();
    setShowTerms(!showTerms);
  };

  return (
    <div className={`${styles.cashBackCard} ${isHot ? styles.hotDeal : ''}`}>
      {/* Top badges and buttons with proper spacing */}
      <div className={styles.topElements}>
        <div className={styles.discountBadge}>
          <FaFire className={styles.fireIcon} />
          {discount}
        </div>
        
        {isHot && (
          <div className={styles.hotDealBadge}>
            Hot Deal
          </div>
        )}
        
        <button 
          className={`${styles.favoriteButton} ${isHot ? styles.favoriteButtonWithHotDeal : ''}`} 
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? <FaHeart className={styles.favoriteIcon} /> : <FaRegHeart />}
        </button>
      </div>
      
      <div className={styles.cardContent}>
        <img src={image} alt={name} className={styles.productImage} />
        <div className={styles.textSection}>
          <h3 className={styles.productName}>{name}</h3>
          
          <div className={styles.storeInfo}>
            <FaStore className={styles.infoIcon} />
            <span>{storeName}</span>
          </div>
          
          <div className={styles.cashbackInfo}>
            <FaTag className={styles.infoIcon} />
            <span>Cashback: {cashbackRate}</span>
          </div>
          
          {expiryDate && (
            <div className={styles.expiryInfo}>
              <FaClock className={styles.infoIcon} />
              <span>Expires: {expiryDate}</span>
            </div>
          )}
        </div>
      </div>
      
      {showTerms && (
        <div className={styles.termsPopup}>
          <div className={styles.termsContent}>
            <h4>Terms & Conditions</h4>
            <p>{terms}</p>
            <button onClick={toggleTerms}>Close</button>
          </div>
        </div>
      )}
      
      <div className={styles.cardFooter}>
        <button className={styles.checkPriceButton} onClick={handleCheckPrice}>
          Get Cashback <FaExternalLinkAlt className={styles.linkIcon} />
        </button>
        <button className={styles.termsButton} onClick={toggleTerms}>
          <FaInfoCircle /> Terms
        </button>
      </div>
    </div>
  );
};

export default CashBackCard;