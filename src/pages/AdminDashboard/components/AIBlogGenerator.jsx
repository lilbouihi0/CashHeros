import React, { useState } from 'react';
import { 
  FaRobot, FaMagic, FaSpinner, FaCheck, FaTimes, 
  FaLightbulb, FaImage, FaHeading, FaParagraph, FaTag
} from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';

const AIBlogGenerator = ({ onBlogGenerated, categories }) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('generator');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generationOptions, setGenerationOptions] = useState({
    tone: 'informative',
    length: 'medium',
    includeImages: true,
    targetAudience: 'general'
  });

  // Blog post templates
  const blogTemplates = [
    {
      id: 'deal-roundup',
      title: 'Deal Roundup',
      description: 'A collection of the best deals in a specific category',
      prompt: 'Create a roundup of the best deals for [category] this month'
    },
    {
      id: 'money-saving',
      title: 'Money-Saving Tips',
      description: 'Practical advice for saving money on everyday purchases',
      prompt: 'Write an article about clever ways to save money on [topic]'
    },
    {
      id: 'store-spotlight',
      title: 'Store Spotlight',
      description: 'In-depth look at a specific store and its best offers',
      prompt: 'Create a detailed guide about shopping at [store] and maximizing savings'
    },
    {
      id: 'seasonal-shopping',
      title: 'Seasonal Shopping Guide',
      description: 'Tips for shopping during a specific season or holiday',
      prompt: 'Write a comprehensive guide for saving money during [season/holiday]'
    },
    {
      id: 'product-comparison',
      title: 'Product Comparison',
      description: 'Compare similar products to help users make informed decisions',
      prompt: 'Create a comparison of [product type] highlighting the best deals and value options'
    }
  ];

  // Topic suggestions based on category
  const topicSuggestions = {
    'Savings Tips': ['Grocery shopping', 'Utility bills', 'Subscription services', 'Online shopping'],
    'Shopping Guide': ['Electronics', 'Home decor', 'Kitchen appliances', 'Office supplies'],
    'Cashback': ['Best cashback credit cards', 'Maximizing cashback rewards', 'Store-specific cashback'],
    'Coupons': ['Digital coupon strategies', 'Stacking coupons', 'Finding hidden coupons'],
    'Deals': ['Flash sales', 'Clearance shopping', 'Seasonal deals', 'Student discounts'],
    'Finance': ['Budgeting apps', 'Saving for vacation', 'Debt reduction', 'Investment basics'],
    'Lifestyle': ['Budget-friendly hobbies', 'Affordable self-care', 'Frugal entertaining'],
    'Technology': ['Budget tech gadgets', 'Smart home savings', 'Refurbished electronics'],
    'Fashion': ['Capsule wardrobe', 'Designer dupes', 'Outlet shopping', 'Seasonal sales'],
    'Travel': ['Budget destinations', 'Travel hacking', 'Off-season travel', 'All-inclusive deals'],
    'Food': ['Meal prep savings', 'Restaurant deals', 'Grocery delivery comparison']
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGenerationOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setPrompt(template.prompt);
  };

  const generateBlog = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt or select a template');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // In a real implementation, this would call an AI service API
      // For demo purposes, we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock generated content
      const mockGeneratedContent = {
        title: generateMockTitle(),
        content: generateMockContent(),
        summary: generateMockSummary(),
        tags: generateMockTags(),
        imagePrompt: generateMockImagePrompt()
      };

      setGeneratedContent(mockGeneratedContent);
    } catch (err) {
      console.error('Error generating blog content:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const generateMockTitle = () => {
    const titles = [
      "10 Genius Ways to Save Money on Your Online Shopping",
      "The Ultimate Guide to Cashback Rewards in 2023",
      "How to Find Hidden Coupons for Your Favorite Stores",
      "Seasonal Shopping: Best Deals to Look for This Fall",
      "Budget-Friendly Tech Gadgets That Are Actually Worth It"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generateMockSummary = () => {
    const summaries = [
      "Discover insider tips to maximize your savings when shopping online with these expert strategies.",
      "Learn how to make the most of cashback programs and earn money while you shop with this comprehensive guide.",
      "Uncover the secrets to finding hidden coupons and promo codes that can save you hundreds on your purchases.",
      "Get ahead of the seasonal shopping rush with our curated list of the best deals to watch for this season.",
      "Don't waste money on unnecessary tech - find out which budget-friendly gadgets actually deliver value."
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  };

  const generateMockContent = () => {
    return `# ${generateMockTitle()}

## Introduction

${generateMockSummary()}

## Why This Matters

In today's economy, finding ways to stretch your dollar is more important than ever. The average consumer can save up to $1,000 annually by implementing smart shopping strategies.

## Main Tips

### 1. Use Price Comparison Tools

Before making any purchase, use tools like CamelCamelCamel or Honey to check price history and ensure you're getting the best deal.

### 2. Stack Savings Methods

Combine cashback offers with coupon codes and credit card rewards to maximize your savings on a single purchase.

### 3. Time Your Purchases Strategically

Many products follow predictable sales cycles. Electronics are often cheapest in November, while fitness equipment goes on sale in January.

## Real-World Example

Sarah, a busy mom of two, saved over $2,500 last year using these exact strategies. "I never pay full price for anything anymore," she says.

## Conclusion

With these strategies in your toolkit, you'll be well on your way to significant savings on your everyday purchases. Remember that consistency is key - small savings add up to big results over time.`;
  };

  const generateMockTags = () => {
    const allTags = [
      'savings', 'budget', 'shopping', 'deals', 'coupons', 
      'cashback', 'money', 'finance', 'tips', 'guide',
      'online shopping', 'discount', 'sale', 'promo code'
    ];
    
    // Randomly select 3-5 tags
    const numTags = Math.floor(Math.random() * 3) + 3;
    const shuffled = [...allTags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTags);
  };

  const generateMockImagePrompt = () => {
    const imagePrompts = [
      "Shopping bags with sale tags and a calculator showing savings",
      "Person using laptop with credit card for online shopping",
      "Smartphone displaying coupon app with percentage discounts",
      "Wallet with cash and credit cards next to shopping cart icon",
      "Calendar marking sale dates with dollar signs and discount symbols"
    ];
    return imagePrompts[Math.floor(Math.random() * imagePrompts.length)];
  };

  const useGeneratedContent = () => {
    if (!generatedContent) return;

    // Format the content for the blog editor
    const formattedBlog = {
      title: generatedContent.title,
      content: generatedContent.content,
      summary: generatedContent.summary,
      tags: generatedContent.tags,
      category: determineCategory(generatedContent),
      image: '' // In a real implementation, this could be generated from the imagePrompt
    };

    // Pass the generated blog to the parent component
    onBlogGenerated(formattedBlog);
    
    // Reset the generator
    setGeneratedContent(null);
    setPrompt('');
    setSelectedTemplate(null);
  };

  const determineCategory = (content) => {
    // Simple keyword matching to determine the most appropriate category
    const contentText = `${content.title} ${content.summary} ${content.content}`.toLowerCase();
    
    const categoryKeywords = {
      'Savings Tips': ['save', 'budget', 'money', 'finance', 'frugal'],
      'Shopping Guide': ['shop', 'buy', 'purchase', 'product', 'item'],
      'Cashback': ['cashback', 'reward', 'earn', 'return', 'rebate'],
      'Coupons': ['coupon', 'code', 'promo', 'discount', 'voucher'],
      'Deals': ['deal', 'sale', 'bargain', 'clearance', 'offer'],
      'Finance': ['invest', 'credit', 'debt', 'loan', 'financial'],
      'Lifestyle': ['life', 'living', 'home', 'family', 'personal'],
      'Technology': ['tech', 'gadget', 'device', 'digital', 'electronic'],
      'Fashion': ['fashion', 'clothing', 'wear', 'style', 'outfit'],
      'Travel': ['travel', 'trip', 'vacation', 'destination', 'flight'],
      'Food': ['food', 'grocery', 'meal', 'restaurant', 'cooking']
    };
    
    // Count keyword matches for each category
    const categoryScores = Object.entries(categoryKeywords).map(([category, keywords]) => {
      const score = keywords.reduce((count, keyword) => {
        return count + (contentText.includes(keyword) ? 1 : 0);
      }, 0);
      return { category, score };
    });
    
    // Sort by score and return the highest scoring category
    categoryScores.sort((a, b) => b.score - a.score);
    return categoryScores[0].category;
  };

  const renderTopicSuggestions = () => {
    // Get suggestions based on selected category in the generation options
    const category = generationOptions.category || Object.keys(topicSuggestions)[0];
    const suggestions = topicSuggestions[category] || topicSuggestions['Deals'];
    
    return (
      <div className={styles.topicSuggestions}>
        <h3>Topic Ideas for {category}</h3>
        <div className={styles.suggestionTags}>
          {suggestions.map((topic, index) => (
            <button 
              key={index} 
              className={styles.suggestionTag}
              onClick={() => setPrompt(prev => 
                `Write a blog post about ${topic} with tips for saving money`
              )}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.aiBlogGenerator}>
      <div className={styles.generatorHeader}>
        <h2><FaRobot /> AI Blog Content Generator</h2>
        <div className={styles.tabSelector}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'generator' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            <FaMagic /> Generator
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'templates' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <FaLightbulb /> Templates
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {activeTab === 'generator' ? (
        <div className={styles.generatorContent}>
          <div className={styles.promptSection}>
            <label htmlFor="blog-prompt">What would you like to write about?</label>
            <textarea
              id="blog-prompt"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="E.g., Write a blog post about the best ways to save money on grocery shopping"
              className={styles.promptInput}
              rows={4}
              disabled={generating}
            />
            
            <div className={styles.generationOptions}>
              <div className={styles.optionGroup}>
                <label>Tone:</label>
                <select 
                  name="tone" 
                  value={generationOptions.tone} 
                  onChange={handleOptionChange}
                  disabled={generating}
                >
                  <option value="informative">Informative</option>
                  <option value="conversational">Conversational</option>
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </div>
              
              <div className={styles.optionGroup}>
                <label>Length:</label>
                <select 
                  name="length" 
                  value={generationOptions.length} 
                  onChange={handleOptionChange}
                  disabled={generating}
                >
                  <option value="short">Short (~300 words)</option>
                  <option value="medium">Medium (~600 words)</option>
                  <option value="long">Long (~1000 words)</option>
                </select>
              </div>
              
              <div className={styles.optionGroup}>
                <label>Category:</label>
                <select 
                  name="category" 
                  value={generationOptions.category} 
                  onChange={handleOptionChange}
                  disabled={generating}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.optionGroup}>
                <label>Target Audience:</label>
                <select 
                  name="targetAudience" 
                  value={generationOptions.targetAudience} 
                  onChange={handleOptionChange}
                  disabled={generating}
                >
                  <option value="general">General</option>
                  <option value="budget-conscious">Budget-Conscious</option>
                  <option value="deal-hunters">Deal Hunters</option>
                  <option value="students">Students</option>
                  <option value="families">Families</option>
                </select>
              </div>
              
              <div className={styles.optionGroup}>
                <label>
                  <input
                    type="checkbox"
                    name="includeImages"
                    checked={generationOptions.includeImages}
                    onChange={handleOptionChange}
                    disabled={generating}
                  />
                  Suggest images
                </label>
              </div>
            </div>
            
            {renderTopicSuggestions()}
            
            <button 
              className={styles.generateButton}
              onClick={generateBlog}
              disabled={generating || !prompt.trim()}
            >
              {generating ? (
                <>
                  <FaSpinner className={styles.spinnerIcon} /> Generating...
                </>
              ) : (
                <>
                  <FaMagic /> Generate Blog Content
                </>
              )}
            </button>
          </div>
          
          {generatedContent && (
            <div className={styles.generatedContentPreview}>
              <h3>Generated Content Preview</h3>
              
              <div className={styles.previewItem}>
                <div className={styles.previewHeader}>
                  <FaHeading className={styles.previewIcon} />
                  <h4>Title</h4>
                </div>
                <p>{generatedContent.title}</p>
              </div>
              
              <div className={styles.previewItem}>
                <div className={styles.previewHeader}>
                  <FaParagraph className={styles.previewIcon} />
                  <h4>Summary</h4>
                </div>
                <p>{generatedContent.summary}</p>
              </div>
              
              <div className={styles.previewItem}>
                <div className={styles.previewHeader}>
                  <FaTag className={styles.previewIcon} />
                  <h4>Tags</h4>
                </div>
                <div className={styles.tagsList}>
                  {generatedContent.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
              
              {generationOptions.includeImages && (
                <div className={styles.previewItem}>
                  <div className={styles.previewHeader}>
                    <FaImage className={styles.previewIcon} />
                    <h4>Image Suggestion</h4>
                  </div>
                  <p>{generatedContent.imagePrompt}</p>
                </div>
              )}
              
              <div className={styles.previewActions}>
                <button 
                  className={styles.useContentButton}
                  onClick={useGeneratedContent}
                >
                  <FaCheck /> Use This Content
                </button>
                <button 
                  className={styles.discardButton}
                  onClick={() => setGeneratedContent(null)}
                >
                  <FaTimes /> Discard
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.templatesContent}>
          <p className={styles.templatesIntro}>
            Choose a template to quickly generate blog content for common formats
          </p>
          
          <div className={styles.templatesList}>
            {blogTemplates.map(template => (
              <div 
                key={template.id} 
                className={`${styles.templateCard} ${selectedTemplate?.id === template.id ? styles.selectedTemplate : ''}`}
                onClick={() => selectTemplate(template)}
              >
                <h3>{template.title}</h3>
                <p>{template.description}</p>
                <div className={styles.templatePrompt}>
                  <strong>Prompt:</strong> {template.prompt}
                </div>
                <button className={styles.useTemplateButton}>
                  Use Template
                </button>
              </div>
            ))}
          </div>
          
          {selectedTemplate && (
            <div className={styles.selectedTemplateActions}>
              <button 
                className={styles.generateButton}
                onClick={() => {
                  setActiveTab('generator');
                  setTimeout(generateBlog, 100);
                }}
              >
                <FaMagic /> Generate with Template
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIBlogGenerator;