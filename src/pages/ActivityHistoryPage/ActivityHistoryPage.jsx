// src/pages/ActivityHistoryPage/ActivityHistoryPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ActivityHistoryPage.module.css';

export const ActivityHistoryPage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('all');
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch user activity when component mounts
  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/users/activity', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        setActivities(response.data.activity.recentActivity || []);
        setFilteredActivities(response.data.activity.recentActivity || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError('Failed to load your activity history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivity();
  }, [user, accessToken]);

  // Filter activities when tab changes
  useEffect(() => {
    if (activities.length === 0) return;
    
    let filtered = [...activities];
    
    // Filter by type
    if (activeTab !== 'all') {
      filtered = filtered.filter(activity => activity.type === activeTab);
    }
    
    // Filter by date range
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      filtered = filtered.filter(activity => new Date(activity.date) >= startDate);
    }
    
    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(activity => new Date(activity.date) <= endDate);
    }
    
    setFilteredActivities(filtered);
  }, [activeTab, activities, dateRange]);

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear date filters
  const clearDateFilters = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return '🔐';
      case 'signup':
        return '👋';
      case 'purchase':
        return '🛒';
      case 'cashback':
        return '💰';
      case 'coupon':
        return '🏷️';
      case 'redemption':
        return '💸';
      case 'favorite':
        return '❤️';
      case 'profile':
        return '👤';
      case 'referral':
        return '👥';
      case 'feedback':
        return '📝';
      default:
        return '📊';
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login', { state: { from: '/activity-history' } });
    return null;
  }

  return (
    <div className={styles.activityPage}>
      <div className={styles.activityContainer}>
        <h1>Activity History</h1>
        
        <div className={styles.filterSection}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Activity
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'login' ? styles.active : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Logins
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'purchase' ? styles.active : ''}`}
              onClick={() => setActiveTab('purchase')}
            >
              Purchases
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'cashback' ? styles.active : ''}`}
              onClick={() => setActiveTab('cashback')}
            >
              Cashback
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'coupon' ? styles.active : ''}`}
              onClick={() => setActiveTab('coupon')}
            >
              Coupons
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'favorite' ? styles.active : ''}`}
              onClick={() => setActiveTab('favorite')}
            >
              Favorites
            </button>
          </div>
          
          <div className={styles.dateFilters}>
            <div className={styles.dateInputGroup}>
              <label htmlFor="startDate">From:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            
            <div className={styles.dateInputGroup}>
              <label htmlFor="endDate">To:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                min={dateRange.startDate}
              />
            </div>
            
            <button 
              className={styles.clearButton}
              onClick={clearDateFilters}
              disabled={!dateRange.startDate && !dateRange.endDate}
            >
              Clear Dates
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Loading your activity history...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : filteredActivities.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h3>No Activity Found</h3>
            <p>
              {activeTab === 'all' && !dateRange.startDate && !dateRange.endDate
                ? "You don't have any recorded activity yet."
                : "No activity matches your current filters."}
            </p>
            {activeTab !== 'all' || dateRange.startDate || dateRange.endDate ? (
              <button 
                className={styles.clearFiltersButton}
                onClick={() => {
                  setActiveTab('all');
                  clearDateFilters();
                }}
              >
                Clear All Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className={styles.activityList}>
            {filteredActivities.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className={styles.activityContent}>
                  <div className={styles.activityHeader}>
                    <h3>{activity.title}</h3>
                    <span className={styles.activityDate}>{formatDate(activity.date)}</span>
                  </div>
                  
                  <p className={styles.activityDescription}>{activity.description}</p>
                  
                  {activity.details && (
                    <div className={styles.activityDetails}>
                      {activity.type === 'purchase' && (
                        <>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Store:</span>
                            <span className={styles.detailValue}>{activity.details.store}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Order ID:</span>
                            <span className={styles.detailValue}>{activity.details.orderId}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Amount:</span>
                            <span className={styles.detailValue}>${activity.details.amount.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      
                      {activity.type === 'cashback' && (
                        <>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Store:</span>
                            <span className={styles.detailValue}>{activity.details.store}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Amount:</span>
                            <span className={styles.detailValue}>${activity.details.amount.toFixed(2)}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Status:</span>
                            <span className={`${styles.detailValue} ${styles[activity.details.status]}`}>
                              {activity.details.status.charAt(0).toUpperCase() + activity.details.status.slice(1)}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {activity.type === 'coupon' && (
                        <>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Store:</span>
                            <span className={styles.detailValue}>{activity.details.store}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Code:</span>
                            <span className={styles.detailValue}>{activity.details.code}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Discount:</span>
                            <span className={styles.detailValue}>{activity.details.discount}</span>
                          </div>
                        </>
                      )}
                      
                      {activity.type === 'login' && (
                        <>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>IP Address:</span>
                            <span className={styles.detailValue}>{activity.details.ip}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Device:</span>
                            <span className={styles.detailValue}>{activity.details.device}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Location:</span>
                            <span className={styles.detailValue}>{activity.details.location}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {activity.actionUrl && (
                    <div className={styles.activityAction}>
                      <button 
                        className={styles.actionButton}
                        onClick={() => navigate(activity.actionUrl)}
                      >
                        {activity.actionText || 'View Details'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredActivities.length > 20 && (
              <div className={styles.loadMoreContainer}>
                <button className={styles.loadMoreButton}>
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHistoryPage;