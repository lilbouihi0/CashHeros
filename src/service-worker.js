/* eslint-disable no-restricted-globals */

// This service worker uses Workbox for better caching and offline capabilities
// https://developers.google.com/web/tools/workbox

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Workbox configuration
workbox.setConfig({
  debug: false // Set to true for debugging in development
});

// Cache names with versioning
const CACHE_VERSION = '2';
const CACHE_NAMES = {
  static: `static-cache-v${CACHE_VERSION}`,
  images: `images-cache-v${CACHE_VERSION}`,
  fonts: `fonts-cache-v${CACHE_VERSION}`,
  api: `api-cache-v${CACHE_VERSION}`,
  pages: `pages-cache-v${CACHE_VERSION}`,
  offline: `offline-cache-v${CACHE_VERSION}`
};

// Precache manifest will be injected by workbox-webpack-plugin
// This includes all the static assets needed for the app shell
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy
workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE_NAMES.fonts,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache the Google Fonts webfont files with a cache-first strategy for 1 year
workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAMES.fonts,
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

// Cache CSS and JS assets with a stale-while-revalidate strategy
workbox.routing.registerRoute(
  /\.(?:js|css)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache images with a cache-first strategy
workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache API requests with a network-first strategy
workbox.routing.registerRoute(
  /\/api\//,
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAMES.api,
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

// Cache pages with a network-first strategy
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAMES.pages,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 25,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Fallback to offline page if navigation fails
const offlineFallbackPage = '/offline.html';

// Precache the offline page
workbox.precaching.precacheAndRoute([
  { url: offlineFallbackPage, revision: CACHE_VERSION }
]);

// If navigation fails, show the offline page
workbox.routing.setCatchHandler(({ event }) => {
  if (event.request.mode === 'navigate') {
    return caches.match(offlineFallbackPage);
  }
  
  // If it's an image request, return a fallback image
  if (event.request.destination === 'image') {
    return caches.match('/logo192.png');
  }
  
  // Otherwise, return a generic error response
  return Response.error();
});

// Background sync for offline form submissions
workbox.backgroundSync.registerPlugin({
  name: 'forms-sync-queue',
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
  callbacks: {
    queueDidReplay: async (requests) => {
      // Notify the user that the form submissions have been sent
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC_COMPLETED',
            payload: {
              count: requests.length,
            },
          });
        });
      });
    },
  },
});

// Queue failed POST requests for background sync
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  async ({ event }) => {
    try {
      // Try to fetch normally first
      return await fetch(event.request.clone());
    } catch (error) {
      // If fetch fails, add to background sync queue
      const bgSyncPlugin = workbox.backgroundSync.getPlugin('forms-sync-queue');
      await bgSyncPlugin.pushRequest({ request: event.request });
      
      // Return a response to the user
      return new Response(JSON.stringify({
        offline: true,
        message: 'Your request has been saved and will be sent when you are back online.',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
  'POST'
);

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    // Clear all caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Periodic cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete caches that don't match our current version
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

// Activate event - claim clients and clean up old caches
self.addEventListener('activate', (event) => {
  // Claim clients to control all open tabs
  self.clients.claim();
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete caches that don't match our current version
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});