import React from 'react';
import PropTypes from 'prop-types';
import styles from './Skeleton.module.css';

/**
 * Skeleton loader component for showing loading states
 */
const Skeleton = ({
  type = 'text',
  width,
  height,
  count = 1,
  className = '',
  circle = false,
  animation = 'pulse',
  ...props
}) => {
  // Generate skeleton classes
  const skeletonClasses = `
    ${styles.skeleton}
    ${styles[type]}
    ${circle ? styles.circle : ''}
    ${styles[animation]}
    ${className}
  `;

  // Create skeleton items based on count
  const items = Array(count).fill(0).map((_, index) => (
    <div
      key={index}
      className={skeletonClasses}
      style={{
        width: width || undefined,
        height: height || undefined,
        ...(type === 'custom' && { borderRadius: circle ? '50%' : '0.375rem' })
      }}
      {...props}
    />
  ));

  // Render different skeleton types
  switch (type) {
    case 'avatar':
      return (
        <div className={styles.avatar} style={{ width, height }}>
          {items}
        </div>
      );
    case 'button':
      return (
        <div className={styles.button} style={{ width, height }}>
          {items}
        </div>
      );
    case 'card':
      return (
        <div className={styles.card} style={{ width, height }}>
          <div className={styles.cardHeader}>
            <div className={`${styles.skeleton} ${styles[animation]}`} />
          </div>
          <div className={styles.cardBody}>
            <div className={`${styles.skeleton} ${styles[animation]}`} />
            <div className={`${styles.skeleton} ${styles[animation]}`} />
            <div className={`${styles.skeleton} ${styles[animation]}`} />
          </div>
          <div className={styles.cardFooter}>
            <div className={`${styles.skeleton} ${styles[animation]}`} />
          </div>
        </div>
      );
    case 'list':
      return (
        <div className={styles.list} style={{ width }}>
          {Array(count).fill(0).map((_, index) => (
            <div key={index} className={styles.listItem}>
              <div className={`${styles.skeleton} ${styles.circle} ${styles[animation]}`} />
              <div className={styles.listContent}>
                <div className={`${styles.skeleton} ${styles[animation]}`} />
                <div className={`${styles.skeleton} ${styles[animation]}`} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div className={styles.table} style={{ width }}>
          <div className={styles.tableHeader}>
            {Array(5).fill(0).map((_, index) => (
              <div key={index} className={`${styles.skeleton} ${styles[animation]}`} />
            ))}
          </div>
          {Array(count).fill(0).map((_, rowIndex) => (
            <div key={rowIndex} className={styles.tableRow}>
              {Array(5).fill(0).map((_, colIndex) => (
                <div key={colIndex} className={`${styles.skeleton} ${styles[animation]}`} />
              ))}
            </div>
          ))}
        </div>
      );
    case 'paragraph':
      return (
        <div className={styles.paragraph} style={{ width }}>
          {items}
        </div>
      );
    case 'custom':
    case 'text':
    default:
      return <>{items}</>;
  }
};

Skeleton.propTypes = {
  type: PropTypes.oneOf(['text', 'avatar', 'button', 'card', 'list', 'table', 'paragraph', 'custom']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  count: PropTypes.number,
  className: PropTypes.string,
  circle: PropTypes.bool,
  animation: PropTypes.oneOf(['pulse', 'wave', 'none']),
};

export default Skeleton;