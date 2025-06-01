/**
 * Blog Service
 * 
 * This service handles all blog-related API calls
 */

import apiService from './api';

// Use the centralized API service
const api = apiService.instance;

const blogService = {
  /**
   * Get all blog posts with pagination, filtering, and sorting
   * 
   * @param {number} page - Page number
   * @param {number} limit - Number of items per page
   * @param {Object} filters - Filter options
   * @returns {Promise} - Promise that resolves to paginated blog posts
   */
  getBlogPosts: async (page = 1, limit = 10, filters = {}) => {
    try {
      const { search, category, tag, sort, direction, isPublished } = filters;
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (tag) params.append('tag', tag);
      if (sort) params.append('sort', sort);
      if (direction) params.append('direction', direction);
      if (isPublished !== undefined) params.append('isPublished', isPublished);
      
      const response = await api.get(`/blogs?${params.toString()}`);
      
      // Return the full response data to preserve pagination metadata
      return response.data;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  },
  
  /**
   * Get a single blog post by ID
   * 
   * @param {string} id - Blog post ID
   * @returns {Promise} - Promise that resolves to the blog post
   */
  getBlogPostById: async (id) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blog post with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new blog post
   * 
   * @param {Object} blogData - Blog post data
   * @returns {Promise} - Promise that resolves to the created blog post
   */
  createBlogPost: async (blogData) => {
    try {
      const response = await api.post('/blogs', blogData);
      return response.data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing blog post
   * 
   * @param {string} id - Blog post ID
   * @param {Object} blogData - Updated blog post data
   * @returns {Promise} - Promise that resolves to the updated blog post
   */
  updateBlogPost: async (id, blogData) => {
    try {
      const response = await api.put(`/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      console.error(`Error updating blog post with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a blog post
   * 
   * @param {string} id - Blog post ID
   * @returns {Promise} - Promise that resolves to success message
   */
  deleteBlogPost: async (id) => {
    try {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting blog post with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Toggle blog post publish status
   * 
   * @param {string} id - Blog post ID
   * @param {boolean} published - New publish status
   * @returns {Promise} - Promise that resolves to the updated blog post
   */
  toggleBlogPublishStatus: async (id, published) => {
    try {
      const response = await api.patch(`/admin/blogs/${id}/publish`, { published });
      return response.data;
    } catch (error) {
      console.error(`Error toggling publish status for blog post with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Toggle blog post featured status
   * 
   * @param {string} id - Blog post ID
   * @param {boolean} featured - New featured status
   * @returns {Promise} - Promise that resolves to the updated blog post
   */
  toggleBlogFeatureStatus: async (id, featured) => {
    try {
      const response = await api.patch(`/admin/blogs/${id}/feature`, { featured });
      return response.data;
    } catch (error) {
      console.error(`Error toggling featured status for blog post with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get popular blog posts
   * 
   * @param {number} limit - Number of posts to retrieve
   * @returns {Promise} - Promise that resolves to popular blog posts
   */
  getPopularBlogPosts: async (limit = 5) => {
    try {
      const response = await api.get(`/blogs/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular blog posts:', error);
      throw error;
    }
  },
  
  /**
   * Get blog posts by category
   * 
   * @param {string} category - Category name
   * @param {number} page - Page number
   * @param {number} limit - Number of items per page
   * @returns {Promise} - Promise that resolves to blog posts in the category
   */
  getBlogPostsByCategory: async (category, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/blogs/category/${category}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blog posts in category ${category}:`, error);
      throw error;
    }
  },
  
  /**
   * Get blog posts by tag
   * 
   * @param {string} tag - Tag name
   * @param {number} page - Page number
   * @param {number} limit - Number of items per page
   * @returns {Promise} - Promise that resolves to blog posts with the tag
   */
  getBlogPostsByTag: async (tag, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/blogs/tags/${tag}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blog posts with tag ${tag}:`, error);
      throw error;
    }
  },
  
  /**
   * Increment view count for a blog post
   * 
   * @param {string} id - Blog post ID
   * @returns {Promise} - Promise that resolves to updated view count
   */
  incrementViewCount: async (id) => {
    try {
      const response = await api.post(`/blogs/${id}/view`);
      return response.data;
    } catch (error) {
      console.error(`Error incrementing view count for blog post with ID ${id}:`, error);
      // Don't throw error for view count - just log it
      return { success: false };
    }
  }
};

export default blogService;