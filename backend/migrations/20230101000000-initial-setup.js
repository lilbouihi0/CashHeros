/**
 * Migration: initial-setup
 * Created at: 2023-01-01T00:00:00.000Z
 * 
 * This migration sets up initial database indexes and default data.
 */

const mongoose = require('mongoose');
const { User, Store, Coupon, Cashback } = require('../models');

/**
 * Apply the migration
 * @param {mongoose.ClientSession} session - Mongoose session for transaction
 */
exports.up = async (session) => {
  console.log('Running initial setup migration...');
  
  // Create admin user if it doesn't exist
  const adminExists = await User.findOne({ email: 'admin@cashheros.com' });
  
  if (!adminExists) {
    console.log('Creating admin user...');
    await User.create([{
      email: 'admin@cashheros.com',
      password: '$2b$10$XFE0UPNRMBUEzRxwVSZH8.wOIhAMmnq3NvpzYTT8FQNvLEDUvnSJi', // hashed 'admin123'
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      verified: true,
      joinDate: new Date(),
      lastLogin: new Date()
    }], { session });
  }
  
  // Create default store categories
  console.log('Creating default store categories...');
  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Health & Beauty', 
    'Travel', 'Food & Dining', 'Entertainment', 'Sports & Outdoors'
  ];
  
  // Create some sample stores if none exist
  const storeCount = await Store.countDocuments();
  
  if (storeCount === 0) {
    console.log('Creating sample stores...');
    
    const stores = [
      {
        name: 'TechGadgets',
        logo: 'https://example.com/logos/techgadgets.png',
        description: 'The latest in technology and gadgets',
        website: 'https://techgadgets.example.com',
        categories: ['Electronics'],
        cashbackPercentage: 5,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'FashionHub',
        logo: 'https://example.com/logos/fashionhub.png',
        description: 'Trendy fashion for all seasons',
        website: 'https://fashionhub.example.com',
        categories: ['Fashion'],
        cashbackPercentage: 3.5,
        isActive: true,
        isFeatured: true
      },
      {
        name: 'HomeDecor',
        logo: 'https://example.com/logos/homedecor.png',
        description: 'Beautiful items for your home',
        website: 'https://homedecor.example.com',
        categories: ['Home & Garden'],
        cashbackPercentage: 4,
        isActive: true,
        isFeatured: false
      }
    ];
    
    const createdStores = await Store.create(stores, { session });
    
    // Create sample coupons
    console.log('Creating sample coupons...');
    
    const coupons = [
      {
        code: 'TECH20',
        title: '20% Off Electronics',
        description: 'Get 20% off all electronics',
        discount: 20,
        store: createdStores[0]._id,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        category: 'Electronics'
      },
      {
        code: 'FASHION15',
        title: '15% Off Fashion Items',
        description: 'Get 15% off all fashion items',
        discount: 15,
        store: createdStores[1]._id,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        isActive: true,
        category: 'Fashion'
      },
      {
        code: 'HOME10',
        title: '10% Off Home Decor',
        description: 'Get 10% off all home decor items',
        discount: 10,
        store: createdStores[2]._id,
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        isActive: true,
        category: 'Home & Garden'
      }
    ];
    
    await Coupon.create(coupons, { session });
    
    // Create sample cashback offers
    console.log('Creating sample cashback offers...');
    
    const cashbacks = [
      {
        title: '5% Cashback on Electronics',
        description: 'Earn 5% cashback on all electronics purchases',
        amount: 5,
        store: createdStores[0]._id,
        category: 'Electronics',
        isActive: true,
        featured: true
      },
      {
        title: '3.5% Cashback on Fashion',
        description: 'Earn 3.5% cashback on all fashion purchases',
        amount: 3.5,
        store: createdStores[1]._id,
        category: 'Fashion',
        isActive: true,
        featured: true
      },
      {
        title: '4% Cashback on Home Decor',
        description: 'Earn 4% cashback on all home decor purchases',
        amount: 4,
        store: createdStores[2]._id,
        category: 'Home & Garden',
        isActive: true,
        featured: false
      }
    ];
    
    await Cashback.create(cashbacks, { session });
  }
  
  console.log('Initial setup migration completed successfully');
};

/**
 * Revert the migration
 * @param {mongoose.ClientSession} session - Mongoose session for transaction
 */
exports.down = async (session) => {
  console.log('Reverting initial setup migration...');
  
  // Remove sample data
  await Cashback.deleteMany({ 
    store: { $in: await Store.find().distinct('_id') } 
  }, { session });
  
  await Coupon.deleteMany({ 
    store: { $in: await Store.find().distinct('_id') } 
  }, { session });
  
  await Store.deleteMany({}, { session });
  
  // Remove admin user
  await User.deleteOne({ email: 'admin@cashheros.com' }, { session });
  
  console.log('Initial setup migration reverted successfully');
};