// src/Components/BlogSetupExample.jsx
import React from 'react';
import { BlogImageProvider } from '../context/BlogImageContext';
import ImagePreloader from './ImagePreloader';
import BlogPostExample from './BlogPostExample';

/**
 * Example component showing how to set up the BlogImageProvider
 * and ImagePreloader in your application
 */
const BlogSetupExample = () => {
  // Example blog posts data
  const blogPosts = [
    {
      id: 1,
      title: 'How to Save Money on Groceries',
      category: 'budget',
      date: 'June 15, 2023',
      excerpt: 'Learn the best strategies to save money on your grocery shopping...',
      slug: 'save-money-groceries',
      featured: true
    },
    {
      id: 2,
      title: 'Best Budget Beauty Products of 2023',
      category: 'beauty',
      date: 'June 10, 2023',
      excerpt: 'Discover affordable beauty products that work just as well as luxury brands...',
      slug: 'budget-beauty-products',
      featured: false
    },
    {
      id: 3,
      title: 'Tech Gadgets That Save You Money',
      category: 'tech',
      date: 'June 5, 2023',
      excerpt: 'These smart devices will help you save money in the long run...',
      slug: 'money-saving-tech-gadgets',
      featured: false
    }
  ];

  return (
    <BlogImageProvider>
      {/* The ImagePreloader component preloads all blog images */}
      <ImagePreloader />
      
      <div className="blog-container">
        <h1>CashHeros Blog</h1>
        
        <div className="blog-posts">
          {blogPosts.map(post => (
            <BlogPostExample key={post.id} post={post} />
          ))}
        </div>
      </div>
    </BlogImageProvider>
  );
};

export default BlogSetupExample;