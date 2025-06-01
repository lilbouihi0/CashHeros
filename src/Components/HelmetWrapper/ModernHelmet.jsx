import React, { useEffect, useState, useRef } from 'react';
import SafeHelmet from './SafeHelmet';
import useDisableStrictMode from '../../hooks/useDisableStrictMode';

/**
 * ModernHelmet - A modern replacement for react-helmet-async
 * 
 * This component wraps the SafeHelmet component and uses the useDisableStrictMode hook
 * to suppress warnings about deprecated lifecycle methods. It also implements a
 * functional equivalent of the SideEffect pattern without using deprecated lifecycle methods.
 * 
 * @param {Object} props - The props to pass to the Helmet component
 * @returns {JSX.Element} - The wrapped Helmet component
 */
const ModernHelmet = (props) => {
  const [isClient, setIsClient] = useState(false);
  const mountedRef = useRef(false);
  
  // Use the hook to disable strict mode warnings
  useDisableStrictMode();
  
  // Use useEffect for initialization (equivalent to constructor/componentWillMount)
  useEffect(() => {
    // This runs once on mount, similar to componentWillMount but after DOM is available
    mountedRef.current = true;
    setIsClient(true);
    
    // Cleanup function (equivalent to componentWillUnmount)
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Only render on client side to avoid SSR issues
  if (!isClient) {
    return null;
  }
  
  // Use our SafeHelmet component instead of Helmet directly
  return <SafeHelmet {...props} />;
};

export default ModernHelmet;