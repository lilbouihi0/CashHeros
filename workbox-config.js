module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot,ico}'
  ],
  swDest: 'build/service-worker.js',
  swSrc: 'src/service-worker.js',
  // Don't include these files in the precache manifest
  globIgnores: [
    'service-worker.js',
    'workbox-*.js',
    'asset-manifest.json',
    'robots.txt',
    'manifest.json',
    'logo*.png'
  ]
};