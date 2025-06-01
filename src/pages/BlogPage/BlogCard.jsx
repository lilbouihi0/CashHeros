import React, { useState, useEffect } from 'react';
import { FaHeart, FaTrash } from 'react-icons/fa';
import styles from './BlogCard.module.css';
import PropTypes from 'prop-types';
import AIContentAnalyzer from './AIContentAnalyzer';
import { getRandomImage } from '../../assets/images/blog/imageUrls';

const BlogCard = ({ title, category, excerpt, image, date, createdAt, publishedAt, onDelete, id, _id, content }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  
  useEffect(() => {
    checkAdminStatus();
  }, []);
  
  const checkAdminStatus = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        if (user && user.role === 'admin') {
          setIsAdmin(true);
        }
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };
  
  // Determine the date to display
  const displayDate = date || 
                     (publishedAt && new Date(publishedAt).toLocaleDateString()) || 
                     (createdAt && new Date(createdAt).toLocaleDateString()) || 
                     'No date';
  
  // Determine the ID to use for deletion
  const blogId = id || _id;
  
  // Always use high-quality images from our Unsplash collection
  const blogImage = image && image.includes('unsplash.com') 
    ? image 
    : getRandomImage(category || 'default');
  
  // Determine the category label
  const categoryLabel = category === 'budget' ? 'BUDGET' : 
                       (category ? `${category.toUpperCase()} FAVES` : 'GENERAL');
  
  const handleCardClick = (e) => {
    // Don't open the blog if clicking on the delete button
    if (e.target.closest(`.${styles.deleteIcon}`)) {
      return;
    }
    
    // If the card is already expanded, don't do anything on card click
    // (let the close button and overlay handle closing)
    if (showFullContent) {
      return;
    }
    
    // Only open the modal if the card is not expanded
    setShowFullContent(true);
  };
  
  // Separate handler for closing the modal
  const handleCloseModal = () => {
    setShowFullContent(false);
  };
  
  return (
    <>
      {showFullContent && (
        <div 
          className={styles.modalOverlay} 
          onClick={handleCloseModal}
        ></div>
      )}
      
      <div className={`${styles.blogCard} ${showFullContent ? styles.expanded : ''}`} onClick={handleCardClick}>
        <div className={styles.imageWrapper}>
          <img src={blogImage} alt={title} className={styles.blogImage} />
          <div className={styles.overlay}></div>
        </div>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.categoryLabel}>{categoryLabel}</p>
          <p className={styles.date}>{displayDate}</p>
          <FaHeart className={styles.heartIcon} />
          {isAdmin && blogId && (
            <FaTrash 
              className={styles.deleteIcon} 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(blogId);
              }} 
              title="Delete blog post"
            />
          )}
        </div>
        
        {showFullContent && (
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <button 
                className={styles.topCloseButton}
                onClick={handleCloseModal}
                aria-label="Close blog post"
                type="button"
              >
                ✕
              </button>
              <h2>{title}</h2>
              <div className={styles.modalMeta}>
                <span className={styles.modalCategory}>{categoryLabel}</span>
                <span className={styles.modalDate}>{displayDate}</span>
              </div>
            </div>
            
            <div className={styles.modalImageContainer}>
              <img src={blogImage} alt={title} className={styles.modalImage} />
            </div>
            
            <div className={styles.fullContent}>
              <p className={styles.blogExcerpt}>{excerpt}</p>
              <div className={styles.blogContent}>
                {content || excerpt || "No content available for this blog post."}
              </div>
              <div className={styles.buttonContainer}>
                <button 
                  className={styles.closeButton}
                  onClick={handleCloseModal}
                  aria-label="Close blog post"
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

BlogCard.propTypes = {
  title: PropTypes.string.isRequired,
  category: PropTypes.string,
  excerpt: PropTypes.string,
  content: PropTypes.string,
  image: PropTypes.string,
  date: PropTypes.string,
  createdAt: PropTypes.string,
  publishedAt: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  id: PropTypes.string,
  _id: PropTypes.string
};

export default BlogCard;