/**
 * Mock Services
 * 
 * This file contains mock services for development
 */

// Generate random date within the last 90 days
const getRandomDate = (daysAgo = 90) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Generate random coupon code
const generateCouponCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate random store data
const generateStores = (count = 20) => {
  const storeNames = [
    'Amazon', 'Walmart', 'Target', 'Best Buy', 'eBay', 
    'Macy\'s', 'Nordstrom', 'Home Depot', 'Lowe\'s', 'Costco',
    'Staples', 'Office Depot', 'Apple', 'Microsoft', 'Dell',
    'Nike', 'Adidas', 'Under Armour', 'Gap', 'Old Navy'
  ];
  
  const categories = [
    'Electronics', 'Fashion', 'Home', 'Beauty', 'Food', 
    'Travel', 'Sports', 'Office', 'Toys', 'Pets'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `store-${i + 1}`,
    name: storeNames[i % storeNames.length],
    logo: `https://placehold.co/150x150?text=${storeNames[i % storeNames.length].replace(' ', '+')}`,
    website: `https://www.${storeNames[i % storeNames.length].toLowerCase().replace(' ', '')}.com`,
    category: categories[Math.floor(Math.random() * categories.length)],
    cashbackRate: Math.floor(Math.random() * 10) + 1,
    featured: Math.random() > 0.7,
    active: Math.random() > 0.1,
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(30)
  }));
};

// Generate random coupon data
const generateCoupons = (count = 50, stores = []) => {
  const discountTypes = ['percentage', 'fixed', 'bogo'];
  const titles = [
    'Summer Sale', 'Flash Deal', 'Weekend Special', 'Holiday Offer',
    'Clearance Sale', 'New Customer Discount', 'Loyalty Reward',
    'Back to School', 'Black Friday', 'Cyber Monday'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const discountType = discountTypes[Math.floor(Math.random() * discountTypes.length)];
    const discountValue = discountType === 'percentage' 
      ? Math.floor(Math.random() * 70) + 5 
      : Math.floor(Math.random() * 100) + 5;
    
    const store = stores[Math.floor(Math.random() * stores.length)];
    
    // Set expiry date (some coupons expired, some active)
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 30) - 1);
    
    const isExpired = Math.random() > 0.7;
    const expiryDate = isExpired ? pastDate.toISOString() : futureDate.toISOString();
    
    return {
      id: `coupon-${i + 1}`,
      code: generateCouponCode(),
      title: `${titles[Math.floor(Math.random() * titles.length)]} - ${discountValue}${discountType === 'percentage' ? '%' : '$'} Off`,
      description: `Save ${discountValue}${discountType === 'percentage' ? '%' : '$'} on your purchase at ${store.name}.`,
      discountType,
      discountValue,
      store: {
        id: store.id,
        name: store.name,
        logo: store.logo
      },
      expiryDate,
      terms: 'Some restrictions may apply. Cannot be combined with other offers.',
      featured: Math.random() > 0.7,
      verified: Math.random() > 0.2,
      usageCount: Math.floor(Math.random() * 1000),
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(15)
    };
  });
};

// Generate random user data
const generateUsers = (count = 100) => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Jessica'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
    
    return {
      id: `user-${i + 1}`,
      firstName,
      lastName,
      email,
      role: Math.random() > 0.95 ? 'admin' : 'user',
      emailVerified: Math.random() > 0.2,
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      createdAt: getRandomDate(),
      lastLogin: Math.random() > 0.3 ? getRandomDate(10) : null
    };
  });
};

