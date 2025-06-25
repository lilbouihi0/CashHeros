// backend/models/Recommendation.js
const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['interest_based', 'behavior_based', 'trending', 'similar_users', 'custom'],
    required: true
  },
  items: {
    type: [
      {
        itemId: String,
        itemType: {
          type: String,
          enum: ['coupon', 'cashback', 'store', 'blog']
        },
        score: Number,
        reason: String
      }
    ],
    default: []
  },
  interests: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'delivered', 'interacted', 'expired'],
    default: 'pending'
  },
  deliveredAt: {
    type: Date
  },
  interactedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create indexes for common queries
RecommendationSchema.index({ userId: 1, createdAt: -1 });
RecommendationSchema.index({ status: 1 });
RecommendationSchema.index({ type: 1, status: 1 });

// TTL index to automatically delete old recommendations (30 days)
RecommendationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Recommendation', RecommendationSchema);