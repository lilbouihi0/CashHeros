// src/hooks/useLocalization.js
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getPreferredCurrency, formatCurrency, convertCurrency } from '../utils/currencyUtils';

/**
 * Custom hook for localization features
 */
export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  const [currency, setCurrency] = useState(getPreferredCurrency());
  const [direction, setDirection] = useState(i18n.dir());
  
  // Update document direction when language changes
  useEffect(() => {
    const dir = i18n.dir();
    document.documentElement.setAttribute('dir', dir);
    setDirection(dir);
    
    // Add RTL class to body if needed
    if (dir === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language, i18n]);
  
  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      setCurrency(event.detail.code || event.detail);
    };
    
    window.addEventListener('currencyChange', handleCurrencyChange);
    
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange);
    };
  }, []);
  
  /**
   * Format date according to current locale
   * @param {Date|string|number} date - Date to format
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} - Formatted date
   */
  const formatDate = (date, options = {}) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    try {
      return new Intl.DateTimeFormat(i18n.language, defaultOptions).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateObj.toLocaleDateString();
    }
  };
  
  /**
   * Format number according to current locale
   * @param {number} number - Number to format
   * @param {Object} options - Intl.NumberFormat options
   * @returns {string} - Formatted number
   */
  const formatNumber = (number, options = {}) => {
    try {
      return new Intl.NumberFormat(i18n.language, options).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return number.toString();
    }
  };
  
  /**
   * Format price in user's preferred currency
   * @param {number} amount - Amount to format
   * @param {string} originalCurrency - Original currency code
   * @returns {string} - Formatted price
   */
  const formatPrice = (amount, originalCurrency = 'USD') => {
    if (originalCurrency === currency) {
      return formatCurrency(amount, currency, i18n.language);
    }
    
    const convertedAmount = convertCurrency(amount, originalCurrency, currency);
    return formatCurrency(convertedAmount, currency, i18n.language);
  };
  
  /**
   * Format price showing both original and converted currencies
   * @param {number} amount - Amount to format
   * @param {string} originalCurrency - Original currency code
   * @returns {string} - Formatted price with both currencies
   */
  const formatDualPrice = (amount, originalCurrency = 'USD') => {
    if (originalCurrency === currency) {
      return formatCurrency(amount, currency, i18n.language);
    }
    
    const originalFormatted = formatCurrency(amount, originalCurrency, i18n.language);
    const convertedAmount = convertCurrency(amount, originalCurrency, currency);
    const convertedFormatted = formatCurrency(convertedAmount, currency, i18n.language);
    
    return `${originalFormatted} (${convertedFormatted})`;
  };
  
  return {
    t,
    i18n,
    currency,
    direction,
    formatDate,
    formatNumber,
    formatPrice,
    formatDualPrice,
    isRTL: direction === 'rtl'
  };
};

export default useLocalization;