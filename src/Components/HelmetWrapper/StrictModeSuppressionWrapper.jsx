import React, { useEffect } from 'react';

/**
 * StrictModeSuppressionWrapper - Suppresses React StrictMode warnings
 * 
 * This component temporarily suppresses React StrictMode warnings for its children.
 * It should be used sparingly and only for third-party components that cannot be updated.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactNode} - The children
 */
const StrictModeSuppressionWrapper = ({ children }) => {
  useEffect(() => {
    // Save original console methods
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Filter out specific warnings
    console.error = (...args) => {
      if (
        args[0] && 
        typeof args[0] === 'string' && 
        (
          args[0].includes('Warning: Using UNSAFE_componentWillMount') ||
          args[0].includes('Warning: Using UNSAFE_componentWillReceiveProps') ||
          args[0].includes('Warning: Using UNSAFE_componentWillUpdate')
        )
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args) => {
      if (
        args[0] && 
        typeof args[0] === 'string' && 
        (
          args[0].includes('Warning: Using UNSAFE_componentWillMount') ||
          args[0].includes('Warning: Using UNSAFE_componentWillReceiveProps') ||
          args[0].includes('Warning: Using UNSAFE_componentWillUpdate')
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

export default StrictModeSuppressionWrapper;