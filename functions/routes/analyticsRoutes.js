const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { query, validationResult } = require('express-validator');

// Middleware to check if user is admin
const adminCheck = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Unauthorized: Admin access required' 
    });
  }
  next();
};

/**
 * @route   GET /api/analytics/users
 * @desc    Get user activity analytics
 * @access  Private/Admin
 */
router.get('/users', 
  authMiddleware,
  adminCheck,
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  analyticsController.getUserAnalytics
);

/**
 * @route   GET /api/analytics/coupons
 * @desc    Get coupon usage analytics
 * @access  Private/Admin
 */
router.get('/coupons', 
  authMiddleware,
  adminCheck,
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  analyticsController.getCouponAnalytics
);

/**
 * @route   GET /api/analytics/content
 * @desc    Get content analytics (blogs, cashbacks)
 * @access  Private/Admin
 */
router.get('/content', 
  authMiddleware,
  adminCheck,
  analyticsController.getContentAnalytics
);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard summary analytics
 * @access  Private/Admin
 */
router.get('/dashboard', 
  authMiddleware,
  adminCheck,
  analyticsController.getDashboardAnalytics
);

module.exports = router;