// Generate random blog post data
const generateBlogPosts = (count = 30) => {
  const titles = [
    'Top 10 Ways to Save Money Online',
    'How to Find the Best Deals on Electronics',
    'The Ultimate Guide to Cashback Rewards',
    'Maximizing Your Savings with Coupon Stacking',
    'Best Time to Shop for Seasonal Discounts',
    'How to Avoid Online Shopping Scams',
    'Understanding Cashback vs. Points Rewards',
    'Shopping Smart: Quality vs. Price',
    'The Psychology of Sales and Discounts',
    'Building a Budget-Friendly Wardrobe'
  ];
  
  const categories = ['Savings Tips', 'Shopping Guide', 'Cashback', 'Coupons', 'Deals', 'Finance', 'Fashion', 'Travel', 'Technology'];
  
  // Sample blog post images
  const blogImages = [
    'https://placehold.co/600x400?text=Shopping+Tips',
    'https://placehold.co/600x400?text=Cashback+Rewards',
    'https://placehold.co/600x400?text=Coupon+Deals',
    'https://placehold.co/600x400?text=Budget+Tips',
    'https://placehold.co/600x400?text=Online+Shopping',
    'https://placehold.co/600x400?text=Money+Saving',
    'https://placehold.co/600x400?text=Fashion+Deals',
    'https://placehold.co/600x400?text=Tech+Discounts',
    'https://placehold.co/600x400?text=Travel+Savings'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    // Ensure each blog has a unique ID with a random component
    id: `blog-${i + 1}-${Math.random().toString(36).substring(2, 9)}`,
    title: titles[i % titles.length],
    slug: titles[i % titles.length].toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-'),
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    category: categories[Math.floor(Math.random() * categories.length)],
    // Add an image URL for each blog post
    image: blogImages[Math.floor(Math.random() * blogImages.length)],
    author: {
      id: `author-${Math.floor(Math.random() * 5) + 1}`,
      name: `Admin ${Math.floor(Math.random() * 5) + 1}`
    },
    featured: Math.random() > 0.8,
    published: Math.random() > 0.1,
    publishedAt: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(15),
    // Add a formatted date string for display
    date: new Date(getRandomDate()).toLocaleDateString()
  }));
};

// Generate random cashback data
const generateCashbackData = (count = 80, users = [], stores = []) => {
  const statuses = ['pending', 'approved', 'rejected', 'paid'];
  
  return Array.from({ length: count }, (_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const store = stores[Math.floor(Math.random() * stores.length)];
    const amount = Math.floor(Math.random() * 100) + 5;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: `cashback-${i + 1}`,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      store: {
        id: store.id,
        name: store.name
      },
      amount,
      status,
      transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      purchaseDate: getRandomDate(),
      processedDate: status !== 'pending' ? getRandomDate(15) : null,
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(5)
    };
  });
};

// Check localStorage for deleted data flags
const isAllCouponsDeleted = localStorage.getItem('isAllCouponsDeleted') === 'true';
const isAllCashbacksDeleted = localStorage.getItem('isAllCashbacksDeleted') === 'true';
const isAllUsersDeleted = localStorage.getItem('isAllUsersDeleted') === 'true';
const isAllBlogPostsDeleted = localStorage.getItem('isAllBlogPostsDeleted') === 'true';
const isAllStoresDeleted = localStorage.getItem('isAllStoresDeleted') === 'true';

// Mock data store
const stores = isAllStoresDeleted ? [] : generateStores();
const users = isAllUsersDeleted ? [] : generateUsers();
const coupons = isAllCouponsDeleted ? [] : generateCoupons(50, stores);
const blogPosts = isAllBlogPostsDeleted ? [] : generateBlogPosts();
const cashbacks = isAllCashbacksDeleted ? [] : generateCashbackData(80, users, stores);

/**
 * Get paginated data
 * @param {Array} data - The data array
 * @param {number} page - The page number
 * @param {number} limit - The number of items per page
 * @returns {Object} - Paginated data
 */
const getPaginatedData = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const results = data.slice(startIndex, endIndex);
  
  return {
    data: results,
    pagination: {
      total: data.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(data.length / limit)
    }
  };
};

/**
 * Mock API response with delay
 * @param {any} data - The data to return
 * @param {number} delay - The delay in milliseconds
 * @returns {Promise} - Promise that resolves to the data
 */
const mockResponse = async (data, delay = 500) => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return data;
};

