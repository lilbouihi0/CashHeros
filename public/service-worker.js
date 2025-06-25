/* eslint-disable no-restricted-globals */

// Clean service worker without Workbox dependencies
// This provides basic caching without causing registration errors

console.log('[SW] Clean Service Worker loaded - v4');

// Cache names with versioning
const CACHE_VERSION = '4';
const STATIC_CACHE = `static-cache-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-v${CACHE_VERSION}`;
const API_CACHE = `api-cache-v${CACHE_VERSION}`;

// Basic assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(error => {
              console.warn(`[SW] Failed to cache ${asset}:`, error);
            })
          )
        );
      })
      .catch(error => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  self.clients.claim();
  
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // Handle navigation requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }
  
  // Handle image requests with cache-first strategy
  if (event.request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // Handle CSS and JS with stale-while-revalidate
  if (
    event.request.destination === 'style' || 
    event.request.destination === 'script'
  ) {
    event.respondWith(staleWhileRevalidateStrategy(event.request));
    return;
  }
  
  // Default: cache-first falling back to network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();
            
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // If both cache and network fail, return a fallback
            if (event.request.destination === 'image') {
              return caches.match('/logo192.png');
            }
            
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Network-first strategy for API requests
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      // Clone the response to store in cache
      const clonedResponse = response.clone();
      
      caches.open(API_CACHE)
        .then(cache => {
          cache.put(request, clonedResponse);
        });
      
      return response;
    })
    .catch(() => {
      return caches.match(request);
    });
}

// Cache-first strategy for images
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(response => {
      if (response) {
        return response;
      }
      
      return fetch(request)
        .then(networkResponse => {
          const responseToCache = networkResponse.clone();
          
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          
          return networkResponse;
        })
        .catch(() => {
          // Fallback for images
          return caches.match('/logo192.png');
        });
    });
}

// Stale-while-revalidate strategy for CSS/JS
function staleWhileRevalidateStrategy(request) {
  return caches.match(request)
    .then(cachedResponse => {
      // Return cached response immediately
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          // Update the cache with the new response
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(request, networkResponse.clone());
            });
          
          return networkResponse;
        });
      
      return cachedResponse || fetchPromise;
    });
}

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline operations
self.addEventListener('sync', event => {
  if (event.tag === 'sync-new-posts') {
    event.waitUntil(
      // Here you would implement logic to send cached requests
      // For now, just log that sync was attempted
      console.log('[Service Worker] Syncing new posts')
    );
  }
});