// src/pages/BlogPage/TrendingSection.jsx
import React from 'react';
import { FaChartLine, FaEye, FaRegClock, FaChevronRight } from 'react-icons/fa';
import styles from './TrendingSection.module.css';
import { getRandomImage } from '../../assets/images/blog/imageUrls';

const TrendingSection = ({ posts }) => {
  // Filter out posts without titles or images
  const validPosts = posts.filter(post => post.title);
  
  // Generate random view counts for demo purposes
  const getRandomViews = () => {
    return Math.floor(Math.random() * 900) + 100;
  };
  
  return (
    <div className={styles.trendingSection}>
      <div className={styles.trendingHeader}>
        <h3><FaChartLine /> Trending Now</h3>
        <button className={styles.viewAllTrending}>
          View All <FaChevronRight />
        </button>
      </div>
      
      {validPosts.length > 0 ? (
        <div className={styles.trendingList}>
          {validPosts.map((post, index) => {
            // Use id or _id for the key
            const postId = post.id || post._id || Math.random().toString(36).substring(2, 9);
            
            // Determine the date to display
            const displayDate = post.date || 
                              (post.publishedAt && new Date(post.publishedAt).toLocaleDateString()) || 
                              (post.createdAt && new Date(post.createdAt).toLocaleDateString()) || 
                              'No date';
            
            // Use a default image if none is provided
            const postImage = post.image || getRandomImage(post.category || 'default');
            
            return (
              <div key={postId} className={styles.trendingItem}>
                <div className={styles.trendingRank}>
                  {index + 1}
                </div>
                <img src={postImage} alt={post.title} className={styles.trendingImage} />
                <div className={styles.trendingContent}>
                  <h4 className={styles.trendingTitle}>{post.title}</h4>
                  <div className={styles.trendingMeta}>
                    <span className={styles.trendingViews}>
                      <FaEye /> {getRandomViews()}
                    </span>
                    <span className={styles.trendingDate}>
                      <FaRegClock /> {displayDate}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.noTrending}>
          <p>No trending posts available</p>
        </div>
      )}
      
      {/* Popular Tags Section */}
      <div className={styles.popularTags}>
        <h4>Popular Tags</h4>
        <div className={styles.tagCloud}>
          <span className={`${styles.tag} ${styles.tagLarge}`}>Savings</span>
          <span className={styles.tag}>Coupons</span>
          <span className={`${styles.tag} ${styles.tagMedium}`}>Deals</span>
          <span className={styles.tag}>Budget</span>
          <span className={`${styles.tag} ${styles.tagLarge}`}>Cash Back</span>
          <span className={`${styles.tag} ${styles.tagMedium}`}>Shopping</span>
          <span className={styles.tag}>Finance</span>
          <span className={styles.tag}>Travel</span>
        </div>
      </div>
      
      {/* Featured Ad */}
      <div className={styles.featuredAd}>
        <div className={styles.adLabel}>Sponsored</div>
        <div className={styles.adContent}>
          <h4>Save 15% on Your Next Purchase</h4>
          <p>Exclusive deals for Cash Heros members!</p>
          <button className={styles.adButton}>
            Learn More <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;