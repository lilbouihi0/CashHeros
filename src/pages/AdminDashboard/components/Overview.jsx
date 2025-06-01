import React from 'react';
import { FaUsers, FaTag, FaMoneyBillWave, FaBlog, FaStore, FaChartLine, FaDollarSign } from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';

const Overview = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      <h1>Dashboard Overview</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaUsers /></div>
          <div className={styles.statValue}>
            {analytics.summary && typeof analytics.summary.totalUsers === 'number' 
              ? analytics.summary.totalUsers.toLocaleString() 
              : '0'}
          </div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaTag /></div>
          <div className={styles.statValue}>
            {analytics.summary && typeof analytics.summary.activeCoupons === 'number' 
              ? analytics.summary.activeCoupons.toLocaleString() 
              : '0'}
          </div>
          <div className={styles.statLabel}>Active Coupons</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaStore /></div>
          <div className={styles.statValue}>
            {analytics.summary && typeof analytics.summary.totalStores === 'number' 
              ? analytics.summary.totalStores.toLocaleString() 
              : '0'}
          </div>
          <div className={styles.statLabel}>Total Stores</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaDollarSign /></div>
          <div className={styles.statValue}>
            {analytics.summary && typeof analytics.summary.totalCashback === 'number' 
              ? formatCurrency(analytics.summary.totalCashback) 
              : '$0'}
          </div>
          <div className={styles.statLabel}>Total Cashback</div>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Recent Activity</h2>
        </div>
        <div className={styles.cardBody}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>User</th>
                <th>Details</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentActivity && analytics.recentActivity.map((activity, index) => (
                <tr key={index}>
                  <td>{activity.type ? activity.type.replace('_', ' ') : 'Unknown'}</td>
                  <td>{activity.user || 'Unknown User'}</td>
                  <td>{activity.details || 'No details'}</td>
                  <td>{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Unknown time'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Popular Stores</h2>
        </div>
        <div className={styles.cardBody}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Store</th>
                <th>Visits</th>
              </tr>
            </thead>
            <tbody>
              {analytics.popularStores && analytics.popularStores.map((store, index) => (
                <tr key={index}>
                  <td>{store.name || 'Unknown Store'}</td>
                  <td>{(store.visits || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>User Statistics</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {analytics.userStats && analytics.userStats.newUsers && typeof analytics.userStats.newUsers.thisMonth === 'number'
                  ? analytics.userStats.newUsers.thisMonth.toLocaleString()
                  : '0'}
              </div>
              <div className={styles.statLabel}>New This Month</div>
              <div className={styles.statChange}>
                {analytics.userStats && analytics.userStats.newUsers && typeof analytics.userStats.newUsers.percentChange === 'number'
                  ? (analytics.userStats.newUsers.percentChange > 0 ? '+' : '') + analytics.userStats.newUsers.percentChange
                  : '0'}% vs last month
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {analytics.userStats && analytics.userStats.activeUsers && typeof analytics.userStats.activeUsers.thisMonth === 'number'
                  ? analytics.userStats.activeUsers.thisMonth.toLocaleString()
                  : '0'}
              </div>
              <div className={styles.statLabel}>Active Users</div>
              <div className={styles.statChange}>
                {analytics.userStats && analytics.userStats.activeUsers && typeof analytics.userStats.activeUsers.percentChange === 'number'
                  ? (analytics.userStats.activeUsers.percentChange > 0 ? '+' : '') + analytics.userStats.activeUsers.percentChange
                  : '0'}% vs last month
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {analytics.userStats && analytics.userStats.verifiedUsers && typeof analytics.userStats.verifiedUsers.thisMonth === 'number'
                  ? analytics.userStats.verifiedUsers.thisMonth.toLocaleString()
                  : '0'}
              </div>
              <div className={styles.statLabel}>Verified Users</div>
              <div className={styles.statChange}>
                {analytics.userStats && analytics.userStats.verifiedUsers && typeof analytics.userStats.verifiedUsers.percentChange === 'number'
                  ? (analytics.userStats.verifiedUsers.percentChange > 0 ? '+' : '') + analytics.userStats.verifiedUsers.percentChange
                  : '0'}% vs last month
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {analytics.summary && typeof analytics.summary.activeUsers === 'number'
                  ? analytics.summary.activeUsers.toLocaleString()
                  : '0'}
              </div>
              <div className={styles.statLabel}>Total Active Users</div>
              <div className={styles.statChange}>
                {analytics.summary && typeof analytics.summary.activeUsers === 'number' && typeof analytics.summary.totalUsers === 'number' && analytics.summary.totalUsers > 0
                  ? Math.round((analytics.summary.activeUsers / analytics.summary.totalUsers) * 100)
                  : '0'}% of total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;