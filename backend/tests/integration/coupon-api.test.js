const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const Coupon = require('../../models/Coupon');
const User = require('../../models/User');
const Store = require('../../models/Store');
const jwt = require('jsonwebtoken');

// Setup in-memory MongoDB server
let mongoServer;
let adminToken, userToken;
let testStore, testCoupon;

beforeAll(async () => {
  // Start MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  // Create test users
  const adminUser = await User.create({
    email: 'admin@example.com',
    password: await bcrypt.hash('adminpassword', 10),
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    verified: true
  });
  
  const regularUser = await User.create({
    email: 'user@example.com',
    password: await bcrypt.hash('userpassword', 10),
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
    verified: true
  });
  
  // Create tokens
  adminToken = jwt.sign(
    { userId: adminUser._id, role: 'admin' },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );
  
  userToken = jwt.sign(
    { userId: regularUser._id, role: 'user' },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );
  
  // Create test store
  testStore = await Store.create({
    name: 'Test Store',
    logo: 'https://example.com/logo.png',
    website: 'https://example.com',
    description: 'Test store description',
    cashbackPercentage: 5,
    isActive: true
  });
  
  // Create test coupon
  testCoupon = await Coupon.create({
    code: 'TEST123',
    title: 'Test Coupon',
    description: 'Test coupon description',
    store: testStore._id,
    discount: 15,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    isActive: true,
    createdBy: adminUser._id
  });
});

