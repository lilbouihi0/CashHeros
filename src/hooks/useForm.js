import { useState, useCallback } from 'react';

/**
 * Custom hook for form handling with validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function that returns errors object
 * @param {Function} onSubmit - Function to call on valid form submission
 * @returns {Object} - Form state and handlers
 */
const useForm = (initialValues = {}, validate = () => ({}), onSubmit = () => {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set specific form values
  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
  }, [touched]);

  // Handle nested input change (for objects like address.street)
  const handleNestedChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setValues(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
      
      // Mark field as touched
      if (!touched[name]) {
        setTouched(prev => ({
          ...prev,
          [name]: true
        }));
      }
    }
  }, [touched]);

  // Handle blur event
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate on blur
    const validationErrors = validate(values);
    setErrors(validationErrors);
  }, [values, validate]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    // Validate form
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    // If no errors, submit
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      
      Promise.resolve(onSubmit(values))
        .catch(error => {
          console.error('Form submission error:', error);
          // You could set a form-level error here if needed
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  }, [values, validate, onSubmit]);

  // Check if a field has an error and has been touched
  const hasError = useCallback((fieldName) => {
    return touched[fieldName] && errors[fieldName];
  }, [touched, errors]);

  // Get error message for a field
  const getError = useCallback((fieldName) => {
    return hasError(fieldName) ? errors[fieldName] : null;
  }, [hasError, errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleNestedChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormValues,
    hasError,
    getError,
    setErrors
  };
};

export default useForm;