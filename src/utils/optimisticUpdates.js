/**
 * Optimistic Updates Utility
 * 
 * This utility provides functions for implementing optimistic UI updates
 * to improve perceived performance.
 */

/**
 * Generate a temporary ID for optimistic updates
 * 
 * @param {string} prefix - Prefix for the temporary ID
 * @returns {string} - A unique temporary ID
 */
export const generateTempId = (prefix = 'temp') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create an optimistic update handler for a React reducer
 * 
 * @param {Function} dispatch - The dispatch function from useReducer
 * @param {Object} options - Options for the optimistic update
 * @returns {Function} - Function to perform optimistic update
 */
export const createOptimisticHandler = (dispatch, options = {}) => {
  const {
    startAction,
    successAction,
    errorAction,
    getOptimisticData,
    apiCall,
    onSuccess,
    onError
  } = options;

  return async (...args) => {
    // Generate a unique operation ID
    const operationId = generateTempId('op');
    
    // Get optimistic data
    const optimisticData = getOptimisticData ? getOptimisticData(...args) : null;
    
    // Dispatch start action with optimistic data
    if (startAction) {
      dispatch({
        type: startAction,
        payload: {
          ...optimisticData,
          operationId
        }
      });
    }
    
    try {
      // Make the actual API call
      const result = await apiCall(...args);
      
      // Dispatch success action
      if (successAction) {
        dispatch({
          type: successAction,
          payload: {
            data: result,
            operationId
          }
        });
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result, ...args);
      }
      
      return result;
    } catch (error) {
      // Dispatch error action
      if (errorAction) {
        dispatch({
          type: errorAction,
          payload: {
            error,
            operationId,
            originalArgs: args
          }
        });
      }
      
      // Call error callback if provided
      if (onError) {
        onError(error, ...args);
      }
      
      throw error;
    }
  };
};

/**
 * Create optimistic CRUD handlers for a collection
 * 
 * @param {Function} dispatch - The dispatch function from useReducer
 * @param {Object} actions - Action types for CRUD operations
 * @param {Object} api - API functions for CRUD operations
 * @param {Function} getItemId - Function to get item ID
 * @returns {Object} - CRUD handlers with optimistic updates
 */
export const createOptimisticCrud = (
  dispatch,
  actions,
  api,
  getItemId = (item) => item.id
) => {
  // Create handler
  const create = createOptimisticHandler(dispatch, {
    startAction: actions.CREATE_OPTIMISTIC,
    successAction: actions.CREATE_SUCCESS,
    errorAction: actions.CREATE_ERROR,
    getOptimisticData: (item) => ({
      item: { ...item, id: generateTempId('item') },
      tempId: generateTempId('item')
    }),
    apiCall: api.create
  });
  
  // Update handler
  const update = createOptimisticHandler(dispatch, {
    startAction: actions.UPDATE_OPTIMISTIC,
    successAction: actions.UPDATE_SUCCESS,
    errorAction: actions.UPDATE_ERROR,
    getOptimisticData: (id, updates) => ({
      id,
      updates
    }),
    apiCall: api.update
  });
  
  // Delete handler
  const remove = createOptimisticHandler(dispatch, {
    startAction: actions.DELETE_OPTIMISTIC,
    successAction: actions.DELETE_SUCCESS,
    errorAction: actions.DELETE_ERROR,
    getOptimisticData: (id) => ({ id }),
    apiCall: api.delete
  });
  
  return {
    create,
    update,
    remove
  };
};

/**
 * Apply optimistic updates to an array of items
 * 
 * @param {Array} items - The original array of items
 * @param {Object} update - The update to apply
 * @param {Function} getItemId - Function to get item ID
 * @returns {Array} - Updated array of items
 */
export const applyOptimisticUpdate = (
  items,
  update,
  getItemId = (item) => item.id
) => {
  const { type, payload } = update;
  
  switch (type) {
    case 'ADD':
      return [...items, payload.item];
    
    case 'UPDATE':
      return items.map(item => 
        getItemId(item) === payload.id
          ? { ...item, ...payload.updates }
          : item
      );
    
    case 'REMOVE':
      return items.filter(item => 
        getItemId(item) !== payload.id
      );
    
    case 'REPLACE_TEMP':
      return items.map(item => 
        getItemId(item) === payload.tempId
          ? { ...payload.item }
          : item
      );
    
    default:
      return items;
  }
};

/**
 * Track pending operations for optimistic updates
 */
export class PendingOperationsTracker {
  constructor() {
    this.operations = new Map();
  }
  
  /**
   * Add a pending operation
   * 
   * @param {string} id - Operation ID
   * @param {Object} data - Operation data
   */
  add(id, data) {
    this.operations.set(id, {
      ...data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Remove a pending operation
   * 
   * @param {string} id - Operation ID
   * @returns {Object|null} - The removed operation data
   */
  remove(id) {
    const operation = this.operations.get(id);
    if (operation) {
      this.operations.delete(id);
      return operation;
    }
    return null;
  }
  
  /**
   * Get a pending operation
   * 
   * @param {string} id - Operation ID
   * @returns {Object|null} - The operation data
   */
  get(id) {
    return this.operations.get(id) || null;
  }
  
  /**
   * Check if an operation is pending
   * 
   * @param {string} id - Operation ID
   * @returns {boolean} - Whether the operation is pending
   */
  isPending(id) {
    return this.operations.has(id);
  }
  
  /**
   * Get all pending operations
   * 
   * @returns {Array} - Array of pending operations
   */
  getAll() {
    return Array.from(this.operations.values());
  }
  
  /**
   * Clear all pending operations
   */
  clear() {
    this.operations.clear();
  }
}

export default {
  generateTempId,
  createOptimisticHandler,
  createOptimisticCrud,
  applyOptimisticUpdate,
  PendingOperationsTracker
};