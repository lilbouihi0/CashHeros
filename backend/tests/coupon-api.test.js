/**
 * Coupon API Test
 * 
 * This file demonstrates how to use the Coupon API endpoints.
 * 
 * To run these tests manually, you can use tools like Postman, curl, or fetch in a browser.
 */

// Example using fetch in JavaScript
const API_URL = 'http://localhost:5000/api/coupons';

// Admin login to get token
async function loginAsAdmin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'adminpassword'
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to login');
    }
    
    return data.accessToken;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Create a new coupon
async function createCoupon(token) {
  const newCoupon = {
    code: `TEST${Math.floor(Math.random() * 1000)}`,
    title: 'Test Coupon',
    description: 'This is a test coupon',
    discount: 15,
    store: {
      name: 'Test Store',
      logo: 'https://example.com/logo.png'
    },
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    isActive: true,
    usageLimit: 50,
    category: 'Test'
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCoupon)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create coupon');
    }
    
    console.log('Coupon created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
}

// Get all coupons with pagination and filtering
async function getCoupons(page = 1, limit = 10, filters = {}) {
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...filters
  });

  try {
    const response = await fetch(`${API_URL}?${queryParams}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch coupons');
    }
    
    console.log('Coupons fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
}

// Get a single coupon by ID
async function getCouponById(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch coupon');
    }
    
    console.log('Coupon fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching coupon:', error);
    throw error;
  }
}

// Update a coupon
async function updateCoupon(id, updates, token) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update coupon');
    }
    
    console.log('Coupon updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
}

// Delete a coupon
async function deleteCoupon(id, token) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete coupon');
    }
    
    console.log('Coupon deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
}

// Redeem a coupon
async function redeemCoupon(id, token) {
  try {
    const response = await fetch(`${API_URL}/${id}/redeem`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to redeem coupon');
    }
    
    console.log('Coupon redeemed successfully:', data);
    return data;
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    throw error;
  }
}

// Example workflow
async function testCouponAPI() {
  try {
    // Step 1: Login as admin
    console.log('Logging in as admin...');
    const token = await loginAsAdmin();
    
    // Step 2: Create a new coupon
    console.log('Creating a new coupon...');
    const newCoupon = await createCoupon(token);
    
    // Step 3: Get all coupons
    console.log('Fetching all coupons...');
    const coupons = await getCoupons();
    
    // Step 4: Get the created coupon by ID
    console.log('Fetching the created coupon...');
    const coupon = await getCouponById(newCoupon._id);
    
    // Step 5: Update the coupon
    console.log('Updating the coupon...');
    const updatedCoupon = await updateCoupon(newCoupon._id, {
      title: 'Updated Test Coupon',
      discount: 20
    }, token);
    
    // Step 6: Redeem the coupon
    console.log('Redeeming the coupon...');
    const redeemedCoupon = await redeemCoupon(newCoupon._id, token);
    
    // Step 7: Delete the coupon
    console.log('Deleting the coupon...');
    await deleteCoupon(newCoupon._id, token);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test workflow failed:', error);
  }
}

// Uncomment to run the test workflow
// testCouponAPI();

// Export functions for use in other files
module.exports = {
  loginAsAdmin,
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  redeemCoupon,
  testCouponAPI
};