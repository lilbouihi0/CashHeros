import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaSpinner, FaRobot, FaExclamationTriangle } from 'react-icons/fa';
import useRecommendations from '../../hooks/useRecommendations';
import useLocalization from '../../hooks/useLocalization';
import styles from './RecommendationCarousel.module.css';

/**
 * AI-powered recommendation carousel component
 * @param {Object} props - Component props
 * @param {string} props.title - Carousel title
 * @param {string} props.type - Type of recommendations (personalized, trending, similar, search)
 * @param {Object} props.params - Parameters for the recommendation request
 * @param {string} props.emptyMessage - Message to display when no recommendations are available
 * @param {Function} props.onItemClick - Callback when an item is clicked
 */
const RecommendationCarousel = ({
  title,
  type = 'personalized',
  params = {},
  emptyMessage,
  onItemClick
}) => {
  const { t, formatPrice } = useLocalization();
  const { recommendations, loading, error, handleRecommendationClick } = useRecommendations({
    type,
    params
  });
  
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef(null);
  
  // Handle scroll buttons
  const scroll = (direction) => {
    if (carouselRef.current) {
      const { current } = carouselRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      const newPosition = scrollPosition + scrollAmount;
      
      current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };
  
  // Update scroll position when carousel scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        setScrollPosition(carouselRef.current.scrollLeft);
      }
    };
    
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Handle item click
  const handleItemClick = (item) => {
    handleRecommendationClick(item);
    if (onItemClick) {
      onItemClick(item);
    }
  };
  
  // Render recommendation item based on type
  const renderItem = (item) => {
    switch (item.type) {
      case 'coupon':
        return renderCouponItem(item);
      case 'store':
        return renderStoreItem(item);
      case 'cashback':
        return renderCashbackItem(item);
      case 'blog':
        return renderBlogItem(item);
      default:
        return renderDefaultItem(item);
    }
  };
  
  // Render coupon recommendation
  const renderCouponItem = (item) => (
    <div className={`${styles.item} ${styles.couponItem}`}>
      {item.store && item.store.logo && (
        <div className={styles.storeLogo}>
          <img src={item.store.logo} alt={item.store.name} />
        </div>
      )}
      <div className={styles.itemContent}>
        <h4 className={styles.itemTitle}>{item.title}</h4>
        {item.discount && (
          <div className={styles.discount}>{item.discount}% OFF</div>
        )}
        <div className={styles.itemDescription}>{item.description}</div>
        {item.expiryDate && (
          <div className={styles.expiryDate}>
            {t('coupons.expires')}: {new Date(item.expiryDate).toLocaleDateString()}
          </div>
        )}
      </div>
      <div className={styles.itemFooter}>
        <div className={styles.aiTag}>
          <FaRobot /> {t('common.recommended')}
        </div>
        <button className={styles.itemButton}>{t('coupons.show')}</button>
      </div>
    </div>
  );
  
  // Render store recommendation
  const renderStoreItem = (item) => (
    <div className={`${styles.item} ${styles.storeItem}`}>
      {item.logo && (
        <div className={styles.storeLogo}>
          <img src={item.logo} alt={item.name} />
        </div>
      )}
      <div className={styles.itemContent}>
        <h4 className={styles.itemTitle}>{item.name}</h4>
        {item.cashbackRate && (
          <div className={styles.cashbackRate}>{item.cashbackRate}% {t('cashback.rate')}</div>
        )}
        <div className={styles.itemDescription}>{item.description}</div>
      </div>
      <div className={styles.itemFooter}>
        <div className={styles.aiTag}>
          <FaRobot /> {t('common.recommended')}
        </div>
        <button className={styles.itemButton}>{t('common.viewDetails')}</button>
      </div>
    </div>
  );
  
  // Render cashback recommendation
  const renderCashbackItem = (item) => (
    <div className={`${styles.item} ${styles.cashbackItem}`}>
      {item.store && item.store.logo && (
        <div className={styles.storeLogo}>
          <img src={item.store.logo} alt={item.store.name} />
        </div>
      )}
      <div className={styles.itemContent}>
        <h4 className={styles.itemTitle}>{item.title}</h4>
        {item.rate && (
          <div className={styles.cashbackRate}>{item.rate}% {t('cashback.rate')}</div>
        )}
        <div className={styles.itemDescription}>{item.description}</div>
      </div>
      <div className={styles.itemFooter}>
        <div className={styles.aiTag}>
          <FaRobot /> {t('common.recommended')}
        </div>
        <button className={styles.itemButton}>{t('cashback.activate')}</button>
      </div>
    </div>
  );
  
  // Render blog recommendation
  const renderBlogItem = (item) => (
    <div className={`${styles.item} ${styles.blogItem}`}>
      {item.image && (
        <div className={styles.blogImage}>
          <img src={item.image} alt={item.title} />
        </div>
      )}
      <div className={styles.itemContent}>
        <h4 className={styles.itemTitle}>{item.title}</h4>
        <div className={styles.itemDescription}>{item.excerpt}</div>
      </div>
      <div className={styles.itemFooter}>
        <div className={styles.aiTag}>
          <FaRobot /> {t('common.recommended')}
        </div>
        <button className={styles.itemButton}>{t('blog.readMore')}</button>
      </div>
    </div>
  );
  
  // Render default recommendation
  const renderDefaultItem = (item) => (
    <div className={`${styles.item} ${styles.defaultItem}`}>
      <div className={styles.itemContent}>
        <h4 className={styles.itemTitle}>{item.title}</h4>
        <div className={styles.itemDescription}>{item.description}</div>
      </div>
      <div className={styles.itemFooter}>
        <div className={styles.aiTag}>
          <FaRobot /> {t('common.recommended')}
        </div>
        <button className={styles.itemButton}>{t('common.viewDetails')}</button>
      </div>
    </div>
  );
  
  // Get link URL based on item type
  const getItemUrl = (item) => {
    switch (item.type) {
      case 'coupon':
        return `/coupons/${item.id}`;
      case 'store':
        return `/stores/${item.slug || item.id}`;
      case 'cashback':
        return `/cashback/${item.id}`;
      case 'blog':
        return `/blog/${item.slug || item.id}`;
      default:
        return '#';
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.errorContainer}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <p>{t('errors.recommendations')}</p>
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.emptyContainer}>
          <p>{emptyMessage || t('recommendations.empty')}</p>
        </div>
      </div>
    );
  }
  
  // Render recommendations carousel
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.controls}>
          <button 
            className={styles.controlButton} 
            onClick={() => scroll('left')}
            aria-label={t('common.previous')}
            disabled={scrollPosition <= 0}
          >
            <FaChevronLeft />
          </button>
          <button 
            className={styles.controlButton} 
            onClick={() => scroll('right')}
            aria-label={t('common.next')}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
      
      <div className={styles.carousel} ref={carouselRef}>
        {recommendations.map((item) => (
          <Link 
            key={item.id} 
            to={getItemUrl(item)}
            className={styles.itemLink}
            onClick={() => handleItemClick(item)}
          >
            {renderItem(item)}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendationCarousel;