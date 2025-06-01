// src/pages/CashbackDashboardPage/CashbackDashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CashbackDashboardPage.module.css';

export const CashbackDashboardPage = () => {
  const { user, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [cashbackData, setCashbackData] = useState({
    balance: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    pendingCashbacks: [],
    approvedCashbacks: [],
    redeemedCashbacks: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemMethod, setRedeemMethod] = useState('paypal');
  const [redeemDetails, setRedeemDetails] = useState('');
  const [redeemErrors, setRedeemErrors] = useState({});
  const [redeemSuccess, setRedeemSuccess] = useState('');

  // Fetch cashback data when component mounts
  useEffect(() => {
    const fetchCashbackData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/cashback/dashboard', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        setCashbackData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching cashback data:', err);
        setError('Failed to load your cashback data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCashbackData();
  }, [user, accessToken]);

  // Handle redeem form submission
  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    setRedeemErrors({});
    setRedeemSuccess('');
    
    // Validate form
    const errors = {};
    const amountValue = parseFloat(redeemAmount);
    
    if (!redeemAmount || isNaN(amountValue)) {
      errors.amount = 'Please enter a valid amount';
    } else if (amountValue < 10) {
      errors.amount = 'Minimum redemption amount is $10';
    } else if (amountValue > cashbackData.balance) {
      errors.amount = 'Amount exceeds your available balance';
    }
    
    if (!redeemMethod) {
      errors.method = 'Please select a redemption method';
    }
    
    if (!redeemDetails) {
      errors.details = 'Please enter your payment details';
    }
    
    if (Object.keys(errors).length > 0) {
      setRedeemErrors(errors);
      return;
    }
    
    // Submit redemption request
    try {
      const response = await axios.post('http://localhost:5000/api/cashback/redeem', {
        amount: amountValue,
        method: redeemMethod,
        details: redeemDetails
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      // Update local state with new balance
      setCashbackData(prev => ({
        ...prev,
        balance: prev.balance - amountValue,
        totalRedeemed: prev.totalRedeemed + amountValue,
        redeemedCashbacks: [response.data.redemption, ...prev.redeemedCashbacks],
        recentActivity: [
          {
            type: 'redemption',
            amount: amountValue,
            date: new Date(),
            status: 'processing',
            method: redeemMethod
          },
          ...prev.recentActivity
        ]
      }));
      
      // Reset form
      setRedeemAmount('');
      setRedeemDetails('');
      setRedeemSuccess('Your redemption request has been submitted successfully!');
    } catch (err) {
      console.error('Error submitting redemption:', err);
      setRedeemErrors({
        submit: err.response?.data?.message || 'Failed to process your redemption request. Please try again.'
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login', { state: { from: '/cashback-dashboard' } });
    return null;
  }

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.dashboardContainer}>
        <h1>Cashback Dashboard</h1>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Loading your cashback data...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <>
            <div className={styles.balanceSummary}>
              <div className={styles.balanceCard}>
                <h3>Available Balance</h3>
                <div className={styles.balanceAmount}>${cashbackData.balance.toFixed(2)}</div>
                <button 
                  className={styles.redeemButton}
                  onClick={() => setActiveTab('redeem')}
                  disabled={cashbackData.balance < 10}
                >
                  {cashbackData.balance < 10 ? 'Minimum $10 to Redeem' : 'Redeem Now'}
                </button>
              </div>
              
              <div className={styles.statsCards}>
                <div className={styles.statCard}>
                  <h4>Total Earned</h4>
                  <div className={styles.statAmount}>${cashbackData.totalEarned.toFixed(2)}</div>
                </div>
                <div className={styles.statCard}>
                  <h4>Total Redeemed</h4>
                  <div className={styles.statAmount}>${cashbackData.totalRedeemed.toFixed(2)}</div>
                </div>
                <div className={styles.statCard}>
                  <h4>Pending Cashback</h4>
                  <div className={styles.statAmount}>
                    ${cashbackData.pendingCashbacks.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.tabs}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'pending' ? styles.active : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'approved' ? styles.active : ''}`}
                onClick={() => setActiveTab('approved')}
              >
                Approved
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'redeemed' ? styles.active : ''}`}
                onClick={() => setActiveTab('redeemed')}
              >
                Redeemed
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'redeem' ? styles.active : ''}`}
                onClick={() => setActiveTab('redeem')}
              >
                Redeem
              </button>
            </div>
            
            {activeTab === 'overview' && (
              <div className={styles.overviewTab}>
                <h2>Recent Activity</h2>
                
                {cashbackData.recentActivity.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No recent cashback activity to display.</p>
                    <button 
                      className={styles.browseButton}
                      onClick={() => navigate('/cashback')}
                    >
                      Browse Cashback Offers
                    </button>
                  </div>
                ) : (
                  <div className={styles.activityList}>
                    {cashbackData.recentActivity.map((activity, index) => (
                      <div key={index} className={styles.activityItem}>
                        <div className={styles.activityIcon}>
                          {activity.type === 'earned' ? '💰' : activity.type === 'redemption' ? '💸' : '📊'}
                        </div>
                        <div className={styles.activityDetails}>
                          <div className={styles.activityHeader}>
                            <h4>
                              {activity.type === 'earned' 
                                ? `Earned from ${activity.store}` 
                                : activity.type === 'redemption'
                                  ? `Redemption via ${activity.method}`
                                  : 'Status Update'}
                            </h4>
                            <span className={styles.activityDate}>
                              {formatDate(activity.date)}
                            </span>
                          </div>
                          <div className={styles.activityBody}>
                            <span className={`${styles.activityStatus} ${styles[activity.status]}`}>
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                            <span className={styles.activityAmount}>
                              {activity.type === 'earned' ? '+' : '-'}${activity.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={styles.cashbackTips}>
                  <h3>Tips to Maximize Your Cashback</h3>
                  <ul>
                    <li>Always activate cashback before shopping</li>
                    <li>Check for increased cashback rates during special promotions</li>
                    <li>Combine cashback with coupon codes when possible</li>
                    <li>Refer friends to earn bonus cashback</li>
                    <li>Set up browser extensions to never miss a cashback opportunity</li>
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'pending' && (
              <div className={styles.pendingTab}>
                <h2>Pending Cashback</h2>
                
                {cashbackData.pendingCashbacks.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No pending cashback transactions.</p>
                    <button 
                      className={styles.browseButton}
                      onClick={() => navigate('/cashback')}
                    >
                      Browse Cashback Offers
                    </button>
                  </div>
                ) : (
                  <div className={styles.cashbackTable}>
                    <div className={styles.tableHeader}>
                      <div className={styles.tableCell}>Store</div>
                      <div className={styles.tableCell}>Order Date</div>
                      <div className={styles.tableCell}>Amount</div>
                      <div className={styles.tableCell}>Status</div>
                      <div className={styles.tableCell}>Expected Approval</div>
                    </div>
                    
                    {cashbackData.pendingCashbacks.map((cashback, index) => (
                      <div key={index} className={styles.tableRow}>
                        <div className={styles.tableCell}>
                          <div className={styles.storeInfo}>
                            <img src={cashback.storeLogo} alt={cashback.storeName} className={styles.storeIcon} />
                            <span>{cashback.storeName}</span>
                          </div>
                        </div>
                        <div className={styles.tableCell}>{formatDate(cashback.orderDate)}</div>
                        <div className={styles.tableCell}>${cashback.amount.toFixed(2)}</div>
                        <div className={styles.tableCell}>
                          <span className={`${styles.statusBadge} ${styles.pending}`}>Pending</span>
                        </div>
                        <div className={styles.tableCell}>{formatDate(cashback.expectedApprovalDate)}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={styles.pendingInfo}>
                  <h4>About Pending Cashback</h4>
                  <p>
                    Cashback typically remains in "pending" status for 30-90 days. This waiting period allows stores to 
                    confirm that purchases are not returned and meet all cashback requirements. Once approved, the cashback 
                    amount will be added to your available balance.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'approved' && (
              <div className={styles.approvedTab}>
                <h2>Approved Cashback</h2>
                
                {cashbackData.approvedCashbacks.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No approved cashback transactions yet.</p>
                  </div>
                ) : (
                  <div className={styles.cashbackTable}>
                    <div className={styles.tableHeader}>
                      <div className={styles.tableCell}>Store</div>
                      <div className={styles.tableCell}>Order Date</div>
                      <div className={styles.tableCell}>Approval Date</div>
                      <div className={styles.tableCell}>Amount</div>
                      <div className={styles.tableCell}>Status</div>
                    </div>
                    
                    {cashbackData.approvedCashbacks.map((cashback, index) => (
                      <div key={index} className={styles.tableRow}>
                        <div className={styles.tableCell}>
                          <div className={styles.storeInfo}>
                            <img src={cashback.storeLogo} alt={cashback.storeName} className={styles.storeIcon} />
                            <span>{cashback.storeName}</span>
                          </div>
                        </div>
                        <div className={styles.tableCell}>{formatDate(cashback.orderDate)}</div>
                        <div className={styles.tableCell}>{formatDate(cashback.approvalDate)}</div>
                        <div className={styles.tableCell}>${cashback.amount.toFixed(2)}</div>
                        <div className={styles.tableCell}>
                          <span className={`${styles.statusBadge} ${styles.approved}`}>Approved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'redeemed' && (
              <div className={styles.redeemedTab}>
                <h2>Redemption History</h2>
                
                {cashbackData.redeemedCashbacks.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>You haven't redeemed any cashback yet.</p>
                    {cashbackData.balance >= 10 && (
                      <button 
                        className={styles.browseButton}
                        onClick={() => setActiveTab('redeem')}
                      >
                        Redeem Now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.cashbackTable}>
                    <div className={styles.tableHeader}>
                      <div className={styles.tableCell}>Date</div>
                      <div className={styles.tableCell}>Amount</div>
                      <div className={styles.tableCell}>Method</div>
                      <div className={styles.tableCell}>Status</div>
                      <div className={styles.tableCell}>Reference</div>
                    </div>
                    
                    {cashbackData.redeemedCashbacks.map((redemption, index) => (
                      <div key={index} className={styles.tableRow}>
                        <div className={styles.tableCell}>{formatDate(redemption.date)}</div>
                        <div className={styles.tableCell}>${redemption.amount.toFixed(2)}</div>
                        <div className={styles.tableCell}>{redemption.method}</div>
                        <div className={styles.tableCell}>
                          <span className={`${styles.statusBadge} ${styles[redemption.status]}`}>
                            {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                          </span>
                        </div>
                        <div className={styles.tableCell}>{redemption.reference || '-'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'redeem' && (
              <div className={styles.redeemTab}>
                <h2>Redeem Your Cashback</h2>
                
                {cashbackData.balance < 10 ? (
                  <div className={styles.minimumBalanceWarning}>
                    <p>
                      You need a minimum balance of $10.00 to redeem your cashback.
                      Your current balance is ${cashbackData.balance.toFixed(2)}.
                    </p>
                    <button 
                      className={styles.browseButton}
                      onClick={() => navigate('/cashback')}
                    >
                      Earn More Cashback
                    </button>
                  </div>
                ) : (
                  <>
                    {redeemSuccess && (
                      <div className={styles.successMessage}>{redeemSuccess}</div>
                    )}
                    
                    {redeemErrors.submit && (
                      <div className={styles.errorMessage}>{redeemErrors.submit}</div>
                    )}
                    
                    <form onSubmit={handleRedeemSubmit} className={styles.redeemForm}>
                      <div className={styles.availableBalance}>
                        Available Balance: <span>${cashbackData.balance.toFixed(2)}</span>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="redeemAmount">Amount to Redeem ($)</label>
                        <input
                          type="number"
                          id="redeemAmount"
                          value={redeemAmount}
                          onChange={(e) => setRedeemAmount(e.target.value)}
                          min="10"
                          max={cashbackData.balance}
                          step="0.01"
                          className={redeemErrors.amount ? styles.inputError : ''}
                        />
                        {redeemErrors.amount && <span className={styles.errorText}>{redeemErrors.amount}</span>}
                        <span className={styles.helperText}>Minimum redemption amount: $10.00</span>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Redemption Method</label>
                        <div className={styles.redeemMethods}>
                          <label className={styles.methodOption}>
                            <input
                              type="radio"
                              name="redeemMethod"
                              value="paypal"
                              checked={redeemMethod === 'paypal'}
                              onChange={() => setRedeemMethod('paypal')}
                            />
                            <span className={styles.methodLabel}>PayPal</span>
                          </label>
                          
                          <label className={styles.methodOption}>
                            <input
                              type="radio"
                              name="redeemMethod"
                              value="bankTransfer"
                              checked={redeemMethod === 'bankTransfer'}
                              onChange={() => setRedeemMethod('bankTransfer')}
                            />
                            <span className={styles.methodLabel}>Bank Transfer</span>
                          </label>
                          
                          <label className={styles.methodOption}>
                            <input
                              type="radio"
                              name="redeemMethod"
                              value="giftCard"
                              checked={redeemMethod === 'giftCard'}
                              onChange={() => setRedeemMethod('giftCard')}
                            />
                            <span className={styles.methodLabel}>Gift Card</span>
                          </label>
                        </div>
                        {redeemErrors.method && <span className={styles.errorText}>{redeemErrors.method}</span>}
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="redeemDetails">
                          {redeemMethod === 'paypal' ? 'PayPal Email' : 
                           redeemMethod === 'bankTransfer' ? 'Bank Account Details' :
                           'Gift Card Email'}
                        </label>
                        <textarea
                          id="redeemDetails"
                          value={redeemDetails}
                          onChange={(e) => setRedeemDetails(e.target.value)}
                          className={redeemErrors.details ? styles.inputError : ''}
                          rows="3"
                          placeholder={
                            redeemMethod === 'paypal' ? 'Enter your PayPal email address' : 
                            redeemMethod === 'bankTransfer' ? 'Enter your bank name, account number, and routing number' :
                            'Enter your email address for gift card delivery'
                          }
                        ></textarea>
                        {redeemErrors.details && <span className={styles.errorText}>{redeemErrors.details}</span>}
                      </div>
                      
                      <div className={styles.redeemTerms}>
                        <p>
                          By submitting this request, you agree to our redemption terms and conditions. 
                          Redemption requests are typically processed within 1-3 business days.
                        </p>
                      </div>
                      
                      <button type="submit" className={styles.submitButton}>
                        Submit Redemption Request
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CashbackDashboardPage;