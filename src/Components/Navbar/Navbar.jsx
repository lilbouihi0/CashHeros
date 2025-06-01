// src/Components/Navbar/Navbar.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import styles from './Navbar.module.css';
import { FaBolt, FaBars, FaTimes, FaUser, FaShoppingBag, FaPercent, FaBlog, FaTag } from 'react-icons/fa';
import cashHerosLogo from '../assets/cashheros-logo.png';

/**
 * Enhanced Navbar component with improved responsive design and user experience
 */
export const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle user logout
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  // Toggle user dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Determine if a nav link is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.stickyNavbar : ''}`}>
      <div className={styles.navbarItems}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <Link to="/" className={styles.logoLink}>
            <img src={cashHerosLogo} alt="CashHeros Logo" className={styles.logo} />
          </Link>
          
          {/* Mobile menu toggle button */}
          <button 
            className={styles.mobileMenuToggle} 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation Links - Desktop and Mobile */}
        <div className={`${styles.navbarLinksContainer} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <div className={styles.navbarLinks}>
            <Link to="/" className={isActive('/') ? styles.activeLink : ''}>
              <span className={styles.linkIcon}><FaShoppingBag /></span>
              <span className={styles.linkText}>{t('navigation.home')}</span>
            </Link>
            <Link to="/stores" className={isActive('/stores') ? styles.activeLink : ''}>
              <span className={styles.linkIcon}><FaShoppingBag /></span>
              <span className={styles.linkText}>{t('navigation.stores')}</span>
            </Link>
            <Link to="/cashback" className={isActive('/cashback') ? styles.activeLink : ''}>
              <span className={styles.linkIcon}><FaPercent /></span>
              <span className={styles.linkText}>{t('navigation.cashback')}</span>
            </Link>
            <Link to="/blog" className={isActive('/blog') ? styles.activeLink : ''}>
              <span className={styles.linkIcon}><FaBlog /></span>
              <span className={styles.linkText}>{t('navigation.blog')}</span>
            </Link>
            <Link to="/deals" className={isActive('/deals') ? styles.activeLink : ''}>
              <span className={styles.linkIcon}><FaTag /></span>
              <span className={styles.linkText}>Deals</span>
            </Link>
          </div>



          {/* Mobile Auth Buttons */}
          {!user && (
            <div className={styles.mobileAuthButtons}>
              <Link to="/login" className={styles.mobileAuthLink}>
                <button className={styles.mobileNavbarBtnSign}>Sign In</button>
              </Link>
              <Link to="/signup" className={styles.mobileAuthLink}>
                <button className={styles.mobileNavbarBtnSign}>Sign Up</button>
              </Link>
            </div>
          )}
        </div>





        {/* User Section - Desktop */}
        {user ? (
          <div className={styles.userSection}>
            <div className={styles.authenticatedUser} ref={dropdownRef}>
              <button onClick={toggleDropdown} className={styles.userButton}>
                <FaUser className={styles.userIcon} />
                <span className={styles.userEmail}>{user.email}</span>
                <span className={styles.dropdownArrow}>▼</span>
              </button>
              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.welcomeText}>{t('account.welcome')}</span>
                    <span className={styles.userEmailSmall}>{user.email}</span>
                  </div>
                  <Link to="/offers" className={styles.dropdownItem}>
                    {t('account.offers')} <span className={styles.newBadge}>{t('common.new')}</span>
                  </Link>
                  <Link to="/rewards" className={styles.dropdownItem}>
                    {t('account.rewards')} <span className={styles.newBadge}>{t('common.new')}</span>
                  </Link>
                  <Link to="/account" className={styles.dropdownItem}>
                    {t('account.profile')}
                  </Link>
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    {t('auth.logout')}
                  </button>
                </div>
              )}
              <button className={styles.balanceButton} onClick={() => navigate('/rewards')}>
                <FaBolt className={styles.lightningIcon} /> ${user.balance || '0.00'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.authButtons}>
            <Link to="/login">
              <button className={styles.navbarBtnSign}>{t('auth.login')}</button>
            </Link>
            <Link to="/signup">
              <button className={styles.navbarBtnSignUp}>{t('auth.signup')}</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;