import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaTag, FaMoneyBillWave, FaStore, 
  FaChartLine, FaUserCheck, FaCalendarAlt, FaShoppingCart, 
  FaDollarSign, FaRobot, FaLightbulb, FaChartBar, FaSearch
} from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';

const AIAnalyticsDashboard = ({ analytics }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [predictionType, setPredictionType] = useState('user_growth');
  const [insightType, setInsightType] = useState('anomalies');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
    // This would trigger a refresh of AI insights based on the new time range
    generateAIInsights(e.target.value);
  };

  const handlePredictionTypeChange = (e) => {
    setPredictionType(e.target.value);
    // This would trigger a refresh of AI predictions based on the new type
    generateAIPredictions(e.target.value);
  };

  const handleInsightTypeChange = (e) => {
    setInsightType(e.target.value);
    // This would trigger a refresh of AI insights based on the new type
    generateAIInsights(timeRange, e.target.value);
  };

  // Simulate AI insights generation
  const generateAIInsights = (selectedTimeRange = timeRange, selectedInsightType = insightType) => {
    setAiInsightsLoading(true);
    
    // In a real implementation, this would be an API call to an AI service
    setTimeout(() => {
      // Mock AI insights based on the selected type
      let insights = [];
      
      if (selectedInsightType === 'anomalies') {
        insights = [
          {
            id: 1,
            title: "Unusual Spike in Coupon Redemptions",
            description: "There was a 45% increase in electronics coupon redemptions on Tuesday, significantly above the normal pattern. This correlates with a flash sale at BestBuy.",
            impact: "high",
            category: "coupons",
            timestamp: "2023-11-14T10:30:00Z"
          },
          {
            id: 2,
            title: "Drop in User Engagement",
            description: "User session duration decreased by 22% in the past week. Analysis suggests this may be due to the recent UI changes on the coupon listing page.",
            impact: "medium",
            category: "users",
            timestamp: "2023-11-12T14:15:00Z"
          },
          {
            id: 3,
            title: "Cashback Processing Delay",
            description: "The average time to process cashback requests increased from 2 days to 4.5 days in the last week. This may be affecting user satisfaction scores.",
            impact: "high",
            category: "cashback",
            timestamp: "2023-11-10T09:45:00Z"
          }
        ];
      } else if (selectedInsightType === 'opportunities') {
        insights = [
          {
            id: 1,
            title: "Underserved User Segment",
            description: "Users aged 45-55 show high retention but are underserved with relevant coupons. Consider creating targeted campaigns for this demographic.",
            impact: "medium",
            category: "marketing",
            timestamp: "2023-11-13T11:20:00Z"
          },
          {
            id: 2,
            title: "High-Value Category Growth",
            description: "Home improvement coupons have shown 35% higher conversion rates than average. Consider expanding partnerships with stores in this category.",
            impact: "high",
            category: "partnerships",
            timestamp: "2023-11-11T16:30:00Z"
          },
          {
            id: 3,
            title: "Mobile App Engagement Opportunity",
            description: "Users who install the mobile app have 2.8x higher lifetime value. Only 15% of web users have installed the app - consider a promotion to increase adoption.",
            impact: "high",
            category: "product",
            timestamp: "2023-11-09T13:10:00Z"
          }
        ];
      } else if (selectedInsightType === 'trends') {
        insights = [
          {
            id: 1,
            title: "Rising Category: Sustainable Products",
            description: "Coupons for eco-friendly and sustainable products have seen a 28% increase in usage over the past month, indicating a growing consumer trend.",
            impact: "medium",
            category: "market",
            timestamp: "2023-11-14T08:45:00Z"
          },
          {
            id: 2,
            title: "Seasonal Shift in Shopping Patterns",
            description: "User searches for holiday-related terms have increased 3x in the past two weeks. Consider highlighting seasonal deals on the homepage.",
            impact: "medium",
            category: "seasonal",
            timestamp: "2023-11-12T10:15:00Z"
          },
          {
            id: 3,
            title: "Changing User Demographics",
            description: "The 18-24 age group has grown by 18% this quarter, with different coupon preferences than your traditional user base.",
            impact: "high",
            category: "users",
            timestamp: "2023-11-10T14:30:00Z"
          }
        ];
      }
      
      setAiInsights(insights);
      setAiInsightsLoading(false);
    }, 1500); // Simulate API delay
  };

  // Mock AI prediction data
  const predictionData = {
    user_growth: {
      title: "Predicted User Growth",
      description: "Based on current trends and seasonal patterns",
      data: [
        { period: "Dec 2023", predicted: 12500, lower: 11800, upper: 13200 },
        { period: "Jan 2024", predicted: 13200, lower: 12300, upper: 14100 },
        { period: "Feb 2024", predicted: 14100, lower: 13000, upper: 15200 },
        { period: "Mar 2024", predicted: 15300, lower: 14000, upper: 16600 }
      ]
    },
    coupon_redemption: {
      title: "Predicted Coupon Redemptions",
      description: "Forecast for the next 4 months",
      data: [
        { period: "Dec 2023", predicted: 28500, lower: 26900, upper: 30100 },
        { period: "Jan 2024", predicted: 25200, lower: 23500, upper: 26900 },
        { period: "Feb 2024", predicted: 26800, lower: 24900, upper: 28700 },
        { period: "Mar 2024", predicted: 29400, lower: 27200, upper: 31600 }
      ]
    },
    cashback_volume: {
      title: "Predicted Cashback Volume",
      description: "Estimated cashback to be processed (USD)",
      data: [
        { period: "Dec 2023", predicted: 125000, lower: 115000, upper: 135000 },
        { period: "Jan 2024", predicted: 118000, lower: 108000, upper: 128000 },
        { period: "Feb 2024", predicted: 132000, lower: 120000, upper: 144000 },
        { period: "Mar 2024", predicted: 145000, lower: 132000, upper: 158000 }
      ]
    }
  };

  // Generate AI recommendations for coupons
  const couponRecommendations = [
    {
      id: 1,
      store: "Electronics Mega",
      title: "Create 15% off coupon",
      reason: "High search volume but low conversion rate. Similar stores see 25% higher conversion with 15% discount.",
      expectedImpact: "~18% increase in conversions"
    },
    {
      id: 2,
      store: "Fashion World",
      title: "Extend expiration date",
      reason: "Current coupon expires in 3 days but shows strong performance. Extending would maintain momentum.",
      expectedImpact: "~12% more redemptions"
    },
    {
      id: 3,
      store: "Home Essentials",
      title: "Create BOGO coupon",
      reason: "Buy-one-get-one offers perform 35% better than percentage discounts in this category.",
      expectedImpact: "~30% higher engagement"
    }
  ];

  // Generate AI recommendations for user segments
  const userSegmentRecommendations = [
    {
      id: 1,
      segment: "New Users (0-30 days)",
      title: "Target with cashback offers",
      reason: "First-time cashback users have 40% higher retention rate than coupon-only users.",
      expectedImpact: "~22% improved retention"
    },
    {
      id: 2,
      segment: "Dormant Users (90+ days)",
      title: "Re-engagement campaign",
      reason: "Personalized offers based on past redemptions show 3x better results than generic offers.",
      expectedImpact: "~15% reactivation rate"
    },
    {
      id: 3,
      segment: "High-Value Users",
      title: "Exclusive early access",
      reason: "Top 10% of users respond well to exclusivity and early access to new offers.",
      expectedImpact: "~28% increased activity"
    }
  ];

  // Load AI insights on component mount
  useEffect(() => {
    generateAIInsights();
  }, []);

  if (!analytics) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cardHeader}>
        <h1><FaRobot className={styles.headerIcon} /> AI-Powered Analytics</h1>
        <div className={styles.timeRangeSelector}>
          <label htmlFor="timeRange">Time Range:</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={handleTimeRangeChange}
            className={styles.formControl}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      {/* AI Insights Section */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2><FaLightbulb /> AI Insights</h2>
          <div className={styles.insightTypeSelector}>
            <select
              id="insightType"
              value={insightType}
              onChange={handleInsightTypeChange}
              className={styles.formControl}
            >
              <option value="anomalies">Anomalies & Issues</option>
              <option value="opportunities">Opportunities</option>
              <option value="trends">Emerging Trends</option>
            </select>
          </div>
        </div>
        <div className={styles.cardBody}>
          {aiInsightsLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loader}></div>
              <p>Analyzing data for insights...</p>
            </div>
          ) : (
            <div className={styles.insightsList}>
              {aiInsights && aiInsights.map(insight => (
                <div key={insight.id} className={`${styles.insightCard} ${styles[`impact${insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)}`]}`}>
                  <div className={styles.insightHeader}>
                    <h3>{insight.title}</h3>
                    <span className={styles.insightImpact}>
                      {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                    </span>
                  </div>
                  <p>{insight.description}</p>
                  <div className={styles.insightMeta}>
                    <span className={styles.insightCategory}>{insight.category}</span>
                    <span className={styles.insightDate}>
                      {new Date(insight.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* AI Predictions Section */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2><FaChartLine /> AI Predictions</h2>
          <div className={styles.predictionTypeSelector}>
            <select
              id="predictionType"
              value={predictionType}
              onChange={handlePredictionTypeChange}
              className={styles.formControl}
            >
              <option value="user_growth">User Growth</option>
              <option value="coupon_redemption">Coupon Redemptions</option>
              <option value="cashback_volume">Cashback Volume</option>
            </select>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.predictionHeader}>
            <h3>{predictionData[predictionType].title}</h3>
            <p>{predictionData[predictionType].description}</p>
          </div>
          
          <div className={styles.predictionTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Predicted Value</th>
                  <th>Prediction Range</th>
                </tr>
              </thead>
              <tbody>
                {predictionData[predictionType].data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.period}</td>
                    <td>
                      {predictionType === 'cashback_volume' 
                        ? formatCurrency(item.predicted) 
                        : item.predicted.toLocaleString()}
                    </td>
                    <td>
                      {predictionType === 'cashback_volume' 
                        ? `${formatCurrency(item.lower)} - ${formatCurrency(item.upper)}` 
                        : `${item.lower.toLocaleString()} - ${item.upper.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={styles.predictionChart}>
            {/* In a real implementation, this would be a chart visualization */}
            <div className={styles.mockChart}>
              <div className={styles.mockChartHeader}>Forecast Visualization</div>
              <div className={styles.mockChartBody}>
                {predictionData[predictionType].data.map((item, index) => (
                  <div key={index} className={styles.mockChartBar}>
                    <div className={styles.mockChartLabel}>{item.period}</div>
                    <div 
                      className={styles.mockChartValue} 
                      style={{ 
                        width: `${(item.predicted / (predictionType === 'cashback_volume' ? 200000 : 40000)) * 100}%`,
                        backgroundColor: index === 0 ? '#4CAF50' : '#2196F3'
                      }}
                    >
                      {predictionType === 'cashback_volume' 
                        ? formatCurrency(item.predicted) 
                        : item.predicted.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Recommendations Section */}
      <div className={styles.row}>
        <div className={styles.column}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2><FaTag /> Coupon Recommendations</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.recommendationsList}>
                {couponRecommendations.map(rec => (
                  <div key={rec.id} className={styles.recommendationCard}>
                    <div className={styles.recommendationHeader}>
                      <h3>{rec.title}</h3>
                      <span className={styles.recommendationStore}>{rec.store}</span>
                    </div>
                    <p className={styles.recommendationReason}>{rec.reason}</p>
                    <div className={styles.recommendationImpact}>
                      <strong>Expected Impact:</strong> {rec.expectedImpact}
                    </div>
                    <button className={styles.button}>Implement</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.column}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2><FaUsers /> User Segment Recommendations</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.recommendationsList}>
                {userSegmentRecommendations.map(rec => (
                  <div key={rec.id} className={styles.recommendationCard}>
                    <div className={styles.recommendationHeader}>
                      <h3>{rec.title}</h3>
                      <span className={styles.recommendationSegment}>{rec.segment}</span>
                    </div>
                    <p className={styles.recommendationReason}>{rec.reason}</p>
                    <div className={styles.recommendationImpact}>
                      <strong>Expected Impact:</strong> {rec.expectedImpact}
                    </div>
                    <button className={styles.button}>Create Campaign</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI-Powered Search */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2><FaSearch /> AI-Powered Data Search</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.aiSearchContainer}>
            <div className={styles.aiSearchInputContainer}>
              <input
                type="text"
                placeholder="Ask a question about your data (e.g., 'Which coupons had the highest conversion last week?')"
                className={styles.aiSearchInput}
              />
              <button className={styles.button}>
                <FaSearch /> Search
              </button>
            </div>
            <div className={styles.aiSearchExamples}>
              <p>Example questions:</p>
              <ul>
                <li>"What's causing the drop in user engagement this month?"</li>
                <li>"Which user segments have the highest lifetime value?"</li>
                <li>"Compare performance of electronics vs. fashion coupons"</li>
                <li>"Predict cashback volume for December based on current trends"</li>
              </ul>
            </div>
            <div className={styles.aiSearchResults}>
              <p className={styles.aiSearchPlaceholder}>
                Ask a question to see AI-generated insights from your data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyticsDashboard;