import React from 'react';
import styles from './CashDesc.module.css';
import img1 from '../../assets/1.jpg';

export const CashDesc = () => {
  return (
    <div className={styles.CashDesc}>
      {/* Repeat 3 times as per your mockup */}
      {[1, 2, 3].map((item) => (
        <div key={item} className={styles.singleCard}>
          <div className={styles.Img}>
            <img src={img1} alt="Cash Back" />
          </div>
          <div className={styles.Text}>
            <b>Cash Back</b>
            <p>So youcan get on with your shopping</p>
          </div>
        </div>
      ))}
    </div>
  );
};