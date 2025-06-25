// backend/controllers/recommendationController.js
const mongoose = require('mongoose');
const { logger } = require('../middleware/loggingMiddleware');

// Import models
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Store = require('../models/Store');
const Cashback = require('../models/Cashback');
const Blog = require('../models/Blog');
const UserProfile = require('../models/UserProfile');
const Recommendation = require('../models/Recommendation');
const AnalyticsEvent = require('../models/AnalyticsEvent');

// Controller object
const recommendationController = {
    /**
     * Calculate recommendation score based on user profile
     * @param {Object} item - The item to score
     * @param {Object} userProfile - The user profile
     * @returns {Number} - The recommendation score
     */
    calculateRecommendationScore: (item, userProfile) => {
        // Default score
        let score = 0.5;

        // If no user profile, return default score
        if (!userProfile) {
            return score;
        }

        // Get item category
        const category = item.category || (item.categories ? item.categories[0] : null);

        // If no category, return default score
        if (!category) {
            return score;
        }

        // Check if user has interest in this category
        if (userProfile.interests && userProfile.interests[category]) {
            // Boost score based on interest level (0-1)
            score += userProfile.interests[category] / 100;
        }

        // Adjust score based on item popularity/usage
        if (item.usageCount) {
            score += Math.min(item.usageCount / 1000, 0.3);
        } else if (item.popularity) {
            score += Math.min(item.popularity / 100, 0.3);
        }

        // Cap score at 1.0
        return Math.min(score, 1.0);
    },

    /**
     * Record recommendation event for analytics
     * @param {String} userId - The user ID
     * @param {String} recommendationType - The type of recommendation
     * @param {Array} recommendations - The recommendations delivered
     * @param {Object} additionalData - Additional data to record
     */
    recordRecommendationEvent: async (userId, recommendationType, recommendations, additionalData = {}) => {
        try {
            // Create recommendation record
            const recommendation = new Recommendation({
                userId,
                type: recommendationType,
                items: recommendations.map(item => ({
                    itemId: item.id,
                    itemType: item.type,
                    score: item.score || 0,
                    reason: 'AI recommendation'
                })),
                status: 'delivered',
                deliveredAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });

            await recommendation.save();

            // Record analytics event
            await AnalyticsEvent.create({
                eventType: 'recommendation_delivery',
                eventData: {
                    recommendationId: recommendation._id,
                    recommendationType,
                    itemCount: recommendations.length,
                    ...additionalData
                },
                userId,
                timestamp: new Date()
            });
        } catch (error) {
            logger.error('Error recording recommendation event:', error);
        }
    },

    /**
     * Get personalized recommendations for the current user
     * @route GET /api/recommendations/personalized
     * @access Private
     */
    getPersonalizedRecommendations: async (req, res) => {
        try {
            const userId = req.user.id;
            const { limit = 10, type = 'all', categories = '' } = req.query;

            // Parse categories if provided
            const categoryFilter = categories ? categories.split(',') : [];

            // Get user profile for personalization
            const userProfile = await UserProfile.findOne({ userId });

            // If no user profile exists, return trending recommendations
            if (!userProfile) {
                return recommendationController.getTrendingRecommendations(req, res);
            }

            // Get user interests from profile
            const userInterests = Object.entries(userProfile.interests || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([category]) => category);

            // Combine with requested categories
            const combinedCategories = [...new Set([...userInterests, ...categoryFilter])];

            // Get recommendations based on user interests
            let recommendations = [];

            // Apply type filter
            if (type === 'all' || type === 'coupons') {
                // Get coupon recommendations
                const couponRecommendations = await Coupon.find({
                    isActive: true,
                    expiryDate: { $gt: new Date() },
                    ...(combinedCategories.length > 0 ? { category: { $in: combinedCategories } } : {})
                })
                    .sort({ usageCount: -1 })
                    .limit(parseInt(limit))
                    .populate('store', 'name logo')
                    .lean();

                // Transform coupons to recommendation format
                const formattedCoupons = couponRecommendations.map(coupon => ({
                    id: coupon._id,
                    type: 'coupon',
                    title: coupon.title,
                    description: coupon.description,
                    discount: coupon.discount,
                    expiryDate: coupon.expiryDate,
                    store: coupon.store,
                    category: coupon.category,
                    score: recommendationController.calculateRecommendationScore(coupon, userProfile)
                }));

                recommendations = [...recommendations, ...formattedCoupons];
            }

            if (type === 'all' || type === 'stores') {
                // Get store recommendations
                const storeRecommendations = await Store.find({
                    isActive: true,
                    ...(combinedCategories.length > 0 ? { categories: { $in: combinedCategories } } : {})
                })
                    .sort({ popularity: -1 })
                    .limit(parseInt(limit))
                    .lean();

                // Transform stores to recommendation format
                const formattedStores = storeRecommendations.map(store => ({
                    id: store._id,
                    type: 'store',
                    name: store.name,
                    description: store.description,
                    logo: store.logo,
                    cashbackRate: store.cashbackRate,
                    categories: store.categories,
                    score: recommendationController.calculateRecommendationScore(store, userProfile)
                }));

                recommendations = [...recommendations, ...formattedStores];
            }

            if (type === 'all' || type === 'cashbacks') {
                // Get cashback recommendations
                const cashbackRecommendations = await Cashback.find({
                    isActive: true,
                    ...(combinedCategories.length > 0 ? { category: { $in: combinedCategories } } : {})
                })
                    .sort({ amount: -1 })
                    .limit(parseInt(limit))
                    .populate('store', 'name logo')
                    .lean();

                // Transform cashbacks to recommendation format
                const formattedCashbacks = cashbackRecommendations.map(cashback => ({
                    id: cashback._id,
                    type: 'cashback',
                    title: cashback.title,
                    description: cashback.description,
                    rate: cashback.rate,
                    store: cashback.store,
                    category: cashback.category,
                    score: recommendationController.calculateRecommendationScore(cashback, userProfile)
                }));

                recommendations = [...recommendations, ...formattedCashbacks];
            }

            // Sort recommendations by score and limit results
            recommendations.sort((a, b) => b.score - a.score);
            recommendations = recommendations.slice(0, parseInt(limit));

            // Record recommendation event
            recommendationController.recordRecommendationEvent(userId, 'personalized', recommendations);

            return res.status(200).json({
                success: true,
                data: recommendations
            });
        } catch (error) {
            logger.error('Error getting personalized recommendations:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get personalized recommendations'
            });
        }
    },

    /**
     * Get trending recommendations
     * @route GET /api/recommendations/trending
     * @access Public
     */
    getTrendingRecommendations: async (req, res) => {
        try {
            const { limit = 10, type = 'all' } = req.query;
            const userId = req.user ? req.user.id : null;

            // Get trending recommendations
            let recommendations = [];

            // Apply type filter
            if (type === 'all' || type === 'coupons') {
                // Get trending coupons
                const trendingCoupons = await Coupon.find({
                    isActive: true,
                    expiryDate: { $gt: new Date() }
                })
                    .sort({ usageCount: -1, createdAt: -1 })
                    .limit(parseInt(limit))
                    .populate('store', 'name logo')
                    .lean();

                // Transform coupons to recommendation format
                const formattedCoupons = trendingCoupons.map(coupon => ({
                    id: coupon._id,
                    type: 'coupon',
                    title: coupon.title,
                    description: coupon.description,
                    discount: coupon.discount,
                    expiryDate: coupon.expiryDate,
                    store: coupon.store,
                    category: coupon.category,
                    score: coupon.usageCount / 100 // Simple score based on usage count
                }));

                recommendations = [...recommendations, ...formattedCoupons];
            }

            if (type === 'all' || type === 'stores') {
                // Get trending stores
                const trendingStores = await Store.find({
                    isActive: true
                })
                    .sort({ popularity: -1 })
                    .limit(parseInt(limit))
                    .lean();

                // Transform stores to recommendation format
                const formattedStores = trendingStores.map(store => ({
                    id: store._id,
                    type: 'store',
                    name: store.name,
                    description: store.description,
                    logo: store.logo,
                    cashbackRate: store.cashbackRate,
                    categories: store.categories,
                    score: store.popularity / 100 // Simple score based on popularity
                }));

                recommendations = [...recommendations, ...formattedStores];
            }

            // Sort recommendations by score and limit results
            recommendations.sort((a, b) => b.score - a.score);
            recommendations = recommendations.slice(0, parseInt(limit));

            // Record recommendation event if user is authenticated
            if (userId) {
                recommendationController.recordRecommendationEvent(userId, 'trending', recommendations);
            }

            return res.status(200).json({
                success: true,
                data: recommendations
            });
        } catch (error) {
            logger.error('Error getting trending recommendations:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get trending recommendations'
            });
        }
    },

    /**
     * Get similar items
     * @route GET /api/recommendations/similar
     * @access Public
     */
    getSimilarItems: async (req, res) => {
        try {
            const { itemId, itemType, limit = 5 } = req.query;
            const userId = req.user ? req.user.id : null;

            if (!itemId || !itemType) {
                return res.status(400).json({
                    success: false,
                    message: 'Item ID and type are required'
                });
            }

            // Get similar items based on type
            let similarItems = [];

            switch (itemType) {
                case 'coupon':
                    // Get coupon details
                    const coupon = await Coupon.findById(itemId).lean();

                    if (!coupon) {
                        return res.status(404).json({
                            success: false,
                            message: 'Coupon not found'
                        });
                    }

                    // Find similar coupons by category and store
                    similarItems = await Coupon.find({
                        _id: { $ne: itemId },
                        isActive: true,
                        expiryDate: { $gt: new Date() },
                        $or: [
                            { category: coupon.category },
                            { 'store._id': coupon.store._id }
                        ]
                    })
                        .sort({ usageCount: -1 })
                        .limit(parseInt(limit))
                        .populate('store', 'name logo')
                        .lean();

                    // Transform to recommendation format
                    similarItems = similarItems.map(item => ({
                        id: item._id,
                        type: 'coupon',
                        title: item.title,
                        description: item.description,
                        discount: item.discount,
                        expiryDate: item.expiryDate,
                        store: item.store,
                        category: item.category
                    }));
                    break;

                case 'store':
                    // Get store details
                    const store = await Store.findById(itemId).lean();

                    if (!store) {
                        return res.status(404).json({
                            success: false,
                            message: 'Store not found'
                        });
                    }

                    // Find similar stores by category
                    similarItems = await Store.find({
                        _id: { $ne: itemId },
                        isActive: true,
                        categories: { $in: store.categories }
                    })
                        .sort({ popularity: -1 })
                        .limit(parseInt(limit))
                        .lean();

                    // Transform to recommendation format
                    similarItems = similarItems.map(item => ({
                        id: item._id,
                        type: 'store',
                        name: item.name,
                        description: item.description,
                        logo: item.logo,
                        cashbackRate: item.cashbackRate,
                        categories: item.categories
                    }));
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid item type'
                    });
            }

            // Record recommendation event if user is authenticated
            if (userId) {
                recommendationController.recordRecommendationEvent(userId, 'similar', similarItems, {
                    sourceItemId: itemId,
                    sourceItemType: itemType
                });
            }

            return res.status(200).json({
                success: true,
                data: similarItems
            });
        } catch (error) {
            logger.error('Error getting similar items:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get similar items'
            });
        }
    },

    /**
     * Get search recommendations
     * @route GET /api/recommendations/search
     * @access Public
     */
    getSearchRecommendations: async (req, res) => {
        try {
            const { query, limit = 5 } = req.query;
            const userId = req.user ? req.user.id : null;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            // Create search regex
            const searchRegex = new RegExp(query, 'i');

            // Search for coupons
            const coupons = await Coupon.find({
                isActive: true,
                expiryDate: { $gt: new Date() },
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { code: searchRegex }
                ]
            })
                .sort({ usageCount: -1 })
                .limit(parseInt(limit))
                .populate('store', 'name logo')
                .lean();

            // Search for stores
            const stores = await Store.find({
                isActive: true,
                $or: [
                    { name: searchRegex },
                    { description: searchRegex }
                ]
            })
                .sort({ popularity: -1 })
                .limit(parseInt(limit))
                .lean();

            // Combine and format results
            const recommendations = [
                ...coupons.map(coupon => ({
                    id: coupon._id,
                    type: 'coupon',
                    title: coupon.title,
                    description: coupon.description,
                    discount: coupon.discount,
                    expiryDate: coupon.expiryDate,
                    store: coupon.store,
                    category: coupon.category
                })),
                ...stores.map(store => ({
                    id: store._id,
                    type: 'store',
                    name: store.name,
                    description: store.description,
                    logo: store.logo,
                    cashbackRate: store.cashbackRate,
                    categories: store.categories
                }))
            ].slice(0, parseInt(limit));

            // Record recommendation event if user is authenticated
            if (userId) {
                recommendationController.recordRecommendationEvent(userId, 'search', recommendations, { query });
            }

            return res.status(200).json({
                success: true,
                data: recommendations
            });
        } catch (error) {
            logger.error('Error getting search recommendations:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get search recommendations'
            });
        }
    },

    /**
     * Record recommendation interaction
     * @route POST /api/recommendations/interaction
     * @access Private
     */
    recordInteraction: async (req, res) => {
        try {
            const userId = req.user.id;
            const { recommendationId, action, timestamp } = req.body;

            if (!recommendationId || !action) {
                return res.status(400).json({
                    success: false,
                    message: 'Recommendation ID and action are required'
                });
            }

            // Find recommendation
            const recommendation = await Recommendation.findById(recommendationId);

            if (!recommendation) {
                return res.status(404).json({
                    success: false,
                    message: 'Recommendation not found'
                });
            }

            // Update recommendation status based on action
            if (action === 'click') {
                recommendation.status = 'interacted';
                recommendation.interactedAt = timestamp || new Date();
            } else if (action === 'dismiss') {
                recommendation.status = 'dismissed';
            }

            await recommendation.save();

            // Record interaction in analytics
            await AnalyticsEvent.create({
                eventType: 'recommendation_interaction',
                eventData: {
                    recommendationId,
                    action,
                    timestamp: timestamp || new Date()
                },
                userId,
                timestamp: timestamp || new Date()
            });

            return res.status(200).json({
                success: true,
                message: 'Interaction recorded successfully'
            });
        } catch (error) {
            logger.error('Error recording recommendation interaction:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to record interaction'
            });
        }
    },

    /**
     * Update user recommendation preferences
     * @route POST /api/recommendations/preferences
     * @access Private
     */
    updatePreferences: async (req, res) => {
        try {
            const userId = req.user.id;
            const preferences = req.body;

            // Get user profile
            let userProfile = await UserProfile.findOne({ userId });

            // Create profile if it doesn't exist
            if (!userProfile) {
                userProfile = new UserProfile({
                    userId,
                    preferences: {},
                    interests: {},
                    behavior: {
                        pageViews: {},
                        couponInteractions: {},
                        searches: [],
                        lastActive: new Date()
                    }
                });
            }

            // Update recommendation preferences
            userProfile.recommendationPreferences = {
                ...userProfile.recommendationPreferences,
                ...preferences
            };

            // Save updated profile
            await userProfile.save();

            return res.status(200).json({
                success: true,
                message: 'Preferences updated successfully'
            });
        } catch (error) {
            logger.error('Error updating recommendation preferences:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update preferences'
            });
        }
    }
};

module.exports = recommendationController;