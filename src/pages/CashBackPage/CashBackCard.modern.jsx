// src/pages/CashBackPage/CashBackCard.modern.jsx
import React, { useState } from 'react';
import { FaFire, FaStore, FaTag, FaExternalLinkAlt, FaClock, FaHeart, FaRegHeart, 
         FaInfoCircle, FaShareAlt, FaCheck, FaRegBookmark, FaBookmark } from 'react-icons/fa';
import styles from './CashBackCard.modern.css';

const CashBackCardModern = ({ 
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
  const [isSaved, setIsSaved] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isShared, setIsShared] = useState(false);
  
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
  
  const toggleSaved = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    console.log(`${isSaved ? 'Removed from' : 'Added to'} saved items: ${name}`);
  };
  
  const toggleTerms = (e) => {
    e.stopPropagation();
    setShowTerms(!showTerms);
  };
  
  const handleShare = (e) => {
    e.stopPropagation();
    // Simulate share functionality
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
    console.log(`Sharing: ${name}`);
  };

  return (
    <div className={`${styles.cashBackCard} ${isHot ? styles.hotDeal : ''}`}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.discountBadge}>
          <FaFire className={styles.fireIcon} />
          {discount}
        </div>
        
        {isHot && (
          <div className={styles.hotDealBadge}>
            Hot Deal
          </div>
        )}
        
        <div className={styles.cardActions}>
          <button 
            className={styles.actionButton} 
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <FaHeart className={styles.favoriteIcon} /> : <FaRegHeart />}
          </button>
          
          <button 
            className={styles.actionButton} 
            onClick={toggleSaved}
            aria-label={isSaved ? "Remove from saved" : "Save for later"}
          >
            {isSaved ? <FaBookmark className={styles.savedIcon} /> : <FaRegBookmark />}
          </button>
          
          <button 
            className={styles.actionButton} 
            onClick={handleShare}
            aria-label="Share this deal"
          >
            {isShared ? <FaCheck className={styles.sharedIcon} /> : <FaShareAlt />}
          </button>
        </div>
      </div>
      
      {/* Card Content */}
      <div className={styles.cardContent}>
        <div className={styles.imageContainer}>
          <img src={image} alt={name} className={styles.productImage} />
          <div className={styles.cashbackOverlay}>
            <span>{cashbackRate}</span>
          </div>
        </div>
        
        <div className={styles.textSection}>
          <div className={styles.storeInfo}>
            <FaStore className={styles.infoIcon} />
            <span>{storeName}</span>
          </div>
          
          <h3 className={styles.productName}>{name}</h3>
          
          {expiryDate && (
            <div className={styles.expiryInfo}>
              <FaClock className={styles.infoIcon} />
              <span>Expires: {expiryDate}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Card Footer */}
      <div className={styles.cardFooter}>
        <button className={styles.checkPriceButton} onClick={handleCheckPrice}>
          Get Cashback <FaExternalLinkAlt className={styles.linkIcon} />
        </button>
        
        <button className={styles.termsButton} onClick={toggleTerms}>
          <FaInfoCircle /> Terms
        </button>
      </div>
      
      {/* Terms Popup */}
      {showTerms && (
        <div className={styles.termsPopup} onClick={(e) => e.stopPropagation()}>
          <div className={styles.termsContent}>
            <h4>Terms & Conditions</h4>
            <p>{terms}</p>
            <button onClick={toggleTerms}>Close</button>
          </div>
        </div>
      )}
      
      {/* Hover Overlay */}
      <div className={styles.hoverOverlay}>
        <div className={styles.overlayContent}>
          <p>Click to earn {cashbackRate} cash back at {storeName}</p>
          <button className={styles.overlayButton} onClick={handleCheckPrice}>
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashBackCardModern;