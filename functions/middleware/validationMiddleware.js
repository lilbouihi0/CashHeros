/**
 * Data Validation Middleware
 * 
 * This middleware validates request data to ensure data integrity
 * and prevent invalid data from reaching the database.
 * 
 * Supports both Joi schema validation and express-validator validation.
 */

const Joi = require('joi');
const { validationResult, body, query, param } = require('express-validator');
const { sendValidationError } = require('../utils/responseUtil');

/**
 * Create a validation middleware for a specific Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validateWithJoi = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown properties
      errors: {
        wrap: {
          label: false // Don't wrap error labels
        }
      }
    });

    if (error) {
      const errorDetails = error.details.reduce((acc, detail) => {
        const field = detail.path.join('.');
        
        if (!acc[field]) {
          acc[field] = [];
        }
        
        acc[field].push(detail.message);
        return acc;
      }, {});

      return sendValidationError(res, errorDetails);
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

/**
 * Validate request based on express-validator rules
 * 
 * @returns {Function} Express middleware function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for better readability
    const formattedErrors = errors.array().reduce((acc, error) => {
      const field = error.param;
      
      if (!acc[field]) {
        acc[field] = [];
      }
      
      acc[field].push(error.msg);
      return acc;
    }, {});
    
    return sendValidationError(res, formattedErrors);
  }
  
  next();
};

/**
 * Create validation rules for express-validator
 * 
 * @param {string} field - Field name to validate
 * @param {Array} rules - Array of validation rules
 * @param {string} message - Error message
 * @returns {Object} Express-validator validation chain
 */
const createValidationRule = (field, rules, message) => {
  let chain;
  
  // Determine which validator to use based on field name
  if (field.startsWith('body.')) {
    chain = body(field.replace('body.', ''));
  } else if (field.startsWith('query.')) {
    chain = query(field.replace('query.', ''));
  } else if (field.startsWith('params.')) {
    chain = param(field.replace('params.', ''));
  } else {
    chain = body(field);
  }
  
  // Apply each rule to the chain
  rules.forEach(rule => {
    if (typeof rule === 'string') {
      switch (rule) {
        case 'optional':
          chain = chain.optional();
          break;
        case 'notEmpty':
          chain = chain.notEmpty();
          break;
        case 'isEmail':
          chain = chain.isEmail();
          break;
        case 'isString':
          chain = chain.isString();
          break;
        case 'isInt':
          chain = chain.isInt();
          break;
        case 'isFloat':
          chain = chain.isFloat();
          break;
        case 'isBoolean':
          chain = chain.isBoolean();
          break;
        case 'isArray':
          chain = chain.isArray();
          break;
        case 'isObject':
          chain = chain.isObject();
          break;
        case 'isURL':
          chain = chain.isURL();
          break;
        case 'isISO8601':
          chain = chain.isISO8601();
          break;
        case 'isMongoId':
          chain = chain.isMongoId();
          break;
        default:
          // For custom validators
          if (typeof rule === 'function') {
            chain = chain.custom(rule);
          }
      }
    } else if (typeof rule === 'object') {
      // Handle object-based rules
      if ('min' in rule) {
        chain = chain.isLength({ min: rule.min });
      }
      if ('max' in rule) {
        chain = chain.isLength({ max: rule.max });
      }
      if ('minLength' in rule) {
        chain = chain.isLength({ min: rule.minLength });
      }
      if ('maxLength' in rule) {
        chain = chain.isLength({ max: rule.maxLength });
      }
      if ('isIn' in rule) {
        chain = chain.isIn(rule.isIn);
      }
      if ('matches' in rule) {
        chain = chain.matches(rule.matches);
      }
    }
  });
  
  // Add custom error message
  if (message) {
    chain = chain.withMessage(message);
  }
  
  return chain;
};

/**
 * Generate validation rules for express-validator
 * 
 * @param {Array} validationConfig - Array of validation configurations
 * @returns {Array} Array of express-validator validation chains
 */
const generateValidationRules = (validationConfig) => {
  return validationConfig.map(config => {
    return createValidationRule(config.field, config.rules, config.message);
  });
};

