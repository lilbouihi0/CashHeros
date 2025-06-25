const mongoose = require('mongoose');

// Your correct cluster name from Atlas dashboard
const clusterName = 'Cluster0'; // Note: Capital C
const username = 'yb106128';
const password = 'IbhqYCfWLrfCHtMB';
const database = 'cashheros';

const uri = `mongodb+srv://${username}:${password}@${clusterName.toLowerCase()}.nhyzc9w.mongodb.net/${database}?retryWrites=true&w=majority`;

async function testCorrectConnection() {
  console.log('🔍 Testing with correct cluster name from Atlas dashboard...');
  console.log(`Cluster Name: ${clusterName}`);
  console.log(`Connection string: mongodb+srv://${username}:***@${clusterName.toLowerCase()}.nhyzc9w.mongodb.net/${database}?retryWrites=true&w=majority`);
  
  try {
    console.log('\n⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000 // 10 second timeout
    });
    
    console.log('✅ SUCCESS! Connected to MongoDB Atlas!');
    
    // Test database access
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Database: ${database}`);
    console.log(`📁 Collections found: ${collections.length}`);
    if (collections.length > 0) {
      console.log('   - ' + collections.map(c => c.name).join('\n   - '));
    } else {
      console.log('   (No collections yet - this is normal for a new database)');
    }
    
    console.log('\n🎉 Your MongoDB connection is working perfectly!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔍 Still getting DNS error. Let me try the exact connection string from Atlas...');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Authentication Error - Check your username/password in Atlas');
    } else {
      console.log('\n🔍 Other error:', error.message);
    }
  } finally {
    try {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}

testCorrectConnection().catch(console.error);