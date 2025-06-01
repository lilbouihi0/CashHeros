import React from 'react';
import styles from './Fave.module.css';
import placeholderImage from '../../assets/placeholder.js';

// Simple functional component with only default export
function Fave({ percent }) {
  return (
    <div className={styles.Faves}>
      <div className={styles.Img}>
        <img src={placeholderImage} alt="Fave" />
      </div>
      <div className={styles.Text}>
        <b className={styles.Percent}>{percent}% Cash Back</b>
      </div>
    </div>
  );
}

export default Fave;