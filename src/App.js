import { Routes, Route, Outlet, useNavigationType, useLocation, useMatches } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import { initializeCsrfToken } from './utils/csrfUtils';
import apiService from './services/api';
// Import our modern Helmet replacement
import ModernHelmet from './Components/HelmetWrapper/ModernHelmet';
import { Navbar } from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer.js';
import ErrorBoundary from './Components/ErrorBoundary';
import UpdateNotification from './Components/UpdateNotification/UpdateNotification';
import SessionExpiryAlert from './Components/SessionExpiryAlert/SessionExpiryAlert';
import OfflineQueueStatus from './Components/OfflineQueueStatus/OfflineQueueStatus';
import NotificationSystem from './Components/Notifications/NotificationSystem';
import RealTimeNotifications from './Components/RealTimeNotifications/RealTimeNotifications';
import PageTransition from './Components/PageTransition/PageTransition';
import AdminRoute from './Components/ProtectedRoute/AdminRoute';
import AIChatbot from './Components/AIChatbot/AIChatbot';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from './services/i18n';

// Lazy load all pages for code splitting
// Using dynamic imports with prefetch and error handling
const HomePage = lazy(() => 
  import(/* webpackChunkName: "home-page" */ './Components/HomePage/HomePage.jsx')
    .then(module => {
      // Handle both default and named exports
      return { default: module.default || module.HomePage };
    })
    .catch(error => {
      console.error('Error loading HomePage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const StoresPage = lazy(() => 
  import(/* webpackChunkName: "stores-page" */ './pages/StoresPage/StoresPage.jsx')
    .then(module => ({ default: module.StoresPage }))
    .catch(error => {
      console.error('Error loading StoresPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const LoginPage = lazy(() => 
  import(/* webpackChunkName: "login-page" */ './pages/LoginPage/LoginPage.jsx')
    .then(module => ({ default: module.LoginPage }))
    .catch(error => {
      console.error('Error loading LoginPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

// Use the modern version by default, fallback to simple version
const CashBackPage = lazy(() => 
  import(/* webpackChunkName: "cashback-page" */ './pages/CashBackPage/CashBackPage.modern.jsx')
    .catch(error => {
      console.error('Error loading CashBackPage.modern:', error);
      return import('./pages/CashBackPage/SimpleCashBackPage.jsx');
    })
);

const BlogPage = lazy(() => 
  import(/* webpackChunkName: "blog-page" */ './pages/BlogPage/BlogPage.jsx')
    .then(module => ({ default: module.BlogPage }))
    .catch(error => {
      console.error('Error loading BlogPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const SignUpPage = lazy(() => 
  import(/* webpackChunkName: "signup-page" */ './pages/SignUpPage/SignUpPage.jsx')
    .then(module => ({ default: module.SignUpPage }))
    .catch(error => {
      console.error('Error loading SignUpPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const StoreDetailPage = lazy(() => 
  import(/* webpackChunkName: "store-detail-page" */ './pages/StoreDetailPage/StoreDetailPage.jsx')
    .then(module => ({ default: module.StoreDetailPage }))
    .catch(error => {
      console.error('Error loading StoreDetailPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const ForgotPasswordPage = lazy(() => 
  import(/* webpackChunkName: "forgot-password-page" */ './pages/ForgotPasswordPage/ForgotPasswordPage.jsx')
    .then(module => ({ default: module.ForgotPasswordPage }))
    .catch(error => {
      console.error('Error loading ForgotPasswordPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const ResetPasswordPage = lazy(() => 
  import(/* webpackChunkName: "reset-password-page" */ './pages/ResetPasswordPage/ResetPasswordPage.jsx')
    .catch(error => {
      console.error('Error loading ResetPasswordPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const VerifyEmailPage = lazy(() => 
  import(/* webpackChunkName: "verify-email-page" */ './pages/VerifyEmailPage/VerifyEmailPage.jsx')
    .catch(error => {
      console.error('Error loading VerifyEmailPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const AboutPage = lazy(() => 
  import(/* webpackChunkName: "about-page" */ './pages/AboutPage/AboutPage.jsx')
    .then(module => ({ default: module.AboutPage }))
    .catch(error => {
      console.error('Error loading AboutPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const CareersPage = lazy(() => 
  import(/* webpackChunkName: "careers-page" */ './pages/CareersPage/CareersPage.jsx')
    .then(module => ({ default: module.CareersPage }))
    .catch(error => {
      console.error('Error loading CareersPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const AccountPage = lazy(() => 
  import(/* webpackChunkName: "account-page" */ './pages/AccountPage/AccountPage.jsx')
    .then(module => ({ default: module.AccountPage }))
    .catch(error => {
      console.error('Error loading AccountPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const RewardsPage = lazy(() => 
  import(/* webpackChunkName: "rewards-page" */ './pages/RewardsPage/RewardsPage.jsx')
    .then(module => ({ default: module.RewardsPage }))
    .catch(error => {
      console.error('Error loading RewardsPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const AdminDashboard = lazy(() => 
  import(/* webpackChunkName: "admin-dashboard" */ './pages/AdminDashboard/AdminDashboard.jsx')
    .catch(error => {
      console.error('Error loading AdminDashboard:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const OffersPage = lazy(() => 
  import(/* webpackChunkName: "offers-page" */ './pages/OffersPage/OffersPage')
    .catch(error => {
      console.error('Error loading OffersPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const NotFound = lazy(() => 
  import(/* webpackChunkName: "not-found" */ './Components/NotFound/NotFound')
    .catch(error => {
      console.error('Error loading NotFound:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

// Import ThemeDemo component from uppercase Components directory
const ThemeDemo = lazy(() => 
  import(/* webpackChunkName: "theme-demo" */ './Components/ThemeDemo')
    .catch(error => {
      console.error('Error loading ThemeDemo:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const AdminLogin = lazy(() => 
  import(/* webpackChunkName: "admin-login" */ './pages/AdminLogin/AdminLogin')
    .catch(error => {
      console.error('Error loading AdminLogin:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const DealsPage = lazy(() => 
  import(/* webpackChunkName: "deals-page" */ './pages/DealsPage/DealsPage')
    .catch(error => {
      console.error('Error loading DealsPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const CategoryPage = lazy(() => 
  import(/* webpackChunkName: "category-page" */ './pages/CategoryPage/CategoryPage')
    .catch(error => {
      console.error('Error loading CategoryPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const CouponsPage = lazy(() => 
  import(/* webpackChunkName: "coupons-page" */ './pages/CouponsPage/CouponsPage.jsx')
    .then(module => {
      // Handle both default and named exports
      return { default: module.default || module.CouponsPage };
    })
    .catch(error => {
      console.error('Error loading CouponsPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

const SearchPage = lazy(() =>
  import(/* webpackChunkName: "search-page" */ './pages/SearchPage/SearchPage.jsx')
    .then(module => ({ default: module.SearchPage }))
    .catch(error => {
      console.error('Error loading SearchPage:', error);
      return import('./Components/ErrorBoundary/FallbackPage');
    })
);

// Components for session management and offline functionality are now implemented

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import { CouponProvider } from './context/CouponContext';
import './App.css';
import './styles/theme.css';
import './styles/responsive.css';

// Enhanced loading component for suspense fallback
const Loading = () => {
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);
  
  // Show a different message if loading takes more than 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDelayedMessage(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="loading-container" aria-live="polite" role="status">
      <div className="loading-spinner"></div>
      <p>{showDelayedMessage 
        ? "Still loading... This might take a moment." 
        : "Loading..."}
      </p>
      {showDelayedMessage && (
        <p className="loading-suggestion">
          If this persists, try refreshing the page.
        </p>
      )}
    </div>
  );
};

// Import the new AppProvider
import { AppProvider } from './context/AppContext';

// Create a combined providers component for better readability
const AppProviders = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      <DataProvider>
        <StoreProvider>
          <CouponProvider>
            <ErrorBoundary>
              <AppProvider>
                {children}
              </AppProvider>
            </ErrorBoundary>
          </CouponProvider>
        </StoreProvider>
      </DataProvider>
    </AuthProvider>
  </ThemeProvider>
);

// Network status indicator
const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <span>You are currently offline. Some features may be limited.</span>
    </div>
  );
};

function App() {
  const { i18n, t } = useTranslation();
  const [dir, setDir] = useState(RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr');
  
  // Initialize CSRF token on app start
  useEffect(() => {
    const initCsrf = async () => {
      try {
        await initializeCsrfToken(apiService.instance);
        console.log('CSRF token initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize CSRF token:', error);
      }
    };
    
    initCsrf();
  }, []);
  
  // Update document direction when language changes
  useEffect(() => {
    const isRtl = RTL_LANGUAGES.includes(i18n.language);
    setDir(isRtl ? 'rtl' : 'ltr');
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const isRtl = RTL_LANGUAGES.includes(event.detail.language);
      setDir(isRtl ? 'rtl' : 'ltr');
    };
    
    document.addEventListener('languageChanged', handleLanguageChange);
    return () => document.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  return (
    <>
      <ModernHelmet>
        <title>{t('app.name')} - {t('app.tagline')}</title>
        <meta name="description" content={t('app.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#34D399" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        <html lang={i18n.language} dir={dir} />
      </ModernHelmet>
      <AppProviders>
        {/* Skip to content link for keyboard users */}
        <a href="#main-content" className="skip-link">
          {t('common.skipToContent')}
        </a>
        
        <NetworkStatusIndicator />
        <Navbar />
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <main id="main-content" className={dir === 'rtl' ? 'rtl-content' : ''}>
              <Routes>
                <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                <Route path="/stores" element={<PageTransition><StoresPage /></PageTransition>} />
                <Route path="/cashback" element={<PageTransition><CashBackPage /></PageTransition>} />
                <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
                <Route path="/stores/:brand" element={<PageTransition><StoreDetailPage /></PageTransition>} />
                <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                <Route path="/signup" element={<PageTransition><SignUpPage /></PageTransition>} />
                <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
                <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
                <Route path="/verify-email" element={<PageTransition><VerifyEmailPage /></PageTransition>} />
                <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
                <Route path="/careers" element={<PageTransition><CareersPage /></PageTransition>} />
                <Route path="/account" element={<PageTransition><AccountPage /></PageTransition>} />
                <Route path="/rewards" element={<PageTransition><RewardsPage /></PageTransition>} />
                <Route path="/offers" element={<PageTransition><OffersPage /></PageTransition>} />
                <Route path="/deals" element={<PageTransition><DealsPage /></PageTransition>} />
                <Route path="/deals/:season" element={<PageTransition><DealsPage /></PageTransition>} />
                <Route path="/category" element={<PageTransition><CategoryPage /></PageTransition>} />
                <Route path="/category/:category" element={<PageTransition><CategoryPage /></PageTransition>} />
                <Route path="/coupons" element={<PageTransition><CouponsPage /></PageTransition>} />
                <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <PageTransition><AdminDashboard /></PageTransition>
                  </AdminRoute>
                } />
                <Route path="/admin-login" element={<PageTransition><AdminLogin /></PageTransition>} />
                <Route path="/theme-demo" element={<PageTransition><ThemeDemo /></PageTransition>} />
                <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
              </Routes>
            </main>
          </Suspense>
        </ErrorBoundary>
        <Footer />
        <UpdateNotification />
        <SessionExpiryAlert />
        <OfflineQueueStatus />
        <NotificationSystem />
        <RealTimeNotifications />
        <AIChatbot />
      </AppProviders>
    </>
  );
}

export default App;
