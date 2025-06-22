import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './SearchPage.module.css';

// This is a mock data fetching function.
// In a real application, you would fetch this data from your API.
const fetchSearchResults = async (query) => {
  console.log(`Searching for: ${query}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock search results
  const mockResults = [
    { id: 1, title: `Result for "${query}" 1`, description: 'This is a sample search result.', url: '#' },
    { id: 2, title: `Result for "${query}" 2`, description: 'This is another sample search result.', url: '#' },
    { id: 3, title: `Result for "${query}" 3`, description: 'And one more sample search result.', url: '#' },
  ];
  
  return mockResults;
};

export const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      fetchSearchResults(query)
        .then(data => {
          setResults(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch search results:', error);
          setIsLoading(false);
        });
    }
  }, [query]);

  return (
    <div className={styles.searchPage}>
      <h1 className={styles.title}>Search Results for "{query}"</h1>
      {isLoading ? (
        <div className={styles.loader}>Loading...</div>
      ) : (
        <div className={styles.resultsContainer}>
          {results.length > 0 ? (
            results.map(result => (
              <div key={result.id} className={styles.resultItem}>
                <h2><a href={result.url}>{result.title}</a></h2>
                <p>{result.description}</p>
              </div>
            ))
          ) : (
            <p>No results found for "{query}".</p>
          )}
        </div>
      )}
    </div>
  );
}; 