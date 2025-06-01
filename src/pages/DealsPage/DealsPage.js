import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSnowflake, FaSun, FaLeaf, FaCanadianMapleLeaf, FaTag, FaCalendarAlt, FaStore, FaCopy, FaSearch, FaFilter } from 'react-icons/fa';
import './DealsPage.css';

const DealsPage = () => {
  const { season } = useParams();
  const { t } = useTranslation();
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [sortOption, setSortOption] = useState('default');

  // Mock data for different seasons with enhanced details
  const mockDeals = {
    winter: [
      { 
        id: 1, 
        title: 'Winter Special 50% Off', 
        store: 'WinterWear', 
        code: 'WINTER50', 
        expiry: '2023-12-31',
        discount: '50%',
        description: 'Get half off on all winter clothing and accessories. Perfect for the holiday season!',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        popular: true
      },
      { 
        id: 2, 
        title: 'Holiday Season Bundle', 
        store: 'GiftShop', 
        code: 'HOLIDAY25', 
        expiry: '2023-12-25',
        discount: '25%',
        description: 'Special holiday gift bundles with premium wrapping included. Great for last-minute shoppers!',
        image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      },
      { 
        id: 3, 
        title: 'Snow Gear Clearance', 
        store: 'OutdoorPro', 
        code: 'SNOW30', 
        expiry: '2024-01-15',
        discount: '30%',
        description: 'End of season clearance on all snow gear including skis, snowboards, and winter sports equipment.',
        image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        popular: true
      },
    ],
    summer: [
      { 
        id: 4, 
        title: 'Summer Beach Essentials', 
        store: 'BeachLife', 
        code: 'SUMMER20', 
        expiry: '2023-08-31',
        discount: '20%',
        description: 'Everything you need for a perfect beach day: towels, umbrellas, coolers, and more!',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        popular: true
      },
      { 
        id: 5, 
        title: 'Vacation Package Deals', 
        store: 'TravelPlus', 
        code: 'VACATION15', 
        expiry: '2023-09-15',
        discount: '15%',
        description: 'All-inclusive vacation packages to top summer destinations. Book now for best availability!',
        image: 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      },
      { 
        id: 12, 
        title: 'Summer Fitness Special', 
        store: 'FitLife', 
        code: 'FIT2023', 
        expiry: '2023-08-15',
        discount: '25%',
        description: 'Get beach-ready with our summer fitness equipment and apparel sale.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      },
    ],
    spring: [
      { 
        id: 6, 
        title: 'Spring Cleaning Sale', 
        store: 'HomeGoods', 
        code: 'SPRING25', 
        expiry: '2023-04-30',
        discount: '25%',
        description: 'Refresh your home with our spring cleaning essentials and organization solutions.',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        popular: true
      },
      { 
        id: 7, 
        title: 'Garden Supplies Discount', 
        store: 'GardenWorld', 
        code: 'GARDEN10', 
        expiry: '2023-05-15',
        discount: '10%',
        description: 'Start your garden right with discounted seeds, tools, and planters for the spring season.',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      },
      { 
        id: 13, 
        title: 'Spring Fashion Collection', 
        store: 'StyleBoutique', 
        code: 'STYLE23', 
        expiry: '2023-05-30',
        discount: '15%',
        description: 'Refresh your wardrobe with the latest spring fashion trends and styles.',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      },
    ],
    fall: [
      { 
        id: 8, 
        title: 'Back to School Specials', 
        store: 'SchoolSupplies', 
        code: 'SCHOOL20', 
        expiry: '2023-09-30',
        discount: '20%',
        description: 'Everything students need for a successful school year at discounted prices.',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        popular: true
      },
      { 
        id: 9, 
        title: 'Fall Fashion Collection', 
        store: 'FashionHub', 
        code: 'FALL15', 
        expiry: '2023-10-31',
        discount: '15%',
        description: 'Cozy sweaters, stylish boots, and autumn accessories for the changing season.',
        image: 'https://images.unsplash.com/photo-1507520413369-94de50653f00?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      },
      { 
        id: 14, 
        title: 'Harvest Festival Savings', 
        store: 'FarmFresh', 
        code: 'HARVEST', 
        expiry: '2023-11-15',
        discount: '10%',
        description: 'Fall produce, decorations, and seasonal treats for your autumn celebrations.',
        image: 'https://images.unsplash.com/photo-1508995476428-43d70c3d0042?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      },
    ],
    // Default deals shown when no season is specified
    default: [
      { 
        id: 10, 
        title: 'Year-round Savings', 
        store: 'AllSeasons', 
        code: 'SAVE10', 
        expiry: '2023-12-31',
        discount: '10%',
        description: 'Everyday essentials at discounted prices all year long. No seasonal restrictions!',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        popular: true
      },
      { 
        id: 11, 
        title: 'New Customer Special', 
        store: 'WelcomeShop', 
        code: 'WELCOME15', 
        expiry: '2023-12-31',
        discount: '15%',
        description: 'First-time customers get an extra discount on their initial purchase.',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      },
      { 
        id: 15, 
        title: 'Premium Membership Discount', 
        store: 'EliteClub', 
        code: 'PREMIUM25', 
        expiry: '2023-12-31',
        discount: '25%',
        description: 'Exclusive discount for premium members. Sign up today for additional benefits!',
        image: 'https://images.unsplash.com/photo-1565071559227-20ab25b7685e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        popular: true
      },
    ]
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      if (season && mockDeals[season.toLowerCase()]) {
        setDeals(mockDeals[season.toLowerCase()]);
      } else if (season) {
        // If season is provided but not found
        setError(`No deals found for ${season} season`);
        setDeals([]);
      } else {
        // Default deals when no season is specified
        setDeals(mockDeals.default);
      }
      setLoading(false);
    }, 800); // Simulate network delay
  }, [season]);
  
  // Filter and sort deals whenever deals, searchTerm, or filters change
  useEffect(() => {
    let result = [...deals];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(deal => 
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply popular filter
    if (showPopularOnly) {
      result = result.filter(deal => deal.popular);
    }
    
    // Apply sorting
    switch(sortOption) {
      case 'discount-high':
        result.sort((a, b) => parseInt(b.discount) - parseInt(a.discount));
        break;
      case 'expiry-soon':
        result.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Keep original order
        break;
    }
    
    setFilteredDeals(result);
  }, [deals, searchTerm, showPopularOnly, sortOption]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const [copiedCode, setCopiedCode] = useState(null);
  
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 3000); // Hide notification after 3 seconds
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  // Function to get season icon
  const getSeasonIcon = () => {
    if (!season) return null;
    
    switch(season.toLowerCase()) {
      case 'winter':
        return <FaSnowflake className="season-icon" />;
      case 'summer':
        return <FaSun className="season-icon" />;
      case 'spring':
        return <FaLeaf className="season-icon" />;
      case 'fall':
        return <FaCanadianMapleLeaf className="season-icon" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="deals-page loading">
        <div className="loading-spinner"></div>
        <p>Loading deals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deals-page error">
        <h1>{t('deals.title')}</h1>
        <div className="error-message">
          <p>{error}</p>
          <p>Check out our other seasonal deals:</p>
          <div className="season-links">
            <Link to="/deals/winter">Winter Deals</Link>
            <Link to="/deals/summer">Summer Deals</Link>
            <Link to="/deals/spring">Spring Deals</Link>
            <Link to="/deals/fall">Fall Deals</Link>
            <Link to="/deals">All Deals</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="deals-page">
      <div className="deals-header">
        <div className="header-content">
          <h1>
            {getSeasonIcon()}
            {season 
              ? `${season.charAt(0).toUpperCase() + season.slice(1)} ${t('deals.title')}` 
              : t('deals.title')}
          </h1>
          <p className="deals-subtitle">
            Exclusive discounts and special offers to help you save more
          </p>
        </div>
      </div>
      
      <div className="deals-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search deals by name, store, or description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>
        
        <div className="filter-sort-container">
          <div className="filter-option">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={showPopularOnly} 
                onChange={() => setShowPopularOnly(!showPopularOnly)}
              />
              <span className="checkmark"></span>
              Popular Deals Only
            </label>
          </div>
          
          <div className="sort-option">
            <FaFilter className="sort-icon" />
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
            >
              <option value="default">Sort by: Default</option>
              <option value="discount-high">Highest Discount</option>
              <option value="expiry-soon">Expiring Soon</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>
      
      {!season && (
        <div className="season-links">
          <Link to="/deals/winter" className="season-link winter">
            <FaSnowflake />
            <span>Winter Deals</span>
          </Link>
          <Link to="/deals/summer" className="season-link summer">
            <FaSun />
            <span>Summer Deals</span>
          </Link>
          <Link to="/deals/spring" className="season-link spring">
            <FaLeaf />
            <span>Spring Deals</span>
          </Link>
          <Link to="/deals/fall" className="season-link fall">
            <FaCanadianMapleLeaf />
            <span>Fall Deals</span>
          </Link>
        </div>
      )}
      
      {filteredDeals.length > 0 ? (
        <>
          <div className="results-info">
            Showing {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'}
            {searchTerm && <span> for "{searchTerm}"</span>}
            {showPopularOnly && <span> (popular only)</span>}
          </div>
          
          <div className="deals-container">
            {filteredDeals.map(deal => (
              <div className="deal-card" key={deal.id}>
                {deal.popular && <div className="popular-tag">Popular</div>}
                <div className="deal-image-container">
                  <img src={deal.image} alt={deal.title} className="deal-image" />
                  <div className="discount-badge">{deal.discount} OFF</div>
                </div>
                <div className="deal-content">
                  <h3>{deal.title}</h3>
                  <p className="store-name">
                    <FaStore className="store-icon" />
                    {deal.store}
                  </p>
                  <p className="deal-description">{deal.description}</p>
                  <div className="coupon-code">
                    <span>{deal.code}</span>
                    <button 
                      onClick={() => copyToClipboard(deal.code)}
                      className={copiedCode === deal.code ? "copied" : ""}
                    >
                      <FaCopy className="copy-icon" />
                      {copiedCode === deal.code ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="expiry">
                    <FaCalendarAlt className="calendar-icon" />
                    Expires: {formatDate(deal.expiry)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-deals">
          <FaTag className="no-deals-icon" />
          <p>No deals available at this time.</p>
          <p className="no-deals-sub">Try adjusting your search or filters, or check back later.</p>
        </div>
      )}
      
      {season && (
        <div className="back-link">
          <Link to="/deals">View All Deals</Link>
        </div>
      )}
      
      {/* Toast notification for copied code */}
      {copiedCode && (
        <div className="toast-notification">
          <FaCopy /> Code {copiedCode} copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default DealsPage;