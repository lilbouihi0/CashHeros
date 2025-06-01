/**
 * @module utils/dbErrorHandler
 * @description Utility functions for handling database errors
 */

const mongoose = require('mongoose');

/**
 * Error codes and their user-friendly messages
 */
const ERROR_CODES = {
  11000: 'Duplicate key error. The record already exists.',
  11001: 'Duplicate key error during update.',
  16460: 'Invalid text search configuration.',
  121: 'Document failed validation.',
  51024: 'Too many text search results to sort.',
  2: 'Bad value. Invalid input provided.',
  10334: 'BSONObj too large. Document size exceeds limit.',
  13435: 'Index build failed.',
  13436: 'Out of disk space during index build.',
  40353: 'Query execution error.',
};

/**
 * Format MongoDB validation errors into a user-friendly object
 * @param {Error} error - Mongoose validation error
 * @returns {Object} Formatted error object
 */
const formatValidationError = (error) => {
  const formattedErrors = {};
  
  // Handle mongoose validation errors
  if (error.errors) {
    Object.keys(error.errors).forEach(key => {
      const errorObj = error.errors[key];
      formattedErrors[key] = errorObj.message;
    });
  }
  
  return {
    type: 'ValidationError',
    message: 'Validation failed',
    errors: formattedErrors
  };
};

/**
 * Format MongoDB duplicate key error
 * @param {Error} error - MongoDB duplicate key error
 * @returns {Object} Formatted error object
 */
const formatDuplicateKeyError = (error) => {
  // Extract the duplicate key field from the error message
  const field = Object.keys(error.keyPattern)[0];
  const value = error.keyValue[field];
  
  return {
    type: 'DuplicateKeyError',
    message: `The ${field} '${value}' already exists.`,
    field,
    value
  };
};

/**
 * Handle database errors and return user-friendly error messages
 * @param {Error} error - Database error
 * @returns {Object} Formatted error object
 */
const handleDBError = (error) => {
  console.error('Database error:', error);
  
  // Handle Mongoose validation errors
  if (error instanceof mongoose.Error.ValidationError) {
    return formatValidationError(error);
  }
  
  // Handle MongoDB duplicate key errors
  if (error.code === 11000 || error.code === 11001) {
    return formatDuplicateKeyError(error);
  }
  
  // Handle other MongoDB errors with known error codes
  if (ERROR_CODES[error.code]) {
    return {
      type: 'DatabaseError',
      code: error.code,
      message: ERROR_CODES[error.code]
    };
  }
  
  // Handle Mongoose CastError (invalid ObjectId, etc.)
  if (error instanceof mongoose.Error.CastError) {
    return {
      type: 'CastError',
      message: `Invalid ${error.path}: ${error.value}`,
      field: error.path,
      value: error.value
    };
  }
  
  // Handle other errors
  return {
    type: 'DatabaseError',
    message: 'Database operation failed',
    error: error.message
  };
};

/**
 * Wrap a database operation in a try/catch block with error handling
 * @param {Function} operation - Async function performing database operation
 * @returns {Promise} Result of the operation or formatted error
 */
const safeDbOperation = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    const formattedError = handleDBError(error);
    throw formattedError;
  }
};

/**
 * Create a document with error handling
 * @param {Model} Model - Mongoose model
 * @param {Object} data - Document data
 * @returns {Promise<Document>} Created document
 */
const safeCreate = async (Model, data) => {
  return safeDbOperation(async () => {
    const document = new Model(data);
    return await document.save();
  });
};

/**
 * Find documents with error handling
 * @param {Model} Model - Mongoose model
 * @param {Object} query - Query object
 * @param {Object} options - Query options (projection, sort, etc.)
 * @returns {Promise<Array>} Found documents
 */
const safeFind = async (Model, query = {}, options = {}) => {
  return safeDbOperation(async () => {
    const { 
      select, 
      sort = { createdAt: -1 }, 
      limit = 0, 
      skip = 0,
      populate
    } = options;
    
    let queryBuilder = Model.find(query);
    
    if (select) queryBuilder = queryBuilder.select(select);
    if (sort) queryBuilder = queryBuilder.sort(sort);
    if (limit > 0) queryBuilder = queryBuilder.limit(limit);
    if (skip > 0) queryBuilder = queryBuilder.skip(skip);
    if (populate) queryBuilder = queryBuilder.populate(populate);
    
    return await queryBuilder.exec();
  });
};

