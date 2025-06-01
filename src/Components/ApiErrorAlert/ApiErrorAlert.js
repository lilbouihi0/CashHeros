import React from 'react';
import './ApiErrorAlert.css';

/**
 * ApiErrorAlert Component
 * 
 * Displays API errors in a user-friendly way
 * 
 * @param {Object} props - Component props
 * @param {string} props.error - Error message
 * @param {Function} props.onDismiss - Function to call when the alert is dismissed
 * @param {string} props.className - Additional CSS class
 * @param {string} props.type - Error type (error, warning, info)
 * @param {boolean} props.showIcon - Whether to show the icon
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {number} props.autoDismiss - Auto dismiss after X milliseconds
 */
const ApiErrorAlert = ({
  error,
  onDismiss,
  className = '',
  type = 'error',
  showIcon = true,
  dismissible = true,
  autoDismiss = 0
}) => {
  // If no error, don't render anything
  if (!error) return null;

  // Auto dismiss
  React.useEffect(() => {
    if (autoDismiss > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss, error]);

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        );
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v2h-2zm0 4h2v6h-2z" />
          </svg>
        );
      default: // error
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        );
    }
  };

  return (
    <div className={`api-error-alert api-error-alert-${type} ${className}`} role="alert">
      {showIcon && <div className="api-error-alert-icon">{getIcon()}</div>}
      <div className="api-error-alert-content">
        <p>{error}</p>
      </div>
      {dismissible && onDismiss && (
        <button
          className="api-error-alert-close"
          onClick={onDismiss}
          aria-label="Close"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ApiErrorAlert;