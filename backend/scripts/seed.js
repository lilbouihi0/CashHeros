#!/usr/bin/env node

/**
 * Database Seeding CLI
 * 
 * This script provides a command-line interface for seeding the database with sample data.
 * 
 * Usage:
 * - Seed all data: node scripts/seed.js all
 * - Clear database: node scripts/seed.js clear
 * - Seed specific data: node scripts/seed.js users|stores|coupons|cashbacks|blogs|transactions|reviews|favorites
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const seeds = require('../seeds');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const count = args[1] ? parseInt(args[1]) : undefined;

/**
 * Connect to the database
 */
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from the database
 */
const disconnectDatabase = async () => {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

/**
 * Prompt user for confirmation
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} User confirmation
 */
const confirmAction = async (message) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
};

/**
 * Show help message
 */
const showHelp = () => {
  console.log(`
Database Seeding CLI

Usage:
  node scripts/seed.js <command> [count]

Commands:
  all                 Seed all data
  clear               Clear all data from the database
  users [count]       Seed users
  stores [count]      Seed stores
  coupons [count]     Seed coupons
  cashbacks [count]   Seed cashback offers
  blogs [count]       Seed blog posts
  transactions [count] Seed transactions
  reviews [count]     Seed reviews
  favorites [count]   Seed favorites
  help                Show this help message

Examples:
  node scripts/seed.js all
  node scripts/seed.js clear
  node scripts/seed.js users 20
  node scripts/seed.js stores 15
  `);
};

// Execute the appropriate command
(async () => {
  try {
    switch (command) {
      case 'all':
        await connectDatabase();
        const confirmed = await confirmAction(
          'This will seed the database with sample data. Continue?'
        );
        
        if (confirmed) {
          await seeds.seedAll(true);
        } else {
          console.log('Seeding cancelled');
        }
        break;
        
      case 'clear':
        await connectDatabase();
        const clearConfirmed = await confirmAction(
          'WARNING: This will delete ALL data from the database. Continue?'
        );
        
        if (clearConfirmed) {
          await seeds.clearDatabase();
          console.log('Database cleared successfully');
        } else {
          console.log('Clear operation cancelled');
        }
        break;
        
      case 'users':
        await connectDatabase();
        await seeds.seedUsers(count);
        break;
        
      case 'stores':
        await connectDatabase();
        await seeds.seedStores(count);
        break;
        
      case 'coupons':
        await connectDatabase();
        const users = await mongoose.model('User').find();
        const stores = await mongoose.model('Store').find();
        
        if (users.length === 0 || stores.length === 0) {
          console.error('Error: Users and stores must be seeded before coupons');
          process.exit(1);
        }
        
        await seeds.seedCoupons(stores, users, count);
        break;
        
      case 'cashbacks':
        await connectDatabase();
        const cashbackUsers = await mongoose.model('User').find();
        const cashbackStores = await mongoose.model('Store').find();
        
        if (cashbackUsers.length === 0 || cashbackStores.length === 0) {
          console.error('Error: Users and stores must be seeded before cashbacks');
          process.exit(1);
        }
        
        await seeds.seedCashbacks(cashbackStores, cashbackUsers, count);
        break;
        
      case 'blogs':
        await connectDatabase();
        const blogUsers = await mongoose.model('User').find();
        
        if (blogUsers.length === 0) {
          console.error('Error: Users must be seeded before blogs');
          process.exit(1);
        }
        
        await seeds.seedBlogs(blogUsers, count);
        break;
        
      case 'transactions':
        await connectDatabase();
        const transactionUsers = await mongoose.model('User').find();
        const transactionStores = await mongoose.model('Store').find();
        const coupons = await mongoose.model('Coupon').find();
        const cashbacks = await mongoose.model('Cashback').find();
        
        if (transactionUsers.length === 0 || transactionStores.length === 0) {
          console.error('Error: Users and stores must be seeded before transactions');
          process.exit(1);
        }
        
        await seeds.seedTransactions(transactionUsers, transactionStores, coupons, cashbacks, count);
        break;
        
      case 'reviews':
        await connectDatabase();
        const reviewUsers = await mongoose.model('User').find();
        const reviewStores = await mongoose.model('Store').find();
        
        if (reviewUsers.length === 0 || reviewStores.length === 0) {
          console.error('Error: Users and stores must be seeded before reviews');
          process.exit(1);
        }
        
        await seeds.seedReviews(reviewUsers, reviewStores, count);
        break;
        
      case 'favorites':
        await connectDatabase();
        const favoriteUsers = await mongoose.model('User').find();
        const favoriteStores = await mongoose.model('Store').find();
        const favoriteCoupons = await mongoose.model('Coupon').find();
        const favoriteCashbacks = await mongoose.model('Cashback').find();
        
        if (favoriteUsers.length === 0 || favoriteStores.length === 0) {
          console.error('Error: Users and stores must be seeded before favorites');
          process.exit(1);
        }
        
        await seeds.seedFavorites(favoriteUsers, favoriteStores, favoriteCoupons, favoriteCashbacks, count);
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await disconnectDatabase();
    }
  }
})();