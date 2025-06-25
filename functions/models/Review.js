const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    enum: ['store', 'coupon', 'cashback'],
    required: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    refPath: 'itemType',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  pros: [{
    type: String,
    trim: true
  }],
  cons: [{
    type: String,
    trim: true
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  unhelpfulVotes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNotes: {
    type: String
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only review an item once
reviewSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

// Create an index for faster queries on item type and ID
reviewSchema.index({ itemType: 1, itemId: 1 });

// Virtual to populate the referenced item
reviewSchema.virtual('item', {
  refPath: 'itemType',
  localField: 'itemId',
  foreignField: '_id',
  justOne: true
});

// Virtual for helpfulness score
reviewSchema.virtual('helpfulnessScore').get(function() {
  const total = this.helpfulVotes + this.unhelpfulVotes;
  if (total === 0) return 0;
  return (this.helpfulVotes / total) * 100;
});

// Set virtuals to be included when converting to JSON
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);