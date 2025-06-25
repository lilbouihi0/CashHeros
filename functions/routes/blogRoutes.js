const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { authMiddleware } = require('../middleware/authMiddleware');
const { body, query, param, validationResult } = require('express-validator');
const { paginate, paginateQuery } = require('../middleware/paginationMiddleware');
const { validate, generateValidationRules, validationRules } = require('../middleware/validationMiddleware');
const { sendSuccess, sendError, sendNotFound, sendForbidden, sendServerError } = require('../utils/responseUtil');
const { ApiError } = require('../middleware/errorHandlerMiddleware');

/**
 * @route   GET /api/blogs
 * @desc    Get all blogs with pagination, filtering, and sorting
 * @access  Public
 */
router.get('/', 
  paginate({ defaultLimit: 10, maxLimit: 100 }),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('tag').optional().isString().withMessage('Tag must be a string'),
    query('sort').optional().isString().withMessage('Sort must be a string'),
    query('direction').optional().isIn(['asc', 'desc']).withMessage('Direction must be asc or desc'),
    query('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean')
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        search = '',
        category,
        tag,
        sort = 'createdAt',
        direction = 'desc',
        isPublished
      } = req.query;

      // Build filter object
      const filter = {};
      
      // Add search filter
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Add category filter
      if (category) {
        filter.category = category;
      }
      
      // Add tag filter
      if (tag) {
        filter.tags = tag;
      }
      
      // Add published filter
      if (isPublished !== undefined) {
        filter.isPublished = isPublished === 'true';
      }

      // Build sort object
      const sortObj = {};
      sortObj[sort] = direction === 'asc' ? 1 : -1;

      // Use the pagination utility
      const result = await paginateQuery(Blog, filter, {
        page: req.pagination.page,
        limit: req.pagination.limit,
        sort: sortObj,
        populate: [{ path: 'author', select: 'name avatar' }],
        select: '-__v'
      });

      return sendSuccess(res, result.data, 'Blogs retrieved successfully', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog
 * @access  Private (Admin only)
 */
router.post('/', 
  authMiddleware, 
  [
    body('title').notEmpty().isString().isLength({ min: 3, max: 200 }).withMessage('Title is required and must be between 3 and 200 characters'),
    body('content').notEmpty().isString().withMessage('Content is required'),
    body('summary').optional().isString().isLength({ max: 500 }).withMessage('Summary cannot exceed 500 characters'),
    body('category').optional().isString().withMessage('Category must be a string'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('featuredImage').optional().isURL().withMessage('Featured image must be a valid URL'),
    body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
    body('slug').optional().isString().matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
  ],
  validate,
  async (req, res, next) => {
    try {
      // Check for admin role
      if (req.user.role !== 'admin') {
        throw new ApiError('Unauthorized: Admin access required', 403);
      }

      // Create new blog with user ID as author
      const newBlog = new Blog({
        ...req.body,
        author: req.user.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newBlog.save();
      return sendSuccess(res, newBlog, 'Blog post created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update a blog
 * @access  Private (Admin only)
 */
router.put('/:id', 
  authMiddleware, 
  [
    param('id').isMongoId().withMessage('Invalid blog ID format'),
    body('title').optional().isString().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('content').optional().isString().withMessage('Content must be a string'),
    body('summary').optional().isString().isLength({ max: 500 }).withMessage('Summary cannot exceed 500 characters'),
    body('category').optional().isString().withMessage('Category must be a string'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('featuredImage').optional().isURL().withMessage('Featured image must be a valid URL'),
    body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
    body('slug').optional().isString().matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('viewCount').optional().isInt({ min: 0 }).withMessage('View count must be a non-negative integer')
  ],
  validate,
  async (req, res, next) => {
    try {
      // Check for admin role
      if (req.user.role !== 'admin') {
        throw new ApiError('Unauthorized: Admin access required', 403);
      }

      // Update the blog
      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id, 
        {
          ...req.body,
          updatedAt: new Date()
        }, 
        {
          new: true, // Return the updated document
          runValidators: true // Ensure validation runs on update
        }
      );

      if (!updatedBlog) {
        throw new ApiError('Blog post not found', 404);
      }

      return sendSuccess(res, updatedBlog, 'Blog post updated successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  authMiddleware, 
  [
    param('id').isMongoId().withMessage('Invalid blog ID format')
  ],
  validate,
  async (req, res, next) => {
    try {
      // Check for admin role
      if (req.user.role !== 'admin') {
        throw new ApiError('Unauthorized: Admin access required', 403);
      }
      
      const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
      
      if (!deletedBlog) {
        throw new ApiError('Blog post not found', 404);
      }
      
      return sendSuccess(res, deletedBlog, 'Blog post deleted successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   GET /api/blogs/popular
 * @desc    Get popular blog posts based on view count
 * @access  Public
 */
router.get('/popular', 
  [
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
  ],
  validate,
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      
      const blogs = await Blog.find({ isPublished: true })
        .sort({ viewCount: -1 })
        .limit(limit)
        .populate('author', 'name avatar')
        .select('-__v');
      
      return sendSuccess(res, blogs, 'Popular blog posts retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   GET /api/blogs/category/:category
 * @desc    Get blogs by category
 * @access  Public
 */
router.get('/category/:category', 
  paginate({ defaultLimit: 10, maxLimit: 50 }),
  [
    param('category').isString().withMessage('Category must be a string')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { category } = req.params;
      
      const result = await paginateQuery(Blog, { 
        category,
        isPublished: true 
      }, {
        page: req.pagination.page,
        limit: req.pagination.limit,
        sort: { createdAt: -1 },
        populate: [{ path: 'author', select: 'name avatar' }],
        select: '-__v'
      });
      
      return sendSuccess(res, result.data, `Blogs in category "${category}" retrieved successfully`, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   GET /api/blogs/tags/:tag
 * @desc    Get blogs by tag
 * @access  Public
 */
router.get('/tags/:tag', 
  paginate({ defaultLimit: 10, maxLimit: 50 }),
  [
    param('tag').isString().withMessage('Tag must be a string')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { tag } = req.params;
      
      const result = await paginateQuery(Blog, { 
        tags: tag,
        isPublished: true 
      }, {
        page: req.pagination.page,
        limit: req.pagination.limit,
        sort: { createdAt: -1 },
        populate: [{ path: 'author', select: 'name avatar' }],
        select: '-__v'
      });
      
      return sendSuccess(res, result.data, `Blogs with tag "${tag}" retrieved successfully`, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   GET /api/blogs/:id
 * @desc    Get a single blog by ID
 * @access  Public
 */
router.get('/:id', 
  [
    param('id').isMongoId().withMessage('Invalid blog ID format')
  ],
  validate,
  async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id)
        .populate('author', 'name avatar')
        .select('-__v');
      
      if (!blog) {
        throw new ApiError('Blog post not found', 404);
      }
      
      return sendSuccess(res, blog, 'Blog post retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   POST /api/blogs/:id/view
 * @desc    Increment view count for a blog post
 * @access  Public
 */
router.post('/:id/view', 
  [
    param('id').isMongoId().withMessage('Invalid blog ID format')
  ],
  validate,
  async (req, res, next) => {
    try {
      const blog = await Blog.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewCount: 1 } },
        { new: true }
      );
      
      if (!blog) {
        throw new ApiError('Blog post not found', 404);
      }
      
      return sendSuccess(res, { viewCount: blog.viewCount }, 'View count incremented successfully');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;