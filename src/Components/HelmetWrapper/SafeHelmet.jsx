import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SafeHelmet - A safe wrapper for react-helmet-async
 * 
 * This component wraps the Helmet component from react-helmet-async to avoid
 * using deprecated lifecycle methods. It uses hooks instead of class lifecycle methods
 * and ensures that the component only renders on the client side.
 * 
 * @param {Object} props - The props to pass to the Helmet component
 * @returns {JSX.Element|null} - The wrapped Helmet component or null if not mounted
 */
const SafeHelmet = (props) => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Use useEffect to ensure side effects only happen after mount
  useEffect(() => {
    // Set mounted state to true
    setIsMounted(true);
    
    // Clean up on unmount
    return () => {
      setIsMounted(false);
    };
  }, []);
  
  // Only render Helmet after the component has mounted
  if (!isMounted) {
    return null;
  }
  
  return <Helmet {...props} />;
};

export default SafeHelmet;