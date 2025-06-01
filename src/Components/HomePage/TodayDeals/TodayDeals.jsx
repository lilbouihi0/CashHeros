import React from 'react';
import styles from './TodayTopDeals.module.css';
import img1 from '../../assets/1.jpg';

export const TodayDeals = ({ promo, title }) => {
  return (
    <div className={styles.Card}>
      <div className={styles.Image}>
        <img src={img1} alt="Deal" />
      </div>
      <div className={styles.Details}>
        <h5 className={styles.promo}>{promo} OFF</h5>
        <div className={styles.Title}>{title}</div>
        <div className={styles.Link}>
          <button>Check Price</button>
        </div>
      </div>
    </div>
  );
};