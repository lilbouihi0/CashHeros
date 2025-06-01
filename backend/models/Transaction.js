/**
 * @module models/Transaction
 * @description Transaction model for tracking user cashback transactions
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Status history schema for tracking transaction status changes
 */
const statusHistorySchema = new Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'paid'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  note: {
    type: String,
    trim: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: true });

/**
 * Transaction Schema
 * @typedef {Object} TransactionSchema
 */
const transactionSchema = new Schema({
  // User who earned the cashback
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  
  // Store where the transaction occurred
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store is required'],
    index: true
  },
  
  // Transaction amount
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0, 'Amount must be a positive number'],
    validate: {
      validator: function(value) {
        return value >= 0 && Number.isFinite(value);
      },
      message: 'Amount must be a valid positive number'
    }
  },
  
  // Cashback amount earned
  cashbackAmount: {
    type: Number,
    required: [true, 'Cashback amount is required'],
    min: [0, 'Cashback amount must be a positive number'],
    validate: {
      validator: function(value) {
        return value >= 0 && Number.isFinite(value);
      },
      message: 'Cashback amount must be a valid positive number'
    }
  },
  
  // Cashback percentage applied
  cashbackPercentage: {
    type: Number,
    required: [true, 'Cashback percentage is required'],
    min: [0, 'Cashback percentage must be between 0 and 100'],
    max: [100, 'Cashback percentage must be between 0 and 100'],
    validate: {
      validator: function(value) {
        return value >= 0 && value <= 100 && Number.isFinite(value);
      },
      message: 'Cashback percentage must be a valid number between 0 and 100'
    }
  },
  
  // External order reference
  orderReference: {
    type: String,
    trim: true,
    maxlength: [100, 'Order reference cannot exceed 100 characters']
  },
  
  // Transaction status
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'rejected', 'paid'],
      message: 'Status must be one of: pending, confirmed, rejected, paid'
    },
    default: 'pending',
    required: [true, 'Status is required'],
    index: true
  },
  
  // Transaction type
  type: {
    type: String,
    enum: {
      values: ['cashback', 'referral', 'bonus', 'withdrawal'],
      message: 'Type must be one of: cashback, referral, bonus, withdrawal'
    },
    default: 'cashback',
    required: [true, 'Transaction type is required'],
    index: true
  },
  
  // Transaction description
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Date of purchase
  purchaseDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Purchase date is required'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Purchase date cannot be in the future'
    }
  },
  
  // Date when transaction was confirmed
  confirmationDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.purchaseDate;
      },
      message: 'Confirmation date must be after purchase date'
    }
  },
  
  // Date when cashback was paid
  paymentDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || (this.confirmationDate && value >= this.confirmationDate);
      },
      message: 'Payment date must be after confirmation date'
    }
  },
  
  // Payment method used for cashback
  paymentMethod: {
    type: String,
    trim: true,
    enum: {
      values: ['paypal', 'bank_transfer', 'store_credit', 'gift_card', 'crypto', null],
      message: 'Payment method must be one of: paypal, bank_transfer, store_credit, gift_card, crypto'
    }
  },
  
  // Payment reference number
  paymentReference: {
    type: String,
    trim: true,
    maxlength: [100, 'Payment reference cannot exceed 100 characters']
  },
  
  // Additional notes
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Coupon used in the transaction
  couponUsed: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  
  // Cashback offer applied
  cashbackOffer: {
    type: Schema.Types.ObjectId,
    ref: 'Cashback'
  },
  
  // IP address for tracking
  ipAddress: {
    type: String,
    trim: true
  },
  
  // User agent for tracking
  userAgent: {
    type: String,
    trim: true
  },
  
  // Status change history
  statusHistory: [statusHistorySchema],
  
  // Expiry date for pending transactions
  expiryDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.purchaseDate;
      },
      message: 'Expiry date must be after purchase date'
    }
  },
  
  // Rejection reason if status is 'rejected'
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

/**
 * Pre-save middleware to validate transaction data
 */
transactionSchema.pre('save', function(next) {
  // Ensure cashback amount is consistent with percentage
  if (this.isModified('amount') || this.isModified('cashbackPercentage') || this.isModified('cashbackAmount')) {
    const calculatedCashback = (this.amount * this.cashbackPercentage) / 100;
    // Allow for small floating point differences
    if (Math.abs(calculatedCashback - this.cashbackAmount) > 0.01) {
      this.cashbackAmount = parseFloat(calculatedCashback.toFixed(2));
    }
  }
  
  // Add status change to history if status changed
  if (this.isModified('status')) {
    if (!this.statusHistory) {
      this.statusHistory = [];
    }
    
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Status updated'
    });
    
    // Set confirmation date if status changed to 'confirmed'
    if (this.status === 'confirmed' && !this.confirmationDate) {
      this.confirmationDate = new Date();
    }
    
    // Set payment date if status changed to 'paid'
    if (this.status === 'paid' && !this.paymentDate) {
      this.paymentDate = new Date();
    }
  }
  
  next();
});

/**
 * Virtual for transaction age in days
 * @returns {number} Age in days
 */
transactionSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

/**
 * Virtual for checking if transaction is eligible for payment
 * @returns {boolean} True if eligible for payment
 */
transactionSchema.virtual('isEligibleForPayment').get(function() {
  return this.status === 'confirmed' && !this.paymentDate;
});

/**
 * Virtual for transaction status display name
 * @returns {string} Status display name
 */
transactionSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'rejected': 'Rejected',
    'paid': 'Paid'
  };
  return statusMap[this.status] || this.status;
});

/**
 * Virtual for transaction type display name
 * @returns {string} Type display name
 */
transactionSchema.virtual('typeDisplay').get(function() {
  const typeMap = {
    'cashback': 'Cashback',
    'referral': 'Referral Bonus',
    'bonus': 'Bonus',
    'withdrawal': 'Withdrawal'
  };
  return typeMap[this.type] || this.type;
});

/**
 * Method to update transaction status with history tracking
 * @param {string} status - New status
 * @param {string} note - Optional note
 * @param {ObjectId} updatedBy - User who updated the status
 * @returns {Promise} Updated transaction
 */
transactionSchema.methods.updateStatus = async function(status, note, updatedBy) {
  if (!['pending', 'confirmed', 'rejected', 'paid'].includes(status)) {
    throw new Error('Invalid status');
  }
  
  this.status = status;
  
  if (!this.statusHistory) {
    this.statusHistory = [];
  }
  
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    note: note || `Status updated to ${status}`,
    updatedBy
  });
  
  if (status === 'confirmed' && !this.confirmationDate) {
    this.confirmationDate = new Date();
  }
  
  if (status === 'paid' && !this.paymentDate) {
    this.paymentDate = new Date();
  }
  
  return this.save();
};

// Set virtuals to be included when converting to JSON
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

/**
 * Transaction model
 * @type {Model<TransactionSchema>}
 */
module.exports = mongoose.model('Transaction', transactionSchema);