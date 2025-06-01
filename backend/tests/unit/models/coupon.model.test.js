const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Coupon = require('../../../models/Coupon');
const Store = require('../../../models/Store');

// Setup in-memory MongoDB server
let mongoServer;

beforeAll(async () => {
  // Start MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  // Disconnect and stop MongoDB instance
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Coupon Model', () => {
  let testStore;
  
  beforeEach(async () => {
    // Clear the database before each test
    await Coupon.deleteMany({});
    await Store.deleteMany({});
    
    // Create a test store
    testStore = await Store.create({
      name: 'Test Store',
      logo: 'https://example.com/logo.png',
      website: 'https://example.com',
      description: 'Test store description',
      cashbackPercentage: 5,
      isActive: true
    });
  });
  
  it('should create a new coupon successfully', async () => {
    const couponData = {
      code: 'TEST123',
      title: 'Test Coupon',
      description: 'Test coupon description',
      store: testStore._id,
      discount: 15,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    };
    
    const coupon = await Coupon.create(couponData);
    
    expect(coupon._id).toBeDefined();
    expect(coupon.code).toBe('TEST123');
    expect(coupon.title).toBe('Test Coupon');
    expect(coupon.discount).toBe(15);
    expect(coupon.isActive).toBe(true);
    expect(coupon.store.toString()).toBe(testStore._id.toString());
  });
  
  it('should require code field', async () => {
    const couponData = {
      title: 'Test Coupon',
      store: testStore._id,
      discount: 15
    };
    
    await expect(Coupon.create(couponData)).rejects.toThrow();
  });
  
  it('should require title field', async () => {
    const couponData = {
      code: 'TEST123',
      store: testStore._id,
      discount: 15
    };
    
    await expect(Coupon.create(couponData)).rejects.toThrow();
  });
  
  it('should require store field', async () => {
    const couponData = {
      code: 'TEST123',
      title: 'Test Coupon',
      discount: 15
    };
    
    await expect(Coupon.create(couponData)).rejects.toThrow();
  });
  
  it('should require discount field', async () => {
    const couponData = {
      code: 'TEST123',
      title: 'Test Coupon',
      store: testStore._id
    };
    
    await expect(Coupon.create(couponData)).rejects.toThrow();
  });
  
  it('should enforce unique code constraint', async () => {
    // Create first coupon
    await Coupon.create({
      code: 'UNIQUE123',
      title: 'First Coupon',
      description: 'First coupon description',
      store: testStore._id,
      discount: 15,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    // Try to create second coupon with same code
    const duplicateCoupon = {
      code: 'UNIQUE123', // Same code
      title: 'Second Coupon',
      description: 'Second coupon description',
      store: testStore._id,
      discount: 20,
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    };
    
    await expect(Coupon.create(duplicateCoupon)).rejects.toThrow();
  });
  
  it('should validate discount is a number', async () => {
    const couponData = {
      code: 'TEST123',
      title: 'Test Coupon',
      description: 'Test coupon description',
      store: testStore._id,
      discount: 'invalid', // Should be a number
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    };
    
    await expect(Coupon.create(couponData)).rejects.toThrow();
  });
  
  it('should validate discount is between 0 and 100', async () => {
    // Test with discount > 100
    const highDiscountCoupon = {
      code: 'HIGH123',
      title: 'High Discount Coupon',
      description: 'Coupon with too high discount',
      store: testStore._id,
      discount: 101, // Greater than 100
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    };
    
    await expect(Coupon.create(highDiscountCoupon)).rejects.toThrow();
    
    // Test with discount < 0
    const negativeDiscountCoupon = {
      code: 'NEG123',
      title: 'Negative Discount Coupon',
      description: 'Coupon with negative discount',
      store: testStore._id,
      discount: -5, // Less than 0
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    };
    
    await expect(Coupon.create(negativeDiscountCoupon)).rejects.toThrow();
  });
  
  it('should set default values correctly', async () => {
    const couponData = {
      code: 'DEFAULT123',
      title: 'Default Values Coupon',
      description: 'Testing default values',
      store: testStore._id,
      discount: 15,
      createdBy: new mongoose.Types.ObjectId()
      // Not providing isActive, usageCount, usageLimit
    };
    
    const coupon = await Coupon.create(couponData);
    
    expect(coupon.isActive).toBe(true); // Default is true
    expect(coupon.usageCount).toBe(0); // Default is 0
    expect(coupon.usageLimit).toBe(null); // Default is null (unlimited)
  });
  
  it('should update a coupon successfully', async () => {
    // Create a coupon
    const coupon = await Coupon.create({
      code: 'UPDATE123',
      title: 'Original Title',
      description: 'Original description',
      store: testStore._id,
      discount: 15,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    // Update the coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      coupon._id,
      {
        title: 'Updated Title',
        description: 'Updated description',
        discount: 20,
        isActive: false
      },
      { new: true, runValidators: true }
    );
    
    expect(updatedCoupon.title).toBe('Updated Title');
    expect(updatedCoupon.description).toBe('Updated description');
    expect(updatedCoupon.discount).toBe(20);
    expect(updatedCoupon.isActive).toBe(false);
    expect(updatedCoupon.code).toBe('UPDATE123'); // Code should not change
  });
  
  it('should delete a coupon successfully', async () => {
    // Create a coupon
    const coupon = await Coupon.create({
      code: 'DELETE123',
      title: 'Coupon to Delete',
      description: 'This coupon will be deleted',
      store: testStore._id,
      discount: 15,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    // Delete the coupon
    await Coupon.findByIdAndDelete(coupon._id);
    
    // Try to find the deleted coupon
    const deletedCoupon = await Coupon.findById(coupon._id);
    
    expect(deletedCoupon).toBeNull();
  });
  
  it('should find coupons by store', async () => {
    // Create another store
    const anotherStore = await Store.create({
      name: 'Another Store',
      logo: 'https://example.com/another-logo.png',
      website: 'https://another-example.com',
      description: 'Another store description',
      cashbackPercentage: 3,
      isActive: true
    });
    
    // Create coupons for both stores
    await Coupon.create({
      code: 'STORE1-1',
      title: 'Store 1 Coupon 1',
      store: testStore._id,
      discount: 10,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    await Coupon.create({
      code: 'STORE1-2',
      title: 'Store 1 Coupon 2',
      store: testStore._id,
      discount: 15,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    await Coupon.create({
      code: 'STORE2-1',
      title: 'Store 2 Coupon',
      store: anotherStore._id,
      discount: 20,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    // Find coupons for testStore
    const testStoreCoupons = await Coupon.find({ store: testStore._id });
    
    expect(testStoreCoupons.length).toBe(2);
    expect(testStoreCoupons[0].code).toMatch(/^STORE1-/);
    expect(testStoreCoupons[1].code).toMatch(/^STORE1-/);
    
    // Find coupons for anotherStore
    const anotherStoreCoupons = await Coupon.find({ store: anotherStore._id });
    
    expect(anotherStoreCoupons.length).toBe(1);
    expect(anotherStoreCoupons[0].code).toBe('STORE2-1');
  });
  
  it('should find active coupons', async () => {
    // Create active and inactive coupons
    await Coupon.create({
      code: 'ACTIVE1',
      title: 'Active Coupon 1',
      store: testStore._id,
      discount: 10,
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    await Coupon.create({
      code: 'ACTIVE2',
      title: 'Active Coupon 2',
      store: testStore._id,
      discount: 15,
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    await Coupon.create({
      code: 'INACTIVE1',
      title: 'Inactive Coupon',
      store: testStore._id,
      discount: 20,
      isActive: false,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    // Find active coupons
    const activeCoupons = await Coupon.find({ isActive: true });
    
    expect(activeCoupons.length).toBe(2);
    expect(activeCoupons[0].isActive).toBe(true);
    expect(activeCoupons[1].isActive).toBe(true);
    
    // Find inactive coupons
    const inactiveCoupons = await Coupon.find({ isActive: false });
    
    expect(inactiveCoupons.length).toBe(1);
    expect(inactiveCoupons[0].code).toBe('INACTIVE1');
    expect(inactiveCoupons[0].isActive).toBe(false);
  });
  
  it('should find non-expired coupons', async () => {
    const now = new Date();
    
    // Create non-expired coupon
    await Coupon.create({
      code: 'FUTURE1',
      title: 'Future Coupon',
      store: testStore._id,
      discount: 10,
      expiryDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days in the future
      createdBy: new mongoose.Types.ObjectId()
    });
    
    // Create expired coupon
    await Coupon.create({
      code: 'PAST1',
      title: 'Past Coupon',
      store: testStore._id,
      discount: 15,
      expiryDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days in the past
      createdBy: new mongoose.Types.ObjectId()
    });
    
    // Find non-expired coupons
    const nonExpiredCoupons = await Coupon.find({ expiryDate: { $gt: now } });
    
    expect(nonExpiredCoupons.length).toBe(1);
    expect(nonExpiredCoupons[0].code).toBe('FUTURE1');
    
    // Find expired coupons
    const expiredCoupons = await Coupon.find({ expiryDate: { $lte: now } });
    
    expect(expiredCoupons.length).toBe(1);
    expect(expiredCoupons[0].code).toBe('PAST1');
  });
  
  it('should populate store reference', async () => {
    // Create a coupon
    const coupon = await Coupon.create({
      code: 'POPULATE123',
      title: 'Populate Store Coupon',
      store: testStore._id,
      discount: 15,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    // Find the coupon and populate store
    const populatedCoupon = await Coupon.findById(coupon._id).populate('store');
    
    expect(populatedCoupon.store).toBeInstanceOf(Object);
    expect(populatedCoupon.store._id.toString()).toBe(testStore._id.toString());
    expect(populatedCoupon.store.name).toBe('Test Store');
    expect(populatedCoupon.store.logo).toBe('https://example.com/logo.png');
  });
  
  it('should increment usage count', async () => {
    // Create a coupon
    const coupon = await Coupon.create({
      code: 'USAGE123',
      title: 'Usage Count Coupon',
      store: testStore._id,
      discount: 15,
      usageCount: 0,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    // Increment usage count
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      coupon._id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    
    expect(updatedCoupon.usageCount).toBe(1);
    
    // Increment again
    const incrementedAgain = await Coupon.findByIdAndUpdate(
      coupon._id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    
    expect(incrementedAgain.usageCount).toBe(2);
  });
});