// Import warning suppression utilities first
import './utils/suppressWarnings';
import './utils/reactPatch';
// Import the new helmet async patch
import './utils/helmetAsyncPatch';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Import our color variables and theme
import './styles/colors.css';
import './styles/theme.css';
import './styles/cashheros-theme.css';
// Import router configuration first to set global flags
import './routerConfig';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from './appRouter';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './Components/ErrorBoundary';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// Import i18n configuration
import './services/i18n';
// Import our custom wrappers
import HelmetProviderWrapper from './Components/HelmetWrapper/HelmetProviderWrapper';
import StrictModeSuppressionWrapper from './Components/HelmetWrapper/StrictModeSuppressionWrapper';
import DisableStrictMode from './Components/HelmetWrapper/DisableStrictMode';
import HelmetSuppressor from './Components/HelmetWrapper/HelmetSuppressor';

// Create a helmet context to avoid using deprecated lifecycle methods
const helmetContext = {};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetSuppressor>
      <DisableStrictMode>
        <StrictModeSuppressionWrapper>
          <HelmetProviderWrapper context={helmetContext}>
            <ErrorBoundary>
              <AuthProvider>
                <DataProvider>
                  <RouterProvider router={appRouter} />
                </DataProvider>
              </AuthProvider>
            </ErrorBoundary>
          </HelmetProviderWrapper>
        </StrictModeSuppressionWrapper>
      </DisableStrictMode>
    </HelmetSuppressor>
  </React.StrictMode>
);

// Register service worker with enhanced options
serviceWorkerRegistration.register({
  onUpdate: registration => {
    // New content is available
    console.log('New content is available. Please refresh the page.');
    
    // Dispatch event for the app to show update notification
    const updateEvent = new CustomEvent('serviceWorkerUpdate', {
      detail: registration
    });
    window.dispatchEvent(updateEvent);
  },
  onSuccess: registration => {
    // Content is cached for offline use
    console.log('Content is cached for offline use.');
    
    // Register for periodic sync if supported
    if (registration && 'periodicSync' in registration) {
      try {
        registration.periodicSync.register('cache-cleanup', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        });
      } catch (error) {
        console.log('Periodic Sync could not be registered:', error);
      }
    }
    
    // Notify user that the app is ready for offline use
    if (!localStorage.getItem('offlineNotificationShown')) {
      const offlineEvent = new CustomEvent('offlineReady');
      window.dispatchEvent(offlineEvent);
      localStorage.setItem('offlineNotificationShown', 'true');
    }
  }
});

// Measure performance
reportWebVitals();