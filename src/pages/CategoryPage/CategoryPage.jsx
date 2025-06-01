import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaFilter, FaSort, FaSearch, FaTag, FaStore, FaPercent, FaChevronRight } from 'react-icons/fa';
import styles from './CategoryPage.module.css';
import ModernHelmet from '../../Components/HelmetWrapper/ModernHelmet';
import { useTranslation } from 'react-i18next';

// Import services
import { getCouponsByCategory } from '../../services/couponService';
import { getStoresByCategory } from '../../services/storeService';
import { getCashbackByCategory } from '../../services/cashbackService';

export const CategoryPage = () => {
  // Ensure category is always defined with a default value
  const params = useParams();
  const category = params.category || 'all';
  
  // Debug log
  console.log('CategoryPage - category param:', params.category, 'using category:', category);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [cashbacks, setCashbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('popular');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    discount: [],
    type: [],
    expiring: false,
    verified: false
  });

  // Format category name for display
  const formatCategoryName = (name) => {
    // Extra defensive check
    if (!name || typeof name !== 'string') {
      console.log('formatCategoryName received invalid name:', name);
      return 'Category';
    }
    if (name === 'all') return 'All Categories';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Fetch data based on category
  useEffect(() => {
    // Extra safety check
    if (category === undefined) {
      console.error('Category is undefined in useEffect');
      return;
    }
    
    const fetchCategoryData = async () => {
      setIsLoading(true);
      try {
        // Fetch data in parallel with error handling for each request
        const storesPromise = getStoresByCategory(category).catch(err => {
          console.error('Error fetching stores:', err);
          return null;
        });
        
        const couponsPromise = getCouponsByCategory(category).catch(err => {
          console.error('Error fetching coupons:', err);
          return null;
        });
        
        const cashbacksPromise = getCashbackByCategory(category).catch(err => {
          console.error('Error fetching cashbacks:', err);
          return null;
        });
        
        const [storesData, couponsData, cashbacksData] = await Promise.all([
          storesPromise,
          couponsPromise,
          cashbacksPromise
        ]);
        
        // Use the data if available, otherwise use mock data or empty arrays
        if (storesData) {
          setStores(storesData);
        } else if (process.env.NODE_ENV === 'development') {
          setStores(getMockStores(category));
        } else {
          setStores([]);
        }
        
        if (couponsData) {
          setCoupons(couponsData);
        } else if (process.env.NODE_ENV === 'development') {
          setCoupons(getMockCoupons(category));
        } else {
          setCoupons([]);
        }
        
        if (cashbacksData) {
          setCashbacks(cashbacksData);
        } else if (process.env.NODE_ENV === 'development') {
          setCashbacks(getMockCashbacks(category));
        } else {
          setCashbacks([]);
        }
      } catch (error) {
        console.error('Error in category data fetching:', error);
        // Use mock data for development purposes
        if (process.env.NODE_ENV === 'development') {
          setStores(getMockStores(category || 'all'));
          setCoupons(getMockCoupons(category || 'all'));
          setCashbacks(getMockCashbacks(category || 'all'));
        } else {
          // Set empty arrays if there's an error in production
          setStores([]);
          setCoupons([]);
          setCashbacks([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [category]);

  // Filter and sort data based on user selections
  const getFilteredData = () => {
    let filteredItems = [];
    
    // Determine which data to include based on active tab
    if (activeTab === 'all' || activeTab === 'coupons') {
      filteredItems = [...filteredItems, ...coupons.map(item => ({...item, type: 'coupon'}))];
    }
    
    if (activeTab === 'all' || activeTab === 'stores') {
      filteredItems = [...filteredItems, ...stores.map(item => ({...item, type: 'store'}))];
    }
    
    if (activeTab === 'all' || activeTab === 'cashbacks') {
      filteredItems = [...filteredItems, ...cashbacks.map(item => ({...item, type: 'cashback'}))];
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        (item.name && item.name.toLowerCase().includes(term)) || 
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.storeName && item.storeName.toLowerCase().includes(term))
      );
    }
    
    // Apply selected filters
    if (selectedFilters.discount.length > 0) {
      filteredItems = filteredItems.filter(item => {
        const discount = item.discount || item.percent || 0;
        return selectedFilters.discount.some(range => {
          const [min, max] = range.split('-').map(Number);
          return discount >= min && (max ? discount <= max : true);
        });
      });
    }
    
    if (selectedFilters.type.length > 0) {
      filteredItems = filteredItems.filter(item => 
        selectedFilters.type.includes(item.type)
      );
    }
    
    if (selectedFilters.expiring) {
      const now = new Date();
      const weekLater = new Date();
      weekLater.setDate(weekLater.getDate() + 7);
      
      filteredItems = filteredItems.filter(item => {
        if (!item.expiryDate) return false;
        const expiry = new Date(item.expiryDate);
        return expiry > now && expiry < weekLater;
      });
    }
    
    if (selectedFilters.verified) {
      filteredItems = filteredItems.filter(item => item.verified);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'popular':
        filteredItems.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'newest':
        filteredItems.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'discount':
        filteredItems.sort((a, b) => (b.discount || b.percent || 0) - (a.discount || a.percent || 0));
        break;
      default:
        break;
    }
    
    return filteredItems;
  };

  const filteredData = getFilteredData();
  
  // Toggle filter selection
  const toggleFilter = (type, value) => {
    setSelectedFilters(prev => {
      if (type === 'discount' || type === 'type') {
        const newArray = [...prev[type]];
        if (newArray.includes(value)) {
          return {
            ...prev,
            [type]: newArray.filter(item => item !== value)
          };
        } else {
          return {
            ...prev,
            [type]: [...newArray, value]
          };
        }
      } else {
        return {
          ...prev,
          [type]: !prev[type]
        };
      }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedFilters({
      discount: [],
      type: [],
      expiring: false,
      verified: false
    });
    setSearchTerm('');
    setSortOption('popular');
  };

  // Render item based on its type
  const renderItem = (item) => {
    switch (item.type) {
      case 'coupon':
        return (
          <div className={styles.couponCard}>
            <div className={styles.couponHeader}>
              <div className={styles.storeLogo}>
                {item.logo ? (
                  <img src={item.logo} alt={item.storeName} />
                ) : (
                  <div className={styles.placeholderLogo}>
                    {item.storeName?.charAt(0) || 'S'}
                  </div>
                )}
              </div>
              <div className={styles.couponInfo}>
                <h3>{item.storeName}</h3>
                {item.verified && <span className={styles.verifiedBadge}>Verified</span>}
              </div>
            </div>
            <div className={styles.couponBody}>
              <p className={styles.couponTitle}>{item.title || item.description}</p>
              {item.discount && (
                <div className={styles.discountBadge}>
                  {item.discount}% OFF
                </div>
              )}
              {item.code && (
                <div className={styles.couponCode}>
                  <span>{item.code}</span>
                  <button className={styles.copyButton}>Copy</button>
                </div>
              )}
            </div>
            <div className={styles.couponFooter}>
              {item.expiryDate && (
                <span className={styles.expiryDate}>
                  Expires: {new Date(item.expiryDate).toLocaleDateString()}
                </span>
              )}
              <Link to={`/stores/${item.storeId || item.storeName}`} className={styles.viewDealButton}>
                View Deal <FaChevronRight />
              </Link>
            </div>
          </div>
        );
      
      case 'store':
        return (
          <Link to={`/stores/${item.id || item.name}`} className={styles.storeCard}>
            <div className={styles.storeHeader}>
              <div className={styles.storeLogo}>
                {item.logo ? (
                  <img src={item.logo} alt={item.name} />
                ) : (
                  <div className={styles.placeholderLogo}>
                    {item.name?.charAt(0) || 'S'}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.storeBody}>
              <h3>{item.name}</h3>
              <p>{item.description || `Best deals from ${item.name}`}</p>
              {item.couponCount > 0 && (
                <span className={styles.couponCount}>
                  {item.couponCount} Coupons Available
                </span>
              )}
            </div>
            <div className={styles.storeFooter}>
              <span className={styles.viewStoreButton}>
                View Store <FaChevronRight />
              </span>
            </div>
          </Link>
        );
      
      case 'cashback':
        return (
          <div className={styles.cashbackCard}>
            <div className={styles.cashbackHeader}>
              <div className={styles.storeLogo}>
                {item.logo ? (
                  <img src={item.logo} alt={item.storeName} />
                ) : (
                  <div className={styles.placeholderLogo}>
                    {item.storeName?.charAt(0) || 'S'}
                  </div>
                )}
              </div>
              <div className={styles.cashbackPercent}>
                {item.percent}%
              </div>
            </div>
            <div className={styles.cashbackBody}>
              <h3>{item.storeName}</h3>
              <p>{item.description || `Earn ${item.percent}% cashback on your purchases`}</p>
            </div>
            <div className={styles.cashbackFooter}>
              <Link to={`/stores/${item.storeId || item.storeName}`} className={styles.activateButton}>
                Activate Cashback
              </Link>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Final safety check before rendering
  console.log('CategoryPage rendering with category:', category);
  
  // If category is still undefined somehow, use a default
  const safeCategory = category || 'all';
  
  return (
    <div className={styles.categoryPage}>
      <ModernHelmet>
        <title>{`${formatCategoryName(safeCategory)} - Deals, Coupons & Cashback | CashHeros`}</title>
        <meta name="description" content={`Find the best ${formatCategoryName(safeCategory)} deals, coupons, and cashback offers. Save money on your ${safeCategory} purchases with CashHeros.`} />
      </ModernHelmet>

      <div className={styles.categoryHeader}>
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <Link to="/">Home</Link> <span>/</span> <Link to="/category/all">Categories</Link> <span>/</span> <span>{formatCategoryName(safeCategory)}</span>
          </div>
          <h1>{formatCategoryName(safeCategory)}</h1>
          <p className={styles.categoryDescription}>
            Find the best deals, coupons, and cashback offers for {formatCategoryName(safeCategory)}. Save money on your purchases with CashHeros.
          </p>
        </div>
      </div>

      <div className={styles.categoryContent}>
        <div className={styles.container}>
          <div className={styles.categoryActions}>
            <div className={styles.searchBar}>
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search in this category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.filterButton} 
                onClick={() => setFilterOpen(!filterOpen)}
                aria-expanded={filterOpen}
              >
                <FaFilter /> Filter
              </button>
              
              <div className={styles.sortDropdown}>
                <label htmlFor="sort-select"><FaSort /> Sort by:</label>
                <select 
                  id="sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>
            </div>
          </div>
          
          {filterOpen && (
            <div className={styles.filterPanel}>
              <div className={styles.filterSection}>
                <h3>Discount</h3>
                <div className={styles.filterOptions}>
                  {['0-10', '10-25', '25-50', '50-'].map(range => (
                    <label key={range} className={styles.filterCheckbox}>
                      <input 
                        type="checkbox"
                        checked={selectedFilters.discount.includes(range)}
                        onChange={() => toggleFilter('discount', range)}
                      />
                      {range.includes('-') ? 
                        (range.endsWith('-') ? `${range.split('-')[0]}% & Above` : `${range.replace('-', '% - ')}%`) : 
                        `${range}%`
                      }
                    </label>
                  ))}
                </div>
              </div>
              
              <div className={styles.filterSection}>
                <h3>Type</h3>
                <div className={styles.filterOptions}>
                  {[
                    { value: 'coupon', label: 'Coupons', icon: <FaTag /> },
                    { value: 'store', label: 'Stores', icon: <FaStore /> },
                    { value: 'cashback', label: 'Cashback', icon: <FaPercent /> }
                  ].map(type => (
                    <label key={type.value} className={styles.filterCheckbox}>
                      <input 
                        type="checkbox"
                        checked={selectedFilters.type.includes(type.value)}
                        onChange={() => toggleFilter('type', type.value)}
                      />
                      {type.icon} {type.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className={styles.filterSection}>
                <h3>Other Filters</h3>
                <div className={styles.filterOptions}>
                  <label className={styles.filterCheckbox}>
                    <input 
                      type="checkbox"
                      checked={selectedFilters.expiring}
                      onChange={() => toggleFilter('expiring')}
                    />
                    Expiring Soon
                  </label>
                  <label className={styles.filterCheckbox}>
                    <input 
                      type="checkbox"
                      checked={selectedFilters.verified}
                      onChange={() => toggleFilter('verified')}
                    />
                    Verified Only
                  </label>
                </div>
              </div>
              
              <div className={styles.filterActions}>
                <button 
                  className={styles.resetButton}
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
                <button 
                  className={styles.applyButton}
                  onClick={() => setFilterOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
          
          <div className={styles.categoryTabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'coupons' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('coupons')}
            >
              Coupons ({coupons.length})
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'stores' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('stores')}
            >
              Stores ({stores.length})
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'cashbacks' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('cashbacks')}
            >
              Cashback ({cashbacks.length})
            </button>
          </div>
          
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading {formatCategoryName(safeCategory)} offers...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <div className={styles.resultsGrid}>
              {filteredData.map((item, index) => (
                <div key={`${item.type}-${item.id || index}`} className={styles.resultItem}>
                  {renderItem(item)}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <h3>No results found</h3>
              <p>Try adjusting your filters or search term to find what you're looking for.</p>
              <button 
                className={styles.resetButton}
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          )}
          
          {!isLoading && filteredData.length > 0 && (
            <div className={styles.pagination}>
              <button className={styles.paginationButton} disabled>Previous</button>
              <div className={styles.pageNumbers}>
                <button className={styles.activePage}>1</button>
                <button>2</button>
                <button>3</button>
                <span>...</span>
              </div>
              <button className={styles.paginationButton}>Next</button>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.relatedCategories}>
        <div className={styles.container}>
          <h2>Related Categories</h2>
          <div className={styles.categoryGrid}>
            {['Electronics', 'Fashion', 'Home', 'Beauty', 'Travel', 'Food'].map(cat => (
              <Link 
                key={cat} 
                to={`/category/${cat.toLowerCase()}`} 
                className={styles.categoryCard}
              >
                <h3>{cat}</h3>
                <span className={styles.categoryLink}>View Deals <FaChevronRight /></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data for development purposes
const getMockStores = (category = 'all') => {
  const allStores = [
    {
      id: 1,
      name: 'Amazon',
      description: 'Shop online for electronics, computers, clothing, shoes, toys, and more.',
      logo: 'https://logo.clearbit.com/amazon.com',
      category: 'electronics',
      couponCount: 15,
      popularity: 98,
      verified: true,
      createdAt: '2023-05-10T10:30:00Z'
    },
    {
      id: 2,
      name: 'Nike',
      description: 'Athletic footwear, apparel, equipment and accessories.',
      logo: 'https://logo.clearbit.com/nike.com',
      category: 'fashion',
      couponCount: 8,
      popularity: 92,
      verified: true,
      createdAt: '2023-06-15T14:45:00Z'
    },
    {
      id: 3,
      name: 'Sephora',
      description: 'Cosmetics, beauty products, and fragrances.',
      logo: 'https://logo.clearbit.com/sephora.com',
      category: 'beauty',
      couponCount: 12,
      popularity: 87,
      verified: true,
      createdAt: '2023-07-01T09:15:00Z'
    },
    {
      id: 4,
      name: 'Best Buy',
      description: 'Consumer electronics, computers, appliances, and more.',
      logo: 'https://logo.clearbit.com/bestbuy.com',
      category: 'electronics',
      couponCount: 10,
      popularity: 85,
      verified: true,
      createdAt: '2023-08-05T11:20:00Z'
    },
    {
      id: 5,
      name: 'Home Depot',
      description: 'Home improvement supplies, building materials, and appliances.',
      logo: 'https://logo.clearbit.com/homedepot.com',
      category: 'home',
      couponCount: 7,
      popularity: 80,
      verified: true,
      createdAt: '2023-09-10T16:30:00Z'
    },
    {
      id: 6,
      name: 'Expedia',
      description: 'Travel bookings, hotel reservations, car rentals, and vacation packages.',
      logo: 'https://logo.clearbit.com/expedia.com',
      category: 'travel',
      couponCount: 9,
      popularity: 78,
      verified: true,
      createdAt: '2023-10-20T13:40:00Z'
    },
    {
      id: 7,
      name: 'Uber Eats',
      description: 'Food delivery service from local restaurants.',
      logo: 'https://logo.clearbit.com/ubereats.com',
      category: 'food',
      couponCount: 6,
      popularity: 75,
      verified: true,
      createdAt: '2023-11-25T19:50:00Z'
    },
    {
      id: 8,
      name: 'Adidas',
      description: 'Sports shoes, clothing, and accessories.',
      logo: 'https://logo.clearbit.com/adidas.com',
      category: 'fashion',
      couponCount: 5,
      popularity: 72,
      verified: true,
      createdAt: '2024-01-01T08:10:00Z'
    }
  ];

  if (category === 'all') {
    return allStores;
  }
  
  return allStores.filter(store => 
    category && store.category && store.category.toLowerCase() === category.toLowerCase()
  );
};

const getMockCoupons = (category = 'all') => {
  const allCoupons = [
    {
      id: 1,
      title: '20% Off Your First Order',
      code: 'WELCOME20',
      discount: 20,
      description: 'Get 20% off your first order at Amazon',
      storeName: 'Amazon',
      storeId: 'amazon',
      logo: 'https://logo.clearbit.com/amazon.com',
      category: 'electronics',
      expiryDate: '2024-12-31T23:59:59Z',
      verified: true,
      popularity: 95,
      createdAt: '2023-05-15T10:30:00Z'
    },
    {
      id: 2,
      title: 'Free Shipping on Orders Over $50',
      code: 'FREESHIP50',
      description: 'Free shipping on all orders over $50 at Nike',
      storeName: 'Nike',
      storeId: 'nike',
      logo: 'https://logo.clearbit.com/nike.com',
      category: 'fashion',
      expiryDate: '2024-11-30T23:59:59Z',
      verified: true,
      popularity: 90,
      createdAt: '2023-06-20T14:45:00Z'
    },
    {
      id: 3,
      title: 'Buy One Get One Free',
      code: 'BOGOFREE',
      description: 'Buy one product and get another one free at Sephora',
      storeName: 'Sephora',
      storeId: 'sephora',
      logo: 'https://logo.clearbit.com/sephora.com',
      category: 'beauty',
      expiryDate: '2024-10-15T23:59:59Z',
      verified: true,
      popularity: 88,
      createdAt: '2023-07-05T09:15:00Z'
    },
    {
      id: 4,
      title: '$50 Off $200+ Purchase',
      code: 'SAVE50',
      discount: 25,
      description: 'Save $50 when you spend $200 or more at Best Buy',
      storeName: 'Best Buy',
      storeId: 'bestbuy',
      logo: 'https://logo.clearbit.com/bestbuy.com',
      category: 'electronics',
      expiryDate: '2024-09-30T23:59:59Z',
      verified: true,
      popularity: 85,
      createdAt: '2023-08-12T11:20:00Z'
    },
    {
      id: 5,
      title: '15% Off Home Appliances',
      code: 'HOME15',
      discount: 15,
      description: 'Get 15% off all home appliances at Home Depot',
      storeName: 'Home Depot',
      storeId: 'homedepot',
      logo: 'https://logo.clearbit.com/homedepot.com',
      category: 'home',
      expiryDate: '2024-08-31T23:59:59Z',
      verified: true,
      popularity: 82,
      createdAt: '2023-09-18T16:30:00Z'
    },
    {
      id: 6,
      title: '10% Off Hotel Bookings',
      code: 'HOTEL10',
      discount: 10,
      description: 'Save 10% on hotel bookings with Expedia',
      storeName: 'Expedia',
      storeId: 'expedia',
      logo: 'https://logo.clearbit.com/expedia.com',
      category: 'travel',
      expiryDate: '2024-07-31T23:59:59Z',
      verified: true,
      popularity: 80,
      createdAt: '2023-10-25T13:40:00Z'
    },
    {
      id: 7,
      title: 'Free Delivery on First Order',
      code: 'FREEDEL',
      description: 'Free delivery on your first order with Uber Eats',
      storeName: 'Uber Eats',
      storeId: 'ubereats',
      logo: 'https://logo.clearbit.com/ubereats.com',
      category: 'food',
      expiryDate: '2024-06-30T23:59:59Z',
      verified: true,
      popularity: 78,
      createdAt: '2023-11-30T19:50:00Z'
    },
    {
      id: 8,
      title: '25% Off Sportswear',
      code: 'SPORT25',
      discount: 25,
      description: 'Get 25% off all sportswear at Adidas',
      storeName: 'Adidas',
      storeId: 'adidas',
      logo: 'https://logo.clearbit.com/adidas.com',
      category: 'fashion',
      expiryDate: '2024-05-31T23:59:59Z',
      verified: true,
      popularity: 75,
      createdAt: '2024-01-05T08:10:00Z'
    }
  ];

  if (category === 'all') {
    return allCoupons;
  }
  
  return allCoupons.filter(coupon => 
    category && coupon.category && coupon.category.toLowerCase() === category.toLowerCase()
  );
};

const getMockCashbacks = (category = 'all') => {
  const allCashbacks = [
    {
      id: 1,
      storeName: 'Amazon',
      storeId: 'amazon',
      percent: 5,
      description: 'Earn 5% cashback on all Amazon purchases',
      category: 'electronics',
      logo: 'https://logo.clearbit.com/amazon.com',
      popularity: 98,
      verified: true,
      createdAt: '2023-05-15T10:30:00Z'
    },
    {
      id: 2,
      storeName: 'Nike',
      storeId: 'nike',
      percent: 8,
      description: 'Get 8% cashback on Nike sportswear and shoes',
      category: 'fashion',
      logo: 'https://logo.clearbit.com/nike.com',
      popularity: 92,
      verified: true,
      createdAt: '2023-06-20T14:45:00Z'
    },
    {
      id: 3,
      storeName: 'Sephora',
      storeId: 'sephora',
      percent: 6,
      description: 'Earn 6% cashback on beauty and skincare products',
      category: 'beauty',
      logo: 'https://logo.clearbit.com/sephora.com',
      popularity: 87,
      verified: true,
      createdAt: '2023-07-05T09:15:00Z'
    },
    {
      id: 4,
      storeName: 'Best Buy',
      storeId: 'bestbuy',
      percent: 4,
      description: 'Get 4% cashback on electronics and appliances',
      category: 'electronics',
      logo: 'https://logo.clearbit.com/bestbuy.com',
      popularity: 85,
      verified: true,
      createdAt: '2023-08-12T11:20:00Z'
    },
    {
      id: 5,
      storeName: 'Home Depot',
      storeId: 'homedepot',
      percent: 3,
      description: 'Earn 3% cashback on home improvement items',
      category: 'home',
      logo: 'https://logo.clearbit.com/homedepot.com',
      popularity: 80,
      verified: true,
      createdAt: '2023-09-18T16:30:00Z'
    },
    {
      id: 6,
      storeName: 'Expedia',
      storeId: 'expedia',
      percent: 10,
      description: 'Get 10% cashback on hotel bookings',
      category: 'travel',
      logo: 'https://logo.clearbit.com/expedia.com',
      popularity: 78,
      verified: true,
      createdAt: '2023-10-25T13:40:00Z'
    },
    {
      id: 7,
      storeName: 'Uber Eats',
      storeId: 'ubereats',
      percent: 7,
      description: 'Earn 7% cashback on food delivery orders',
      category: 'food',
      logo: 'https://logo.clearbit.com/ubereats.com',
      popularity: 75,
      verified: true,
      createdAt: '2023-11-30T19:50:00Z'
    },
    {
      id: 8,
      storeName: 'Adidas',
      storeId: 'adidas',
      percent: 6,
      description: 'Get 6% cashback on sportswear and accessories',
      category: 'fashion',
      logo: 'https://logo.clearbit.com/adidas.com',
      popularity: 72,
      verified: true,
      createdAt: '2024-01-05T08:10:00Z'
    }
  ];

  if (category === 'all') {
    return allCashbacks;
  }
  
  return allCashbacks.filter(cashback => 
    category && cashback.category && cashback.category.toLowerCase() === category.toLowerCase()
  );
};

export default CategoryPage;