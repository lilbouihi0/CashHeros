import { createBrowserRouter } from 'react-router-dom';
import App from './App';

/**
 * Create a router with React Router v7 future flags enabled
 * 
 * This configuration enables the following future flags:
 * - v7_startTransition: Wraps state updates in React.startTransition for better performance
 * - v7_relativeSplatPath: Changes how relative paths are resolved within splat routes
 * 
 * For more information, see: https://reactrouter.com/v6/upgrading/future
 */
export const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});