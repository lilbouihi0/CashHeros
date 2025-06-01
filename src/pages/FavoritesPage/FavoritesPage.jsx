// src/pages/FavoritesPage/FavoritesPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './FavoritesPage.module.css';

export const FavoritesPage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('stores');
  const [favorites, setFavorites] = useState({
    stores: [],
    coupons: [],
    cashbacks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user favorites when component mounts
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/users/favorites', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        setFavorites(response.data.favorites);
        setError(null);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load your favorites. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [user, accessToken]);

  // Handle removing an item from favorites
  const handleRemoveFavorite = async (itemId, type) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/favorites/${type}/${itemId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      // Update local state to reflect the removal
      setFavorites(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item.id !== itemId)
      }));
    } catch (err) {
      console.error(`Error removing ${type} from favorites:`, err);
      setError(`Failed to remove from favorites. Please try again.`);
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login', { state: { from: '/favorites' } });
    return null;
  }

  return (
    <div className={styles.favoritesPage}>
      <div className={styles.favoritesContainer}>
        <h1>My Favorites</h1>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'stores' ? styles.active : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            Favorite Stores
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'coupons' ? styles.active : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            Saved Coupons
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'cashbacks' ? styles.active : ''}`}
            onClick={() => setActiveTab('cashbacks')}
          >
            Cashback Offers
          </button>
        </div>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Loading your favorites...</p>
          </div>
        ) : (
          <>
            {activeTab === 'stores' && (
              <div className={styles.favoritesGrid}>
                {favorites.stores.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>★</div>
                    <h3>No Favorite Stores Yet</h3>
                    <p>Browse our stores and click the heart icon to add favorites.</p>
                    <button 
                      className={styles.browseButton}
                      onClick={() => navigate('/stores')}
                    >
                      Browse Stores
                    </button>
                  </div>
                ) : (
                  favorites.stores.map(store => (
                    <div key={store.id} className={styles.favoriteCard}>
                      <button 
                        className={styles.removeButton}
                        onClick={() => handleRemoveFavorite(store.id, 'stores')}
                        aria-label="Remove from favorites"
                      >
                        ×
                      </button>
                      <div className={styles.storeImageContainer}>
                        <img src={store.logo} alt={store.name} className={styles.storeLogo} />
                      </div>
                      <h3>{store.name}</h3>
                      <div className={styles.storeDetails}>
                        <span className={styles.cashbackRate}>{store.cashbackRate}% Cashback</span>
                        <span className={styles.couponCount}>{store.couponCount} Coupons</span>
                      </div>
                      <button 
                        className={styles.viewButton}
                        onClick={() => navigate(`/store/${store.id}`)}
                      >
                        View Store
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'coupons' && (
              <div className={styles.favoritesGrid}>
                {favorites.coupons.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🏷️</div>
                    <h3>No Saved Coupons Yet</h3>
                    <p>Browse our coupons and save the ones you want to use later.</p>
                    <button 
                      className={styles.browseButton}
                      onClick={() => navigate('/coupons')}
                    >
                      Browse Coupons
                    </button>
                  </div>
                ) : (
                  favorites.coupons.map(coupon => (
                    <div key={coupon.id} className={styles.couponCard}>
                      <button 
                        className={styles.removeButton}
                        onClick={() => handleRemoveFavorite(coupon.id, 'coupons')}
                        aria-label="Remove from favorites"
                      >
                        ×
                      </button>
                      <div className={styles.couponStore}>
                        <img src={coupon.storeLogo} alt={coupon.storeName} className={styles.couponStoreLogo} />
                        <span>{coupon.storeName}</span>
                      </div>
                      <div className={styles.couponDiscount}>
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                      </div>
                      <p className={styles.couponDescription}>{coupon.description}</p>
                      <div className={styles.couponExpiry}>
                        Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                      </div>
                      <button 
                        className={styles.couponButton}
                        onClick={() => window.open(coupon.link, '_blank')}
                      >
                        Get Coupon
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'cashbacks' && (
              <div className={styles.favoritesGrid}>
                {favorites.cashbacks.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>💰</div>
                    <h3>No Saved Cashback Offers Yet</h3>
                    <p>Browse our cashback offers and save your favorites.</p>
                    <button 
                      className={styles.browseButton}
                      onClick={() => navigate('/cashback')}
                    >
                      Browse Cashback Offers
                    </button>
                  </div>
                ) : (
                  favorites.cashbacks.map(cashback => (
                    <div key={cashback.id} className={styles.cashbackCard}>
                      <button 
                        className={styles.removeButton}
                        onClick={() => handleRemoveFavorite(cashback.id, 'cashbacks')}
                        aria-label="Remove from favorites"
                      >
                        ×
                      </button>
                      <div className={styles.cashbackStore}>
                        <img src={cashback.storeLogo} alt={cashback.storeName} className={styles.cashbackStoreLogo} />
                        <span>{cashback.storeName}</span>
                      </div>
                      <div className={styles.cashbackRate}>
                        {cashback.rate}% Cashback
                      </div>
                      <p className={styles.cashbackDescription}>{cashback.description}</p>
                      <div className={styles.cashbackTerms}>
                        {cashback.terms}
                      </div>
                      <button 
                        className={styles.cashbackButton}
                        onClick={() => window.open(cashback.link, '_blank')}
                      >
                        Shop & Earn
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;