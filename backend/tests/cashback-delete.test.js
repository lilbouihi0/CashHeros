/**
 * Cashback DELETE Route Test
 * 
 * This file demonstrates how to use the DELETE route for cashbacks.
 * 
 * To run this test manually, you can use tools like Postman, curl, or fetch in a browser.
 */

// Example using fetch in JavaScript
async function deleteCashback(cashbackId, token) {
  try {
    const response = await fetch(`http://localhost:5000/api/cashbacks/${cashbackId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete cashback');
    }
    
    console.log('Cashback deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting cashback:', error);
    throw error;
  }
}

// Example using axios in Node.js
/*
const axios = require('axios');

async function deleteCashback(cashbackId, token) {
  try {
    const response = await axios.delete(`http://localhost:5000/api/cashbacks/${cashbackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Cashback deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting cashback:', 
      error.response?.data?.message || error.message);
    throw error;
  }
}
*/

// Example using curl (command line)
/*
curl -X DELETE http://localhost:5000/api/cashbacks/60d21b4667d0d8992e610c85 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
*/

/**
 * Usage example:
 * 
 * 1. First, login as an admin to get an access token:
 *    POST /api/auth/login with { email: "admin@example.com", password: "password" }
 * 
 * 2. Then use the token to delete a cashback:
 *    deleteCashback('cashbackId', 'accessToken')
 * 
 * Note: Only users with admin role can delete cashbacks.
 */

// Example workflow
async function testDeleteCashback() {
  // Step 1: Login as admin (replace with actual admin credentials)
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'adminpassword'
    })
  });
  
  const loginData = await loginResponse.json();
  const token = loginData.accessToken;
  
  // Step 2: Get a list of cashbacks to find one to delete
  const cashbacksResponse = await fetch('http://localhost:5000/api/cashbacks');
  const cashbacksData = await cashbacksResponse.json();
  
  if (cashbacksData.cashbacks && cashbacksData.cashbacks.length > 0) {
    const cashbackToDelete = cashbacksData.cashbacks[0];
    
    // Step 3: Delete the cashback
    await deleteCashback(cashbackToDelete._id, token);
    console.log(`Cashback "${cashbackToDelete.title}" deleted successfully`);
  } else {
    console.log('No cashbacks available to delete');
  }
}

// Uncomment to run the test
// testDeleteCashback().catch(console.error);