const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { authMiddleware } = require('../middleware/authMiddleware');
const { body, query, param, validationResult } = require('express-validator');
const cache = require('../utils/cache');

/**
 * @route   GET /api/coupons
 * @desc    Get all coupons with pagination, filtering, and sorting
 * @access  Public
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('store').optional().isString().withMessage('Store must be a string'),
  query('active').optional().isBoolean().withMessage('Active must be a boolean'),
  query('sort').optional().isString().withMessage('Sort must be a string')
], async (req, res) => {
  // Validate query parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    page = 1,
    limit = 10,
    category,
    store,
    active,
    sort = 'createdAt',
    direction = 'desc'
  } = req.query;

  // Generate cache key based on query parameters
  const cacheKey = cache.generateKey('coupons:list', {
    page, limit, category, store, active, sort, direction
  });
  
  // Try to get from cache first
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build filter object
  const filter = {};
  if (category) filter.category = category;
  if (store) filter['store.name'] = { $regex: store, $options: 'i' }; // Case-insensitive search
  if (active !== undefined) filter.isActive = active === 'true';

  // Build sort object
  const sortObj = {};
  sortObj[sort] = direction === 'asc' ? 1 : -1;

  try {
    // Use lean() for better performance - returns plain JS objects instead of Mongoose documents
    const coupons = await Coupon.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortObj)
      .lean();

    // Use countDocuments for better performance than estimatedDocumentCount
    const total = await Coupon.countDocuments(filter);

    const responseData = {
      coupons,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalCoupons: total
    };

    // Cache the response for 10 minutes (600 seconds)
    await cache.set(cacheKey, responseData, 600);

    res.json(responseData);
  } catch (err) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   GET /api/coupons/:id
 * @desc    Get a single coupon by ID
 * @access  Public
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid coupon ID')
], async (req, res) => {
  // Validate parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const couponId = req.params.id;
  
  // Generate cache key for this specific coupon
  const cacheKey = cache.generateKey('coupons:single', { id: couponId });
  
  // Try to get from cache first
  const cachedCoupon = await cache.get(cacheKey);
  if (cachedCoupon) {
    return res.json(cachedCoupon);
  }

  try {
    // Use lean() for better performance
    const coupon = await Coupon.findById(couponId).lean();

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Cache the coupon for 30 minutes (1800 seconds)
    await cache.set(cacheKey, coupon, 1800);

    res.json(coupon);
  } catch (err) {
    console.error('Error fetching coupon:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   POST /api/coupons
 * @desc    Create a new coupon
 * @access  Private (Admin only)
 */
router.post('/',
  authMiddleware,
  [
    body('code').notEmpty().withMessage('Code is required')
      .isString().withMessage('Code must be a string')
      .isLength({ min: 3, max: 20 }).withMessage('Code must be between 3 and 20 characters')
      .trim().toUpperCase(),
    body('title').notEmpty().withMessage('Title is required')
      .isString().withMessage('Title must be a string')
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description').optional()
      .isString().withMessage('Description must be a string'),
    body('discount').notEmpty().withMessage('Discount is required')
      .isFloat({ min: 0, max: 100 }).withMessage('Discount must be a number between 0 and 100'),
    body('store.name').notEmpty().withMessage('Store name is required')
      .isString().withMessage('Store name must be a string'),
    body('store.logo').optional()
      .isURL().withMessage('Store logo must be a valid URL'),
    body('expiryDate').optional()
      .isISO8601().withMessage('Expiry date must be a valid date')
      .custom(value => {
        if (new Date(value) < new Date()) {
          throw new Error('Expiry date cannot be in the past');
        }
        return true;
      }),
    body('isActive').optional()
      .isBoolean().withMessage('isActive must be a boolean'),
    body('usageLimit').optional()
      .isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),
    body('category').optional()
      .isString().withMessage('Category must be a string')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check for admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    try {
      // Check if coupon code already exists
      const existingCoupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }

      // Create new coupon with user ID
      const newCoupon = new Coupon({
        ...req.body,
        createdBy: req.user.userId
      });

      const savedCoupon = await newCoupon.save();
      
      // Invalidate coupons list cache
      await cache.clear('coupons:list');
      
      res.status(201).json(savedCoupon);
    } catch (err) {
      console.error('Error creating coupon:', err);
      res.status(400).json({ message: 'Failed to create coupon', error: err.message });
    }
  }
);

