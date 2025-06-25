
// Test script - run in browser console
async function testAPI() {
  try {
    // Test health endpoint
    const healthResponse = await fetch('https://api-gablgtu7na-uc.a.run.app/api/auth/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test CSRF token endpoint
    const csrfResponse = await fetch('https://api-gablgtu7na-uc.a.run.app/api/auth/csrf-token', {
      credentials: 'include'
    });
    const csrfData = await csrfResponse.json();
    console.log('CSRF token:', csrfData);
    
    console.log('✅ API tests passed');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testAPI();
