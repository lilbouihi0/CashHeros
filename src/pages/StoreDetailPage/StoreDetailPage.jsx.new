import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { 
  FaPercent, 
  FaTag, 
  FaClock, 
  FaInfoCircle, 
  FaExternalLinkAlt, 
  FaCopy, 
  FaCheck,
  FaStar,
  FaThumbsUp,
  FaThumbsDown,
  FaShoppingBag,
  FaHistory,
  FaQuestionCircle
} from 'react-icons/fa';
import styles from './StoreDetailPage.module.css';

export const StoreDetailPage = () => {
  const { brand: brandParam } = useParams();
  const { 
    cashBacks = [], 
    coupons = [], 
    deals = [], 
    loading = {}, 
    error = {}, 
    fetchCashBacks, 
    fetchCoupons, 
    fetchDeals 
  } = useData() || {};
  const [activeTab, setActiveTab] = useState('cashback');
  const [copiedCode, setCopiedCode] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Ensure data is loaded when component mounts
  useEffect(() => {
    // Set initial loading state
    setPageLoading(true);
    
    // Always fetch data when the component mounts to ensure we have the latest
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchCashBacks(),
          fetchCoupons(),
          fetchDeals()
        ]);
        
        // Set loading to false after all data is fetched
        setPageLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setPageLoading(false);
      }
    };
    
    fetchAllData();
    
    // Set up a timer to retry if data isn't loaded after a short delay
    const retryTimer = setTimeout(() => {
      if (cashBacks.length === 0 || coupons.length === 0 || deals.length === 0) {
        console.log('Retrying data fetch...');
        fetchAllData();
      }
    }, 2000); // 2 second delay before retry
    
    // Clean up the timer if the component unmounts
    return () => clearTimeout(retryTimer);
  }, [fetchCashBacks, fetchCoupons, fetchDeals]);
  
  // Update loading state when data changes
  useEffect(() => {
    console.log('Data state:', {
      cashBacksLength: cashBacks.length,
      couponsLength: coupons.length,
      dealsLength: deals.length,
      loading,
      pageLoading
    });
    
    if (cashBacks.length > 0) {
      setPageLoading(false);
    }
  }, [cashBacks.length, coupons.length, deals.length, loading]);

  // Check if brandParam is a numeric ID or a brand name slug
  const isNumericId = !isNaN(parseInt(brandParam, 10));
  
  // Format the brand name from URL slug if it's not a numeric ID
  const formattedBrand = !isNumericId && brandParam 
    ? brandParam
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';
  
  // Find store data - handle both numeric IDs and brand names
  const storeData = Array.isArray(cashBacks) && brandParam
    ? isNumericId
      // If it's a numeric ID, find by ID
      ? cashBacks.find(store => store.id === parseInt(brandParam, 10))
      // Otherwise find by brand name
      : cashBacks.find(
          store => store.brand.toLowerCase() === formattedBrand.toLowerCase()
        )
    : null;
  
  // Filter coupons and deals for this store - ensure arrays exist before filtering
  const storeCoupons = Array.isArray(coupons) && storeData
    ? isNumericId
      // If it's a numeric ID, filter by store ID
      ? coupons.filter(coupon => coupon.storeId === parseInt(brandParam, 10) || 
                                 (storeData && coupon.brand.toLowerCase() === storeData.brand.toLowerCase()))
      // Otherwise filter by brand name
      : coupons.filter(coupon => coupon.brand.toLowerCase() === formattedBrand.toLowerCase())
    : [];
  
  const storeDeals = Array.isArray(deals) && storeData
    ? isNumericId
      // If it's a numeric ID, filter by store ID
      ? deals.filter(deal => deal.storeId === parseInt(brandParam, 10) || 
                            (storeData && deal.brand.toLowerCase() === storeData.brand.toLowerCase()))
      // Otherwise filter by brand name
      : deals.filter(deal => deal.brand.toLowerCase() === formattedBrand.toLowerCase())
    : [];
  
  // Handle coupon code copy
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };
  
  // Toggle terms visibility
  const toggleTerms = () => {
    setShowTerms(!showTerms);
  };
  
  // Redirect to store (in a real app, this would track the click and redirect)
  const shopNow = () => {
    if (!storeData) {
      console.error('Store data not available for redirect');
      
      // If we have a brand name but no store data, we can still try to redirect
      if (formattedBrand) {
        const fallbackUrl = `https://www.${formattedBrand.toLowerCase().replace(/\s+/g, '')}.com`;
        console.log(`Attempting fallback redirect to ${fallbackUrl}`);
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    
    // Get the store URL from the data or generate a fallback URL
    const storeUrl = storeData.website || `https://www.${storeData.brand.toLowerCase().replace(/\s+/g, '')}.com`;
    
    // Track the click (in a real app, you would implement analytics here)
    console.log(`User clicked Shop Now for ${formattedBrand}`);
    
    // Open the store URL in a new tab
    window.open(storeUrl, '_blank', 'noopener,noreferrer');
  };
  
  // Enhanced error handling
  if (pageLoading) return <div className={styles.loading}>Loading store information...</div>;
  
  if (error && (error.cashBacks || error.coupons || error.deals)) return (
    <div className={styles.error}>
      <h2>Error Loading Store</h2>
      <p>{error.cashBacks || error.coupons || error.deals || "An error occurred while loading store data."}</p>
      <Link to="/stores" className={styles.backLink}>Browse All Stores</Link>
    </div>
  );
  
  if (!brandParam) return (
    <div className={styles.notFound}>
      <h2>Store Not Specified</h2>
      <p>No store was specified in the URL. Please select a store from our directory.</p>
      <Link to="/stores" className={styles.backLink}>Browse All Stores</Link>
    </div>
  );
  
  if (!pageLoading && !storeData) return (
    <div className={styles.notFound}>
      <h2>Store Not Found</h2>
      <p>We couldn't find a store {isNumericId ? `with ID "${brandParam}"` : `named "${formattedBrand}"`}. It may have been removed or the URL might be incorrect.</p>
      <Link to="/stores" className={styles.backLink}>Browse All Stores</Link>
    </div>
  );
  
  return (
    <div className={styles.storeDetailPage}>
      <div className={styles.storeHeader}>
        <div className={styles.storeInfo}>
          <div className={styles.storeLogo}>
            <img src={storeData.image} alt={storeData.brand} />
          </div>
          <div className={styles.storeDetails}>
            <h1 className={styles.storeName}>{storeData.brand}</h1>
            <div className={styles.storeCategory}>
              <FaTag className={styles.categoryIcon} />
              <span>{storeData.category}</span>
            </div>
            {storeData.featured && (
              <div className={styles.featuredBadge}>
                <FaStar className={styles.featuredIcon} />
                <span>Featured Store</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.cashbackInfo}>
          <div className={styles.cashbackAmount}>
            <span className={styles.percent}>{storeData.percent}</span>
            <span className={styles.cashbackLabel}>Cash Back</span>
          </div>
          <button className={styles.shopNowButton} onClick={shopNow}>
            Shop Now
            <FaExternalLinkAlt className={styles.externalIcon} />
          </button>
          <button className={styles.termsButton} onClick={toggleTerms}>
            <FaInfoCircle /> Terms & Conditions
          </button>
        </div>
      </div>
      
      {showTerms && (
        <div className={styles.termsSection}>
          <h3>Cash Back Terms</h3>
          <p>{storeData.terms || 'Cash back is available on qualifying purchases. Exclusions may apply.'}</p>
          <p>Cash back will be added to your CashHeros account within 7 days of your purchase and will be available for withdrawal after the store's return period has passed (typically 30-90 days).</p>
        </div>
      )}
      
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'cashback' ? styles.active : ''}`}
            onClick={() => setActiveTab('cashback')}
          >
            <FaPercent /> Cash Back Info
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'coupons' ? styles.active : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            <FaTag /> Coupons ({storeCoupons.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'deals' ? styles.active : ''}`}
            onClick={() => setActiveTab('deals')}
          >
            <FaShoppingBag /> Deals ({storeDeals.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'faq' ? styles.active : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            <FaQuestionCircle /> FAQ
          </button>
        </div>
        
        <div className={styles.tabContent}>
          {activeTab === 'cashback' && (
            <div className={styles.cashbackTab}>
              <div className={styles.howItWorks}>
                <h2>How to Earn Cash Back at {storeData.brand}</h2>
                <div className={styles.stepsContainer}>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <h3>Click Shop Now</h3>
                    <p>Click the Shop Now button above to visit {storeData.brand}</p>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <h3>Shop as Usual</h3>
                    <p>Make your purchase like you normally would</p>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <h3>Earn Cash Back</h3>
                    <p>Cash back will be added to your CashHeros account</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.popularCategories}>
                <h3>Popular Categories at {storeData.brand}</h3>
                <div className={styles.categoriesList}>
                  <div className={styles.categoryItem}>Electronics</div>
                  <div className={styles.categoryItem}>Home & Kitchen</div>
                  <div className={styles.categoryItem}>Clothing</div>
                  <div className={styles.categoryItem}>Beauty</div>
                  <div className={styles.categoryItem}>Books</div>
                  <div className={styles.categoryItem}>Toys</div>
                </div>
              </div>
              
              <div className={styles.cashbackTips}>
                <h3>Tips to Maximize Your Cash Back</h3>
                <ul className={styles.tipsList}>
                  <li>Clear your cookies before clicking Shop Now</li>
                  <li>Complete your purchase in one session</li>
                  <li>Don't use other coupon sites or extensions</li>
                  <li>Avoid leaving the store's website during checkout</li>
                  <li>Make sure you're logged into your CashHeros account</li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'coupons' && (
            <div className={styles.couponsTab}>
              <h2>{storeData.brand} Coupon Codes</h2>
              {storeCoupons.length > 0 ? (
                <div className={styles.couponsList}>
                  {storeCoupons.map((coupon) => (
                    <div key={coupon.id} className={styles.couponCard}>
                      <div className={styles.couponInfo}>
                        <h3 className={styles.couponTitle}>{coupon.title}</h3>
                        <div className={styles.couponMeta}>
                          <span className={styles.couponCategory}>
                            <FaTag /> {coupon.category}
                          </span>
                          <span className={styles.couponExpiry}>
                            <FaClock /> Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.couponAction}>
                        <div className={styles.couponCode}>
                          <span>{coupon.code}</span>
                        </div>
                        <button 
                          className={styles.copyButton}
                          onClick={() => handleCopyCode(coupon.code)}
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <FaCheck className={styles.copyIcon} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <FaCopy className={styles.copyIcon} />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noCoupons}>
                  <p>No coupons available for {storeData.brand} at this time.</p>
                  <p>Check back later for new offers or earn {storeData.percent} cash back by shopping now.</p>
                  <button className={styles.shopNowButton} onClick={shopNow}>
                    Shop Now
                    <FaExternalLinkAlt className={styles.externalIcon} />
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'deals' && (
            <div className={styles.dealsTab}>
              <h2>{storeData.brand} Deals & Promotions</h2>
              {storeDeals.length > 0 ? (
                <div className={styles.dealsList}>
                  {storeDeals.map((deal) => (
                    <div key={deal.id} className={styles.dealCard}>
                      <div className={styles.dealInfo}>
                        <h3 className={styles.dealTitle}>{deal.title}</h3>
                        <div className={styles.dealMeta}>
                          <span className={styles.dealCategory}>
                            <FaTag /> {deal.category}
                          </span>
                          <span className={styles.dealDiscount}>
                            <FaPercent /> {deal.discount}
                          </span>
                          <span className={styles.dealExpiry}>
                            <FaClock /> Expires: {new Date(deal.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.dealAction}>
                        <button className={styles.shopNowButton} onClick={shopNow}>
                          Shop Deal
                          <FaExternalLinkAlt className={styles.externalIcon} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noDeals}>
                  <p>No deals available for {storeData.brand} at this time.</p>
                  <p>Check back later for new promotions or earn {storeData.percent} cash back by shopping now.</p>
                  <button className={styles.shopNowButton} onClick={shopNow}>
                    Shop Now
                    <FaExternalLinkAlt className={styles.externalIcon} />
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'faq' && (
            <div className={styles.faqTab}>
              <h2>Frequently Asked Questions</h2>
              <div className={styles.faqList}>
                <div className={styles.faqItem}>
                  <h3>How does cash back work at {storeData.brand}?</h3>
                  <p>When you click through CashHeros and make a purchase at {storeData.brand}, we earn a commission. We share this commission with you as cash back.</p>
                </div>
                <div className={styles.faqItem}>
                  <h3>When will I receive my cash back?</h3>
                  <p>Cash back will appear in your CashHeros account within 7 days as pending. It will become available for withdrawal after the store's return period (typically 30-90 days).</p>
                </div>
                <div className={styles.faqItem}>
                  <h3>Are there any exclusions for earning cash back?</h3>
                  <p>Some items may be excluded from earning cash back, such as gift cards, taxes, shipping fees, and certain product categories. See the store's terms for details.</p>
                </div>
                <div className={styles.faqItem}>
                  <h3>Can I use coupons and still earn cash back?</h3>
                  <p>Yes! You can use coupons found on CashHeros and still earn cash back. However, using coupons from other sites may void your cash back.</p>
                </div>
                <div className={styles.faqItem}>
                  <h3>What if my cash back doesn't track?</h3>
                  <p>If your cash back doesn't appear within 7 days, you can submit a missing cash back claim through your account page.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.userFeedback}>
        <h3>Was this store information helpful?</h3>
        <div className={styles.feedbackButtons}>
          <button className={styles.feedbackButton}>
            <FaThumbsUp className={styles.feedbackIcon} /> Yes
          </button>
          <button className={styles.feedbackButton}>
            <FaThumbsDown className={styles.feedbackIcon} /> No
          </button>
        </div>
      </div>
      
      <div className={styles.storeHistory}>
        <h3>Your History with {storeData.brand}</h3>
        <div className={styles.historyEmpty}>
          <FaHistory className={styles.historyIcon} />
          <p>You haven't shopped at {storeData.brand} through CashHeros yet.</p>
          <p>Shop now to start earning cash back!</p>
        </div>
      </div>
    </div>
  );
};