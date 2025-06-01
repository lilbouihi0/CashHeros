import React, { useState } from 'react';
import { 
  FaUsers, FaTag, FaMoneyBillWave, FaStore, 
  FaChartLine, FaUserCheck, FaCalendarAlt, FaShoppingCart, FaDollarSign
} from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';

const SimpleAnalyticsDashboard = ({ analytics }) => {
  const [timeRange, setTimeRange] = useState('month');

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!analytics) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cardHeader}>
        <h1>Analytics Dashboard</h1>
        <div className={styles.timeRangeSelector}>
          <label htmlFor="timeRange">Time Range:</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={handleTimeRangeChange}
            className={styles.formControl}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      
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
          <div className={styles.statIcon}><FaUserCheck /></div>
          <div className={styles.statValue}>
            {analytics.summary && typeof analytics.summary.activeUsers === 'number' 
              ? analytics.summary.activeUsers.toLocaleString() 
              : '0'}
          </div>
          <div className={styles.statLabel}>Active Users</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaTag /></div>
          <div className={styles.statValue}>
            {analytics.summary && typeof analytics.summary.totalCoupons === 'number' 
              ? analytics.summary.totalCoupons.toLocaleString() 
              : '0'}
          </div>
          <div className={styles.statLabel}>Total Coupons</div>
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
          </div>
        </div>
      </div>
      
      <div className={styles.row}>
        <div className={styles.column}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Coupon Statistics</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {analytics.couponStats && analytics.couponStats.newCoupons && typeof analytics.couponStats.newCoupons.thisMonth === 'number'
                      ? analytics.couponStats.newCoupons.thisMonth.toLocaleString()
                      : '0'}
                  </div>
                  <div className={styles.statLabel}>New Coupons</div>
                  <div className={styles.statChange}>
                    {analytics.couponStats && analytics.couponStats.newCoupons && typeof analytics.couponStats.newCoupons.percentChange === 'number'
                      ? (analytics.couponStats.newCoupons.percentChange > 0 ? '+' : '') + analytics.couponStats.newCoupons.percentChange
                      : '0'}% vs last month
                  </div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {analytics.couponStats && analytics.couponStats.expiredCoupons && typeof analytics.couponStats.expiredCoupons.thisMonth === 'number'
                      ? analytics.couponStats.expiredCoupons.thisMonth.toLocaleString()
                      : '0'}
                  </div>
                  <div className={styles.statLabel}>Expired Coupons</div>
                  <div className={styles.statChange}>
                    {analytics.couponStats && analytics.couponStats.expiredCoupons && typeof analytics.couponStats.expiredCoupons.percentChange === 'number'
                      ? (analytics.couponStats.expiredCoupons.percentChange > 0 ? '+' : '') + analytics.couponStats.expiredCoupons.percentChange
                      : '0'}% vs last month
                  </div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {analytics.couponStats && analytics.couponStats.redemptions && typeof analytics.couponStats.redemptions.thisMonth === 'number'
                      ? analytics.couponStats.redemptions.thisMonth.toLocaleString()
                      : '0'}
                  </div>
                  <div className={styles.statLabel}>Redemptions</div>
                  <div className={styles.statChange}>
                    {analytics.couponStats && analytics.couponStats.redemptions && typeof analytics.couponStats.redemptions.percentChange === 'number'
                      ? (analytics.couponStats.redemptions.percentChange > 0 ? '+' : '') + analytics.couponStats.redemptions.percentChange
                      : '0'}% vs last month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.column}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Cashback Statistics</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {analytics.cashbackStats && analytics.cashbackStats.pendingCashback && typeof analytics.cashbackStats.pendingCashback.thisMonth === 'number'
                      ? formatCurrency(analytics.cashbackStats.pendingCashback.thisMonth)
                      : '$0'}
                  </div>
                  <div className={styles.statLabel}>Pending Cashback</div>
                  <div className={styles.statChange}>
                    {analytics.cashbackStats && analytics.cashbackStats.pendingCashback && typeof analytics.cashbackStats.pendingCashback.percentChange === 'number'
                      ? (analytics.cashbackStats.pendingCashback.percentChange > 0 ? '+' : '') + analytics.cashbackStats.pendingCashback.percentChange
                      : '0'}% vs last month
                  </div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {analytics.cashbackStats && analytics.cashbackStats.approvedCashback && typeof analytics.cashbackStats.approvedCashback.thisMonth === 'number'
                      ? formatCurrency(analytics.cashbackStats.approvedCashback.thisMonth)
                      : '$0'}
                  </div>
                  <div className={styles.statLabel}>Approved Cashback</div>
                  <div className={styles.statChange}>
                    {analytics.cashbackStats && analytics.cashbackStats.approvedCashback && typeof analytics.cashbackStats.approvedCashback.percentChange === 'number'
                      ? (analytics.cashbackStats.approvedCashback.percentChange > 0 ? '+' : '') + analytics.cashbackStats.approvedCashback.percentChange
                      : '0'}% vs last month
                  </div>
                </div>
                
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {analytics.cashbackStats && analytics.cashbackStats.rejectedCashback && typeof analytics.cashbackStats.rejectedCashback.thisMonth === 'number'
                      ? formatCurrency(analytics.cashbackStats.rejectedCashback.thisMonth)
                      : '$0'}
                  </div>
                  <div className={styles.statLabel}>Rejected Cashback</div>
                  <div className={styles.statChange}>
                    {analytics.cashbackStats && analytics.cashbackStats.rejectedCashback && typeof analytics.cashbackStats.rejectedCashback.percentChange === 'number'
                      ? (analytics.cashbackStats.rejectedCashback.percentChange > 0 ? '+' : '') + analytics.cashbackStats.rejectedCashback.percentChange
                      : '0'}% vs last month
                  </div>
                </div>
              </div>
            </div>
          </div>
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
          <h2>Popular Coupons</h2>
        </div>
        <div className={styles.cardBody}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Store</th>
                <th>Discount</th>
                <th>Uses</th>
              </tr>
            </thead>
            <tbody>
              {analytics.popularCoupons && analytics.popularCoupons.map((coupon, index) => (
                <tr key={index}>
                  <td>{coupon.store || 'Unknown Store'}</td>
                  <td>{coupon.discount || 'N/A'}</td>
                  <td>{(coupon.uses || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SimpleAnalyticsDashboard;