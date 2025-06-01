// src/pages/AccountPage/AccountPage.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import styles from './AccountPage.module.css';

export const AccountPage = () => {
  const { user } = useContext(AuthContext);

  // Default values (can be fetched from backend or context)
  const approvedRewards = user ? parseFloat(user.balance || '0.00') : 0.00;
  const lifetimeSavings = 0.00; // Placeholder; fetch from backend in production

  return (
    <div className={styles.accountPage}>
      <h1>Account</h1>
      
      <div className={styles.userHeader}>
        <img src="https://via.placeholder.com/50" alt="User Avatar" className={styles.avatar} />
        <div className={styles.userInfo}>
          <h2>Hello, {user?.name || 'User'}!</h2>
          <p>{user?.email || 'user@example.com'}</p>
        </div>
        <div className={styles.rewardsInfo}>
          <span>Approved Rewards</span>
          <span>${approvedRewards.toFixed(2)}</span>
          <span>Lifetime Savings</span>
          <span>${lifetimeSavings.toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.accountSections}>
        <Link to="/rewards" className={styles.accountCard}>
          <img src="/assets/rewards-icon.png" alt="Rewards Icon" className={styles.cardIcon} />
          <h3>My Rewards ></h3>
          <p>Redeem and view your reward activity here.</p>
        </Link>

        <Link to="/profile" className={styles.accountCard}>
          <img src="/assets/profile-icon.png" alt="Profile Icon" className={styles.cardIcon} />
          <h3>Profile ></h3>
          <p>Provide and edit personal details for your account.</p>
        </Link>

        <Link to="/communication-preferences" className={styles.accountCard}>
          <img src="/assets/envelope-icon.png" alt="Communication Icon" className={styles.cardIcon} />
          <h3>Communication Preferences ></h3>
          <p>You can control your email settings here.</p>
        </Link>
      </div>
    </div>
  );
};