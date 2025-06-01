/**
 * Data Seeding System
 * 
 * This module provides functionality to seed the database with sample data
 * for development and testing purposes.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

// Import models
const { User, Store, Coupon, Cashback, Blog, Transaction, Review, Favorite } = require('../models');

/**
 * Clear all data from the database
 * @returns {Promise<void>}
 */
const clearDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clear database in production environment');
  }
  
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  
  console.log('Database cleared');
};

/**
 * Seed users
 * @param {number} count - Number of users to create
 * @returns {Promise<Array>} Created users
 */
const seedUsers = async (count = 10) => {
  console.log(`Seeding ${count} users...`);
  
  const users = [];
  
  // Create admin user
  const adminUser = new User({
    email: 'admin@cashheros.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    verified: true,
    joinDate: faker.date.past(),
    lastLogin: faker.date.recent(),
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      categories: ['Electronics', 'Fashion', 'Travel'],
      notificationFrequency: 'daily'
    }
  });
  
  users.push(await adminUser.save());
  
  // Create regular users
  for (let i = 0; i < count - 1; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    const user = new User({
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: await bcrypt.hash('password123', 10),
      role: 'user',
      firstName,
      lastName,
      profilePicture: faker.image.avatar(),
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: 'USA'
      },
      verified: faker.datatype.boolean(0.8), // 80% are verified
      joinDate: faker.date.past(),
      lastLogin: faker.date.recent(),
      preferences: {
        emailNotifications: faker.datatype.boolean(),
        smsNotifications: faker.datatype.boolean(0.3), // 30% have SMS notifications
        pushNotifications: faker.datatype.boolean(0.7), // 70% have push notifications
        categories: faker.helpers.arrayElements([
          'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 
          'Travel', 'Food & Dining', 'Entertainment', 'Sports & Outdoors'
        ], faker.number.int({ min: 1, max: 4 })),
        notificationFrequency: faker.helpers.arrayElement(['immediate', 'daily', 'weekly'])
      },
      balance: faker.number.float({ min: 0, max: 500, precision: 0.01 }),
      pendingBalance: faker.number.float({ min: 0, max: 200, precision: 0.01 }),
      totalEarned: faker.number.float({ min: 0, max: 1000, precision: 0.01 }),
      totalRedeemed: faker.number.float({ min: 0, max: 500, precision: 0.01 })
    });
    
    users.push(await user.save());
  }
  
  console.log(`${users.length} users seeded`);
  return users;
};

/**
 * Seed stores
 * @param {number} count - Number of stores to create
 * @returns {Promise<Array>} Created stores
 */
const seedStores = async (count = 20) => {
  console.log(`Seeding ${count} stores...`);
  
  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 
    'Travel', 'Food & Dining', 'Entertainment', 'Sports & Outdoors'
  ];
  
  const stores = [];
  
  for (let i = 0; i < count; i++) {
    const name = faker.company.name();
    const storeCategories = faker.helpers.arrayElements(
      categories, 
      faker.number.int({ min: 1, max: 3 })
    );
    
    const store = new Store({
      name,
      logo: `https://logo.clearbit.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      description: faker.company.catchPhrase(),
      website: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      categories: storeCategories,
      affiliateLink: `https://affiliate.example.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      cashbackPercentage: faker.number.float({ min: 1, max: 10, precision: 0.5 }),
      averageRating: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      totalReviews: faker.number.int({ min: 0, max: 100 }),
      isActive: faker.datatype.boolean(0.9), // 90% are active
      isFeatured: faker.datatype.boolean(0.2), // 20% are featured
      socialMedia: {
        facebook: faker.datatype.boolean(0.7) ? `https://facebook.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : null,
        twitter: faker.datatype.boolean(0.6) ? `https://twitter.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : null,
        instagram: faker.datatype.boolean(0.5) ? `https://instagram.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : null
      },
      contactInfo: {
        email: `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: faker.phone.number(),
        address: faker.location.streetAddress()
      },
      termsAndConditions: faker.lorem.paragraphs(3)
    });
    
    stores.push(await store.save());
  }
  
  console.log(`${stores.length} stores seeded`);
  return stores;
};

