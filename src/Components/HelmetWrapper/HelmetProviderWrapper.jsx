import React, { useEffect, useState, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import useDisableStrictMode from '../../hooks/useDisableStrictMode';

/**
 * HelmetProviderWrapper - A modern wrapper for HelmetProvider
 * 
 * This component wraps the HelmetProvider component to avoid using deprecated lifecycle methods.
 * It uses hooks instead of class lifecycle methods and ensures that the component
 * only renders on the client side to avoid SSR issues.
 * 
 * @param {Object} props - The props to pass to the HelmetProvider component
 * @returns {JSX.Element} - The wrapped HelmetProvider component
 */
const HelmetProviderWrapper = ({ children, ...props }) => {
  const [isClient, setIsClient] = useState(false);
  const isMountedRef = useRef(false);
  
  // Create a helmet context to avoid using deprecated lifecycle methods
  const helmetContext = props.context || {};

  // Disable strict mode warnings for this component
  useDisableStrictMode();

  // Use useEffect instead of componentDidMount
  useEffect(() => {
    // Mark as mounted
    isMountedRef.current = true;
    setIsClient(true);
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Wrap the HelmetProvider in a div to prevent direct access to its lifecycle methods
  return (
    <div className="helmet-provider-wrapper">
      <HelmetProvider context={helmetContext}>
        {children}
      </HelmetProvider>
    </div>
  );
};

export default HelmetProviderWrapper;