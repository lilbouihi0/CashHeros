const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const adminController = require('../controllers/adminController');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Coupon = require('../models/Coupon');
const Cashback = require('../models/Cashback');

// Mock dependencies
jest.mock('../models/User');
jest.mock('../models/Blog');
jest.mock('../models/Coupon');
jest.mock('../models/Cashback');

describe('Admin Controller', () => {
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

  describe('getAllUsers', () => {
    it('should get all users with pagination', async () => {
      // Mock data
      const mockUsers = [
        { _id: 'user1', email: 'user1@example.com' },
        { _id: 'user2', email: 'user2@example.com' }
      ];
      const mockTotal = 2;

      // Setup mocks
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockUsers)
      });
      User.countDocuments.mockResolvedValue(mockTotal);

      // Call the controller
      await adminController.getAllUsers(req, res);

      // Assertions
      expect(User.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        pagination: {
          totalUsers: mockTotal,
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
      const mockUsers = [{ _id: 'user1', email: 'test@example.com' }];
      const mockTotal = 1;

      // Setup mocks
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockUsers)
      });
      User.countDocuments.mockResolvedValue(mockTotal);

      // Call the controller
      await adminController.getAllUsers(req, res);

      // Assertions
      expect(User.find).toHaveBeenCalledWith({
        $or: [
          { email: { $regex: 'test', $options: 'i' } },
          { firstName: { $regex: 'test', $options: 'i' } },
          { lastName: { $regex: 'test', $options: 'i' } }
        ]
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle server errors', async () => {
      // Setup mock to throw error
      User.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await adminController.getAllUsers(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('getUserById', () => {
    it('should get a user by ID', async () => {
      // Setup request
      req.params.id = 'user1';

      // Mock data
      const mockUser = { _id: 'user1', email: 'user1@example.com' };

      // Setup mocks
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Call the controller
      await adminController.getUserById(req, res);

      // Assertions
      expect(User.findById).toHaveBeenCalledWith('user1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('should return 404 if user not found', async () => {
      // Setup request
      req.params.id = 'nonexistentUser';

      // Setup mocks
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      // Call the controller
      await adminController.getUserById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should handle server errors', async () => {
      // Setup request
      req.params.id = 'user1';

      // Setup mock to throw error
      User.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await adminController.getUserById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      // Setup request
      req.params.id = 'user1';
      req.body = { role: 'admin', firstName: 'Updated' };

      // Mock data
      const mockUser = { _id: 'user1', email: 'user1@example.com' };
      const updatedUser = { 
        _id: 'user1', 
        email: 'user1@example.com', 
        role: 'admin', 
        firstName: 'Updated' 
      };

      // Setup mocks
      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser)
      });

      // Call the controller
      await adminController.updateUser(req, res);

      // Assertions
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user1',
        { role: 'admin', firstName: 'Updated' },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    });

    it('should return 404 if user not found', async () => {
      // Setup request
      req.params.id = 'nonexistentUser';
      req.body = { role: 'admin' };

      // Setup mocks
      User.findById.mockResolvedValue(null);

      // Call the controller
      await adminController.updateUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should prevent changing own role', async () => {
      // Setup request to match the logged-in user
      req.params.id = 'mockUserId';
      req.body = { role: 'user' };

      // Mock data
      const mockUser = { _id: 'mockUserId', toString: () => 'mockUserId' };

      // Setup mocks
      User.findById.mockResolvedValue(mockUser);

      // Call the controller
      await adminController.updateUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'You cannot change your own role'
      });
    });

    it('should handle server errors', async () => {
      // Setup request
      req.params.id = 'user1';
      req.body = { role: 'admin' };

      // Setup mock to throw error
      User.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await adminController.updateUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      // Setup request
      req.params.id = 'user1';

      // Mock data
      const mockUser = { 
        _id: 'user1', 
        toString: () => 'user1' 
      };

      // Setup mocks
      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndDelete.mockResolvedValue({});

      // Call the controller
      await adminController.deleteUser(req, res);

      // Assertions
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully'
      });
    });

    it('should return 404 if user not found', async () => {
      // Setup request
      req.params.id = 'nonexistentUser';

      // Setup mocks
      User.findById.mockResolvedValue(null);

      // Call the controller
      await adminController.deleteUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });

    it('should prevent deleting own account', async () => {
      // Setup request to match the logged-in user
      req.params.id = 'mockUserId';

      // Mock data
      const mockUser = { 
        _id: 'mockUserId', 
        toString: () => 'mockUserId' 
      };

      // Setup mocks
      User.findById.mockResolvedValue(mockUser);

      // Call the controller
      await adminController.deleteUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Cannot delete your own account'
      });
    });

    it('should handle server errors', async () => {
      // Setup request
      req.params.id = 'user1';

      // Setup mock to throw error
      User.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await adminController.deleteUser(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      // Mock data
      const mockCounts = {
        totalUsers: 100,
        newUsersToday: 5,
        newUsersThisWeek: 20,
        newUsersThisMonth: 50,
        totalBlogs: 30,
        totalCoupons: 200,
        totalCashbacks: 150,
        activeUsers: 80,
        adminUsers: 5,
        regularUsers: 95,
        verifiedUsers: 90,
        unverifiedUsers: 10
      };

      const mockRecentData = {
        recentUsers: [{ email: 'recent@example.com' }],
        recentBlogs: [{ title: 'Recent Blog' }],
        recentCoupons: [{ code: 'RECENT' }],
        recentCashbacks: [{ store: 'Recent Store' }]
      };

      // Setup mocks
      User.countDocuments.mockImplementation((query) => {
        if (!query) return Promise.resolve(mockCounts.totalUsers);
        if (query.joinDate && query.joinDate.$gte) {
          if (query.joinDate.$gte.getDate() === new Date().getDate()) {
            return Promise.resolve(mockCounts.newUsersToday);
          }
          if (query.joinDate.$gte.getDate() === 1) {
            return Promise.resolve(mockCounts.newUsersThisMonth);
          }
          return Promise.resolve(mockCounts.newUsersThisWeek);
        }
        if (query.lastLogin) return Promise.resolve(mockCounts.activeUsers);
        if (query.role === 'admin') return Promise.resolve(mockCounts.adminUsers);
        if (query.role === 'user') return Promise.resolve(mockCounts.regularUsers);
        if (query.verified === true) return Promise.resolve(mockCounts.verifiedUsers);
        if (query.verified === false) return Promise.resolve(mockCounts.unverifiedUsers);
        return Promise.resolve(0);
      });

      Blog.countDocuments.mockResolvedValue(mockCounts.totalBlogs);
      Coupon.countDocuments.mockResolvedValue(mockCounts.totalCoupons);
      Cashback.countDocuments.mockResolvedValue(mockCounts.totalCashbacks);

      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockRecentData.recentUsers)
      });

      Blog.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockRecentData.recentBlogs)
      });

      Coupon.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockRecentData.recentCoupons)
      });

      Cashback.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockRecentData.recentCashbacks)
      });

      // Call the controller
      await adminController.getAnalytics(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          users: expect.objectContaining({
            total: mockCounts.totalUsers,
            newToday: mockCounts.newUsersToday,
            newThisWeek: mockCounts.newUsersThisWeek,
            newThisMonth: mockCounts.newUsersThisMonth
          }),
          content: expect.objectContaining({
            blogs: mockCounts.totalBlogs,
            coupons: mockCounts.totalCoupons,
            cashbacks: mockCounts.totalCashbacks
          }),
          recent: expect.objectContaining({
            users: mockRecentData.recentUsers,
            blogs: mockRecentData.recentBlogs,
            coupons: mockRecentData.recentCoupons,
            cashbacks: mockRecentData.recentCashbacks
          })
        })
      });
    });

    it('should handle server errors', async () => {
      // Setup mock to throw error
      User.countDocuments.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Call the controller
      await adminController.getAnalytics(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });
    });
  });

  describe('getSystemStatus', () => {
    it('should return system status information', async () => {
      // Call the controller
      await adminController.getSystemStatus(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          nodeVersion: expect.any(String),
          uptime: expect.any(Number),
          memoryUsage: expect.any(Object),
          cpuUsage: expect.any(Object),
          platform: expect.any(String),
          arch: expect.any(String)
        })
      });
    });

    it('should handle server errors', async () => {
      // Mock process.memoryUsage to throw an error
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockImplementation(() => {
        throw new Error('System error');
      });

      // Call the controller
      await adminController.getSystemStatus(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server error'
      });

      // Restore original function
      process.memoryUsage = originalMemoryUsage;
    });
  });
});