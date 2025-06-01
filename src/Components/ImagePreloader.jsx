// src/Components/ImagePreloader.jsx
import React, { useEffect } from 'react';
import { blogImages } from '../assets/images/blog/imageUrls';

/**
 * ImagePreloader component that preloads all blog images in the background
 * to improve user experience when navigating through the blog
 */
const ImagePreloader = () => {
  useEffect(() => {
    // Function to preload an image
    const preloadImage = (src) => {
      const img = new Image();
      img.src = src;
    };

    // Preload all images from the blogImages object
    const preloadAllImages = () => {
      // Preload default and hero images
      preloadImage(blogImages.default);
      preloadImage(blogImages.hero);
      
      // Preload all category images
      Object.keys(blogImages).forEach(category => {
        if (Array.isArray(blogImages[category])) {
          blogImages[category].forEach(imageSrc => {
            preloadImage(imageSrc);
          });
        }
      });
      
      console.log('All blog images preloaded successfully');
    };

    // Start preloading images
    preloadAllImages();
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default ImagePreloader;