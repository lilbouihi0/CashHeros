const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAnalytics,
    getSystemStatus
} = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { param, body } = require('express-validator');
const Blog = require('../models/Blog');

// Admin role check middleware
const adminCheck = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    next();
};

// User management routes - protected, admin only
router.get('/users', authMiddleware, adminCheck, getAllUsers);

router.get('/users/:id',
    authMiddleware,
    adminCheck,
    [
        param('id').isMongoId().withMessage('Invalid user ID format')
    ],
    getUserById
);

router.put('/users/:id',
    authMiddleware,
    adminCheck,
    [
        param('id').isMongoId().withMessage('Invalid user ID format'),
        body('role').optional().isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
        body('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
        body('firstName').optional().isString().withMessage('First name must be a string'),
        body('lastName').optional().isString().withMessage('Last name must be a string')
    ],
    updateUser
);

router.delete('/users/:id',
    authMiddleware,
    adminCheck,
    [
        param('id').isMongoId().withMessage('Invalid user ID format')
    ],
    deleteUser
);

// Analytics routes - protected, admin only
router.get('/analytics', authMiddleware, adminCheck, getAnalytics);
router.get('/system', authMiddleware, adminCheck, getSystemStatus);

// Blog management routes
router.patch('/blogs/:id/publish', 
    authMiddleware, 
    adminCheck,
    [
        param('id').isString().withMessage('Invalid blog ID format'),
        body('published').isBoolean().withMessage('Published status must be a boolean')
    ],
    async (req, res) => {
        try {
            const { id } = req.params;
            const { published } = req.body;
            
            const blog = await Blog.findById(id);
            
            if (!blog) {
                return res.status(404).json({ message: 'Blog post not found' });
            }
            
            blog.published = published;
            blog.updatedAt = new Date();
            
            await blog.save();
            
            return res.status(200).json({ 
                success: true, 
                data: blog,
                message: `Blog post ${published ? 'published' : 'unpublished'} successfully` 
            });
        } catch (err) {
            console.error('Error updating blog publish status:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to update blog publish status' 
            });
        }
    }
);

// Blog feature toggle route
router.patch('/blogs/:id/feature', 
    authMiddleware, 
    adminCheck,
    [
        param('id').isString().withMessage('Invalid blog ID format'),
        body('featured').isBoolean().withMessage('Featured status must be a boolean')
    ],
    async (req, res) => {
        try {
            const { id } = req.params;
            const { featured } = req.body;
            
            const blog = await Blog.findById(id);
            
            if (!blog) {
                return res.status(404).json({ message: 'Blog post not found' });
            }
            
            blog.featured = featured;
            blog.updatedAt = new Date();
            
            await blog.save();
            
            return res.status(200).json({ 
                success: true, 
                data: blog,
                message: `Blog post ${featured ? 'featured' : 'unfeatured'} successfully` 
            });
        } catch (err) {
            console.error('Error updating blog featured status:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to update blog featured status' 
            });
        }
    }
);

module.exports = router;
