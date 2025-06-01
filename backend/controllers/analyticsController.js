const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Cashback = require('../models/Cashback');
const Blog = require('../models/Blog');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const UserProfile = require('../models/UserProfile');
const Recommendation = require('../models/Recommendation');
const { logger } = require('../middleware/loggingMiddleware');

/**
 * @desc    Get user activity analytics
 * @route   GET /api/analytics/users
 * @access  Private/Admin
 */
exports.getUserAnalytics = async (req, res) => {
  try {
    // Get date range from query params or default to last 30 days
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // User registration over time
    const userRegistrations = await User.aggregate([
      {
        $match: {
          joinDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$joinDate' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // User login activity
    const userLogins = await User.aggregate([
      {
        $match: {
          lastLogin: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // User demographics
    const userDemographics = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$verified', true] }, 1, 0] }
          },
          unverifiedUsers: {
            $sum: { $cond: [{ $eq: ['$verified', false] }, 1, 0] }
          },
          adminUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          regularUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] }
          }
        }
      }
    ]);

    // Active users (users who logged in within the last 30 days)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Inactive users (users who haven't logged in for more than 30 days)
    const inactiveUsers = await User.countDocuments({
      $or: [
        { lastLogin: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        { lastLogin: null }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        registrations: userRegistrations,
        logins: userLogins,
        demographics: userDemographics[0] || {
          totalUsers: 0,
          verifiedUsers: 0,
          unverifiedUsers: 0,
          adminUsers: 0,
          regularUsers: 0
        },
        activity: {
          activeUsers,
          inactiveUsers
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Get coupon usage analytics
 * @route   GET /api/analytics/coupons
 * @access  Private/Admin
 */
exports.getCouponAnalytics = async (req, res) => {
  try {
    // Get date range from query params or default to last 30 days
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Most redeemed coupons
    const topCoupons = await Coupon.find()
      .sort({ usageCount: -1 })
      .limit(10);

    // Coupon redemptions over time (using createdAt as a proxy since we don't have a separate redemption model)
    const couponRedemptions = await Coupon.aggregate([
      {
        $match: {
          updatedAt: { $gte: start, $lte: end },
          usageCount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          count: { $sum: '$usageCount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Coupon statistics by category
    const couponsByCategory = await Coupon.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalRedemptions: { $sum: '$usageCount' },
          averageDiscount: { $avg: '$discount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Coupon statistics by store
    const couponsByStore = await Coupon.aggregate([
      {
        $group: {
          _id: '$store.name',
          count: { $sum: 1 },
          totalRedemptions: { $sum: '$usageCount' },
          averageDiscount: { $avg: '$discount' }
        }
      },
      {
        $sort: { totalRedemptions: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Overall coupon statistics
    const couponStats = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalCoupons: { $sum: 1 },
          totalRedemptions: { $sum: '$usageCount' },
          averageDiscount: { $avg: '$discount' },
          activeCoupons: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveCoupons: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        topCoupons,
        redemptions: couponRedemptions,
        byCategory: couponsByCategory,
        byStore: couponsByStore,
        stats: couponStats[0] || {
          totalCoupons: 0,
          totalRedemptions: 0,
          averageDiscount: 0,
          activeCoupons: 0,
          inactiveCoupons: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching coupon analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Get content analytics (blogs, cashbacks)
 * @route   GET /api/analytics/content
 * @access  Private/Admin
 */
exports.getContentAnalytics = async (req, res) => {
  try {
    // Blog statistics
    const blogStats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          totalViews: { $sum: '$viewCount' },
          averageViews: { $avg: '$viewCount' },
          publishedBlogs: {
            $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
          },
          unpublishedBlogs: {
            $sum: { $cond: [{ $eq: ['$isPublished', false] }, 1, 0] }
          }
        }
      }
    ]);

    // Most viewed blogs
    const topBlogs = await Blog.find()
      .sort({ viewCount: -1 })
      .limit(10);

    // Blog statistics by category
    const blogsByCategory = await Blog.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$viewCount' },
          averageViews: { $avg: '$viewCount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Cashback statistics
    const cashbackStats = await Cashback.aggregate([
      {
        $group: {
          _id: null,
          totalCashbacks: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          activeCashbacks: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveCashbacks: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          featuredCashbacks: {
            $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Cashback statistics by category
    const cashbacksByCategory = await Cashback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Cashback statistics by store
    const cashbacksByStore = await Cashback.aggregate([
      {
        $group: {
          _id: '$store.name',
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        blogs: {
          stats: blogStats[0] || {
            totalBlogs: 0,
            totalViews: 0,
            averageViews: 0,
            publishedBlogs: 0,
            unpublishedBlogs: 0
          },
          topBlogs,
          byCategory: blogsByCategory
        },
        cashbacks: {
          stats: cashbackStats[0] || {
            totalCashbacks: 0,
            averageAmount: 0,
            activeCashbacks: 0,
            inactiveCashbacks: 0,
            featuredCashbacks: 0
          },
          byCategory: cashbacksByCategory,
          byStore: cashbacksByStore
        }
      }
    });
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Get dashboard summary analytics
 * @route   GET /api/analytics/dashboard
 * @access  Private/Admin
 */
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Use Promise.all to run all queries in parallel
    const [
      // User statistics
      userStats,
      // Content statistics
      contentStats,
      // Recent activity
      recentActivity
    ] = await Promise.all([
      // User statistics - combine into a single aggregation pipeline
      User.aggregate([
        {
          $facet: {
            // Total users count
            totalUsers: [
              { $count: 'count' }
            ],
            // New users today
            newUsersToday: [
              { 
                $match: { 
                  joinDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } 
                } 
              },
              { $count: 'count' }
            ],
            // Active users in last 7 days
            activeUsers: [
              { 
                $match: { 
                  lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
                } 
              },
              { $count: 'count' }
            ]
          }
        },
        // Format the results
        {
          $project: {
            totalUsers: { $arrayElemAt: ['$totalUsers.count', 0] },
            newUsersToday: { $arrayElemAt: ['$newUsersToday.count', 0] },
            activeUsers: { $arrayElemAt: ['$activeUsers.count', 0] }
          }
        }
      ]),
      
      // Content statistics - combine into a single Promise.all
      Promise.all([
        // Blog statistics
        Blog.aggregate([
          {
            $facet: {
              // Total blogs count
              totalBlogs: [
                { $count: 'count' }
              ],
              // Total blog views
              totalViews: [
                {
                  $group: {
                    _id: null,
                    total: { $sum: '$viewCount' }
                  }
                }
              ]
            }
          },
          // Format the results
          {
            $project: {
              totalBlogs: { $arrayElemAt: ['$totalBlogs.count', 0] },
              totalViews: { $arrayElemAt: ['$totalViews.total', 0] }
            }
          }
        ]),
        
        // Coupon statistics
        Coupon.aggregate([
          {
            $facet: {
              // Total coupons count
              totalCoupons: [
                { $count: 'count' }
              ],
              // Total redemptions
              totalRedemptions: [
                {
                  $group: {
                    _id: null,
                    total: { $sum: '$usageCount' }
                  }
                }
              ]
            }
          },
          // Format the results
          {
            $project: {
              totalCoupons: { $arrayElemAt: ['$totalCoupons.count', 0] },
              totalRedemptions: { $arrayElemAt: ['$totalRedemptions.total', 0] }
            }
          }
        ]),
        
        // Cashback statistics - simple count
        Cashback.countDocuments()
      ]),
      
      // Recent activity - combine into a single Promise.all
      Promise.all([
        // Recent users
        User.find()
          .select('email firstName lastName joinDate lastLogin')
          .sort({ joinDate: -1 })
          .limit(5)
          .lean(), // Use lean() for better performance
        
        // Recent coupons
        Coupon.find()
          .select('code title discount store expiryDate') // Select only needed fields
          .populate('store', 'name logo') // Populate only needed store fields
          .sort({ createdAt: -1 })
          .limit(5)
          .lean() // Use lean() for better performance
      ])
    ]);
    
    // Extract content statistics from the results
    const [blogStats, couponStats, totalCashbacks] = contentStats;
    
    // Extract recent activity from the results
    const [recentUsers, recentCoupons] = recentActivity;
    
    // Prepare the response
    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: userStats.totalUsers || 0,
          newUsersToday: userStats.newUsersToday || 0,
          activeUsers: userStats.activeUsers || 0,
          blogs: blogStats.totalBlogs || 0,
          coupons: couponStats.totalCoupons || 0,
          cashbacks: totalCashbacks || 0,
          redemptions: couponStats.totalRedemptions || 0,
          blogViews: blogStats.totalViews || 0
        },
        recent: {
          users: recentUsers,
          coupons: recentCoupons
        }
      }
    });
    
    // Cache the response for 5 minutes (implement caching middleware separately)
    res.set('Cache-Control', 'private, max-age=300');
    
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};