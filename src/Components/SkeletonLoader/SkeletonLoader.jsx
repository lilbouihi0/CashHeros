import React from 'react';
import styles from './SkeletonLoader.module.css';

const SkeletonLoader = ({ type, count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return <div className={`${styles.skeleton} ${styles.text} ${className}`}></div>;
      
      case 'title':
        return <div className={`${styles.skeleton} ${styles.title} ${className}`}></div>;
      
      case 'avatar':
        return <div className={`${styles.skeleton} ${styles.avatar} ${className}`}></div>;
      
      case 'thumbnail':
        return <div className={`${styles.skeleton} ${styles.thumbnail} ${className}`}></div>;
      
      case 'card':
        return (
          <div className={`${styles.card} ${className}`}>
            <div className={`${styles.skeleton} ${styles.thumbnail}`}></div>
            <div className={`${styles.skeleton} ${styles.title}`}></div>
            <div className={`${styles.skeleton} ${styles.text}`}></div>
            <div className={`${styles.skeleton} ${styles.text}`}></div>
          </div>
        );
      
      case 'table-row':
        return (
          <div className={`${styles.tableRow} ${className}`}>
            <div className={`${styles.skeleton} ${styles.cell}`}></div>
            <div className={`${styles.skeleton} ${styles.cell}`}></div>
            <div className={`${styles.skeleton} ${styles.cell}`}></div>
            <div className={`${styles.skeleton} ${styles.cell}`}></div>
          </div>
        );
      
      case 'stats':
        return (
          <div className={`${styles.stats} ${className}`}>
            <div className={`${styles.skeleton} ${styles.statIcon}`}></div>
            <div className={`${styles.skeleton} ${styles.statValue}`}></div>
            <div className={`${styles.skeleton} ${styles.statLabel}`}></div>
          </div>
        );
      
      default:
        return <div className={`${styles.skeleton} ${className}`}></div>;
    }
  };

  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={index} className={styles.skeletonWrapper}>
            {renderSkeleton()}
          </div>
        ))}
    </>
  );
};

export default SkeletonLoader;