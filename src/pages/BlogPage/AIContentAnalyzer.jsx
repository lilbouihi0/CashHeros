import React, { useState, useEffect } from 'react';
import { FaRobot, FaChartBar, FaRegClock, FaRegLightbulb, FaRegChartBar } from 'react-icons/fa';
import styles from './AIContentAnalyzer.module.css';

const AIContentAnalyzer = ({ content, title }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (content) {
      analyzeContent();
    }
  }, [content, title]);

  const analyzeContent = async () => {
    setLoading(true);
    
    // In a real implementation, this would call an AI service
    // For demo purposes, we'll simulate the API call with a timeout
    setTimeout(() => {
      // Generate mock analysis
      const mockAnalysis = generateMockAnalysis(content, title);
      setAnalysis(mockAnalysis);
      setLoading(false);
    }, 1000);
  };

  const generateMockAnalysis = (text, articleTitle) => {
    // In a real implementation, this would use NLP to analyze the content
    // For demo purposes, we'll generate mock data
    
    // Calculate reading time (average reading speed: 200 words per minute)
    const wordCount = text.split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    
    // Generate key points (in a real implementation, these would be extracted from the content)
    const keyPoints = [
      "Using coupons strategically can save up to 30% on regular purchases",
      "Combining cashback with promotional offers maximizes savings",
      "Seasonal shopping can lead to significant discounts on various products"
    ];
    
    // Generate related topics
    const relatedTopics = [
      "Cashback Maximization",
      "Coupon Stacking Strategies",
      "Seasonal Shopping Guide",
      "Budget Planning"
    ];
    
    // Generate sentiment analysis
    const sentiment = {
      score: 0.78, // 0 to 1, where 1 is very positive
      label: "Positive"
    };
    
    // Generate readability score (Flesch-Kincaid scale: 0-100)
    // Higher scores indicate easier readability
    const readabilityScore = 65 + Math.floor(Math.random() * 15);
    let readabilityLabel;
    
    if (readabilityScore >= 80) {
      readabilityLabel = "Very Easy";
    } else if (readabilityScore >= 70) {
      readabilityLabel = "Easy";
    } else if (readabilityScore >= 60) {
      readabilityLabel = "Standard";
    } else if (readabilityScore >= 50) {
      readabilityLabel = "Fairly Difficult";
    } else {
      readabilityLabel = "Difficult";
    }
    
    return {
      readingTime: readingTimeMinutes,
      keyPoints,
      relatedTopics,
      sentiment,
      readability: {
        score: readabilityScore,
        label: readabilityLabel
      }
    };
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className={styles.aiAnalyzer}>
      <div 
        className={styles.header}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={styles.headerContent}>
          <FaRobot className={styles.icon} />
          <div className={styles.readingTime}>
            <FaRegClock className={styles.timeIcon} />
            <span>{analysis.readingTime} min read</span>
          </div>
          <div className={styles.readabilityBadge}>
            <span>Readability: {analysis.readability.label}</span>
          </div>
        </div>
        <button className={styles.expandButton}>
          {expanded ? 'Hide Analysis' : 'Show Analysis'}
        </button>
      </div>
      
      {expanded && (
        <div className={styles.analysisContent}>
          <div className={styles.section}>
            <h4><FaRegLightbulb /> Key Points</h4>
            <ul className={styles.keyPoints}>
              {analysis.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          
          <div className={styles.section}>
            <h4><FaRegChartBar /> Content Analysis</h4>
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Sentiment</span>
                <div className={styles.sentimentMeter}>
                  <div 
                    className={styles.sentimentFill}
                    style={{ width: `${analysis.sentiment.score * 100}%` }}
                  ></div>
                </div>
                <span className={styles.metricValue}>{analysis.sentiment.label}</span>
              </div>
              
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Readability</span>
                <div className={styles.readabilityMeter}>
                  <div 
                    className={styles.readabilityFill}
                    style={{ width: `${analysis.readability.score}%` }}
                  ></div>
                </div>
                <span className={styles.metricValue}>{analysis.readability.label}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.section}>
            <h4>Related Topics</h4>
            <div className={styles.relatedTopics}>
              {analysis.relatedTopics.map((topic, index) => (
                <span key={index} className={styles.topicTag}>{topic}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIContentAnalyzer;