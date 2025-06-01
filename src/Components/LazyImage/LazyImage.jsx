import React, { useState, useEffect, useRef } from 'react';
import styles from './LazyImage.module.css';

const LazyImage = ({ 
  src, 
  alt, 
  placeholderSrc, 
  className = '', 
  width, 
  height, 
  aspectRatio = '16:9',
  sizes = '100vw', // Default sizes attribute for responsive images
  srcSet = '', // Optional srcset for responsive images
  onLoad = () => {},
  onError = () => {},
  objectFit = 'cover', // Default object-fit style
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  
  // Calculate aspect ratio for placeholder
  const getAspectRatioPercentage = () => {
    if (aspectRatio) {
      const [width, height] = aspectRatio.split(':').map(Number);
      return (height / width) * 100;
    }
    return 56.25; // Default 16:9 aspect ratio
  };

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setError(false);
    
    // Check if IntersectionObserver is available
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              // Set the src attribute to load the image
              if (img.dataset.src) {
                img.src = img.dataset.src;
              }
              // Set srcset if available
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
              }
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: '200px' } // Increased rootMargin for earlier loading
      );
      
      if (imgRef.current) {
        observer.observe(imgRef.current);
      }
      
      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      if (imgRef.current) {
        if (imgRef.current.dataset.src) {
          imgRef.current.src = imgRef.current.dataset.src;
        }
        if (imgRef.current.dataset.srcset) {
          imgRef.current.srcset = imgRef.current.dataset.srcset;
        }
      }
    }
  }, [src, srcSet]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleImageError = () => {
    setError(true);
    onError();
  };

  const placeholderStyle = {
    paddingBottom: `${getAspectRatioPercentage()}%`,
  };

  const imageStyle = {
    objectFit: objectFit,
  };

  // Handle touch events for better mobile experience
  const handleTouchStart = (e) => {
    // Add any touch-specific behavior here if needed
  };

  return (
    <div 
      className={`${styles.imageContainer} ${className}`} 
      style={{ width: width || '100%' }}
    >
      <div 
        className={styles.placeholder} 
        style={placeholderStyle}
        aria-hidden="true"
      >
        {!isLoaded && !error && (
          <div className={styles.shimmer}></div>
        )}
        
        {error && (
          <div className={styles.errorContainer} role="alert">
            <span className={styles.errorIcon} aria-hidden="true">!</span>
            <span className={styles.errorText}>Failed to load image</span>
          </div>
        )}
      </div>
      
      <img
        ref={imgRef}
        className={`${styles.image} ${isLoaded ? styles.loaded : ''}`}
        src={placeholderSrc || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}
        data-src={src}
        data-srcset={srcSet}
        sizes={sizes}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        width={width}
        height={height}
        style={imageStyle}
        onTouchStart={handleTouchStart}
        loading="lazy" // Native lazy loading as additional fallback
        {...props}
      />
    </div>
  );
};

export default LazyImage;