afterAll(async () => {
  // Disconnect and stop MongoDB instance
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Coupon API Endpoints', () => {
  describe('GET /api/coupons', () => {
    it('should return all coupons with pagination', async () => {
      const res = await request(app)
        .get('/api/coupons')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toHaveProperty('totalCoupons');
      expect(res.body.pagination).toHaveProperty('totalPages');
      expect(res.body.pagination).toHaveProperty('currentPage');
      expect(res.body.pagination).toHaveProperty('limit');
    });
    
    it('should filter coupons by search term', async () => {
      const res = await request(app)
        .get('/api/coupons?search=Test')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].title).toContain('Test');
    });
    
    it('should filter coupons by category', async () => {
      // First create a coupon with a specific category
      await Coupon.create({
        code: 'ELEC123',
        title: 'Electronics Coupon',
        description: 'Electronics coupon description',
        store: testStore._id,
        category: 'Electronics',
        discount: 10,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdBy: mongoose.Types.ObjectId()
      });
      
      const res = await request(app)
        .get('/api/coupons?category=Electronics')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].category).toBe('Electronics');
    });
    
    it('should filter coupons by store', async () => {
      const res = await request(app)
        .get(`/api/coupons?store=${testStore._id}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].store._id.toString()).toBe(testStore._id.toString());
    });
    
    it('should sort coupons by discount', async () => {
      const res = await request(app)
        .get('/api/coupons?sort=discount')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      
      // Check if sorted in descending order
      const discounts = res.body.data.map(coupon => coupon.discount);
      for (let i = 0; i < discounts.length - 1; i++) {
        expect(discounts[i]).toBeGreaterThanOrEqual(discounts[i + 1]);
      }
    });
  });
  
  describe('GET /api/coupons/:id', () => {
    it('should return a single coupon by ID', async () => {
      const res = await request(app)
        .get(`/api/coupons/${testCoupon._id}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(testCoupon._id.toString());
      expect(res.body.data.code).toBe('TEST123');
      expect(res.body.data.title).toBe('Test Coupon');
    });
    
    it('should return 404 if coupon not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/coupons/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Coupon not found');
    });
    
    it('should return 500 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/coupons/invalid-id')
        .expect('Content-Type', /json/)
        .expect(500);
      
      expect(res.body.success).toBe(false);
    });
  });
  
  describe('POST /api/coupons', () => {
    it('should create a new coupon when authenticated as admin', async () => {
      const newCoupon = {
        code: 'NEW123',
        title: 'New Coupon',
        description: 'New coupon description',
        store: testStore._id,
        discount: 20,
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        isActive: true
      };
      
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCoupon)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('NEW123');
      expect(res.body.data.title).toBe('New Coupon');
      expect(res.body.message).toBe('Coupon created successfully');
      
      // Verify coupon was saved to database
      const savedCoupon = await Coupon.findOne({ code: 'NEW123' });
      expect(savedCoupon).not.toBeNull();
    });
    
    it('should return 401 if not authenticated', async () => {
      const newCoupon = {
        code: 'UNAUTH123',
        title: 'Unauthorized Coupon',
        store: testStore._id,
        discount: 10
      };
      
      const res = await request(app)
        .post('/api/coupons')
        .send(newCoupon)
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(res.body.success).toBe(false);
    });
    
    it('should return 403 if authenticated as regular user', async () => {
      const newCoupon = {
        code: 'USER123',
        title: 'User Coupon',
        store: testStore._id,
        discount: 10
      };
      
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newCoupon)
        .expect('Content-Type', /json/)
        .expect(403);
      
      expect(res.body.success).toBe(false);
    });
    
    it('should return 400 if required fields are missing', async () => {
      const incompleteCoupon = {
        title: 'Incomplete Coupon',
        // Missing code, store, discount
      };
      
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteCoupon)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Validation error');
    });
    
    it('should return 400 if coupon code already exists', async () => {
      const duplicateCoupon = {
        code: 'TEST123', // Already exists
        title: 'Duplicate Coupon',
        store: testStore._id,
        discount: 10
      };
      
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateCoupon)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Coupon code already exists');
    });
  });
  
  describe('PUT /api/coupons/:id', () => {
    it('should update a coupon when authenticated as admin', async () => {
      const updates = {
        title: 'Updated Test Coupon',
        discount: 25,
        isActive: false
      };
      
      const res = await request(app)
        .put(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Test Coupon');
      expect(res.body.data.discount).toBe(25);
      expect(res.body.data.isActive).toBe(false);
      expect(res.body.message).toBe('Coupon updated successfully');
      
      // Verify coupon was updated in database
      const updatedCoupon = await Coupon.findById(testCoupon._id);
      expect(updatedCoupon.title).toBe('Updated Test Coupon');
      expect(updatedCoupon.discount).toBe(25);
      expect(updatedCoupon.isActive).toBe(false);
    });
    
    it('should return 401 if not authenticated', async () => {
      const updates = {
        title: 'Unauthorized Update'
      };
      
      const res = await request(app)
        .put(`/api/coupons/${testCoupon._id}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(res.body.success).toBe(false);
    });
    
    it('should return 403 if authenticated as regular user', async () => {
      const updates = {
        title: 'User Update'
      };
      
      const res = await request(app)
        .put(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(403);
      
      expect(res.body.success).toBe(false);
    });
    
    it('should return 404 if coupon not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updates = {
        title: 'Non-existent Coupon Update'
      };
      
      const res = await request(app)
        .put(`/api/coupons/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Coupon not found');
    });
    
    it('should return 400 for validation errors', async () => {
      const invalidUpdates = {
        discount: 'invalid' // Should be a number
      };
      
      const res = await request(app)
        .put(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdates)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Validation error');
    });
  });
  
  describe('DELETE /api/coupons/:id', () => {
    it('should delete a coupon when authenticated as admin', async () => {
      // First create a coupon to delete
      const couponToDelete = await Coupon.create({
        code: 'DELETE123',
        title: 'Coupon to Delete',
        description: 'This coupon will be deleted',
        store: testStore._id,
        discount: 5,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdBy: mongoose.Types.ObjectId()
      });
      
      const res = await request(app)
        .delete(`/api/coupons/${couponToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Coupon deleted successfully');
      
      // Verify coupon was deleted from database
      const deletedCoupon = await Coupon.findById(couponToDelete._id);
      expect(deletedCoupon).toBeNull();
    });
    
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .delete(`/api/coupons/${testCoupon._id}`)
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(res.body.success).toBe(false);
    });
    
    it('should return 403 if authenticated as regular user', async () => {
      const res = await request(app)
        .delete(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(403);
      
      expect(res.body.success).toBe(false);
    });
    
    it('should return 404 if coupon not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .delete(`/api/coupons/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Coupon not found');
    });
  });
  
  describe('POST /api/coupons/:id/redeem', () => {
    it('should redeem a coupon when authenticated', async () => {
      // First create a coupon to redeem
      const couponToRedeem = await Coupon.create({
        code: 'REDEEM123',
        title: 'Coupon to Redeem',
        description: 'This coupon will be redeemed',
        store: testStore._id,
        discount: 15,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageCount: 0,
        usageLimit: 100,
        createdBy: mongoose.Types.ObjectId()
      });
      
      const res = await request(app)
        .post(`/api/coupons/${couponToRedeem._id}/redeem`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Coupon redeemed successfully');
      expect(res.body.data).toHaveProperty('coupon');
      expect(res.body.data).toHaveProperty('redemptionDate');
      
      // Verify coupon usage count was incremented
      const updatedCoupon = await Coupon.findById(couponToRedeem._id);
      expect(updatedCoupon.usageCount).toBe(1);
      
      // Verify user has the coupon in their redeemed list
      const user = await User.findById(mongoose.Types.ObjectId(jwt.decode(userToken).userId));
      const hasRedeemedCoupon = user.redeemedCoupons.some(
        redemption => redemption.coupon.toString() === couponToRedeem._id.toString()
      );
      expect(hasRedeemedCoupon).toBe(true);
    });
    
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post(`/api/coupons/${testCoupon._id}/redeem`)
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(res.body.success).toBe(false);
    });
    
    it('should return 404 if coupon not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .post(`/api/coupons/${nonExistentId}/redeem`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Coupon not found');
    });
    
    it('should return 400 if coupon is inactive', async () => {
      // Create an inactive coupon
      const inactiveCoupon = await Coupon.create({
        code: 'INACTIVE123',
        title: 'Inactive Coupon',
        description: 'This coupon is inactive',
        store: testStore._id,
        discount: 10,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: false,
        createdBy: mongoose.Types.ObjectId()
      });
      
      const res = await request(app)
        .post(`/api/coupons/${inactiveCoupon._id}/redeem`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('This coupon is not active');
    });
    
    it('should return 400 if coupon is expired', async () => {
      // Create an expired coupon
      const expiredCoupon = await Coupon.create({
        code: 'EXPIRED123',
        title: 'Expired Coupon',
        description: 'This coupon is expired',
        store: testStore._id,
        discount: 10,
        expiryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days in the past
        isActive: true,
        createdBy: mongoose.Types.ObjectId()
      });
      
      const res = await request(app)
        .post(`/api/coupons/${expiredCoupon._id}/redeem`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('This coupon has expired');
    });
    
    it('should return 400 if coupon usage limit is reached', async () => {
      // Create a coupon with reached usage limit
      const limitedCoupon = await Coupon.create({
        code: 'LIMITED123',
        title: 'Limited Coupon',
        description: 'This coupon has reached its usage limit',
        store: testStore._id,
        discount: 10,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageCount: 100,
        usageLimit: 100,
        createdBy: mongoose.Types.ObjectId()
      });
      
      const res = await request(app)
        .post(`/api/coupons/${limitedCoupon._id}/redeem`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('This coupon has reached its usage limit');
    });
    
    it('should return 400 if user has already redeemed the coupon', async () => {
      // First create a coupon and redeem it
      const alreadyRedeemedCoupon = await Coupon.create({
        code: 'ALREADY123',
        title: 'Already Redeemed Coupon',
        description: 'This coupon will be redeemed twice',
        store: testStore._id,
        discount: 15,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageCount: 0,
        usageLimit: 100,
        createdBy: mongoose.Types.ObjectId()
      });
      
      // First redemption
      await request(app)
        .post(`/api/coupons/${alreadyRedeemedCoupon._id}/redeem`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      // Second redemption attempt
      const res = await request(app)
        .post(`/api/coupons/${alreadyRedeemedCoupon._id}/redeem`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('You have already redeemed this coupon');
    });
  });
});