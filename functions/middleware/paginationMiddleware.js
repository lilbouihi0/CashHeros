/**
 * Pagination Middleware
 * 
 * Provides standardized pagination functionality for API endpoints
 */

/**
 * Apply pagination to a query
 * 
 * @param {Object} options - Pagination options
 * @param {Number} options.defaultLimit - Default items per page (default: 10)
 * @param {Number} options.maxLimit - Maximum items per page (default: 100)
 * @returns {Function} Express middleware function
 */
const paginate = (options = {}) => {
  const defaultOptions = {
    defaultLimit: 10,
    maxLimit: 100
  };

  const config = { ...defaultOptions, ...options };

  return (req, res, next) => {
    // Get pagination parameters from query string
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || config.defaultLimit;

    // Ensure page is at least 1
    page = Math.max(1, page);

    // Ensure limit is within bounds
    limit = Math.min(Math.max(1, limit), config.maxLimit);

    // Calculate skip value for database query
    const skip = (page - 1) * limit;

    // Add pagination info to request object
    req.pagination = {
      page,
      limit,
      skip
    };

    // Add function to generate pagination metadata
    req.getPaginationMeta = (totalItems) => {
      const totalPages = Math.ceil(totalItems / limit);
      
      return {
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
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
 * Apply pagination to a Mongoose query and return paginated results
 * 
 * @param {Object} model - Mongoose model
 * @param {Object} query - Mongoose query object
 * @param {Object} options - Additional options
 * @param {Object} options.sort - Sort options (default: { createdAt: -1 })
 * @param {Array} options.populate - Fields to populate
 * @param {Object} options.select - Fields to select
 * @param {Object} options.lean - Whether to return plain objects (default: true)
 * @returns {Promise} Promise resolving to paginated results
 */
const paginateQuery = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    populate = [],
    select = null,
    lean = true
  } = options;

  // Ensure page and limit are numbers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  // Calculate skip value
  const skip = (pageNum - 1) * limitNum;

  // Build the query
  let queryBuilder = model.find(query);

  // Apply pagination
  queryBuilder = queryBuilder.skip(skip).limit(limitNum);

  // Apply sorting
  queryBuilder = queryBuilder.sort(sort);

  // Apply field selection if provided
  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  // Apply population if provided
  if (populate && populate.length > 0) {
    populate.forEach(field => {
      queryBuilder = queryBuilder.populate(field);
    });
  }

  // Apply lean option
  if (lean) {
    queryBuilder = queryBuilder.lean();
  }

  // Execute query
  const [results, totalItems] = await Promise.all([
    queryBuilder.exec(),
    model.countDocuments(query)
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / limitNum);

  return {
    data: results,
    pagination: {
      totalItems,
      totalPages,
      currentPage: pageNum,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      nextPage: pageNum < totalPages ? pageNum + 1 : null,
      prevPage: pageNum > 1 ? pageNum - 1 : null
    }
  };
};

module.exports = {
  paginate,
  paginateQuery
};