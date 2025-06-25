// src/pages/FeedbackSupportPage/FeedbackSupportPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import styles from './FeedbackSupportPage.module.css';

export const FeedbackSupportPage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('support');
  const [supportTickets, setSupportTickets] = useState([]);
  const [feedbackSubmissions, setFeedbackSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Support ticket form state
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'account',
    description: '',
    priority: 'medium'
  });
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'general',
    rating: 0,
    comments: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user support tickets and feedback when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch support tickets
        const ticketsResponse = await axios.get(buildApiUrl(API_ENDPOINTS.SUPPORT.TICKETS), {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        // Fetch feedback submissions
        const feedbackResponse = await axios.get(buildApiUrl(API_ENDPOINTS.FEEDBACK.SUBMISSIONS), {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        setSupportTickets(ticketsResponse.data.tickets || []);
        setFeedbackSubmissions(feedbackResponse.data.feedback || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, accessToken]);

  // Handle support ticket form input changes
  const handleTicketInputChange = (e) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle feedback form input changes
  const handleFeedbackInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle rating selection
  const handleRatingSelect = (rating) => {
    setFeedbackForm(prev => ({
      ...prev,
      rating
    }));
    
    // Clear error for rating
    if (formErrors.rating) {
      setFormErrors(prev => ({
        ...prev,
        rating: ''
      }));
    }
  };

  // Validate support ticket form
  const validateTicketForm = () => {
    const errors = {};
    
    if (!ticketForm.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!ticketForm.description.trim()) {
      errors.description = 'Description is required';
    } else if (ticketForm.description.trim().length < 20) {
      errors.description = 'Description should be at least 20 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate feedback form
  const validateFeedbackForm = () => {
    const errors = {};
    
    if (feedbackForm.rating === 0) {
      errors.rating = 'Please select a rating';
    }
    
    if (!feedbackForm.comments.trim()) {
      errors.comments = 'Comments are required';
    } else if (feedbackForm.comments.trim().length < 10) {
      errors.comments = 'Comments should be at least 10 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle support ticket submission
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateTicketForm()) return;
    
    try {
      setLoading(true);
      
      const response = await axios.post(buildApiUrl(API_ENDPOINTS.SUPPORT.TICKETS), ticketForm, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      // Add new ticket to the list
      setSupportTickets(prev => [response.data.ticket, ...prev]);
      
      // Reset form
      setTicketForm({
        subject: '',
        category: 'account',
        description: '',
        priority: 'medium'
      });
      
      setSuccessMessage('Support ticket submitted successfully! We will respond to your inquiry as soon as possible.');
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Failed to submit support ticket. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateFeedbackForm()) return;
    
    try {
      setLoading(true);
      
      const response = await axios.post(buildApiUrl(API_ENDPOINTS.FEEDBACK.SUBMIT), feedbackForm, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      // Add new feedback to the list
      setFeedbackSubmissions(prev => [response.data.feedback, ...prev]);
      
      // Reset form
      setFeedbackForm({
        type: 'general',
        rating: 0,
        comments: ''
      });
      
      setSuccessMessage('Thank you for your feedback! We appreciate your input and will use it to improve our services.');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Failed to submit feedback. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login', { state: { from: '/feedback-support' } });
    return null;
  }

  return (
    <div className={styles.feedbackSupportPage}>
      <div className={styles.container}>
        <h1>Help & Support</h1>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'support' ? styles.active : ''}`}
            onClick={() => setActiveTab('support')}
          >
            Support
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'feedback' ? styles.active : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            Feedback
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'faq' ? styles.active : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </button>
        </div>
        
        {loading && !successMessage ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {successMessage && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}
            
            {formErrors.submit && (
              <div className={styles.errorMessage}>{formErrors.submit}</div>
            )}
            
            {activeTab === 'support' && (
              <div className={styles.supportTab}>
                <div className={styles.supportHeader}>
                  <h2>Submit a Support Ticket</h2>
                  <p>
                    Need help with something? Submit a support ticket and our team will assist you as soon as possible.
                  </p>
                </div>
                
                <form onSubmit={handleTicketSubmit} className={styles.supportForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={ticketForm.subject}
                      onChange={handleTicketInputChange}
                      placeholder="Brief description of your issue"
                      className={formErrors.subject ? styles.inputError : ''}
                    />
                    {formErrors.subject && <span className={styles.errorText}>{formErrors.subject}</span>}
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        name="category"
                        value={ticketForm.category}
                        onChange={handleTicketInputChange}
                      >
                        <option value="account">Account Issues</option>
                        <option value="payment">Payment Problems</option>
                        <option value="cashback">Cashback Questions</option>
                        <option value="coupon">Coupon Issues</option>
                        <option value="technical">Technical Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="priority">Priority</label>
                      <select
                        id="priority"
                        name="priority"
                        value={ticketForm.priority}
                        onChange={handleTicketInputChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={ticketForm.description}
                      onChange={handleTicketInputChange}
                      placeholder="Please provide as much detail as possible about your issue"
                      rows="6"
                      className={formErrors.description ? styles.inputError : ''}
                    ></textarea>
                    {formErrors.description && <span className={styles.errorText}>{formErrors.description}</span>}
                  </div>
                  
                  <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </form>
                
                <div className={styles.ticketHistory}>
                  <h3>Your Support Tickets</h3>
                  
                  {supportTickets.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>You haven't submitted any support tickets yet.</p>
                    </div>
                  ) : (
                    <div className={styles.ticketList}>
                      {supportTickets.map((ticket, index) => (
                        <div key={index} className={styles.ticketCard}>
                          <div className={styles.ticketHeader}>
                            <h4>{ticket.subject}</h4>
                            <span className={`${styles.statusBadge} ${styles[ticket.status]}`}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className={styles.ticketMeta}>
                            <span>Ticket ID: {ticket.ticketId}</span>
                            <span>Created: {formatDate(ticket.createdAt)}</span>
                            <span>Category: {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}</span>
                          </div>
                          
                          <p className={styles.ticketDescription}>{ticket.description}</p>
                          
                          {ticket.response && (
                            <div className={styles.ticketResponse}>
                              <h5>Response from Support</h5>
                              <p>{ticket.response}</p>
                              <span className={styles.responseDate}>
                                Responded on {formatDate(ticket.respondedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'feedback' && (
              <div className={styles.feedbackTab}>
                <div className={styles.feedbackHeader}>
                  <h2>Share Your Feedback</h2>
                  <p>
                    We value your opinion! Please share your thoughts to help us improve our services.
                  </p>
                </div>
                
                <form onSubmit={handleFeedbackSubmit} className={styles.feedbackForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="type">Feedback Type</label>
                    <select
                      id="type"
                      name="type"
                      value={feedbackForm.type}
                      onChange={handleFeedbackInputChange}
                    >
                      <option value="general">General Feedback</option>
                      <option value="website">Website Experience</option>
                      <option value="cashback">Cashback Process</option>
                      <option value="coupons">Coupons & Deals</option>
                      <option value="customer-service">Customer Service</option>
                      <option value="suggestion">Suggestion</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Your Rating</label>
                    <div className={styles.ratingContainer}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`${styles.starButton} ${feedbackForm.rating >= star ? styles.active : ''}`}
                          onClick={() => handleRatingSelect(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {formErrors.rating && <span className={styles.errorText}>{formErrors.rating}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="comments">Your Comments</label>
                    <textarea
                      id="comments"
                      name="comments"
                      value={feedbackForm.comments}
                      onChange={handleFeedbackInputChange}
                      placeholder="Please share your thoughts, suggestions, or concerns"
                      rows="6"
                      className={formErrors.comments ? styles.inputError : ''}
                    ></textarea>
                    {formErrors.comments && <span className={styles.errorText}>{formErrors.comments}</span>}
                  </div>
                  
                  <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
                
                <div className={styles.feedbackHistory}>
                  <h3>Your Previous Feedback</h3>
                  
                  {feedbackSubmissions.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>You haven't submitted any feedback yet.</p>
                    </div>
                  ) : (
                    <div className={styles.feedbackList}>
                      {feedbackSubmissions.map((feedback, index) => (
                        <div key={index} className={styles.feedbackCard}>
                          <div className={styles.feedbackHeader}>
                            <h4>{feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)} Feedback</h4>
                            <div className={styles.feedbackRating}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={feedback.rating >= star ? styles.filledStar : styles.emptyStar}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className={styles.feedbackDate}>
                            Submitted on {formatDate(feedback.createdAt)}
                          </div>
                          
                          <p className={styles.feedbackComments}>{feedback.comments}</p>
                          
                          {feedback.response && (
                            <div className={styles.feedbackResponse}>
                              <h5>Our Response</h5>
                              <p>{feedback.response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'faq' && (
              <div className={styles.faqTab}>
                <div className={styles.faqHeader}>
                  <h2>Frequently Asked Questions</h2>
                  <p>
                    Find answers to common questions about our services.
                  </p>
                </div>
                
                <div className={styles.faqCategories}>
                  <div className={styles.faqCategory}>
                    <h3>Account & Profile</h3>
                    
                    <div className={styles.faqItem}>
                      <h4>How do I change my password?</h4>
                      <p>
                        You can change your password by going to your Account Settings, then selecting the "Security" tab.
                        From there, you can enter your current password and set a new one.
                      </p>
                    </div>
                    
                    <div className={styles.faqItem}>
                      <h4>How do I update my email address?</h4>
                      <p>
                        To update your email address, go to your Profile page and click on "Edit Profile". Enter your new
                        email address and save changes. You'll need to verify your new email address before the change is complete.
                      </p>
                    </div>
                  </div>
                  
                  <div className={styles.faqCategory}>
                    <h3>Cashback</h3>
                    
                    <div className={styles.faqItem}>
                      <h4>How long does it take for cashback to appear in my account?</h4>
                      <p>
                        Cashback typically appears as "Pending" within 7 days of your purchase. It remains in pending status
                        for 30-90 days (depending on the store's return policy) before becoming "Approved" and available for redemption.
                      </p>
                    </div>
                    
                    <div className={styles.faqItem}>
                      <h4>What is the minimum amount I can redeem?</h4>
                      <p>
                        The minimum redemption amount is $10.00. Once your available balance reaches this threshold,
                        you can request a payout via PayPal, bank transfer, or gift card.
                      </p>
                    </div>
                  </div>
                  
                  <div className={styles.faqCategory}>
                    <h3>Coupons & Deals</h3>
                    
                    <div className={styles.faqItem}>
                      <h4>Why isn't my coupon working?</h4>
                      <p>
                        Coupons may not work for several reasons: the coupon might have expired, it may have usage restrictions
                        (minimum purchase amount, specific products, etc.), or it might be limited to new customers only.
                        Always check the terms and conditions of each coupon.
                      </p>
                    </div>
                    
                    <div className={styles.faqItem}>
                      <h4>Can I combine coupons with cashback?</h4>
                      <p>
                        Yes, in most cases you can use coupons and still earn cashback. However, some stores may have
                        restrictions on combining offers, so always check the store's terms on our site.
                      </p>
                    </div>
                  </div>
                  
                  <div className={styles.faqCategory}>
                    <h3>Referrals</h3>
                    
                    <div className={styles.faqItem}>
                      <h4>How does the referral program work?</h4>
                      <p>
                        When you refer friends using your unique referral link, they'll receive a $5 bonus when they sign up.
                        You'll earn $10 for each friend who completes their first purchase through our platform.
                      </p>
                    </div>
                    
                    <div className={styles.faqItem}>
                      <h4>Is there a limit to how many friends I can refer?</h4>
                      <p>
                        There's no limit to the number of friends you can refer. The more friends you refer, the more you earn!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className={styles.contactInfo}>
                  <h3>Still Need Help?</h3>
                  <p>
                    If you couldn't find the answer to your question, please submit a support ticket or contact us directly:
                  </p>
                  <div className={styles.contactMethods}>
                    <div className={styles.contactMethod}>
                      <h4>Email</h4>
                      <p>support@cashheros.com</p>
                    </div>
                    <div className={styles.contactMethod}>
                      <h4>Phone</h4>
                      <p>(555) 123-4567</p>
                      <p className={styles.contactHours}>Monday-Friday, 9am-5pm EST</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackSupportPage;