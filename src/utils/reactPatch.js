/**
 * React Development Mode Patch
 * 
 * This module patches React's development mode warning system to suppress specific warnings.
 * It should be imported as early as possible in the application.
 */

// Only apply in development mode
if (process.env.NODE_ENV === 'development') {
  try {
    // Try to get the React module
    const React = require('react');
    
    // Check if we can access the __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
    if (React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      const ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      
      // Check if we can access the console
      if (ReactSharedInternals.ReactDebugCurrentFrame) {
        // Save the original console.error
        const originalConsoleError = console.error;
        
        // Override console.error
        console.error = function filterWarnings(...args) {
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
        
        console.log('React development mode warning system patched successfully.');
      }
    }
  } catch (error) {
    console.warn('Failed to patch React development mode warning system:', error);
  }
}