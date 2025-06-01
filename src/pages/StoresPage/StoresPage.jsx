// src/pages/StoresPage/StoresPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import TopStore from '../../Components/HomePage/TopStore/TopStore';
import { FaFilter, FaSort, FaStar, FaPercentage, FaTag, FaShoppingBag } from 'react-icons/fa';
import styles from './StoresPage.module.css';

export const StoresPage = () => {
  const { stores, loading, error, categories: storeCategories } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  // Get URL parameters or set defaults
  const initialSearch = searchParams.get('search')?.toLowerCase() || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialSort = searchParams.get('sort') || 'featured';
  const initialFeaturedOnly = searchParams.get('featured') === 'true';
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState(initialSort);
  const [featuredOnly, setFeaturedOnly] = useState(initialFeaturedOnly);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // Get unique categories from stores
  const categories = ['all', ...storeCategories];
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortOption !== 'featured') params.set('sort', sortOption);
    if (featuredOnly) params.set('featured', 'true');
    
    navigate({ search: params.toString() }, { replace: true });
  }, [searchTerm, selectedCategory, sortOption, featuredOnly, navigate]);
  
  // Filter stores based on all criteria
  const filteredStores = stores.filter((store) => {
    // Search filter
    const matchesSearch = 
      !searchTerm || 
      (store.cashbackRate?.toLowerCase().includes(searchTerm) || 
      (store.name && store.name.toLowerCase().includes(searchTerm)));
    
    // Category filter
    const matchesCategory = 
      selectedCategory === 'all' || 
      store.category === selectedCategory;
    
    // Featured filter
    const matchesFeatured = 
      !featuredOnly || 
      store.featured;
    
    return matchesSearch && matchesCategory && matchesFeatured;
  });
  
  // Sort the filtered stores
  const sortedStores = [...filteredStores].sort((a, b) => {
    switch (sortOption) {
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      case 'highest':
        return parseFloat(b.cashbackRate) - parseFloat(a.cashbackRate);
      case 'lowest':
        return parseFloat(a.cashbackRate) - parseFloat(b.cashbackRate);
      case 'popularity':
        return b.popularity - a.popularity;
      case 'featured':
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.popularity - a.popularity;
    }
  });
  
  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortOption('featured');
    setFeaturedOnly(false);
  };
  
  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.storesPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Cash Back Stores</h1>
        <p className={styles.subtitle}>
          Shop at your favorite stores and earn cash back on every purchase
        </p>
      </div>
      
      <div className={styles.searchAndFilterContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className={styles.searchInput}
            aria-label="Search stores"
          />
        </div>
        
        <button 
          className={styles.filterToggleButton} 
          onClick={toggleFilterMenu}
          aria-expanded={isFilterMenuOpen}
          aria-controls="filter-menu"
        >
          <FaFilter /> Filters
        </button>
      </div>
      
      <div 
        id="filter-menu" 
        className={`${styles.filterMenu} ${isFilterMenuOpen ? styles.open : ''}`}
      >
        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}><FaTag /> Categories</h3>
          <div className={styles.categoryButtons}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}><FaSort /> Sort By</h3>
          <select
            className={styles.sortSelect}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            aria-label="Sort stores"
          >
            <option value="featured">Featured</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
            <option value="highest">Highest Cash Back</option>
            <option value="lowest">Lowest Cash Back</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
        
        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}><FaStar /> Featured</h3>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={() => setFeaturedOnly(!featuredOnly)}
              className={styles.checkbox}
            />
            Show featured stores only
          </label>
        </div>
        
        <button 
          className={styles.clearFiltersButton}
          onClick={handleClearFilters}
        >
          Clear All Filters
        </button>
      </div>
      
      <div className={styles.resultsInfo}>
        <p>
          <span className={styles.resultCount}>{sortedStores.length}</span> stores found
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          {featuredOnly && ' (featured only)'}
        </p>
      </div>
      
      <div className={styles.storesGrid}>
        {sortedStores.length > 0 ? (
          sortedStores.map((store) => (
            <TopStore
              key={store.id}
              percent={store.cashbackRate}
              brand={store.name || 'Unknown Store'}
              image={store.logo || 'default-image.jpg'}
              featured={store.featured}
              category={store.category}
              terms={store.description}
            />
          ))
        ) : (
          <div className={styles.noResults}>
            <FaShoppingBag className={styles.noResultsIcon} />
            <p>No stores match your search criteria.</p>
            <button 
              className={styles.clearFiltersButton}
              onClick={handleClearFilters}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
      
      <div className={styles.storesPagination}>
        {/* Pagination would go here for larger datasets */}
      </div>
      
      <div className={styles.storesInfo}>
        <h2>How Cash Back Works</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Shop Online</h3>
            <p>Click through to your favorite store from CashHeros</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Make a Purchase</h3>
            <p>Buy what you want, just like you normally would</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Earn Cash Back</h3>
            <p>Get cash back deposited to your CashHeros account</p>
          </div>
        </div>
      </div>
    </div>
  );
};