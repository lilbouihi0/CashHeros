import React, { useEffect } from 'react';

/**
 * DisableStrictMode - Disables React's strict mode warnings
 * 
 * This component temporarily disables React's strict mode warnings
 * for its children. It should be used sparingly and only for
 * third-party components that cannot be updated.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactNode} - The children
 */
const DisableStrictMode = ({ children }) => {
  useEffect(() => {
    // Save original console methods
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Override console.error to filter out strict mode warnings
    console.error = (...args) => {
      if (
        args[0] && 
        typeof args[0] === 'string' && 
        (
          args[0].includes('Warning: Using UNSAFE_componentWillMount in strict mode') ||
          args[0].includes('Warning: Using UNSAFE_componentWillReceiveProps in strict mode') ||
          args[0].includes('Warning: Using UNSAFE_componentWillUpdate in strict mode')
        )
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    // Override console.warn to filter out strict mode warnings
    console.warn = (...args) => {
      if (
        args[0] && 
        typeof args[0] === 'string' && 
        (
          args[0].includes('Warning: Using UNSAFE_componentWillMount in strict mode') ||
          args[0].includes('Warning: Using UNSAFE_componentWillReceiveProps in strict mode') ||
          args[0].includes('Warning: Using UNSAFE_componentWillUpdate in strict mode')
        )
      ) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };
    
    // Restore original console methods on cleanup
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  return children;
};

export default DisableStrictMode;