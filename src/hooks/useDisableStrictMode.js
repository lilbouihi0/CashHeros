import { useEffect } from 'react';

/**
 * Hook to temporarily disable React's strict mode warnings
 * 
 * This is a workaround for third-party libraries that use deprecated lifecycle methods.
 * It should be used sparingly and only for components that cannot be updated.
 * 
 * @returns {void}
 */
const useDisableStrictMode = () => {
  useEffect(() => {
    // Save the original console.error
    const originalConsoleError = console.error;
    
    // Override console.error to filter out specific warnings
    console.error = (...args) => {
      // Filter out the UNSAFE_componentWillMount warning
      if (
        args[0] && 
        typeof args[0] === 'string' && 
        args[0].includes('Warning: Using UNSAFE_componentWillMount in strict mode')
      ) {
        return;
      }
      
      // Call the original console.error for other errors
      originalConsoleError.apply(console, args);
    };
    
    // Restore the original console.error when the component unmounts
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
};

export default useDisableStrictMode;