// Common validation schemas (Joi)
const schemas = {
  // User schemas
  userRegistration: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().trim(),
    lastName: Joi.string().trim(),
    phone: Joi.string().trim()
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required()
  }),

  userUpdate: Joi.object({
    firstName: Joi.string().trim(),
    lastName: Joi.string().trim(),
    phone: Joi.string().trim(),
    address: Joi.object({
      street: Joi.string().trim(),
      city: Joi.string().trim(),
      state: Joi.string().trim(),
      zipCode: Joi.string().trim(),
      country: Joi.string().trim()
    }),
    preferences: Joi.object({
      emailNotifications: Joi.boolean(),
      smsNotifications: Joi.boolean(),
      pushNotifications: Joi.boolean(),
      categories: Joi.array().items(Joi.string().trim()),
      notificationFrequency: Joi.string().valid('immediate', 'daily', 'weekly'),
      emailDigest: Joi.boolean()
    })
  }),

  // Coupon schemas
  couponCreate: Joi.object({
    code: Joi.string().required().trim().uppercase(),
    title: Joi.string().required().trim(),
    description: Joi.string().trim(),
    discount: Joi.number().min(0).max(100).required(),
    store: Joi.string().required(), // Store ID
    expiryDate: Joi.date().iso().greater('now'),
    isActive: Joi.boolean(),
    usageLimit: Joi.number().integer().min(0).allow(null),
    category: Joi.string().trim()
  }),

  couponUpdate: Joi.object({
    code: Joi.string().trim().uppercase(),
    title: Joi.string().trim(),
    description: Joi.string().trim(),
    discount: Joi.number().min(0).max(100),
    store: Joi.string(), // Store ID
    expiryDate: Joi.date().iso(),
    isActive: Joi.boolean(),
    usageLimit: Joi.number().integer().min(0).allow(null),
    category: Joi.string().trim()
  }),

  // Cashback schemas
  cashbackCreate: Joi.object({
    title: Joi.string().required().trim(),
    description: Joi.string().trim(),
    amount: Joi.number().min(0).max(100).required(),
    store: Joi.string().required(), // Store ID
    category: Joi.string().trim(),
    terms: Joi.string().trim(),
    expiryDate: Joi.date().iso().greater('now'),
    isActive: Joi.boolean(),
    featured: Joi.boolean()
  }),

  cashbackUpdate: Joi.object({
    title: Joi.string().trim(),
    description: Joi.string().trim(),
    amount: Joi.number().min(0).max(100),
    store: Joi.string(), // Store ID
    category: Joi.string().trim(),
    terms: Joi.string().trim(),
    expiryDate: Joi.date().iso(),
    isActive: Joi.boolean(),
    featured: Joi.boolean()
  }),

  // Store schemas
  storeCreate: Joi.object({
    name: Joi.string().required().trim(),
    logo: Joi.string().required().trim(),
    description: Joi.string().trim(),
    website: Joi.string().uri().trim(),
    categories: Joi.array().items(Joi.string().trim()),
    affiliateLink: Joi.string().uri().trim(),
    cashbackPercentage: Joi.number().min(0).max(100),
    isActive: Joi.boolean(),
    isFeatured: Joi.boolean(),
    socialMedia: Joi.object({
      facebook: Joi.string().uri().trim(),
      twitter: Joi.string().uri().trim(),
      instagram: Joi.string().uri().trim(),
      pinterest: Joi.string().uri().trim()
    }),
    contactInfo: Joi.object({
      email: Joi.string().email().trim(),
      phone: Joi.string().trim(),
      address: Joi.string().trim()
    }),
    termsAndConditions: Joi.string().trim()
  }),

  storeUpdate: Joi.object({
    name: Joi.string().trim(),
    logo: Joi.string().trim(),
    description: Joi.string().trim(),
    website: Joi.string().uri().trim(),
    categories: Joi.array().items(Joi.string().trim()),
    affiliateLink: Joi.string().uri().trim(),
    cashbackPercentage: Joi.number().min(0).max(100),
    isActive: Joi.boolean(),
    isFeatured: Joi.boolean(),
    socialMedia: Joi.object({
      facebook: Joi.string().uri().trim(),
      twitter: Joi.string().uri().trim(),
      instagram: Joi.string().uri().trim(),
      pinterest: Joi.string().uri().trim()
    }),
    contactInfo: Joi.object({
      email: Joi.string().email().trim(),
      phone: Joi.string().trim(),
      address: Joi.string().trim()
    }),
    termsAndConditions: Joi.string().trim()
  }),

  // Transaction schemas
  transactionCreate: Joi.object({
    user: Joi.string().required(), // User ID
    store: Joi.string().required(), // Store ID
    amount: Joi.number().min(0).required(),
    cashbackAmount: Joi.number().min(0).required(),
    cashbackPercentage: Joi.number().min(0).max(100).required(),
    orderReference: Joi.string().trim(),
    status: Joi.string().valid('pending', 'confirmed', 'rejected', 'paid'),
    type: Joi.string().valid('cashback', 'referral', 'bonus', 'withdrawal'),
    description: Joi.string().trim(),
    purchaseDate: Joi.date().iso(),
    couponUsed: Joi.string(), // Coupon ID
    cashbackOffer: Joi.string() // Cashback ID
  }),

  transactionUpdate: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'rejected', 'paid'),
    confirmationDate: Joi.date().iso(),
    paymentDate: Joi.date().iso(),
    paymentMethod: Joi.string().trim(),
    paymentReference: Joi.string().trim(),
    notes: Joi.string().trim()
  }),

  // Review schemas
  reviewCreate: Joi.object({
    itemType: Joi.string().valid('store', 'coupon', 'cashback').required(),
    itemId: Joi.string().required(), // Item ID
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().trim(),
    content: Joi.string().trim(),
    pros: Joi.array().items(Joi.string().trim()),
    cons: Joi.array().items(Joi.string().trim()),
    images: Joi.array().items(Joi.string().trim())
  }),

  reviewUpdate: Joi.object({
    rating: Joi.number().integer().min(1).max(5),
    title: Joi.string().trim(),
    content: Joi.string().trim(),
    pros: Joi.array().items(Joi.string().trim()),
    cons: Joi.array().items(Joi.string().trim()),
    images: Joi.array().items(Joi.string().trim())
  }),

  // Pagination and filtering
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().trim(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().trim(),
    category: Joi.string().trim(),
    store: Joi.string().trim(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  })
};

