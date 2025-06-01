// src/pages/ReferralPage/ReferralPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ReferralPage.module.css';

export const ReferralPage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referralLink: '',
    referralCount: 0,
    pendingReferrals: [],
    completedReferrals: [],
    totalEarned: 0,
    bonusPerReferral: 10
  });
  
  const [emailList, setEmailList] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch referral data when component mounts
  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/users/referrals', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        setReferralData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching referral data:', err);
        setError('Failed to load your referral data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferralData();
  }, [user, accessToken]);

  // Handle copy referral link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralData.referralLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Handle email list change
  const handleEmailListChange = (e) => {
    setEmailList(e.target.value);
    setEmailError('');
  };

  // Validate email list
  const validateEmails = (emails) => {
    const emailArray = emails.split(',').map(email => email.trim()).filter(email => email !== '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const invalidEmails = emailArray.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      return {
        valid: false,
        message: `Invalid email(s): ${invalidEmails.join(', ')}`
      };
    }
    
    return {
      valid: true,
      emails: emailArray
    };
  };

  // Handle send invites
  const handleSendInvites = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setEmailError('');
    
    if (!emailList.trim()) {
      setEmailError('Please enter at least one email address');
      return;
    }
    
    const validation = validateEmails(emailList);
    
    if (!validation.valid) {
      setEmailError(validation.message);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/users/send-referrals', {
        emails: validation.emails
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      setSuccessMessage(`Invitations sent successfully to ${validation.emails.length} email(s)!`);
      setEmailList('');
    } catch (err) {
      console.error('Error sending referrals:', err);
      setEmailError(err.response?.data?.message || 'Failed to send invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Share on social media
  const shareOnSocialMedia = (platform) => {
    let shareUrl = '';
    const text = `Join me on CashHeros and get $10 bonus! Use my referral code: ${referralData.referralCode}`;
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralData.referralLink)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralData.referralLink)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralData.referralLink)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralData.referralLink)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login', { state: { from: '/referrals' } });
    return null;
  }

  return (
    <div className={styles.referralPage}>
      <div className={styles.referralContainer}>
        <h1>Refer Friends & Earn</h1>
        
        {loading && !successMessage && !error ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Loading your referral data...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <>
            <div className={styles.referralStats}>
              <div className={styles.statCard}>
                <h3>Total Referrals</h3>
                <div className={styles.statValue}>{referralData.referralCount}</div>
              </div>
              
              <div className={styles.statCard}>
                <h3>Pending Referrals</h3>
                <div className={styles.statValue}>{referralData.pendingReferrals.length}</div>
              </div>
              
              <div className={styles.statCard}>
                <h3>Completed Referrals</h3>
                <div className={styles.statValue}>{referralData.completedReferrals.length}</div>
              </div>
              
              <div className={styles.statCard}>
                <h3>Total Earned</h3>
                <div className={styles.statValue}>${referralData.totalEarned.toFixed(2)}</div>
              </div>
            </div>
            
            <div className={styles.referralInfo}>
              <h2>How It Works</h2>
              <div className={styles.referralSteps}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <h4>Share Your Link</h4>
                  <p>Share your unique referral link with friends via email, social media, or text.</p>
                </div>
                
                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <h4>Friends Sign Up</h4>
                  <p>When your friends sign up using your link, they'll get a $5 bonus.</p>
                </div>
                
                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <h4>You Earn Rewards</h4>
                  <p>You'll earn ${referralData.bonusPerReferral.toFixed(2)} for each friend who completes their first purchase.</p>
                </div>
              </div>
            </div>
            
            <div className={styles.referralLinkSection}>
              <h2>Your Referral Link</h2>
              <div className={styles.linkContainer}>
                <input
                  type="text"
                  value={referralData.referralLink}
                  readOnly
                  className={styles.linkInput}
                />
                <button 
                  className={styles.copyButton}
                  onClick={handleCopyLink}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              <div className={styles.referralCode}>
                <span>Referral Code: </span>
                <strong>{referralData.referralCode}</strong>
              </div>
            </div>
            
            <div className={styles.shareSection}>
              <h2>Share with Friends</h2>
              
              <div className={styles.socialButtons}>
                <button 
                  className={`${styles.socialButton} ${styles.facebook}`}
                  onClick={() => shareOnSocialMedia('facebook')}
                >
                  Facebook
                </button>
                
                <button 
                  className={`${styles.socialButton} ${styles.twitter}`}
                  onClick={() => shareOnSocialMedia('twitter')}
                >
                  Twitter
                </button>
                
                <button 
                  className={`${styles.socialButton} ${styles.linkedin}`}
                  onClick={() => shareOnSocialMedia('linkedin')}
                >
                  LinkedIn
                </button>
                
                <button 
                  className={`${styles.socialButton} ${styles.whatsapp}`}
                  onClick={() => shareOnSocialMedia('whatsapp')}
                >
                  WhatsApp
                </button>
              </div>
              
              <div className={styles.emailInviteSection}>
                <h3>Invite via Email</h3>
                
                {successMessage && (
                  <div className={styles.successMessage}>{successMessage}</div>
                )}
                
                <form onSubmit={handleSendInvites} className={styles.emailForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="emailList">Enter email addresses (comma separated)</label>
                    <textarea
                      id="emailList"
                      value={emailList}
                      onChange={handleEmailListChange}
                      placeholder="friend@example.com, colleague@example.com"
                      rows="3"
                      className={emailError ? styles.inputError : ''}
                    ></textarea>
                    {emailError && <span className={styles.errorText}>{emailError}</span>}
                  </div>
                  
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Invites'}
                  </button>
                </form>
              </div>
            </div>
            
            <div className={styles.referralHistory}>
              <h2>Referral History</h2>
              
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tabButton} ${styles.active}`}
                  onClick={() => {}}
                >
                  All Referrals ({referralData.pendingReferrals.length + referralData.completedReferrals.length})
                </button>
              </div>
              
              {referralData.pendingReferrals.length === 0 && referralData.completedReferrals.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>You haven't referred anyone yet. Share your referral link to start earning!</p>
                </div>
              ) : (
                <div className={styles.referralTable}>
                  <div className={styles.tableHeader}>
                    <div className={styles.tableCell}>Name</div>
                    <div className={styles.tableCell}>Email</div>
                    <div className={styles.tableCell}>Date</div>
                    <div className={styles.tableCell}>Status</div>
                    <div className={styles.tableCell}>Reward</div>
                  </div>
                  
                  {[...referralData.completedReferrals, ...referralData.pendingReferrals].map((referral, index) => (
                    <div key={index} className={styles.tableRow}>
                      <div className={styles.tableCell}>{referral.name || 'Invited User'}</div>
                      <div className={styles.tableCell}>{referral.email}</div>
                      <div className={styles.tableCell}>{formatDate(referral.date)}</div>
                      <div className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${styles[referral.status]}`}>
                          {referral.status === 'pending' ? 'Pending' : 'Completed'}
                        </span>
                      </div>
                      <div className={styles.tableCell}>
                        {referral.status === 'completed' 
                          ? `$${referralData.bonusPerReferral.toFixed(2)}` 
                          : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className={styles.termsSection}>
              <h3>Referral Program Terms</h3>
              <ul>
                <li>Referral bonuses are paid when your referred friend completes their first purchase.</li>
                <li>Both you and your friend must have active accounts to receive bonuses.</li>
                <li>Referral rewards will be added to your cashback balance.</li>
                <li>We reserve the right to modify or terminate the referral program at any time.</li>
                <li>Abuse of the referral program, including self-referrals, may result in disqualification.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReferralPage;