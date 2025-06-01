const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoriteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    enum: ['store', 'coupon', 'cashback', 'blog'],
    required: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    refPath: 'itemType',
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notifyOnExpiry: {
    type: Boolean,
    default: false
  },
  notifyOnUpdates: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only favorite an item once
favoriteSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

// Virtual to populate the referenced item
favoriteSchema.virtual('item', {
  refPath: 'itemType',
  localField: 'itemId',
  foreignField: '_id',
  justOne: true
});

// Set virtuals to be included when converting to JSON
favoriteSchema.set('toJSON', { virtuals: true });
favoriteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Favorite', favoriteSchema);