/**
 * Common validation rules for express-validator
 */
const commonValidationRules = {
  // Pagination rules
  pagination: [
    { field: 'query.page', rules: ['optional', 'isInt', { min: 1 }], message: 'Page must be a positive integer' },
    { field: 'query.limit', rules: ['optional', 'isInt', { min: 1, max: 100 }], message: 'Limit must be between 1 and 100' }
  ],
  
  // Sorting rules
  sorting: [
    { field: 'query.sort', rules: ['optional', 'isString'], message: 'Sort must be a string' },
    { field: 'query.direction', rules: ['optional', 'isString', { isIn: ['asc', 'desc'] }], message: 'Direction must be asc or desc' }
  ],
  
  // ID parameter rules
  idParam: [
    { field: 'params.id', rules: ['isMongoId'], message: 'Invalid ID format' }
  ],
  
  // Email rules
  email: [
    { field: 'body.email', rules: ['isEmail'], message: 'Please provide a valid email address' }
  ],
  
  // Password rules
  password: [
    { field: 'body.password', rules: ['isString', { minLength: 8 }], message: 'Password must be at least 8 characters long' }
  ]
};

/**
 * Validation rules for express-validator by model
 */
const validationRules = {
  // User validation rules
  user: {
    create: [
      { field: 'body.name', rules: ['notEmpty', 'isString'], message: 'Name is required' },
      { field: 'body.email', rules: ['notEmpty', 'isEmail'], message: 'Valid email is required' },
      { field: 'body.password', rules: ['notEmpty', 'isString', { minLength: 8 }], message: 'Password must be at least 8 characters long' }
    ],
    update: [
      { field: 'body.name', rules: ['optional', 'isString'], message: 'Name must be a string' },
      { field: 'body.email', rules: ['optional', 'isEmail'], message: 'Valid email is required' },
      { field: 'body.avatar', rules: ['optional', 'isURL'], message: 'Avatar must be a valid URL' }
    ]
  },
  
  // Coupon validation rules
  coupon: {
    create: [
      { field: 'body.code', rules: ['notEmpty', 'isString'], message: 'Coupon code is required' },
      { field: 'body.title', rules: ['notEmpty', 'isString'], message: 'Title is required' },
      { field: 'body.description', rules: ['optional', 'isString'], message: 'Description must be a string' },
      { field: 'body.discount', rules: ['notEmpty', 'isFloat', { min: 0 }], message: 'Discount must be a positive number' },
      { field: 'body.expiryDate', rules: ['optional', 'isISO8601'], message: 'Expiry date must be in ISO 8601 format' },
      { field: 'body.isActive', rules: ['optional', 'isBoolean'], message: 'isActive must be a boolean' },
      { field: 'body.category', rules: ['optional', 'isString'], message: 'Category must be a string' }
    ],
    update: [
      { field: 'body.code', rules: ['optional', 'isString'], message: 'Coupon code must be a string' },
      { field: 'body.title', rules: ['optional', 'isString'], message: 'Title must be a string' },
      { field: 'body.description', rules: ['optional', 'isString'], message: 'Description must be a string' },
      { field: 'body.discount', rules: ['optional', 'isFloat', { min: 0 }], message: 'Discount must be a positive number' },
      { field: 'body.expiryDate', rules: ['optional', 'isISO8601'], message: 'Expiry date must be in ISO 8601 format' },
      { field: 'body.isActive', rules: ['optional', 'isBoolean'], message: 'isActive must be a boolean' },
      { field: 'body.category', rules: ['optional', 'isString'], message: 'Category must be a string' }
    ]
  },
  
  // Blog validation rules
  blog: {
    create: [
      { field: 'body.title', rules: ['notEmpty', 'isString', { minLength: 3, maxLength: 200 }], message: 'Title is required and must be between 3 and 200 characters' },
      { field: 'body.content', rules: ['notEmpty', 'isString'], message: 'Content is required' },
      { field: 'body.summary', rules: ['optional', 'isString', { maxLength: 500 }], message: 'Summary cannot exceed 500 characters' },
      { field: 'body.category', rules: ['optional', 'isString'], message: 'Category must be a string' },
      { field: 'body.tags', rules: ['optional', 'isArray'], message: 'Tags must be an array' },
      { field: 'body.featuredImage', rules: ['optional', 'isURL'], message: 'Featured image must be a valid URL' },
      { field: 'body.isPublished', rules: ['optional', 'isBoolean'], message: 'isPublished must be a boolean' },
      { field: 'body.slug', rules: ['optional', 'isString', { matches: /^[a-z0-9-]+$/ }], message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
    ],
    update: [
      { field: 'body.title', rules: ['optional', 'isString', { minLength: 3, maxLength: 200 }], message: 'Title must be between 3 and 200 characters' },
      { field: 'body.content', rules: ['optional', 'isString'], message: 'Content must be a string' },
      { field: 'body.summary', rules: ['optional', 'isString', { maxLength: 500 }], message: 'Summary cannot exceed 500 characters' },
      { field: 'body.category', rules: ['optional', 'isString'], message: 'Category must be a string' },
      { field: 'body.tags', rules: ['optional', 'isArray'], message: 'Tags must be an array' },
      { field: 'body.featuredImage', rules: ['optional', 'isURL'], message: 'Featured image must be a valid URL' },
      { field: 'body.isPublished', rules: ['optional', 'isBoolean'], message: 'isPublished must be a boolean' },
      { field: 'body.slug', rules: ['optional', 'isString', { matches: /^[a-z0-9-]+$/ }], message: 'Slug can only contain lowercase letters, numbers, and hyphens' },
      { field: 'body.viewCount', rules: ['optional', 'isInt', { min: 0 }], message: 'View count must be a non-negative integer' }
    ]
  }
};

module.exports = {
  validate,
  validateWithJoi,
  generateValidationRules,
  schemas,
  commonValidationRules,
  validationRules
};