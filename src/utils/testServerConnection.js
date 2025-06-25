// Simple script to test server connection
const axios = require('axios');

async function testServerConnection() {
  try {
    console.log('Testing connection to server...');
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/health`);
    console.log('Server is running!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('Server connection error:', error.message);
    return false;
  }
}

testServerConnection();