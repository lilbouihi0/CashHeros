import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const couponRequestsCounter = new Counter('coupon_requests');
const failedRequestsRate = new Rate('failed_requests');
const couponRequestDuration = new Trend('coupon_request_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 }, // Stay at 50 users for 3 minutes
    { duration: '1m', target: 100 }, // Ramp up to 100 users over 1 minute
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '1m', target: 0 }, // Ramp down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
    'coupon_request_duration': ['p(95)<600'], // 95% of coupon requests should be below 600ms
    'failed_requests': ['rate<0.05'], // Less than 5% of requests should fail
  },
};

// Simulate user session
export default function() {
  // User login
  const loginRes = http.post('http://localhost:5000/api/auth/login', JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has access token': (r) => JSON.parse(r.body).accessToken !== undefined,
  });
  
  if (loginRes.status !== 200) {
    failedRequestsRate.add(1);
    console.log(`Login failed: ${loginRes.status} ${loginRes.body}`);
    return;
  }
  
  // Extract token from response
  const token = JSON.parse(loginRes.body).accessToken;
  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  // Get coupons list
  const startTime = new Date();
  const couponsRes = http.get('http://localhost:5000/api/coupons', authHeaders);
  const duration = new Date() - startTime;
  
  couponRequestsCounter.add(1);
  couponRequestDuration.add(duration);
  
  check(couponsRes, {
    'coupons request successful': (r) => r.status === 200,
    'coupons returned': (r) => JSON.parse(r.body).data.length > 0,
  });
  
  if (couponsRes.status !== 200) {
    failedRequestsRate.add(1);
  }
  
  // Get a specific coupon
  const coupons = JSON.parse(couponsRes.body).data;
  if (coupons && coupons.length > 0) {
    const randomIndex = Math.floor(Math.random() * coupons.length);
    const couponId = coupons[randomIndex]._id;
    
    const couponDetailRes = http.get(`http://localhost:5000/api/coupons/${couponId}`, authHeaders);
    
    check(couponDetailRes, {
      'coupon detail request successful': (r) => r.status === 200,
      'correct coupon returned': (r) => JSON.parse(r.body).data._id === couponId,
    });
    
    if (couponDetailRes.status !== 200) {
      failedRequestsRate.add(1);
    }
    
    // Redeem coupon (for some users)
    if (Math.random() < 0.3) { // 30% of users will redeem a coupon
      const redeemRes = http.post(`http://localhost:5000/api/coupons/${couponId}/redeem`, {}, authHeaders);
      
      check(redeemRes, {
        'redeem request successful': (r) => r.status === 200 || r.status === 400, // 400 if already redeemed
      });
      
      if (redeemRes.status !== 200 && redeemRes.status !== 400) {
        failedRequestsRate.add(1);
      }
    }
  }
  
  // Search for coupons
  const searchTerms = ['discount', 'sale', 'free', 'offer', 'deal'];
  const randomSearchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  
  const searchRes = http.get(`http://localhost:5000/api/coupons?search=${randomSearchTerm}`, authHeaders);
  
  check(searchRes, {
    'search request successful': (r) => r.status === 200,
  });
  
  if (searchRes.status !== 200) {
    failedRequestsRate.add(1);
  }
  
  // Create a new coupon (admin only)
  if (Math.random() < 0.1) { // 10% chance to create a coupon
    const newCoupon = {
      code: `TEST${randomString(6)}`,
      title: `Test Coupon ${randomString(4)}`,
      description: 'This is a test coupon created during load testing',
      discount: Math.floor(Math.random() * 50) + 10, // Random discount between 10-60%
      store: {
        name: 'Test Store',
        logo: 'https://example.com/logo.png'
      },
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      isActive: true,
      usageLimit: 50,
      category: 'Test'
    };
    
    const createRes = http.post('http://localhost:5000/api/coupons', JSON.stringify(newCoupon), authHeaders);
    
    check(createRes, {
      'create coupon request successful': (r) => r.status === 201 || r.status === 403, // 403 if not admin
    });
    
    if (createRes.status !== 201 && createRes.status !== 403) {
      failedRequestsRate.add(1);
    }
  }
  
  // Wait between 1 and 5 seconds before next iteration
  sleep(Math.random() * 4 + 1);
}