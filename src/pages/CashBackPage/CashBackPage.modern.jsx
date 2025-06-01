// src/pages/CashBackPage/CashBackPage.modern.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingBag, FaMoneyBillWave, FaWallet, FaChevronDown, 
         FaArrowRight, FaStar, FaBolt, FaRegClock, FaGift, FaPercentage, 
         FaShieldAlt, FaHeadset, FaRegLightbulb } from 'react-icons/fa';
import CashBackCard from './CashBackCard';
import styles from './CashBackPage.modern.module.css';
import productImage from '../../assets/images/product-placeholder.js';

const CashBackPageModern = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('featured');
  const [cashbackOffers, setCashbackOffers] = useState([]);
  const [featuredOffers, setFeaturedOffers] = useState([]);

  // Simulated data fetch
  useEffect(() => {
    fetchCashbackOffers();
    
    // Add scroll animation for elements
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

  const fetchCashbackOffers = () => {
    // Simulated API call
    const mockFeaturedOffers = [
      {
        id: 1,
        discount: "20% Off",
        name: "Amazon Prime Membership",
        image: productImage,
        link: "https://amazon.com",
        storeName: "Amazon",
        cashbackRate: "5% Cash Back",
        expiryDate: "Dec 31, 2023",
        isHot: true,
        terms: "Valid for new Prime members only. Terms and conditions apply."
      },
      {
        id: 2,
        discount: "Up to $30 Off",
        name: "Walmart Online Orders",
        image: productImage,
        link: "https://walmart.com",
        storeName: "Walmart",
        cashbackRate: "3% Cash Back",
        expiryDate: "Nov 30, 2023",
        isHot: false,
        terms: "Minimum purchase of $50 required. Excludes grocery items."
      },
      {
        id: 3,
        discount: "Buy 1 Get 1 Free",
        name: "Target Home Essentials",
        image: productImage,
        link: "https://target.com",
        storeName: "Target",
        cashbackRate: "4% Cash Back",
        expiryDate: "Jan 15, 2024",
        isHot: true,
        terms: "Selected items only. Second item must be of equal or lesser value."
      },
      {
        id: 4,
        discount: "15% Off First Order",
        name: "Best Buy Electronics",
        image: productImage,
        link: "https://bestbuy.com",
        storeName: "Best Buy",
        cashbackRate: "2% Cash Back",
        expiryDate: "Dec 15, 2023",
        isHot: false,
        terms: "New customers only. Maximum discount of $100."
      }
    ];

    const mockOffers = [
      ...mockFeaturedOffers,
      {
        id: 5,
        discount: "10% Off",
        name: "Nike Sportswear",
        image: productImage,
        link: "https://nike.com",
        storeName: "Nike",
        cashbackRate: "8% Cash Back",
        expiryDate: "Nov 20, 2023",
        isHot: false,
        terms: "Excludes sale items and limited editions."
      },
      {
        id: 6,
        discount: "Free Shipping",
        name: "Apple Accessories",
        image: productImage,
        link: "https://apple.com",
        storeName: "Apple",
        cashbackRate: "2% Cash Back",
        expiryDate: "Dec 25, 2023",
        isHot: false,
        terms: "On orders over $50. US shipping addresses only."
      },
      {
        id: 7,
        discount: "25% Off",
        name: "Samsung Galaxy Phones",
        image: productImage,
        link: "https://samsung.com",
        storeName: "Samsung",
        cashbackRate: "6% Cash Back",
        expiryDate: "Jan 10, 2024",
        isHot: true,
        terms: "With eligible trade-in. Terms and conditions apply."
      },
      {
        id: 8,
        discount: "Buy 2 Get 1 Free",
        name: "Adidas Footwear",
        image: productImage,
        link: "https://adidas.com",
        storeName: "Adidas",
        cashbackRate: "5% Cash Back",
        expiryDate: "Nov 30, 2023",
        isHot: false,
        terms: "Selected styles only. Lowest priced item is free."
      }
    ];

    setFeaturedOffers(mockFeaturedOffers);
    setCashbackOffers(mockOffers);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching for: ${searchTerm}`);
    // Here you would typically filter results or make an API call
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
                onClick={() => document.querySelector(`.${styles.howItWorksSection}`).scrollIntoView({ behavior: 'smooth' })}
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
                onClick={() => {setSearchTerm(store); fetchCashbackOffers();}}
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
                {featuredOffers.map((offer) => (
                  <CashBackCard key={offer.id} {...offer} />
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
                      <img src={store.logo} alt={store.name} className={styles.storeLogo} />
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
      <section className={styles.howItWorksSection}>
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
      
      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.sectionIntro}>
          <h2 className={styles.sectionTitle}>Why Choose Our Cash Back Platform</h2>
          <p className={styles.sectionSubtitle}>We make saving money while shopping online effortless</p>
        </div>
        
        <div className={styles.benefitsGrid}>
          {[
            {
              icon: <FaPercentage />,
              title: "Higher Rates",
              description: "We negotiate exclusive cash back rates with top retailers"
            },
            {
              icon: <FaBolt />,
              title: "Fast Payouts",
              description: "Get your money quickly with our streamlined payment process"
            },
            {
              icon: <FaRegClock />,
              title: "Always Updated",
              description: "Our deals are refreshed daily with the latest offers"
            },
            {
              icon: <FaShieldAlt />,
              title: "Secure & Private",
              description: "Your shopping data is always protected and never sold"
            },
            {
              icon: <FaHeadset />,
              title: "Expert Support",
              description: "Our team is ready to help with any questions you have"
            },
            {
              icon: <FaGift />,
              title: "Bonus Rewards",
              description: "Earn extra cash back through our referral program"
            }
          ].map((benefit, index) => (
            <div key={index} className={`${styles.benefitCard} ${styles.animateOnScroll}`}>
              <div className={styles.benefitIcon}>{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionIntro}>
          <h2 className={styles.sectionTitle}>What Our Members Say</h2>
          <p className={styles.sectionSubtitle}>Join thousands of satisfied members earning cash back</p>
        </div>
        
        <div className={styles.testimonialsContainer}>
          {[
            {
              name: "Sarah J.",
              avatar: productImage,
              rating: 5,
              text: "I've earned over $500 in cash back this year alone! This platform has completely changed how I shop online.",
              date: "October 2023"
            },
            {
              name: "Michael T.",
              avatar: productImage,
              rating: 5,
              text: "The cash back rates are higher than any other site I've used, and the payouts are always on time. Highly recommend!",
              date: "September 2023"
            },
            {
              name: "Jessica L.",
              avatar: productImage,
              rating: 4,
              text: "Super easy to use and I love getting notifications about new deals. It's like getting paid to shop!",
              date: "November 2023"
            }
          ].map((testimonial, index) => (
            <div key={index} className={`${styles.testimonialCard} ${styles.animateOnScroll}`}>
              <div className={styles.testimonialHeader}>
                <img src={testimonial.avatar} alt={testimonial.name} className={styles.testimonialAvatar} />
                <div className={styles.testimonialMeta}>
                  <h4>{testimonial.name}</h4>
                  <div className={styles.testimonialRating}>
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < testimonial.rating ? styles.starFilled : styles.starEmpty} />
                    ))}
                  </div>
                </div>
              </div>
              <p className={styles.testimonialText}>"{testimonial.text}"</p>
              <div className={styles.testimonialDate}>{testimonial.date}</div>
            </div>
          ))}
        </div>
      </section>
      
      {/* FAQ Section - Accordion Style */}
      <section className={styles.faqSection}>
        <div className={styles.sectionIntro}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <p className={styles.sectionSubtitle}>Everything you need to know about our cash back platform</p>
        </div>
        
        <div className={styles.faqAccordion}>
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
            <details key={index} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                {faq.question}
                <FaChevronDown className={styles.faqIcon} />
              </summary>
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
        
        <div className={styles.faqFooter}>
          <p>Still have questions?</p>
          <button className={styles.secondaryButton}>
            Contact Support <FaHeadset className={styles.buttonIcon} />
          </button>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className={styles.finalCta}>
        <div className={styles.ctaBackground}></div>
        <div className={styles.ctaContent}>
          <h2>Start Earning Cash Back Today</h2>
          <p>Join over 500,000 members who save money every time they shop online</p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryButton}>
              Sign Up Now <FaArrowRight className={styles.buttonIcon} />
            </button>
            <button className={styles.ghostButton}>
              Browse Deals
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CashBackPageModern;