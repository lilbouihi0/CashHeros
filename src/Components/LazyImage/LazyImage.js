import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './LazyImage.css';

/**
 * LazyImage component for optimized image loading
 * 
 * Features:
 * - Lazy loading (only loads when scrolled into view)
 * - Blur-up effect (shows a blurred placeholder while loading)
 * - WebP support with fallback
 * - Error handling with fallback image
 * - Responsive sizing
 * - Accessibility support
 * 
 * @param {Object} props Component props
 * @param {string} props.src The image source URL
 * @param {string} props.alt Alt text for the image (required for accessibility)
 * @param {string} props.placeholderSrc Optional low-res placeholder image
 * @param {string} props.fallbackSrc Image to show if loading fails
 * @param {string} props.className Additional CSS classes
 * @param {Object} props.style Additional inline styles
 * @param {number} props.threshold Intersection observer threshold (0-1)
 * @param {Function} props.onLoad Callback when image loads
 * @param {Function} props.onError Callback when image fails to load
 * @param {Object} props.imgProps Additional props for the img element
 */
const LazyImage = ({
  src,
  alt,
  placeholderSrc,
  fallbackSrc = '/images/placeholder.jpg',
  className = '',
  style = {},
  threshold = 0.1,
  onLoad,
  onError,
  imgProps = {},
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle image load success
  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Handle image load error
  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Determine which image source to use
  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <div 
      className={`lazy-image-container ${className} ${isLoaded ? 'loaded' : 'loading'}`}
      style={style}
      {...rest}
    >
      <LazyLoadImage
        alt={alt}
        src={imageSrc}
        placeholderSrc={placeholderSrc}
        effect="blur"
        threshold={threshold}
        onLoad={handleLoad}
        onError={handleError}
        wrapperClassName="lazy-image-wrapper"
        {...imgProps}
      />
      
      {!isLoaded && !hasError && (
        <div className="lazy-image-placeholder" aria-hidden="true">
          <div className="lazy-image-spinner"></div>
        </div>
      )}
      
      {hasError && (
        <div className="lazy-image-error-message">
          <span>Image could not be loaded</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;