const axios = require('axios');

const API_BASE_URL = 'https://api-gablgtu7na-uc.a.run.app/api';

async function testApiConnection() {
  console.log('Testing API connection...');
  console.log('API Base URL:', API_BASE_URL);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 10000
    });
    console.log('✅ Health check successful:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
  
  try {
    // Test CSRF token endpoint
    console.log('\n2. Testing CSRF token endpoint...');
    const csrfResponse = await axios.get(`${API_BASE_URL}/auth/csrf-token`, {
      timeout: 10000
    });
    console.log('✅ CSRF token endpoint successful:', csrfResponse.data);
  } catch (error) {
    console.log('❌ CSRF token endpoint failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
  
  try {
    // Test auth health endpoint
    console.log('\n3. Testing auth health endpoint...');
    const authHealthResponse = await axios.get(`${API_BASE_URL}/auth/health`, {
      timeout: 10000
    });
    console.log('✅ Auth health check successful:', authHealthResponse.data);
  } catch (error) {
    console.log('❌ Auth health check failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
  
  // Test alternative URLs
  const alternativeUrls = [
    'https://api-gablgtu7na-uc.a.run.app',
    'https://us-central1-cashheros-project.cloudfunctions.net/api',
    'https://cashheros-project.web.app/api'
  ];
  
  console.log('\n4. Testing alternative URLs...');
  for (const url of alternativeUrls) {
    try {
      console.log(`\nTesting: ${url}/health`);
      const response = await axios.get(`${url}/health`, {
        timeout: 5000
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Failed:', error.message);
    }
  }
}

testApiConnection().catch(console.error);