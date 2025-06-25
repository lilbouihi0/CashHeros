const mongoose = require('mongoose');
const { Schema } = mongoose;

const storeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  logo: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  categories: [{
    type: String,
    trim: true
  }],
  affiliateLink: {
    type: String,
    trim: true
  },
  cashbackPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  socialMedia: {
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    pinterest: { type: String }
  },
  contactInfo: {
    email: { type: String },
    phone: { type: String },
    address: { type: String }
  },
  termsAndConditions: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create text index for search functionality
storeSchema.index({ name: 'text', description: 'text', categories: 'text' });

// Virtual for getting all coupons for this store
storeSchema.virtual('coupons', {
  ref: 'Coupon',
  localField: 'name',
  foreignField: 'store.name'
});

// Virtual for getting all cashback offers for this store
storeSchema.virtual('cashbacks', {
  ref: 'Cashback',
  localField: 'name',
  foreignField: 'store.name'
});

// Set virtuals to be included when converting to JSON
storeSchema.set('toJSON', { virtuals: true });
storeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Store', storeSchema);