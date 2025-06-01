const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

describe('Authentication and Authorization', () => {
  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
    
    // Create test users
    await User.create({
      email: 'admin@example.com',
      password: await bcrypt.hash('adminpassword', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      verified: true
    });
    
    await User.create({
      email: 'user@example.com',
      password: await bcrypt.hash('userpassword', 10),
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      verified: true
    });
    
    await User.create({
      email: 'unverified@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Unverified',
      lastName: 'User',
      role: 'user',
      verified: false,
      verificationToken: 'test-verification-token'
    });
  });
  
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('registered successfully');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data.user.firstName).toBe('New');
      expect(res.body.data.user.lastName).toBe('User');
      expect(res.body.data.user.role).toBe('user'); // Default role
      expect(res.body.data.user.verified).toBe(false); // Should be unverified initially
      expect(res.body.data.user).not.toHaveProperty('password'); // Password should not be returned
      
      // Verify user was saved to database
      const savedUser = await User.findOne({ email: 'newuser@example.com' });
      expect(savedUser).not.toBeNull();
      expect(savedUser.verificationToken).toBeDefined(); // Should have verification token
    });
    
    it('should return 400 if email already exists', async () => {
      const duplicateUser = {
        email: 'user@example.com', // Already exists
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User'
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('already exists');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const incompleteUser = {
        email: 'incomplete@example.com',
        // Missing password, firstName, lastName
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Validation error');
    });
    
    it('should return 400 if password is too short', async () => {
      const weakPasswordUser = {
        email: 'weakpass@example.com',
        password: '123', // Too short
        firstName: 'Weak',
        lastName: 'Password'
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('password');
    });
    
    it('should return 400 if email format is invalid', async () => {
      const invalidEmailUser = {
        email: 'not-an-email', // Invalid email format
        password: 'password123',
        firstName: 'Invalid',
        lastName: 'Email'
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailUser)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('email');
    });
  });
  
  describe('User Login', () => {
    it('should login a verified user successfully', async () => {
      const loginCredentials = {
        email: 'user@example.com',
        password: 'userpassword'
      };
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('logged in successfully');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('user@example.com');
      expect(res.body.data.user).not.toHaveProperty('password'); // Password should not be returned
      
      // Verify token is valid
      const decodedToken = jwt.verify(
        res.body.data.accessToken,
        process.env.JWT_SECRET || 'testsecret'
      );
      expect(decodedToken).toHaveProperty('userId');
      expect(decodedToken).toHaveProperty('role');
      expect(decodedToken.role).toBe('user');
    });
    
    it('should login an admin user successfully', async () => {
      const loginCredentials = {
        email: 'admin@example.com',
        password: 'adminpassword'
      };
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('admin');
      
      // Verify token has admin role
      const decodedToken = jwt.verify(
        res.body.data.accessToken,
        process.env.JWT_SECRET || 'testsecret'
      );
      expect(decodedToken.role).toBe('admin');
    });
    
    it('should return 400 if user is not verified', async () => {
      const loginCredentials = {
        email: 'unverified@example.com',
        password: 'password123'
      };
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not verified');
    });
    
    it('should return 401 if email is incorrect', async () => {
      const loginCredentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid credentials');
    });
    
    it('should return 401 if password is incorrect', async () => {
      const loginCredentials = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid credentials');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const incompleteCredentials = {
        email: 'user@example.com'
        // Missing password
      };
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(incompleteCredentials)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('required');
    });
  });
  
  describe('Email Verification', () => {
    it('should verify a user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify/test-verification-token')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('verified successfully');
      
      // Verify user is now verified in database
      const verifiedUser = await User.findOne({ email: 'unverified@example.com' });
      expect(verifiedUser.verified).toBe(true);
      expect(verifiedUser.verificationToken).toBeUndefined(); // Token should be removed
    });
    
    it('should return 404 for invalid verification token', async () => {
      const res = await request(app)
        .get('/api/auth/verify/invalid-token')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid verification token');
    });
  });
  
  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'user@example.com' })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset link has been sent');
      
      // Verify reset token was set in database
      const user = await User.findOne({ email: 'user@example.com' });
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpires).toBeDefined();
    });
    
    it('should return 404 if email not found', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not found');
    });
    
    it('should reset password with valid token', async () => {
      // First set a reset token
      const user = await User.findOne({ email: 'user@example.com' });
      const resetToken = 'test-reset-token';
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
      await user.save();
      
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123'
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Password has been reset');
      
      // Verify password was changed and token was cleared
      const updatedUser = await User.findOne({ email: 'user@example.com' });
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();
      
      // Verify new password works for login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'newpassword123'
        })
        .expect(200);
      
      expect(loginRes.body.success).toBe(true);
    });
    
    it('should return 400 for expired reset token', async () => {
      // Set an expired reset token
      const user = await User.findOne({ email: 'user@example.com' });
      const resetToken = 'expired-reset-token';
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() - 3600000; // 1 hour ago (expired)
      await user.save();
      
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123'
        })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('expired');
    });
    
    it('should return 400 for invalid reset token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newpassword123'
        })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid or expired');
    });
  });
  
  describe('Refresh Token', () => {
    it('should issue new access token with valid refresh token', async () => {
      // First login to get refresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'userpassword'
        })
        .expect(200);
      
      const refreshToken = loginRes.body.data.refreshToken;
      
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      
      // Verify new access token is valid
      const decodedToken = jwt.verify(
        res.body.data.accessToken,
        process.env.JWT_SECRET || 'testsecret'
      );
      expect(decodedToken).toHaveProperty('userId');
    });
    
    it('should return 401 for invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid refresh token');
    });
  });
  
  describe('Logout', () => {
    it('should logout successfully', async () => {
      // First login to get tokens
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'userpassword'
        })
        .expect(200);
      
      const accessToken = loginRes.body.data.accessToken;
      
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('logged out successfully');
    });
    
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(res.body.success).toBe(false);
    });
  });
  
  describe('Authorization Middleware', () => {
    let userToken, adminToken;
    
    beforeEach(async () => {
      // Get tokens for testing
      const userLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'userpassword'
        });
      
      const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'adminpassword'
        });
      
      userToken = userLoginRes.body.data.accessToken;
      adminToken = adminLoginRes.body.data.accessToken;
    });
    
    it('should allow access to protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
    });
    
    it('should deny access to protected route without token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('authentication');
    });
    
    it('should deny access to protected route with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid token');
    });
    
    it('should allow admin access to admin-only route', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.success).toBe(true);
    });
    
    it('should deny regular user access to admin-only route', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect('Content-Type', /json/)
        .expect(403);
      
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not authorized');
    });
  });
});