const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['transaction', 'account', 'offer', 'system', 'promotion'],
    default: 'system'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  actionLink: {
    type: String,
    trim: true
  },
  relatedDocument: {
    documentType: {
      type: String,
      enum: ['transaction', 'coupon', 'cashback', 'store', null],
      default: null
    },
    documentId: {
      type: Schema.Types.ObjectId,
      refPath: 'relatedDocument.documentType'
    }
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries on user and read status
notificationSchema.index({ user: 1, isRead: 1 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Set virtuals to be included when converting to JSON
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);