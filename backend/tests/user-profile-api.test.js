/**
 * User Profile Management API Test
 * 
 * This file demonstrates how to use the User Profile Management API endpoints.
 * 
 * To run these tests manually, you can use tools like Postman, curl, or fetch in a browser.
 */

// Example using fetch in JavaScript
const API_URL = 'http://localhost:5000/api/users';

// Login to get token
async function login(email = 'user@example.com', password = 'password123') {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
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

// Get user profile
async function getUserProfile(token) {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user profile');
    }
    
    console.log('User profile retrieved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

// Update user profile
async function updateUserProfile(token, profileData) {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user profile');
    }
    
    console.log('User profile updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Upload profile picture
async function uploadProfilePicture(token, imageFile) {
  try {
    const formData = new FormData();
    formData.append('profilePicture', imageFile);
    
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload profile picture');
    }
    
    console.log('Profile picture uploaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

// Change password
async function changePassword(token, currentPassword, newPassword) {
  try {
    const response = await fetch(`${API_URL}/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }
    
    console.log('Password changed successfully:', data);
    return data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

// Verify email change
async function verifyEmailChange(token) {
  try {
    const response = await fetch(`${API_URL}/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify email');
    }
    
    console.log('Email verified successfully:', data);
    return data;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
}

// Delete account
async function deleteAccount(token, password) {
  try {
    const response = await fetch(`${API_URL}/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete account');
    }
    
    console.log('Account deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

// Get user activity
async function getUserActivity(token) {
  try {
    const response = await fetch(`${API_URL}/activity`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user activity');
    }
    
    console.log('User activity retrieved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error getting user activity:', error);
    throw error;
  }
}

// Get user favorites
async function getUserFavorites(token) {
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user favorites');
    }
    
    console.log('User favorites retrieved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error getting user favorites:', error);
    throw error;
  }
}

// Get security log
async function getSecurityLog(token) {
  try {
    const response = await fetch(`${API_URL}/security-log`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get security log');
    }
    
    console.log('Security log retrieved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error getting security log:', error);
    throw error;
  }
}

// Example workflow
async function testUserProfileAPI() {
  try {
    // Step 1: Login
    console.log('Logging in...');
    const token = await login();
    
    // Step 2: Get user profile
    console.log('Getting user profile...');
    const profileData = await getUserProfile(token);
    
    // Step 3: Update user profile
    console.log('Updating user profile...');
    const updatedProfile = await updateUserProfile(token, {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        categories: ['Electronics', 'Fashion']
      }
    });
    
    // Step 4: Change password
    console.log('Changing password...');
    // Note: In a real test, you would use the actual current password
    // await changePassword(token, 'password123', 'newPassword456!');
    
    // Step 5: Get user activity
    console.log('Getting user activity...');
    const activity = await getUserActivity(token);
    
    // Step 6: Get user favorites
    console.log('Getting user favorites...');
    const favorites = await getUserFavorites(token);
    
    // Step 7: Get security log
    console.log('Getting security log...');
    const securityLog = await getSecurityLog(token);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test workflow failed:', error);
  }
}

// Uncomment to run the test workflow
// testUserProfileAPI();

// Export functions for use in other files
module.exports = {
  login,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  changePassword,
  verifyEmailChange,
  deleteAccount,
  getUserActivity,
  getUserFavorites,
  getSecurityLog,
  testUserProfileAPI
};