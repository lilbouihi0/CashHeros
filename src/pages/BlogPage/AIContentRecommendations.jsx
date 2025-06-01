import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaThumbsUp, FaThumbsDown, FaSpinner } from 'react-icons/fa';
import styles from './AIContentRecommendations.module.css';

const AIContentRecommendations = ({ posts, userInterests }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (posts && posts.length > 0) {
      generateRecommendations();
    }
  }, [posts, userInterests]);

  const generateRecommendations = async () => {
    setLoading(true);
    
    // In a real implementation, this would call an AI service
    // For demo purposes, we'll simulate the API call with a timeout
    setTimeout(() => {
      // Generate personalized recommendations based on user interests and available posts
      const personalizedRecommendations = generateMockRecommendations(posts, userInterests);
      setRecommendations(personalizedRecommendations);
      setLoading(false);
    }, 1500);
  };

  const generateMockRecommendations = (availablePosts, interests) => {
    // In a real implementation, this would use a sophisticated algorithm
    // For demo purposes, we'll just select a few posts and add explanations
    
    // Ensure we have posts to work with
    if (!availablePosts || availablePosts.length === 0) {
      return [];
    }
    
    // Select up to 3 posts for recommendations
    const selectedPosts = [];
    const usedIndices = new Set();
    
    // Try to find posts that match user interests
    if (interests && interests.length > 0) {
      // First pass: look for direct category matches
      for (const interest of interests) {
        if (selectedPosts.length >= 3) break;
        
        for (let i = 0; i < availablePosts.length; i++) {
          if (usedIndices.has(i)) continue;
          
          const post = availablePosts[i];
          const postCategory = post.category ? post.category.toLowerCase() : '';
          
          if (postCategory.includes(interest.toLowerCase())) {
            selectedPosts.push({
              ...post,
              reason: `Based on your interest in ${interest}`,
              confidence: 0.85 + (Math.random() * 0.1)
            });
            usedIndices.add(i);
            break;
          }
        }
      }
    }
    
    // Second pass: add random posts if we don't have enough
    while (selectedPosts.length < 3 && selectedPosts.length < availablePosts.length) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * availablePosts.length);
      } while (usedIndices.has(randomIndex));
      
      usedIndices.add(randomIndex);
      const randomPost = availablePosts[randomIndex];
      
      selectedPosts.push({
        ...randomPost,
        reason: getRandomReason(),
        confidence: 0.65 + (Math.random() * 0.2)
      });
    }
    
    return selectedPosts;
  };

  const getRandomReason = () => {
    const reasons = [
      "Popular with readers like you",
      "Trending in our community",
      "Based on your recent reading activity",
      "Matches your browsing patterns",
      "Recommended for savvy shoppers"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  const handleFeedback = (id, isPositive) => {
    // Prevent multiple feedback on the same recommendation
    if (feedback[id]) return;
    
    // In a real implementation, this would send feedback to the AI service
    // For demo purposes, we'll just update the local state
    setFeedback(prev => ({
      ...prev,
      [id]: isPositive
    }));
    
    // Show a brief "thank you" message
    const element = document.getElementById(`recommendation-${id}`);
    if (element) {
      const feedbackElement = element.querySelector(`.${styles.feedbackMessage}`);
      if (feedbackElement) {
        feedbackElement.textContent = "Thanks for your feedback!";
        feedbackElement.style.opacity = "1";
        
        setTimeout(() => {
          feedbackElement.style.opacity = "0";
        }, 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.aiRecommendations}>
        <div className={styles.header}>
          <FaRobot className={styles.icon} />
          <h3>Personalized Recommendations</h3>
        </div>
        <div className={styles.loading}>
          <FaSpinner className={styles.spinner} />
          <p>Analyzing your interests...</p>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className={styles.aiRecommendations}>
      <div className={styles.header}>
        <FaRobot className={styles.icon} />
        <h3>Personalized For You</h3>
        <button 
          className={styles.infoButton}
          onClick={() => setShowExplanation(!showExplanation)}
          aria-label="Learn how recommendations work"
        >
          <FaLightbulb />
        </button>
      </div>
      
      {showExplanation && (
        <div className={styles.explanation}>
          <p>
            Our AI analyzes your reading history and interests to recommend content 
            you might enjoy. Your feedback helps improve future recommendations.
          </p>
        </div>
      )}
      
      <div className={styles.recommendationsList}>
        {recommendations.map(post => {
          const postId = post.id || post._id || Math.random().toString(36).substring(2, 9);
          const confidencePercent = Math.round(post.confidence * 100);
          
          return (
            <div 
              key={postId} 
              id={`recommendation-${postId}`}
              className={styles.recommendationCard}
            >
              <div className={styles.recommendationImage}>
                <img 
                  src={post.image || 'https://placehold.co/100x100?text=Blog'} 
                  alt={post.title} 
                />
                <div className={styles.confidenceBadge}>
                  {confidencePercent}% match
                </div>
              </div>
              
              <div className={styles.recommendationContent}>
                <h4>{post.title}</h4>
                <p className={styles.reason}>
                  <FaLightbulb className={styles.reasonIcon} />
                  {post.reason}
                </p>
                
                <div className={styles.feedbackControls}>
                  <button 
                    className={`${styles.feedbackButton} ${feedback[postId] === true ? styles.active : ''}`}
                    onClick={() => handleFeedback(postId, true)}
                    disabled={feedback[postId] !== undefined}
                    aria-label="This recommendation is helpful"
                  >
                    <FaThumbsUp />
                  </button>
                  <button 
                    className={`${styles.feedbackButton} ${feedback[postId] === false ? styles.active : ''}`}
                    onClick={() => handleFeedback(postId, false)}
                    disabled={feedback[postId] !== undefined}
                    aria-label="This recommendation is not helpful"
                  >
                    <FaThumbsDown />
                  </button>
                  <span className={styles.feedbackMessage}></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIContentRecommendations;