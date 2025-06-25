const mongoose = require('mongoose');

// Test MongoDB Atlas connection
const uri = "mongodb+srv://yb106128:IbhqYCfWLrfCHtMB@cashheros-prod.mongodb.net/cashheros?retryWrites=true&w=majority";

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database access
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔍 DNS Resolution Error - Possible causes:');
      console.log('1. Incorrect cluster name in connection string');
      console.log('2. Cluster does not exist in MongoDB Atlas');
      console.log('3. Network connectivity issues');
      console.log('4. Check your MongoDB Atlas dashboard for the correct connection string');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Authentication Error - Possible causes:');
      console.log('1. Incorrect username or password');
      console.log('2. User does not exist in the database');
      console.log('3. User does not have proper permissions');
    }
    
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();