/**
 * Find one document with error handling
 * @param {Model} Model - Mongoose model
 * @param {Object} query - Query object
 * @param {Object} options - Query options (projection, sort, etc.)
 * @returns {Promise<Document>} Found document
 */
const safeFindOne = async (Model, query = {}, options = {}) => {
  return safeDbOperation(async () => {
    const { select, populate } = options;
    
    let queryBuilder = Model.findOne(query);
    
    if (select) queryBuilder = queryBuilder.select(select);
    if (populate) queryBuilder = queryBuilder.populate(populate);
    
    return await queryBuilder.exec();
  });
};

/**
 * Find document by ID with error handling
 * @param {Model} Model - Mongoose model
 * @param {string|ObjectId} id - Document ID
 * @param {Object} options - Query options (projection, etc.)
 * @returns {Promise<Document>} Found document
 */
const safeFindById = async (Model, id, options = {}) => {
  return safeDbOperation(async () => {
    const { select, populate } = options;
    
    let queryBuilder = Model.findById(id);
    
    if (select) queryBuilder = queryBuilder.select(select);
    if (populate) queryBuilder = queryBuilder.populate(populate);
    
    const document = await queryBuilder.exec();
    
    if (!document) {
      throw {
        type: 'NotFoundError',
        message: `${Model.modelName} with ID ${id} not found`
      };
    }
    
    return document;
  });
};

/**
 * Update document with error handling
 * @param {Model} Model - Mongoose model
 * @param {string|ObjectId} id - Document ID
 * @param {Object} data - Update data
 * @param {Object} options - Update options
 * @returns {Promise<Document>} Updated document
 */
const safeUpdate = async (Model, id, data, options = {}) => {
  return safeDbOperation(async () => {
    const { new: returnNew = true, runValidators = true, populate } = options;
    
    let queryBuilder = Model.findByIdAndUpdate(
      id,
      data,
      { new: returnNew, runValidators }
    );
    
    if (populate) queryBuilder = queryBuilder.populate(populate);
    
    const document = await queryBuilder.exec();
    
    if (!document) {
      throw {
        type: 'NotFoundError',
        message: `${Model.modelName} with ID ${id} not found`
      };
    }
    
    return document;
  });
};

/**
 * Delete document with error handling
 * @param {Model} Model - Mongoose model
 * @param {string|ObjectId} id - Document ID
 * @returns {Promise<Document>} Deleted document
 */
const safeDelete = async (Model, id) => {
  return safeDbOperation(async () => {
    const document = await Model.findByIdAndDelete(id);
    
    if (!document) {
      throw {
        type: 'NotFoundError',
        message: `${Model.modelName} with ID ${id} not found`
      };
    }
    
    return document;
  });
};

/**
 * Count documents with error handling
 * @param {Model} Model - Mongoose model
 * @param {Object} query - Query object
 * @returns {Promise<number>} Document count
 */
const safeCount = async (Model, query = {}) => {
  return safeDbOperation(async () => {
    return await Model.countDocuments(query);
  });
};

/**
 * Perform aggregation with error handling
 * @param {Model} Model - Mongoose model
 * @param {Array} pipeline - Aggregation pipeline
 * @param {Object} options - Aggregation options
 * @returns {Promise<Array>} Aggregation results
 */
const safeAggregate = async (Model, pipeline, options = {}) => {
  return safeDbOperation(async () => {
    return await Model.aggregate(pipeline).option(options).exec();
  });
};

/**
 * Perform bulk operations with error handling
 * @param {Model} Model - Mongoose model
 * @param {Array} operations - Bulk operations
 * @returns {Promise<Object>} Bulk operation results
 */
const safeBulkWrite = async (Model, operations) => {
  return safeDbOperation(async () => {
    return await Model.bulkWrite(operations);
  });
};

/**
 * Perform transaction with error handling
 * @param {Function} callback - Transaction callback
 * @returns {Promise<any>} Transaction result
 */
const safeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    const formattedError = handleDBError(error);
    throw formattedError;
  } finally {
    session.endSession();
  }
};

module.exports = {
  handleDBError,
  safeDbOperation,
  safeCreate,
  safeFind,
  safeFindOne,
  safeFindById,
  safeUpdate,
  safeDelete,
  safeCount,
  safeAggregate,
  safeBulkWrite,
  safeTransaction
};