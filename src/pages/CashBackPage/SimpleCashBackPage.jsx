// src/pages/CashBackPage/SimpleCashBackPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingBag, FaMoneyBillWave, FaWallet, FaChevronDown,
  FaArrowRight, FaStar, FaBolt, FaRegClock, FaGift, FaPercentage,
  FaShieldAlt, FaHeadset, FaRegLightbulb, FaFire, FaStore,
  FaExternalLinkAlt, FaInfoCircle, FaShareAlt, FaRegHeart, FaHeart,
  FaRegBookmark, FaBookmark, FaCheck, FaClock } from 'react-icons/fa';
import cardStyles from './CashBackCard.module.css';
import styles from './SimpleCashBackPage.module.css';
import productImage from '../../assets/images/product-placeholder.js';

// Modern CashBack Card component
const ModernCashBackCard = ({
  discount,
  productName,
  image,
  link,
  storeName = "Featured Store",
  cashbackRate = "Up to 10%",
  expiryDate = "Dec 31, 2023",
  isHot = false,
  terms = "Standard terms and conditions apply"
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isShared, setIsShared] = useState(false);
  
  const handleCheckPrice = () => {
    console.log(`Checking price for ${productName}`);
    window.location.href = link;
  };
  
  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    console.log(`${isFavorite ? 'Removed from' : 'Added to'} favorites: ${productName}`);
  };
  
  const toggleSaved = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    console.log(`${isSaved ? 'Removed from' : 'Added to'} saved items: ${productName}`);
  };
  
  const toggleTerms = (e) => {
    e.stopPropagation();
    setShowTerms(!showTerms);
    console.log(`${isFavorite ? 'Removed from' : 'Added to'} favorites: ${productName}`);
  };
  
  const handleShare = () => {
    setIsShared(!isShared);
  };
  
  return (
    <div className={`${cardStyles.cashBackCard} ${isHot ? cardStyles.hotDeal : ''}`}>
      {/* Card Header */}
      <div className={cardStyles.cardHeader}>
        <div className={cardStyles.discountBadge}>
          <FaFire className={cardStyles.fireIcon} />
          {discount}
        </div>

        {isHot && (
          <div className={cardStyles.hotDealBadge}>
            Hot Deal
          </div>
        )}

        <div className={cardStyles.cardActions}>
          <button
            className={cardStyles.actionButton}
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <FaHeart className={cardStyles.favoriteIcon} /> : <FaRegHeart />}
          </button>

          <button
            className={cardStyles.actionButton}
            onClick={toggleSaved}
            aria-label={isSaved ? "Remove from saved" : "Save for later"}
          >
            {isSaved ? <FaBookmark className={cardStyles.savedIcon} /> : <FaRegBookmark />}
          </button>

          <button
            className={cardStyles.actionButton}
            onClick={handleShare}
            aria-label="Share this deal"
          >
            {isShared ? <FaCheck className={cardStyles.sharedIcon} /> : <FaShareAlt />}
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className={cardStyles.cardContent}>
        <div className={cardStyles.imageContainer}>
          <img src={image} alt={productName} className={cardStyles.productImage} />
          <div className={cardStyles.cashbackOverlay}>
            <span>{cashbackRate}</span>
          </div>
        </div>
        <div className={cardStyles.textSection}>
          <div className={cardStyles.storeInfo}>
            <FaStore className={cardStyles.infoIcon} />
            <span>{storeName}</span>
          </div>

          <h3 className={cardStyles.productName}>{productName}</h3>

          {expiryDate && (
            <div className={cardStyles.expiryInfo}>
              <FaClock className={cardStyles.infoIcon} />
              <span>Expires: {expiryDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className={cardStyles.cardFooter}>
        <button className={cardStyles.checkPriceButton} onClick={handleCheckPrice}>
          Get Cashback <FaExternalLinkAlt className={cardStyles.linkIcon} />
        </button>

        <button className={cardStyles.termsButton} onClick={toggleTerms}>
          <FaInfoCircle /> Terms
        </button>
      </div>

      {/* Terms Popup */}
      {showTerms && (
        <div className={cardStyles.termsPopup} onClick={(e) => e.stopPropagation()}>
          <div className={cardStyles.termsContent}>
            <h4>Terms & Conditions</h4>
            <p>{terms}</p>
            <button onClick={toggleTerms}>Close</button>
          </div>
        </div>
      )}

      {/* Hover Overlay */}
      <div className={cardStyles.hoverOverlay}>
        <div className={cardStyles.overlayContent}>
          <p>Click to earn {cashbackRate} cash back at {storeName}</p>
          <button className={cardStyles.overlayButton} onClick={handleCheckPrice}>
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced fallback data
const fallbackOffers = [
  {
    id: 1,
    discount: "53% OFF",
    productName: "Pokemon Construx Charizard...",
    image: productImage,
    link: "#",
    storeName: "Amazon",
    cashbackRate: "5% Cash Back",
    expiryDate: "Dec 31, 2023",
    isHot: true,
    terms: "Valid for new Prime members only. Terms and conditions apply."
  },
  {
    id: 2,
    discount: "43% OFF",
    productName: "Amazon Fire TV 4-Series 4K HDR Smart TV",
    image: productImage,
    link: "#",
    storeName: "Best Buy",
    cashbackRate: "3% Cash Back",
    expiryDate: "Nov 30, 2023",
    isHot: false,
    terms: "Minimum purchase of $50 required. Excludes grocery items."
  },
  {
    id: 3,
    discount: "38% OFF",
    productName: "Panasonic Nanoe Oscillating QuickDry Nozzle...",
    image: productImage,
    link: "#",
    storeName: "Target",
    cashbackRate: "4% Cash Back",
    expiryDate: "Jan 15, 2024",
    isHot: true,
    terms: "Selected items only. Second item must be of equal or lesser value."
  },
  {
    id: 4,
    discount: "35% OFF",
    productName: "Apple AirTag Tracker (4-Pack)",
    image: productImage,
    link: "#",
    storeName: "Apple",
    cashbackRate: "2% Cash Back",
    expiryDate: "Dec 15, 2023",
    isHot: false,
    terms: "New customers only. Maximum discount of $100."
  },
  {
    id: 5,
    discount: "40% OFF",
    productName: "Sample Product 5",
    image: productImage,
    link: "#",
    storeName: "Nike",
    cashbackRate: "8% Cash Back",
    expiryDate: "Nov 20, 2023",
    isHot: false,
    terms: "Excludes sale items and limited editions."
  },
  {
    id: 6,
    discount: "25% OFF",
    productName: "Wireless Headphones",
    image: productImage,
    link: "#",
    storeName: "Samsung",
    cashbackRate: "6% Cash Back",
    expiryDate: "Jan 10, 2024",
    isHot: true,
    terms: "With eligible trade-in. Terms and conditions apply."
  },
  {
    id: 7,
    discount: "30% OFF",
    productName: "Smart Watch",
    image: productImage,
    link: "#",
    storeName: "Walmart",
    cashbackRate: "3% Cash Back",
    expiryDate: "Dec 25, 2023",
    isHot: false,
    terms: "On orders over $50. US shipping addresses only."
  },
  {
    id: 8,
    discount: "45% OFF",
    productName: "Bluetooth Speaker",
    image: productImage,
    link: "#",
    storeName: "Adidas",
    cashbackRate: "5% Cash Back",
    expiryDate: "Nov 30, 2023",
    isHot: false,
    terms: "Selected styles only. Lowest priced item is free."
  }
];

// Modern CashBack Page
const SimpleCashBackPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('featured');

  // Add scroll animation for elements
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll(`.${styles.animateOnScroll}`).forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      document.querySelectorAll(`.${styles.animateOnScroll}`).forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching for: ${searchTerm}`);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Modern Hero Section with Gradient Background */}
      <section className={styles.heroSection}>
        <div className={styles.heroGradient}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroTextContent}>
            <div className={styles.heroTagline}>SMART SHOPPING STARTS HERE</div>
            <h1 className={styles.heroTitle}>
              Earn <span className={styles.heroTitleAccent}>Cash Back</span> on Every Purchase
            </h1>
            <p className={styles.heroSubtitle}>
              Join over 500,000 smart shoppers who save money every time they shop online
            </p>
            
            <div className={styles.heroCTA}>
              <button 
                className={styles.primaryButton}
                onClick={() => navigate('/signup')}
              >
                Start Earning Now <FaArrowRight className={styles.buttonIcon} />
              </button>
              <button 
                className={styles.secondaryButton}
                onClick={() => {
                  // Find the how it works section or scroll to a specific position
                  const howItWorksSection = document.getElementById('howItWorks');
                  if (howItWorksSection) {
                    howItWorksSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 1000, behavior: 'smooth' });
                  }
                }}
              >
                How It Works
              </button>
            </div>
            
            <div className={styles.trustBadges}>
              <div className={styles.trustBadge}>
                <FaStar className={styles.trustIcon} />
                <span>4.8/5 Rating</span>
              </div>
              <div className={styles.trustBadge}>
                <FaBolt className={styles.trustIcon} />
                <span>Fast Payouts</span>
              </div>
              <div className={styles.trustBadge}>
                <FaShieldAlt className={styles.trustIcon} />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
          
          <div className={styles.heroImageContainer}>
            <div className={styles.heroImageWrapper}>
              <img src={productImage} alt="Cash back rewards" className={styles.heroImage} />
              <div className={styles.imageOverlay}>
                <div className={styles.overlayBadge}>
                  <span className={styles.badgeAmount}>$1.2M+</span>
                  <span className={styles.badgeText}>Paid to Members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Search Bar */}
      <section className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search for stores, brands, or products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </div>
          </form>
          
          <div className={styles.quickLinks}>
            <span className={styles.quickLinksLabel}>Popular:</span>
            {['Amazon', 'Walmart', 'Target', 'Nike', 'Apple'].map(store => (
              <button 
                key={store} 
                className={styles.quickLinkButton}
                onClick={() => setSearchTerm(store)}
              >
                {store}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Content Tabs */}
      <section className={styles.tabsSection}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabsHeader}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'featured' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('featured')}
            >
              Featured Deals
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'trending' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('trending')}
            >
              Trending Stores
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'categories' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
          </div>
          
          <div className={styles.tabContent}>
            {activeTab === 'featured' && (
              <div className={styles.featuredDealsGrid}>
                {fallbackOffers.map((offer) => (
                  <ModernCashBackCard key={offer.id} {...offer} />
                ))}
                <div className={styles.viewMoreCard}>
                  <div className={styles.viewMoreContent}>
                    <FaGift className={styles.viewMoreIcon} />
                    <h3>More Deals Available</h3>
                    <p>Discover all our exclusive cash back offers</p>
                    <button className={styles.viewMoreButton}>
                      View All Deals <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'trending' && (
              <div className={styles.storesGrid}>
                {[
                  { id: 201, name: "Amazon", logo: productImage, cashbackRate: "Up to 5%", isPopular: true },
                  { id: 202, name: "Walmart", logo: productImage, cashbackRate: "3%", isPopular: true },
                  { id: 203, name: "Target", logo: productImage, cashbackRate: "2%", isPopular: false },
                  { id: 204, name: "Best Buy", logo: productImage, cashbackRate: "4%", isPopular: true },
                  { id: 205, name: "Nike", logo: productImage, cashbackRate: "8%", isPopular: false },
                  { id: 206, name: "Apple", logo: productImage, cashbackRate: "2%", isPopular: true },
                  { id: 207, name: "Samsung", logo: productImage, cashbackRate: "6%", isPopular: false },
                  { id: 208, name: "Adidas", logo: productImage, cashbackRate: "5%", isPopular: true }
                ].map((store) => (
                  <div key={store.id} className={styles.storeCard}>
                    <div className={styles.storeLogoWrapper}>
                      <img src={productImage} alt={store.name} className={styles.storeLogo} />
                      {store.isPopular && <span className={styles.popularBadge}>Popular</span>}
                    </div>
                    <h3 className={styles.storeName}>{store.name}</h3>
                    <p className={styles.storeCashback}>{store.cashbackRate} Cash Back</p>
                    <button className={styles.shopButton}>Shop Now</button>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'categories' && (
              <div className={styles.categoriesGrid}>
                {[
                  { id: 1, name: "Electronics", icon: <FaRegLightbulb />, color: "#4299e1" },
                  { id: 2, name: "Fashion", icon: <FaShoppingBag />, color: "#ed64a6" },
                  { id: 3, name: "Home", icon: <FaGift />, color: "#48bb78" },
                  { id: 4, name: "Beauty", icon: <FaStar />, color: "#f6ad55" },
                  { id: 5, name: "Travel", icon: <FaRegClock />, color: "#667eea" },
                  { id: 6, name: "Food", icon: <FaPercentage />, color: "#f56565" }
                ].map(category => (
                  <div 
                    key={category.id} 
                    className={styles.categoryCard}
                    style={{ '--category-color': category.color }}
                  >
                    <div className={styles.categoryIcon}>
                      {category.icon}
                    </div>
                    <h3>{category.name}</h3>
                    <button className={styles.categoryButton}>
                      Browse Deals <FaArrowRight />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* How It Works Section - Modern Design */}
      <section className="howItWorksSection">
        <div className="sectionIntro">
          <h2 className="sectionTitle">How Cash Back Works</h2>
          <p className="sectionSubtitle">Earning rewards is simple, transparent, and free</p>
        </div>
        
        <div className="stepsContainer">
          <div className="step animateOnScroll">
            <div className="stepContent">
              <div className="stepNumber">1</div>
              <h3>Shop Through Our Platform</h3>
              <p>Click on any offer or store link before you shop online. Our tracking is automatic and secure.</p>
            </div>
            <div className="stepImageWrapper">
              <div className="stepIconBg">
                <FaShoppingBag className="stepIcon" />
              </div>
            </div>
          </div>
          
          <div className="step stepReverse animateOnScroll">
            <div className="stepContent">
              <div className="stepNumber">2</div>
              <h3>Complete Your Purchase</h3>
              <p>Shop normally at your favorite store's website. No promo codes or coupons needed to earn cash back.</p>
            </div>
            <div className="stepImageWrapper">
              <div className="stepIconBg">
                <FaMoneyBillWave className="stepIcon" />
              </div>
            </div>
          </div>
          
          <div className="step animateOnScroll">
            <div className="stepContent">
              <div className="stepNumber">3</div>
              <h3>Get Your Cash Back</h3>
              <p>Cash back is added to your account within 7 days. Withdraw to PayPal, bank account, or gift cards.</p>
            </div>
            <div className="stepImageWrapper">
              <div className="stepIconBg">
                <FaWallet className="stepIcon" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="ctaContainer">
          <h3>Ready to start earning?</h3>
          <p>Join thousands of smart shoppers who earn cash back on every purchase</p>
          <button className="primaryButton">
            Sign Up Now - It's Free <FaArrowRight className="buttonIcon" />
          </button>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className={styles.howItWorksSection} id="howItWorks">
        <div className={styles.sectionIntro}>
          <h2 className={styles.sectionTitle}>How Cash Back Works</h2>
          <p className={styles.sectionSubtitle}>Earning rewards is simple, transparent, and free</p>
        </div>
        
        <div className={styles.stepsContainer}>
          <div className={`${styles.step} ${styles.animateOnScroll}`}>
            <div className={styles.stepContent}>
              <div className={styles.stepNumber}>1</div>
              <h3>Shop Through Our Platform</h3>
              <p>Click on any offer or store link before you shop online. Our tracking is automatic and secure.</p>
            </div>
            <div className={styles.stepImageWrapper}>
              <div className={styles.stepIconBg}>
                <FaShoppingBag className={styles.stepIcon} />
              </div>
            </div>
          </div>
          
          <div className={`${styles.step} ${styles.stepReverse} ${styles.animateOnScroll}`}>
            <div className={styles.stepContent}>
              <div className={styles.stepNumber}>2</div>
              <h3>Complete Your Purchase</h3>
              <p>Shop normally at your favorite store's website. No promo codes or coupons needed to earn cash back.</p>
            </div>
            <div className={styles.stepImageWrapper}>
              <div className={styles.stepIconBg}>
                <FaMoneyBillWave className={styles.stepIcon} />
              </div>
            </div>
          </div>
          
          <div className={`${styles.step} ${styles.animateOnScroll}`}>
            <div className={styles.stepContent}>
              <div className={styles.stepNumber}>3</div>
              <h3>Get Your Cash Back</h3>
              <p>Cash back is added to your account within 7 days. Withdraw to PayPal, bank account, or gift cards.</p>
            </div>
            <div className={styles.stepImageWrapper}>
              <div className={styles.stepIconBg}>
                <FaWallet className={styles.stepIcon} />
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.ctaContainer}>
          <h3>Ready to start earning?</h3>
          <p>Join thousands of smart shoppers who earn cash back on every purchase</p>
          <button 
            className={styles.primaryButton}
            onClick={() => navigate('/signup')}
          >
            Sign Up Now - It's Free <FaArrowRight className={styles.buttonIcon} />
          </button>
        </div>
      </section>
      
      {/* FAQ Section - Accordion Style */}
      <section className="faqSection">
        <div className="sectionIntro">
          <h2 className="sectionTitle">Frequently Asked Questions</h2>
          <p className="sectionSubtitle">Everything you need to know about our cash back platform</p>
        </div>
        
        <div className="faqAccordion">
          {[
            {
              question: "How do I earn cash back?",
              answer: "Simply click through our links before you shop. We'll track your purchase and credit your account with the cash back you've earned. No codes or coupons needed!"
            },
            {
              question: "When will I receive my cash back?",
              answer: "Cash back typically appears in your account within 7 days of purchase, but can take up to 30 days depending on the store's verification process."
            },
            {
              question: "How do I withdraw my cash back?",
              answer: "Once your cash back is approved, you can withdraw it via PayPal, direct deposit, or convert it to gift cards from popular retailers."
            },
            {
              question: "Is there a minimum withdrawal amount?",
              answer: "Yes, you need to have at least $10 in your account to request a withdrawal. This helps us keep processing fees low."
            },
            {
              question: "Is it really free to use?",
              answer: "Yes! Our service is completely free to use. We earn a commission from stores when you make a purchase, and we share that commission with you as cash back."
            }
          ].map((faq, index) => (
            <details key={index} className="faqItem">
              <summary className="faqQuestion">
                {faq.question}
                <FaChevronDown className="faqIcon" />
              </summary>
              <div className="faqAnswer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
        
        <div className="faqFooter">
          <p>Still have questions?</p>
          <button className="secondaryButton">
            Contact Support <FaHeadset className="buttonIcon" />
          </button>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="finalCta">
        <div className="ctaBackground"></div>
        <div className="ctaContent">
          <h2>Start Earning Cash Back Today</h2>
          <p>Join over 500,000 members who save money every time they shop online</p>
          <div className="ctaButtons">
            <button 
              className="primaryButton"
              onClick={() => navigate('/signup')}
            >
              Sign Up Now - It's Free <FaArrowRight className="buttonIcon" />
            </button>
            <button 
              className="ghostButton"
              onClick={() => document.querySelector(`.${styles.tabsSection}`).scrollIntoView({ behavior: 'smooth' })}
            >
              Browse Deals
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SimpleCashBackPage;