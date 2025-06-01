import React from 'react';
import PropTypes from 'prop-types';
import { handleImageError } from '../../utils/imageUtils';

/**
 * Enhanced Image component with built-in error handling and placeholders
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const Image = ({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  style, 
  lazy = true,
  ...rest 
}) => {
  return (
    <img
      src={src}
      alt={alt || 'Image'}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={handleImageError}
      loading={lazy ? 'lazy' : 'eager'}
      {...rest}
    />
  );
};

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  style: PropTypes.object,
  lazy: PropTypes.bool
};

export default Image;