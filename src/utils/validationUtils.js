/**
 * Utility functions for form validation
 */

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a password
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for at least one uppercase letter, one lowercase letter, one number, and one special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return { 
      isValid: false, 
      message: 'Password must include uppercase, lowercase, number, and special character' 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const isValidPhone = (phone) => {
  // Remove non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Check if it's a valid 10-digit number
  return digitsOnly.length === 10;
};

/**
 * Validate a URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate a date string
 * @param {string} dateString - The date string to validate
 * @returns {boolean} - Whether the date is valid
 */
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Check if a value is empty (null, undefined, empty string, or empty array)
 * @param {any} value - The value to check
 * @returns {boolean} - Whether the value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
};

/**
 * Validate a form object
 * @param {Object} values - The form values
 * @param {Object} validationRules - The validation rules
 * @returns {Object} - Validation errors
 */
export const validateForm = (values, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = values[field];
    
    // Required rule
    if (rules.required && isEmpty(value)) {
      errors[field] = rules.requiredMessage || `${field} is required`;
      return;
    }
    
    // Skip other validations if value is empty and not required
    if (isEmpty(value) && !rules.required) {
      return;
    }
    
    // Email rule
    if (rules.email && !isValidEmail(value)) {
      errors[field] = rules.emailMessage || 'Please enter a valid email address';
    }
    
    // Password rule
    if (rules.password) {
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.isValid) {
        errors[field] = rules.passwordMessage || passwordValidation.message;
      }
    }
    
    // Phone rule
    if (rules.phone && !isValidPhone(value)) {
      errors[field] = rules.phoneMessage || 'Please enter a valid phone number';
    }
    
    // URL rule
    if (rules.url && !isValidUrl(value)) {
      errors[field] = rules.urlMessage || 'Please enter a valid URL';
    }
    
    // Date rule
    if (rules.date && !isValidDate(value)) {
      errors[field] = rules.dateMessage || 'Please enter a valid date';
    }
    
    // Min length rule
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = rules.minLengthMessage || `${field} must be at least ${rules.minLength} characters`;
    }
    
    // Max length rule
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = rules.maxLengthMessage || `${field} must be at most ${rules.maxLength} characters`;
    }
    
    // Pattern rule
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternMessage || `${field} is invalid`;
    }
    
    // Custom validation rule
    if (rules.validate) {
      const customError = rules.validate(value, values);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return errors;
};

export default {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidUrl,
  isValidDate,
  isEmpty,
  validateForm
};