import React from 'react';
import styles from './FeaturedStores.module.css';

// Importing placeholder images - replace with your actual asset paths
import aliexpress from '../../assets/images/stores/aliexpress.png';
import ebay from '../../assets/images/stores/ebay.png';
import shein from '../../assets/images/stores/shein.png';
import sephora from '../../assets/images/stores/sephora.png';
import udemy from '../../assets/images/stores/udemy.png';
import nike from '../../assets/images/stores/nike.png';

const stores = [
  { name: 'Aliexpress', logo: aliexpress, link: '/stores/aliexpress' },
  { name: 'Ebay', logo: ebay, link: '/stores/ebay' },
  { name: 'Shein', logo: shein, link: '/stores/shein' },
  { name: 'Sephora', logo: sephora, link: '/stores/sephora' },
  { name: 'Udemy', logo: udemy, link: '/stores/udemy' },
  { name: 'Nike', logo: nike, link: '/stores/nike' },
];

export const FeaturedStores = () => {
  return (
    <div className={styles.featuredStores}>
      <div className={styles.storeGrid}>
        {stores.map((store, index) => (
          <a key={index} href={store.link} className={styles.storeCard}>
            <img src={store.logo} alt={`${store.name} logo`} className={styles.storeLogo} />
          </a>
        ))}
      </div>
    </div>
  );
}; 