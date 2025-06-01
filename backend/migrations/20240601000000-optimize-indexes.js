/**
 * Migration: optimize-indexes
 * Created at: 2024-06-01T00:00:00.000Z
 * 
 * This migration optimizes database indexes for better performance.
 */

const mongoose = require('mongoose');
const { User, Store, Coupon, Cashback, Blog, Transaction, Review, Favorite, Notification } = require('../models');

/**
 * Apply the migration
 * @param {mongoose.ClientSession} session - Mongoose session for transaction
 */
exports.up = async (session) => {
  console.log('Running optimize-indexes migration...');
  
  // Create text indexes for search performance
  console.log('Creating text indexes...');
  
  // User text index
  await User.collection.createIndex(
    { firstName: 'text', lastName: 'text', email: 'text' },
    { 
      weights: { firstName: 10, lastName: 10, email: 5 },
      name: 'user_text_search'
    }
  );
  
  // Coupon text index
  await Coupon.collection.createIndex(
    { title: 'text', description: 'text', code: 'text', category: 'text', tags: 'text' },
    { 
      weights: { code: 10, title: 5, description: 3, category: 2, tags: 1 },
      name: 'coupon_text_search'
    }
  );
  
  // Cashback text index
  await Cashback.collection.createIndex(
    { title: 'text', description: 'text', category: 'text' },
    { 
      weights: { title: 10, description: 5, category: 3 },
      name: 'cashback_text_search'
    }
  );
  
  // Blog text index
  await Blog.collection.createIndex(
    { title: 'text', content: 'text', excerpt: 'text', tags: 'text', category: 'text' },
    { 
      weights: { title: 10, excerpt: 5, content: 3, tags: 2, category: 1 },
      name: 'blog_text_search'
    }
  );
  
  // Store text index
  await Store.collection.createIndex(
    { name: 'text', description: 'text', shortDescription: 'text', categories: 'text', tags: 'text' },
    { 
      weights: { name: 10, shortDescription: 5, description: 3, categories: 2, tags: 1 },
      name: 'store_text_search'
    }
  );
  
  // Review text index
  await Review.collection.createIndex(
    { title: 'text', content: 'text' },
    { 
      weights: { title: 10, content: 5 },
      name: 'review_text_search'
    }
  );
  
  // Create compound indexes for common query patterns
  console.log('Creating compound indexes...');
  
  // User compound indexes
  await User.collection.createIndex({ 'role': 1, 'verified': 1, 'lastLogin': -1 });
  
  // Coupon compound indexes
  await Coupon.collection.createIndex({ isActive: 1, expiryDate: 1 });
  await Coupon.collection.createIndex({ store: 1, isActive: 1 });
  await Coupon.collection.createIndex({ category: 1, isActive: 1 });
  await Coupon.collection.createIndex({ popularityScore: -1 });
  
  // Cashback compound indexes
  await Cashback.collection.createIndex({ isActive: 1, expiryDate: 1 });
  await Cashback.collection.createIndex({ store: 1, isActive: 1 });
  await Cashback.collection.createIndex({ category: 1, isActive: 1 });
  await Cashback.collection.createIndex({ featured: 1, amount: -1 });
  
  // Store compound indexes
  await Store.collection.createIndex({ isActive: 1, isFeatured: 1 });
  await Store.collection.createIndex({ categories: 1, isActive: 1 });
  await Store.collection.createIndex({ isActive: 1, cashbackPercentage: -1 });
  await Store.collection.createIndex({ isActive: 1, averageRating: -1 });
  
  // Transaction compound indexes
  await Transaction.collection.createIndex({ 'user': 1, 'status': 1 });
  await Transaction.collection.createIndex({ 'user': 1, 'createdAt': -1 });
  await Transaction.collection.createIndex({ 'store': 1, 'status': 1 });
  await Transaction.collection.createIndex({ 'status': 1, 'type': 1 });
  await Transaction.collection.createIndex({ 'status': 1, 'confirmationDate': 1 });
  await Transaction.collection.createIndex({ 'status': 1, 'paymentDate': 1 });
  await Transaction.collection.createIndex({ 'purchaseDate': 1, 'status': 1, 'cashbackAmount': 1 });
  
  // Notification compound indexes
  await Notification.collection.createIndex({ 'user': 1, 'isRead': 1 });
  await Notification.collection.createIndex({ 'user': 1, 'createdAt': -1 });
  await Notification.collection.createIndex({ 'user': 1, 'type': 1 });
  await Notification.collection.createIndex({ 'user': 1, 'isRead': 1, 'createdAt': -1 });
  
  // Favorite compound indexes
  await Favorite.collection.createIndex({ 'user': 1, 'itemType': 1 });
  await Favorite.collection.createIndex({ 'user': 1, 'createdAt': -1 });
  
  // Review compound indexes
  await Review.collection.createIndex({ 'store': 1, 'isApproved': 1 });
  await Review.collection.createIndex({ 'store': 1, 'rating': -1 });
  await Review.collection.createIndex({ 'store': 1, 'isApproved': 1, 'createdAt': -1 });
  
  // Add TTL index for expired coupons cleanup
  console.log('Creating TTL indexes...');
  await Coupon.collection.createIndex(
    { expiryDate: 1 },
    { expireAfterSeconds: 86400 * 30 } // Keep expired coupons for 30 days
  );
  
  console.log('Optimize indexes migration completed successfully');
};

