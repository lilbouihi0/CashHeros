import React, { useEffect, useRef } from 'react';

/**
 * SideEffectWrapper - A modern replacement for SideEffect(NullComponent)
 * 
 * This component implements the same functionality as SideEffect but uses
 * modern React hooks instead of deprecated lifecycle methods.
 * 
 * @param {Object} props - The component props
 * @param {Function} props.reducePropsToState - Function to reduce props to state
 * @param {Function} props.handleStateChangeOnClient - Function to handle state changes
 * @param {React.ReactNode} props.children - Child components
 * @returns {null} - This component doesn't render anything
 */
const SideEffectWrapper = ({ reducePropsToState, handleStateChangeOnClient, children }) => {
  const mountedInstancesRef = useRef([]);
  
  useEffect(() => {
    // Add instance to mounted instances
    mountedInstancesRef.current.push(children);
    
    // Handle state change
    handleStateChangeOnClient(reducePropsToState(mountedInstancesRef.current));
    
    // Cleanup on unmount
    return () => {
      const index = mountedInstancesRef.current.indexOf(children);
      mountedInstancesRef.current.splice(index, 1);
      handleStateChangeOnClient(reducePropsToState(mountedInstancesRef.current));
    };
  }, [children, handleStateChangeOnClient, reducePropsToState]);
  
  return null;
};

export default SideEffectWrapper;