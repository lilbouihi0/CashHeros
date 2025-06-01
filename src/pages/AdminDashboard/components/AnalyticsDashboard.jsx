import React, { useState } from 'react';
import { 
  FaUsers, FaTag, FaMoneyBillWave, FaStore, 
  FaChartLine, FaUserCheck, FaCalendarAlt, FaShoppingCart, FaDollarSign
} from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';

const AnalyticsDashboard = ({ analytics }) => {
  const { accessToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [userActivity, setUserActivity] = useState(null);
  const [couponUsage, setCouponUsage] = useState(null);
  const [cashbackStats, setCashbackStats] = useState(null);
  
  // Create refs for charts
  const userChartRef = useRef(null);
  const couponChartRef = useRef(null);
  const cashbackChartRef = useRef(null);

  useEffect(() => {
    fetchSystemInfo();
    fetchUserActivity();
    fetchCouponUsage();
    fetchCashbackStats();
  }, [accessToken, timeRange]);

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/system', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSystemInfo(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system info:', err);
      setError('Failed to load system information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // State for chart data
  const [userChartData, setUserChartData] = useState(null);
  const [couponChartData, setCouponChartData] = useState(null);
  const [cashbackChartData, setCashbackChartData] = useState(null);

  const fetchUserActivity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/admin/analytics/user-activity?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUserActivity(response.data.data);
      setError(null);
      
      // Create user growth chart after data is loaded
      if (response.data.data) {
        const chartData = createUserGrowthChart(response.data.data);
        setUserChartData(chartData);
      }
    } catch (err) {
      console.error('Error fetching user activity:', err);
      setError('Failed to load user activity data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Prepare user chart data
  const getUserChartData = (data) => {
    // Sample data if API doesn't return time series data
    const labels = data?.timeSeries?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const newUsersData = data?.timeSeries?.newUsers || [65, 59, 80, 81, 56, 55, 40];
    const activeUsersData = data?.timeSeries?.activeUsers || [28, 48, 40, 19, 86, 27, 90];
    
    return {
      labels,
      datasets: [
        {
          label: 'New Users',
          data: newUsersData,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Active Users',
          data: activeUsersData,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };
  
  // User chart options
  const userChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  const createUserGrowthChart = (data) => {
    // No need to manually destroy charts when using react-chartjs-2
    // The component will handle that automatically
    
    // We'll use this data in the render method with the Line component
    return getUserChartData(data);
  };

  const fetchCouponUsage = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/admin/analytics/coupon-usage?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setCouponUsage(response.data.data);
      setError(null);
      
      // Create coupon usage chart after data is loaded
      if (response.data.data) {
        const chartData = createCouponUsageChart(response.data.data);
        setCouponChartData(chartData);
      }
    } catch (err) {
      console.error('Error fetching coupon usage:', err);
      setError('Failed to load coupon usage data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Prepare coupon chart data
  const getCouponChartData = (data) => {
    // Sample data if API doesn't return category data
    const categories = data?.categories?.labels || ['Electronics', 'Fashion', 'Home', 'Beauty', 'Food', 'Travel'];
    const usageData = data?.categories?.values || [65, 59, 80, 81, 56, 55];
    
    return {
      labels: categories,
      datasets: [
        {
          label: 'Coupon Redemptions by Category',
          data: usageData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Coupon chart options
  const couponChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  const createCouponUsageChart = (data) => {
    // We'll use this data in the render method with the Bar component
    return getCouponChartData(data);
  };

  const fetchCashbackStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/admin/analytics/cashback-stats?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setCashbackStats(response.data.data);
      setError(null);
      
      // Create cashback stats chart after data is loaded
      if (response.data.data) {
        const chartData = createCashbackStatsChart(response.data.data);
        setCashbackChartData(chartData);
      }
    } catch (err) {
      console.error('Error fetching cashback stats:', err);
      setError('Failed to load cashback statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Prepare cashback chart data
  const getCashbackChartData = (data) => {
    // Sample data for doughnut chart
    return {
      labels: ['Electronics', 'Fashion', 'Home', 'Beauty', 'Food', 'Travel'],
      datasets: [
        {
          label: 'Cashback by Category',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Cashback chart options
  const cashbackChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };
  
  const createCashbackStatsChart = (data) => {
    // We'll use this data in the render method with the Pie component
    return getCashbackChartData(data);
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
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
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaUsers /></div>
          <div className={styles.statValue}>{analytics.users.total}</div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaUserCheck /></div>
          <div className={styles.statValue}>{analytics.users.active}</div>
          <div className={styles.statLabel}>Active Users</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaCalendarAlt /></div>
          <div className={styles.statValue}>{analytics.users.newThisMonth}</div>
          <div className={styles.statLabel}>New This Month</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaTag /></div>
          <div className={styles.statValue}>{analytics.content.coupons}</div>
          <div className={styles.statLabel}>Total Coupons</div>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>User Growth</h2>
        </div>
        <div className={styles.cardBody}>
          {userActivity ? (
            <div className={styles.chartContainer}>
              <div className={styles.chartStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{userActivity.newUsers}</span>
                  <span className={styles.statLabel}>New Users</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{userActivity.activeUsers}</span>
                  <span className={styles.statLabel}>Active Users</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{userActivity.returningUsers}</span>
                  <span className={styles.statLabel}>Returning Users</span>
                </div>
              </div>
              <div className={styles.chartWrapper}>
                <Line 
                  ref={userChartRef}
                  data={getUserChartData(userActivity)} 
                  options={userChartOptions} 
                  height={300}
                />
              </div>
            </div>
          ) : (
            <div className={styles.loadingContainer}>
              <div className={styles.loader}></div>
              <p>Loading user activity data...</p>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.row}>
        <div className={styles.column}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Coupon Usage</h2>
            </div>
            <div className={styles.cardBody}>
              {couponUsage ? (
                <div className={styles.chartContainer}>
                  <div className={styles.chartStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{couponUsage.totalRedemptions}</span>
                      <span className={styles.statLabel}>Total Redemptions</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{couponUsage.mostPopularCoupon}</span>
                      <span className={styles.statLabel}>Most Popular</span>
                    </div>
                  </div>
                  <div className={styles.chartWrapper}>
                    <Bar 
                      ref={couponChartRef}
                      data={getCouponChartData(couponUsage)} 
                      options={couponChartOptions} 
                      height={250}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.loadingContainer}>
                  <div className={styles.loader}></div>
                  <p>Loading coupon data...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.column}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Cashback Statistics</h2>
            </div>
            <div className={styles.cardBody}>
              {cashbackStats ? (
                <div className={styles.chartContainer}>
                  <div className={styles.chartStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>${cashbackStats.totalCashback}</span>
                      <span className={styles.statLabel}>Total Cashback</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>${cashbackStats.averageCashback}</span>
                      <span className={styles.statLabel}>Average Cashback</span>
                    </div>
                  </div>
                  <div className={styles.chartWrapper}>
                    <Pie 
                      ref={cashbackChartRef}
                      data={getCashbackChartData(cashbackStats)} 
                      options={cashbackChartOptions} 
                      height={250}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.loadingContainer}>
                  <div className={styles.loader}></div>
                  <p>Loading cashback data...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Top Performing Stores</h2>
        </div>
        <div className={styles.cardBody}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Store</th>
                <th>Coupon Redemptions</th>
                <th>Cashback Generated</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {/* This would be populated with real data in a production environment */}
              <tr>
                <td>Amazon</td>
                <td>1,245</td>
                <td>$3,782.50</td>
                <td>$75,650.00</td>
              </tr>
              <tr>
                <td>Walmart</td>
                <td>987</td>
                <td>$2,961.00</td>
                <td>$59,220.00</td>
              </tr>
              <tr>
                <td>Target</td>
                <td>856</td>
                <td>$2,568.00</td>
                <td>$51,360.00</td>
              </tr>
              <tr>
                <td>Best Buy</td>
                <td>743</td>
                <td>$1,857.50</td>
                <td>$37,150.00</td>
              </tr>
              <tr>
                <td>Nike</td>
                <td>621</td>
                <td>$3,105.00</td>
                <td>$38,812.50</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>System Information</h2>
        </div>
        <div className={styles.cardBody}>
          {systemInfo ? (
            <div className={styles.systemInfoGrid}>
              <div className={styles.systemInfoItem}>
                <strong>Node Version:</strong> {systemInfo.nodeVersion}
              </div>
              <div className={styles.systemInfoItem}>
                <strong>Uptime:</strong> {Math.floor(systemInfo.uptime / 3600)} hours, {Math.floor((systemInfo.uptime % 3600) / 60)} minutes
              </div>
              <div className={styles.systemInfoItem}>
                <strong>Platform:</strong> {systemInfo.platform}
              </div>
              <div className={styles.systemInfoItem}>
                <strong>Architecture:</strong> {systemInfo.arch}
              </div>
              <div className={styles.systemInfoItem}>
                <strong>Memory Usage:</strong> {Math.round(systemInfo.memoryUsage.heapUsed / 1024 / 1024)} MB / {Math.round(systemInfo.memoryUsage.heapTotal / 1024 / 1024)} MB
              </div>
            </div>
          ) : (
            <div className={styles.loadingContainer}>
              <div className={styles.loader}></div>
              <p>Loading system information...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;