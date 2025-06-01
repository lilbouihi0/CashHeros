/**
 * @module controllers/adminController
 * @description Controller for admin-related operations
 */

const User = require('../models/User');
const Blog = require('../models/Blog');
const Coupon = require('../models/Coupon');
const Cashback = require('../models/Cashback');
const { validationResult } = require('express-validator');

/**
 * Get all users with pagination and search functionality
 * 
 * @async
 * @function getAllUsers
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of items per page
 * @param {string} [req.query.search=''] - Search term for filtering users
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - JSON response with users and pagination data
 * 
 * @example
 * // Request: GET /api/admin/users?page=2&limit=20&search=john
 * // Response:
 * {
 *   "success": true,
 *   "data": [...], // Array of user objects
 *   "pagination": {
 *     "totalUsers": 100,
 *     "totalPages": 5,
 *     "currentPage": 2,
 *     "limit": 20
 *   }
 * }
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        // Create search query if search parameter is provided
        const searchQuery = search
            ? {
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        // Find users matching the search query with pagination
        const users = await User.find(searchQuery)
            .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ joinDate: -1 });

        // Get total count for pagination
        const total = await User.countDocuments(searchQuery);

        // Send response with users and pagination data
        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                totalUsers: total,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * Get a specific user by ID
 * 
 * @async
 * @function getUserById
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - User ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - JSON response with user data
 * 
 * @example
 * // Request: GET /api/admin/users/60d21b4667d0d8992e610c85
 * // Response:
 * {
 *   "success": true,
 *   "data": {
 *     "_id": "60d21b4667d0d8992e610c85",
 *     "email": "user@example.com",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     ...
 *   }
 * }
 */
