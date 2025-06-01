import React from 'react';
import styles from './ForgotPasswordPage.module.css';

export const ForgotPasswordPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('If an account with that email exists, you will receive password reset instructions shortly.');
  };

  return (
    <div className={styles.forgotPasswordPage}>
      <h1>Reset Your Password</h1>
      <p>Enter your email address below and we’ll send instructions to reset it.</p>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" placeholder="Email Address" aria-label="Email Address" required />
        </div>
        <button type="submit">Send Instructions</button>
      </form>
    </div>
  );
};