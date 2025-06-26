/* eslint-disable no-restricted-globals */

// Import Workbox modules using importScripts for better compatibility
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');

console.log('[SW] Workbox Service Worker loaded');

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
  workbox.precaching.precacheAndRoute([{"revision":"a4e2271d19eb1f6f93a15e1b7a4e74dd","url":"404.html"},{"revision":"c92b85a5b907c70211f4ec25e29a8c4a","url":"favicon.ico"},{"revision":"e05f6f56ec890d0dab3fc3adf372887a","url":"index.html"},{"revision":"6722474ebd8e813916bfa52b73193a35","url":"offline.html"},{"revision":"49cd1eec51b0eba05454f9bfedab9601","url":"static/css/18.6710037a.chunk.css"},{"revision":"3ea6a89f2229a4df375f1c5124d55469","url":"static/css/556.9e019697.chunk.css"},{"revision":"0eb7cd77e7860d41f9a834827a441e17","url":"static/css/751.69e13a1a.chunk.css"},{"revision":"0a122c3d0a0a5c60dcd28c7b650f6cc0","url":"static/css/850.e3a96202.chunk.css"},{"revision":"97a939c13dd4b8aeb762bd0c3935c109","url":"static/css/858.45d869fe.chunk.css"},{"revision":"ed87fe7d31bafadb99537d5d49f7e919","url":"static/css/864.99428707.chunk.css"},{"revision":"de9b7eb993f10956ffbefae6132616cf","url":"static/css/865.15ae8c27.chunk.css"},{"revision":"f6b036704350c6a1c5bb74e5cf2286cf","url":"static/css/911.a5c115b8.chunk.css"},{"revision":"f7b329cbd6ddcf2817a6d606bc82b977","url":"static/css/985.6cd6c6d1.chunk.css"},{"revision":"f99ee398f673621cb4f8d8bfff1d5d04","url":"static/css/about-page.d42fac59.chunk.css"},{"revision":"eeb1b6e36859b6a104e37abf5dfc336a","url":"static/css/account-page.2541f2ad.chunk.css"},{"revision":"7f14610d5321d58c81cb7d9bf576b0ca","url":"static/css/admin-dashboard.560110a9.chunk.css"},{"revision":"126a744aff18c1f748a02b9557e89d24","url":"static/css/admin-login.3990562d.chunk.css"},{"revision":"5b25b6926faf327ebc0a1bc4933ac3a9","url":"static/css/blog-page.5b659f69.chunk.css"},{"revision":"54540adf661ae002703139f5bffafe2b","url":"static/css/careers-page.2444854a.chunk.css"},{"revision":"8e7cce574e9299269c3ce396d708ae69","url":"static/css/cashback-page.1c26f447.chunk.css"},{"revision":"9b990ec52d7e4587c6945368e7a19298","url":"static/css/category-page.baf67253.chunk.css"},{"revision":"03008dd18a8a1bf5bded47a4d2410148","url":"static/css/coupons-page.350d03c0.chunk.css"},{"revision":"5994c8a899848b78650e98b715fce8d9","url":"static/css/deals-page.c4f44968.chunk.css"},{"revision":"538e360f3939b307e8c72c8489c7572b","url":"static/css/forgot-password-page.9fada0db.chunk.css"},{"revision":"7f0b2599b257a1542dcd0e6aa3690340","url":"static/css/home-page.f3f855a7.chunk.css"},{"revision":"5635277756d7ac7d5261c770d7ed9dd8","url":"static/css/login-page.fd52c3ed.chunk.css"},{"revision":"6748d593a729a70cac56a4f3896f2399","url":"static/css/main.e9596f5b.css"},{"revision":"cbc7172f1837febf2c83edaa02b3f087","url":"static/css/not-found.2feb6d8c.chunk.css"},{"revision":"37a7c419eeae9d39e57c800d65a64f99","url":"static/css/reset-password-page.e864bd3a.chunk.css"},{"revision":"6a468c153b156c0cc2043081d93c20a5","url":"static/css/rewards-page.b1f8407d.chunk.css"},{"revision":"270dc9e9f5ae5c1ead2f0e8a197116dd","url":"static/css/search-page.a4569d3f.chunk.css"},{"revision":"95711a861af29572dbfd37120b63e8a5","url":"static/css/signup-page.4d344dfd.chunk.css"},{"revision":"d7962b7b61db3d7185929ef984422a91","url":"static/css/store-detail-page.06b580fb.chunk.css"},{"revision":"9bff6c4949f4e720c6154e6e5dcd257e","url":"static/css/stores-page.d3322cb8.chunk.css"},{"revision":"2c5b4e15b44d845aca66e397282bf438","url":"static/css/verify-email-page.e1ed131d.chunk.css"},{"revision":"0105a02d1c7e1829a6eb7d5ecfdaa4f6","url":"static/js/18.ab40bcba.chunk.js"},{"revision":"97e548f3584fceb4cda01dcac0d42bdf","url":"static/js/206.64849aa9.chunk.js"},{"revision":"322ef33e9cc29b823419690f6624370c","url":"static/js/487.494483bf.chunk.js"},{"revision":"a27d82bc3f48349716e248d4afb55eaf","url":"static/js/556.99a481d7.chunk.js"},{"revision":"317ba0a6d2b59935babc2aa3db21bb27","url":"static/js/646.c7ff6afd.chunk.js"},{"revision":"c70f4b948740f39d53cf5235cf9a5eca","url":"static/js/68.516156ac.chunk.js"},{"revision":"c2193729d653cdffbb98d328cafb8573","url":"static/js/751.b7fa5213.chunk.js"},{"revision":"50adfb9ebdfc08a0115c03d5f52927a6","url":"static/js/850.f119086b.chunk.js"},{"revision":"8b8576023f6e8c9e0367cc02d2a32069","url":"static/js/858.0f044da5.chunk.js"},{"revision":"49b1833d21e56823a6a4cd7215ac8d76","url":"static/js/864.c85bb4c7.chunk.js"},{"revision":"5d4aa8b6a4f51df77a727c866dfefb23","url":"static/js/865.cef72014.chunk.js"},{"revision":"84994c4035f430d4da7f4843df142d3f","url":"static/js/911.ead36a9f.chunk.js"},{"revision":"67a5ef50dc9e987f869c9da3513cbd15","url":"static/js/985.2f45bf8a.chunk.js"},{"revision":"c64104796e44571105683aa13303ad68","url":"static/js/about-page.a5b7808e.chunk.js"},{"revision":"5073637caf0f65949ec599c198c900d0","url":"static/js/account-page.756fbdc2.chunk.js"},{"revision":"f77224ac7dda9c7babbe95d7d54cac7e","url":"static/js/admin-dashboard.f39ff748.chunk.js"},{"revision":"07b7d4da18054224c6330af0a670983f","url":"static/js/admin-login.62ae7466.chunk.js"},{"revision":"63db72ddaa181bd4554a391fad86caaf","url":"static/js/blog-page.bbdc8518.chunk.js"},{"revision":"794cc2ff968abbe1561734223a605f73","url":"static/js/careers-page.a41e9dd9.chunk.js"},{"revision":"12ee477cc37b7e38b17a2a376ac19542","url":"static/js/cashback-page.e3670c8b.chunk.js"},{"revision":"6d09f2769d0079df59a032059611369a","url":"static/js/category-page.62f3b19e.chunk.js"},{"revision":"59f2f8e0efd2d5614b70520bbf147717","url":"static/js/coupons-page.efb176a8.chunk.js"},{"revision":"9043a47dad6d21ae8078256c75712ee5","url":"static/js/deals-page.93941e1d.chunk.js"},{"revision":"d264e87b730224735c56b7460d0c4f15","url":"static/js/forgot-password-page.aebab200.chunk.js"},{"revision":"d42765d381404c796a7f546c3747db9f","url":"static/js/home-page.5afc8d82.chunk.js"},{"revision":"0c003751612c989658fe066c65514fd7","url":"static/js/login-page.a2606892.chunk.js"},{"revision":"6cde6791fa01dd7fa2d0df0ad84a3c23","url":"static/js/main.3b100d8b.js"},{"revision":"41d31a9844035087e4364573690a8553","url":"static/js/not-found.9d993e9b.chunk.js"},{"revision":"f28514b02551b666d3df9e6b4bf4e811","url":"static/js/offers-page.f72cfe98.chunk.js"},{"revision":"6b6315a25320f33fba37e40d533376f6","url":"static/js/reset-password-page.1f495765.chunk.js"},{"revision":"612fdbf904a5d3909c383878e8a6cd9d","url":"static/js/rewards-page.cac233be.chunk.js"},{"revision":"49637cb5f921eaf3cf2cbb5356ce5c65","url":"static/js/search-page.fb8a14d4.chunk.js"},{"revision":"ec384157cdc74a37ae23a46cd0e844f8","url":"static/js/signup-page.1f85ee71.chunk.js"},{"revision":"635d64baef253eecac46fa8dd7d57bc8","url":"static/js/store-detail-page.2f5fac1a.chunk.js"},{"revision":"1e421337893465cea802569cb3e4c90a","url":"static/js/stores-page.1e25236d.chunk.js"},{"revision":"2f6ff4e0947973c28db82db07a9e70be","url":"static/js/theme-demo.47112992.chunk.js"},{"revision":"31a18a2798196c774e17ec2efbdcb3c9","url":"static/js/verify-email-page.a4033651.chunk.js"},{"revision":"0c016cf9a151cc74ed4be3bfebf0b42a","url":"static/media/1.cc74bf38e63915aaddc1.jpg"},{"revision":"e9f412fef7ebc90a564056aeedda5a19","url":"static/media/cashheros-logo.418d45b47bbc58171929.png"},{"revision":"de7dbfce47c5a86292c6927d2b5f76a2","url":"sw-fallback.js"},{"revision":"f2d9565cab4393db4006469ddc0fb5b9","url":"test.html"}]);

  // Cache images with CacheFirst strategy
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
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

  // Cache CSS and JS files with StaleWhileRevalidate
  workbox.routing.registerRoute(
    ({ request }) => 
      request.destination === 'style' || 
      request.destination === 'script',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // Cache API requests with NetworkFirst strategy
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
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
      cacheName: 'google-fonts-stylesheets',
    })
  );

  // Cache Google Fonts webfont files
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
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
      cacheName: 'pages-cache',
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

console.log('[SW] Workbox Service Worker setup complete');