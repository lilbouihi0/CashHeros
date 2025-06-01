/**
 * Service Worker Registration
 * 
 * This module provides functions to register and unregister service workers
 * for offline capabilities and faster loading on subsequent visits.
 * 
 * Note: This is a simplified version that will work without additional dependencies.
 */

// Check if we're running on localhost
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' || // IPv6 localhost
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/) // IPv4 localhost
);

/**
 * Registers a service worker
 * @param {Object} config Configuration options
 * @param {Function} config.onUpdate Callback when a new service worker is installed
 * @param {Function} config.onSuccess Callback when service worker is successfully installed
 */
export function register(config) {
  // Only register in production and if service workers are supported
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    try {
      // Check if we're being served from the same origin
      const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        console.warn('Service worker won\'t work with different origins');
        return;
      }

      // Register the service worker when the page loads
      window.addEventListener('load', () => {
        try {
          const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;

          if (isLocalhost) {
            // On localhost, check if service worker still exists
            checkValidServiceWorker(swUrl, config);

            // Add some developer guidance
            navigator.serviceWorker.ready.then(() => {
              console.log('This web app is using a service worker for better performance and offline capabilities');
            });
          } else {
            // On production, just register the service worker
            registerValidSW(swUrl, config);
          }
        } catch (error) {
          console.warn('Error during service worker registration:', error);
        }
      });
    } catch (error) {
      console.warn('Error setting up service worker:', error);
    }
  } else {
    // Not registering service worker
    if (process.env.NODE_ENV !== 'production') {
      console.log('Service worker not registered in development mode');
    } else if (!('serviceWorker' in navigator)) {
      console.log('Service workers are not supported in this browser');
    }
  }
}

/**
 * Registers a valid service worker
 * @param {string} swUrl URL to the service worker file
 * @param {Object} config Configuration options
 */
function registerValidSW(swUrl, config) {
  try {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available
                console.log('New content is available and will be used when all tabs for this page are closed');

                // Execute callback
                if (config && config.onUpdate) {
                  config.onUpdate(registration);
                }
              } else {
                // Content is cached for offline use
                console.log('Content is cached for offline use');

                // Execute callback
                if (config && config.onSuccess) {
                  config.onSuccess(registration);
                }
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('Error during service worker registration:', error);
      });
  } catch (error) {
    console.warn('Error registering service worker:', error);
  }
}

/**
 * Checks if a service worker is valid
 * @param {string} swUrl URL to the service worker file
 * @param {Object} config Configuration options
 */
function checkValidServiceWorker(swUrl, config) {
  try {
    // Check if the service worker can be found
    fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    })
      .then((response) => {
        // Ensure service worker exists and is a JavaScript file
        const contentType = response.headers.get('content-type');
        if (
          response.status === 404 ||
          (contentType != null && contentType.indexOf('javascript') === -1)
        ) {
          // No service worker found - reload the page
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          // Service worker found - proceed as normal
          registerValidSW(swUrl, config);
        }
      })
      .catch(() => {
        console.log('No internet connection found. App is running in offline mode');
      });
  } catch (error) {
    console.warn('Error checking service worker:', error);
  }
}

/**
 * Unregisters the service worker
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Error unregistering service worker:', error);
      });
  }
}