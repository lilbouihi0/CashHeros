const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const couponController = require('../../../controllers/couponController');
const Coupon = require('../../../models/Coupon');
const User = require('../../../models/User');
const Store = require('../../../models/Store');

// Mock dependencies
jest.mock('../../../models/Coupon');
jest.mock('../../../models/User');
jest.mock('../../../models/Store');

describe('Coupon Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      params: {},
      query: {},
      body: {},
      user: { userId: 'mockUserId' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getAllCoupons', () => {
    it('should get all coupons with pagination', async () => {
      // Mock data
      const mockCoupons = [
        { _id: 'coupon1', code: 'CODE1', title: 'Coupon 1' },
        { _id: 'coupon2', code: 'CODE2', title: 'Coupon 2' }
      ];
      const mockTotal = 2;

      // Setup mocks
      Coupon.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockCoupons)
      });
      Coupon.countDocuments.mockResolvedValue(mockTotal);

      // Call the controller
      await couponController.getAllCoupons(req, res);

      // Assertions
      expect(Coupon.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCoupons,
        pagination: {
          totalCoupons: mockTotal,
          totalPages: Math.ceil(mockTotal / 10),
          currentPage: 1,
          limit: 10
        }
      });
    });

    it('should handle search parameters', async () => {
      // Setup request with search
      req.query.search = 'test';

      // Mock data
      const mockCoupons = [{ _id: 'coupon1', code: 'TEST', title: 'Test Coupon' }];
      const mockTotal = 1;

      // Setup mocks
      Coupon.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockCoupons)
      });
      Coupon.countDocuments.mockResolvedValue(mockTotal);

      // Call the controller
      await couponController.getAllCoupons(req, res);

      // Assertions
      expect(Coupon.find).toHaveBeenCalledWith(expect.objectContaining({
        $or: expect.any(Array)
      }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle category filter', async () => {
      // Setup request with category filter
      req.query.category = 'Electronics';

      // Mock data
      const mockCoupons = [{ _id: 'coupon1', code: 'ELEC10', title: 'Electronics Coupon' }];
      const mockTotal = 1;

      // Setup mocks
      Coupon.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockCoupons)
      });
      Coupon.countDocuments.mockResolvedValue(mockTotal);

      // Call the controller
      await couponController.getAllCoupons(req, res);

      // Assertions
      expect(Coupon.find).toHaveBeenCalledWith(expect.objectContaining({
        category: 'Electronics'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle store filter', async () => {
      // Setup request with store filter
      req.query.store = 'store123';

      // Mock data
      const mockCoupons = [{ _id: 'coupon1', code: 'STORE10', title: 'Store Coupon' }];
      const mockTotal = 1;

      // Setup mocks
      Coupon.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockCoupons)
      });
      Coupon.countDocuments.mockResolvedValue(mockTotal);

      // Call the controller
      await couponController.getAllCoupons(req, res);

      // Assertions
      expect(Coupon.find).toHaveBeenCalledWith(expect.objectContaining({
        store: 'store123'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle active filter', async () => {
      // Setup request with active filter
      req.query.active = 'true';

      // Mock data
      const mockCoupons = [{ _id: 'coupon1', code: 'ACTIVE10', title: 'Active Coupon' }];
      const mockTotal = 1;

      // Setup mocks
      Coupon.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockCoupons)
      });
      Coupon.countDocuments.mockResolvedValue(mockTotal);

      // Call the controller
      await couponController.getAllCoupons(req, res);

      // Assertions
      expect(Coupon.find).toHaveBeenCalledWith(expect.objectContaining({
        isActive: true
      }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle sorting', async () => {
      // Setup request with sort parameter
      req.query.sort = 'discount';

      // Mock data
      const mockCoupons = [
        { _id: 'coupon1', code: 'CODE1', title: 'Coupon 1', discount: 20 },
        { _id: 'coupon2', code: 'CODE2', title: 'Coupon 2', discount: 10 }
      ];
      const mockTotal = 2;

      // Setup mocks
      Coupon.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockCoupons)
      });
      Coupon.countDocuments.mockResolvedValue(mockTotal);

      // Call the controller
      await couponController.getAllCoupons(req, res);

      // Assertions
      expect(Coupon.find().sort).toHaveBeenCalledWith({ discount: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle server errors', async () => {
      // Setup mock to throw error
      Coupon.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await couponController.getAllCoupons(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('getCouponById', () => {
    it('should get a coupon by ID', async () => {
      // Setup request
      req.params.id = 'coupon1';

      // Mock data
      const mockCoupon = { 
        _id: 'coupon1', 
        code: 'CODE1', 
        title: 'Coupon 1',
        store: {
          _id: 'store1',
          name: 'Test Store'
        }
      };

      // Setup mocks
      Coupon.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCoupon)
      });

      // Call the controller
      await couponController.getCouponById(req, res);

      // Assertions
      expect(Coupon.findById).toHaveBeenCalledWith('coupon1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCoupon
      });
    });

    it('should return 404 if coupon not found', async () => {
      // Setup request
      req.params.id = 'nonexistentCoupon';

      // Setup mocks
      Coupon.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      });

      // Call the controller
      await couponController.getCouponById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Coupon not found'
      });
    });

    it('should handle server errors', async () => {
      // Setup request
      req.params.id = 'coupon1';

      // Setup mock to throw error
      Coupon.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await couponController.getCouponById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('createCoupon', () => {
    it('should create a new coupon', async () => {
      // Setup request body
      req.body = {
        code: 'NEWCODE',
        title: 'New Coupon',
        description: 'New coupon description',
        store: 'store1',
        discount: 15,
        expiryDate: '2023-12-31',
        isActive: true
      };

      // Mock data
      const mockStore = { _id: 'store1', name: 'Test Store' };
      const mockCoupon = {
        _id: 'newCoupon',
        ...req.body,
        store: mockStore
      };

      // Setup mocks
      Store.findById.mockResolvedValue(mockStore);
      Coupon.create.mockResolvedValue(mockCoupon);

      // Call the controller
      await couponController.createCoupon(req, res);

      // Assertions
      expect(Coupon.create).toHaveBeenCalledWith(expect.objectContaining({
        code: 'NEWCODE',
        title: 'New Coupon',
        createdBy: 'mockUserId'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCoupon,
        message: 'Coupon created successfully'
      });
    });

    it('should return 400 if store not found', async () => {
      // Setup request body
      req.body = {
        code: 'NEWCODE',
        title: 'New Coupon',
        store: 'nonexistentStore',
        discount: 15
      };

      // Setup mocks
      Store.findById.mockResolvedValue(null);

      // Call the controller
      await couponController.createCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Store not found'
      });
    });

    it('should return 400 if coupon code already exists', async () => {
      // Setup request body
      req.body = {
        code: 'EXISTINGCODE',
        title: 'New Coupon',
        store: 'store1',
        discount: 15
      };

      // Setup mocks
      Store.findById.mockResolvedValue({ _id: 'store1', name: 'Test Store' });
      Coupon.create.mockRejectedValue({
        code: 11000, // Duplicate key error
        keyPattern: { code: 1 }
      });

      // Call the controller
      await couponController.createCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Coupon code already exists'
      });
    });

    it('should handle validation errors', async () => {
      // Setup request body with missing required fields
      req.body = {
        title: 'New Coupon'
        // Missing code, store, discount
      };

      // Setup mocks
      Coupon.create.mockRejectedValue({
        name: 'ValidationError',
        errors: {
          code: { message: 'Code is required' },
          store: { message: 'Store is required' }
        }
      });

      // Call the controller
      await couponController.createCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('Validation error')
      });
    });

    it('should handle server errors', async () => {
      // Setup request body
      req.body = {
        code: 'NEWCODE',
        title: 'New Coupon',
        store: 'store1',
        discount: 15
      };

      // Setup mock to throw error
      Store.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await couponController.createCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('updateCoupon', () => {
    it('should update a coupon', async () => {
      // Setup request
      req.params.id = 'coupon1';
      req.body = {
        title: 'Updated Coupon',
        discount: 20,
        isActive: false
      };

      // Mock data
      const mockCoupon = {
        _id: 'coupon1',
        code: 'CODE1',
        title: 'Updated Coupon',
        discount: 20,
        isActive: false
      };

      // Setup mocks
      Coupon.findById.mockResolvedValue({ _id: 'coupon1', code: 'CODE1' });
      Coupon.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCoupon)
      });

      // Call the controller
      await couponController.updateCoupon(req, res);

      // Assertions
      expect(Coupon.findByIdAndUpdate).toHaveBeenCalledWith(
        'coupon1',
        {
          title: 'Updated Coupon',
          discount: 20,
          isActive: false,
          updatedBy: 'mockUserId'
        },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCoupon,
        message: 'Coupon updated successfully'
      });
    });

    it('should return 404 if coupon not found', async () => {
      // Setup request
      req.params.id = 'nonexistentCoupon';
      req.body = { title: 'Updated Coupon' };

      // Setup mocks
      Coupon.findById.mockResolvedValue(null);

      // Call the controller
      await couponController.updateCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Coupon not found'
      });
    });

    it('should handle validation errors', async () => {
      // Setup request
      req.params.id = 'coupon1';
      req.body = { discount: 'invalid' }; // Should be a number

      // Setup mocks
      Coupon.findById.mockResolvedValue({ _id: 'coupon1', code: 'CODE1' });
      Coupon.findByIdAndUpdate.mockRejectedValue({
        name: 'ValidationError',
        errors: {
          discount: { message: 'Discount must be a number' }
        }
      });

      // Call the controller
      await couponController.updateCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('Validation error')
      });
    });

    it('should handle server errors', async () => {
      // Setup request
      req.params.id = 'coupon1';
      req.body = { title: 'Updated Coupon' };

      // Setup mock to throw error
      Coupon.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await couponController.updateCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('deleteCoupon', () => {
    it('should delete a coupon', async () => {
      // Setup request
      req.params.id = 'coupon1';

      // Mock data
      const mockCoupon = { _id: 'coupon1', code: 'CODE1' };

      // Setup mocks
      Coupon.findById.mockResolvedValue(mockCoupon);
      Coupon.findByIdAndDelete.mockResolvedValue(mockCoupon);

      // Call the controller
      await couponController.deleteCoupon(req, res);

      // Assertions
      expect(Coupon.findByIdAndDelete).toHaveBeenCalledWith('coupon1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Coupon deleted successfully'
      });
    });

    it('should return 404 if coupon not found', async () => {
      // Setup request
      req.params.id = 'nonexistentCoupon';

      // Setup mocks
      Coupon.findById.mockResolvedValue(null);

      // Call the controller
      await couponController.deleteCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Coupon not found'
      });
    });

    it('should handle server errors', async () => {
      // Setup request
      req.params.id = 'coupon1';

      // Setup mock to throw error
      Coupon.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await couponController.deleteCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('redeemCoupon', () => {
    it('should redeem a coupon for a user', async () => {
      // Setup request
      req.params.id = 'coupon1';
      req.user = { userId: 'user1' };

      // Mock data
      const mockCoupon = { 
        _id: 'coupon1', 
        code: 'CODE1',
        isActive: true,
        expiryDate: new Date(Date.now() + 86400000), // 1 day in the future
        usageCount: 10,
        usageLimit: 100,
        save: jest.fn().mockResolvedValue({
          _id: 'coupon1',
          code: 'CODE1',
          usageCount: 11
        })
      };
      
      const mockUser = {
        _id: 'user1',
        redeemedCoupons: [],
        save: jest.fn().mockResolvedValue({
          _id: 'user1',
          redeemedCoupons: ['coupon1']
        })
      };

      // Setup mocks
      Coupon.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCoupon)
      });
      User.findById.mockResolvedValue(mockUser);

      // Call the controller
      await couponController.redeemCoupon(req, res);

      // Assertions
      expect(mockCoupon.save).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Coupon redeemed successfully',
        data: expect.objectContaining({
          coupon: expect.any(Object),
          redemptionDate: expect.any(Date)
        })
      });
    });

    it('should return 404 if coupon not found', async () => {
      // Setup request
      req.params.id = 'nonexistentCoupon';

      // Setup mocks
      Coupon.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      });

      // Call the controller
      await couponController.redeemCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Coupon not found'
      });
    });

    it('should return 400 if coupon is inactive', async () => {
      // Setup request
      req.params.id = 'coupon1';

      // Mock data
      const mockCoupon = { 
        _id: 'coupon1', 
        code: 'CODE1',
        isActive: false,
        expiryDate: new Date(Date.now() + 86400000) // 1 day in the future
      };

      // Setup mocks
      Coupon.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCoupon)
      });

      // Call the controller
      await couponController.redeemCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'This coupon is not active'
      });
    });

    it('should return 400 if coupon is expired', async () => {
      // Setup request
      req.params.id = 'coupon1';

      // Mock data
      const mockCoupon = { 
        _id: 'coupon1', 
        code: 'CODE1',
        isActive: true,
        expiryDate: new Date(Date.now() - 86400000) // 1 day in the past
      };

      // Setup mocks
      Coupon.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCoupon)
      });

      // Call the controller
      await couponController.redeemCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'This coupon has expired'
      });
    });

    it('should return 400 if coupon usage limit is reached', async () => {
      // Setup request
      req.params.id = 'coupon1';

      // Mock data
      const mockCoupon = { 
        _id: 'coupon1', 
        code: 'CODE1',
        isActive: true,
        expiryDate: new Date(Date.now() + 86400000), // 1 day in the future
        usageCount: 100,
        usageLimit: 100
      };

      // Setup mocks
      Coupon.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCoupon)
      });

      // Call the controller
      await couponController.redeemCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'This coupon has reached its usage limit'
      });
    });

    it('should return 400 if user has already redeemed the coupon', async () => {
      // Setup request
      req.params.id = 'coupon1';
      req.user = { userId: 'user1' };

      // Mock data
      const mockCoupon = { 
        _id: 'coupon1', 
        code: 'CODE1',
        isActive: true,
        expiryDate: new Date(Date.now() + 86400000), // 1 day in the future
        usageCount: 10,
        usageLimit: 100
      };
      
      const mockUser = {
        _id: 'user1',
        redeemedCoupons: [{ coupon: 'coupon1' }]
      };

      // Setup mocks
      Coupon.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCoupon)
      });
      User.findById.mockResolvedValue(mockUser);

      // Call the controller
      await couponController.redeemCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'You have already redeemed this coupon'
      });
    });

    it('should handle server errors', async () => {
      // Setup request
      req.params.id = 'coupon1';

      // Setup mock to throw error
      Coupon.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await couponController.redeemCoupon(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });
});