import React, { useState, useEffect } from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaPinterest, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaApple,
  FaAndroid,
  FaChrome,
  FaFirefox,
  FaEdge,
  FaSafari,
  FaDownload,
  FaQrcode,
  FaMobileAlt,
  FaLaptop,
  FaTabletAlt,
  FaGlobe,
  FaMoneyBillWave,
  FaChevronDown
} from 'react-icons/fa';

const Footer = () => {
  const [activeQRCode, setActiveQRCode] = useState(null);
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
      if (!event.target.closest('.language-selector') && !event.target.closest('.language-button')) {
        setIsLangOpen(false);
      }
      if (!event.target.closest('.currency-selector') && !event.target.closest('.currency-button')) {
        setIsCurrencyOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const showQRCode = (app) => {
    setActiveQRCode(app);
  };
  
  const hideQRCode = () => {
    setActiveQRCode(null);
  };
  
  return (
    <>
      <div className="app-download-banner">
        <div className="banner-container">
          <div className="banner-content">
            <div className="banner-text">
              <h3>Download Our App</h3>
              <p>Get exclusive mobile-only deals and instant notifications</p>
            </div>
            <div className="banner-buttons">
              <a href="#" className="banner-button" onClick={(e) => { e.preventDefault(); showQRCode('ios'); }}>
                <FaApple /> <span>iOS App</span>
              </a>
              <a href="#" className="banner-button" onClick={(e) => { e.preventDefault(); showQRCode('android'); }}>
                <FaAndroid /> <span>Android App</span>
              </a>
            </div>
          </div>
          <div className="banner-image">
            <img src="/app-preview.png" alt="CashHeros App" onError={(e) => {e.target.style.display = 'none'}} />
          </div>
          <button className="banner-close" onClick={(e) => e.currentTarget.parentElement.style.display = 'none'}>×</button>
        </div>
      </div>
      <footer className="footer">
        <div className="footer-container">
        <div className="footer-row">
          {/* Company Info */}
          <div className="footer-column">
            <h3>About Us</h3>
            <p>We provide the best deals and coupons to help you save money on your favorite brands and stores.</p>
            <div className="footer-logo">
              {/* Replace with your actual logo */}
              <img src="/logo.png" alt="CashHeros Logo" />
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/stores">Stores</Link></li>
              <li><Link to="/popular-deals">Popular Deals</Link></li>
              <li><Link to="/blog">Savings Tips</Link></li>
            </ul>
          </div>
          
          {/* Mobile Apps */}
          <div className="footer-column">
            <h3>Mobile Apps</h3>
            <p className="app-description">Save on the go with our mobile apps</p>
            <div className="app-buttons">
              <a href="#" className="app-button ios" onClick={(e) => { e.preventDefault(); showQRCode('ios'); }}>
                <FaApple /> <span>iOS App</span>
              </a>
              <a href="#" className="app-button android" onClick={(e) => { e.preventDefault(); showQRCode('android'); }}>
                <FaAndroid /> <span>Android App</span>
              </a>
            </div>
            <div className="device-icons">
              <FaMobileAlt className="device-icon" />
              <FaTabletAlt className="device-icon" />
            </div>
            {activeQRCode && (
              <div className="qr-code-modal">
                <div className="qr-code-container">
                  <button className="close-qr" onClick={hideQRCode}>×</button>
                  <h4>Scan to Download {activeQRCode === 'ios' ? 'iOS' : 'Android'} App</h4>
                  <div className="qr-image">
                    {/* Replace with actual QR code images */}
                    <img 
                      src={`/qr-${activeQRCode}.png`} 
                      alt={`${activeQRCode} QR Code`} 
                      onError={(e) => {e.target.onerror = null; e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://cashheroes.com/download"}}
                    />
                  </div>
                  <p>Or download directly</p>
                  <a href="#" className="download-link">
                    <FaDownload /> Download Now
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Browser Extensions */}
          <div className="footer-column">
            <h3>Browser Extensions</h3>
            <p className="extension-description">Never miss a deal with our browser extensions</p>
            <ul className="extension-links">
              <li>
                <a href="#" className="extension-link">
                  <FaChrome /> <span>Chrome Extension</span>
                </a>
              </li>
              <li>
                <a href="#" className="extension-link">
                  <FaFirefox /> <span>Firefox Add-on</span>
                </a>
              </li>
              <li>
                <a href="#" className="extension-link">
                  <FaEdge /> <span>Edge Extension</span>
                </a>
              </li>
              <li>
                <a href="#" className="extension-link">
                  <FaSafari /> <span>Safari Extension</span>
                </a>
              </li>
            </ul>
            <div className="device-icons">
              <FaLaptop className="device-icon" />
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul className="footer-contact">
              <li><FaEnvelope /> support@cashheroes.com</li>
              <li><FaPhone /> +1 (555) 123-4567</li>
              <li><FaMapMarkerAlt /> 123 Savings Street, Discount City</li>
            </ul>
            
            {/* Social Media */}
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer"><FaPinterest /></a>
            </div>
          </div>
        </div>
        
        {/* Newsletter Subscription */}
        <div className="newsletter">
          <h3>Subscribe for the Latest Deals</h3>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </div>
        </div>
        
        {/* Simple Language and Currency Selectors */}
        <div className="footer-selectors">
          <div className="selectors-container">
            {/* Language Selector */}
            <div className="selector-wrapper">
              <button 
                className="selector-button" 
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Select language"
              >
                <FaGlobe className="selector-icon" />
                <span className="selector-text">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
                <FaChevronDown className={`selector-chevron ${isLangOpen ? 'up' : ''}`} />
              </button>
              
              {isLangOpen && (
                <div className="selector-dropdown">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      className={`dropdown-item ${language.code === i18n.language ? 'active' : ''}`}
                      onClick={() => changeLanguage(language.code)}
                    >
                      <span className="item-flag">{language.flag}</span>
                      <span className="item-name">{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Currency Selector */}
            <div className="selector-wrapper">
              <button 
                className="selector-button" 
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                aria-label="Select currency"
              >
                <FaMoneyBillWave className="selector-icon" />
                <span className="selector-text">{currentCurrency.symbol} {currentCurrency.code}</span>
                <FaChevronDown className={`selector-chevron ${isCurrencyOpen ? 'up' : ''}`} />
              </button>
              
              {isCurrencyOpen && (
                <div className="selector-dropdown">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      className={`dropdown-item ${currency.code === currentCurrency.code ? 'active' : ''}`}
                      onClick={() => changeCurrency(currency.code)}
                    >
                      <span className="item-symbol">{currency.symbol}</span>
                      <span className="item-code">{currency.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; {new Date().getFullYear()} CashHeros. All Rights Reserved.</p>
          </div>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;