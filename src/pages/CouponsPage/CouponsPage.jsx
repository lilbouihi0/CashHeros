import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { mockServices } from '../../services/mockServices';
import styles from './CouponsPage.module.css';

// Coupon card component
const CouponsCard = ({ title, description, code, discount, discountType, discountValue, store }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code || 'COUPON');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Use discountValue and discountType if provided (from mock data)
  // Otherwise use the discount prop (from API)
  // Default to 10% if no discount information is available
  const displayDiscount = discountValue 
    ? `${discountValue}${discountType === 'percentage' ? '%' : '$'} OFF` 
    : discount ? `${discount}% OFF` : '10% OFF';

  return (
    <div className={styles.couponCard}>
      <div className={styles.storeInfo}>
        {store && <img src={store.logo || '/placeholder-logo.png'} alt={store.name} className={styles.storeLogo} />}
        <h3 className={styles.storeTitle}>{store?.name || 'Store'}</h3>
      </div>
      <div className={styles.couponDetails}>
        <h4 className={styles.couponTitle}>{title}</h4>
        {description && <p className={styles.couponDescription}>{description}</p>}
        <div className={styles.discountInfo}>
          <span className={styles.discountValue}>{displayDiscount}</span>
        </div>
      </div>
      <div className={styles.couponCode}>
        <div className={styles.codeContainer}>
          <span className={styles.code}>{code || 'COUPON'}</span>
        </div>
        <button
          className={styles.copyButton}
          onClick={handleCopyCode}
        >
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
    </div>
  );
};

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with hardcoded coupons
  useEffect(() => {
    console.log('Setting initial hardcoded coupons');
    // Set some initial hardcoded coupons to ensure we always have data
    const hardcodedCoupons = [
      {
        id: 'coupon-1',
        code: 'SAVE20',
        title: 'Summer Sale - 20% Off',
        description: 'Save 20% on your purchase at Amazon.',
        discountType: 'percentage',
        discountValue: 20,
        store: {
          id: 'store-1',
          name: 'Amazon',
          logo: 'https://placehold.co/150x150?text=Amazon'
        }
      },
      {
        id: 'coupon-2',
        code: 'FREESHIP',
        title: 'Free Shipping on Orders $50+',
        description: 'Get free shipping on all orders over $50 at Walmart.',
        discountType: 'fixed',
        discountValue: 10,
        store: {
          id: 'store-2',
          name: 'Walmart',
          logo: 'https://placehold.co/150x150?text=Walmart'
        }
      },
      {
        id: 'coupon-3',
        code: 'EXTRA15',
        title: 'Extra 15% Off Clearance Items',
        description: 'Take an extra 15% off all clearance items at Target.',
        discountType: 'percentage',
        discountValue: 15,
        store: {
          id: 'store-3',
          name: 'Target',
          logo: 'https://placehold.co/150x150?text=Target'
        }
      }
    ];
    setCoupons(hardcodedCoupons);
  }, []);

  // Fetch coupons when page changes
  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to use the API first
        try {
          const res = await apiService.get('/coupons', {
            params: { page, limit: 10 }
          });
          if (res.data && res.data.coupons && res.data.coupons.length > 0) {
            setCoupons(res.data.coupons);
            setTotalPages(res.data.totalPages);
          }
        } catch (apiError) {
          console.log('API error, falling back to mock data:', apiError);
          // Fall back to mock data if API fails
          const mockRes = await mockServices.getCoupons(page, 10);
          console.log('Mock data response:', mockRes);
          
          // The mock service returns { data: [...], pagination: {...} }
          if (mockRes && mockRes.data) {
            setCoupons(mockRes.data);
            setTotalPages(mockRes.pagination.totalPages);
          } else {
            // If no mock data, create some hardcoded coupons
            const hardcodedCoupons = [
              {
                id: 'coupon-1',
                code: 'SAVE20',
                title: 'Summer Sale - 20% Off',
                description: 'Save 20% on your purchase at Amazon.',
                discountType: 'percentage',
                discountValue: 20,
                store: {
                  id: 'store-1',
                  name: 'Amazon',
                  logo: 'https://placehold.co/150x150?text=Amazon'
                }
              },
              {
                id: 'coupon-2',
                code: 'FREESHIP',
                title: 'Free Shipping on Orders $50+',
                description: 'Get free shipping on all orders over $50 at Walmart.',
                discountType: 'fixed',
                discountValue: 10,
                store: {
                  id: 'store-2',
                  name: 'Walmart',
                  logo: 'https://placehold.co/150x150?text=Walmart'
                }
              },
              {
                id: 'coupon-3',
                code: 'EXTRA15',
                title: 'Extra 15% Off Clearance Items',
                description: 'Take an extra 15% off all clearance items at Target.',
                discountType: 'percentage',
                discountValue: 15,
                store: {
                  id: 'store-3',
                  name: 'Target',
                  logo: 'https://placehold.co/150x150?text=Target'
                }
              }
            ];
            setCoupons(hardcodedCoupons);
            setTotalPages(1);
          }
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
        setError('Failed to load coupons. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [page]);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Latest Coupons & Promo Codes</h1>
      <p className={styles.pageDescription}>
        Save money with our exclusive coupons and promo codes from your favorite stores.
      </p>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading coupons...</p>
        </div>
      ) : coupons && coupons.length > 0 ? (
        <div className={styles.couponsGrid}>
          {coupons.map((coupon, index) => (
            <CouponsCard
              key={coupon.id || coupon._id || `coupon-${index}`}
              title={coupon.title || 'Special Offer'}
              description={coupon.description}
              code={coupon.code}
              discount={coupon.discount}
              discountType={coupon.discountType}
              discountValue={coupon.discountValue}
              store={coupon.store}
            />
          ))}
        </div>
      ) : (
        <div className={styles.noCoupons}>
          <p>No coupons available at the moment.</p>
          <p>Please check back later for new offers.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.paginationButton} ${page === 1 ? styles.disabled : ''}`}
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            className={`${styles.paginationButton} ${page === totalPages ? styles.disabled : ''}`}
            disabled={page === totalPages || loading}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Export both named and default exports for compatibility
export { CouponsPage };
export default CouponsPage;