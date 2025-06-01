import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminLogin.module.css';

const DirectAdminLogin = () => {
  const [email, setEmail] = useState('admin@cashheros.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if using admin credentials
      const isAdmin = email === 'admin@cashheros.com' && password === 'admin123';
      
      if (!isAdmin) {
        throw new Error('Invalid admin credentials');
      }
      
      // Generate mock tokens
      const mockAccessToken = 'mock_admin_access_' + Math.random().toString(36).substring(2, 15);
      const mockRefreshToken = 'mock_admin_refresh_' + Math.random().toString(36).substring(2, 15);
      
      // Create mock admin user
      const adminUser = {
        id: 'admin1',
        email: email,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', mockAccessToken);
      localStorage.setItem('refreshToken', mockRefreshToken);
      
      // Store admin user data in localStorage
      localStorage.setItem('cachedUserProfile', JSON.stringify({ user: adminUser }));
      localStorage.setItem('cachedUserProfileTimestamp', Date.now().toString());
      
      // Wait a moment to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force page reload to update the auth state from localStorage
      window.location.href = '/admin';
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminLoginContainer}>
      <div className={styles.adminLoginCard}>
        <h1>Admin Login</h1>
        <p>Enter your admin credentials to access the dashboard</p>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>
        
        <div className={styles.helpText}>
          <p>Default admin credentials:</p>
          <p>Email: admin@cashheros.com</p>
          <p>Password: admin123</p>
          <hr />
          <p><strong>Regular user accounts:</strong></p>
          <p>Email: user@example.com</p>
          <p>Password: password123</p>
          <p>- or -</p>
          <p>Email: test@cashheros.com</p>
          <p>Password: test123</p>
        </div>
      </div>
    </div>
  );
};

export default DirectAdminLogin;