// Mock services
export const mockServices = {
  // General services
  resetData: async () => {
    // Clear localStorage flags
    localStorage.removeItem('isAllCouponsDeleted');
    localStorage.removeItem('isAllCashbacksDeleted');
    localStorage.removeItem('isAllUsersDeleted');
    localStorage.removeItem('isAllBlogPostsDeleted');
    localStorage.removeItem('isAllStoresDeleted');
    
    // Regenerate data
    const newStores = generateStores();
    stores.length = 0;
    stores.push(...newStores);
    
    const newUsers = generateUsers();
    users.length = 0;
    users.push(...newUsers);
    
    const newCoupons = generateCoupons(50, stores);
    coupons.length = 0;
    coupons.push(...newCoupons);
    
    const newBlogPosts = generateBlogPosts();
    blogPosts.length = 0;
    blogPosts.push(...newBlogPosts);
    
    const newCashbacks = generateCashbackData(80, users, stores);
    cashbacks.length = 0;
    cashbacks.push(...newCashbacks);
    
    return mockResponse({ message: 'All data has been reset successfully' });
  },
  
  // Coupon services
  getCoupons: async (page = 1, limit = 10) => {
    return mockResponse(getPaginatedData(coupons, page, limit));
  },
  
  getCouponById: async (id) => {
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    return mockResponse({ data: coupon });
  },
  
  createCoupon: async (couponData) => {
    // If all coupons were deleted, reset the flag when creating a new one
    if (localStorage.getItem('isAllCouponsDeleted') === 'true') {
      localStorage.removeItem('isAllCouponsDeleted');
    }
    
    const newCoupon = {
      id: `coupon-${coupons.length + 1}`,
      ...couponData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    coupons.unshift(newCoupon);
    return mockResponse({ data: newCoupon, message: 'Coupon created successfully' });
  },
  
  updateCoupon: async (id, couponData) => {
    const index = coupons.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Coupon not found');
    }
    
    const updatedCoupon = {
      ...coupons[index],
      ...couponData,
      updatedAt: new Date().toISOString()
    };
    
    coupons[index] = updatedCoupon;
    return mockResponse({ data: updatedCoupon, message: 'Coupon updated successfully' });
  },
  
  deleteCoupon: async (id) => {
    const index = coupons.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Coupon not found');
    }
    
    coupons.splice(index, 1);
    return mockResponse({ message: 'Coupon deleted successfully' });
  },
  
  deleteAllCoupons: async () => {
    // Clear the coupons array
    coupons.length = 0;
    // Set localStorage flag to remember deletion across refreshes
    localStorage.setItem('isAllCouponsDeleted', 'true');
    return mockResponse({ message: 'All coupons deleted successfully' });
  },
  
  // Store services
  getStores: async (page = 1, limit = 10) => {
    return mockResponse(getPaginatedData(stores, page, limit));
  },
  
  getStoreById: async (id) => {
    const store = stores.find(s => s.id === id);
    if (!store) {
      throw new Error('Store not found');
    }
    return mockResponse({ data: store });
  },
  
  createStore: async (storeData) => {
    // If all stores were deleted, reset the flag when creating a new one
    if (localStorage.getItem('isAllStoresDeleted') === 'true') {
      localStorage.removeItem('isAllStoresDeleted');
    }
    
    const newStore = {
      id: `store-${stores.length + 1}`,
      ...storeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    stores.unshift(newStore);
    return mockResponse({ data: newStore, message: 'Store created successfully' });
  },
  
  updateStore: async (id, storeData) => {
    const index = stores.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Store not found');
    }
    
    const updatedStore = {
      ...stores[index],
      ...storeData,
      updatedAt: new Date().toISOString()
    };
    
    stores[index] = updatedStore;
    return mockResponse({ data: updatedStore, message: 'Store updated successfully' });
  },
  
  deleteStore: async (id) => {
    const index = stores.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Store not found');
    }
    
    stores.splice(index, 1);
    return mockResponse({ message: 'Store deleted successfully' });
  },
  
  deleteAllStores: async () => {
    // Clear the stores array
    stores.length = 0;
    // Set localStorage flag to remember deletion across refreshes
    localStorage.setItem('isAllStoresDeleted', 'true');
    return mockResponse({ message: 'All stores deleted successfully' });
  },
  
  // User services
  getUsers: async (page = 1, limit = 10) => {
    return mockResponse(getPaginatedData(users, page, limit));
  },
  
  getUserById: async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return mockResponse({ data: user });
  },
  
  updateUser: async (id, userData) => {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    users[index] = updatedUser;
    return mockResponse({ data: updatedUser, message: 'User updated successfully' });
  },
  
  deleteUser: async (id) => {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    
    users.splice(index, 1);
    return mockResponse({ message: 'User deleted successfully' });
  },
  
  deleteAllUsers: async () => {
    // Clear the users array
    users.length = 0;
    // Set localStorage flag to remember deletion across refreshes
    localStorage.setItem('isAllUsersDeleted', 'true');
    return mockResponse({ message: 'All users deleted successfully' });
  },
  
  // Blog services
  getBlogPosts: async (page = 1, limit = 10) => {
    // Ensure all blog posts have an id
    const postsWithIds = blogPosts.map(post => {
      if (!post.id) {
        post.id = `blog-${Math.random().toString(36).substring(2, 9)}`;
      }
      return post;
    });
    return mockResponse(getPaginatedData(postsWithIds, page, limit));
  },
  
  getBlogPostById: async (id) => {
    const post = blogPosts.find(p => p.id === id);
    if (!post) {
      throw new Error('Blog post not found');
    }
    return mockResponse({ data: post });
  },
  
  createBlogPost: async (postData) => {
    const newPost = {
      id: `blog-${blogPosts.length + 1}-${Math.random().toString(36).substring(2, 9)}`,
      ...postData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    blogPosts.unshift(newPost);
    return mockResponse({ data: newPost, message: 'Blog post created successfully' });
  },
  
  updateBlogPost: async (id, postData) => {
    const index = blogPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Blog post not found');
    }
    
    const updatedPost = {
      ...blogPosts[index],
      ...postData,
      updatedAt: new Date().toISOString()
    };
    
    blogPosts[index] = updatedPost;
    return mockResponse({ data: updatedPost, message: 'Blog post updated successfully' });
  },
  
  deleteBlogPost: async (id) => {
    const index = blogPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Blog post not found');
    }
    
    blogPosts.splice(index, 1);
    return mockResponse({ message: 'Blog post deleted successfully' });
  },
  
  deleteAllBlogPosts: async () => {
    // Clear the blogPosts array
    blogPosts.length = 0;
    // Set localStorage flag to remember deletion across refreshes
    localStorage.setItem('isAllBlogPostsDeleted', 'true');
    return mockResponse({ message: 'All blog posts deleted successfully' });
  },
  
  // Additional blog services for specific operations
  toggleBlogPublishStatus: async (id, published) => {
    const index = blogPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Blog post not found');
    }
    
    blogPosts[index].published = published;
    blogPosts[index].updatedAt = new Date().toISOString();
    
    return mockResponse({ 
      data: blogPosts[index], 
      message: `Blog post ${published ? 'published' : 'unpublished'} successfully` 
    });
  },
  
  toggleBlogFeatureStatus: async (id, featured) => {
    const index = blogPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Blog post not found');
    }
    
    blogPosts[index].featured = featured;
    blogPosts[index].updatedAt = new Date().toISOString();
    
    return mockResponse({ 
      data: blogPosts[index], 
      message: `Blog post ${featured ? 'featured' : 'unfeatured'} successfully` 
    });
  },
  
  // Cashback services
  getCashbacks: async (page = 1, limit = 10) => {
    return mockResponse(getPaginatedData(cashbacks, page, limit));
  },
  
  getCashbackById: async (id) => {
    const cashback = cashbacks.find(c => c.id === id);
    if (!cashback) {
      throw new Error('Cashback not found');
    }
    return mockResponse({ data: cashback });
  },
  
  updateCashbackStatus: async (id, status) => {
    const index = cashbacks.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cashback not found');
    }
    
    const updatedCashback = {
      ...cashbacks[index],
      status,
      processedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    cashbacks[index] = updatedCashback;
    return mockResponse({ data: updatedCashback, message: 'Cashback status updated successfully' });
  },
  
  createCashback: async (cashbackData) => {
    // If all cashbacks were deleted, reset the flag when creating a new one
    if (localStorage.getItem('isAllCashbacksDeleted') === 'true') {
      localStorage.removeItem('isAllCashbacksDeleted');
    }
    
    const newCashback = {
      id: `cashback-${cashbacks.length + 1}`,
      ...cashbackData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    cashbacks.unshift(newCashback);
    return mockResponse({ data: newCashback, message: 'Cashback offer created successfully' });
  },
  
  updateCashback: async (id, cashbackData) => {
    const index = cashbacks.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cashback not found');
    }
    
    const updatedCashback = {
      ...cashbacks[index],
      ...cashbackData,
      updatedAt: new Date().toISOString()
    };
    
    cashbacks[index] = updatedCashback;
    return mockResponse({ data: updatedCashback, message: 'Cashback offer updated successfully' });
  },
  
  deleteCashback: async (id) => {
    const index = cashbacks.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cashback not found');
    }
    
    cashbacks.splice(index, 1);
    return mockResponse({ message: 'Cashback offer deleted successfully' });
  },
  
  deleteAllCashbacks: async () => {
    // Clear the cashbacks array
    cashbacks.length = 0;
    // Set localStorage flag to remember deletion across refreshes
    localStorage.setItem('isAllCashbacksDeleted', 'true');
    return mockResponse({ message: 'All cashback offers deleted successfully' });
  }
};

export default mockServices;