/**
 * Seed coupons
 * @param {Array} stores - Store documents
 * @param {Array} users - User documents
 * @param {number} count - Number of coupons to create
 * @returns {Promise<Array>} Created coupons
 */
const seedCoupons = async (stores, users, count = 50) => {
  console.log(`Seeding ${count} coupons...`);
  
  const coupons = [];
  const adminUser = users.find(user => user.role === 'admin');
  
  for (let i = 0; i < count; i++) {
    const store = faker.helpers.arrayElement(stores);
    const discountValue = faker.number.int({ min: 5, max: 50 });
    const isPercentage = faker.datatype.boolean(0.7); // 70% are percentage discounts
    
    const coupon = new Coupon({
      code: faker.string.alphanumeric(8).toUpperCase(),
      title: `${isPercentage ? `${discountValue}% Off` : `$${discountValue} Off`} at ${store.name}`,
      description: faker.lorem.sentence(),
      discount: discountValue,
      store: store._id,
      expiryDate: faker.date.future(),
      isActive: faker.datatype.boolean(0.9), // 90% are active
      usageLimit: faker.datatype.boolean(0.3) ? faker.number.int({ min: 50, max: 1000 }) : null,
      usageCount: faker.number.int({ min: 0, max: 100 }),
      category: faker.helpers.arrayElement(store.categories),
      createdBy: adminUser._id
    });
    
    coupons.push(await coupon.save());
  }
  
  console.log(`${coupons.length} coupons seeded`);
  return coupons;
};

/**
 * Seed cashback offers
 * @param {Array} stores - Store documents
 * @param {Array} users - User documents
 * @param {number} count - Number of cashback offers to create
 * @returns {Promise<Array>} Created cashback offers
 */
const seedCashbacks = async (stores, users, count = 30) => {
  console.log(`Seeding ${count} cashback offers...`);
  
  const cashbacks = [];
  const adminUser = users.find(user => user.role === 'admin');
  
  for (let i = 0; i < count; i++) {
    const store = faker.helpers.arrayElement(stores);
    const amount = faker.number.float({ min: 1, max: 15, precision: 0.5 });
    
    const cashback = new Cashback({
      title: `${amount}% Cashback at ${store.name}`,
      description: faker.lorem.sentence(),
      amount,
      store: store._id,
      category: faker.helpers.arrayElement(store.categories),
      terms: faker.lorem.paragraphs(2),
      expiryDate: faker.date.future(),
      isActive: faker.datatype.boolean(0.9), // 90% are active
      featured: faker.datatype.boolean(0.2), // 20% are featured
      createdBy: adminUser._id
    });
    
    cashbacks.push(await cashback.save());
  }
  
  console.log(`${cashbacks.length} cashback offers seeded`);
  return cashbacks;
};

/**
 * Seed blog posts
 * @param {Array} users - User documents
 * @param {number} count - Number of blog posts to create
 * @returns {Promise<Array>} Created blog posts
 */
const seedBlogs = async (users, count = 15) => {
  console.log(`Seeding ${count} blog posts...`);
  
  const blogs = [];
  const adminUser = users.find(user => user.role === 'admin');
  
  const categories = [
    'Saving Tips', 'Deal Alerts', 'Shopping Guides', 'Cashback Strategies',
    'Store Reviews', 'Product Reviews', 'Money Management', 'Coupon Hacks'
  ];
  
  for (let i = 0; i < count; i++) {
    const title = faker.lorem.sentence();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const category = faker.helpers.arrayElement(categories);
    
    const blog = new Blog({
      title,
      content: faker.lorem.paragraphs(5),
      summary: faker.lorem.paragraph(),
      author: adminUser._id,
      category,
      tags: faker.helpers.arrayElements(
        ['savings', 'deals', 'coupons', 'cashback', 'shopping', 'money', 'budget', 'sale', 'discount'],
        faker.number.int({ min: 2, max: 5 })
      ),
      featuredImage: `https://picsum.photos/seed/${slug}/800/400`,
      isPublished: faker.datatype.boolean(0.9), // 90% are published
      viewCount: faker.number.int({ min: 0, max: 1000 }),
      slug
    });
    
    blogs.push(await blog.save());
  }
  
  console.log(`${blogs.length} blog posts seeded`);
  return blogs;
};

