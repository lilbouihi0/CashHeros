// src/pages/RewardsPage/RewardsPage.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import styles from './RewardsPage.module.css';

export const RewardsPage = () => {
  const { user } = useContext(AuthContext);

  // Default rewards values (can be fetched from backend or context)
  const approvedRewards = user ? parseFloat(user.balance || '0.00') : 0.00;
  const pendingRewards = 0.00; // Placeholder; fetch from backend in production
  const totalRewards = approvedRewards + pendingRewards;

  return (
    <div className={styles.rewardsPage}>
      <div className={styles.header}>
        <a href="/account" className={styles.backLink}>&lt; Account</a>
        <h1>My Rewards</h1>
      </div>

      <div className={styles.rewardsSummary}>
        <div className={styles.rewardsDetails}>
          <div className={styles.rewardItem}>
            <span className={styles.rewardAmount}>${approvedRewards.toFixed(2)}</span>
            <span className={styles.rewardLabel}>Approved Rewards</span>
            <span className={styles.checkMark}>✓</span>
          </div>
          <div className={styles.rewardItem}>
            <span className={styles.rewardAmount}>${pendingRewards.toFixed(2)}</span>
            <span className={styles.rewardLabel}>Pending Rewards</span>
          </div>
          <div className={styles.totalRewards}>
            <span className={styles.totalAmount}>${totalRewards.toFixed(2)}*</span>
            <span className={styles.totalLabel}>Total Rewards</span>
          </div>
        </div>
        <p className={styles.rewardsNote}>
          A minimum Approved balance of $5.01 is required for a redemption
        </p>
        <p className={styles.disclaimer}>
          *Total Rewards is the sum of Approved and Pending Rewards. Pending Rewards amount is subject to change if a merchant lets us know the order has been changed, canceled, or returned. Need help? Visit the FAQ
        </p>
      </div>

      <div className={styles.personalizedOffers}>
        <h2>Personalized Offers For You</h2>
        <div className={styles.offerCard}>
          <img src="/assets/offer-illustration.png" alt="Offer Illustration" className={styles.offerIllustration} />
          <div className={styles.offerText}>
            <p>Haven’t purchased anything yet?</p>
            <p>Only the best codes and cash back offers from stores you browse and shop on CashHeros.</p>
            <a href="/offers" className={styles.viewOffersButton}>View My Offers</a>
          </div>
        </div>
      </div>

      <div className={styles.rewardsActivity}>
        <h2>My Rewards Activity</h2>
        <p>
          Once a merchant lets us know you made a qualifying purchase, all of your transaction information and history will show up here.
        </p>
      </div>
    </div>
  );
};