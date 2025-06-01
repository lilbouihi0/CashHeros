// src/hooks/useRecommendations.js
import { useState, useEffect, useCallback } from 'react';
import recommendationService from '../services/recommendationService';
import useAnalytics from './useAnalytics';

/**
 * Hook for using AI-powered recommendations in React components
 * @param {Object} options - Options for recommendations
 * @param {string} options.type - Type of recommendations to fetch (personalized, trending, similar, search)
 * @param {Object} options.params - Parameters for the recommendation request
 * @returns {Object} - Recommendation data and functions
 */
export const useRecommendations = (options = {}) => {
  const { type = 'personalized', params = {} } = options;
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { trackEvent } = useAnalytics();
  
  // Fetch recommendations based on type
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data = [];
      
      switch (type) {
        case 'personalized':
          data = await recommendationService.getPersonalizedRecommendations(params);
          break;
        case 'trending':
          data = await recommendationService.getTrendingRecommendations(params);
          break;
        case 'similar':
          data = await recommendationService.getSimilarItems(params);
          break;
        case 'search':
          data = await recommendationService.getSearchRecommendations(params);
          break;
        default:
          data = await recommendationService.getPersonalizedRecommendations(params);
      }
      
      setRecommendations(data);
      
      // Track recommendation impression
      trackEvent('recommendation_impression', {
        recommendationType: type,
        count: data.length,
        ...params
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations');
      console.error('Error in useRecommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [type, params, trackEvent]);
  
  // Fetch recommendations on mount and when dependencies change
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);
  
  // Record interaction with a recommendation
  const recordInteraction = useCallback(async (recommendationId, action) => {
    try {
      await recommendationService.recordInteraction({
        recommendationId,
        action
      });
      
      // Track interaction in analytics
      trackEvent('recommendation_interaction', {
        recommendationId,
        action,
        recommendationType: type
      });
      
      return true;
    } catch (err) {
      console.error('Error recording recommendation interaction:', err);
      return false;
    }
  }, [type, trackEvent]);
  
  // Handle recommendation click
  const handleRecommendationClick = useCallback((recommendation) => {
    if (recommendation && recommendation.id) {
      recordInteraction(recommendation.id, 'click');
    }
  }, [recordInteraction]);
  
  // Refresh recommendations
  const refreshRecommendations = useCallback(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);
  
  return {
    recommendations,
    loading,
    error,
    recordInteraction,
    handleRecommendationClick,
    refreshRecommendations
  };
};

export default useRecommendations;