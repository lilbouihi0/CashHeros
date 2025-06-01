// src/context/StoreContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useReducer } from 'react';
import { AuthContext } from './AuthContext';

// Create a context
export const StoreContext = createContext();

// Custom hook for using the store context
export const useStore = () => useContext(StoreContext);

// Store reducer for more predictable state updates
const storeReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_STORES_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_STORES_SUCCESS':
      return {
        ...state,
        stores: action.payload,
        loading: false,
        error: null,
        lastFetched: Date.now()
      };
    case 'FETCH_STORES_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'FETCH_STORE_DETAILS_SUCCESS':
      return {
        ...state,
        storeDetails: {
          ...state.storeDetails,
          [action.payload.id]: {
            ...action.payload,
            lastFetched: Date.now()
          }
        }
      };
    case 'ADD_FAVORITE_STORE':
      return {
        ...state,
        favoriteStores: [...state.favoriteStores, action.payload]
      };
    case 'REMOVE_FAVORITE_STORE':
      return {
        ...state,
        favoriteStores: state.favoriteStores.filter(id => id !== action.payload)
      };
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value
        }
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };
    case 'SET_SORT':
      return {
        ...state,
        sort: {
          field: action.payload.field,
          direction: action.payload.direction
        }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  stores: [],
  storeDetails: {},
  favoriteStores: [],
  filters: {
    category: '',
    featured: false,
    search: ''
  },
  sort: {
    field: 'popularity',
    direction: 'desc'
  },
  loading: false,
  error: null,
  lastFetched: null
};

