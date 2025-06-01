import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/**
 * Reusable button component with various styles and states
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  rounded = false,
  icon,
  iconPosition = 'left',
  href,
  to,
  className = '',
  ariaLabel,
  ...props
}) => {
  // Determine button classes
  const buttonClasses = `
    ${styles.button}
    ${styles[variant]}
    ${styles[size]}
    ${fullWidth ? styles.fullWidth : ''}
    ${rounded ? styles.rounded : ''}
    ${loading ? styles.loading : ''}
    ${icon && !children ? styles.iconOnly : ''}
    ${icon && children && iconPosition === 'right' ? styles.iconRight : ''}
    ${className}
  `;

  // Content to render inside the button
  const content = (
    <>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className={styles.icon}>{icon}</span>
      )}
      
      {children && <span className={styles.text}>{children}</span>}
      
      {icon && iconPosition === 'right' && !loading && (
        <span className={styles.icon}>{icon}</span>
      )}
    </>
  );

  // If href is provided, render an anchor tag
  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        aria-label={ariaLabel}
        aria-disabled={disabled || loading}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        target={href.startsWith('http') ? '_blank' : undefined}
        {...props}
      >
        {content}
      </a>
    );
  }

  // If to is provided, render a Link component
  if (to) {
    return (
      <Link
        to={to}
        className={buttonClasses}
        aria-label={ariaLabel}
        aria-disabled={disabled || loading}
        {...props}
      >
        {content}
      </Link>
    );
  }

  // Otherwise, render a button element
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading ? 'true' : 'false'}
      {...props}
    >
      {content}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'tertiary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
    'link',
    'outline-primary',
    'outline-secondary',
    'outline-success',
    'outline-danger',
    'outline-warning',
    'outline-info',
    'outline-light',
    'outline-dark',
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  rounded: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  href: PropTypes.string,
  to: PropTypes.string,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default Button;