exports.getUserById = async (req, res) => {
    try {
        // Find user by ID, excluding sensitive fields
        const user = await User.findById(req.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

        // Check if user exists
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Send response with user data
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * Update a user's information
 * 
 * @async
 * @function updateUser
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - User ID to update
 * @param {Object} req.body - Request body with fields to update
 * @param {string} [req.body.role] - User role (e.g., 'user', 'admin')
 * @param {boolean} [req.body.verified] - User verification status
 * @param {string} [req.body.firstName] - User's first name
 * @param {string} [req.body.lastName] - User's last name
 * @param {Object} req.user - Authenticated user from auth middleware
 * @param {string} req.user.userId - ID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - JSON response with updated user data
 * 
 * @example
 * // Request: PUT /api/admin/users/60d21b4667d0d8992e610c85
 * // Request body:
 * {
 *   "role": "admin",
 *   "verified": true
 * }
 * // Response:
 * {
 *   "success": true,
 *   "data": {
 *     "_id": "60d21b4667d0d8992e610c85",
 *     "email": "user@example.com",
 *     "role": "admin",
 *     "verified": true,
 *     ...
 *   },
 *   "message": "User updated successfully"
 * }
 */
exports.updateUser = async (req, res) => {
    try {
        const { role, verified, firstName, lastName } = req.body;

        // Only allow updating specific fields
        const updateData = {};
        if (role !== undefined) updateData.role = role;
        if (verified !== undefined) updateData.verified = verified;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;

        // Check if user exists
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Prevent changing your own role (security measure)
        if (user._id.toString() === req.user.userId && updateData.role) {
            return res.status(400).json({
                success: false,
                error: 'You cannot change your own role'
            });
        }

        // Update user and return the updated document
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

        // Send response with updated user data
        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * Delete a user
 * 
 * @async
 * @function deleteUser
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - User ID to delete
 * @param {Object} req.user - Authenticated user from auth middleware
 * @param {string} req.user.userId - ID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - JSON response confirming deletion
 * 
 * @example
 * // Request: DELETE /api/admin/users/60d21b4667d0d8992e610c85
 * // Response:
 * {
 *   "success": true,
 *   "message": "User deleted successfully"
 * }
 */
exports.deleteUser = async (req, res) => {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        // Check if user exists
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Prevent deleting yourself (security measure)
        if (user._id.toString() === req.user.userId) {
            return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
        }

        // Delete the user
        await User.findByIdAndDelete(req.params.id);
        
        // Send success response
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * Get analytics data for the admin dashboard
 * 
 * @async
 * @function getAnalytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - JSON response with analytics data
 * 
 * @example
 * // Request: GET /api/admin/analytics
 * // Response:
 * {
 *   "success": true,
 *   "data": {
 *     "users": {
 *       "total": 1000,
 *       "newToday": 5,
 *       "newThisWeek": 35,
 *       "newThisMonth": 150,
 *       "active": 750,
 *       "roles": {
 *         "admin": 10,
 *         "user": 990
 *       },
 *       "verification": {
 *         "verified": 900,
 *         "unverified": 100
 *       }
 *     },
 *     "content": {
 *       "blogs": 50,
 *       "coupons": 500,
 *       "cashbacks": 300
 *     },
 *     "recent": {
 *       "users": [...],
 *       "blogs": [...],
 *       "coupons": [...],
 *       "cashbacks": [...]
 *     }
 *   }
 * }
 */
exports.getAnalytics = async (req, res) => {
    try {
        // User statistics
        const totalUsers = await User.countDocuments();
        const newUsersToday = await User.countDocuments({
            joinDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });
        const newUsersThisWeek = await User.countDocuments({
            joinDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        });
        const newUsersThisMonth = await User.countDocuments({
            joinDate: { $gte: new Date(new Date().setDate(1)) }
        });

        // Content statistics
        const totalBlogs = await Blog.countDocuments();
        const totalCoupons = await Coupon.countDocuments();
        const totalCashbacks = await Cashback.countDocuments();

        // Active users (users who logged in within the last 30 days)
        const activeUsers = await User.countDocuments({
            lastLogin: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
        });

        // User roles distribution
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const regularUsers = await User.countDocuments({ role: 'user' });

        // Verification statistics
        const verifiedUsers = await User.countDocuments({ verified: true });
        const unverifiedUsers = await User.countDocuments({ verified: false });

        // Recent activity
        const recentUsers = await User.find()
            .select('email firstName lastName joinDate lastLogin')
            .sort({ joinDate: -1 })
            .limit(5);

        const recentBlogs = await Blog.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const recentCoupons = await Coupon.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const recentCashbacks = await Cashback.find()
            .sort({ createdAt: -1 })
            .limit(5);

        // Compile all analytics
        const analytics = {
            users: {
                total: totalUsers,
                newToday: newUsersToday,
                newThisWeek: newUsersThisWeek,
                newThisMonth: newUsersThisMonth,
                active: activeUsers,
                roles: {
                    admin: adminUsers,
                    user: regularUsers
                },
                verification: {
                    verified: verifiedUsers,
                    unverified: unverifiedUsers
                }
            },
            content: {
                blogs: totalBlogs,
                coupons: totalCoupons,
                cashbacks: totalCashbacks
            },
            recent: {
                users: recentUsers,
                blogs: recentBlogs,
                coupons: recentCoupons,
                cashbacks: recentCashbacks
            }
        };

        // Send response with analytics data
        res.status(200).json({ success: true, data: analytics });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * Get system status information
 * 
 * @async
 * @function getSystemStatus
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - JSON response with system status data
 * 
 * @example
 * // Request: GET /api/admin/system
 * // Response:
 * {
 *   "success": true,
 *   "data": {
 *     "nodeVersion": "v18.12.1",
 *     "uptime": 86400,
 *     "memoryUsage": {
 *       "rss": 50331648,
 *       "heapTotal": 33554432,
 *       "heapUsed": 20971520,
 *       "external": 1048576
 *     },
 *     "cpuUsage": {
 *       "user": 1000000,
 *       "system": 500000
 *     },
 *     "platform": "linux",
 *     "arch": "x64"
 *   }
 * }
 */
exports.getSystemStatus = async (req, res) => {
    try {
        // Get Node.js version and system information
        const systemInfo = {
            nodeVersion: process.version,
            uptime: Math.floor(process.uptime()),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            platform: process.platform,
            arch: process.arch
        };

        // Send response with system information
        res.status(200).json({ success: true, data: systemInfo });
    } catch (error) {
        console.error('Error fetching system status:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
