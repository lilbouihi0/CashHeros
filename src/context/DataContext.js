// src/context/DataContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useReducer } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import placeholderImage from '../Components/assets/placeholder.js';

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Data reducer for more predictable state updates
const dataReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.resource]: true
        },
        error: {
          ...state.error,
          [action.payload.resource]: null
        }
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        [action.payload.resource]: action.payload.data,
        loading: {
          ...state.loading,
          [action.payload.resource]: false
        },
        error: {
          ...state.error,
          [action.payload.resource]: null
        },
        cache: {
          ...state.cache,
          [action.payload.resource]: {
            timestamp: Date.now(),
            data: action.payload.data
          }
        }
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.resource]: false
        },
        error: {
          ...state.error,
          [action.payload.resource]: action.payload.error
        }
      };
    case 'OPTIMISTIC_UPDATE':
      return {
        ...state,
        [action.payload.resource]: action.payload.data,
        pendingOperations: [
          ...state.pendingOperations,
          {
            id: action.payload.operationId,
            resource: action.payload.resource,
            type: action.payload.operationType,
            originalData: state[action.payload.resource],
            timestamp: Date.now()
          }
        ]
      };
    case 'CONFIRM_UPDATE':
      return {
        ...state,
        pendingOperations: state.pendingOperations.filter(
          op => op.id !== action.payload.operationId
        )
      };
    case 'REVERT_UPDATE':
      return {
        ...state,
        [action.payload.resource]: action.payload.originalData,
        pendingOperations: state.pendingOperations.filter(
          op => op.id !== action.payload.operationId
        )
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: Object.keys(state.error).reduce((acc, key) => {
          acc[key] = null;
          return acc;
        }, {})
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.resource]: null
        }
      };
    case 'RESET_STATE':
      return initialDataState;
    default:
      return state;
  }
};

// Initial mock data
const mockCoupons = [
  { id: 1, brand: 'Amazon', title: '10% Off Sitewide', code: 'AMAZON10', expiryDate: '2024-12-31', category: 'Electronics' },
  { id: 2, brand: 'Walmart', title: '15% Off Electronics', code: 'WLMRT15', expiryDate: '2024-11-30', category: 'Electronics' },
  { id: 3, brand: 'Target', title: '20% Off Home Goods', code: 'TARGET20', expiryDate: '2024-10-15', category: 'Home' },
  { id: 4, brand: 'Best Buy', title: '25% Off Laptops', code: 'BESTBUY25', expiryDate: '2024-09-30', category: 'Electronics' },
  { id: 5, brand: 'Nike', title: '30% Off Footwear', code: 'NIKE30', expiryDate: '2024-08-31', category: 'Fashion' },
  { id: 6, brand: 'Adidas', title: '20% Off Apparel', code: 'ADIDAS20', expiryDate: '2024-12-15', category: 'Fashion' },
  { id: 7, brand: 'Apple', title: '10% Off Accessories', code: 'APPLE10', expiryDate: '2024-11-20', category: 'Electronics' },
  { id: 8, brand: 'Sephora', title: '15% Off Makeup', code: 'SEPHORA15', expiryDate: '2024-10-10', category: 'Beauty' },
  { id: 9, brand: 'Expedia', title: '15% Off Hotel Bookings', code: 'HOTEL15', expiryDate: '2024-12-31', category: 'Travel' },
  { id: 10, brand: 'Expedia', title: '$50 Off $500+ Vacation Packages', code: 'VACATION50', expiryDate: '2024-11-30', category: 'Travel' },
];

