import React, { useState, useRef, useEffect } from 'react';
import styles from "./SearchBar.module.css";
import { FaSearch, FaTimes } from 'react-icons/fa';

export const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Mock suggestions - in real app, this would come from an API
  const mockSuggestions = [
    'Amazon deals', 'Amazon electronics', 'Amazon fashion',
    'Walmart groceries', 'Walmart electronics', 'Walmart home',
    'Target clothing', 'Target home decor', 'Target electronics',
    'Best Buy laptops', 'Best Buy phones', 'Best Buy gaming',
    'Electronics deals', 'Fashion deals', 'Home deals',
    'Black Friday deals', 'Cyber Monday deals', 'Holiday sales'
  ];

  useEffect(() => {
    if (searchValue.length > 1) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchValue.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchValue]);

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleSearch = (query = searchValue) => {
    if (query.trim()) {
      // In a real app, this would navigate to search results
      console.log('Searching for:', query);
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const clearSearch = () => {
    setSearchValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={styles.searchWrapper}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={`${styles.searchContainer} ${isFocused ? styles.focused : ''}`}>
          <div className={styles.searchInputWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search for deals, products, brands..." 
              className={styles.searchInput}
              value={searchValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              aria-label="Search for deals and products"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
            />
            {searchValue && (
              <button 
                type="button"
                className={styles.clearButton}
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button 
            type="submit"
            className={styles.searchButton} 
            aria-label="Search"
            disabled={!searchValue.trim()}
          >
            <FaSearch />
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className={styles.suggestions}
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected="false"
              >
                <FaSearch className={styles.suggestionIcon} />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      <div className={styles.popularSearches}>
        <span>Popular:</span>
        <button 
          type="button"
          onClick={() => handleSuggestionClick('Amazon')}
          className={styles.popularTag}
        >
          Amazon
        </button>
        <button 
          type="button"
          onClick={() => handleSuggestionClick('Walmart')}
          className={styles.popularTag}
        >
          Walmart
        </button>
        <button 
          type="button"
          onClick={() => handleSuggestionClick('Target')}
          className={styles.popularTag}
        >
          Target
        </button>
        <button 
          type="button"
          onClick={() => handleSuggestionClick('Electronics')}
          className={styles.popularTag}
        >
          Electronics
        </button>
      </div>
    </div>
  );
};