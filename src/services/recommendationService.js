// src/services/recommendationService.js
import axios from 'axios';
import { getPreferredCurrency } from '../utils/currencyUtils';

/**
 * Service for fetching and managing AI-powered recommendations
 */
class RecommendationService {
  /**
   * Get personalized recommendations for the current user
   * @param {Object} options - Options for recommendations
   * @param {number} options.limit - Maximum number of recommendations to return
   * @param {string} options.type - Type of recommendations (coupons, stores, etc.)
   * @param {Array} options.categories - Categories to filter by
   * @returns {Promise<Array>} - Array of recommendations
   */
  async getPersonalizedRecommendations(options = {}) {
    try {
      const { limit = 10, type = 'all', categories = [] } = options;
      const currency = getPreferredCurrency();
      
      const response = await axios.get('/api/recommendations/personalized', {
        params: {
          limit,
          type,
          categories: categories.join(','),
          currency
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      throw error;
    }
  }
  
  /**
   * Get trending recommendations based on popular items
   * @param {Object} options - Options for recommendations
   * @param {number} options.limit - Maximum number of recommendations to return
   * @param {string} options.type - Type of recommendations (coupons, stores, etc.)
   * @returns {Promise<Array>} - Array of recommendations
   */
  async getTrendingRecommendations(options = {}) {
    try {
      const { limit = 10, type = 'all' } = options;
      const currency = getPreferredCurrency();
      
      const response = await axios.get('/api/recommendations/trending', {
        params: {
          limit,
          type,
          currency
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching trending recommendations:', error);
      throw error;
    }
  }
  
  /**
   * Get similar items based on a specific item
   * @param {Object} options - Options for recommendations
   * @param {string} options.itemId - ID of the item to find similar items for
   * @param {string} options.itemType - Type of the item (coupon, store, etc.)
   * @param {number} options.limit - Maximum number of recommendations to return
   * @returns {Promise<Array>} - Array of similar items
   */
  async getSimilarItems(options = {}) {
    try {
      const { itemId, itemType, limit = 5 } = options;
      
      if (!itemId || !itemType) {
        throw new Error('Item ID and type are required');
      }
      
      const response = await axios.get('/api/recommendations/similar', {
        params: {
          itemId,
          itemType,
          limit
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching similar items:', error);
      throw error;
    }
  }
  
  /**
   * Get recommendations based on search query
   * @param {Object} options - Options for recommendations
   * @param {string} options.query - Search query
   * @param {number} options.limit - Maximum number of recommendations to return
   * @returns {Promise<Array>} - Array of recommendations
   */
  async getSearchRecommendations(options = {}) {
    try {
      const { query, limit = 5 } = options;
      
      if (!query) {
        throw new Error('Search query is required');
      }
      
      const response = await axios.get('/api/recommendations/search', {
        params: {
          query,
          limit
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching search recommendations:', error);
      throw error;
    }
  }
  
  /**
   * Record user interaction with a recommendation
   * @param {Object} interaction - Interaction details
   * @param {string} interaction.recommendationId - ID of the recommendation
   * @param {string} interaction.action - Action taken (click, view, dismiss, etc.)
   * @returns {Promise<Object>} - Response data
   */
  async recordInteraction(interaction = {}) {
    try {
      const { recommendationId, action } = interaction;
      
      if (!recommendationId || !action) {
        throw new Error('Recommendation ID and action are required');
      }
      
      const response = await axios.post('/api/recommendations/interaction', {
        recommendationId,
        action,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error recording recommendation interaction:', error);
      // Don't throw error to prevent disrupting user experience
      return { success: false };
    }
  }
  
  /**
   * Update user preferences for recommendations
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} - Response data
   */
  async updatePreferences(preferences = {}) {
    try {
      const response = await axios.post('/api/recommendations/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating recommendation preferences:', error);
      throw error;
    }
  }
}

// Create singleton instance
const recommendationService = new RecommendationService();

export default recommendationService;