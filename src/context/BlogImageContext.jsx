// src/context/BlogImageContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { getRandomImage, getFeaturedImage } from '../assets/images/blog/imageUrls';

// Create the context
const BlogImageContext = createContext();

/**
 * Provider component for blog images
 * This context provides functions to get images for blog posts
 * and maintains a cache of already assigned images to ensure consistency
 */
export const BlogImageProvider = ({ children }) => {
  // Cache to store assigned images for each post ID
  const [imageCache, setImageCache] = useState({});

  // Get an image for a specific post, using category
  const getImageForPost = (postId, category) => {
    // If we already have an image assigned to this post, return it
    if (imageCache[postId]) {
      return imageCache[postId];
    }

    // Otherwise, get a random image for this category
    const image = getRandomImage(category);
    
    // Cache the image for this post ID
    setImageCache(prev => ({
      ...prev,
      [postId]: image
    }));

    return image;
  };

  // Get a featured image (for hero sections)
  const getFeaturedImageForPost = (postId) => {
    // If we already have a featured image assigned to this post, return it
    if (imageCache[`featured-${postId}`]) {
      return imageCache[`featured-${postId}`];
    }

    // Otherwise, get a featured image
    const image = getFeaturedImage();
    
    // Cache the featured image for this post ID
    setImageCache(prev => ({
      ...prev,
      [`featured-${postId}`]: image
    }));

    return image;
  };

  // Clear the image cache (useful when testing)
  const clearImageCache = () => {
    setImageCache({});
  };

  // The context value
  const value = {
    getImageForPost,
    getFeaturedImageForPost,
    clearImageCache,
    imageCache
  };

  return (
    <BlogImageContext.Provider value={value}>
      {children}
    </BlogImageContext.Provider>
  );
};

// Custom hook to use the blog image context
export const useBlogImages = () => {
  const context = useContext(BlogImageContext);
  if (!context) {
    throw new Error('useBlogImages must be used within a BlogImageProvider');
  }
  return context;
};

export default BlogImageContext;