/**
 * Revert the migration
 * @param {mongoose.ClientSession} session - Mongoose session for transaction
 */
exports.down = async (session) => {
  console.log('Reverting optimize-indexes migration...');
  
  // Drop text indexes
  await User.collection.dropIndex('user_text_search');
  await Coupon.collection.dropIndex('coupon_text_search');
  await Cashback.collection.dropIndex('cashback_text_search');
  await Blog.collection.dropIndex('blog_text_search');
  await Store.collection.dropIndex('store_text_search');
  await Review.collection.dropIndex('review_text_search');
  
  // Drop compound indexes (only the ones created in this migration)
  await User.collection.dropIndex('role_1_verified_1_lastLogin_-1');
  
  await Coupon.collection.dropIndex('isActive_1_expiryDate_1');
  await Coupon.collection.dropIndex('store_1_isActive_1');
  await Coupon.collection.dropIndex('category_1_isActive_1');
  await Coupon.collection.dropIndex('popularityScore_-1');
  
  await Cashback.collection.dropIndex('isActive_1_expiryDate_1');
  await Cashback.collection.dropIndex('store_1_isActive_1');
  await Cashback.collection.dropIndex('category_1_isActive_1');
  await Cashback.collection.dropIndex('featured_1_amount_-1');
  
  await Store.collection.dropIndex('isActive_1_isFeatured_1');
  await Store.collection.dropIndex('categories_1_isActive_1');
  await Store.collection.dropIndex('isActive_1_cashbackPercentage_-1');
  await Store.collection.dropIndex('isActive_1_averageRating_-1');
  
  await Transaction.collection.dropIndex('user_1_status_1');
  await Transaction.collection.dropIndex('user_1_createdAt_-1');
  await Transaction.collection.dropIndex('store_1_status_1');
  await Transaction.collection.dropIndex('status_1_type_1');
  await Transaction.collection.dropIndex('status_1_confirmationDate_1');
  await Transaction.collection.dropIndex('status_1_paymentDate_1');
  await Transaction.collection.dropIndex('purchaseDate_1_status_1_cashbackAmount_1');
  
  await Notification.collection.dropIndex('user_1_isRead_1');
  await Notification.collection.dropIndex('user_1_createdAt_-1');
  await Notification.collection.dropIndex('user_1_type_1');
  await Notification.collection.dropIndex('user_1_isRead_1_createdAt_-1');
  
  await Favorite.collection.dropIndex('user_1_itemType_1');
  await Favorite.collection.dropIndex('user_1_createdAt_-1');
  
  await Review.collection.dropIndex('store_1_isApproved_1');
  await Review.collection.dropIndex('store_1_rating_-1');
  await Review.collection.dropIndex('store_1_isApproved_1_createdAt_-1');
  
  // Drop TTL index
  await Coupon.collection.dropIndex('expiryDate_1');
  
  console.log('Optimize indexes migration reverted successfully');
};