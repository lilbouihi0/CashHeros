// src/pages/ProfilePage/ProfilePage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
  const { user, updateProfile, changePassword, error, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Form states
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'USA'
        }
      });
      
      // Set profile image preview if user has one
      if (user.profilePicture) {
        setImagePreview(`http://localhost:5000/${user.profilePicture}`);
      }
    }
  }, [user]);

  // Handle input changes for profile form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle input changes for password form
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (optional field)
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) errors.newPassword = 'New password is required';
    if (!passwordData.confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    
    if (passwordData.newPassword && passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    }
    
    if (passwordData.newPassword && !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must include uppercase, lowercase, number, and special character';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateProfileForm()) return;
    
    try {
      // Create form data for multipart/form-data (for image upload)
      const formDataToSend = new FormData();
      
      // Append text fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      
      // Append address as JSON string
      formDataToSend.append('address', JSON.stringify(formData.address));
      
      // Append profile image if selected
      if (profileImage) {
        formDataToSend.append('profilePicture', profileImage);
      }
      
      const result = await updateProfile(formDataToSend);
      setSuccessMessage(result.message || 'Profile updated successfully');
      
      // Clear any previous errors
      setFormErrors({});
    } catch (error) {
      setFormErrors({ submit: error.message || 'Failed to update profile' });
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validatePasswordForm()) return;
    
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setSuccessMessage(result.message || 'Password updated successfully');
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear any previous errors
      setFormErrors({});
    } catch (error) {
      setFormErrors({ submit: error.message || 'Failed to update password' });
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login', { state: { from: '/profile' } });
    return null;
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        <h1>My Profile</h1>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'personal' ? styles.active : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Information
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'security' ? styles.active : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>
        
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}
        
        {formErrors.submit && (
          <div className={styles.errorMessage}>
            {formErrors.submit}
          </div>
        )}
        
        {activeTab === 'personal' && (
          <form onSubmit={handleProfileSubmit} className={styles.profileForm}>
            <div className={styles.profileImageSection}>
              <div className={styles.imagePreview}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" />
                ) : (
                  <div className={styles.noImage}>
                    {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                  </div>
                )}
              </div>
              <div className={styles.imageUpload}>
                <label htmlFor="profilePicture" className={styles.uploadButton}>
                  Change Profile Picture
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={formErrors.firstName ? styles.inputError : ''}
              />
              {formErrors.firstName && <span className={styles.errorText}>{formErrors.firstName}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={formErrors.lastName ? styles.inputError : ''}
              />
              {formErrors.lastName && <span className={styles.errorText}>{formErrors.lastName}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={formErrors.email ? styles.inputError : ''}
              />
              {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
              <span className={styles.helperText}>
                If you change your email, you'll need to verify the new address.
              </span>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number (optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={formErrors.phone ? styles.inputError : ''}
                placeholder="(123) 456-7890"
              />
              {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
            </div>
            
            <h3>Address Information</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="street">Street Address</label>
              <input
                type="text"
                id="street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="zipCode">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
        
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={formErrors.currentPassword ? styles.inputError : ''}
              />
              {formErrors.currentPassword && <span className={styles.errorText}>{formErrors.currentPassword}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={formErrors.newPassword ? styles.inputError : ''}
              />
              {formErrors.newPassword && <span className={styles.errorText}>{formErrors.newPassword}</span>}
              <span className={styles.helperText}>
                Password must be at least 8 characters and include uppercase, lowercase, 
                number, and special character.
              </span>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={formErrors.confirmPassword ? styles.inputError : ''}
              />
              {formErrors.confirmPassword && <span className={styles.errorText}>{formErrors.confirmPassword}</span>}
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;