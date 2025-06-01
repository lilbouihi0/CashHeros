import React from 'react';
import PropTypes from 'prop-types';
import './SkeletonLoader.css';

/**
 * SkeletonLoader Component
 * 
 * A customizable skeleton loader for content placeholders
 * 
 * @param {Object} props - Component props
 * @param {string|number} props.width - Width of the skeleton (CSS value)
 * @param {string|number} props.height - Height of the skeleton (CSS value)
 * @param {string} props.borderRadius - Border radius of the skeleton (CSS value)
 * @param {string} props.className - Additional CSS class names
 * @param {Object} props.style - Additional inline styles
 */
const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '',
  style = {}
}) => {
  const skeletonStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    ...style
  };

  return (
    <div 
      className={`skeleton-loader ${className}`} 
      style={skeletonStyle}
      aria-hidden="true"
      data-testid="skeleton-loader"
    />
  );
};

SkeletonLoader.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  style: PropTypes.object
};

export default SkeletonLoader;