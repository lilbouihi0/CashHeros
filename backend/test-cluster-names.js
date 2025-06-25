const mongoose = require('mongoose');

// Common cluster names to test
const clusterNames = [
  'cluster0',
  'cashheros',
  'cashheros-cluster',
  'cashheros-dev',
  'cashheros-production'
];

const username = 'yb106128';
const password = 'IbhqYCfWLrfCHtMB';
const database = 'cashheros';

async function testClusterName(clusterName) {
  const uri = `mongodb+srv://${username}:${password}@${clusterName}.mongodb.net/${database}?retryWrites=true&w=majority`;
  
  console.log(`\n🔍 Testing cluster: ${clusterName}`);
  console.log(`Connection string: mongodb+srv://${username}:***@${clusterName}.mongodb.net/${database}?retryWrites=true&w=majority`);
  
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    
    console.log(`✅ SUCCESS! Cluster "${clusterName}" exists and connection works!`);
    console.log(`✅ Correct connection string: ${uri}`);
    
    await mongoose.disconnect();
    return clusterName;
    
  } catch (error) {
    if (error.message.includes('ENOTFOUND')) {
      console.log(`❌ Cluster "${clusterName}" not found`);
    } else if (error.message.includes('authentication failed')) {
      console.log(`⚠️  Cluster "${clusterName}" exists but authentication failed`);
      console.log(`   This means the cluster exists but credentials are wrong`);
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
    
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    
    return null;
  }
}

async function findCorrectCluster() {
  console.log('🔍 Testing common MongoDB Atlas cluster names...\n');
  
  for (const clusterName of clusterNames) {
    const result = await testClusterName(clusterName);
    if (result) {
      console.log(`\n🎉 Found working cluster: ${result}`);
      return result;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ None of the common cluster names worked.');
  console.log('\n📋 Next steps:');
  console.log('1. Log into MongoDB Atlas Dashboard');
  console.log('2. Find your actual cluster name');
  console.log('3. Get the correct connection string from the "Connect" button');
}

findCorrectCluster().catch(console.error);