// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      })
      .catch(function(err) {
        // Registration failed
        console.log('ServiceWorker registration failed:', err);
      });
  });
}

// Cache name and URLs to cache
const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
];

// Install event
self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No match in cache - fetch from network
        return fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  // Claim any clients immediately, without waiting for activation to complete
  event.waitUntil(self.clients.claim());
});
