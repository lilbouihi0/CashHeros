import React from 'react';
import PropTypes from 'prop-types';
import styles from './FormField.module.css';

/**
 * Reusable form field component with validation
 */
const FormField = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  required = false,
  disabled = false,
  className = '',
  helpText,
  autoComplete,
  min,
  max,
  step,
  pattern,
  maxLength,
  minLength,
  readOnly = false,
  options = [],
  multiple = false,
  rows = 3,
  cols = 50,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  // Determine if the field has an error and has been touched
  const hasError = error && touched;
  
  // Generate field classes
  const fieldClasses = `
    ${styles.formField}
    ${hasError ? styles.hasError : ''}
    ${disabled ? styles.disabled : ''}
    ${icon ? styles.hasIcon : ''}
    ${icon && iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
    ${className}
  `;

  // Generate input classes
  const inputClasses = `
    ${styles.input}
    ${hasError ? styles.inputError : ''}
  `;

  // Render different input types
  const renderInput = () => {
    const commonProps = {
      id,
      name,
      value: value || '',
      onChange,
      onBlur,
      disabled,
      required,
      'aria-invalid': hasError ? 'true' : 'false',
      'aria-describedby': hasError ? `${id}-error` : undefined,
      autoComplete,
      className: inputClasses,
      readOnly,
      ...props
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={placeholder}
            rows={rows}
            cols={cols}
          />
        );
      case 'select':
        return (
          <select {...commonProps} multiple={multiple}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className={styles.checkboxContainer}>
            <input
              {...commonProps}
              type="checkbox"
              checked={!!value}
              className={styles.checkbox}
            />
            <span className={styles.checkboxLabel}>{label}</span>
          </div>
        );
      case 'radio':
        return (
          <div className={styles.radioContainer}>
            {options.map((option) => (
              <div key={option.value} className={styles.radioOption}>
                <input
                  type="radio"
                  id={`${id}-${option.value}`}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={disabled}
                  className={styles.radio}
                  required={required}
                />
                <label htmlFor={`${id}-${option.value}`} className={styles.radioLabel}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <input
            {...commonProps}
            type={type}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
            maxLength={maxLength}
            minLength={minLength}
          />
        );
    }
  };

  return (
    <div className={fieldClasses}>
      {type !== 'checkbox' && label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputContainer}>
        {icon && iconPosition === 'left' && (
          <span className={styles.icon}>{icon}</span>
        )}
        
        {renderInput()}
        
        {icon && iconPosition === 'right' && (
          <span className={styles.icon}>{icon}</span>
        )}
      </div>
      
      {helpText && !hasError && (
        <div className={styles.helpText}>{helpText}</div>
      )}
      
      {hasError && (
        <div id={`${id}-error`} className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  touched: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  helpText: PropTypes.string,
  autoComplete: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pattern: PropTypes.string,
  maxLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  readOnly: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  multiple: PropTypes.bool,
  rows: PropTypes.number,
  cols: PropTypes.number,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
};

export default FormField;