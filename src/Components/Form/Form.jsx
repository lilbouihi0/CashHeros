import React from 'react';
import PropTypes from 'prop-types';
import styles from './Form.module.css';

/**
 * Reusable form component
 */
const Form = ({
  onSubmit,
  children,
  className = '',
  id,
  noValidate = true,
  autoComplete = 'off',
  loading = false,
  error = null,
  success = null,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && !loading) {
      onSubmit(e);
    }
  };

  return (
    <form
      id={id}
      className={`${styles.form} ${className} ${loading ? styles.loading : ''}`}
      onSubmit={handleSubmit}
      noValidate={noValidate}
      autoComplete={autoComplete}
    >
      {error && (
        <div className={styles.formError} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className={styles.formSuccess} role="status">
          {success}
        </div>
      )}

      {children}

      {loading && (
        <div className={styles.formOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </form>
  );
};

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  id: PropTypes.string,
  noValidate: PropTypes.bool,
  autoComplete: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.string,
};

export default Form;