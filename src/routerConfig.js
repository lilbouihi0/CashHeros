import { UNSAFE_enhanceManualRouteObjects } from 'react-router-dom';

// Set global future flags for React Router
// This is a direct approach to ensure the flags are set at the package level
window.__reactRouterFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};