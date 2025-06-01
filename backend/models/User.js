const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String, default: 'USA' }
}, { _id: false });

const preferencesSchema = new mongoose.Schema({
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: true },
  categories: [{ type: String, trim: true }],
  favoriteStores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
  notificationFrequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'immediate' },
  emailDigest: { type: Boolean, default: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'moderator', 'support'], default: 'user' },
  
  // Token management fields
  tokenVersion: { type: Number, default: 0 }, // For invalidating all tokens
  refreshTokens: [{ 
    token: { type: String },
    expiresAt: { type: Date },
    device: { type: String },
    ip: { type: String },
    lastUsed: { type: Date }
  }],

  // OAuth fields
  oauthProvider: { type: String, enum: ['google', 'facebook', null], default: null },
  oauthId: { type: String },
  oauthProfileData: { type: Object },
  oauthAccessToken: { type: String },
  oauthRefreshToken: { type: String },
  oauthTokenExpiry: { type: Date },

  // Email verification fields
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  newEmail: { type: String }, // For email change verification

  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Two-factor authentication fields
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  twoFactorBackupCodes: [{ type: String }],
  twoFactorTempToken: { type: String },
  twoFactorTempTokenExpires: { type: Date },

  // Profile information
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  profilePicture: { type: String },
  phone: { type: String },
  address: addressSchema,

  // User preferences
  preferences: {
    type: preferencesSchema,
    default: () => ({})
  },

  // Account activity tracking
  joinDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  lastPasswordChange: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  accountLocked: { type: Boolean, default: false },
  accountLockedUntil: { type: Date },
  lastActive: { type: Date },
  loginHistory: [{
    timestamp: { type: Date },
    ipAddress: { type: String },
    userAgent: { type: String },
    successful: { type: Boolean }
  }],

  // Cashback and rewards tracking
  balance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalRedeemed: { type: Number, default: 0 },
  paymentMethods: [{
    type: { type: String, enum: ['paypal', 'bank', 'venmo', 'crypto'], required: true },
    details: { type: Object },
    isDefault: { type: Boolean, default: false },
    lastUsed: { type: Date }
  }],
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || 'User';
});

// Virtual for account age in days
userSchema.virtual('accountAge').get(function() {
  return Math.floor((Date.now() - this.joinDate) / (1000 * 60 * 60 * 24));
});

// Set virtuals to be included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
