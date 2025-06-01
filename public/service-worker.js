/* eslint-disable no-restricted-globals */

// This is a simplified service worker that doesn't require workbox
// It provides basic caching and offline capabilities

// Cache names
const CACHE_NAME = 'cashheros-cache-v1';
const STATIC_CACHE_NAME = 'cashheros-static-v1';
const DYNAMIC_CACHE_NAME = 'cashheros-dynamic-v1';
const API_CACHE_NAME = 'cashheros-api-v1';

// Assets to cache immediately (App Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/js/vendors~main.chunk.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/static/css/main.chunk.css'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Claim clients to control all open tabs
  self.clients.claim();
  
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          // Delete old caches except the current ones
          if (
            key !== STATIC_CACHE_NAME && 
            key !== DYNAMIC_CACHE_NAME && 
            key !== API_CACHE_NAME
          ) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        }));
      })
  );
  
  return self.clients.claim();
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
            
            caches.open(DYNAMIC_CACHE_NAME)
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
      
      caches.open(API_CACHE_NAME)
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
          
          caches.open(DYNAMIC_CACHE_NAME)
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
          caches.open(DYNAMIC_CACHE_NAME)
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