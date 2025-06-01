/**
 * MongoDB Connection Check Script
 * 
 * This script checks if MongoDB is running and creates the database if it doesn't exist.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Get MongoDB URI from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cashheros';

// Extract database name from URI
const dbName = MONGO_URI.split('/').pop().split('?')[0];

/**
 * Check MongoDB connection and create database if needed
 */
async function checkDatabase() {
  console.log('Checking MongoDB connection...');
  
  try {
    // Try to connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });
    
    console.log(`✅ MongoDB connection successful: ${mongoose.connection.host}`);
    console.log(`✅ Database "${dbName}" is ready to use`);
    
    // Create a test document to ensure the database exists
    const testCollection = mongoose.connection.db.collection('_setup_test');
    await testCollection.insertOne({ 
      test: true, 
      createdAt: new Date(),
      message: 'Database setup check'
    });
    
    console.log('✅ Database write test successful');
    
    // Clean up test document
    await testCollection.deleteMany({ test: true });
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('❌ MongoDB server is not running or not accessible');
      console.log('\nPlease make sure MongoDB is installed and running:');
      console.log('1. Check if MongoDB is installed: mongod --version');
      console.log('2. Start MongoDB service: net start MongoDB (Windows) or sudo systemctl start mongod (Linux/Mac)');
      console.log('3. If MongoDB is not installed, download it from: https://www.mongodb.com/try/download/community');
    }
    
    return false;
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkDatabase()
    .then(success => {
      if (success) {
        console.log('\nMongoDB is ready for the application to use.');
      } else {
        console.log('\nMongoDB connection failed. Please fix the issues before starting the application.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

module.exports = checkDatabase;