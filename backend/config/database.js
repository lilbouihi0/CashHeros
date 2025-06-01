/**
 * Database Configuration
 * 
 * This file contains database configuration, connection management,
 * and performance optimization settings.
 */

const mongoose = require('mongoose');
const { User, Coupon, Cashback, Blog, Store, Transaction, Notification, Favorite, Review } = require('../models');

/**
 * Configure MongoDB connection with connection pooling
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise} Mongoose connection promise
 */
const connectDatabase = async (uri = process.env.MONGO_URI) => {
  try {
    // Connection options with pooling configuration
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production for performance
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      
      // Connection pooling settings
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
      retryWrites: true
    };

    const conn = await mongoose.connect(uri, options);

    console.log(`MongoDB Connected: ${conn.connection.host} (Pool size: ${options.maxPoolSize})`);
    
    // Set up global connection error handler
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    // Handle reconnection
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

/**
 * Create database indexes for performance optimization
 * This should be run during application startup
 */
/**
 * Helper function to create an index with error handling
 * @param {Object} collection - MongoDB collection
 * @param {Object} keys - Index keys
 * @param {Object} options - Index options
 */
const createIndexSafely = async (collection, keys, options = {}) => {
  try {
    await collection.createIndex(keys, options);
  } catch (error) {
    // Log the error but don't throw, allowing other indexes to be created
    if (error.code === 86) { // IndexKeySpecsConflict
      console.warn(`Index already exists with different options: ${JSON.stringify(keys)}`);
    } else {
      console.error(`Failed to create index ${JSON.stringify(keys)}: ${error.message}`);
    }
  }
};

const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');

    // User indexes
    await createIndexSafely(User.collection, { email: 1 }, { unique: true });
    await createIndexSafely(User.collection, { 'oauthProvider': 1, 'oauthId': 1 });
    await createIndexSafely(User.collection, { 'verificationToken': 1 }, { sparse: true });
    await createIndexSafely(User.collection, { 'resetPasswordToken': 1 }, { sparse: true });
    // Skip referralCode index as it's already defined in the schema with unique: true
    // await createIndexSafely(User.collection, { 'referralCode': 1 }, { sparse: true });
    await createIndexSafely(User.collection, { 'lastActive': 1 });
    await createIndexSafely(User.collection, { 'role': 1 });
    await createIndexSafely(User.collection, { 'verified': 1 });
    await createIndexSafely(User.collection, { 'joinDate': 1 });
    await createIndexSafely(User.collection, { 'lastLogin': 1 });
    // Compound index for user search and filtering
    await createIndexSafely(User.collection, { 'role': 1, 'verified': 1, 'lastLogin': -1 });
    // Text index for user search
    await createIndexSafely(User.collection, { 
      firstName: 'text', 
      lastName: 'text', 
      email: 'text' 
    }, { 
      weights: { 
        firstName: 10, 
        lastName: 10, 
        email: 5 
      },
      name: 'user_text_search'
    });

    // Coupon indexes
    await createIndexSafely(Coupon.collection, { code: 1 }, { unique: true });
    await createIndexSafely(Coupon.collection, { store: 1 });
    await createIndexSafely(Coupon.collection, { category: 1 });
    await createIndexSafely(Coupon.collection, { expiryDate: 1 });
    await createIndexSafely(Coupon.collection, { isActive: 1 });
    await createIndexSafely(Coupon.collection, { createdAt: -1 });
    await createIndexSafely(Coupon.collection, { usageCount: -1 });
    // Compound indexes for common query patterns
    await createIndexSafely(Coupon.collection, { isActive: 1, expiryDate: 1 });
    await createIndexSafely(Coupon.collection, { store: 1, isActive: 1 });
    await createIndexSafely(Coupon.collection, { category: 1, isActive: 1 });
    // Text index for coupon search
    await createIndexSafely(Coupon.collection, { 
      title: 'text', 
      description: 'text', 
      code: 'text',
      category: 'text'
    }, { 
      weights: { 
        title: 10, 
        code: 5, 
        description: 3,
        category: 2
      },
      name: 'coupon_text_search'
    });

    // Cashback indexes
    await createIndexSafely(Cashback.collection, { store: 1 });
    await createIndexSafely(Cashback.collection, { category: 1 });
    await createIndexSafely(Cashback.collection, { expiryDate: 1 });
    await createIndexSafely(Cashback.collection, { isActive: 1 });
    await createIndexSafely(Cashback.collection, { featured: 1 });
    await createIndexSafely(Cashback.collection, { amount: -1 });
    await createIndexSafely(Cashback.collection, { createdAt: -1 });
    // Compound indexes for common query patterns
    await createIndexSafely(Cashback.collection, { isActive: 1, expiryDate: 1 });
    await createIndexSafely(Cashback.collection, { store: 1, isActive: 1 });
    await createIndexSafely(Cashback.collection, { category: 1, isActive: 1 });
    await createIndexSafely(Cashback.collection, { featured: 1, amount: -1 });
    // Text index for cashback search
    await createIndexSafely(Cashback.collection, { 
      title: 'text', 
      description: 'text',
      category: 'text'
    }, { 
      weights: { 
        title: 10, 
        description: 5,
        category: 3
      },
      name: 'cashback_text_search'
    });

    // Blog indexes
    await createIndexSafely(Blog.collection, { slug: 1 }, { unique: true });
    await createIndexSafely(Blog.collection, { author: 1 });
    await createIndexSafely(Blog.collection, { category: 1 });
    await createIndexSafely(Blog.collection, { tags: 1 });
    await createIndexSafely(Blog.collection, { isPublished: 1 });
    await createIndexSafely(Blog.collection, { createdAt: -1 });
    await createIndexSafely(Blog.collection, { viewCount: -1 });
    await createIndexSafely(Blog.collection, { publishedAt: -1 });
    // Compound indexes for common query patterns
    await createIndexSafely(Blog.collection, { isPublished: 1, publishedAt: -1 });
    await createIndexSafely(Blog.collection, { category: 1, isPublished: 1 });
    await createIndexSafely(Blog.collection, { tags: 1, isPublished: 1 });
    // Text index for blog search
    await createIndexSafely(Blog.collection, { 
      title: 'text', 
      content: 'text',
      excerpt: 'text',
      tags: 'text',
      category: 'text'
    }, { 
      weights: { 
        title: 10, 
        excerpt: 5,
        content: 3,
        tags: 2,
        category: 1
      },
      name: 'blog_text_search'
    });

    // Store indexes
    await createIndexSafely(Store.collection, { name: 1 }, { unique: true });
    await createIndexSafely(Store.collection, { slug: 1 }, { unique: true });
    await createIndexSafely(Store.collection, { categories: 1 });
    await createIndexSafely(Store.collection, { isActive: 1 });
    await createIndexSafely(Store.collection, { isFeatured: 1 });
    await createIndexSafely(Store.collection, { cashbackPercentage: -1 });
    await createIndexSafely(Store.collection, { averageRating: -1 });
    await createIndexSafely(Store.collection, { popularityScore: -1 });
    // Compound indexes for common query patterns
    await createIndexSafely(Store.collection, { isActive: 1, isFeatured: 1 });
    await createIndexSafely(Store.collection, { categories: 1, isActive: 1 });
    await createIndexSafely(Store.collection, { isActive: 1, cashbackPercentage: -1 });
    await createIndexSafely(Store.collection, { isActive: 1, averageRating: -1 });
    // Text index for store search
    await createIndexSafely(Store.collection, { 
      name: 'text', 
      description: 'text',
      shortDescription: 'text',
      categories: 'text',
      tags: 'text'
    }, { 
      weights: { 
        name: 10, 
        shortDescription: 5,
        description: 3,
        categories: 2,
        tags: 1
      },
      name: 'store_text_search'
    });

    // Transaction indexes
    await createIndexSafely(Transaction.collection, { user: 1 });
    await createIndexSafely(Transaction.collection, { store: 1 });
    await createIndexSafely(Transaction.collection, { status: 1 });
    await createIndexSafely(Transaction.collection, { type: 1 });
    await createIndexSafely(Transaction.collection, { purchaseDate: -1 });
    await createIndexSafely(Transaction.collection, { createdAt: -1 });
    await createIndexSafely(Transaction.collection, { confirmationDate: 1 });
    await createIndexSafely(Transaction.collection, { paymentDate: 1 });
    // Compound indexes for common query patterns
    await createIndexSafely(Transaction.collection, { 'user': 1, 'status': 1 });
    await createIndexSafely(Transaction.collection, { 'user': 1, 'createdAt': -1 });
    await createIndexSafely(Transaction.collection, { 'store': 1, 'status': 1 });
    await createIndexSafely(Transaction.collection, { 'status': 1, 'type': 1 });
    await createIndexSafely(Transaction.collection, { 'status': 1, 'confirmationDate': 1 });
    await createIndexSafely(Transaction.collection, { 'status': 1, 'paymentDate': 1 });
    // Index for analytics queries
    await createIndexSafely(Transaction.collection, { 'purchaseDate': 1, 'status': 1, 'cashbackAmount': 1 });

    // Notification indexes
    await createIndexSafely(Notification.collection, { user: 1 });
    await createIndexSafely(Notification.collection, { isRead: 1 });
    await createIndexSafely(Notification.collection, { type: 1 });
    await createIndexSafely(Notification.collection, { createdAt: -1 });
    // Compound indexes for common query patterns
    await createIndexSafely(Notification.collection, { 'user': 1, 'isRead': 1 });
    await createIndexSafely(Notification.collection, { 'user': 1, 'createdAt': -1 });
    await createIndexSafely(Notification.collection, { 'user': 1, 'type': 1 });
    await createIndexSafely(Notification.collection, { 'user': 1, 'isRead': 1, 'createdAt': -1 });
    // Related document index
    await createIndexSafely(Notification.collection, { 'data.itemType': 1, 'data.itemId': 1 });

    // Favorite indexes
    await createIndexSafely(Favorite.collection, { user: 1, itemType: 1, itemId: 1 }, { unique: true });
    await createIndexSafely(Favorite.collection, { user: 1 });
    await createIndexSafely(Favorite.collection, { itemType: 1, itemId: 1 });
    await createIndexSafely(Favorite.collection, { createdAt: -1 });
    // Compound indexes for common query patterns
    await createIndexSafely(Favorite.collection, { 'user': 1, 'itemType': 1 });
    await createIndexSafely(Favorite.collection, { 'user': 1, 'createdAt': -1 });

    // Review indexes
    await createIndexSafely(Review.collection, { user: 1, store: 1 }, { unique: true });
    await createIndexSafely(Review.collection, { store: 1 });
    await createIndexSafely(Review.collection, { rating: -1 });
    await createIndexSafely(Review.collection, { isApproved: 1 });
    await createIndexSafely(Review.collection, { createdAt: -1 });
    await createIndexSafely(Review.collection, { helpfulCount: -1 });
    // Compound indexes for common query patterns
    await createIndexSafely(Review.collection, { 'store': 1, 'isApproved': 1 });
    await createIndexSafely(Review.collection, { 'store': 1, 'rating': -1 });
    await createIndexSafely(Review.collection, { 'store': 1, 'isApproved': 1, 'createdAt': -1 });
    // Text index for review search
    await createIndexSafely(Review.collection, { 
      title: 'text', 
      content: 'text'
    }, { 
      weights: { 
        title: 10, 
        content: 5
      },
      name: 'review_text_search'
    });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
    // Log the error but don't crash the application
    // This allows the application to start even if some indexes couldn't be created
    console.warn('Application will continue running, but some database indexes may be missing');
  }
};

/**
 * Get database statistics and information
 * @returns {Object} Database statistics
 */
const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const collectionStats = await Promise.all(
      collections.map(async (collection) => {
        const collStats = await mongoose.connection.db.collection(collection.name).stats();
        return {
          name: collection.name,
          count: collStats.count,
          size: collStats.size,
          avgObjSize: collStats.avgObjSize,
          storageSize: collStats.storageSize,
          indexes: collStats.nindexes,
          indexSize: collStats.totalIndexSize
        };
      })
    );
    
    return {
      database: stats.db,
      collections: stats.collections,
      views: stats.views,
      objects: stats.objects,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      collectionDetails: collectionStats
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
};

module.exports = {
  connectDatabase,
  createIndexes,
  getDatabaseStats
};