/**
 * Seed transactions
 * @param {Array} users - User documents
 * @param {Array} stores - Store documents
 * @param {Array} coupons - Coupon documents
 * @param {Array} cashbacks - Cashback documents
 * @param {number} count - Number of transactions to create
 * @returns {Promise<Array>} Created transactions
 */
const seedTransactions = async (users, stores, coupons, cashbacks, count = 100) => {
  console.log(`Seeding ${count} transactions...`);
  
  const transactions = [];
  const regularUsers = users.filter(user => user.role === 'user');
  
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(regularUsers);
    const store = faker.helpers.arrayElement(stores);
    const amount = faker.number.float({ min: 10, max: 500, precision: 0.01 });
    const cashbackPercentage = faker.number.float({ min: 1, max: 10, precision: 0.5 });
    const cashbackAmount = (amount * cashbackPercentage / 100).toFixed(2);
    
    // Randomly select a coupon or cashback offer for this store
    const storeCoupons = coupons.filter(coupon => coupon.store.toString() === store._id.toString());
    const storeCashbacks = cashbacks.filter(cashback => cashback.store.toString() === store._id.toString());
    
    const couponUsed = storeCoupons.length > 0 && faker.datatype.boolean(0.3) 
      ? faker.helpers.arrayElement(storeCoupons)._id 
      : null;
      
    const cashbackOffer = storeCashbacks.length > 0 
      ? faker.helpers.arrayElement(storeCashbacks)._id 
      : null;
    
    // Determine status based on date
    const purchaseDate = faker.date.past();
    const daysSincePurchase = Math.floor((Date.now() - purchaseDate) / (1000 * 60 * 60 * 24));
    
    let status;
    let confirmationDate = null;
    let paymentDate = null;
    
    if (daysSincePurchase > 60) {
      status = faker.helpers.arrayElement(['confirmed', 'paid', 'rejected']);
      confirmationDate = new Date(purchaseDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      if (status === 'paid') {
        paymentDate = new Date(confirmationDate.getTime() + (15 * 24 * 60 * 60 * 1000));
      }
    } else if (daysSincePurchase > 30) {
      status = faker.helpers.arrayElement(['confirmed', 'rejected']);
      confirmationDate = new Date(purchaseDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    } else {
      status = 'pending';
    }
    
    const transaction = new Transaction({
      user: user._id,
      store: store._id,
      amount,
      cashbackAmount,
      cashbackPercentage,
      orderReference: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
      status,
      type: 'cashback',
      description: `Purchase at ${store.name}`,
      purchaseDate,
      confirmationDate,
      paymentDate,
      couponUsed,
      cashbackOffer
    });
    
    transactions.push(await transaction.save());
  }
  
  console.log(`${transactions.length} transactions seeded`);
  return transactions;
};

/**
 * Seed reviews
 * @param {Array} users - User documents
 * @param {Array} stores - Store documents
 * @param {number} count - Number of reviews to create
 * @returns {Promise<Array>} Created reviews
 */
const seedReviews = async (users, stores, count = 50) => {
  console.log(`Seeding ${count} reviews...`);
  
  const reviews = [];
  const regularUsers = users.filter(user => user.role === 'user');
  
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(regularUsers);
    const store = faker.helpers.arrayElement(stores);
    const rating = faker.number.int({ min: 1, max: 5 });
    
    // Generate pros and cons based on rating
    const prosCount = Math.max(1, Math.floor(rating / 2));
    const consCount = Math.max(1, Math.floor((6 - rating) / 2));
    
    const pros = [];
    const cons = [];
    
    for (let j = 0; j < prosCount; j++) {
      pros.push(faker.lorem.sentence());
    }
    
    for (let j = 0; j < consCount; j++) {
      cons.push(faker.lorem.sentence());
    }
    
    const review = new Review({
      user: user._id,
      itemType: 'store',
      itemId: store._id,
      rating,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      pros,
      cons,
      isVerifiedPurchase: faker.datatype.boolean(0.7), // 70% are verified purchases
      helpfulVotes: faker.number.int({ min: 0, max: 50 }),
      unhelpfulVotes: faker.number.int({ min: 0, max: 10 }),
      status: 'approved'
    });
    
    reviews.push(await review.save());
    
    // Update store rating
    const storeReviews = reviews.filter(
      r => r.itemType === 'store' && r.itemId.toString() === store._id.toString()
    );
    
    if (storeReviews.length > 0) {
      const totalRating = storeReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / storeReviews.length;
      
      await Store.findByIdAndUpdate(store._id, {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: storeReviews.length
      });
    }
  }
  
  console.log(`${reviews.length} reviews seeded`);
  return reviews;
};

