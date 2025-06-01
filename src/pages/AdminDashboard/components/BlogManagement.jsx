import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaEyeSlash, 
  FaExternalLinkAlt, FaRobot, FaMagic
} from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';
import blogService from '../../../services/blogService';
import { mockServices } from '../../../services/mockServices';
import { BLOG_CATEGORIES } from '../../../config/constants';
import AIBlogGenerator from './AIBlogGenerator';

const BlogManagement = () => {
  const { accessToken } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [viewingBlog, setViewingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    image: '',
    tags: [],
    published: true,
    featured: false
  });
  const [filters, setFilters] = useState({
    category: '',
    published: '',
    featured: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Use categories from constants
  const categories = BLOG_CATEGORIES;

  useEffect(() => {
    fetchBlogs();
  }, [accessToken, currentPage, filters]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      
      // Build filters object from state
      const filterParams = {
        search: searchTerm,
        category: filters.category || undefined,
        isPublished: filters.published === '' ? undefined : filters.published === 'true',
        featured: filters.featured === '' ? undefined : filters.featured === 'true',
        sort: 'createdAt',
        direction: 'desc'
      };
      
      // Use mock service instead of real API
      const response = await mockServices.getBlogPosts(currentPage, 10);
      
      // Check if response has the expected structure
      if (response.data) {
        setBlogs(response.data);
      } else if (Array.isArray(response)) {
        // If response is an array, use it directly
        setBlogs(response);
      } else {
        console.error('Unexpected response format:', response);
        setBlogs([]);
      }
      
      // Handle pagination data which might be in different locations
      if (response.meta && response.meta.totalPages) {
        setTotalPages(response.meta.totalPages);
      } else if (response.pagination && response.pagination.totalPages) {
        setTotalPages(response.pagination.totalPages);
      } else {
        // Default to 1 page if pagination info is not available
        setTotalPages(1);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blog posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
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
      published: '',
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

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const openAddModal = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      content: '',
      summary: '',
      category: '',
      image: '',
      tags: [],
      published: true,
      featured: false
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      summary: blog.summary || '',
      category: blog.category || '',
      image: blog.image || '',
      tags: blog.tags || [],
      published: blog.published !== undefined ? blog.published : true,
      featured: blog.featured || false
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };
  
  const openViewModal = (blog) => {
    setViewingBlog(blog);
    setIsViewModalOpen(true);
  };
  
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingBlog(null);
  };
  
  const toggleAIGenerator = () => {
    setShowAIGenerator(!showAIGenerator);
  };
  
  const handleAIGenerated = (generatedBlog) => {
    // Convert tags array to string for the tag input
    const tagsString = generatedBlog.tags.join(', ');
    
    // Set the form data with the generated content
    setFormData({
      title: generatedBlog.title || '',
      content: generatedBlog.content || '',
      summary: generatedBlog.summary || '',
      category: generatedBlog.category || '',
      image: generatedBlog.image || '',
      tags: generatedBlog.tags || [],
      published: true,
      featured: false
    });
    
    // Hide the AI generator
    setShowAIGenerator(false);
    
    // Open the blog editor modal
    setIsModalOpen(true);
    
    // Show success message with instructions
    setSuccess('AI-generated content ready for editing! Click "Create Post" to save the blog.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare blog data
      const blogData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category,
        image: formData.image, // Use 'image' instead of 'featuredImage' for consistency
        tags: formData.tags,
        published: formData.published, // Use 'published' instead of 'isPublished' for consistency
        featured: formData.featured,
        date: new Date().toLocaleDateString() // Add date for display
      };
      
      if (editingBlog) {
        // Update existing blog - use id or _id depending on which one is available
        const blogId = editingBlog.id || editingBlog._id;
        
        if (!blogId) {
          throw new Error('Blog ID is missing');
        }
        
        // Use mock service instead of real API
        const response = await mockServices.updateBlogPost(blogId, blogData);
        setSuccess('Blog post updated successfully!');
      } else {
        // Create new blog using mock service
        const response = await mockServices.createBlogPost(blogData);
        setSuccess('Blog post created successfully!');
      }
      
      closeModal();
      
      // Refresh the blog list to ensure it's up to date
      // Add a small delay to ensure the server has time to process the request
      setTimeout(() => {
        fetchBlogs();
        console.log('Refreshing blog list after save');
      }, 500);
    } catch (err) {
      console.error('Error saving blog:', err);
      setError(err.message || 'Failed to save blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;
    
    try {
      if (!id) {
        throw new Error('Blog ID is missing');
      }
      
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.deleteBlogPost(id);
      setSuccess('Blog post deleted successfully!');
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      setError(err.message || 'Failed to delete blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAllBlogPosts = async () => {
    if (!window.confirm('Are you sure you want to delete ALL blog posts? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.deleteAllBlogPosts();
      setSuccess('All blog posts deleted successfully!');
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting all blog posts:', err);
      setError('Failed to delete all blog posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all data to default? This will restore all original blog posts.')) return;
    
    try {
      setLoading(true);
      await mockServices.resetData();
      setSuccess('All data has been reset successfully!');
      fetchBlogs();
    } catch (err) {
      console.error('Error resetting data:', err);
      setError('Failed to reset data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublished = async (id, currentStatus) => {
    try {
      if (!id) {
        throw new Error('Blog ID is missing');
      }
      
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.toggleBlogPublishStatus(id, !currentStatus);
      
      setSuccess(`Blog post ${currentStatus ? 'unpublished' : 'published'} successfully!`);
      fetchBlogs();
    } catch (err) {
      console.error('Error updating blog publish status:', err);
      setError(err.message || 'Failed to update publish status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      if (!id) {
        throw new Error('Blog ID is missing');
      }
      
      setLoading(true);
      // Use mock service instead of real API
      await mockServices.toggleBlogFeatureStatus(id, !currentStatus);
      
      setSuccess(`Blog post ${currentStatus ? 'removed from' : 'added to'} featured successfully!`);
      fetchBlogs();
    } catch (err) {
      console.error('Error updating blog featured status:', err);
      setError(err.message || 'Failed to update featured status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading blog posts...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cardHeader}>
        <h1>Blog Management</h1>
        <div className={styles.headerButtons}>
          <button 
            className={`${styles.button} ${styles.aiButton}`} 
            onClick={toggleAIGenerator}
            title="Generate blog content with AI"
          >
            <FaRobot /> <FaMagic /> AI Content Generator
          </button>
          <button className={styles.button} onClick={openAddModal}>
            <FaPlus /> Add New Blog Post
          </button>
          <button 
            className={`${styles.button} ${styles.buttonDanger}`} 
            onClick={handleDeleteAllBlogPosts}
            disabled={loading || blogs.length === 0}
          >
            <FaTrash /> Delete All Blog Posts
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
      
      {showAIGenerator && (
        <AIBlogGenerator 
          onBlogGenerated={handleAIGenerated} 
          categories={categories}
        />
      )}
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Blog Filters</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.filters}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  placeholder="Search by title or content..."
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
                name="published"
                value={filters.published}
                onChange={handleFilterChange}
                className={styles.formControl}
              >
                <option value="">All Status</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
              
              <select
                name="featured"
                value={filters.featured}
                onChange={handleFilterChange}
                className={styles.formControl}
              >
                <option value="">All Posts</option>
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
          <h2>Blog Posts List</h2>
        </div>
        <div className={styles.cardBody}>
          {blogs.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No blog posts found. Create your first blog post!</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => {
                  // Ensure we have a valid ID for the blog
                  const blogId = blog.id || blog._id;
                  
                  return (
                    <tr key={blogId}>
                      <td>{blog.title}</td>
                      <td>{blog.category}</td>
                      <td>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Unknown'}</td>
                      <td>
                        <span className={blog.published ? styles.statusActive : styles.statusInactive}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <span className={blog.featured ? styles.statusActive : styles.statusInactive}>
                          {blog.featured ? 'Featured' : 'Not Featured'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.tableActions}>
                          <button 
                            onClick={() => openViewModal(blog)} 
                            className={`${styles.button} ${styles.buttonPrimary} ${styles.actionButton}`}
                            title="View Blog Post"
                          >
                            <FaExternalLinkAlt />
                          </button>
                          
                          <button 
                            onClick={() => openEditModal(blog)} 
                            className={`${styles.button} ${styles.buttonSecondary} ${styles.actionButton}`}
                            title="Edit Blog Post"
                          >
                            <FaEdit />
                          </button>
                          
                          {blogId && (
                            <>
                              <button 
                                onClick={() => handleTogglePublished(blogId, blog.published)}
                                className={`${styles.button} ${blog.published ? styles.buttonSecondary : styles.button} ${styles.actionButton}`}
                                title={blog.published ? 'Unpublish' : 'Publish'}
                              >
                                {blog.published ? <FaEyeSlash /> : <FaEye />}
                              </button>
                              
                              <button 
                                onClick={() => handleToggleFeatured(blogId, blog.featured)}
                                className={`${styles.button} ${blog.featured ? styles.buttonSecondary : styles.button}`}
                                title={blog.featured ? 'Unfeature' : 'Feature'}
                              >
                                {blog.featured ? 'Unfeature' : 'Feature'}
                              </button>
                              
                              <button 
                                onClick={() => handleDelete(blogId)} 
                                className={`${styles.button} ${styles.buttonDanger} ${styles.actionButton}`}
                                title="Delete Blog Post"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <h2>{editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}</h2>
              <button onClick={closeModal} className={styles.closeButton}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
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
                <label htmlFor="summary">Summary</label>
                <textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="Brief summary of the blog post"
                  rows="2"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="content">Content*</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className={styles.formControl}
                  placeholder="Enter blog content"
                  rows="10"
                  required
                />
              </div>
              
              <div className={styles.formRow}>
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
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="image">Featured Image URL</label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className={styles.formControl}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="tags">Tags</label>
                <div className={styles.tagInputContainer}>
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    className={styles.formControl}
                    placeholder="Add tags (press Enter or comma to add)"
                  />
                  <button 
                    type="button" 
                    onClick={addTag}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                  >
                    Add
                  </button>
                </div>
                
                <div className={styles.tagsList}>
                  {formData.tags.map(tag => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className={styles.removeTagButton}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="published"
                      checked={formData.published}
                      onChange={handleInputChange}
                    />
                    Published
                  </label>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    Featured Post
                  </label>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button type="button" onClick={closeModal} className={`${styles.button} ${styles.buttonSecondary}`}>
                  Cancel
                </button>
                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Saving...' : (editingBlog ? 'Update Post' : 'Create Post')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Blog Modal */}
      {isViewModalOpen && viewingBlog && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.viewModal}`}>
            <div className={styles.modalHeader}>
              <h2>Blog Post Preview</h2>
              <button onClick={closeViewModal} className={styles.closeButton}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.blogPreviewContainer}>
                {viewingBlog.image && (
                  <div className={styles.blogPreviewImage}>
                    <img src={viewingBlog.image} alt={viewingBlog.title} />
                  </div>
                )}
                
                <div className={styles.blogPreviewHeader}>
                  <h1 className={styles.blogPreviewTitle}>{viewingBlog.title}</h1>
                  
                  <div className={styles.blogPreviewMeta}>
                    <span className={styles.blogPreviewCategory}>{viewingBlog.category}</span>
                    <span className={styles.blogPreviewDate}>
                      {viewingBlog.createdAt ? new Date(viewingBlog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown date'}
                    </span>
                  </div>
                  
                  {viewingBlog.tags && viewingBlog.tags.length > 0 && (
                    <div className={styles.blogPreviewTags}>
                      {viewingBlog.tags.map(tag => (
                        <span key={tag} className={styles.blogPreviewTag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                {viewingBlog.summary && (
                  <div className={styles.blogPreviewSummary}>
                    <p><strong>Summary:</strong> {viewingBlog.summary}</p>
                  </div>
                )}
                
                <div className={styles.blogPreviewContent}>
                  {viewingBlog.content.split('\n').map((paragraph, index) => (
                    paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                  ))}
                </div>
                
                <div className={styles.blogPreviewStatus}>
                  <div className={styles.statusBadges}>
                    <span className={`${styles.statusBadge} ${viewingBlog.published ? styles.statusActive : styles.statusInactive}`}>
                      {viewingBlog.published ? 'Published' : 'Draft'}
                    </span>
                    {viewingBlog.featured && (
                      <span className={`${styles.statusBadge} ${styles.statusFeatured}`}>
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button type="button" onClick={closeViewModal} className={`${styles.button} ${styles.buttonSecondary}`}>
                Close
              </button>
              <button 
                type="button" 
                onClick={() => {
                  closeViewModal();
                  openEditModal(viewingBlog);
                }} 
                className={styles.button}
              >
                Edit This Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;