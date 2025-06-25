/**
 * @module middleware/queryMiddleware
 * @description Advanced query middleware for pagination, filtering, sorting, and caching
 */

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { cache } = require('../utils/redisClient');

/**
 * Pagination middleware
 * Adds pagination functionality to the request
 * 
 * @param {Object} options - Pagination options
 * @param {number} options.defaultLimit - Default number of items per page
 * @param {number} options.maxLimit - Maximum allowed limit
 * @returns {Function} Express middleware
 */
const paginate = (options = {}) => {
  const defaultLimit = options.defaultLimit || 10;
  const maxLimit = options.maxLimit || 100;
  
  return (req, res, next) => {
    // Validate query parameters if express-validator is used
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Get pagination parameters
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;
    
    // Ensure page is at least 1
    page = Math.max(1, page);
    
    // Ensure limit is within bounds
    limit = Math.min(Math.max(1, limit), maxLimit);
    
    // Calculate skip value
    const skip = (page - 1) * limit;
    
    // Add pagination object to request
    req.pagination = {
      page,
      limit,
      skip
    };
    
    // Add paginate function to response
    res.paginate = (data, total) => {
      const totalPages = Math.ceil(total / limit);
      
      return {
        data,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        }
      };
    };
    
    next();
  };
};

/**
 * Filter middleware
 * Adds filtering functionality to the request
 * 
 * @param {Object} allowedFilters - Map of allowed filter fields and their types
 * @returns {Function} Express middleware
 */
const filter = (allowedFilters = {}) => {
  return (req, res, next) => {
    const filters = {};
    
    // Process each filter from query parameters
    Object.keys(req.query).forEach(key => {
      // Check if this is an allowed filter
      if (allowedFilters[key]) {
        const value = req.query[key];
        const type = allowedFilters[key];
        
        // Handle different filter types
        switch (type) {
          case 'string':
            filters[key] = value;
            break;
          case 'stringArray':
            filters[key] = { $in: value.split(',') };
            break;
          case 'number':
            filters[key] = Number(value);
            break;
          case 'boolean':
            filters[key] = value === 'true';
            break;
          case 'date':
            filters[key] = new Date(value);
            break;
          case 'objectId':
            if (mongoose.Types.ObjectId.isValid(value)) {
              filters[key] = mongoose.Types.ObjectId(value);
            }
            break;
          case 'regex':
            filters[key] = { $regex: value, $options: 'i' };
            break;
          case 'range':
            // Handle range filters like price_min and price_max
            if (key.endsWith('_min')) {
              const baseKey = key.replace('_min', '');
              filters[baseKey] = filters[baseKey] || {};
              filters[baseKey].$gte = Number(value);
            } else if (key.endsWith('_max')) {
              const baseKey = key.replace('_max', '');
              filters[baseKey] = filters[baseKey] || {};
              filters[baseKey].$lte = Number(value);
            }
            break;
        }
      }
    });
    
    // Add filters to request
    req.filters = filters;
    
    next();
  };
};

/**
 * Sort middleware
 * Adds sorting functionality to the request
 * 
 * @param {Object} options - Sort options
 * @param {string} options.defaultField - Default field to sort by
 * @param {string} options.defaultOrder - Default sort order ('asc' or 'desc')
 * @param {Array} options.allowedFields - Array of fields that can be sorted
 * @returns {Function} Express middleware
 */
const sort = (options = {}) => {
  const defaultField = options.defaultField || 'createdAt';
  const defaultOrder = options.defaultOrder || 'desc';
  const allowedFields = options.allowedFields || [defaultField];
  
  return (req, res, next) => {
    // Get sort parameters
    let field = req.query.sort || defaultField;
    let order = req.query.order || defaultOrder;
    
    // Ensure field is allowed
    if (!allowedFields.includes(field)) {
      field = defaultField;
    }
    
    // Ensure order is valid
    if (order !== 'asc' && order !== 'desc') {
      order = defaultOrder;
    }
    
    // Create sort object
    const sortObj = {};
    sortObj[field] = order === 'asc' ? 1 : -1;
    
    // Add sort object to request
    req.sort = sortObj;
    
    next();
  };
};

/**
 * Select fields middleware
 * Allows clients to request only specific fields
 * 
 * @param {Object} options - Options
 * @param {Array} options.defaultFields - Default fields to return
 * @param {Array} options.allowedFields - Fields that can be selected
 * @returns {Function} Express middleware
 */
const select = (options = {}) => {
  const defaultFields = options.defaultFields || [];
  const allowedFields = options.allowedFields || [];
  
  return (req, res, next) => {
    // Get fields parameter
    const fieldsParam = req.query.fields;
    
    if (fieldsParam) {
      // Split fields by comma
      const requestedFields = fieldsParam.split(',');
      
      // Filter to only allowed fields
      const validFields = requestedFields.filter(field => 
        allowedFields.includes(field)
      );
      
      // Create projection object
      req.projection = validFields.length > 0
        ? validFields.reduce((obj, field) => {
            obj[field] = 1;
            return obj;
          }, {})
        : defaultFields.reduce((obj, field) => {
            obj[field] = 1;
            return obj;
          }, {});
    } else if (defaultFields.length > 0) {
      // Use default fields
      req.projection = defaultFields.reduce((obj, field) => {
        obj[field] = 1;
        return obj;
      }, {});
    } else {
      req.projection = {};
    }
    
    next();
  };
};

/**
 * Query optimization middleware
 * Applies various optimizations to database queries
 * 
 * @returns {Function} Express middleware
 */
const optimizeQuery = () => {
  return (req, res, next) => {
    // Add query helper methods to request
    req.optimizeQuery = (query) => {
      // Use lean() for better performance when full Mongoose documents aren't needed
      if (!req.needsFullDocument) {
        query = query.lean();
      }
      
      // Apply pagination if available
      if (req.pagination) {
        query = query.skip(req.pagination.skip).limit(req.pagination.limit);
      }
      
      // Apply sorting if available
      if (req.sort) {
        query = query.sort(req.sort);
      }
      
      // Apply field selection if available
      if (req.projection && Object.keys(req.projection).length > 0) {
        query = query.select(req.projection);
      }
      
      return query;
    };
    
    next();
  };
};

/**
 * Cache middleware
 * Caches API responses for improved performance
 * 
 * @param {Object} options - Cache options
 * @param {number} options.duration - Cache duration in seconds
 * @param {boolean} options.skipAuthenticated - Skip caching for authenticated requests
 * @returns {Function} Express middleware
 */
const cacheResponse = (options = {}) => {
  const duration = options.duration || 300; // Default 5 minutes
  const skipAuthenticated = options.skipAuthenticated !== false; // Default true
  
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Skip caching for authenticated requests if configured
    if (skipAuthenticated && req.user) {
      return next();
    }
    
    // Use the cache middleware
    return cache(duration)(req, res, next);
  };
};

/**
 * Handle query errors middleware
 * Provides standardized error handling for query-related errors
 * 
 * @returns {Function} Express error middleware
 */
const handleQueryErrors = () => {
  return (err, req, res, next) => {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        code: 'INVALID_ID'
      });
    }
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
        code: 'VALIDATION_ERROR'
      });
    }
    
    next(err);
  };
};

module.exports = {
  paginate,
  filter,
  sort,
  select,
  optimizeQuery,
  cacheResponse,
  handleQueryErrors
};