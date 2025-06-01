// backend/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const recommendationController = require('../controllers/recommendationController');

// Get personalized recommendations (requires authentication)
router.get('/personalized', authMiddleware, recommendationController.getPersonalizedRecommendations);

// Get trending recommendations (public, but uses authentication if available)
router.get('/trending', optionalAuthMiddleware, recommendationController.getTrendingRecommendations);

// Get similar items (public, but uses authentication if available)
router.get('/similar', optionalAuthMiddleware, recommendationController.getSimilarItems);

// Get search recommendations (public, but uses authentication if available)
router.get('/search', optionalAuthMiddleware, recommendationController.getSearchRecommendations);

// Record recommendation interaction (requires authentication)
router.post('/interaction', authMiddleware, recommendationController.recordInteraction);

// Update recommendation preferences (requires authentication)
router.post('/preferences', authMiddleware, recommendationController.updatePreferences);

module.exports = router;