/**
 * Seed favorites
 * @param {Array} users - User documents
 * @param {Array} stores - Store documents
 * @param {Array} coupons - Coupon documents
 * @param {Array} cashbacks - Cashback documents
 * @param {number} count - Number of favorites to create
 * @returns {Promise<Array>} Created favorites
 */
const seedFavorites = async (users, stores, coupons, cashbacks, count = 80) => {
  console.log(`Seeding ${count} favorites...`);
  
  const favorites = [];
  const regularUsers = users.filter(user => user.role === 'user');
  
  // Create a set to track unique user-item combinations
  const uniqueCombinations = new Set();
  
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(regularUsers);
    
    // Randomly select item type
    const itemType = faker.helpers.arrayElement(['store', 'coupon', 'cashback']);
    
    // Select a random item based on type
    let itemId;
    if (itemType === 'store') {
      itemId = faker.helpers.arrayElement(stores)._id;
    } else if (itemType === 'coupon') {
      itemId = faker.helpers.arrayElement(coupons)._id;
    } else {
      itemId = faker.helpers.arrayElement(cashbacks)._id;
    }
    
    // Create a unique key for this combination
    const combinationKey = `${user._id}-${itemType}-${itemId}`;
    
    // Skip if this combination already exists
    if (uniqueCombinations.has(combinationKey)) {
      continue;
    }
    
    uniqueCombinations.add(combinationKey);
    
    const favorite = new Favorite({
      user: user._id,
      itemType,
      itemId,
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
      addedAt: faker.date.past(),
      notifyOnExpiry: faker.datatype.boolean(0.5),
      notifyOnUpdates: faker.datatype.boolean(0.3),
      tags: faker.datatype.boolean(0.4) 
        ? faker.helpers.arrayElements(['favorite', 'later', 'important', 'deal'], faker.number.int({ min: 1, max: 2 }))
        : []
    });
    
    favorites.push(await favorite.save());
  }
  
  console.log(`${favorites.length} favorites seeded`);
  return favorites;
};

/**
 * Run all seeders
 * @param {boolean} clear - Whether to clear the database before seeding
 * @returns {Promise<Object>} Seeded data
 */
const seedAll = async (clear = false) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot seed database in production environment');
  }
  
  try {
    if (clear) {
      await clearDatabase();
    }
    
    const users = await seedUsers(15);
    const stores = await seedStores(20);
    const coupons = await seedCoupons(stores, users, 50);
    const cashbacks = await seedCashbacks(stores, users, 30);
    const blogs = await seedBlogs(users, 15);
    const transactions = await seedTransactions(users, stores, coupons, cashbacks, 100);
    const reviews = await seedReviews(users, stores, 50);
    const favorites = await seedFavorites(users, stores, coupons, cashbacks, 80);
    
    console.log('Database seeding completed successfully');
    
    return {
      users,
      stores,
      coupons,
      cashbacks,
      blogs,
      transactions,
      reviews,
      favorites
    };
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
};

module.exports = {
  clearDatabase,
  seedUsers,
  seedStores,
  seedCoupons,
  seedCashbacks,
  seedBlogs,
  seedTransactions,
  seedReviews,
  seedFavorites,
  seedAll
};