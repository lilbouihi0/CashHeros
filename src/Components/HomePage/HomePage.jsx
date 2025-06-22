import React, { Suspense, lazy, useContext, useState } from 'react';
import { useData } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import styles from './HomePage.module.css';
import placeholderImage from '../../assets/placeholder.js';
import homeImages from '../../assets/images/homeImages';
import AIRecommendations from '../AIRecommendations/AIRecommendations.jsx';
import { Link } from 'react-router-dom';

// Adjust imports to handle named exports with error handling
const Slider = lazy(() => 
  import('./Slider/Slider.jsx')
    .then(module => ({ default: module.default || module.Slider }))
    .catch(error => {
      console.error('Error loading Slider:', error);
      return { default: () => <div>Error loading component</div> };
    })
);

// Test slider for debugging
const TestSlider = lazy(() => import('./Slider/TestSlider.jsx'));

const CouponsCard = lazy(() => 
  import('./CouponsCard/CouponsCard.jsx')
    .then(module => ({ default: module.default || module.CouponsCard }))
    .catch(error => {
      console.error('Error loading CouponsCard:', error);
      return { default: () => <div>Error loading component</div> };
    })
);

const CashBack = lazy(() => 
  import('./CashBack/CashBack.jsx')
    .then(module => ({ default: module.default || module.CashBack }))
    .catch(error => {
      console.error('Error loading CashBack:', error);
      return { default: () => <div>Error loading component</div> };
    })
);

const CashDesc = lazy(() => 
  import('./CashDesc/CashDesc.jsx')
    .then(module => ({ default: module.default || module.CashDesc }))
    .catch(error => {
      console.error('Error loading CashDesc:', error);
      return { default: () => <div>Error loading component</div> };
    })
);

const Deals = lazy(() => 
  import('./Deals/Deals.jsx')
    .then(module => ({ default: module.default || module.Deals }))
    .catch(error => {
      console.error('Error loading Deals:', error);
      return { default: () => <div>Error loading component</div> };
    })
);

const TodayDeals = lazy(() => 
  import('./TodayDeals/TodayDeals.jsx')
    .then(module => ({ default: module.default || module.TodayDeals }))
    .catch(error => {
      console.error('Error loading TodayDeals:', error);
      return { default: () => <div>Error loading component</div> };
    })
);

const TopStore = lazy(() => 
  import('./TopStore/TopStore.jsx')
    .then(module => ({ default: module.default || module.TopStore }))
    .catch(error => {
      console.error('Error loading TopStore:', error);
      return { default: () => <div>Error loading component</div> };
    })
);

// Define the FavoriteStore component directly in this file to avoid lazy loading issues
const FavoriteStore = ({ percent, storeName, logo }) => {
  return (
    <div className={styles.favoriteStore}>
      <div className={styles.storeImage}>
        <img src={logo || placeholderImage} alt={storeName || "Favorite Store"} />
      </div>
      <div className={styles.storeDetails}>
        <b className={styles.cashbackPercent}>{percent}% Cash Back</b>
        {storeName && <span className={styles.storeName}>{storeName}</span>}
      </div>
    </div>
  );
};

