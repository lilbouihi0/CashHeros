import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';
import { mockServices } from '../../../services/mockServices';

const CashbackManagement = () => {
  const { accessToken } = useContext(AuthContext);
  const [cashbacks, setCashbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCashback, setEditingCashback] = useState(null);
  const [formData, setFormData] = useState({
    store: '',
    brand: '',
    percent: '',
    category: '',
    image: '',
    featured: false,
    popularity: 50,
    terms: ''
  });
  const [filters, setFilters] = useState({
    category: '',
    featured: ''
  });

  useEffect(() => {
    fetchCashbacks();
  }, [accessToken, currentPage, filters]);

  const fetchCashbacks = async () => {
    try {
      setLoading(true);
      
      // Use mock service instead of real API
      const response = await mockServices.getCashbacks(currentPage, 10);
      
      setCashbacks(response.data);
      setTotalPages(response.pagination.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching cashbacks:', err);
      setError('Failed to load cashback offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCashbacks();
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

  const openAddModal = () => {
    setEditingCashback(null);
    setFormData({
      store: '',
      brand: '',
      percent: '',
      category: '',
      image: '',
      featured: false,
      popularity: 50,
      terms: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cashback) => {
    setEditingCashback(cashback);
    setFormData({
      store: cashback.store || '',
      brand: cashback.brand || '',
      percent: cashback.percent || '',
      category: cashback.category || '',
      image: cashback.image || '',
      featured: cashback.featured || false,
      popularity: cashback.popularity || 50,
      terms: cashback.terms || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCashback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingCashback) {
        // Update existing cashback using mock service
        await mockServices.updateCashback(editingCashback.id || editingCashback._id, formData);
        setSuccess('Cashback offer updated successfully!');
      } else {
        // Create new cashback using mock service
        await mockServices.createCashback(formData);
        setSuccess('Cashback offer created successfully!');
      }
      
      closeModal();
      fetchCashbacks();
    } catch (err) {
      console.error('Error saving cashback:', err);
      setError(err.message || 'Failed to save cashback offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cashback offer?')) return;
    
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.deleteCashback(id);
      setSuccess('Cashback offer deleted successfully!');
      fetchCashbacks();
    } catch (err) {
      console.error('Error deleting cashback:', err);
      setError('Failed to delete cashback offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAllCashbacks = async () => {
    if (!window.confirm('Are you sure you want to delete ALL cashback offers? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.deleteAllCashbacks();
      setSuccess('All cashback offers deleted successfully!');
      fetchCashbacks();
    } catch (err) {
      console.error('Error deleting all cashbacks:', err);
      setError('Failed to delete all cashback offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all data to default? This will restore all original cashback offers.')) return;
    
    try {
      setLoading(true);
      await mockServices.resetData();
      setSuccess('All data has been reset successfully!');
      fetchCashbacks();
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
      await mockServices.updateCashback(id, { featured: !currentStatus });
      setSuccess(`Cashback offer ${currentStatus ? 'removed from' : 'added to'} featured successfully!`);
      fetchCashbacks();
    } catch (err) {
      console.error('Error updating cashback featured status:', err);
      setError('Failed to update featured status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && cashbacks.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading cashback offers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cardHeader}>
        <h1>Cashback Management</h1>
        <div className={styles.headerButtons}>
          <button className={styles.button} onClick={openAddModal}>
            <FaPlus /> Add New Cashback Offer
          </button>
          <button 
            className={`${styles.button} ${styles.buttonDanger}`} 
            onClick={handleDeleteAllCashbacks}
            disabled={loading || cashbacks.length === 0}
          >
            <FaTrash /> Delete All Cashbacks
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
          <h2>Cashback Filters</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.filters}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  placeholder="Search by store or brand..."
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
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home">Home</option>
                <option value="Beauty">Beauty</option>
                <option value="Retail">Retail</option>
                <option value="Travel">Travel</option>
              </select>
              
              <select
                name="featured"
                value={filters.featured}
                onChange={handleFilterChange}
                className={styles.formControl}
              >
                <option value="">All Offers</option>
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
          <h2>Cashback Offers List</h2>
        </div>
        <div className={styles.cardBody}>
          {cashbacks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No cashback offers found. Create your first cashback offer!</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Brand</th>
                  <th>Cashback</th>
                  <th>Category</th>
                  <th>Popularity</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cashbacks.map((cashback) => (
                  <tr key={cashback.id || cashback._id}>
                    <td>{cashback.store && typeof cashback.store === 'object' ? cashback.store.name : cashback.store}</td>
                    <td>{cashback.brand}</td>
                    <td>{cashback.percent || cashback.amount || '0%'}</td>
                    <td>{cashback.category}</td>
                    <td>{cashback.popularity || 0}</td>
                    <td>
                      <span className={cashback.featured ? styles.statusActive : styles.statusInactive}>
                        {cashback.featured ? 'Featured' : 'Not Featured'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button 
                          onClick={() => openEditModal(cashback)} 
                          className={`${styles.button} ${styles.buttonSecondary}`}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleToggleFeatured(cashback.id || cashback._id, cashback.featured)}
                          className={`${styles.button} ${cashback.featured ? styles.buttonSecondary : styles.button}`}
                        >
                          {cashback.featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button 
                          onClick={() => handleDelete(cashback.id || cashback._id)} 
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
              <h2>{editingCashback ? 'Edit Cashback Offer' : 'Add New Cashback Offer'}</h2>
              <button onClick={closeModal} className={styles.closeButton}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="store">Store*</label>
                  <input
                    type="text"
                    id="store"
                    name="store"
                    value={formData.store}
                    onChange={handleInputChange}
                    className={styles.formControl}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="brand">Brand*</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className={styles.formControl}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="percent">Cashback Percentage*</label>
                  <input
                    type="text"
                    id="percent"
                    name="percent"
                    value={formData.percent}
                    onChange={handleInputChange}
                    className={styles.formControl}
                    placeholder="e.g. 5%"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="category">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={styles.formControl}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Retail">Retail</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="image">Store Logo URL</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="terms">Terms & Conditions</label>
                <textarea
                  id="terms"
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="Enter terms and conditions for this cashback offer"
                />
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
                    Featured Offer
                  </label>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button type="button" onClick={closeModal} className={`${styles.button} ${styles.buttonSecondary}`}>
                  Cancel
                </button>
                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Saving...' : (editingCashback ? 'Update Offer' : 'Create Offer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashbackManagement;