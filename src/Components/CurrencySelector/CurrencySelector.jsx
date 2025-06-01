import React, { useState, useContext, useEffect, useRef } from 'react';
import { FaMoneyBillWave, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../../context/AppContext';
import styles from './CurrencySelector.module.css';

// Available currencies
const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
];

const CurrencySelector = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { showNotification: appShowNotification } = useContext(AppContext);
  const dropdownRef = useRef(null);
  
  // Get current currency from localStorage or default to USD
  const [currentCurrency, setCurrentCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('currency');
    return currencies.find(curr => curr.code === savedCurrency) || currencies[0];
  });
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Change currency
  const changeCurrency = (currencyCode) => {
    const newCurrency = currencies.find(curr => curr.code === currencyCode);
    if (newCurrency && newCurrency.code !== currentCurrency.code) {
      setCurrentCurrency(newCurrency);
      localStorage.setItem('currency', currencyCode);
      
      // Publish currency change event for other components
      const event = new CustomEvent('currencyChange', { detail: newCurrency });
      window.dispatchEvent(event);
      
      // Show notification
      appShowNotification(
        t('currency.changed', { currency: newCurrency.name }),
        'info'
      );
      
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  };
  
  return (
    <div className={styles.currencySelector} ref={dropdownRef}>
      <button 
        className={styles.currencyButton} 
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t('currency.select')}
      >
        <span className={styles.currentSymbol}>{currentCurrency.symbol}</span>
        <span className={styles.currentCode}>{currentCurrency.code}</span>
        <FaChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`} />
      </button>
      
      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.currencyList}>
            {currencies.map((currency) => (
              <button
                key={currency.code}
                className={`${styles.currencyOption} ${currency.code === currentCurrency.code ? styles.active : ''}`}
                onClick={() => changeCurrency(currency.code)}
                role="menuitem"
                aria-current={currency.code === currentCurrency.code ? 'true' : 'false'}
              >
                <span className={styles.symbol}>{currency.symbol}</span>
                <span className={styles.code}>{currency.code}</span>
                <span className={styles.name}>{currency.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;