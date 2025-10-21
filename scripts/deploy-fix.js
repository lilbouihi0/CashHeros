#!/usr/bin/env node

/**
 * Deployment Fix Script
 * This script helps fix common deployment issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Running deployment fixes...');

// 1. Check and fix environment variables
const envFiles = ['.env', '.env.production'];
envFiles.forEach(envFile => {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Fix API URL if it doesn't end with /api
    if (content.includes('REACT_APP_API_BASE_URL=') && !content.includes('/api\n') && !content.includes('/api$')) {
      content = content.replace(
        /REACT_APP_API_BASE_URL=([^\n]+)/g,
        (match, url) => {
          if (!url.endsWith('/api')) {
            return `REACT_APP_API_BASE_URL=${url}/api`;
          }
          return match;
        }
      );
      fs.writeFileSync(envPath, content);
      console.log(`✅ Fixed API URL in ${envFile}`);
    }
  }
});

// 2. Check service worker configuration
const swPath = path.join(process.cwd(), 'public', 'service-worker.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (swContent.includes('cache.addAll(STATIC_ASSETS)')) {
    console.log('⚠️  Service worker may have caching issues. Consider updating to use Promise.allSettled');
  } else {
    console.log('✅ Service worker caching looks good');
  }
}

// 3. Check CORS configuration
const corsPath = path.join(process.cwd(), 'functions', 'middleware', 'corsMiddleware.js');
if (fs.existsSync(corsPath)) {
  const corsContent = fs.readFileSync(corsPath, 'utf8');
  if (corsContent.includes('casheros.com') && corsContent.includes('cashheros.com')) {
    console.log('✅ CORS configuration includes both domain variants');
  } else {
    console.log('⚠️  CORS configuration may need both casheros.com and cashheros.com');
  }
}

// 4. Generate deployment checklist
const checklist = `
🚀 DEPLOYMENT CHECKLIST

Backend (Google Cloud Run):
□ Environment variables set:
  - NODE_ENV=production
  - CORS_ORIGIN=https://casheros.com,https://www.casheros.com,https://cashheros.com,https://www.cashheros.com
  - FRONTEND_URL=https://casheros.com
  - MONGO_URI=<your-mongodb-connection-string>
  - JWT_SECRET=<your-jwt-secret>

□ CORS middleware allows your domain
□ CSRF middleware is configured for production
□ Rate limiting is enabled

Frontend:
□ REACT_APP_API_BASE_URL points to your backend with /api suffix
□ Service worker is properly configured
□ CSRF token initialization is working
□ Build is optimized for production

DNS & SSL:
□ Domain points to correct hosting service
□ SSL certificate is valid
□ Both www and non-www variants work

Testing:
□ Test registration/login flow
□ Test API endpoints
□ Check browser console for errors
□ Verify CORS headers in network tab
`;

console.log(checklist);

// 5. Create a test script
const testScript = `
// Test script - run in browser console
async function testAPI() {
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://cashheros-api-gablgtu7na-uc.a.run.app/api'}/auth/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test CSRF token endpoint
    const csrfResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://cashheros-api-gablgtu7na-uc.a.run.app/api'}/auth/csrf-token`, {
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
`;

fs.writeFileSync(path.join(process.cwd(), 'test-api.js'), testScript);
console.log('✅ Created test-api.js - run this in browser console to test API connectivity');

console.log('\n🎉 Deployment fixes completed!');
console.log('📝 Next steps:');
console.log('1. Deploy your backend with the updated environment variables');
console.log('2. Deploy your frontend');
console.log('3. Run the test script in browser console');
console.log('4. Check the deployment checklist above');