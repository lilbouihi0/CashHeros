// backend/models/UserProfile.js
const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  preferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  interests: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  behavior: {
    pageViews: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    couponInteractions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    searches: {
      type: [
        {
          query: String,
          timestamp: Date
        }
      ],
      default: []
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  segments: {
    type: [String],
    default: []
  },
  recommendationPreferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'never'],
      default: 'weekly'
    },
    channels: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      }
    },
    categories: {
      type: [String],
      default: []
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for common queries
UserProfileSchema.index({ 'behavior.lastActive': -1 });
UserProfileSchema.index({ segments: 1 });

module.exports = mongoose.model('UserProfile', UserProfileSchema);