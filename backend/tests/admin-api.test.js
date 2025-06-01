const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let mongoServer;

// Helper function to generate a valid JWT token for testing
const generateToken = (userId, role = 'admin') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Admin API Integration Tests', () => {
  beforeAll(async () => {
    // Create an in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Disconnect and stop MongoDB instance
    await mongoose.disconnect();
    await mongoServer.stop();
    
    // Close the server if it's running
    if (app.listening) {
      await new Promise(resolve => app.close(resolve));
    }
  });

  beforeEach(async () => {
    // Clear all collections before each test
    await User.deleteMany({});
  });

  describe('GET /api/admin/users', () => {
    it('should return all users with pagination', async () => {
      // Create test users
      await User.create([
        { email: 'user1@example.com', firstName: 'User', lastName: 'One', password: 'password123', role: 'user' },
        { email: 'user2@example.com', firstName: 'User', lastName: 'Two', password: 'password123', role: 'user' },
        { email: 'admin@example.com', firstName: 'Admin', lastName: 'User', password: 'password123', role: 'admin' }
      ]);

      // Create a test admin user
      const admin = await User.create({
        email: 'testadmin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123',
        role: 'admin'
      });

      // Generate token for the admin
      const token = generateToken(admin._id.toString());

      // Make request
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(4);
      expect(response.body.pagination).toEqual({
        totalUsers: 4,
        totalPages: 1,
        currentPage: 1,
        limit: 10
      });
    });

    it('should filter users by search term', async () => {
      // Create test users
      await User.create([
        { email: 'john@example.com', firstName: 'John', lastName: 'Doe', password: 'password123', role: 'user' },
        { email: 'jane@example.com', firstName: 'Jane', lastName: 'Doe', password: 'password123', role: 'user' },
        { email: 'admin@example.com', firstName: 'Admin', lastName: 'User', password: 'password123', role: 'admin' }
      ]);

      // Create a test admin user
      const admin = await User.create({
        email: 'testadmin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123',
        role: 'admin'
      });

      // Generate token for the admin
      const token = generateToken(admin._id.toString());

      // Make request with search term
      const response = await request(app)
        .get('/api/admin/users?search=john')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe('john@example.com');
    });

    it('should require authentication', async () => {
      // Make request without token
      const response = await request(app)
        .get('/api/admin/users')
        .expect('Content-Type', /json/)
        .expect(401);

      // Assertions
      expect(response.body.success).toBe(false);
    });

    it('should require admin role', async () => {
      // Create a regular user
      const user = await User.create({
        email: 'regularuser@example.com',
        firstName: 'Regular',
        lastName: 'User',
        password: 'password123',
        role: 'user'
      });

      // Generate token for the regular user
      const token = generateToken(user._id.toString(), 'user');

      // Make request with non-admin token
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(403);

      // Assertions
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should return a specific user by ID', async () => {
      // Create a test user
      const testUser = await User.create({
        email: 'testuser@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        role: 'user'
      });

      // Create a test admin user
      const admin = await User.create({
        email: 'testadmin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123',
        role: 'admin'
      });

      // Generate token for the admin
      const token = generateToken(admin._id.toString());

      // Make request
      const response = await request(app)
        .get(`/api/admin/users/${testUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          email: 'testuser@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user'
        })
      );
      // Ensure password is not returned
      expect(response.body.data.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      // Create a test admin user
      const admin = await User.create({
        email: 'testadmin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123',
        role: 'admin'
      });

      // Generate token for the admin
      const token = generateToken(admin._id.toString());

      // Generate a valid but non-existent ObjectId
      const nonExistentId = new mongoose.Types.ObjectId();

      // Make request
      const response = await request(app)
        .get(`/api/admin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(404);

      // Assertions
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update a user', async () => {
      // Create a test user
      const testUser = await User.create({
        email: 'testuser@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        role: 'user'
      });

      // Create a test admin user
      const admin = await User.create({
        email: 'testadmin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123',
        role: 'admin'
      });

      // Generate token for the admin
      const token = generateToken(admin._id.toString());

      // Make request
      const response = await request(app)
        .put(`/api/admin/users/${testUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          role: 'admin'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          email: 'testuser@example.com',
          firstName: 'Updated',
          lastName: 'Name',
          role: 'admin'
        })
      );
      
      // Verify the update in the database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.role).toBe('admin');
    });

    it('should prevent admin from changing their own role', async () => {
      // Create a test admin user
      const admin = await User.create({
        email: 'testadmin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123',
        role: 'admin'
      });

      // Generate token for the admin
      const token = generateToken(admin._id.toString());

      // Make request to change own role
      const response = await request(app)
        .put(`/api/admin/users/${admin._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          role: 'user'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      // Assertions
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('You cannot change your own role');
      
      // Verify the role was not changed in the database
      const unchangedAdmin = await User.findById(admin._id);
      expect(unchangedAdmin.role).toBe('admin');
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete a user', async () => {
      // Create a test user
      const testUser = await User.create({
        email: 'testuser@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        role: 'user'
      });

      // Create a test admin user
      const admin = await User.create({
        email: 'testadmin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123',
        role: 'admin'
      });

      // Generate token for the admin
      const token = generateToken(admin._id.toString());

      // Make request
      const response = await request(app)
        .delete(`/api/admin/users/${testUser._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
      
      // Verify the user was deleted from the database
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    it('should prevent admin from deleting their own account', async () => {
      // Create a test admin user
      const admin = await User.create({
        email: 'testadmin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123',
        role: 'admin'
      });

      // Generate token for the admin
      const token = generateToken(admin._id.toString());

      // Make request to delete own account
      const response = await request(app)
        .delete(`/api/admin/users/${admin._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(400);

      // Assertions
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Cannot delete your own account');
      
      // Verify the admin was not deleted from the database
      const unchangedAdmin = await User.findById(admin._id);
      expect(unchangedAdmin).not.toBeNull();
    });
  });

  describe('GET /api/admin/analytics', () => {
    it('should return analytics data', async () => {
      // Create test users with different roles and verification status
      await User.create([
        { 
          email: 'user1@example.com', 
          firstName: 'User', 
          lastName: 'One', 
          password: 'password123', 
          role: 'user',
          verified: true,
          joinDate: new Date(),
          lastLogin: new Date()
        },
        { 
          email: 'user2@example.com', 
          firstName: 'User', 
          lastName: 'Two', 
          password: 'password123', 
          role: 'user',
          verified: false,
          joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          lastLogin: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 days ago (inactive)
        }
      ]);

      // Create a test admin user
      const admin = await User.create({
        email: 'testadmin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123',
        role: 'admin',
        verified: true,
        joinDate: new Date(),
        lastLogin: new Date()
      });

      // Generate token for the admin
      const token = generateToken(admin._id.toString());

      // Make request
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          users: expect.objectContaining({
            total: 3,
            roles: expect.objectContaining({
              admin: 1,
              user: 2
            }),
            verification: expect.objectContaining({
              verified: 2,
              unverified: 1
            })
          })
        })
      );
    });
  });

  describe('GET /api/admin/system', () => {
    it('should return system status information', async () => {
      // Create a test admin user
      const admin = await User.create({
        email: 'testadmin@example.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123',
        role: 'admin'
      });

      // Generate token for the admin
      const token = generateToken(admin._id.toString());

      // Make request
      const response = await request(app)
        .get('/api/admin/system')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          nodeVersion: expect.any(String),
          uptime: expect.any(Number),
          memoryUsage: expect.any(Object),
          cpuUsage: expect.any(Object),
          platform: expect.any(String),
          arch: expect.any(String)
        })
      );
    });
  });
});