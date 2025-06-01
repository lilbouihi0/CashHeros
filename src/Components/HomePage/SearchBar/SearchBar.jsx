import React from 'react';
import styles from "./SearchBar.module.css";

export const SearchBar = () => {
  return (
    <div className={styles.searchContainer}>
      <input type="text" placeholder="Search..." className={styles.searchInput} />
      <button className={styles.searchButton}>Search</button>
    </div>
  );
};