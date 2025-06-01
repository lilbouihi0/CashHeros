import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';
import styles from './LanguageSelector.module.css';
import { RTL_LANGUAGES } from '../../services/i18n';

// Available languages with their native names and flags
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get current language
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

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
  
  // Change language
  const changeLanguage = (langCode) => {
    if (langCode !== i18n.language) {
      i18n.changeLanguage(langCode);
      setIsOpen(false);
      
      // Store language preference
      localStorage.setItem('i18nextLng', langCode);
      
      // Show notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } else {
      setIsOpen(false);
    }
  };
  
  return (
    <div className={styles.languageSelector} ref={dropdownRef}>
      <button 
        className={styles.languageButton} 
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t('language.select')}
      >
        <span className={styles.currentFlag}>{currentLanguage.flag}</span>
        <span className={styles.currentLanguage}>{currentLanguage.name}</span>
        <FaChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`} />
      </button>
      
      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.languageList}>
            {languages.map((language) => (
              <button
                key={language.code}
                className={`${styles.languageOption} ${language.code === i18n.language ? styles.active : ''} ${language.rtl ? styles.rtlOption : ''}`}
                onClick={() => changeLanguage(language.code)}
                role="menuitem"
                aria-current={language.code === i18n.language ? 'true' : 'false'}
              >
                <span className={styles.flag}>{language.flag}</span>
                <span className={styles.name}>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Simple language change notification */}
      {showNotification && (
        <div className={styles.notification} role="alert">
          <span className={styles.notificationFlag}>{currentLanguage.flag}</span>
          <span>{t('language.changed', { language: currentLanguage.name })}</span>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;