/**
 * @route   PUT /api/coupons/:id
 * @desc    Update a coupon
 * @access  Private (Admin only)
 */
router.put('/:id',
  authMiddleware,
  [
    param('id').isMongoId().withMessage('Invalid coupon ID'),
    body('code').optional()
      .isString().withMessage('Code must be a string')
      .isLength({ min: 3, max: 20 }).withMessage('Code must be between 3 and 20 characters')
      .trim().toUpperCase(),
    body('title').optional()
      .isString().withMessage('Title must be a string')
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description').optional()
      .isString().withMessage('Description must be a string'),
    body('discount').optional()
      .isFloat({ min: 0, max: 100 }).withMessage('Discount must be a number between 0 and 100'),
    body('store.name').optional()
      .isString().withMessage('Store name must be a string'),
    body('store.logo').optional()
      .isURL().withMessage('Store logo must be a valid URL'),
    body('expiryDate').optional()
      .isISO8601().withMessage('Expiry date must be a valid date')
      .custom(value => {
        if (new Date(value) < new Date()) {
          throw new Error('Expiry date cannot be in the past');
        }
        return true;
      }),
    body('isActive').optional()
      .isBoolean().withMessage('isActive must be a boolean'),
    body('usageLimit').optional()
      .isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),
    body('category').optional()
      .isString().withMessage('Category must be a string')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check for admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    try {
      // If code is being updated, check if it already exists
      if (req.body.code) {
        const existingCoupon = await Coupon.findOne({
          code: req.body.code.toUpperCase(),
          _id: { $ne: req.params.id } // Exclude current coupon
        });

        if (existingCoupon) {
          return res.status(400).json({ message: 'Coupon code already exists' });
        }
      }

      const updatedCoupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedCoupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
      
      // Invalidate both the list cache and the specific coupon cache
      await Promise.all([
        cache.clear('coupons:list'),
        cache.del(cache.generateKey('coupons:single', { id: req.params.id }))
      ]);

      res.json(updatedCoupon);
    } catch (err) {
      console.error('Error updating coupon:', err);
      res.status(400).json({ message: 'Failed to update coupon', error: err.message });
    }
  }
);

/**
 * @route   DELETE /api/coupons/:id
 * @desc    Delete a coupon
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authMiddleware,
  [
    param('id').isMongoId().withMessage('Invalid coupon ID')
  ],
  async (req, res) => {
    // Validate parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check for admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    try {
      const coupon = await Coupon.findByIdAndDelete(req.params.id);

      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
      
      // Invalidate both the list cache and the specific coupon cache
      await Promise.all([
        cache.clear('coupons:list'),
        cache.del(cache.generateKey('coupons:single', { id: req.params.id }))
      ]);

      res.json({
        message: 'Coupon deleted successfully',
        deletedCoupon: coupon
      });
    } catch (err) {
      console.error('Error deleting coupon:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/**
 * @route   POST /api/coupons/:id/redeem
 * @desc    Redeem a coupon (increment usage count)
 * @access  Private
 */
router.post('/:id/redeem',
  authMiddleware,
  [
    param('id').isMongoId().withMessage('Invalid coupon ID')
  ],
  async (req, res) => {
    // Validate parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const coupon = await Coupon.findById(req.params.id);

      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      // Check if coupon is valid
      if (!coupon.isValid) {
        return res.status(400).json({
          message: 'Coupon is not valid',
          reason: coupon.isExpired ? 'expired' :
                  !coupon.isActive ? 'inactive' :
                  'usage limit reached'
        });
      }

      // Increment usage count
      coupon.usageCount += 1;
      await coupon.save();

      res.json({
        message: 'Coupon redeemed successfully',
        coupon
      });
    } catch (err) {
      console.error('Error redeeming coupon:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

module.exports = router;