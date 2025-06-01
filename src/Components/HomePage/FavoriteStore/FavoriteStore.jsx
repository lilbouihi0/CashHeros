import React from 'react';
import styles from '../Fave/Fave.module.css'; // Reuse the existing CSS
import placeholderImage from '../../assets/placeholder.js';

// Simple functional component
function FavoriteStore({ percent }) {
  return (
    <div className={styles.Faves}>
      <div className={styles.Img}>
        <img src={placeholderImage} alt="Favorite Store" />
      </div>
      <div className={styles.Text}>
        <b className={styles.Percent}>{percent}% Cash Back</b>
      </div>
    </div>
  );
}

export default FavoriteStore;