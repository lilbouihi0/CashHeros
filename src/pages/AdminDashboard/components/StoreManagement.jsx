import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';
import { mockServices } from '../../../services/mockServices';

const StoreManagement = () => {
  const { accessToken } = useContext(AuthContext);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    description: '',
    categories: [],
    featured: false,
    popularity: 50,
    affiliateLink: '',
    termsAndConditions: ''
  });
  const [filters, setFilters] = useState({
    category: '',
    featured: ''
  });

  // Available categories
  const categories = [
    'Electronics', 'Fashion', 'Home', 'Beauty', 'Food', 'Travel', 
    'Health', 'Sports', 'Books', 'Toys', 'Pets', 'Automotive'
  ];

  useEffect(() => {
    fetchStores();
  }, [accessToken, currentPage, filters]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      
      // Use mock service instead of real API
      const response = await mockServices.getStores(currentPage, 10);
      
      setStores(response.data);
      setTotalPages(response.pagination.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to load stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStores();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      featured: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, value]
        : prev.categories.filter(cat => cat !== value)
    }));
  };

  const openAddModal = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      logo: '',
      website: '',
      description: '',
      categories: [],
      featured: false,
      popularity: 50,
      affiliateLink: '',
      termsAndConditions: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name || '',
      logo: store.logo || '',
      website: store.website || '',
      description: store.description || '',
      categories: store.categories || [],
      featured: store.featured || false,
      popularity: store.popularity || 50,
      affiliateLink: store.affiliateLink || '',
      termsAndConditions: store.termsAndConditions || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStore(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingStore) {
        // Update existing store using mock service
        await mockServices.updateStore(editingStore.id || editingStore._id, formData);
        setSuccess('Store updated successfully!');
      } else {
        // Create new store using mock service
        await mockServices.createStore(formData);
        setSuccess('Store created successfully!');
      }
      
      closeModal();
      fetchStores();
    } catch (err) {
      console.error('Error saving store:', err);
      setError(err.message || 'Failed to save store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this store? This will also remove all associated coupons and cashback offers.')) return;
    
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.deleteStore(id);
      setSuccess('Store deleted successfully!');
      fetchStores();
    } catch (err) {
      console.error('Error deleting store:', err);
      setError('Failed to delete store. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAllStores = async () => {
    if (!window.confirm('Are you sure you want to delete ALL stores? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.deleteAllStores();
      setSuccess('All stores deleted successfully!');
      fetchStores();
    } catch (err) {
      console.error('Error deleting all stores:', err);
      setError('Failed to delete all stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all data to default? This will restore all original stores.')) return;
    
    try {
      setLoading(true);
      await mockServices.resetData();
      setSuccess('All data has been reset successfully!');
      fetchStores();
    } catch (err) {
      console.error('Error resetting data:', err);
      setError('Failed to reset data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.updateStore(id, { featured: !currentStatus });
      setSuccess(`Store ${currentStatus ? 'removed from' : 'added to'} featured successfully!`);
      fetchStores();
    } catch (err) {
      console.error('Error updating store featured status:', err);
      setError('Failed to update featured status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && stores.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading stores...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cardHeader}>
        <h1>Store Management</h1>
        <div className={styles.headerButtons}>
          <button className={styles.button} onClick={openAddModal}>
            <FaPlus /> Add New Store
          </button>
          <button 
            className={`${styles.button} ${styles.buttonDanger}`} 
            onClick={handleDeleteAllStores}
            disabled={loading || stores.length === 0}
          >
            <FaTrash /> Delete All Stores
          </button>
          <button 
            className={`${styles.button} ${styles.buttonSecondary}`} 
            onClick={handleResetData}
            disabled={loading}
          >
            Reset Data
          </button>
        </div>
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Store Filters</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.filters}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  placeholder="Search by store name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.button}>
                  <FaSearch /> Search
                </button>
              </div>
            </form>
            
            <div className={styles.filterControls}>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className={styles.formControl}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                name="featured"
                value={filters.featured}
                onChange={handleFilterChange}
                className={styles.formControl}
              >
                <option value="">All Stores</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>
              
              <button 
                onClick={resetFilters} 
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Stores List</h2>
        </div>
        <div className={styles.cardBody}>
          {stores.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No stores found. Create your first store!</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Name</th>
                  <th>Categories</th>
                  <th>Popularity</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id || store._id}>
                    <td>
                      {store.logo ? (
                        <img 
                          src={store.logo.startsWith('http') ? store.logo : `https://${store.logo}`} 
                          alt={store.name} 
                          className={styles.storeLogo} 
                          width="40" 
                          height="40"
                          onError={(e) => {
                            console.log('Image failed to load:', store.logo);
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=Error';
                          }}
                        />
                      ) : (
                        <div className={styles.noLogo}>No Logo</div>
                      )}
                    </td>
                    <td>{store.name}</td>
                    <td>
                      <div className={styles.categoryTags}>
                        {store.categories && store.categories.map(category => (
                          <span key={category} className={styles.categoryTag}>
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{store.popularity || 0}</td>
                    <td>
                      <span className={store.featured ? styles.statusActive : styles.statusInactive}>
                        {store.featured ? 'Featured' : 'Not Featured'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button 
                          onClick={() => openEditModal(store)} 
                          className={`${styles.button} ${styles.buttonSecondary}`}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleToggleFeatured(store.id || store._id, store.featured)}
                          className={`${styles.button} ${store.featured ? styles.buttonSecondary : styles.button}`}
                        >
                          {store.featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button 
                          onClick={() => handleDelete(store.id || store._id)} 
                          className={`${styles.button} ${styles.buttonDanger}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                Previous
              </button>
              
              {[...Array(totalPages).keys()].map(page => (
                <button
                  key={page + 1}
                  onClick={() => setCurrentPage(page + 1)}
                  className={`${styles.paginationButton} ${currentPage === page + 1 ? styles.active : ''}`}
                >
                  {page + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingStore ? 'Edit Store' : 'Add New Store'}</h2>
              <button onClick={closeModal} className={styles.closeButton}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Store Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="logo">Logo URL</label>
                <input
                  type="url"
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="website">Website URL*</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="Enter store description"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Categories</label>
                <div className={styles.checkboxGrid}>
                  {categories.map(category => (
                    <label key={category} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="categories"
                        value={category}
                        checked={formData.categories.includes(category)}
                        onChange={handleCategoryChange}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="popularity">Popularity (0-100)</label>
                  <input
                    type="number"
                    id="popularity"
                    name="popularity"
                    value={formData.popularity}
                    onChange={handleInputChange}
                    className={styles.formControl}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    Featured Store
                  </label>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="affiliateLink">Affiliate Link</label>
                <input
                  type="url"
                  id="affiliateLink"
                  name="affiliateLink"
                  value={formData.affiliateLink}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="https://example.com/affiliate"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="termsAndConditions">Terms & Conditions</label>
                <textarea
                  id="termsAndConditions"
                  name="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="Enter terms and conditions for this store"
                />
              </div>
              
              <div className={styles.modalFooter}>
                <button type="button" onClick={closeModal} className={`${styles.button} ${styles.buttonSecondary}`}>
                  Cancel
                </button>
                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Saving...' : (editingStore ? 'Update Store' : 'Create Store')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;