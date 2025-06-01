/**
 * Admin Service
 * 
 * This service provides mock data for the admin dashboard
 */

/**
 * Get mock analytics data for the admin dashboard
 * @returns {Promise} - Promise that resolves to mock analytics data
 */
export const getAnalytics = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate random data for the dashboard
  const currentDate = new Date();
  const lastMonth = new Date(currentDate);
  lastMonth.setMonth(currentDate.getMonth() - 1);
  
  // Create mock analytics data
  const mockAnalyticsData = {
    summary: {
      totalUsers: Math.floor(Math.random() * 5000) + 10000,
      activeUsers: Math.floor(Math.random() * 2000) + 5000,
      totalCoupons: Math.floor(Math.random() * 500) + 1500,
      activeCoupons: Math.floor(Math.random() * 300) + 800,
      totalStores: Math.floor(Math.random() * 100) + 300,
      totalCashback: Math.floor(Math.random() * 50000) + 100000,
      pendingPayouts: Math.floor(Math.random() * 10000) + 20000,
      completedPayouts: Math.floor(Math.random() * 40000) + 80000,
    },
    userStats: {
      newUsers: {
        thisMonth: Math.floor(Math.random() * 500) + 1000,
        lastMonth: Math.floor(Math.random() * 400) + 900,
        percentChange: Math.floor(Math.random() * 20) + 5
      },
      activeUsers: {
        thisMonth: Math.floor(Math.random() * 1000) + 3000,
        lastMonth: Math.floor(Math.random() * 900) + 2800,
        percentChange: Math.floor(Math.random() * 15) + 2
      },
      verifiedUsers: {
        thisMonth: Math.floor(Math.random() * 400) + 800,
        lastMonth: Math.floor(Math.random() * 350) + 750,
        percentChange: Math.floor(Math.random() * 10) + 5
      }
    },
    couponStats: {
      newCoupons: {
        thisMonth: Math.floor(Math.random() * 100) + 200,
        lastMonth: Math.floor(Math.random() * 90) + 180,
        percentChange: Math.floor(Math.random() * 15) + 5
      },
      expiredCoupons: {
        thisMonth: Math.floor(Math.random() * 50) + 100,
        lastMonth: Math.floor(Math.random() * 45) + 90,
        percentChange: Math.floor(Math.random() * 10) + 5
      },
      redemptions: {
        thisMonth: Math.floor(Math.random() * 1000) + 2000,
        lastMonth: Math.floor(Math.random() * 900) + 1800,
        percentChange: Math.floor(Math.random() * 20) + 5
      }
    },
    cashbackStats: {
      pendingCashback: {
        thisMonth: Math.floor(Math.random() * 5000) + 10000,
        lastMonth: Math.floor(Math.random() * 4500) + 9000,
        percentChange: Math.floor(Math.random() * 15) + 5
      },
      approvedCashback: {
        thisMonth: Math.floor(Math.random() * 4000) + 8000,
        lastMonth: Math.floor(Math.random() * 3500) + 7000,
        percentChange: Math.floor(Math.random() * 20) + 5
      },
      rejectedCashback: {
        thisMonth: Math.floor(Math.random() * 500) + 1000,
        lastMonth: Math.floor(Math.random() * 450) + 900,
        percentChange: Math.floor(Math.random() * 10) + 5
      }
    },
    recentActivity: [
      {
        id: '1',
        type: 'user_signup',
        user: 'john.doe@example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        details: 'New user registration'
      },
      {
        id: '2',
        type: 'coupon_added',
        user: 'admin@cashheros.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        details: 'Added new coupon for Amazon'
      },
      {
        id: '3',
        type: 'cashback_approved',
        user: 'sarah.smith@example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        details: 'Cashback of $25.50 approved'
      },
      {
        id: '4',
        type: 'store_added',
        user: 'admin@cashheros.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        details: 'Added new store: Target'
      },
      {
        id: '5',
        type: 'payout_processed',
        user: 'finance@cashheros.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        details: 'Processed payouts worth $1,250.75'
      }
    ],
    popularStores: [
      { id: '1', name: 'Amazon', visits: Math.floor(Math.random() * 1000) + 5000 },
      { id: '2', name: 'Walmart', visits: Math.floor(Math.random() * 800) + 4000 },
      { id: '3', name: 'Target', visits: Math.floor(Math.random() * 600) + 3000 },
      { id: '4', name: 'Best Buy', visits: Math.floor(Math.random() * 500) + 2500 },
      { id: '5', name: 'eBay', visits: Math.floor(Math.random() * 400) + 2000 }
    ],
    popularCoupons: [
      { id: '1', store: 'Amazon', discount: '20% off', uses: Math.floor(Math.random() * 500) + 2000 },
      { id: '2', store: 'Walmart', discount: '$10 off $50', uses: Math.floor(Math.random() * 400) + 1500 },
      { id: '3', store: 'Target', discount: 'BOGO 50% off', uses: Math.floor(Math.random() * 300) + 1000 },
      { id: '4', store: 'Best Buy', discount: '$50 off $200', uses: Math.floor(Math.random() * 200) + 800 },
      { id: '5', store: 'eBay', discount: '15% off', uses: Math.floor(Math.random() * 150) + 600 }
    ],
    trafficSources: [
      { source: 'Direct', percentage: Math.floor(Math.random() * 20) + 20 },
      { source: 'Organic Search', percentage: Math.floor(Math.random() * 15) + 25 },
      { source: 'Social Media', percentage: Math.floor(Math.random() * 10) + 15 },
      { source: 'Referral', percentage: Math.floor(Math.random() * 10) + 10 },
      { source: 'Email', percentage: Math.floor(Math.random() * 5) + 5 }
    ],
    deviceStats: {
      desktop: Math.floor(Math.random() * 20) + 50,
      mobile: Math.floor(Math.random() * 15) + 35,
      tablet: Math.floor(Math.random() * 5) + 5
    }
  };
  
  return { data: mockAnalyticsData };
};

/**
 * Get mock user data for the admin dashboard
 * @returns {Promise} - Promise that resolves to mock user data
 */
export const getUsers = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Generate random user data
  const users = [];
  const roles = ['user', 'user', 'user', 'user', 'premium'];
  const statuses = ['active', 'active', 'active', 'inactive', 'suspended'];
  
  for (let i = 1; i <= 50; i++) {
    const firstName = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'][Math.floor(Math.random() * 8)];
    const lastName = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'][Math.floor(Math.random() * 8)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
    
    users.push({
      id: `user${i}`,
      firstName,
      lastName,
      email,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      joinDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
      emailVerified: Math.random() > 0.2
    });
  }
  
  return { data: users };
};

export default {
  getAnalytics,
  getUsers
};