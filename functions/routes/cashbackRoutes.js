const express = require('express');
const router = express.Router();
const Cashback = require('../models/Cashback');
const { authMiddleware } = require('../middleware/authMiddleware');
const { body, query, param, validationResult } = require('express-validator');

/**
 * @route   GET /api/cashbacks
 * @desc    Get all cashbacks with pagination, filtering, and sorting
 * @access  Public
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('store').optional().isString().withMessage('Store must be a string'),
  query('active').optional().isBoolean().withMessage('Active must be a boolean'),
  query('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
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
    featured,
    sort = 'createdAt',
    direction = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build filter object
  const filter = {};
  if (category) filter.category = category;
  if (store) filter['store.name'] = { $regex: store, $options: 'i' }; // Case-insensitive search
  if (active !== undefined) filter.isActive = active === 'true';
  if (featured !== undefined) filter.featured = featured === 'true';

  // Build sort object
  const sortObj = {};
  sortObj[sort] = direction === 'asc' ? 1 : -1;

  try {
    const cashbacks = await Cashback.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortObj);

    const total = await Cashback.countDocuments(filter);

    res.json({
      cashbacks,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalCashbacks: total
    });
  } catch (err) {
    console.error('Error fetching cashbacks:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   GET /api/cashbacks/:id
 * @desc    Get a single cashback by ID
 * @access  Public
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid cashback ID')
], async (req, res) => {
  // Validate parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const cashback = await Cashback.findById(req.params.id);

    if (!cashback) {
      return res.status(404).json({ message: 'Cashback not found' });
    }

    res.json(cashback);
  } catch (err) {
    console.error('Error fetching cashback:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   POST /api/cashbacks
 * @desc    Create a new cashback
 * @access  Private (Admin only)
 */
router.post('/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('Title is required')
      .isString().withMessage('Title must be a string')
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description').optional()
      .isString().withMessage('Description must be a string'),
    body('amount').notEmpty().withMessage('Amount is required')
      .isFloat({ min: 0, max: 100 }).withMessage('Amount must be a number between 0 and 100'),
    body('store.name').notEmpty().withMessage('Store name is required')
      .isString().withMessage('Store name must be a string'),
    body('store.logo').optional()
      .isURL().withMessage('Store logo must be a valid URL'),
    body('store.website').optional()
      .isURL().withMessage('Store website must be a valid URL'),
    body('category').optional()
      .isString().withMessage('Category must be a string'),
    body('terms').optional()
      .isString().withMessage('Terms must be a string'),
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
    body('featured').optional()
      .isBoolean().withMessage('Featured must be a boolean')
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
      // Create new cashback with user ID
      const newCashback = new Cashback({
        ...req.body,
        createdBy: req.user.userId
      });

      const savedCashback = await newCashback.save();
      res.status(201).json(savedCashback);
    } catch (err) {
      console.error('Error creating cashback:', err);
      res.status(400).json({ message: 'Failed to create cashback', error: err.message });
    }
  }
);

/**
 * @route   PUT /api/cashbacks/:id
 * @desc    Update a cashback
 * @access  Private (Admin only)
 */
router.put('/:id',
  authMiddleware,
  [
    param('id').isMongoId().withMessage('Invalid cashback ID'),
    body('title').optional()
      .isString().withMessage('Title must be a string')
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description').optional()
      .isString().withMessage('Description must be a string'),
    body('amount').optional()
      .isFloat({ min: 0, max: 100 }).withMessage('Amount must be a number between 0 and 100'),
    body('store.name').optional()
      .isString().withMessage('Store name must be a string'),
    body('store.logo').optional()
      .isURL().withMessage('Store logo must be a valid URL'),
    body('store.website').optional()
      .isURL().withMessage('Store website must be a valid URL'),
    body('category').optional()
      .isString().withMessage('Category must be a string'),
    body('terms').optional()
      .isString().withMessage('Terms must be a string'),
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
    body('featured').optional()
      .isBoolean().withMessage('Featured must be a boolean')
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
      const updatedCashback = await Cashback.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true // Ensure validation runs on update
        }
      );

      if (!updatedCashback) {
        return res.status(404).json({ message: 'Cashback not found' });
      }

      res.json(updatedCashback);
    } catch (err) {
      console.error('Error updating cashback:', err);
      res.status(400).json({ message: 'Failed to update cashback', error: err.message });
    }
  }
);

/**
 * @route   DELETE /api/cashbacks/:id
 * @desc    Delete a cashback
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authMiddleware,
  [
    param('id').isMongoId().withMessage('Invalid cashback ID')
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
      const cashback = await Cashback.findByIdAndDelete(req.params.id);

      if (!cashback) {
        return res.status(404).json({ message: 'Cashback not found' });
      }

      res.json({
        message: 'Cashback deleted successfully',
        deletedCashback: cashback
      });
    } catch (err) {
      console.error('Error deleting cashback:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/**
 * @route   GET /api/cashbacks/featured
 * @desc    Get featured cashbacks
 * @access  Public
 */
router.get('/featured/list', async (req, res) => {
  try {
    const featuredCashbacks = await Cashback.find({
      featured: true,
      isActive: true,
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: null }
      ]
    }).sort({ amount: -1 }).limit(10);

    res.json(featuredCashbacks);
  } catch (err) {
    console.error('Error fetching featured cashbacks:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   GET /api/cashbacks/stores
 * @desc    Get list of all stores with cashbacks
 * @access  Public
 */
router.get('/stores/list', async (req, res) => {
  try {
    const stores = await Cashback.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$store.name',
        logo: { $first: '$store.logo' },
        website: { $first: '$store.website' },
        maxAmount: { $max: '$amount' }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json(stores.map(store => ({
      name: store._id,
      logo: store.logo,
      website: store.website,
      maxCashback: store.maxAmount
    })));
  } catch (err) {
    console.error('Error fetching cashback stores:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   GET /api/cashbacks/categories
 * @desc    Get list of all categories for cashbacks
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Cashback.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category' } },
      { $match: { _id: { $ne: null } } }, // Filter out null categories
      { $sort: { _id: 1 } }
    ]);

    res.json({
      categories: categories.map(cat => cat._id)
    });
  } catch (err) {
    console.error('Error fetching cashback categories:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