const mockCashBacks = [
  { 
    id: 1, 
    brand: 'Amazon', 
    percent: '5%', 
    category: 'Electronics', 
    image: placeholderImage, 
    featured: true,
    popularity: 95,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
  { 
    id: 13, 
    brand: 'Expedia', 
    percent: '4%', 
    category: 'Travel', 
    image: placeholderImage, 
    featured: true,
    popularity: 88,
    terms: 'Valid on hotel bookings. Exclusions apply to flights and vacation packages.'
  },
  { 
    id: 2, 
    brand: 'Walmart', 
    percent: '3%', 
    category: 'Retail', 
    image: placeholderImage, 
    featured: true,
    popularity: 90,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
  { 
    id: 3, 
    brand: 'Target', 
    percent: '4%', 
    category: 'Retail', 
    image: placeholderImage, 
    featured: true,
    popularity: 88,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
  { 
    id: 4, 
    brand: 'Best Buy', 
    percent: '2%', 
    category: 'Electronics', 
    image: placeholderImage, 
    featured: false,
    popularity: 85,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
  { 
    id: 5, 
    brand: 'Nike', 
    percent: '8%', 
    category: 'Fashion', 
    image: placeholderImage, 
    featured: true,
    popularity: 92,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
  { 
    id: 6, 
    brand: 'Adidas', 
    percent: '7%', 
    category: 'Fashion', 
    image: placeholderImage, 
    featured: false,
    popularity: 87,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
  { 
    id: 7, 
    brand: 'Apple', 
    percent: '2%', 
    category: 'Electronics', 
    image: placeholderImage, 
    featured: true,
    popularity: 94,
    terms: 'Valid on select accessories only. Mac, iPhone, and iPad purchases excluded.'
  },
  { 
    id: 8, 
    brand: 'Sephora', 
    percent: '6%', 
    category: 'Beauty', 
    image: placeholderImage, 
    featured: true,
    popularity: 89,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
  { 
    id: 9, 
    brand: 'Ulta Beauty', 
    percent: '5%', 
    category: 'Beauty', 
    image: placeholderImage, 
    featured: false,
    popularity: 86,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
  { 
    id: 10, 
    brand: 'Home Depot', 
    percent: '4%', 
    category: 'Home', 
    image: placeholderImage, 
    featured: false,
    popularity: 83,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
  { 
    id: 11, 
    brand: 'Lowe\'s', 
    percent: '3%', 
    category: 'Home', 
    image: placeholderImage, 
    featured: false,
    popularity: 82,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
  { 
    id: 12, 
    brand: 'Macy\'s', 
    percent: '6%', 
    category: 'Fashion', 
    image: placeholderImage, 
    featured: false,
    popularity: 80,
    terms: 'Valid on all purchases. Exclusions may apply.'
  },
];

const mockDeals = [
  { id: 1, title: "Valentine's Day Gift", brand: "Amazon", category: "Seasonal", discount: "20% OFF", expiryDate: '2024-02-14' },
  { id: 2, title: "Spring Sale", brand: "Target", category: "Seasonal", discount: "15% OFF", expiryDate: '2024-03-31' },
  { id: 3, title: "Summer Blowout", brand: "Walmart", category: "Seasonal", discount: "25% OFF", expiryDate: '2024-06-30' },
  { id: 4, title: "Back to School", brand: "Best Buy", category: "Electronics", discount: "10% OFF", expiryDate: '2024-08-31' },
  { id: 5, title: "Fall Fashion", brand: "Nike", category: "Fashion", discount: "30% OFF", expiryDate: '2024-09-30' },
  { id: 6, title: "Holiday Special", brand: "Apple", category: "Electronics", discount: "5% OFF", expiryDate: '2024-12-25' },
  { id: 7, title: "Summer Travel", brand: "Expedia", category: "Travel", discount: "20% OFF", expiryDate: '2024-08-31' },
];

const mockStores = [
  { id: 1, name: 'Amazon', logo: placeholderImage, category: 'Electronics', popularity: 95 },
  { id: 2, name: 'Walmart', logo: placeholderImage, category: 'Retail', popularity: 90 },
  { id: 3, name: 'Target', logo: placeholderImage, category: 'Retail', popularity: 88 },
  { id: 4, name: 'Best Buy', logo: placeholderImage, category: 'Electronics', popularity: 85 },
  { id: 5, name: 'Nike', logo: placeholderImage, category: 'Fashion', popularity: 92 },
  { id: 6, name: 'Adidas', logo: placeholderImage, category: 'Fashion', popularity: 87 },
  { id: 13, name: 'Expedia', logo: placeholderImage, category: 'Travel', popularity: 88 },
];

const mockBlogs = [
  { id: 1, title: 'Top 10 Ways to Save Money', author: 'John Doe', date: '2024-01-15', category: 'Savings' },
  { id: 2, title: 'Best Cashback Offers This Month', author: 'Jane Smith', date: '2024-01-20', category: 'Cashback' },
  { id: 3, title: 'How to Maximize Your Coupon Savings', author: 'Mike Johnson', date: '2024-01-25', category: 'Coupons' },
];

// Initial data state
const initialDataState = {
  coupons: mockCoupons,
  cashBacks: mockCashBacks,
  deals: mockDeals,
  stores: mockStores,
  blogs: mockBlogs,
  categories: [],
  loading: {
    coupons: false,
    cashBacks: false,
    deals: false,
    stores: false,
    blogs: false,
    categories: false
  },
  error: {
    coupons: null,
    cashBacks: null,
    deals: null,
    stores: null,
    blogs: null,
    categories: null
  },
  cache: {},
  pendingOperations: []
};

export const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialDataState);
  const { accessToken, isAuthenticated } = useContext(AuthContext);

  // Track ongoing requests to prevent duplicate requests
  const ongoingRequests = {};

  // Set up API interceptors
  useEffect(() => {
    // Request interceptor to add auth token and prevent duplicate requests
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // Generate a request key based on the URL and params
        const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
        
        // Check if this exact request is already in progress
        if (ongoingRequests[requestKey]) {
          // If this is a GET request, we can safely cancel it and use the existing one
          if (config.method.toLowerCase() === 'get') {
            const message = `Duplicate request canceled: ${config.url}`;
            console.log(message);
            
            // Cancel the request
            const source = axios.CancelToken.source();
            config.cancelToken = source.token;
            source.cancel(message);
          }
        } else {
          // Mark this request as in progress
          ongoingRequests[requestKey] = true;
          
          // Clean up when the request is complete
          config.onComplete = () => {
            delete ongoingRequests[requestKey];
          };
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        // Clean up the ongoing request tracker
        if (response.config.onComplete) {
          response.config.onComplete();
        }
        
        return response;
      },
      (error) => {
        // Clean up the ongoing request tracker even on error
        if (error.config?.onComplete) {
          error.config.onComplete();
        }
        
        // Handle specific error types
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'] || 15;
          console.error(`Rate limit exceeded. Please try again after ${retryAfter} seconds.`);
        } else if (!error.response && error.request) {
          console.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
      }
    );

    // Clean up interceptors on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

  // Generic fetch function with caching and retry logic
  const fetchData = useCallback(async (resource, endpoint, params = {}, forceRefresh = false, retryCount = 0) => {
    // Check cache first if not forcing refresh
    if (!forceRefresh && state.cache[resource]) {
      const { timestamp, data } = state.cache[resource];
      const isCacheValid = Date.now() - timestamp < CACHE_DURATION;
      
      if (isCacheValid) {
        return data;
      }
    }

    // Only dispatch FETCH_START on the first attempt, not on retries
    if (retryCount === 0) {
      dispatch({ 
        type: 'FETCH_START', 
        payload: { resource } 
      });
    }

    try {
      // For development, use mock data instead of making API calls
      // This prevents 404 errors when the backend is not available
      let mockData;
      switch (resource) {
        case 'coupons':
          mockData = mockCoupons;
          break;
        case 'cashBacks':
          mockData = mockCashBacks;
          break;
        case 'deals':
          mockData = mockDeals;
          break;
        case 'stores':
          mockData = mockStores;
          break;
        case 'blogs':
          mockData = mockBlogs;
          break;
        case 'categories':
          mockData = [];
          break;
        default:
          mockData = [];
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          resource,
          data: mockData
        }
      });
      
      return mockData;
      
      /* Commented out actual API call for development
      const response = await api.get(endpoint, { params });
      
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          resource,
          data: response.data.data || response.data
        }
      });
      
      return response.data.data || response.data;
      */
    } catch (error) {
      // Handle rate limiting with exponential backoff
      if (error.response?.status === 429 && retryCount < 3) {
        // Calculate exponential backoff delay: 1s, 2s, 4s
        const backoffDelay = Math.pow(2, retryCount) * 1000;
        console.log(`Rate limited. Retrying ${resource} in ${backoffDelay}ms (attempt ${retryCount + 1}/3)`);
        
        // Wait for the backoff period
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        // Retry the request with incremented retry count
        return fetchData(resource, endpoint, params, forceRefresh, retryCount + 1);
      }
      
      // For other errors or if max retries reached, handle normally
      const errorMessage = error.response?.data?.message || 'Failed to fetch data';
      
      dispatch({
        type: 'FETCH_ERROR',
        payload: {
          resource,
          error: errorMessage
        }
      });
      
      throw new Error(errorMessage);
    }
  }, [state.cache]);

  // Specific fetch functions for each resource
  const fetchCoupons = useCallback((params = {}, forceRefresh = false) => {
    return fetchData('coupons', '/coupons', params, forceRefresh);
  }, [fetchData]);

  const fetchCashBacks = useCallback((params = {}, forceRefresh = false) => {
    return fetchData('cashBacks', '/cashbacks', params, forceRefresh);
  }, [fetchData]);

  const fetchDeals = useCallback((params = {}, forceRefresh = false) => {
    return fetchData('deals', '/deals', params, forceRefresh);
  }, [fetchData]);

  const fetchStores = useCallback((params = {}, forceRefresh = false) => {
    return fetchData('stores', '/stores', params, forceRefresh);
  }, [fetchData]);

  const fetchBlogs = useCallback((params = {}, forceRefresh = false) => {
    return fetchData('blogs', '/blogs', params, forceRefresh);
  }, [fetchData]);

  const fetchCategories = useCallback((params = {}, forceRefresh = false) => {
    return fetchData('categories', '/categories', params, forceRefresh);
  }, [fetchData]);

  // Get a single item by ID
  const getItemById = useCallback((resource, id) => {
    if (!state[resource]) return null;
    return state[resource].find(item => item.id === parseInt(id) || item.id === id);
  }, [state]);

  // Search functionality
  const searchItems = useCallback((resource, query, fields = ['title', 'name', 'brand']) => {
    if (!state[resource] || !query) return state[resource] || [];
    
    const lowerQuery = query.toLowerCase();
    
    return state[resource].filter(item => {
      return fields.some(field => {
        if (!item[field]) return false;
        return item[field].toLowerCase().includes(lowerQuery);
      });
    });
  }, [state]);

  // Filter functionality
  const filterItems = useCallback((resource, filters) => {
    if (!state[resource] || !filters || Object.keys(filters).length === 0) {
      return state[resource] || [];
    }
    
    return state[resource].filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.length === 0 || value.includes(item[key]);
        }
        return value === '' || item[key] === value;
      });
    });
  }, [state]);

  // Sort functionality
  const sortItems = useCallback((resource, sortBy, sortOrder = 'asc') => {
    if (!state[resource] || !sortBy) return state[resource] || [];
    
    return [...state[resource]].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [state]);

  // CRUD operations with optimistic updates
  const createItem = useCallback(async (resource, data) => {
    // Generate a temporary ID for optimistic update
    const tempId = `temp_${Date.now()}`;
    const operationId = `create_${resource}_${tempId}`;
    
    // Create a new item with the temporary ID
    const newItem = { ...data, id: tempId };
    
    // Optimistically update the state
    dispatch({
      type: 'OPTIMISTIC_UPDATE',
      payload: {
        resource,
        data: [...state[resource], newItem],
        operationId,
        operationType: 'create'
      }
    });
    
    try {
      // Make the API call
      const response = await api.post(`/${resource}`, data);
      const createdItem = response.data.data || response.data;
      
      // Update the state with the actual data from the server
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          resource,
          data: state[resource].map(item => 
            item.id === tempId ? createdItem : item
          )
        }
      });
      
      // Confirm the update
      dispatch({
        type: 'CONFIRM_UPDATE',
        payload: { operationId }
      });
      
      return createdItem;
    } catch (error) {
      // Revert the optimistic update
      dispatch({
        type: 'REVERT_UPDATE',
        payload: {
          resource,
          originalData: state[resource].filter(item => item.id !== tempId),
          operationId
        }
      });
      
      const errorMessage = error.response?.data?.message || 'Failed to create item';
      throw new Error(errorMessage);
    }
  }, [state]);

  const updateItem = useCallback(async (resource, id, data) => {
    const operationId = `update_${resource}_${id}`;
    const originalData = [...state[resource]];
    
    // Optimistically update the state
    dispatch({
      type: 'OPTIMISTIC_UPDATE',
      payload: {
        resource,
        data: state[resource].map(item => 
          item.id === id ? { ...item, ...data } : item
        ),
        operationId,
        operationType: 'update'
      }
    });
    
    try {
      // Make the API call
      const response = await api.put(`/${resource}/${id}`, data);
      const updatedItem = response.data.data || response.data;
      
      // Confirm the update
      dispatch({
        type: 'CONFIRM_UPDATE',
        payload: { operationId }
      });
      
      return updatedItem;
    } catch (error) {
      // Revert the optimistic update
      dispatch({
        type: 'REVERT_UPDATE',
        payload: {
          resource,
          originalData,
          operationId
        }
      });
      
      const errorMessage = error.response?.data?.message || 'Failed to update item';
      throw new Error(errorMessage);
    }
  }, [state]);

  const deleteItem = useCallback(async (resource, id) => {
    const operationId = `delete_${resource}_${id}`;
    const originalData = [...state[resource]];
    
    // Optimistically update the state
    dispatch({
      type: 'OPTIMISTIC_UPDATE',
      payload: {
        resource,
        data: state[resource].filter(item => item.id !== id),
        operationId,
        operationType: 'delete'
      }
    });
    
    try {
      // Make the API call
      await api.delete(`/${resource}/${id}`);
      
      // Confirm the update
      dispatch({
        type: 'CONFIRM_UPDATE',
        payload: { operationId }
      });
      
      return true;
    } catch (error) {
      // Revert the optimistic update
      dispatch({
        type: 'REVERT_UPDATE',
        payload: {
          resource,
          originalData,
          operationId
        }
      });
      
      const errorMessage = error.response?.data?.message || 'Failed to delete item';
      throw new Error(errorMessage);
    }
  }, [state]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  // Clear error for a specific resource
  const clearError = useCallback((resource) => {
    dispatch({ 
      type: 'CLEAR_ERROR', 
      payload: { resource } 
    });
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Helper function to add delay between API calls
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Refresh all data with sequential requests to avoid rate limiting
  const refreshAllData = useCallback(async () => {
    try {
      // Instead of making all requests in parallel with Promise.all,
      // we'll make them sequentially with a delay between each request
      const delayBetweenRequests = 500; // 500ms delay between requests
      
      // Fetch data sequentially with delays
      await fetchCoupons({}, true);
      await delay(delayBetweenRequests);
      
      await fetchCashBacks({}, true);
      await delay(delayBetweenRequests);
      
      await fetchDeals({}, true);
      await delay(delayBetweenRequests);
      
      await fetchStores({}, true);
      await delay(delayBetweenRequests);
      
      await fetchBlogs({}, true);
      await delay(delayBetweenRequests);
      
      await fetchCategories({}, true);
      
      return true;
    } catch (error) {
      console.error('Failed to refresh all data:', error);
      return false;
    }
  }, [fetchCoupons, fetchCashBacks, fetchDeals, fetchStores, fetchBlogs, fetchCategories]);

  // Initialize data on mount
  useEffect(() => {
    // Add a small delay before initial data fetch to avoid overwhelming the API
    // This is especially helpful when the app first loads
    const initialLoadTimer = setTimeout(() => {
      refreshAllData();
    }, 1000); // 1 second delay
    
    // Clean up the timer if the component unmounts
    return () => clearTimeout(initialLoadTimer);
  }, [refreshAllData]);

  return (
    <DataContext.Provider 
      value={{
        // State
        ...state,
        
        // Fetch functions
        fetchCoupons,
        fetchCashBacks,
        fetchDeals,
        fetchStores,
        fetchBlogs,
        fetchCategories,
        refreshAllData,
        
        // Helper functions
        getItemById,
        searchItems,
        filterItems,
        sortItems,
        
        // CRUD operations
        createItem,
        updateItem,
        deleteItem,
        
        // Error handling
        clearErrors,
        clearError,
        resetState,
        
        // API instance for components to use
        api
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
