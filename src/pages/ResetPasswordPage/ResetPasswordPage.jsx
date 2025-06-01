import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ResetPasswordPage.module.css';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Reset token is missing. Please request a new password reset link.');
      return;
    }
    
    setStatus('loading');
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );
      
      setStatus('success');
      setMessage(response.data.message || 'Your password has been successfully reset!');
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Failed to reset your password. The token may be invalid or expired.'
      );
    }
  };
  
  const handleGoToLogin = () => {
    navigate('/login');
  };
  
  const handleGoToForgotPassword = () => {
    navigate('/forgot-password');
  };
  
  if (status === 'success') {
    return (
      <div className={styles.resetPasswordContainer}>
        <div className={styles.resetPasswordCard}>
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.title}>Password Reset Successful</h1>
            <p className={styles.message}>{message}</p>
            <button 
              className={styles.primaryButton} 
              onClick={handleGoToLogin}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className={styles.resetPasswordContainer}>
        <div className={styles.resetPasswordCard}>
          <div className={styles.error}>
            <div className={styles.errorIcon}>✗</div>
            <h1 className={styles.title}>Password Reset Failed</h1>
            <p className={styles.message}>{message}</p>
            <button 
              className={styles.primaryButton} 
              onClick={handleGoToForgotPassword}
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.resetPasswordContainer}>
      <div className={styles.resetPasswordCard}>
        <h1 className={styles.title}>Reset Your Password</h1>
        <p className={styles.subtitle}>Please enter your new password below</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Enter your new password"
            />
            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword}</p>}
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <span className={styles.spinnerSmall}></span>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;