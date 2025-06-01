const Coupon = require('../models/Coupon');
const Cashback = require('../models/Cashback');
const Blog = require('../models/Blog');

/**
 * @desc    Search across all resources
 * @route   GET /api/search
 * @access  Public
 */
exports.globalSearch = async (req, res) => {
  try {
    const { q, type, limit = 10, page = 1 } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchLimit = parseInt(limit);
    
    // Create search regex pattern - use text index for better performance
    // Fall back to regex for partial matches
    const searchRegex = { $regex: q, $options: 'i' };
    
    let results = {};
    let totalResults = 0;
    
    // Use Promise.all to run queries in parallel when searching all types
    const searchPromises = [];
    
    // Search based on type or search all if no type specified
    if (!type || type === 'coupons') {
      const couponQuery = {
        $or: [
          { code: searchRegex },
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ]
      };
      
      // Use lean() for better performance when we don't need Mongoose documents
      const couponPromise = Promise.all([
        Coupon.find(couponQuery)
          .skip(type ? skip : 0)
          .limit(type ? searchLimit : 5)
          .sort({ createdAt: -1 })
          .select('code title description discount store expiryDate isActive category') // Select only needed fields
          .populate('store', 'name logo') // Populate only needed store fields
          .lean(),
        
        // Use countDocuments only when we need the exact count
        // For large collections, estimatedDocumentCount is faster
        Coupon.countDocuments(couponQuery)
      ]).then(([coupons, couponCount]) => {
        results.coupons = {
          data: coupons,
          count: couponCount
        };
        
        totalResults += couponCount;
      });
      
      searchPromises.push(couponPromise);
    }
    
    if (!type || type === 'cashbacks') {
      const cashbackQuery = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ]
      };
      
      const cashbackPromise = Promise.all([
        Cashback.find(cashbackQuery)
          .skip(type ? skip : 0)
          .limit(type ? searchLimit : 5)
          .sort({ createdAt: -1 })
          .select('title description amount store category isActive expiryDate') // Select only needed fields
          .populate('store', 'name logo') // Populate only needed store fields
          .lean(),
        
        Cashback.countDocuments(cashbackQuery)
      ]).then(([cashbacks, cashbackCount]) => {
        results.cashbacks = {
          data: cashbacks,
          count: cashbackCount
        };
        
        totalResults += cashbackCount;
      });
      
      searchPromises.push(cashbackPromise);
    }
    
    if (!type || type === 'blogs') {
      // For blog content which can be large, use text index search when possible
      const blogQuery = {
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { summary: searchRegex },
          { category: searchRegex },
          { tags: searchRegex }
        ]
      };
      
      const blogPromise = Promise.all([
        Blog.find(blogQuery)
          .skip(type ? skip : 0)
          .limit(type ? searchLimit : 5)
          .sort({ createdAt: -1 })
          .select('title excerpt featuredImage category tags publishedAt viewCount author') // Select only needed fields
          .populate('author', 'name avatar') // Populate only needed author fields
          .lean(),
        
        Blog.countDocuments(blogQuery)
      ]).then(([blogs, blogCount]) => {
        results.blogs = {
          data: blogs,
          count: blogCount
        };
        
        totalResults += blogCount;
      });
      
      searchPromises.push(blogPromise);
    }
    
    // Wait for all search queries to complete
    await Promise.all(searchPromises);
    
    res.status(200).json({
      success: true,
      query: q,
      totalResults,
      results,
      pagination: type ? {
        page: parseInt(page),
        limit: searchLimit,
        totalPages: Math.ceil((results[type]?.count || 0) / searchLimit)
      } : null
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get search suggestions
 * @route   GET /api/search/suggestions
 * @access  Public
 */
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(200).json({ 
        success: true, 
        suggestions: [] 
      });
    }
    
    // Create search regex pattern - use ^ for prefix matching which is more efficient
    const searchRegex = { $regex: `^${q}`, $options: 'i' };
    
    // Use Promise.all to run all aggregations in parallel
    const [couponSuggestions, cashbackSuggestions, blogSuggestions] = await Promise.all([
      // Get coupon suggestions with optimized pipeline
      Coupon.aggregate([
        {
          $match: {
            $or: [
              { title: searchRegex },
              { category: searchRegex }
            ],
            // Only include active coupons for better relevance
            isActive: true
          }
        },
        // Limit documents early in the pipeline
        { $limit: 50 },
        {
          $group: {
            _id: null,
            titles: { $addToSet: '$title' },
            categories: { $addToSet: '$category' }
          }
        },
        // Project only what we need
        {
          $project: {
            _id: 0,
            titles: 1,
            categories: 1
          }
        }
      ]).allowDiskUse(true), // Allow disk use for large datasets
      
      // Get cashback suggestions with optimized pipeline
      Cashback.aggregate([
        {
          $match: {
            $or: [
              { title: searchRegex },
              { category: searchRegex }
            ],
            // Only include active cashbacks for better relevance
            isActive: true
          }
        },
        // Limit documents early in the pipeline
        { $limit: 50 },
        {
          $group: {
            _id: null,
            titles: { $addToSet: '$title' },
            categories: { $addToSet: '$category' }
          }
        },
        // Project only what we need
        {
          $project: {
            _id: 0,
            titles: 1,
            categories: 1
          }
        }
      ]).allowDiskUse(true), // Allow disk use for large datasets
      
      // Get blog suggestions with optimized pipeline
      Blog.aggregate([
        {
          $match: {
            $or: [
              { title: searchRegex },
              { category: searchRegex },
              { tags: searchRegex }
            ],
            // Only include published blogs for better relevance
            isPublished: true
          }
        },
        // Limit documents early in the pipeline
        { $limit: 50 },
        {
          $group: {
            _id: null,
            titles: { $addToSet: '$title' },
            categories: { $addToSet: '$category' },
            tags: { $addToSet: { $arrayElemAt: ['$tags', 0] } }
          }
        },
        // Project only what we need
        {
          $project: {
            _id: 0,
            titles: 1,
            categories: 1,
            tags: 1
          }
        }
      ]).allowDiskUse(true) // Allow disk use for large datasets
    ]);
    
    // Use a more efficient way to combine and deduplicate suggestions
    const suggestions = new Map();
    
    // Process titles
    const allTitles = [
      ...(couponSuggestions[0]?.titles || []),
      ...(cashbackSuggestions[0]?.titles || []),
      ...(blogSuggestions[0]?.titles || [])
    ].filter(Boolean);
    
    // Process categories
    const allCategories = [
      ...(couponSuggestions[0]?.categories || []),
      ...(cashbackSuggestions[0]?.categories || []),
      ...(blogSuggestions[0]?.categories || [])
    ].filter(Boolean);
    
    // Process tags
    const allTags = (blogSuggestions[0]?.tags || []).filter(Boolean);
    
    // Add titles to suggestions map (prevents duplicates)
    allTitles.forEach(title => {
      if (title && title.toLowerCase().includes(q.toLowerCase())) {
        suggestions.set(`title:${title}`, { type: 'title', text: title });
      }
    });
    
    // Add categories to suggestions map
    allCategories.forEach(category => {
      if (category && category.toLowerCase().includes(q.toLowerCase())) {
        suggestions.set(`category:${category}`, { type: 'category', text: category });
      }
    });
    
    // Add tags to suggestions map
    allTags.forEach(tag => {
      if (tag && tag.toLowerCase().includes(q.toLowerCase())) {
        suggestions.set(`tag:${tag}`, { type: 'tag', text: tag });
      }
    });
    
    // Convert map to array and limit to 10 suggestions
    const allSuggestions = Array.from(suggestions.values()).slice(0, 10);
    
    // Cache the response for 5 minutes (implement caching middleware separately)
    res.set('Cache-Control', 'public, max-age=300');
    
    res.status(200).json({
      success: true,
      suggestions: allSuggestions
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};