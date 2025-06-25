/**
 * @module models/Coupon
 * @description Coupon model for storing coupon codes and offers
 */

const mongoose = require('mongoose');

/**
 * Coupon Schema
 * @typedef {Object} CouponSchema
 * @property {string} code - Unique coupon code (automatically converted to uppercase)
 * @property {string} title - Coupon title or headline
 * @property {string} description - Detailed description of the coupon offer
 * @property {number} discount - Discount amount (percentage between 0-100)
 * @property {string} discountType - Type of discount ('percentage' or 'fixed')
 * @property {ObjectId} store - Reference to the store offering this coupon
 * @property {Date} expiryDate - Date when the coupon expires
 * @property {Date} startDate - Date when the coupon becomes active
 * @property {boolean} isActive - Whether the coupon is currently active
 * @property {boolean} isExclusive - Whether this is an exclusive offer
 * @property {number|null} usageLimit - Maximum number of times the coupon can be used (null = unlimited)
 * @property {number} usageCount - Current number of times the coupon has been used
 * @property {string} category - Category the coupon belongs to
 * @property {string[]} tags - Tags for search and categorization
 * @property {number} successRate - Success rate percentage
 * @property {number} popularityScore - Calculated popularity score
 * @property {ObjectId} createdBy - Reference to the admin user who created the coupon
 * @property {Date} createdAt - Timestamp when the coupon was created
 * @property {Date} updatedAt - Timestamp when the coupon was last updated
 */
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    validate: {
      validator: function(v) {
        return /^[A-Z0-9_-]+$/.test(v);
      },
      message: props => `${props.value} is not a valid coupon code. Use only letters, numbers, underscores and hyphens.`
    }
  },
  title: {
    type: String,
    required: [true, 'Coupon title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  discount: {
    type: Number,
    required: [true, 'Discount amount is required'],
    min: [0, 'Discount must be a positive number'],
    max: [100, 'Discount percentage cannot exceed 100'],
    validate: {
      validator: function(v) {
        if (this.discountType === 'percentage') {
          return v >= 0 && v <= 100;
        }
        return v >= 0;
      },
      message: props => `${props.value} is not a valid discount value for ${props.discountType} type`
    }
  },
  discountType: {
    type: String,
    enum: {
      values: ['percentage', 'fixed'],
      message: '{VALUE} is not a valid discount type'
    },
    default: 'percentage'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store is required']
  },
  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
      },
      message: props => `${props.value} is not a valid URL`
    }
  },
  terms: {
    type: String,
    trim: true,
    maxlength: [2000, 'Terms cannot exceed 2000 characters']
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/undefined
        if (this.startDate) {
          return v > this.startDate;
        }
        return v > new Date();
      },
      message: 'Expiry date must be in the future and after start date'
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isExclusive: {
    type: Boolean,
    default: false
  },
  usageLimit: {
    type: Number,
    default: null,
    validate: {
      validator: function(v) {
        if (v === null) return true; // Allow null for unlimited
        return v > 0 && Number.isInteger(v);
      },
      message: 'Usage limit must be a positive integer or null for unlimited'
    }
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v >= 0;
      },
      message: 'Usage count must be a non-negative integer'
    }
  },
  category: {
    type: String,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  successRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  popularityScore: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

/**
 * Virtual property to check if the coupon is expired
 * @returns {boolean} True if the coupon is expired, false otherwise
 */
couponSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

/**
 * Virtual property to check if the coupon is valid
 * A coupon is valid if it's not expired, is active, and hasn't reached its usage limit
 * @returns {boolean} True if the coupon is valid, false otherwise
 */
couponSchema.virtual('isValid').get(function() {
  if (this.isExpired) return false;
  if (!this.isActive) return false;
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) return false;
  
  // Check if coupon is within its valid date range
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  
  return true;
});

/**
 * Virtual property to get remaining uses
 * @returns {number|string} Number of remaining uses or 'Unlimited'
 */
couponSchema.virtual('remainingUses').get(function() {
  if (this.usageLimit === null) return 'Unlimited';
  return Math.max(0, this.usageLimit - this.usageCount);
});

/**
 * Virtual property to get discount display text
 * @returns {string} Formatted discount text
 */
couponSchema.virtual('discountDisplay').get(function() {
  if (this.discountType === 'percentage') {
    return `${this.discount}%`;
  } else {
    return `$${this.discount.toFixed(2)}`;
  }
});

/**
 * Pre-save middleware to validate and prepare coupon data
 */
couponSchema.pre('save', function(next) {
  // Ensure code is uppercase
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase();
  }
  
  // Calculate popularity score if not set
  if (!this.popularityScore || this.isModified('usageCount') || this.isModified('successRate')) {
    // Simple algorithm: (usageCount * successRate / 100)
    this.popularityScore = (this.usageCount * this.successRate) / 100;
  }
  
  // Ensure tags are unique
  if (this.isModified('tags')) {
    this.tags = [...new Set(this.tags)];
  }
  
  next();
});

/**
 * Method to increment usage count
 * @returns {Promise} Updated coupon
 */
couponSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  return this.save();
};

/**
 * Method to check if coupon can be used
 * @param {Object} options - Options for validation
 * @param {Date} options.currentDate - Date to check against (defaults to now)
 * @returns {Object} Result with isValid flag and message
 */
couponSchema.methods.validateForUse = function(options = {}) {
  const currentDate = options.currentDate || new Date();
  
  if (!this.isActive) {
    return { isValid: false, message: 'This coupon is not active' };
  }
  
  if (this.startDate && currentDate < this.startDate) {
    return { isValid: false, message: 'This coupon is not yet active' };
  }
  
  if (this.expiryDate && currentDate > this.expiryDate) {
    return { isValid: false, message: 'This coupon has expired' };
  }
  
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
    return { isValid: false, message: 'This coupon has reached its usage limit' };
  }
  
  return { isValid: true, message: 'Coupon is valid' };
};

// Set virtuals to be included when converting to JSON
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

// Create text index for search
couponSchema.index(
  { title: 'text', description: 'text', code: 'text', category: 'text', tags: 'text' },
  { 
    weights: { 
      code: 10,
      title: 5,
      description: 3,
      category: 2,
      tags: 1
    },
    name: 'coupon_text_search'
  }
);

// Create compound indexes for common queries
couponSchema.index({ isActive: 1, expiryDate: 1 });
couponSchema.index({ store: 1, isActive: 1 });
couponSchema.index({ category: 1, isActive: 1 });
couponSchema.index({ popularityScore: -1 });

/**
 * Coupon model
 * @type {Model<CouponSchema>}
 */
module.exports = mongoose.model('Coupon', couponSchema);