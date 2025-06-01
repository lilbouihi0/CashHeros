// src/pages/CashBackPage/CashBackPage.jsx
import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaChevronRight, FaChevronDown, FaShoppingBag, FaMoneyBillWave, FaWallet, FaQuestionCircle } from 'react-icons/fa';
import CashBackCard from './CashBackCard';
import styles from './CashBackPage.module.css';
import productImage from '../../Components/assets/1.jpg';
import { useAsyncOperation, usePagination } from '../../hooks';
import { AppContext } from '../../context/AppContext';
import { get } from '../../utils/apiUtils';
import Skeleton from '../../Components/Skeleton/Skeleton';
import Button from '../../Components/Button/Button';

// Fallback data in case API fails
const fallbackOffers = [
  { 
    id: 1, 
    discount: '53% OFF', 
    name: 'Pokemon Construx Charizard...', 
    image: productImage, 
    link: '#',
    storeName: 'Amazon',
    cashbackRate: '5% Cash Back',
    expiryDate: '2023-12-31'
  },
  { 
    id: 2, 
    discount: '43% OFF', 
    name: 'Amazon Fire TV 4-Series 4K HDR Smart TV', 
    image: productImage, 
    link: '#',
    storeName: 'Best Buy',
    cashbackRate: '3% Cash Back',
    expiryDate: '2023-12-15'
  },
  { 
    id: 3, 
    discount: '38% OFF', 
    name: 'Panasonic Nanoe Oscillating QuickDry Nozzle...', 
    image: productImage, 
    link: '#',
    storeName: 'Walmart',
    cashbackRate: '4% Cash Back'
  },
  { 
    id: 4, 
    discount: '35% OFF', 
    name: 'Apple AirTag Tracker (4-Pack)', 
    image: productImage, 
    link: '#',
    storeName: 'Apple Store',
    cashbackRate: '2% Cash Back',
    expiryDate: '2023-11-30'
  },
  { 
    id: 5, 
    discount: '40% OFF', 
    name: 'Sample Product 5', 
    image: productImage, 
    link: '#',
    storeName: 'Target',
    cashbackRate: '6% Cash Back'
  },
];

// Featured offers with higher cashback rates
const featuredOffers = [
  { 
    id: 101, 
    discount: '60% OFF', 
    name: 'Exclusive Deal: Samsung Galaxy S23 Ultra', 
    image: productImage, 
    link: '#',
    storeName: 'Samsung',
    cashbackRate: '10% Cash Back',
    expiryDate: '2023-11-15',
    isHot: true
  },
  { 
    id: 102, 
    discount: '50% OFF', 
    name: 'Limited Time: Dyson V12 Detect Slim', 
    image: productImage, 
    link: '#',
    storeName: 'Dyson',
    cashbackRate: '8% Cash Back',
    expiryDate: '2023-11-20',
    isHot: true
  },
  { 
    id: 103, 
    discount: '45% OFF', 
    name: 'Special Offer: Nike Air Max 2023', 
    image: productImage, 
    link: '#',
    storeName: 'Nike',
    cashbackRate: '12% Cash Back',
    isHot: true
  }
];

// FAQ data
const faqData = [
  {
    question: "What is cash back?",
    answer: "Cash back is a rewards program where you earn a percentage of your purchase amount back as a rebate. When you shop through our links, we receive a commission from the retailer, and we share a portion of that commission with you as cash back."
  },
  {
    question: "How do I earn cash back?",
    answer: "To earn cash back, simply click on any of our cash back offers before making a purchase. You'll be redirected to the retailer's website where you can shop normally. Your purchase will be tracked automatically, and the cash back will be credited to your account."
  },
  {
    question: "When will I receive my cash back?",
    answer: "Cash back typically appears in your account within 7 days of your purchase. However, it remains in a 'pending' status until the retailer confirms the purchase was not returned or canceled, which usually takes 30-90 days depending on the store's policy."
  },
  {
    question: "How do I withdraw my cash back?",
    answer: "Once your cash back is approved, you can withdraw it through various methods including PayPal, direct deposit, or gift cards. The minimum withdrawal amount is $10, and withdrawals are processed within 3-5 business days."
  },
  {
    question: "Why was my cash back declined?",
    answer: "Cash back may be declined if the purchase was returned, canceled, or if certain items in your order were not eligible for cash back. Some common reasons include using coupon codes not provided by our site, clearing cookies before completing your purchase, or purchasing items excluded from cash back programs."
  }
];

