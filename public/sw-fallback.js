// Minimal fallback service worker
// This is a simple service worker that won't cause registration errors

console.log('[SW] Fallback service worker loaded');

// Basic install event
self.addEventListener('install', event => {
  console.log('[SW] Installing fallback service worker');
  self.skipWaiting();
});

// Basic activate event
self.addEventListener('activate', event => {
  console.log('[SW] Activating fallback service worker');
  self.clients.claim();
});

// Basic fetch event - just pass through
self.addEventListener('fetch', event => {
  // Don't intercept, just let requests go through normally
  return;
});