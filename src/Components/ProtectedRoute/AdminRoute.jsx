import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loading from '../Loading/Loading';

/**
 * AdminRoute component
 * 
 * A wrapper for routes that should only be accessible to admin users.
 * If the user is not authenticated or not an admin, they will be redirected to the login page.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render if the user is an admin
 * @returns {React.ReactNode} - The protected route
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading, initialized } = useContext(AuthContext);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Check if we have a token in localStorage but auth context hasn't loaded it yet
  const hasToken = !!localStorage.getItem('accessToken');
  const cachedUserProfile = localStorage.getItem('cachedUserProfile');
  let isAdmin = false;
  
  if (cachedUserProfile) {
    try {
      const userData = JSON.parse(cachedUserProfile);
      isAdmin = userData.user && userData.user.role === 'admin';
    } catch (e) {
      console.error('Error parsing cached user profile:', e);
    }
  }
  
  // Show loading indicator while authentication state is being determined
  // But only for a reasonable amount of time
  if ((loading || !initialized) && !loadingTimeout) {
    return <Loading />;
  }
  
  // If we have a token and cached admin profile, but auth context is still loading,
  // allow access to prevent infinite loading
  if (loadingTimeout && hasToken && isAdmin) {
    console.log('Auth context taking too long, using cached admin profile');
    return children;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/admin-login" replace />;
  }
  
  // If authenticated but not admin, redirect to home
  if (isAuthenticated && (!user || user.role !== 'admin') && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated and admin, render the protected content
  return children;
};

export default AdminRoute;