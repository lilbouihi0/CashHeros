import React, { useState, useEffect } from 'react';
import { mockServices } from '../../../services/mockServices';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';
import axios from 'axios';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discount: 0,
    store: {
      name: '',
      logo: ''
    },
    expiryDate: '',
    category: '',
    isActive: true
  });
  const [filters, setFilters] = useState({
    category: '',
    store: '',
    isActive: ''
  });

  useEffect(() => {
    // Get access token from localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
    }
    
    fetchCoupons();
  }, [currentPage, filters]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      
      // Use mock service instead of real API
      const response = await mockServices.getCoupons(currentPage, 10);
      
      setCoupons(response.data);
      setTotalPages(response.pagination.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCoupons();
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
      store: '',
      isActive: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('store.')) {
      const storeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        store: {
          ...prev.store,
          [storeField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      discount: 0,
      store: {
        name: '',
        logo: ''
      },
      expiryDate: '',
      category: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    
    // Format date for input field
    let formattedDate = '';
    if (coupon.expiryDate) {
      const date = new Date(coupon.expiryDate);
      formattedDate = date.toISOString().split('T')[0];
    }
    
    setFormData({
      code: coupon.code,
      title: coupon.title || '',
      description: coupon.description || '',
      discount: coupon.discount,
      store: {
        name: coupon.store?.name || '',
        logo: coupon.store?.logo || ''
      },
      expiryDate: formattedDate,
      category: coupon.category || '',
      isActive: coupon.isActive
    });
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingCoupon) {
        // Update existing coupon using mock service
        await mockServices.updateCoupon(editingCoupon.id || editingCoupon._id, formData);
        setSuccess('Coupon updated successfully!');
      } else {
        // Create new coupon using mock service
        await mockServices.createCoupon(formData);
        setSuccess('Coupon created successfully!');
      }
      
      closeModal();
      fetchCoupons();
    } catch (err) {
      console.error('Error saving coupon:', err);
      setError(err.message || 'Failed to save coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.deleteCoupon(id);
      setSuccess('Coupon deleted successfully!');
      fetchCoupons();
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Failed to delete coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAllCoupons = async () => {
    if (!window.confirm('Are you sure you want to delete ALL coupons? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      // Use mock service instead of real API for development
      await mockServices.deleteAllCoupons();
      setSuccess('All coupons deleted successfully!');
      fetchCoupons();
    } catch (err) {
      console.error('Error deleting all coupons:', err);
      setError('Failed to delete all coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all data to default? This will restore all original coupons.')) return;
    
    try {
      setLoading(true);
      await mockServices.resetData();
      setSuccess('All data has been reset successfully!');
      fetchCoupons();
    } catch (err) {
      console.error('Error resetting data:', err);
      setError('Failed to reset data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.updateCoupon(id, { isActive: !currentStatus });
      setSuccess(`Coupon ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchCoupons();
    } catch (err) {
      console.error('Error updating coupon status:', err);
      setError('Failed to update coupon status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && coupons.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading coupons...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cardHeader}>
        <h1>Coupon Management</h1>
        <div className={styles.headerButtons}>
          <button className={styles.button} onClick={openAddModal}>
            <FaPlus /> Add New Coupon
          </button>
          <button 
            className={`${styles.button} ${styles.buttonDanger}`} 
            onClick={handleDeleteAllCoupons}
            disabled={loading || coupons.length === 0}
          >
            <FaTrash /> Delete All Coupons
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
          <h2>Coupon Filters</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.filters}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  placeholder="Search by code or title..."
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
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
              </select>
              
              <select
                name="isActive"
                value={filters.isActive}
                onChange={handleFilterChange}
                className={styles.formControl}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
          <h2>Coupons List</h2>
        </div>
        <div className={styles.cardBody}>
          {coupons.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No coupons found. Create your first coupon!</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Store</th>
                  <th>Discount</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id || coupon._id}>
                    <td>{coupon.code}</td>
                    <td>{coupon.title}</td>
                    <td>{coupon.store && typeof coupon.store === 'object' ? coupon.store.name : coupon.store}</td>
                    <td>{coupon.discount || coupon.discountValue || 0}%</td>
                    <td>
                      {coupon.expiryDate 
                        ? new Date(coupon.expiryDate).toLocaleDateString() 
                        : 'No expiry'}
                    </td>
                    <td>
                      <span className={(coupon.isActive || coupon.active || !coupon.expired) ? styles.statusActive : styles.statusInactive}>
                        {(coupon.isActive || coupon.active || !coupon.expired) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button 
                          onClick={() => openEditModal(coupon)} 
                          className={`${styles.button} ${styles.buttonSecondary}`}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(coupon.id || coupon._id, coupon.isActive || coupon.active || !coupon.expired)}
                          className={`${styles.button} ${(coupon.isActive || coupon.active || !coupon.expired) ? styles.buttonSecondary : styles.button}`}
                        >
                          {(coupon.isActive || coupon.active || !coupon.expired) ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon.id || coupon._id)} 
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
              <h2>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
              <button onClick={closeModal} className={styles.closeButton}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="code">Coupon Code*</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  required
                  disabled={editingCoupon} // Don't allow editing code for existing coupons
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="title">Title*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={styles.formControl}
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
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="discount">Discount (%)*</label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className={styles.formControl}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={styles.formControl}
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="store.name">Store Name*</label>
                <input
                  type="text"
                  id="store.name"
                  name="store.name"
                  value={formData.store.name}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="store.logo">Store Logo URL</label>
                <input
                  type="url"
                  id="store.logo"
                  name="store.logo"
                  value={formData.store.logo}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
              
              <div className={styles.modalFooter}>
                <button type="button" onClick={closeModal} className={`${styles.button} ${styles.buttonSecondary}`}>
                  Cancel
                </button>
                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;