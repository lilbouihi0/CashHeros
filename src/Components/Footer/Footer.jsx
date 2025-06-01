import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaMoneyBillWave, FaChevronDown } from 'react-icons/fa';
import styles from './Footer.module.css';

export const Footer = () => {
  const { i18n, t } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  
  // Available languages with their native names and flags
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];
  
  // Available currencies
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
  ];
  
  // Get current language
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  // Get current currency from localStorage or default to USD
  const [currentCurrency, setCurrentCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('currency');
    return currencies.find(curr => curr.code === savedCurrency) || currencies[0];
  });
  
  // Change language
  const changeLanguage = (langCode) => {
    if (langCode !== i18n.language) {
      i18n.changeLanguage(langCode);
      localStorage.setItem('i18nextLng', langCode);
    }
    setIsLangOpen(false);
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
    }
    setIsCurrencyOpen(false);
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.languageSelector}`) && !event.target.closest(`.${styles.languageButton}`)) {
        setIsLangOpen(false);
      }
      if (!event.target.closest(`.${styles.currencySelector}`) && !event.target.closest(`.${styles.currencyButton}`)) {
        setIsCurrencyOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [styles.languageSelector, styles.currencySelector, styles.languageButton, styles.currencyButton]);
  
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-container']}>
        <div className={styles['footer-section']}>
          <h3>CashHeros</h3>
          <p>Save money with the best coupons and cashback offers.</p>
        </div>
        
        <div className={styles['footer-section']}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/stores">Stores</a></li>
            <li><a href="/cashback">Cashback</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>
        
        <div className={styles['footer-section']}>
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/careers">Careers</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        
        <div className={styles['footer-section']}>
          <h4>Legal</h4>
          <ul>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      
      <div className={styles['footer-localization']}>
        <div className={styles['localization-container']}>
          <div className={styles['localization-title']}>Language & Currency</div>
          <div className={styles['selectors-wrapper']}>
            {/* Language Selector */}
            <div className={styles.languageSelector}>
              <button 
                className={styles.languageButton} 
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Select language"
              >
                <FaGlobe className={styles.selectorIcon} />
                <span className={styles.selectorText}>{currentLanguage.flag} {currentLanguage.name}</span>
                <FaChevronDown className={styles.chevron} />
              </button>
              
              {isLangOpen && (
                <div className={styles.dropdown}>
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      className={`${styles.dropdownOption} ${language.code === i18n.language ? styles.active : ''}`}
                      onClick={() => changeLanguage(language.code)}
                    >
                      <span className={styles.optionFlag}>{language.flag}</span>
                      <span className={styles.optionName}>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Currency Selector */}
            <div className={styles.currencySelector}>
              <button 
                className={styles.currencyButton} 
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                aria-label="Select currency"
              >
                <FaMoneyBillWave className={styles.selectorIcon} />
                <span className={styles.selectorText}>{currentCurrency.symbol} {currentCurrency.code}</span>
                <FaChevronDown className={styles.chevron} />
              </button>
              
              {isCurrencyOpen && (
                <div className={styles.dropdown}>
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      className={`${styles.dropdownOption} ${currency.code === currentCurrency.code ? styles.active : ''}`}
                      onClick={() => changeCurrency(currency.code)}
                    >
                      <span className={styles.optionSymbol}>{currency.symbol}</span>
                      <span className={styles.optionCode}>{currency.code}</span>
                      <span className={styles.optionName}>{currency.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles['footer-bottom']}>
        <p>&copy; {new Date().getFullYear()} CashHeros. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;