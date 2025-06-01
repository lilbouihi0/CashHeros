import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots, FaSpinner } from 'react-icons/fa';
import styles from './AIChatbot.module.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm your CashHeros AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Suggested questions for the user
  const suggestedQuestions = [
    "Find me the best electronics coupons",
    "How does cashback work?",
    "Which stores have the highest cashback?",
    "Show me trending deals today"
  ];

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (would be replaced with actual API call)
    setTimeout(() => {
      generateAIResponse(inputValue);
    }, 1000);
  };

  const handleSuggestedQuestion = (question) => {
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: question,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response (would be replaced with actual API call)
    setTimeout(() => {
      generateAIResponse(question);
    }, 1000);
  };

  // Mock AI response generation - in a real app, this would call an AI API
  const generateAIResponse = (userInput) => {
    let botResponse = '';
    const lowerInput = userInput.toLowerCase();

    // Simple pattern matching for demo purposes
    if (lowerInput.includes('electronics') || lowerInput.includes('tech')) {
      botResponse = "I found several great electronics coupons! Best Buy has 15% off laptops, and Amazon has a $50 discount on tablets. Would you like me to show you more specific electronics deals?";
    } else if (lowerInput.includes('cashback')) {
      if (lowerInput.includes('work') || lowerInput.includes('how')) {
        botResponse = "Cashback works by giving you a percentage of your purchase amount back as a reward. When you shop through CashHeros, we earn a commission from the store and share part of it with you. Once your cashback is confirmed (usually 30-90 days after purchase), you can withdraw it to your preferred payment method.";
      } else if (lowerInput.includes('highest') || lowerInput.includes('best')) {
        botResponse = "Currently, these stores offer the highest cashback rates: \n• Luxury Beauty: 8% cashback \n• Fashion World: 7.5% cashback \n• Home Essentials: 6% cashback \n\nWould you like to browse these stores?";
      } else {
        botResponse = "Our cashback program lets you earn money back on your purchases. What specific aspect of cashback would you like to know about?";
      }
    } else if (lowerInput.includes('trending') || lowerInput.includes('popular') || lowerInput.includes('today')) {
      botResponse = "Today's trending deals include: \n• 20% off at Fashion World (used 230 times today) \n• Buy One Get One Free at Healthy Foods (trending in Food category) \n• $30 off $100 at Home Essentials (limited time offer) \n\nWould you like details on any of these?";
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      botResponse = "Hello! I'm your CashHeros AI assistant. I can help you find the best coupons, explain how cashback works, or answer questions about your account. What would you like help with today?";
    } else if (lowerInput.includes('thank')) {
      botResponse = "You're welcome! If you need anything else, just ask. Happy saving!";
    } else {
      botResponse = "I'm not sure I understand. Would you like me to help you find coupons, explain cashback, or provide information about specific stores?";
    }

    // Add bot response
    const botMessage = {
      id: messages.length + 2,
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Chat toggle button */}
      <button 
        className={styles.chatToggle}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
      >
        {isOpen ? <FaTimes /> : <FaCommentDots />}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <FaRobot className={styles.botIcon} />
            <h3>CashHeros Assistant</h3>
            <button 
              className={styles.closeButton}
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className={styles.chatMessages}>
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`${styles.message} ${message.sender === 'bot' ? styles.botMessage : styles.userMessage}`}
              >
                <div className={styles.messageContent}>
                  {message.text.split('\n').map((text, i) => (
                    <p key={i}>{text}</p>
                  ))}
                </div>
                <div className={styles.messageTime}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.typingIndicator}>
                  <FaSpinner className={styles.spinnerIcon} />
                  <span>AI is typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggested questions */}
          {messages.length < 3 && (
            <div className={styles.suggestedQuestions}>
              <p>Try asking:</p>
              <div className={styles.questionButtons}>
                {suggestedQuestions.map((question, index) => (
                  <button 
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className={styles.questionButton}
                    disabled={isTyping}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <form className={styles.chatInput} onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={isTyping}
              ref={inputRef}
            />
            <button 
              type="submit" 
              disabled={inputValue.trim() === '' || isTyping}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;