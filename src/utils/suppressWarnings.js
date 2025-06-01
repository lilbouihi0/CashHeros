/**
 * Utility to suppress specific React warnings
 * 
 * This module patches React's warning system to suppress specific warnings.
 * It should be imported as early as possible in the application.
 */

// Save the original console.error function
const originalConsoleError = console.error;

// Override console.error to filter out specific warnings
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

// Export a function to restore the original console.error if needed
export function restoreConsoleError() {
  console.error = originalConsoleError;
}