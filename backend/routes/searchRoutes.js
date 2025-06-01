const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { query, validationResult } = require('express-validator');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');

/**
 * @route   GET /api/search
 * @desc    Search across all resources
 * @access  Public
 */
router.get('/',
  rateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 searches per minute
    message: 'Too many search requests, please try again after a minute'
  }),
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('type').optional().isIn(['coupons', 'cashbacks', 'blogs']).withMessage('Invalid resource type'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  searchController.globalSearch
);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions
 * @access  Public
 */
router.get('/suggestions',
  rateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 suggestion requests per minute
    message: 'Too many suggestion requests, please try again after a minute'
  }),
  [
    query('q').optional().isString().withMessage('Search query must be a string')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  searchController.getSearchSuggestions
);

module.exports = router;