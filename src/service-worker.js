/* eslint-disable no-restricted-globals */

// Import Workbox modules using importScripts for better compatibility
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');

console.log('[SW] Workbox Service Worker loaded - v3');

// Check if workbox loaded successfully
if (workbox) {
  console.log('[SW] Workbox is loaded');
  
  // Enable workbox logging in development
  // __DEV__ is replaced at build time by most bundlers, or you can use a comment to instruct replacement
  // Remove process.env.NODE_ENV usage for browser compatibility
  // if (process.env.NODE_ENV === 'development') {
  //   workbox.setConfig({ debug: true });
  // }
  // Default: do not enable debug in service worker

  // Clean up outdated caches
  workbox.precaching.cleanupOutdatedCaches();

  // Precache all static assets
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

  // Cache images with CacheFirst strategy, but exclude placeholder and proxy images
  workbox.routing.registerRoute(
    ({ request }) => {
      const isImage = request.destination === 'image';
      const isPlaceholder = request.url.includes('via.placeholder.com') || 
                           request.url.includes('placehold.co') || 
                           request.url.includes('dummyimage.com') ||
                           request.url.includes('placeholder');
      const isProxyImage = request.url.includes('/api/proxy-image') || 
                          request.url.includes('proxy-image');
      return isImage && !isPlaceholder && !isProxyImage;
    },
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache-v3',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Handle proxy images with NetworkFirst strategy to avoid caching issues
  workbox.routing.registerRoute(
    ({ request, url }) => {
      const isImage = request.destination === 'image';
      const isProxyImage = url.pathname.includes('/api/proxy-image') || 
                          url.pathname.includes('proxy-image');
      return isImage && isProxyImage;
    },
    new workbox.strategies.NetworkFirst({
      cacheName: 'proxy-images-cache-v3',
      networkTimeoutSeconds: 10,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 5 * 60, // 5 minutes - short cache for proxy images
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Cache CSS and JS files with StaleWhileRevalidate
  workbox.routing.registerRoute(
    ({ request }) => 
      request.destination === 'style' || 
      request.destination === 'script',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources-v3',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // Cache API requests with NetworkFirst strategy (only same-origin)
  workbox.routing.registerRoute(
    ({ url }) => {
      // Only cache same-origin API requests
      const isApiRequest = url.pathname.startsWith('/api/');
      const isSameOrigin = url.origin === self.location.origin;
      return isApiRequest && isSameOrigin;
    },
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache-v3',
      networkTimeoutSeconds: 10,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Cache Google Fonts stylesheets
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets-v3',
    })
  );

  // Cache Google Fonts webfont files
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts-v3',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Handle navigation requests (SPA routing)
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages-cache-v3',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

} else {
  console.log('[SW] Workbox failed to load');
}

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Basic background sync for offline operations
self.addEventListener('sync', event => {
  if (event.tag === 'sync-new-posts') {
    event.waitUntil(
      // Here you would implement logic to send cached requests
      // For now, just log that sync was attempted
      console.log('[Service Worker] Syncing new posts')
    );
  }
});

// Force immediate activation
self.addEventListener('install', event => {
  console.log('[SW] Installing new version...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating new version...');
  self.clients.claim();
});

console.log('[SW] Workbox Service Worker setup complete - v3');