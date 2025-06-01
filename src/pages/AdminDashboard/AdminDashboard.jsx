import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import { 
  FaUsers, FaTag, FaMoneyBillWave, FaStore, FaBlog, 
  FaChartLine, FaFileAlt, FaBars, FaTimes, FaRobot
} from 'react-icons/fa';
import ThemeToggle from '../../Components/ThemeToggle/ThemeToggle';
import SkeletonLoader from '../../Components/SkeletonLoader/SkeletonLoader';
import styles from './AdminDashboard.module.css';

// Admin Dashboard Components
import CouponManagement from './components/CouponManagement';
import CashbackManagement from './components/CashbackManagement';
import StoreManagement from './components/StoreManagement';
import UserManagement from './components/UserManagement';
import BlogManagement from './components/BlogManagement';
import SimpleAnalyticsDashboard from './components/SimpleAnalyticsDashboard';
import AIAnalyticsDashboard from './components/AIAnalyticsDashboard';
import ReportingTools from './components/ReportingTools';
import Overview from './components/Overview';

// Import theme CSS
import '../../styles/theme.css';

const AdminDashboard = () => {
  const { user, accessToken } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  // Memoize the handleKeyDown function to avoid dependency cycles
  const handleKeyDown = useCallback((e) => {
    // Handle keyboard navigation
    if (e.altKey) {
      switch (e.key) {
        case '1':
          setActiveSection('overview');
          break;
        case '2':
          setActiveSection('coupons');
          break;
        case '3':
          setActiveSection('cashbacks');
          break;
        case '4':
          setActiveSection('stores');
          break;
        case '5':
          setActiveSection('users');
          break;
        case '6':
          setActiveSection('blogs');
          break;
        case '7':
          setActiveSection('analytics');
          break;
        case '8':
          setActiveSection('reports');
          break;
        default:
          break;
      }
    }
  }, [setActiveSection]);

  // Memoize the fetchAnalytics function to avoid dependency cycles
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      // Use the mock admin service instead of making a real API call
      const response = await adminService.getAnalytics();
      // Extract the data property from the response
      if (response && response.data) {
        setAnalytics(response.data);
        setError(null);
      } else {
        throw new Error('Invalid analytics data format');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch initial analytics data
    fetchAnalytics();

    // Add event listener for keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accessToken, fetchAnalytics, handleKeyDown]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Close sidebar on mobile after section change
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
    // Focus on content for screen readers
    if (contentRef.current) {
      contentRef.current.focus();
    }
  };

  const renderActiveSection = () => {
    // Check if analytics is available
    if (activeSection === 'analytics' || activeSection === 'overview' || activeSection === 'ai-analytics') {
      if (!analytics) {
        return (
          <div className={styles.loadingContainer}>
            <div className={styles.loader} aria-hidden="true"></div>
            <p>Loading analytics data...</p>
          </div>
        );
      }
    }

    switch (activeSection) {
      case 'coupons':
        return <CouponManagement />;
      case 'cashbacks':
        return <CashbackManagement />;
      case 'stores':
        return <StoreManagement />;
      case 'users':
        return <UserManagement />;
      case 'blogs':
        return <BlogManagement />;
      case 'analytics':
        return <SimpleAnalyticsDashboard analytics={analytics} />;
      case 'ai-analytics':
        return <AIAnalyticsDashboard analytics={analytics} />;
      case 'reports':
        return <ReportingTools />;
      case 'overview':
      default:
        return <Overview analytics={analytics} />;
    }
  };

  // Add a timeout to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Set up the loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If loading takes too long, try to fetch analytics directly
  useEffect(() => {
    if (loadingTimeout && !analytics) {
      console.log('Loading timeout reached, fetching analytics directly');
      fetchAnalytics();
    }
  }, [loadingTimeout, analytics, fetchAnalytics]);

  // Show loading state
  if (loading && !analytics && !loadingTimeout) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader} aria-hidden="true"></div>
        <p>Loading admin dashboard...</p>
        <div className={styles.skeletonContainer}>
          <SkeletonLoader type="stats" count={4} />
          <SkeletonLoader type="card" count={2} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      
      <div className={styles.adminDashboard} data-theme={theme}>
        {/* Sidebar overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.open : ''}`}
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}
        
        {/* Sidebar */}
        <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
          <div className={styles.sidebarHeader}>
            <h2>Admin Panel</h2>
            <p>{user?.email}</p>
            <ThemeToggle />
          </div>
          
          <nav className={styles.sidebarNav} aria-label="Admin navigation">
            <button 
              className={`${styles.navButton} ${activeSection === 'overview' ? styles.active : ''}`}
              onClick={() => handleSectionChange('overview')}
              aria-current={activeSection === 'overview' ? 'page' : undefined}
              aria-label="Overview"
              title="Overview (Alt+1)"
            >
              <FaChartLine aria-hidden="true" /> Overview
            </button>
            
            <button 
              className={`${styles.navButton} ${activeSection === 'coupons' ? styles.active : ''}`}
              onClick={() => handleSectionChange('coupons')}
              aria-current={activeSection === 'coupons' ? 'page' : undefined}
              aria-label="Coupon Management"
              title="Coupon Management (Alt+2)"
            >
              <FaTag aria-hidden="true" /> Coupon Management
            </button>
            
            <button 
              className={`${styles.navButton} ${activeSection === 'cashbacks' ? styles.active : ''}`}
              onClick={() => handleSectionChange('cashbacks')}
              aria-current={activeSection === 'cashbacks' ? 'page' : undefined}
              aria-label="Cashback Management"
              title="Cashback Management (Alt+3)"
            >
              <FaMoneyBillWave aria-hidden="true" /> Cashback Management
            </button>
            
            <button 
              className={`${styles.navButton} ${activeSection === 'stores' ? styles.active : ''}`}
              onClick={() => handleSectionChange('stores')}
              aria-current={activeSection === 'stores' ? 'page' : undefined}
              aria-label="Store Management"
              title="Store Management (Alt+4)"
            >
              <FaStore aria-hidden="true" /> Store Management
            </button>
            
            <button 
              className={`${styles.navButton} ${activeSection === 'users' ? styles.active : ''}`}
              onClick={() => handleSectionChange('users')}
              aria-current={activeSection === 'users' ? 'page' : undefined}
              aria-label="User Management"
              title="User Management (Alt+5)"
            >
              <FaUsers aria-hidden="true" /> User Management
            </button>
            
            <button 
              className={`${styles.navButton} ${activeSection === 'blogs' ? styles.active : ''}`}
              onClick={() => handleSectionChange('blogs')}
              aria-current={activeSection === 'blogs' ? 'page' : undefined}
              aria-label="Blog Management"
              title="Blog Management (Alt+6)"
            >
              <FaBlog aria-hidden="true" /> Blog Management
            </button>
            
            <button 
              className={`${styles.navButton} ${activeSection === 'analytics' ? styles.active : ''}`}
              onClick={() => handleSectionChange('analytics')}
              aria-current={activeSection === 'analytics' ? 'page' : undefined}
              aria-label="Analytics Dashboard"
              title="Analytics Dashboard (Alt+7)"
            >
              <FaChartLine aria-hidden="true" /> Analytics Dashboard
            </button>
            
            <button 
              className={`${styles.navButton} ${activeSection === 'ai-analytics' ? styles.active : ''}`}
              onClick={() => handleSectionChange('ai-analytics')}
              aria-current={activeSection === 'ai-analytics' ? 'page' : undefined}
              aria-label="AI Analytics"
              title="AI Analytics Dashboard"
            >
              <FaRobot aria-hidden="true" /> AI Analytics
            </button>
            
            <button 
              className={`${styles.navButton} ${activeSection === 'reports' ? styles.active : ''}`}
              onClick={() => handleSectionChange('reports')}
              aria-current={activeSection === 'reports' ? 'page' : undefined}
              aria-label="Reporting Tools"
              title="Reporting Tools (Alt+8)"
            >
              <FaFileAlt aria-hidden="true" /> Reporting Tools
            </button>
          </nav>
        </div>
        
        {/* Mobile sidebar toggle button */}
        <button 
          className={styles.sidebarToggle}
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        {/* Main content */}
        <div 
          id="main-content" 
          className={styles.content} 
          ref={contentRef}
          tabIndex="-1"
          role="main"
          aria-label={`${activeSection} section`}
        >
          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}
          {renderActiveSection()}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
