import React, { useEffect } from 'react';

/**
 * HelmetSuppressor - Suppresses React Helmet warnings
 * 
 * This component specifically targets and suppresses the UNSAFE_componentWillMount
 * warnings from react-helmet-async's SideEffect(NullComponent).
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactNode} - The children
 */
const HelmetSuppressor = ({ children }) => {
  useEffect(() => {
    // Save original console methods
    const originalConsoleError = console.error;
    
    // Override console.error to filter out specific warnings
    console.error = (...args) => {
      // Check if this is a React warning about UNSAFE lifecycle methods
      const isUnsafeWarning = args[0] && 
        typeof args[0] === 'string' && 
        args[0].includes('Warning: Using UNSAFE_componentWillMount in strict mode');
      
      // Check if this is specifically about SideEffect(NullComponent)
      const isSideEffectWarning = isUnsafeWarning && 
        args.some(arg => typeof arg === 'string' && arg.includes('SideEffect(NullComponent)'));
      
      // If it's the specific warning we want to suppress, don't log it
      if (isSideEffectWarning) {
        return;
      }
      
      // Otherwise, pass through to the original console.error
      return originalConsoleError.apply(console, args);
    };
    
    // Restore original console methods on cleanup
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  
  return children;
};

export default HelmetSuppressor;