// Mock data for initial development
const mockStores = [
  { 
    id: 1, 
    name: 'Amazon', 
    logo: 'https://logo.clearbit.com/amazon.com', 
    category: 'Electronics', 
    popularity: 95,
    featured: true,
    description: 'The world\'s largest online retailer offering a wide range of products.',
    website: 'https://www.amazon.com',
    cashbackRate: '5%',
    averageDiscount: '15%'
  },
  { 
    id: 2, 
    name: 'Walmart', 
    logo: 'https://logo.clearbit.com/walmart.com', 
    category: 'Retail', 
    popularity: 90,
    featured: true,
    description: 'Multinational retail corporation operating a chain of supercenters.',
    website: 'https://www.walmart.com',
    cashbackRate: '3%',
    averageDiscount: '10%'
  },
  { 
    id: 3, 
    name: 'Target', 
    logo: 'https://logo.clearbit.com/target.com', 
    category: 'Retail', 
    popularity: 88,
    featured: true,
    description: 'American retail corporation offering a wide range of products.',
    website: 'https://www.target.com',
    cashbackRate: '4%',
    averageDiscount: '12%'
  },
  { 
    id: 4, 
    name: 'Best Buy', 
    logo: 'https://logo.clearbit.com/bestbuy.com', 
    category: 'Electronics', 
    popularity: 85,
    featured: false,
    description: 'Multinational consumer electronics retailer.',
    website: 'https://www.bestbuy.com',
    cashbackRate: '2%',
    averageDiscount: '8%'
  },
  { 
    id: 5, 
    name: 'Nike', 
    logo: 'https://logo.clearbit.com/nike.com', 
    category: 'Fashion', 
    popularity: 92,
    featured: true,
    description: 'American multinational corporation engaged in the design, development, manufacturing, and worldwide marketing and sales of footwear, apparel, equipment, accessories, and services.',
    website: 'https://www.nike.com',
    cashbackRate: '8%',
    averageDiscount: '20%'
  },
  { 
    id: 6, 
    name: 'Adidas', 
    logo: 'https://logo.clearbit.com/adidas.com', 
    category: 'Fashion', 
    popularity: 87,
    featured: false,
    description: 'German multinational corporation that designs and manufactures shoes, clothing and accessories.',
    website: 'https://www.adidas.com',
    cashbackRate: '7%',
    averageDiscount: '18%'
  }
];

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const { api, isAuthenticated } = useContext(AuthContext);
  
  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Fetch all stores
  const fetchStores = useCallback(async (forceRefresh = false) => {
    // Check if we have stores and if they were fetched recently
    if (
      !forceRefresh &&
      state.stores.length > 0 &&
      state.lastFetched &&
      Date.now() - state.lastFetched < CACHE_DURATION
    ) {
      return state.stores;
    }

    dispatch({ type: 'FETCH_STORES_START' });

    try {
      // In a real app, this would be an API call
      // const response = await api.get('/stores');
      // const stores = response.data.data;
      
      // Using mock data for now
      const stores = mockStores;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ 
        type: 'FETCH_STORES_SUCCESS', 
        payload: stores 
      });
      
      return stores;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch stores';
      
      dispatch({ 
        type: 'FETCH_STORES_ERROR', 
        payload: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  }, [state.stores, state.lastFetched]);

  // Fetch a single store by ID
  const fetchStoreById = useCallback(async (id, forceRefresh = false) => {
    // Check if we have this store's details and if they were fetched recently
    if (
      !forceRefresh &&
      state.storeDetails[id] &&
      Date.now() - state.storeDetails[id].lastFetched < CACHE_DURATION
    ) {
      return state.storeDetails[id];
    }

    try {
      // In a real app, this would be an API call
      // const response = await api.get(`/stores/${id}`);
      // const storeDetails = response.data.data;
      
      // Using mock data for now
      const storeDetails = mockStores.find(store => store.id === parseInt(id));
      
      if (!storeDetails) {
        throw new Error('Store not found');
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ 
        type: 'FETCH_STORE_DETAILS_SUCCESS', 
        payload: storeDetails 
      });
      
      return storeDetails;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch store details';
      
      dispatch({ 
        type: 'FETCH_STORES_ERROR', 
        payload: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  }, [state.storeDetails]);

  // Add a store to favorites
  const addFavoriteStore = useCallback((storeId) => {
    if (state.favoriteStores.includes(storeId)) return;
    
    dispatch({ 
      type: 'ADD_FAVORITE_STORE', 
      payload: storeId 
    });
    
    // In a real app, you would also save this to the user's profile via API
    if (isAuthenticated) {
      // api.post('/users/favorites/stores', { storeId });
      console.log('Added store to favorites:', storeId);
    } else {
      // Save to localStorage for non-authenticated users
      const favorites = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
      localStorage.setItem('favoriteStores', JSON.stringify([...favorites, storeId]));
    }
  }, [state.favoriteStores, isAuthenticated]);

  // Remove a store from favorites
  const removeFavoriteStore = useCallback((storeId) => {
    if (!state.favoriteStores.includes(storeId)) return;
    
    dispatch({ 
      type: 'REMOVE_FAVORITE_STORE', 
      payload: storeId 
    });
    
    // In a real app, you would also remove this from the user's profile via API
    if (isAuthenticated) {
      // api.delete(`/users/favorites/stores/${storeId}`);
      console.log('Removed store from favorites:', storeId);
    } else {
      // Update localStorage for non-authenticated users
      const favorites = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
      localStorage.setItem(
        'favoriteStores', 
        JSON.stringify(favorites.filter(id => id !== storeId))
      );
    }
  }, [state.favoriteStores, isAuthenticated]);

  // Set a filter
  const setFilter = useCallback((key, value) => {
    dispatch({ 
      type: 'SET_FILTER', 
      payload: { key, value } 
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  // Set sort options
  const setSort = useCallback((field, direction = 'asc') => {
    dispatch({ 
      type: 'SET_SORT', 
      payload: { field, direction } 
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Get filtered and sorted stores
  const getFilteredStores = useCallback(() => {
    // Ensure state.stores is an array before spreading
    let result = Array.isArray(state.stores) ? [...state.stores] : [];
    
    // Apply filters - with additional safety checks
    if (state.filters && state.filters.category) {
      result = result.filter(store => 
        store && store.category === state.filters.category
      );
    }
    
    if (state.filters && state.filters.featured) {
      result = result.filter(store => 
        store && store.featured === true
      );
    }
    
    if (state.filters && state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      result = result.filter(store => 
        store && (
          (store.name && store.name.toLowerCase().includes(searchTerm)) ||
          (store.description && store.description.toLowerCase().includes(searchTerm)) ||
          (store.category && store.category.toLowerCase().includes(searchTerm))
        )
      );
    }
    
    // Apply sorting with safety checks
    if (state.sort && state.sort.field) {
      result.sort((a, b) => {
        // Ensure objects and fields exist
        if (!a || !b || a[state.sort.field] === undefined || b[state.sort.field] === undefined) {
          return 0;
        }
        
        if (a[state.sort.field] < b[state.sort.field]) {
          return state.sort.direction === 'asc' ? -1 : 1;
        }
        if (a[state.sort.field] > b[state.sort.field]) {
          return state.sort.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [state.stores, state.filters, state.sort]);

  // Get all available categories
  const getCategories = useCallback(() => {
    const categories = new Set();
    state.stores.forEach(store => {
      if (store.category) {
        categories.add(store.category);
      }
    });
    return Array.from(categories);
  }, [state.stores]);

  // Load favorite stores from localStorage on mount for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const favorites = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
      favorites.forEach(storeId => {
        dispatch({ 
          type: 'ADD_FAVORITE_STORE', 
          payload: storeId 
        });
      });
    }
  }, [isAuthenticated]);

  // Fetch stores on mount
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return (
    <StoreContext.Provider
      value={{
        // State
        stores: state.stores,
        storeDetails: state.storeDetails,
        favoriteStores: state.favoriteStores,
        filters: state.filters,
        sort: state.sort,
        loading: state.loading,
        error: state.error,
        
        // Actions
        fetchStores,
        fetchStoreById,
        addFavoriteStore,
        removeFavoriteStore,
        setFilter,
        clearFilters,
        setSort,
        clearError,
        
        // Computed values
        filteredStores: getFilteredStores(),
        categories: getCategories()
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};