// New component for trending deals with horizontal scroll
const TrendingDeals = ({ deals = [] }) => {
  // Array of product images from our homeImages
  const productImages = [
    homeImages.productImage1,
    homeImages.productImage2,
    homeImages.productImage3,
    homeImages.productImage4,
    homeImages.productImage5
  ];

  return (
    <div className={styles.trendingDealsContainer}>
      <div className={styles.trendingDealsScroll}>
        {Array.isArray(deals) && deals.map((deal, index) => (
          <div key={deal.id || index} className={styles.trendingDealCard}>
            <div className={styles.trendingDealImage}>
              <img 
                src={deal.image || productImages[index % productImages.length]} 
                alt={deal.title} 
              />
              <span className={styles.trendingLabel}>Trending</span>
            </div>
            <div className={styles.trendingDealContent}>
              <h3>{deal.title}</h3>
              <p className={styles.trendingDealBrand}>{deal.brand}</p>
              <button className={styles.getCodeButton}>Get Code</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// New component for search bar
const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchTerm);
  };
  
  return (
    <div className={styles.searchBarContainer}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Search for stores, coupons, or deals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>
      <div className={styles.popularSearches}>
        <span>Popular:</span>
        <Link to="/stores/amazon">Amazon</Link>
        <Link to="/stores/walmart">Walmart</Link>
        <Link to="/stores/target">Target</Link>
      </div>
    </div>
  );
};

// New component for newsletter subscription
const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log('Subscribing email:', email);
    setSubscribed(true);
    setEmail('');
    
    // Reset the subscribed state after 5 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };
  
  return (
    <div 
      className={styles.newsletterContainer}
      style={{ 
        backgroundImage: `url(${homeImages.bannerImage2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className={styles.newsletterContent}>
        <h2>Never Miss a Deal!</h2>
        <p>Subscribe to our newsletter and get the best deals delivered to your inbox.</p>
        
        {subscribed ? (
          <div className={styles.successMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Thanks for subscribing!</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className={styles.subscriptionForm}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.emailInput}
            />
            <button type="submit" className={styles.subscribeButton}>Subscribe</button>
          </form>
        )}
        
        <div className={styles.newsletterBenefits}>
          <div className={styles.benefit}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Exclusive deals</span>
          </div>
          <div className={styles.benefit}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Weekly updates</span>
          </div>
          <div className={styles.benefit}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>No spam, unsubscribe anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Section component with view all link option
const Section = ({ title, children, viewAllLink }) => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      <h2>{title}</h2>
      {viewAllLink && (
        <Link to={viewAllLink} className={styles.viewAllLink}>
          View All
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      )}
    </div>
    <div className={styles.cardsGrid}>{children}</div>
  </section>
);

// Category Pills component
const CategoryPills = () => {
  const categories = [
    { name: 'All', icon: '🏠' },
    { name: 'Electronics', icon: '📱' },
    { name: 'Fashion', icon: '👕' },
    { name: 'Food', icon: '🍔' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Beauty', icon: '💄' },
    { name: 'Home', icon: '🏡' }
  ];
  
  return (
    <div className={styles.categoryPillsContainer}>
      {categories.map((category, index) => (
        <Link key={index} to={`/category/${category.name.toLowerCase()}`} className={styles.categoryPill}>
          <span className={styles.categoryIcon}>{category.icon}</span>
          <span className={styles.categoryName}>{category.name}</span>
        </Link>
      ))}
    </div>
  );
};

// Helper function to get store logo based on index
const getStoreLogo = (index) => {
  const storeLogos = [
    homeImages.amazonLogo,
    homeImages.walmartLogo,
    homeImages.targetLogo,
    homeImages.bestBuyLogo,
    homeImages.macysLogo
  ];
  return storeLogos[index % storeLogos.length];
};

const HomePage = () => {
  const { coupons = [], cashBacks = [], deals = [] } = useData();
  const { isAuthenticated, user } = useContext(AuthContext);

  // Mock user preferences for AI recommendations
  const userPreferences = {
    categories: ['electronics', 'fashion', 'food'],
    favoriteStores: ['Amazon', 'Walmart', 'Target']
  };

  return (
    <div className={styles.homePage}>
      <header className={styles.heroSection}>
        <Suspense fallback={<div>Loading...</div>}>
          <Slider />
        </Suspense>
      </header>

      <main className={styles.mainContent}>
        {/* Category pills for quick navigation */}
        <CategoryPills />
        
        {/* Show AI recommendations for authenticated users */}
        {isAuthenticated && user && (
          <div className={styles.aiRecommendationsWrapper}>
            <AIRecommendations 
              userId={user.id} 
              preferences={userPreferences} 
            />
          </div>
        )}
        
        {/* Enhanced Coupons & Promo Codes Section */}
        <section className={styles.enhancedCouponsSection}>
          <h2 className={styles.sectionTitle}>★ TOP COUPONS ★</h2>
          <div className={styles.featuredCoupon}>
            {Array.isArray(coupons) && coupons.length > 0 && (
              <div className={styles.featuredCouponCard}>
                <div className={styles.featuredCouponImage}>
                  <img src={coupons[0].image || homeImages.couponImage1} alt={coupons[0].brand} />
                  <div className={styles.featuredBadge}>Featured</div>
                </div>
                <div className={styles.featuredCouponContent}>
                  <div className={styles.featuredCouponBrand}>{coupons[0].brand}</div>
                  <h3 className={styles.featuredCouponTitle}>{coupons[0].title}</h3>
                  <p className={styles.featuredCouponDescription}>
                    Save big with this exclusive offer from {coupons[0].brand}. Limited time only!
                  </p>
                  <div className={styles.featuredCouponCode}>
                    <span>{coupons[0].code || 'SAVE20'}</span>
                    <button 
                      className={styles.copyCodeButton}
                      onClick={() => {
                        const code = coupons[0].code || 'SAVE20';
                        navigator.clipboard.writeText(code)
                          .then(() => {
                            // Change button text temporarily
                            const button = document.querySelector(`.${styles.copyCodeButton}`);
                            const originalHTML = button.innerHTML;
                            button.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Copied!
                            `;
                            
                            // Reset after 3 seconds
                            setTimeout(() => {
                              button.innerHTML = originalHTML;
                            }, 3000);
                          })
                          .catch(err => {
                            console.error('Failed to copy code: ', err);
                          });
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy
                    </button>
                  </div>
                  <Link to={`/stores/${coupons[0].brand?.toLowerCase().replace(/\s+/g, '-')}`} className={styles.shopNowLink}>
                    Shop Now
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.couponsGrid}>
            {Array.isArray(coupons) && coupons.map((coupon, index) => {
              // Skip the first coupon as it's already featured
              if (index === 0) return null;
              
              return (
                <CouponsCard 
                  key={coupon.id} 
                  {...coupon} 
                  discount={coupon.discount || `${Math.floor(Math.random() * 30) + 10}% OFF`}
                  expiryDate={coupon.expiryDate || new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()}
                  code={coupon.code || `SAVE${Math.floor(Math.random() * 50) + 10}`}
                />
              );
            })}
          </div>
          
          <div className={styles.couponsSectionFooter}>
            <div className={styles.couponStats}>
              <div className={styles.couponStat}>
                <span className={styles.statNumber}>1000+</span>
                <span className={styles.statLabel}>Active Coupons</span>
              </div>
              <div className={styles.couponStat}>
                <span className={styles.statNumber}>50+</span>
                <span className={styles.statLabel}>Top Brands</span>
              </div>
              <div className={styles.couponStat}>
                <span className={styles.statNumber}>$500K+</span>
                <span className={styles.statLabel}>Saved by Users</span>
              </div>
            </div>
            <Link to="/coupons" className={styles.exploreAllCouponsButton}>
              Explore All Coupons
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </section>
        
        {/* Enhanced Cash Back Offers Section */}
        <section className={styles.enhancedCashBackSection}>
          <h2 className={styles.sectionTitle}>★ CASH BACK ★</h2>
          
          <div className={styles.cashBackIntro}>
            <div className={styles.cashBackInfoCard}>
              <div className={styles.cashBackInfoIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
              <h3>How Cash Back Works</h3>
              <p>Shop through our links and earn a percentage of your purchase back as cash rewards.</p>
              <Link to="/how-cashback-works" className={styles.learnMoreLink}>Learn More</Link>
            </div>
          </div>
          
          <div className={styles.cashBackGrid}>
            {Array.isArray(cashBacks) && cashBacks.map((cashBack, index) => (
              <CashBack 
                key={cashBack.id || index} 
                percent={cashBack.percent} 
                storeName={cashBack.storeName || ['Amazon', 'Walmart', 'Target', 'Best Buy', 'Macy\'s', 'Nike', 'Adidas', 'Apple'][index % 8]}
                category={cashBack.category || ['Fashion', 'Electronics', 'Home', 'Beauty', 'Travel', 'Food'][index % 6]}
                logo={cashBack.logo}
                storeUrl={cashBack.storeUrl}
              />
            ))}
          </div>
          
          <div className={styles.cashBackPromo}>
            <div className={styles.promoContent}>
              <h3>Boost Your Cash Back</h3>
              <p>Sign up for our newsletter to receive exclusive cash back offers and promotions.</p>
              <form className={styles.promoForm}>
                <input type="email" placeholder="Your email address" className={styles.promoInput} />
                <button type="submit" className={styles.promoButton}>Subscribe</button>
              </form>
            </div>
            <div className={styles.promoImage}>
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          
          <div className={styles.cashBackFooter}>
            <Link to="/cashback" className={styles.viewAllCashBackButton}>
              View All Cash Back Offers
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </section>
        
        {/* Newsletter subscription */}
        <NewsletterSubscription />
        {/* Enhanced Top Deals Section */}
        <section className={styles.enhancedDealsSection}>
          <div className={styles.sectionHeader}>
            <h2>Top Deals</h2>
            <Link to="/deals" className={styles.viewAllLink}>
              View All
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
          
          <div className={styles.dealsIntro}>
            <div className={styles.dealsBanner}>
              <div className={styles.dealsHighlight}>
                <h3>Exclusive Deals</h3>
                <p>Save big with our handpicked deals from top brands. Limited time offers updated daily.</p>
                <Link to="/deals/hot" className={styles.hotDealsButton}>
                  Hot Deals
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          <div className={styles.dealsCategoriesNav}>
            {['All Deals', 'Electronics', 'Fashion', 'Home', 'Travel', 'Beauty', 'Sports'].map((category, index) => (
              <button 
                key={category}
                className={`${styles.dealsCategoryButton} ${index === 0 ? styles.active : ''}`}
                onClick={(e) => {
                  // Remove active class from all buttons
                  e.currentTarget.parentElement.querySelectorAll(`.${styles.dealsCategoryButton}`).forEach(btn => {
                    btn.classList.remove(styles.active);
                  });
                  // Add active class to clicked button
                  e.currentTarget.classList.add(styles.active);
                  
                  // Here you would typically filter deals by category
                  console.log(`Filtering deals by ${category}`);
                }}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className={styles.dealsGrid}>
          
          {Array.isArray(deals) && deals.map((deal, index) => (
              <Deals 
                key={deal.id || index} 
                brand={deal.brand} 
                title={deal.title}
                discount={deal.discount || `${Math.floor(Math.random() * 70) + 10}%`}
                originalPrice={deal.originalPrice || (Math.floor(Math.random() * 900) + 100)}
                salePrice={deal.salePrice || (Math.floor(Math.random() * 500) + 50)}
                expiryDate={deal.expiryDate || new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()}
                category={deal.category || ['Electronics', 'Fashion', 'Home', 'Travel', 'Beauty', 'Sports'][index % 6]}
                image={deal.image}
                dealUrl={deal.dealUrl}
              />
            ))}
          </div>
          
          <div className={styles.dealsFooter}>
            <div className={styles.dealsStats}>
              <div className={styles.dealsStat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Active Deals</span>
              </div>
              <div className={styles.dealsStat}>
                <span className={styles.statNumber}>70%</span>
                <span className={styles.statLabel}>Avg. Discount</span>
              </div>
              <div className={styles.dealsStat}>
                <span className={styles.statNumber}>24h</span>
                <span className={styles.statLabel}>Daily Updates</span>
              </div>
            </div>
            
            <Link to="/deals" className={styles.viewAllDealsButton}>
              Explore All Deals
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </section>
        
        {/* Enhanced Favorite Stores Section */}
        <section className={styles.enhancedFavoriteStoresSection}>
          <div className={styles.sectionHeader}>
            <h2>Favorite Stores</h2>
            <Link to="/stores" className={styles.viewAllLink}>
              View All
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
          
          <div className={styles.favoriteStoresIntro}>
            <p>Shop at your favorite stores and earn cash back on every purchase. These are the most popular stores among our users.</p>
          </div>
          
          <div className={styles.favoriteStoresGrid}>
            {Array.isArray(cashBacks) && cashBacks.map((cashBack, index) => (
              <div key={cashBack.id || index} className={styles.favoriteStoreCard}>
                <div className={styles.storeLogoContainer}>
                  <img 
                    src={cashBack.logo || getStoreLogo(index)} 
                    alt={cashBack.storeName || `Store ${index + 1}`} 
                    className={styles.storeLogo}
                  />
                  {index < 3 && (
                    <div className={styles.popularBadge}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span>Popular</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.storeInfo}>
                  <h3 className={styles.storeName}>{cashBack.storeName || ['Amazon', 'Walmart', 'Target', 'Best Buy', 'Macy\'s', 'Nike', 'Adidas', 'Apple'][index % 8]}</h3>
                  <div className={styles.cashbackRate}>
                    <span className={styles.rateValue}>{cashBack.percent}%</span>
                    <span className={styles.rateLabel}>Cash Back</span>
                  </div>
                </div>
                
                <div className={styles.storeActions}>
                  <Link to={`/stores/${(cashBack.storeName || 'store').toLowerCase().replace(/\s+/g, '-')}`} className={styles.shopNowButton}>
                    Shop Now
                  </Link>
                  <button className={styles.favoriteButton} aria-label="Add to favorites">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.favoriteStoresFooter}>
            <Link to="/stores" className={styles.viewAllStoresButton}>
              View All Stores
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </section>
        
        {/* Enhanced Today's Top Deals Section */}
        <section className={styles.enhancedTodayDealsSection}>
          <div className={styles.dealsBanner}>
            <img src={homeImages.bannerImage1} alt="Special Holiday Deals" className={styles.dealsBannerImage} />
          </div>
          
          <div className={styles.sectionHeader}>
            <h2>Today's Top Deals</h2>
            <Link to="/deals/today" className={styles.viewAllLink}>
              View All
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
          
          <div className={styles.todayDealsTimer}>
            <div className={styles.timerIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className={styles.timerInfo}>
              <span className={styles.timerLabel}>Deals refresh in:</span>
              <div className={styles.timerUnits}>
                <div className={styles.timerUnit}>
                  <span className={styles.timerValue}>12</span>
                  <span className={styles.timerUnitLabel}>Hours</span>
                </div>
                <div className={styles.timerSeparator}>:</div>
                <div className={styles.timerUnit}>
                  <span className={styles.timerValue}>45</span>
                  <span className={styles.timerUnitLabel}>Mins</span>
                </div>
                <div className={styles.timerSeparator}>:</div>
                <div className={styles.timerUnit}>
                  <span className={styles.timerValue}>30</span>
                  <span className={styles.timerUnitLabel}>Secs</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.todayDealsCarousel}>
            <button className={styles.carouselArrow} aria-label="Previous deals">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <div className={styles.todayDealsGrid}>
              {Array.isArray(deals) && deals.map((deal, index) => (
                <div key={deal.id || index} className={styles.todayDealCard}>
                  <div className={styles.todayDealHeader}>
                    <div className={styles.todayDealDiscount}>
                      {deal.promo || "10%"} OFF
                    </div>
                    <div className={styles.todayDealBadge}>
                      {index < 3 ? "HOT" : "TODAY"}
                    </div>
                  </div>
                  
                  <div className={styles.todayDealImageContainer}>
                    <img 
                      src={deal.image || homeImages[`productImage${(index % 5) + 1}`]} 
                      alt={deal.title} 
                      className={styles.todayDealImage} 
                    />
                  </div>
                  
                  <div className={styles.todayDealContent}>
                    <h3 className={styles.todayDealTitle}>{deal.title}</h3>
                    <div className={styles.todayDealStore}>
                      {deal.brand || ['Amazon', 'Walmart', 'Target', 'Best Buy', 'Macy\'s'][index % 5]}
                    </div>
                    
                    <div className={styles.todayDealPrices}>
                      <span className={styles.todayDealSalePrice}>
                        ${deal.salePrice || (Math.floor(Math.random() * 500) + 50).toFixed(2)}
                      </span>
                      <span className={styles.todayDealOriginalPrice}>
                        ${deal.originalPrice || (Math.floor(Math.random() * 900) + 100).toFixed(2)}
                      </span>
                    </div>
                    
                    <Link to={deal.dealUrl || "#"} className={styles.checkPriceButton}>
                      Check Price
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </Link>
                  </div>
                  
                  <div className={styles.todayDealFooter}>
                    <div className={styles.todayDealExpiry}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>Ends Today</span>
                    </div>
                    
                    <button className={styles.todayDealSaveButton} aria-label="Save deal">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button className={styles.carouselArrow} aria-label="Next deals">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          
          <div className={styles.todayDealsFooter}>
            <Link to="/deals/today" className={styles.viewAllTodayDealsButton}>
              View All Today's Deals
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </section>
        
        {/* Enhanced Top Stores Section */}
        <section className={styles.enhancedTopStoresSection}>
          <div className={styles.sectionHeader}>
            <h2>Top Stores</h2>
            <Link to="/stores/top" className={styles.viewAllLink}>
              View All
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
          
          <div className={styles.topStoresIntro}>
            <p>These stores offer the highest cash back rates and are trusted by millions of shoppers.</p>
          </div>
          
          <div className={styles.topStoresFilter}>
            <button className={`${styles.topStoresFilterButton} ${styles.active}`}>All Categories</button>
            <button className={styles.topStoresFilterButton}>Fashion</button>
            <button className={styles.topStoresFilterButton}>Electronics</button>
            <button className={styles.topStoresFilterButton}>Home</button>
            <button className={styles.topStoresFilterButton}>Beauty</button>
            <button className={styles.topStoresFilterButton}>Travel</button>
          </div>
          
          <div className={styles.topStoresGrid}>
            {Array.isArray(cashBacks) && cashBacks.map((cashBack, index) => (
              <div key={cashBack.id || index} className={styles.topStoreCard}>
                <div className={styles.topStoreRank}>
                  <span className={styles.rankNumber}>{index + 1}</span>
                </div>
                
                <div className={styles.topStoreLogoContainer}>
                  <img 
                    src={cashBack.logo || getStoreLogo(index)} 
                    alt={cashBack.storeName || `Store ${index + 1}`} 
                    className={styles.topStoreLogo}
                  />
                </div>
                
                <div className={styles.topStoreInfo}>
                  <h3 className={styles.topStoreName}>
                    {cashBack.storeName || ['Amazon', 'Walmart', 'Target', 'Best Buy', 'Macy\'s', 'Nike', 'Adidas', 'Apple'][index % 8]}
                  </h3>
                  
                  <div className={styles.topStoreCategory}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    <span>
                      {cashBack.category || ['Fashion', 'Electronics', 'Home', 'Beauty', 'Travel', 'Food'][index % 6]}
                    </span>
                  </div>
                  
                  <div className={styles.topStoreCashback}>
                    <span className={styles.topStoreCashbackValue}>{cashBack.percent}%</span>
                    <span className={styles.topStoreCashbackLabel}>Cash Back</span>
                  </div>
                  
                  <div className={styles.topStoreRating}>
                    <div className={styles.ratingStars}>
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24" 
                          fill={i < 4 ? "currentColor" : "none"} 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className={styles.ratingStar}
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ))}
                    </div>
                    <span className={styles.ratingValue}>4.{Math.floor(Math.random() * 10)}</span>
                  </div>
                </div>
                
                <div className={styles.topStoreActions}>
                  <Link 
                    to={`/stores/${(cashBack.storeName || 'store').toLowerCase().replace(/\s+/g, '-')}`} 
                    className={styles.topStoreShopButton}
                  >
                    Shop Now
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                  
                  <button className={styles.topStoreFavoriteButton} aria-label="Add to favorites">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.topStoresFooter}>
            <Link to="/stores/top" className={styles.viewAllTopStoresButton}>
              View All Top Stores
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </section>
        
        {/* Enhanced Why Cash Back Section */}
        <section className={styles.enhancedWhyCashBackSection}>
          <div className={styles.sectionHeader}>
            <h2>Why Cash Back?</h2>
          </div>
          
          <div className={styles.whyCashBackContent}>
            <div className={styles.whyCashBackIntro}>
              <h3>Earn Money While You Shop</h3>
              <p>Cash back is a simple way to save money on your everyday purchases. When you shop through our links, we earn a commission from the store, and we share that commission with you as cash back.</p>
            </div>
            
            <div className={styles.whyCashBackCards}>
              <div className={styles.whyCashBackCard}>
                <div className={styles.whyCashBackIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </div>
                <h4>Free to Use</h4>
                <p>No membership fees or hidden costs. Simply shop through our links and earn cash back on your purchases.</p>
              </div>
              
              <div className={styles.whyCashBackCard}>
                <div className={styles.whyCashBackIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <h4>Shop Online</h4>
                <p>Shop at your favorite online stores through our website or app and earn cash back on your purchases.</p>
              </div>
              
              <div className={styles.whyCashBackCard}>
                <div className={styles.whyCashBackIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h4>Get Paid</h4>
                <p>Cash out your earnings via PayPal, direct deposit, or gift cards once you reach the minimum payout threshold.</p>
              </div>
            </div>
            
            <div className={styles.whyCashBackSteps}>
              <h3>How It Works</h3>
              <div className={styles.stepsContainer}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h4>Find a Store</h4>
                    <p>Browse our selection of over 10,000 stores and find the one you want to shop at.</p>
                  </div>
                </div>
                
                <div className={styles.stepArrow}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
                
                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h4>Click Through</h4>
                    <p>Click on the store link to be redirected to their website. This activates your cash back.</p>
                  </div>
                </div>
                
                <div className={styles.stepArrow}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
                
                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h4>Shop Normally</h4>
                    <p>Shop as you normally would. Your purchase will be tracked automatically.</p>
                  </div>
                </div>
                
                <div className={styles.stepArrow}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
                
                <div className={styles.step}>
                  <div className={styles.stepNumber}>4</div>
                  <div className={styles.stepContent}>
                    <h4>Earn Cash Back</h4>
                    <p>Your cash back will be credited to your account once the purchase is confirmed.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.whyCashBackCTA}>
              <h3>Ready to Start Earning?</h3>
              <p>Join millions of smart shoppers who save money every day with Cash Heros.</p>
              <div className={styles.whyCashBackButtons}>
                <Link to="/signup" className={styles.signupButton}>
                  Sign Up - It's Free
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
                <Link to="/how-it-works" className={styles.learnMoreButton}>
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// Export as both named export (for backward compatibility) and default export
export { HomePage };
export default HomePage;