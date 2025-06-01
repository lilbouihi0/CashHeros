import React, { useEffect, useState, useRef } from 'react';
import SafeHelmet from './SafeHelmet';
import useDisableStrictMode from '../../hooks/useDisableStrictMode';

/**
 * HelmetWrapper - A modern wrapper for react-helmet-async
 * 
 * This component wraps the SafeHelmet component to avoid using deprecated lifecycle methods.
 * It uses hooks instead of class lifecycle methods and ensures that the component
 * only renders on the client side to avoid SSR issues.
 * 
 * @param {Object} props - The props to pass to the Helmet component
 * @returns {JSX.Element} - The wrapped Helmet component
 */
const HelmetWrapper = ({ children, ...props }) => {
  const [isClient, setIsClient] = useState(false);
  const isMountedRef = useRef(false);

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

  // Only render Helmet on the client side to avoid SSR issues
  if (!isClient) {
    return null;
  }

  // Use our SafeHelmet component instead of Helmet directly
  return <SafeHelmet {...props}>{children}</SafeHelmet>;
};

export default HelmetWrapper;