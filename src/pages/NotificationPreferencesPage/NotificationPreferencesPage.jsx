// src/pages/NotificationPreferencesPage/NotificationPreferencesPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './NotificationPreferencesPage.module.css';

export const NotificationPreferencesPage = () => {
  const { user, accessToken, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    notificationTypes: {
      promotions: true,
      cashbackAlerts: true,
      accountUpdates: true,
      orderConfirmations: true,
      newStores: true,
      recommendations: true,
      newsletter: true,
      surveyRequests: false
    },
    frequency: 'daily',
    categories: []
  });
  
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user preferences when component mounts
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user preferences
        const userResponse = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        // Fetch available categories
        const categoriesResponse = await axios.get('http://localhost:5000/api/categories');
        
        // Set preferences from user data
        if (userResponse.data.user.preferences) {
          setPreferences(prev => ({
            ...prev,
            emailNotifications: userResponse.data.user.preferences.emailNotifications ?? true,
            smsNotifications: userResponse.data.user.preferences.smsNotifications ?? false,
            notificationTypes: userResponse.data.user.preferences.notificationTypes ?? prev.notificationTypes,
            frequency: userResponse.data.user.preferences.frequency ?? 'daily',
            categories: userResponse.data.user.preferences.categories ?? []
          }));
        }
        
        // Set available categories
        setAvailableCategories(categoriesResponse.data.categories);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Failed to load your notification preferences. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreferences();
  }, [user, accessToken]);

  // Handle toggle changes
  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle notification type toggle changes
  const handleNotificationTypeChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [name]: checked
      }
    }));
  };

  // Handle frequency change
  const handleFrequencyChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      frequency: e.target.value
    }));
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId) => {
    setPreferences(prev => {
      const updatedCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      return {
        ...prev,
        categories: updatedCategories
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError(null);
    
    try {
      setLoading(true);
      
      // Create form data for the API call
      const formData = new FormData();
      formData.append('preferences', JSON.stringify({
        emailNotifications: preferences.emailNotifications,
        smsNotifications: preferences.smsNotifications,
        notificationTypes: preferences.notificationTypes,
        frequency: preferences.frequency,
        categories: preferences.categories
      }));
      
      // Update user preferences
      const response = await updateProfile(formData);
      
      setSuccessMessage('Notification preferences updated successfully!');
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update notification preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login', { state: { from: '/notification-preferences' } });
    return null;
  }

  return (
    <div className={styles.preferencesPage}>
      <div className={styles.preferencesContainer}>
        <h1>Notification Preferences</h1>
        
        {loading && !successMessage && !error ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Loading your preferences...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.preferencesForm}>
            {successMessage && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}
            
            {error && (
              <div className={styles.errorMessage}>{error}</div>
            )}
            
            <div className={styles.section}>
              <h2>Communication Channels</h2>
              <p className={styles.sectionDescription}>
                Choose how you'd like to receive notifications from us.
              </p>
              
              <div className={styles.toggleGroup}>
                <label className={styles.toggleLabel}>
                  <span>Email Notifications</span>
                  <div className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={preferences.emailNotifications}
                      onChange={handleToggleChange}
                    />
                    <span className={styles.slider}></span>
                  </div>
                </label>
                <p className={styles.toggleDescription}>
                  Receive notifications, offers, and updates via email.
                </p>
              </div>
              
              <div className={styles.toggleGroup}>
                <label className={styles.toggleLabel}>
                  <span>SMS Notifications</span>
                  <div className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={preferences.smsNotifications}
                      onChange={handleToggleChange}
                    />
                    <span className={styles.slider}></span>
                  </div>
                </label>
                <p className={styles.toggleDescription}>
                  Receive time-sensitive alerts and offers via text message.
                </p>
              </div>
            </div>
            
            <div className={styles.section}>
              <h2>Notification Types</h2>
              <p className={styles.sectionDescription}>
                Select the types of notifications you want to receive.
              </p>
              
              <div className={styles.checkboxGrid}>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="promotions"
                      checked={preferences.notificationTypes.promotions}
                      onChange={handleNotificationTypeChange}
                    />
                    <span>Promotions & Deals</span>
                  </label>
                </div>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="cashbackAlerts"
                      checked={preferences.notificationTypes.cashbackAlerts}
                      onChange={handleNotificationTypeChange}
                    />
                    <span>Cashback Alerts</span>
                  </label>
                </div>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="accountUpdates"
                      checked={preferences.notificationTypes.accountUpdates}
                      onChange={handleNotificationTypeChange}
                    />
                    <span>Account Updates</span>
                  </label>
                </div>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="orderConfirmations"
                      checked={preferences.notificationTypes.orderConfirmations}
                      onChange={handleNotificationTypeChange}
                    />
                    <span>Order Confirmations</span>
                  </label>
                </div>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="newStores"
                      checked={preferences.notificationTypes.newStores}
                      onChange={handleNotificationTypeChange}
                    />
                    <span>New Stores</span>
                  </label>
                </div>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="recommendations"
                      checked={preferences.notificationTypes.recommendations}
                      onChange={handleNotificationTypeChange}
                    />
                    <span>Personalized Recommendations</span>
                  </label>
                </div>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={preferences.notificationTypes.newsletter}
                      onChange={handleNotificationTypeChange}
                    />
                    <span>Weekly Newsletter</span>
                  </label>
                </div>
                
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="surveyRequests"
                      checked={preferences.notificationTypes.surveyRequests}
                      onChange={handleNotificationTypeChange}
                    />
                    <span>Survey Requests</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className={styles.section}>
              <h2>Email Frequency</h2>
              <p className={styles.sectionDescription}>
                Choose how often you'd like to receive promotional emails.
              </p>
              
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="frequency"
                    value="daily"
                    checked={preferences.frequency === 'daily'}
                    onChange={handleFrequencyChange}
                  />
                  <span>Daily</span>
                  <p className={styles.radioDescription}>
                    Receive a daily digest of the best deals and offers.
                  </p>
                </label>
                
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="frequency"
                    value="weekly"
                    checked={preferences.frequency === 'weekly'}
                    onChange={handleFrequencyChange}
                  />
                  <span>Weekly</span>
                  <p className={styles.radioDescription}>
                    Receive a weekly roundup of deals and offers.
                  </p>
                </label>
                
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="frequency"
                    value="monthly"
                    checked={preferences.frequency === 'monthly'}
                    onChange={handleFrequencyChange}
                  />
                  <span>Monthly</span>
                  <p className={styles.radioDescription}>
                    Receive a monthly summary of the best deals.
                  </p>
                </label>
                
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="frequency"
                    value="important"
                    checked={preferences.frequency === 'important'}
                    onChange={handleFrequencyChange}
                  />
                  <span>Important Only</span>
                  <p className={styles.radioDescription}>
                    Only receive emails about important deals and account updates.
                  </p>
                </label>
              </div>
            </div>
            
            <div className={styles.section}>
              <h2>Categories of Interest</h2>
              <p className={styles.sectionDescription}>
                Select the categories you're interested in to receive more relevant notifications.
              </p>
              
              <div className={styles.categoriesGrid}>
                {availableCategories.map(category => (
                  <div key={category.id} className={styles.categoryCard}>
                    <label className={styles.categoryLabel}>
                      <input
                        type="checkbox"
                        checked={preferences.categories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                      />
                      <span className={styles.categoryName}>{category.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;