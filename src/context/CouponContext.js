// src/context/CouponContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useReducer } from 'react';
import { AuthContext } from './AuthContext';

// Create a context
export const CouponContext = createContext();

// Custom hook for using the coupon context
export const useCoupon = () => useContext(CouponContext);

// Coupon reducer for more predictable state updates
const couponReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_COUPONS_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_COUPONS_SUCCESS':
      return {
        ...state,
        coupons: action.payload,
        loading: false,
        error: null,
        lastFetched: Date.now()
      };
    case 'FETCH_COUPONS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'FETCH_COUPON_DETAILS_SUCCESS':
      return {
        ...state,
        couponDetails: {
          ...state.couponDetails,
          [action.payload.id]: {
            ...action.payload,
            lastFetched: Date.now()
          }
        }
      };
    case 'SAVE_COUPON':
      return {
        ...state,
        savedCoupons: [...state.savedCoupons, action.payload]
      };
    case 'UNSAVE_COUPON':
      return {
        ...state,
        savedCoupons: state.savedCoupons.filter(id => id !== action.payload)
      };
    case 'TRACK_COUPON_USAGE':
      return {
        ...state,
        usedCoupons: [...state.usedCoupons, {
          couponId: action.payload.couponId,
          timestamp: action.payload.timestamp || Date.now()
        }]
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
    case 'OPTIMISTIC_ADD_COUPON':
      return {
        ...state,
        coupons: [...state.coupons, { ...action.payload, id: `temp_${Date.now()}` }],
        pendingOperations: [...state.pendingOperations, {
          type: 'add',
          id: action.payload.tempId,
          data: action.payload
        }]
      };
    case 'CONFIRM_ADD_COUPON':
      return {
        ...state,
        coupons: state.coupons.map(coupon => 
          coupon.id === action.payload.tempId ? { ...action.payload.coupon } : coupon
        ),
        pendingOperations: state.pendingOperations.filter(op => 
          !(op.type === 'add' && op.id === action.payload.tempId)
        )
      };
    case 'REVERT_ADD_COUPON':
      return {
        ...state,
        coupons: state.coupons.filter(coupon => coupon.id !== action.payload.tempId),
        pendingOperations: state.pendingOperations.filter(op => 
          !(op.type === 'add' && op.id === action.payload.tempId)
        )
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  coupons: [],
  couponDetails: {},
  savedCoupons: [],
  usedCoupons: [],
  filters: {
    category: '',
    brand: '',
    expiryDate: null,
    search: ''
  },
  sort: {
    field: 'expiryDate',
    direction: 'asc'
  },
  loading: false,
  error: null,
  lastFetched: null,
  pendingOperations: []
};

// Mock data for initial development
const mockCoupons = [
  { 
    id: 1, 
    brand: 'Amazon', 
    title: '10% Off Sitewide', 
    code: 'AMAZON10', 
    expiryDate: '2024-12-31', 
    category: 'Electronics',
    description: 'Get 10% off your entire purchase at Amazon.',
    terms: 'Valid on all purchases. Exclusions may apply.',
    url: 'https://www.amazon.com',
    success_rate: 95,
    verified: true
  },
  { 
    id: 2, 
    brand: 'Walmart', 
    title: '15% Off Electronics', 
    code: 'WLMRT15', 
    expiryDate: '2024-11-30', 
    category: 'Electronics',
    description: 'Save 15% on electronics at Walmart.',
    terms: 'Valid on electronics only. Exclusions may apply.',
    url: 'https://www.walmart.com',
    success_rate: 90,
    verified: true
  },
  { 
    id: 3, 
    brand: 'Target', 
    title: '20% Off Home Goods', 
    code: 'TARGET20', 
    expiryDate: '2024-10-15', 
    category: 'Home',
    description: 'Save 20% on home goods at Target.',
    terms: 'Valid on home goods only. Exclusions may apply.',
    url: 'https://www.target.com',
    success_rate: 88,
    verified: true
  },
  { 
    id: 4, 
    brand: 'Best Buy', 
    title: '25% Off Laptops', 
    code: 'BESTBUY25', 
    expiryDate: '2024-09-30', 
    category: 'Electronics',
    description: 'Save 25% on laptops at Best Buy.',
    terms: 'Valid on select laptops only. Exclusions may apply.',
    url: 'https://www.bestbuy.com',
    success_rate: 85,
    verified: true
  },
  { 
    id: 5, 
    brand: 'Nike', 
    title: '30% Off Footwear', 
    code: 'NIKE30', 
    expiryDate: '2024-08-31', 
    category: 'Fashion',
    description: 'Save 30% on footwear at Nike.',
    terms: 'Valid on footwear only. Exclusions may apply.',
    url: 'https://www.nike.com',
    success_rate: 92,
    verified: true
  },
  { 
    id: 6, 
    brand: 'Adidas', 
    title: '20% Off Apparel', 
    code: 'ADIDAS20', 
    expiryDate: '2024-12-15', 
    category: 'Fashion',
    description: 'Save 20% on apparel at Adidas.',
    terms: 'Valid on apparel only. Exclusions may apply.',
    url: 'https://www.adidas.com',
    success_rate: 87,
    verified: true
  },
  { 
    id: 7, 
    brand: 'Apple', 
    title: '10% Off Accessories', 
    code: 'APPLE10', 
    expiryDate: '2024-11-20', 
    category: 'Electronics',
    description: 'Save 10% on accessories at Apple.',
    terms: 'Valid on accessories only. Exclusions may apply.',
    url: 'https://www.apple.com',
    success_rate: 94,
    verified: true
  },
  { 
    id: 8, 
    brand: 'Sephora', 
    title: '15% Off Makeup', 
    code: 'SEPHORA15', 
    expiryDate: '2024-10-10', 
    category: 'Beauty',
    description: 'Save 15% on makeup at Sephora.',
    terms: 'Valid on makeup only. Exclusions may apply.',
    url: 'https://www.sephora.com',
    success_rate: 89,
    verified: true
  }
];

export const CouponProvider = ({ children }) => {
  const [state, dispatch] = useReducer(couponReducer, initialState);
  const { api, isAuthenticated } = useContext(AuthContext);
  
  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Fetch all coupons
  const fetchCoupons = useCallback(async (forceRefresh = false) => {
    // Check if we have coupons and if they were fetched recently
    if (
      !forceRefresh &&
      state.coupons.length > 0 &&
      state.lastFetched &&
      Date.now() - state.lastFetched < CACHE_DURATION
    ) {
      return state.coupons;
    }

    dispatch({ type: 'FETCH_COUPONS_START' });

    try {
      // In a real app, this would be an API call
      // const response = await api.get('/coupons');
      // const coupons = response.data.data;
      
      // Using mock data for now
      const coupons = mockCoupons;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ 
        type: 'FETCH_COUPONS_SUCCESS', 
        payload: coupons 
      });
      
      return coupons;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch coupons';
      
      dispatch({ 
        type: 'FETCH_COUPONS_ERROR', 
        payload: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  }, [state.coupons, state.lastFetched]);

  // Fetch a single coupon by ID
  const fetchCouponById = useCallback(async (id, forceRefresh = false) => {
    // Check if we have this coupon's details and if they were fetched recently
    if (
      !forceRefresh &&
      state.couponDetails[id] &&
      Date.now() - state.couponDetails[id].lastFetched < CACHE_DURATION
    ) {
      return state.couponDetails[id];
    }

    try {
      // In a real app, this would be an API call
      // const response = await api.get(`/coupons/${id}`);
      // const couponDetails = response.data.data;
      
      // Using mock data for now
      const couponDetails = mockCoupons.find(coupon => coupon.id === parseInt(id));
      
      if (!couponDetails) {
        throw new Error('Coupon not found');
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ 
        type: 'FETCH_COUPON_DETAILS_SUCCESS', 
        payload: couponDetails 
      });
      
      return couponDetails;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch coupon details';
      
      dispatch({ 
        type: 'FETCH_COUPONS_ERROR', 
        payload: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  }, [state.couponDetails]);

  // Save a coupon
  const saveCoupon = useCallback((couponId) => {
    if (state.savedCoupons.includes(couponId)) return;
    
    dispatch({ 
      type: 'SAVE_COUPON', 
      payload: couponId 
    });
    
    // In a real app, you would also save this to the user's profile via API
    if (isAuthenticated) {
      // api.post('/users/saved/coupons', { couponId });
      console.log('Saved coupon:', couponId);
    } else {
      // Save to localStorage for non-authenticated users
      const saved = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
      localStorage.setItem('savedCoupons', JSON.stringify([...saved, couponId]));
    }
  }, [state.savedCoupons, isAuthenticated]);

  // Unsave a coupon
  const unsaveCoupon = useCallback((couponId) => {
    if (!state.savedCoupons.includes(couponId)) return;
    
    dispatch({ 
      type: 'UNSAVE_COUPON', 
      payload: couponId 
    });
    
    // In a real app, you would also remove this from the user's profile via API
    if (isAuthenticated) {
      // api.delete(`/users/saved/coupons/${couponId}`);
      console.log('Unsaved coupon:', couponId);
    } else {
      // Update localStorage for non-authenticated users
      const saved = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
      localStorage.setItem(
        'savedCoupons', 
        JSON.stringify(saved.filter(id => id !== couponId))
      );
    }
  }, [state.savedCoupons, isAuthenticated]);

  // Track coupon usage
  const trackCouponUsage = useCallback((couponId) => {
    dispatch({ 
      type: 'TRACK_COUPON_USAGE', 
      payload: { couponId } 
    });
    
    // In a real app, you would also track this via API
    if (isAuthenticated) {
      // api.post('/coupons/track', { couponId });
      console.log('Tracked coupon usage:', couponId);
    } else {
      // Save to localStorage for non-authenticated users
      const used = JSON.parse(localStorage.getItem('usedCoupons') || '[]');
      localStorage.setItem('usedCoupons', JSON.stringify([
        ...used, 
        { couponId, timestamp: Date.now() }
      ]));
    }
  }, [isAuthenticated]);

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

  // Add a new coupon with optimistic update
  const addCoupon = useCallback(async (couponData) => {
    const tempId = `temp_${Date.now()}`;
    
    // Optimistically update the UI
    dispatch({
      type: 'OPTIMISTIC_ADD_COUPON',
      payload: {
        ...couponData,
        tempId
      }
    });
    
    try {
      // In a real app, this would be an API call
      // const response = await api.post('/coupons', couponData);
      // const newCoupon = response.data.data;
      
      // Simulate API delay and response
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newCoupon = {
        ...couponData,
        id: Math.max(...mockCoupons.map(c => c.id)) + 1,
        verified: false,
        success_rate: 0
      };
      
      // Update the state with the real coupon data
      dispatch({
        type: 'CONFIRM_ADD_COUPON',
        payload: {
          tempId,
          coupon: newCoupon
        }
      });
      
      return newCoupon;
    } catch (error) {
      // Revert the optimistic update
      dispatch({
        type: 'REVERT_ADD_COUPON',
        payload: { tempId }
      });
      
      const errorMessage = error.response?.data?.message || 'Failed to add coupon';
      throw new Error(errorMessage);
    }
  }, []);

  // Get filtered and sorted coupons
  const getFilteredCoupons = useCallback(() => {
    let result = [...state.coupons];
    
    // Apply filters
    if (state.filters.category) {
      result = result.filter(coupon => 
        coupon.category === state.filters.category
      );
    }
    
    if (state.filters.brand) {
      result = result.filter(coupon => 
        coupon.brand === state.filters.brand
      );
    }
    
    if (state.filters.expiryDate) {
      const today = new Date();
      const expiryDate = new Date(state.filters.expiryDate);
      
      result = result.filter(coupon => {
        const couponExpiry = new Date(coupon.expiryDate);
        return couponExpiry <= expiryDate;
      });
    }
    
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      result = result.filter(coupon => 
        coupon.title.toLowerCase().includes(searchTerm) ||
        coupon.brand.toLowerCase().includes(searchTerm) ||
        coupon.description?.toLowerCase().includes(searchTerm) ||
        coupon.category.toLowerCase().includes(searchTerm) ||
        coupon.code.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (state.sort.field === 'expiryDate') {
        const dateA = new Date(a.expiryDate);
        const dateB = new Date(b.expiryDate);
        return state.sort.direction === 'asc' 
          ? dateA - dateB 
          : dateB - dateA;
      }
      
      if (a[state.sort.field] < b[state.sort.field]) {
        return state.sort.direction === 'asc' ? -1 : 1;
      }
      if (a[state.sort.field] > b[state.sort.field]) {
        return state.sort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return result;
  }, [state.coupons, state.filters, state.sort]);

  // Get all available categories
  const getCategories = useCallback(() => {
    const categories = new Set();
    state.coupons.forEach(coupon => {
      if (coupon.category) {
        categories.add(coupon.category);
      }
    });
    return Array.from(categories);
  }, [state.coupons]);

  // Get all available brands
  const getBrands = useCallback(() => {
    const brands = new Set();
    state.coupons.forEach(coupon => {
      if (coupon.brand) {
        brands.add(coupon.brand);
      }
    });
    return Array.from(brands);
  }, [state.coupons]);

  // Load saved coupons from localStorage on mount for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const saved = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
      saved.forEach(couponId => {
        dispatch({ 
          type: 'SAVE_COUPON', 
          payload: couponId 
        });
      });
      
      const used = JSON.parse(localStorage.getItem('usedCoupons') || '[]');
      used.forEach(usage => {
        dispatch({ 
          type: 'TRACK_COUPON_USAGE', 
          payload: usage 
        });
      });
    }
  }, [isAuthenticated]);

  // Fetch coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return (
    <CouponContext.Provider
      value={{
        // State
        coupons: state.coupons,
        couponDetails: state.couponDetails,
        savedCoupons: state.savedCoupons,
        usedCoupons: state.usedCoupons,
        filters: state.filters,
        sort: state.sort,
        loading: state.loading,
        error: state.error,
        
        // Actions
        fetchCoupons,
        fetchCouponById,
        saveCoupon,
        unsaveCoupon,
        trackCouponUsage,
        setFilter,
        clearFilters,
        setSort,
        clearError,
        addCoupon,
        
        // Computed values
        filteredCoupons: getFilteredCoupons(),
        categories: getCategories(),
        brands: getBrands()
      }}
    >
      {children}
    </CouponContext.Provider>
  );
};