// Using named export to avoid issues with lazy loading
export const CashBackPage = () => {
  // Use our custom hooks for state management
  const { showNotification } = useContext(AppContext);
  
  // Pagination hook
  const pagination = usePagination({
    initialPage: 1,
    initialLimit: 9,
    onPageChange: () => fetchCashbackOffers()
  });
  
  // Async operations with loading and error states
  const cashbackOperation = useAsyncOperation({
    operationName: 'fetchCashbacks',
    showNotification: false
  });
  
  const categoryOperation = useAsyncOperation({
    operationName: 'fetchCategories',
    showNotification: false
  });
  
  // Local state
  const [cashbackOffers, setCashbackOffers] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedFaq, setExpandedFaq] = React.useState(null);
  const [showAllFeatured, setShowAllFeatured] = React.useState(false);

  useEffect(() => {
    fetchCashbackOffers();
    fetchCategories();
  }, [pagination.page, selectedCategory]);

  const fetchCashbackOffers = async () => {
    try {
      // Use a simpler approach to avoid potential issues with the async operation hook
      const params = {
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      };
      
      if (selectedCategory !== 'all') {
        params.params.category = selectedCategory;
      }
      
      if (searchTerm) {
        params.params.search = searchTerm;
      }
      
      // Set loading state manually
      cashbackOperation.setLoading(true);
      
      try {
        // Try to fetch data
        const data = await get('/cashbacks', params);
        
        // Check if data has the expected structure
        if (!data || !Array.isArray(data.cashbacks)) {
          console.error('Invalid response format:', data);
          throw new Error('Invalid response format from server');
        }
        
        setCashbackOffers(data.cashbacks || []);
        pagination.updateTotal(data.totalItems || data.totalCashbacks || 0);
        cashbackOperation.setLoading(false);
        return data;
      } catch (error) {
        // Handle API error
        console.error('API error:', error);
        cashbackOperation.setError('Failed to load cashback offers. Please try again later.');
        // Use fallback data
        setCashbackOffers(fallbackOffers);
        // Show notification
        showNotification('Using fallback data due to API error', 'warning');
        cashbackOperation.setLoading(false);
      }
    } catch (err) {
      console.error('Error in fetchCashbackOffers:', err);
      // Show more detailed error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', err.response || err.message || err);
      }
      // Use fallback data if API fails
      setCashbackOffers(fallbackOffers);
      // Show notification with more details
      showNotification(`Error loading cashbacks: ${err.message || 'Unknown error'}`, 'error');
      cashbackOperation.setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Set loading state manually
      categoryOperation.setLoading(true);
      
      try {
        // Try to fetch data
        const data = await get('/cashbacks/categories');
        
        // Check if data has the expected structure
        if (!data || !Array.isArray(data.categories)) {
          console.error('Invalid categories response format:', data);
          throw new Error('Invalid categories response format from server');
        }
        
        const fetchedCategories = data.categories || [];
        setCategories(fetchedCategories);
        categoryOperation.setLoading(false);
        return fetchedCategories;
      } catch (error) {
        // Handle API error
        console.error('API error for categories:', error);
        categoryOperation.setError('Failed to load categories. Using default categories instead.');
        // Set default categories
        setCategories(['Electronics', 'Fashion', 'Home', 'Beauty', 'Food', 'Travel']);
        categoryOperation.setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Show more detailed error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Categories error details:', err.response || err.message || err);
      }
      // Set some default categories if API fails
      setCategories(['Electronics', 'Fashion', 'Home', 'Beauty', 'Food', 'Travel']);
      // Don't show notification for categories error to avoid multiple error messages
      categoryOperation.setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    pagination.goToPage(1); // Reset to first page when changing category
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1); // Reset to first page when searching
    fetchCashbackOffers();
  };

  const handleRetry = () => {
    showNotification('Retrying to fetch cashback offers...', 'info');
    fetchCashbackOffers();
  };

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Enhanced Hero Section with Animation */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <div className={styles.heroShape}></div>
          <div className={styles.heroShape}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroTextContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleHighlight}>Earn Cash Back</span> on Every Purchase
            </h1>
            <p className={styles.heroSubtitle}>
              Shop through our links and earn up to <span className={styles.highlightText}>12% cash back</span> at thousands of stores
            </p>
            
            {/* Stats Counter */}
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>2,500+</span>
                <span className={styles.statLabel}>Stores</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>$1.2M+</span>
                <span className={styles.statLabel}>Paid Out</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>500K+</span>
                <span className={styles.statLabel}>Happy Users</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search for stores or products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </div>
            <div className={styles.popularSearches}>
              <span>Popular:</span>
              <button type="button" onClick={() => {setSearchTerm('Amazon'); fetchCashbackOffers();}}>Amazon</button>
              <button type="button" onClick={() => {setSearchTerm('Walmart'); fetchCashbackOffers();}}>Walmart</button>
              <button type="button" onClick={() => {setSearchTerm('Electronics'); fetchCashbackOffers();}}>Electronics</button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Offers Section */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrapper}>
            <h2 className={styles.featuredTitle}>Featured Cash Back Offers</h2>
            <p className={styles.sectionSubtitle}>Exclusive deals with higher cash back rates</p>
          </div>
          <button 
            className={styles.viewAllButton}
            onClick={() => setShowAllFeatured(!showAllFeatured)}
          >
            {showAllFeatured ? 'Show Less' : 'View All'}
          </button>
        </div>
        
        <div className={styles.featuredContainer}>
          {(showAllFeatured ? featuredOffers : featuredOffers.slice(0, 2)).map((offer) => (
            <CashBackCard key={offer.id} {...offer} />
          ))}
        </div>
      </section>
      
      {/* Trending Stores Section */}
      <section className={styles.trendingSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrapper}>
            <h2 className={styles.sectionTitle}>Trending Stores</h2>
            <p className={styles.sectionSubtitle}>Popular retailers with great cash back offers</p>
          </div>
        </div>
        
        <div className={styles.storesGrid}>
          {[
            { id: 201, name: "Amazon", logo: productImage, cashbackRate: "Up to 5%", isPopular: true },
            { id: 202, name: "Walmart", logo: productImage, cashbackRate: "3%", isPopular: true },
            { id: 203, name: "Target", logo: productImage, cashbackRate: "2%", isPopular: false },
            { id: 204, name: "Best Buy", logo: productImage, cashbackRate: "4%", isPopular: true },
            { id: 205, name: "Nike", logo: productImage, cashbackRate: "8%", isPopular: false },
            { id: 206, name: "Apple", logo: productImage, cashbackRate: "2%", isPopular: true }
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
      </section>

      {/* Category Filter */}
      <section className={styles.filterSection}>
        <div className={styles.categoryFilters}>
          <button 
            className={`${styles.categoryButton} ${selectedCategory === 'all' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Cash Back Offers Section */}
      <section className={styles.cashBackSection}>
        <h2 className={styles.sectionTitle}>All Cash Back Offers</h2>
        
        {cashbackOperation.error && (
          <div className={styles.errorContainer}>
            <div className={styles.errorMessage}>
              <h3>Something went wrong</h3>
              <p>{cashbackOperation.error}</p>
              <div className={styles.errorActions}>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Try Again
                </button>
                <Link to="/" className={styles.homeButton}>
                  Go to Homepage
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {cashbackOperation.loading ? (
          <div className={styles.skeletonContainer}>
            <Skeleton type="card" count={9} className={styles.skeletonCard} />
          </div>
        ) : cashbackOffers.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No cashback offers available for this category.</p>
            <p>Please check back later or try a different category.</p>
          </div>
        ) : (
          <div className={styles.offersGrid}>
            {cashbackOffers.map((offer) => (
              <CashBackCard key={offer.id} {...offer} />
            ))}
          </div>
        )}
        
        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button
              variant="secondary"
              disabled={!pagination.hasPrevPage || cashbackOperation.loading}
              onClick={pagination.prevPage}
              size="small"
            >
              Previous
            </Button>
            <span className={styles.pageInfo}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={!pagination.hasNextPage || cashbackOperation.loading}
              onClick={pagination.nextPage}
              size="small"
            >
              Next
            </Button>
          </div>
        )}
      </section>
      
      {/* Enhanced How It Works Section with Animation */}
      <section className={styles.howItWorksSection}>
        <div className={styles.sectionTitleWrapper}>
          <h2 className={styles.sectionTitle}>How Cash Back Works</h2>
          <p className={styles.sectionSubtitle}>Earning cash back is simple and rewarding</p>
        </div>
        
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepIconWrapper}>
              <FaShoppingBag className={styles.stepIcon} />
            </div>
            <div className={styles.stepNumber}>1</div>
            <h3>Shop Through Our Links</h3>
            <p>Click on any cashback offer to shop at your favorite stores. We'll track your visit automatically.</p>
            <div className={styles.stepArrow}></div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepIconWrapper}>
              <FaMoneyBillWave className={styles.stepIcon} />
            </div>
            <div className={styles.stepNumber}>2</div>
            <h3>Make Your Purchase</h3>
            <p>Shop normally at the store's website - no promo codes or coupons needed to earn cash back.</p>
            <div className={styles.stepArrow}></div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepIconWrapper}>
              <FaWallet className={styles.stepIcon} />
            </div>
            <div className={styles.stepNumber}>3</div>
            <h3>Earn Cash Back</h3>
            <p>Cash back will be credited to your account within 7 days. Withdraw anytime after it's approved.</p>
          </div>
        </div>
        
        <div className={styles.howItWorksFooter}>
          <p>Join thousands of smart shoppers who earn cash back on every purchase</p>
          <button className={styles.signUpButton}>Sign Up Now - It's Free</button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqContainer}>
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${expandedFaq === index ? styles.expanded : ''}`}
            >
              <div 
                className={styles.faqQuestion}
                onClick={() => toggleFaq(index)}
              >
                <FaQuestionCircle className={styles.faqIcon} />
                <h3>{faq.question}</h3>
                {expandedFaq === index ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedFaq === index && (
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={styles.faqFooter}>
          <p>Have more questions? <Link to="/support" className={styles.supportLink}>Contact our support team</Link></p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Start Earning?</h2>
          <p>Join thousands of smart shoppers who save money with our cash back offers every day.</p>
          <div className={styles.ctaButtons}>
            <Link to="/signup" className={styles.primaryCtaButton}>Sign Up Now - It's Free</Link>
            <Link to="/stores" className={styles.secondaryCtaButton}>Browse All Stores</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Also keep the default export for compatibility
export default CashBackPage;