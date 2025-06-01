import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import adminAuthService from '../../services/adminAuthService';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@cashheros.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await adminAuthService.adminLogin(email, password);
      
      // Store tokens in localStorage (this is what the AuthContext uses)
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      
      // Store user data in localStorage for persistence
      // Make sure to store the user object with the correct structure
      const userData = { 
        user: {
          ...result.user,
          role: 'admin' // Explicitly set the role to admin
        } 
      };
      
      localStorage.setItem('cachedUserProfile', JSON.stringify(userData));
      localStorage.setItem('cachedUserProfileTimestamp', Date.now().toString());
      
      // Try to update the AuthContext directly first
      if (auth && auth.dispatch) {
        auth.dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: userData.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          }
        });
        
        // Navigate programmatically after context is updated
        navigate('/admin');
      } else {
        // Fallback to page reload if direct context update fails
        console.log('Direct context update not available, using page reload');
        window.location.href = '/admin';
      }
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

export default AdminLogin;