import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './OptimizedImage.module.css';

/**
 * OptimizedImage component with advanced features:
 * - Lazy loading with IntersectionObserver
 * - Responsive images with srcSet and sizes
 * - WebP format support with fallback
 * - Blur-up loading effect
 * - Error handling with fallback
 * - Accessibility support
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderSrc,
  srcSet = '',
  sizes = '100vw',
  webpSrcSet = '',
  lowQualitySrc = '',
  fallbackSrc = '',
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  onLoad = () => {},
  onError = () => {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Calculate aspect ratio for placeholder
  const aspectRatio = height && width ? (height / width) * 100 : 56.25; // Default to 16:9

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observerRef.current.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading when image is 200px from viewport
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Handle image load success
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  // Handle image load error
  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      onError();
    } else if (!fallbackSrc) {
      setHasError(true);
      onError();
    }
  };

  return (
    <div
      className={`${styles.imageContainer} ${className}`}
      style={{ aspectRatio: width && height ? `${width} / ${height}` : 'auto' }}
      ref={imgRef}
    >
      {/* Low quality placeholder image */}
      {lowQualitySrc && !isLoaded && (
        <img
          src={lowQualitySrc}
          alt=""
          className={styles.placeholder}
          aria-hidden="true"
          loading="eager"
        />
      )}

      {/* Loading shimmer effect */}
      {!isLoaded && (
        <div className={styles.shimmerContainer}>
          <div className={styles.shimmer}></div>
        </div>
      )}

      {/* Main image - only load when in viewport */}
      {isVisible && (
        <picture>
          {/* WebP format for browsers that support it */}
          {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
          
          {/* Regular image formats */}
          <source srcSet={srcSet} sizes={sizes} />
          
          <img
            src={hasError ? fallbackSrc || '/images/fallback.png' : src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={`${styles.image} ${isLoaded ? styles.loaded : ''}`}
            loading={loading}
            decoding={decoding}
            fetchPriority={fetchPriority}
            {...props}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className={styles.errorContainer} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">!</span>
          <span className={styles.errorText}>Image failed to load</span>
        </div>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  placeholderSrc: PropTypes.string,
  srcSet: PropTypes.string,
  sizes: PropTypes.string,
  webpSrcSet: PropTypes.string,
  lowQualitySrc: PropTypes.string,
  fallbackSrc: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  decoding: PropTypes.oneOf(['async', 'sync', 'auto']),
  fetchPriority: PropTypes.oneOf(['high', 'low', 'auto']),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default OptimizedImage;