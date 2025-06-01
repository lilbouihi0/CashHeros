// src/pages/FAQPage/FAQPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaChevronDown, 
  FaChevronUp, 
  FaShoppingBag, 
  FaMoneyBillWave, 
  FaUserAlt, 
  FaQuestionCircle, 
  FaHeadset,
  FaEnvelope,
  FaCommentDots
} from 'react-icons/fa';
import styles from './FAQPage.module.css';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  
  // FAQ categories
  const categories = [
    { id: 'all', name: 'All FAQs', icon: <FaQuestionCircle /> },
    { id: 'general', name: 'General', icon: <FaQuestionCircle /> },
    { id: 'cashback', name: 'Cash Back', icon: <FaMoneyBillWave /> },
    { id: 'shopping', name: 'Shopping', icon: <FaShoppingBag /> },
    { id: 'account', name: 'Account', icon: <FaUserAlt /> },
  ];
  
  // FAQ data
  const faqs = [
    {
      id: 1,
      question: 'What is CashHeros?',
      answer: 'CashHeros is a cash back and coupon website that helps you save money when shopping online. We partner with thousands of stores to offer you cash back on your purchases, as well as exclusive coupons and deals.',
      category: 'general'
    },
    {
      id: 2,
      question: 'How does cash back work?',
      answer: 'When you click through CashHeros to shop at a partner store, we earn a commission on your purchase. We share this commission with you as cash back. The cash back will appear in your account within 7 days and will become available for withdrawal after the store\'s return period (typically 30-90 days).',
      category: 'cashback'
    },
    {
      id: 3,
      question: 'Is CashHeros free to use?',
      answer: 'Yes, CashHeros is completely free to use. There are no membership fees or hidden charges. We make money through commissions from our retail partners when you make a purchase through our links.',
      category: 'general'
    },
    {
      id: 4,
      question: 'How do I earn cash back?',
      answer: 'To earn cash back, simply start your shopping trip at CashHeros. Search for your favorite store, click the "Shop Now" button, and make your purchase as usual. You can also install our browser extension to automatically apply cash back and coupons when you shop online.',
      category: 'cashback'
    },
    {
      id: 5,
      question: 'When will I receive my cash back?',
      answer: 'Cash back typically appears as pending in your account within 7 days of your purchase. It becomes available for withdrawal after the store\'s return period has passed, which is usually 30-90 days depending on the store.',
      category: 'cashback'
    },
    {
      id: 6,
      question: 'How do I withdraw my cash back?',
      answer: 'Once your cash back becomes available, you can withdraw it via PayPal, direct deposit, or gift cards. The minimum withdrawal amount is $5 for PayPal and direct deposit, and varies for gift cards. You can request a withdrawal from your account dashboard.',
      category: 'cashback'
    },
    {
      id: 7,
      question: 'Can I use coupons and still earn cash back?',
      answer: 'Yes! You can use coupons found on CashHeros and still earn cash back. However, using coupons from other sites may void your cash back, as it can break the tracking link that attributes the purchase to CashHeros.',
      category: 'shopping'
    },
    {
      id: 8,
      question: 'Why didn\'t I receive cash back for my purchase?',
      answer: 'There are several reasons why cash back might not track: you used an ad blocker, cleared cookies, used coupons from another site, or the item purchased was excluded from cash back. If you believe your cash back should have tracked, you can submit a missing cash back claim from your account.',
      category: 'cashback'
    },
    {
      id: 9,
      question: 'How do I create an account?',
      answer: 'To create an account, click the "Sign Up" button in the top right corner of the website. You can sign up using your email address, or through Facebook or Google. Once you\'ve created an account, you can start earning cash back right away.',
      category: 'account'
    },
    {
      id: 10,
      question: 'I forgot my password. How do I reset it?',
      answer: 'If you forgot your password, click the "Login" button, then click "Forgot Password". Enter the email address associated with your account, and we\'ll send you a link to reset your password.',
      category: 'account'
    },
    {
      id: 11,
      question: 'How do I install the browser extension?',
      answer: 'To install our browser extension, visit the "Browser Extension" page on our website. Click the "Add to Chrome" (or your browser) button and follow the prompts. The extension will automatically alert you when cash back and coupons are available as you browse the web.',
      category: 'shopping'
    },
    {
      id: 12,
      question: 'Can I earn cash back on my mobile device?',
      answer: 'Yes! You can earn cash back on your mobile device by using our mobile app or by visiting our mobile website. The process is the same as on desktop – search for a store, click through to shop, and make your purchase.',
      category: 'shopping'
    },
    {
      id: 13,
      question: 'Do you have a referral program?',
      answer: 'Yes, we have a referral program! You can earn $10 for each friend you refer who signs up and makes a qualifying purchase of $25 or more. Your friend will also receive $10. You can find your referral link in your account dashboard.',
      category: 'general'
    },
    {
      id: 14,
      question: 'What stores do you partner with?',
      answer: 'We partner with thousands of stores across various categories, including major retailers like Amazon, Walmart, Target, Best Buy, and many more. You can browse our full list of partner stores on our "Stores" page.',
      category: 'shopping'
    },
    {
      id: 15,
      question: 'How do I contact customer support?',
      answer: 'You can contact our customer support team through the "Contact Us" page on our website. We offer support via email and live chat. Our support team is available Monday through Friday, 9am to 5pm EST.',
      category: 'general'
    },
  ];
  
  // Toggle question expansion
  const toggleQuestion = (id) => {
    if (expandedQuestions.includes(id)) {
      setExpandedQuestions(expandedQuestions.filter(qId => qId !== id));
    } else {
      setExpandedQuestions([...expandedQuestions, id]);
    }
  };
  
  // Filter FAQs based on search term and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = 
      searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      activeCategory === 'all' || 
      faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className={styles.faqPage}>
      <div className={styles.faqHeader}>
        <h1 className={styles.title}>Help Center</h1>
        <p className={styles.subtitle}>Find answers to common questions about CashHeros</p>
        
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>
      
      <div className={styles.faqContent}>
        <div className={styles.categoriesContainer}>
          <h2 className={styles.categoriesTitle}>Categories</h2>
          <div className={styles.categoriesList}>
            {categories.map(category => (
              <button
                key={category.id}
                className={`${styles.categoryButton} ${activeCategory === category.id ? styles.active : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className={styles.faqList}>
          <h2 className={styles.faqListTitle}>
            {activeCategory === 'all' 
              ? 'Frequently Asked Questions' 
              : `${categories.find(cat => cat.id === activeCategory).name} FAQs`}
          </h2>
          
          {filteredFAQs.length > 0 ? (
            <div className={styles.questions}>
              {filteredFAQs.map(faq => (
                <div 
                  key={faq.id} 
                  className={`${styles.questionItem} ${expandedQuestions.includes(faq.id) ? styles.expanded : ''}`}
                >
                  <button 
                    className={styles.questionHeader}
                    onClick={() => toggleQuestion(faq.id)}
                    aria-expanded={expandedQuestions.includes(faq.id)}
                  >
                    <span className={styles.questionText}>{faq.question}</span>
                    {expandedQuestions.includes(faq.id) 
                      ? <FaChevronUp className={styles.questionIcon} /> 
                      : <FaChevronDown className={styles.questionIcon} />
                    }
                  </button>
                  
                  {expandedQuestions.includes(faq.id) && (
                    <div className={styles.answerContainer}>
                      <p className={styles.answerText}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <FaQuestionCircle className={styles.noResultsIcon} />
              <p>No FAQs match your search criteria.</p>
              <button 
                className={styles.clearButton}
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.contactSection}>
        <h2 className={styles.contactTitle}>Still have questions?</h2>
        <p className={styles.contactText}>
          Our support team is here to help. Contact us through one of the methods below.
        </p>
        
        <div className={styles.contactOptions}>
          <div className={styles.contactCard}>
            <FaEnvelope className={styles.contactIcon} />
            <h3>Email Support</h3>
            <p>Get a response within 24 hours</p>
            <a href="mailto:support@cashheros.com" className={styles.contactButton}>
              Email Us
            </a>
          </div>
          
          <div className={styles.contactCard}>
            <FaCommentDots className={styles.contactIcon} />
            <h3>Live Chat</h3>
            <p>Available Monday-Friday, 9am-5pm EST</p>
            <button className={styles.contactButton}>
              Start Chat
            </button>
          </div>
          
          <div className={styles.contactCard}>
            <FaHeadset className={styles.contactIcon} />
            <h3>Help Center</h3>
            <p>Browse our knowledge base</p>
            <Link to="/help-center" className={styles.contactButton}>
              Visit Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;