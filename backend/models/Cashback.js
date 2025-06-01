const mongoose = require('mongoose');
const { Schema } = mongoose;

const cashbackSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  store: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  category: {
    type: String,
    trim: true
  },
  terms: {
    type: String
  },
  expiryDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},
{
  timestamps: true
});

// Virtual for checking if cashback is expired
cashbackSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual for checking if cashback is valid (not expired and still active)
cashbackSchema.virtual('isValid').get(function() {
  if (this.isExpired) return false;
  if (!this.isActive) return false;
  return true;
});

// Set virtuals to be included when converting to JSON
cashbackSchema.set('toJSON', { virtuals: true });
cashbackSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cashback', cashbackSchema);