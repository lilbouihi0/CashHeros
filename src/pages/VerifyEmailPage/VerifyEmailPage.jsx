import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import styles from './VerifyEmailPage.module.css';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyEmail = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }
      
      try {
        const response = await axios.get(buildApiUrl(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}/${token}`));
        setStatus('success');
        setMessage(response.data.message || 'Your email has been successfully verified!');
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Failed to verify your email. The token may be invalid or expired.'
        );
      }
    };
    
    verifyEmail();
  }, [location]);
  
  const handleGoToLogin = () => {
    navigate('/login');
  };
  
  const handleGoToHome = () => {
    navigate('/');
  };
  
  return (
    <div className={styles.verifyEmailContainer}>
      <div className={styles.verifyEmailCard}>
        <h1 className={styles.title}>Email Verification</h1>
        
        {status === 'verifying' && (
          <div className={styles.verifying}>
            <div className={styles.spinner}></div>
            <p>Verifying your email address...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <p className={styles.message}>{message}</p>
            <button 
              className={styles.primaryButton} 
              onClick={handleGoToLogin}
            >
              Go to Login
            </button>
          </div>
        )}
        
        {status === 'error' && (
          <div className={styles.error}>
            <div className={styles.errorIcon}>✗</div>
            <p className={styles.message}>{message}</p>
            <button 
              className={styles.secondaryButton} 
              onClick={handleGoToHome}
            >
              Go to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;