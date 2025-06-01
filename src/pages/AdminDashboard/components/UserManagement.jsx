import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { FaSearch, FaEdit, FaTrash, FaLock, FaUnlock, FaEnvelope, FaUser, FaUserShield } from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';
import { mockServices } from '../../../services/mockServices';

const UserManagement = () => {
  const { user, accessToken } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    verified: false
  });
  const [filters, setFilters] = useState({
    role: '',
    verified: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [accessToken, currentPage, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Use mock service instead of real API
      const response = await mockServices.getUsers(currentPage, 10);
      
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
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
      role: '',
      verified: ''
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

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'user',
      verified: user.verified || false
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Use mock service instead of real API
      await mockServices.updateUser(editingUser.id || editingUser._id, formData);
      
      setSuccess('User updated successfully!');
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === user?.userId) {
      setError("You cannot delete your own account!");
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.deleteUser(id);
      setSuccess('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAllUsers = async () => {
    if (!window.confirm('Are you sure you want to delete ALL users? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.deleteAllUsers();
      setSuccess('All users deleted successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting all users:', err);
      setError('Failed to delete all users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all data to default? This will restore all original users.')) return;
    
    try {
      setLoading(true);
      await mockServices.resetData();
      setSuccess('All data has been reset successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Error resetting data:', err);
      setError('Failed to reset data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (id, currentStatus) => {
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.updateUser(id, { verified: !currentStatus });
      setSuccess(`User ${currentStatus ? 'unverified' : 'verified'} successfully!`);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user verification status:', err);
      setError('Failed to update verification status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (id, currentRole) => {
    if (id === user?.userId) {
      setError("You cannot change your own role!");
      return;
    }
    
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.updateUser(id, { role: newRole });
      setSuccess(`User role changed to ${newRole} successfully!`);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async (id) => {
    try {
      setLoading(true);
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Verification email sent successfully!');
    } catch (err) {
      console.error('Error sending verification email:', err);
      setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cardHeader}>
        <h1>User Management</h1>
        <div className={styles.headerButtons}>
          <button 
            className={`${styles.button} ${styles.buttonDanger}`} 
            onClick={handleDeleteAllUsers}
            disabled={loading || users.length === 0}
          >
            <FaTrash /> Delete All Users
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
          <h2>User Filters</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.filters}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  placeholder="Search by name or email..."
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
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className={styles.formControl}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              
              <select
                name="verified"
                value={filters.verified}
                onChange={handleFilterChange}
                className={styles.formControl}
              >
                <option value="">All Verification Status</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
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
          <h2>Users List</h2>
        </div>
        <div className={styles.cardBody}>
          {users.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No users found matching your criteria.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => (
                  <tr key={userData.id || userData._id}>
                    <td>{userData.firstName} {userData.lastName}</td>
                    <td>{userData.email}</td>
                    <td>
                      <span className={userData.role === 'admin' ? styles.statusActive : ''}>
                        {userData.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      <span className={userData.emailVerified || userData.verified ? styles.statusActive : styles.statusInactive}>
                        {userData.emailVerified || userData.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>{userData.joinDate ? new Date(userData.joinDate).toLocaleDateString() : 
                         userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button 
                          onClick={() => openEditModal(userData)} 
                          className={`${styles.button} ${styles.buttonSecondary}`}
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>
                        
                        <button 
                          onClick={() => handleToggleRole(userData.id || userData._id, userData.role)}
                          className={`${styles.button} ${userData.role === 'admin' ? styles.buttonSecondary : styles.button}`}
                          disabled={(userData.id || userData._id) === (user && (user.userId || user.id))}
                          title={userData.role === 'admin' ? 'Make User' : 'Make Admin'}
                        >
                          {userData.role === 'admin' ? <FaUser /> : <FaUserShield />}
                        </button>
                        
                        <button 
                          onClick={() => handleToggleVerification(userData.id || userData._id, userData.emailVerified || userData.verified)}
                          className={`${styles.button} ${(userData.emailVerified || userData.verified) ? styles.buttonSecondary : styles.button}`}
                          title={(userData.emailVerified || userData.verified) ? 'Mark as Unverified' : 'Mark as Verified'}
                        >
                          {(userData.emailVerified || userData.verified) ? <FaLock /> : <FaUnlock />}
                        </button>
                        
                        {!userData.verified && (
                          <button 
                            onClick={() => sendVerificationEmail(userData._id)}
                            className={styles.button}
                            title="Send Verification Email"
                          >
                            <FaEnvelope />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleDelete(userData._id)} 
                          className={`${styles.button} ${styles.buttonDanger}`}
                          disabled={userData._id === user.userId}
                          title="Delete User"
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
              <h2>Edit User</h2>
              <button onClick={closeModal} className={styles.closeButton}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={styles.formControl}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={styles.formControl}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  className={styles.formControl}
                  disabled // Email cannot be changed
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={styles.formControl}
                    disabled={editingUser && editingUser._id === user.userId} // Cannot change own role
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  {editingUser && editingUser._id === user.userId && (
                    <small className={styles.helpText}>You cannot change your own role.</small>
                  )}
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="verified"
                      checked={formData.verified}
                      onChange={handleInputChange}
                    />
                    Verified
                  </label>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button type="button" onClick={closeModal} className={`${styles.button} ${styles.buttonSecondary}`}>
                  Cancel
                </button>
                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Saving...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;