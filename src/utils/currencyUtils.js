// src/utils/currencyUtils.js

// Exchange rates (updated periodically from an API in a real implementation)
let exchangeRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.23,
  CAD: 1.36,
  AUD: 1.52,
  CNY: 7.24,
  INR: 83.12,
  BRL: 5.05,
  MXN: 16.73,
};

// Currency formatting options
const currencyFormatOptions = {
  USD: { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  EUR: { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  GBP: { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  JPY: { style: 'currency', currency: 'JPY', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  CAD: { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  AUD: { style: 'currency', currency: 'AUD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  CNY: { style: 'currency', currency: 'CNY', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  INR: { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  BRL: { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  MXN: { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 },
};

/**
 * Update exchange rates from an external API
 * @param {Object} rates - New exchange rates
 */
export const updateExchangeRates = (rates) => {
  exchangeRates = { ...exchangeRates, ...rates };
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} - Converted amount
 */
export const convertCurrency = (amount, fromCurrency = 'USD', toCurrency = 'USD') => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert to USD first (base currency)
  const amountInUSD = fromCurrency === 'USD' ? amount : amount / exchangeRates[fromCurrency];
  
  // Convert from USD to target currency
  return toCurrency === 'USD' ? amountInUSD : amountInUSD * exchangeRates[toCurrency];
};

/**
 * Format amount in specified currency
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'USD', locale = 'en-US') => {
  if (amount === undefined || amount === null) {
    return '';
  }
  
  try {
    const options = currencyFormatOptions[currencyCode] || currencyFormatOptions.USD;
    return new Intl.NumberFormat(locale, options).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount} ${currencyCode}`;
  }
};

/**
 * Get user's preferred currency
 * @returns {string} - Currency code
 */
export const getPreferredCurrency = () => {
  return localStorage.getItem('currency') || 'USD';
};

/**
 * Set user's preferred currency
 * @param {string} currencyCode - Currency code
 */
export const setPreferredCurrency = (currencyCode) => {
  localStorage.setItem('currency', currencyCode);
  
  // Dispatch event for components to update
  const event = new CustomEvent('currencyChange', { detail: { code: currencyCode } });
  window.dispatchEvent(event);
};

/**
 * Format price with original and converted currency
 * @param {number} amount - Amount in original currency
 * @param {string} originalCurrency - Original currency code
 * @param {string} targetCurrency - Target currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} - Formatted price string with both currencies
 */
export const formatDualCurrency = (amount, originalCurrency = 'USD', targetCurrency = null, locale = 'en-US') => {
  const userCurrency = targetCurrency || getPreferredCurrency();
  
  // If currencies are the same, just format once
  if (originalCurrency === userCurrency) {
    return formatCurrency(amount, originalCurrency, locale);
  }
  
  // Convert and format both currencies
  const convertedAmount = convertCurrency(amount, originalCurrency, userCurrency);
  const originalFormatted = formatCurrency(amount, originalCurrency, locale);
  const convertedFormatted = formatCurrency(convertedAmount, userCurrency, locale);
  
  return `${originalFormatted} (${convertedFormatted})`;
};

export default {
  convertCurrency,
  formatCurrency,
  getPreferredCurrency,
  setPreferredCurrency,
  formatDualCurrency,
  updateExchangeRates,
};