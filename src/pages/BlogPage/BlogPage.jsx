// src/pages/BlogPage/BlogPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTag, FaHeart, FaStar, FaLaptop, FaPlane, FaShoppingCart, 
  FaCalendarAlt, FaEllipsisH, FaSearch, FaChevronRight, 
  FaChevronDown, FaPlus, FaEdit, FaRss, FaEnvelope
} from 'react-icons/fa';
import styles from './BlogPage.module.css';
import BlogCard from './BlogCard';
import TrendingSection from './TrendingSection';
import AIContentRecommendations from './AIContentRecommendations';
import { getRandomImage, getFeaturedImage, blogImages } from '../../assets/images/blog/imageUrls';
import ImagePreloader from '../../Components/ImagePreloader';

const categories = [
  { id: 'budget', label: 'Budget', icon: <FaTag /> },
  { id: 'beauty', label: 'Beauty', icon: <FaHeart /> },
  { id: 'fashion', label: 'Fashion', icon: <FaStar /> },
  { id: 'home', label: 'Home', icon: <FaLaptop /> },
  { id: 'travel', label: 'Travel', icon: <FaPlane /> },
  { id: 'deals', label: 'Deals', icon: <FaShoppingCart /> },
  { id: 'calendar', label: 'Calendar', icon: <FaCalendarAlt /> },
  { id: 'more', label: 'More', icon: <FaEllipsisH /> },
];

