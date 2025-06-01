// src/Components/BlogPostExample.jsx
import React from 'react';
import { useBlogImages } from '../context/BlogImageContext';

/**
 * Example component showing how to use the BlogImageContext
 * to get consistent images for blog posts
 */
const BlogPostExample = ({ post }) => {
  const { getImageForPost, getFeaturedImageForPost } = useBlogImages();
  
  // Get an image based on the post's category
  const postImage = getImageForPost(post.id, post.category);
  
  // For featured posts, get a featured image
  const featuredImage = post.featured 
    ? getFeaturedImageForPost(post.id)
    : null;
  
  return (
    <article className="blog-post">
      {post.featured && (
        <div className="featured-image-container">
          <img 
            src={featuredImage} 
            alt={`Featured: ${post.title}`} 
            className="featured-image"
          />
          <span className="featured-badge">Featured</span>
        </div>
      )}
      
      <div className="post-image-container">
        <img 
          src={postImage} 
          alt={post.title} 
          className="post-image"
        />
      </div>
      
      <div className="post-content">
        <h2>{post.title}</h2>
        <p className="post-meta">
          <span className="category">{post.category}</span>
          <span className="date">{post.date}</span>
        </p>
        <p className="excerpt">{post.excerpt}</p>
        <a href={`/blog/${post.slug}`} className="read-more">
          Read More
        </a>
      </div>
    </article>
  );
};

export default BlogPostExample;