export const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: '',
    category: 'budget',
    excerpt: '',
  });
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInterests, setUserInterests] = useState(['budget', 'deals', 'fashion']);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [featuredPost, setFeaturedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
    checkAuthStatus();
    
    // Set hero image as CSS variable
    document.documentElement.style.setProperty('--hero-image', `url('${blogImages.hero}')`);
  }, []);
  
  // Check if user is logged in and has admin privileges
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token) {
      setIsLoggedIn(true);
      
      // Check if user has admin role
      try {
        const user = JSON.parse(userInfo);
        if (user && user.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error parsing user info:', err);
      }
    }
  };

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      // Import the mock services
      const { mockServices } = await import('../../services/mockServices');
      
      // Use mock services to get blog posts
      const response = await mockServices.getBlogPosts();
      
      // Check if response has the expected structure
      if (response.data) {
        // Add or replace images with high-quality Unsplash images
        const postsWithImages = response.data.map(post => {
          // Always use our high-quality Unsplash images based on category
          const category = getPostCategory(post) || 'default';
          return { ...post, image: getRandomImage(category) };
        });
        
        setPosts(postsWithImages);
        
        // Set a featured post (first post or a random one)
        if (postsWithImages.length > 0) {
          const featuredIndex = Math.floor(Math.random() * Math.min(3, postsWithImages.length));
          const featured = { ...postsWithImages[featuredIndex] };
          
          // Use a featured image for the featured post
          if (!featured.image) {
            featured.image = getFeaturedImage();
          }
          
          setFeaturedPost(featured);
        }
      } else if (Array.isArray(response)) {
        // If response is an array, use it directly
        const postsWithImages = response.map(post => {
          // Always use our high-quality Unsplash images based on category
          const category = getPostCategory(post) || 'default';
          return { ...post, image: getRandomImage(category) };
        });
        
        setPosts(postsWithImages);
        
        // Set a featured post (first post or a random one)
        if (postsWithImages.length > 0) {
          const featuredIndex = Math.floor(Math.random() * Math.min(3, postsWithImages.length));
          const featured = { ...postsWithImages[featuredIndex] };
          
          // Use a featured image for the featured post
          if (!featured.image) {
            featured.image = getFeaturedImage();
          }
          
          setFeaturedPost(featured);
        }
      } else {
        console.error('Unexpected response format:', response);
        setPosts([]);
      }
      
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs: ' + (err.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBlog((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in as an admin.');
        return;
      }
      
      // Import the mock services
      const { mockServices } = await import('../../services/mockServices');
      
      // Prepare the blog data with additional fields
      const blogData = {
        ...newBlog,
        date: new Date().toLocaleDateString(),
        content: newBlog.excerpt, // Use excerpt as content for simplicity
        published: true,
        featured: false,
        category: newBlog.category, // Ensure category is included
        // Always use a high-quality Unsplash image based on category
        image: getRandomImage(newBlog.category),
        author: {
          id: 'admin-1',
          name: 'Admin User'
        }
      };
      
      // Use mock services to create a new blog post
      const response = await mockServices.createBlogPost(blogData);
      
      // Check if response has the expected structure
      if (response && response.data) {
        // Update the UI with the new blog
        setPosts(prevPosts => [...prevPosts, response.data]);
        setNewBlog({ title: '', category: 'budget', excerpt: '' });
        setError(null); // Clear any previous errors
        
        // Refresh the blog list to ensure it's up to date
        fetchBlogs();
        
        // Hide the admin form after successful submission
        setShowAdminForm(false);
      } else {
        console.error('Unexpected response format:', response);
        setError('Error adding blog: Unexpected response format');
      }
    } catch (err) {
      console.error('Error adding blog:', err);
      setError('Error adding blog: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteBlog = async (id) => {
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in as an admin.');
        return;
      }
      
      // Import the mock services
      const { mockServices } = await import('../../services/mockServices');
      
      // Use mock services to delete the blog post
      await mockServices.deleteBlogPost(id);
      
      // Update the UI by removing the deleted blog
      setPosts(posts.filter(post => (post._id !== id && post.id !== id)));
      setError(null); // Clear any previous errors
      
      // Refresh the blog list to ensure it's up to date
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      setError('Error deleting blog: ' + (err.message || 'Unknown error'));
    }
  };

  // Map mock service categories to our UI categories
  const categoryMapping = {
    'Savings Tips': 'budget',
    'Shopping Guide': 'home',
    'Cashback': 'deals',
    'Coupons': 'deals',
    'Deals': 'deals',
    'Finance': 'budget',
    'Lifestyle': 'beauty',
    'Technology': 'home',
    'Fashion': 'fashion',
    'Travel': 'travel',
    'Food': 'home'
  };
  
  // Function to determine the UI category for a post
  const getPostCategory = (post) => {
    if (!post.category) return null;
    
    // Direct match with our UI categories
    const lowerCaseCategory = post.category.toLowerCase();
    if (categories.some(cat => cat.id === lowerCaseCategory)) {
      return lowerCaseCategory;
    }
    
    // Check for mapped category
    return categoryMapping[post.category] || null;
  };
  
  // Filter posts by category and search term
  const filteredPosts = Array.isArray(posts) 
    ? posts.filter(post => {
        // Category filter
        const categoryMatch = activeCategory === 'all' || getPostCategory(post) === activeCategory;
        
        // Search filter
        const searchMatch = !searchTerm || 
          (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
          (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return categoryMatch && searchMatch;
      })
    : [];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // In a real app, this would call an API to subscribe the user
      setIsSubscribed(true);
      setEmail('');
      // Show success message for 3 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }
  };

  return (
    <div className={styles.blogPage}>
      <ImagePreloader />
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Cash Heros Blog</h1>
          <p>Discover the latest tips, trends, and insights on saving money, finding deals, and maximizing your cash back.</p>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {featuredPost && !searchTerm && activeCategory === 'all' && (
        <div className={styles.featuredPostSection}>
          <h2 className={styles.sectionTitle}>Featured Article</h2>
          <div className={styles.featuredPost}>
            <div className={styles.featuredImageContainer}>
              <img 
                src={featuredPost.image || getFeaturedImage()} 
                alt={featuredPost.title} 
                className={styles.featuredImage} 
              />
              <div className={styles.featuredOverlay}></div>
              <div className={styles.featuredBadge}>Featured</div>
            </div>
            <div className={styles.featuredContent}>
              <div className={styles.featuredMeta}>
                <span className={styles.featuredCategory}>
                  {featuredPost.category || 'General'}
                </span>
                <span className={styles.featuredDate}>
                  {featuredPost.date || 
                   (featuredPost.publishedAt && new Date(featuredPost.publishedAt).toLocaleDateString()) || 
                   (featuredPost.createdAt && new Date(featuredPost.createdAt).toLocaleDateString()) || 
                   'Recent'}
                </span>
              </div>
              <h3 className={styles.featuredTitle}>{featuredPost.title}</h3>
              <p className={styles.featuredExcerpt}>
                {featuredPost.excerpt || featuredPost.content?.substring(0, 150) || "Check out this featured article from our blog."}
              </p>
              <button className={styles.readMoreButton}>
                Read Full Article <FaChevronRight className={styles.readMoreIcon} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <div className={styles.categoryNavContainer}>
        <div className={styles.categoryNav}>
          <button
            className={`${styles.categoryButton} ${activeCategory === 'all' && styles.active}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {categories.filter(cat => cat.id !== 'more').map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryButton} ${activeCategory === cat.id && styles.active}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Controls */}
      {isLoggedIn && isAdmin && (
        <div className={styles.adminControls}>
          <button 
            className={styles.adminToggleButton}
            onClick={() => setShowAdminForm(!showAdminForm)}
          >
            {showAdminForm ? 'Hide Admin Form' : 'Add New Blog Post'} {showAdminForm ? <FaChevronDown /> : <FaPlus />}
          </button>
          
          {showAdminForm && (
            <div className={styles.uploadForm}>
              <h2><FaEdit /> Create New Blog Post</h2>
              {error && <p className={styles.error}>{error}</p>}
              <form onSubmit={handleAddBlog}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Title</label>
                  <input 
                    type="text" 
                    id="title"
                    name="title" 
                    placeholder="Enter blog title" 
                    value={newBlog.title} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="category">Category</label>
                  <select 
                    id="category"
                    name="category" 
                    value={newBlog.category} 
                    onChange={handleInputChange}
                  >
                    {categories.filter(cat => cat.id !== 'more').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="excerpt">Excerpt</label>
                  <textarea 
                    id="excerpt"
                    name="excerpt" 
                    placeholder="Brief summary of the blog post" 
                    value={newBlog.excerpt} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <p className={styles.imageNote}>
                    <i>Note: High-quality images will be automatically assigned based on the selected category.</i>
                  </p>
                </div>
                
                <div className={styles.formActions}>
                  <button type="button" onClick={() => setShowAdminForm(false)} className={styles.cancelButton}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Publish Post
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className={styles.mainContentWrapper}>
        <div className={styles.mainContent}>
          {/* AI Recommendations for logged-in users */}
          {isLoggedIn && !searchTerm && (
            <AIContentRecommendations 
              posts={posts} 
              userInterests={userInterests} 
            />
          )}
          
          {/* Blog Posts */}
          <div className={styles.blogCards}>
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading blog posts...</p>
              </div>
            ) : searchTerm ? (
              // Search Results
              <div className={styles.searchResults}>
                <h2 className={styles.searchResultsTitle}>
                  Search Results for "{searchTerm}"
                </h2>
                {filteredPosts.length > 0 ? (
                  <div className={styles.cardsGrid}>
                    {filteredPosts.map((post) => {
                      const postId = post.id || post._id || Math.random().toString(36).substring(2, 9);
                      return (
                        <BlogCard 
                          key={postId} 
                          {...post} 
                          id={postId} 
                          onDelete={handleDeleteBlog} 
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.noResults}>
                    <p>No posts found matching "{searchTerm}"</p>
                    <button 
                      className={styles.clearSearchButton}
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            ) : activeCategory !== 'all' ? (
              // Single Category View
              <div className={styles.categorySection}>
                <h2 className={styles.categoryTitle}>
                  {categories.find(cat => cat.id === activeCategory)?.label || 'All Posts'}
                </h2>
                <div className={styles.cardsGrid}>
                  {filteredPosts.map((post) => {
                    const postId = post.id || post._id || Math.random().toString(36).substring(2, 9);
                    return (
                      <BlogCard 
                        key={postId} 
                        {...post} 
                        id={postId} 
                        onDelete={handleDeleteBlog} 
                      />
                    );
                  })}
                  {filteredPosts.length === 0 && (
                    <p className={styles.noPosts}>No posts found in this category</p>
                  )}
                </div>
              </div>
            ) : (
              // All Categories View
              <>
                {categories.map((cat) => {
                  // Skip the "more" category
                  if (cat.id === 'more') return null;
                  
                  // Get posts for this category using our helper function
                  const catPosts = Array.isArray(posts) ? posts.filter(post => {
                    return getPostCategory(post) === cat.id;
                  }) : [];
                  
                  // Skip rendering if no posts in this category
                  if (catPosts.length === 0) return null;
                  
                  return (
                    <div key={cat.id} className={styles.categorySection}>
                      <div className={styles.categoryHeader}>
                        <h2 className={styles.categoryTitle}>{cat.label}</h2>
                        <button 
                          className={styles.viewAllButton}
                          onClick={() => setActiveCategory(cat.id)}
                        >
                          View All <FaChevronRight />
                        </button>
                      </div>
                      <div className={styles.cardsGrid}>
                        {catPosts.slice(0, 3).map((post) => {
                          // Use id or _id for the key
                          const postId = post.id || post._id || Math.random().toString(36).substring(2, 9);
                          return (
                            <BlogCard 
                              key={postId} 
                              {...post} 
                              id={postId} 
                              onDelete={handleDeleteBlog} 
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          
          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Trending Section */}
            <TrendingSection posts={Array.isArray(posts) ? posts.slice(0, 5) : []} />
            
            {/* Newsletter Subscription */}
            <div className={styles.newsletterSection}>
              <h3><FaRss /> Subscribe to Our Newsletter</h3>
              <p>Get the latest money-saving tips and deals delivered straight to your inbox.</p>
              
              {isSubscribed ? (
                <div className={styles.subscriptionSuccess}>
                  <p>Thank you for subscribing!</p>
                  <p>You'll receive our next newsletter soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className={styles.subscriptionForm}>
                  <div className={styles.inputWithIcon}>
                    <FaEnvelope className={styles.inputIcon} />
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit">Subscribe</button>
                </form>
              )}
              
              <p className={styles.privacyNote}>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
            
            {/* Popular Tags */}
            <div className={styles.tagsSection}>
              <h3>Popular Tags</h3>
              <div className={styles.tagsList}>
                {categories.filter(cat => cat.id !== 'more').map(cat => (
                  <button 
                    key={cat.id} 
                    className={styles.tagButton}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
                <button className={styles.tagButton}>
                  <FaTag /> Coupons
                </button>
                <button className={styles.tagButton}>
                  <FaTag /> Savings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer Footer */}
      <div className={styles.disclaimerFooter}>
        <p>
          Every product and brand featured on Cash Heros Blog is independently selected by our editors. 
          We may earn a commission on items you choose to buy. 
          <a href="/terms" className={styles.disclaimerLink}>Learn more</a>.
        </p>
      </div>
    </div>
  );
};