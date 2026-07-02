const CACHE_NAME = 'numpal-cache-v105-modular';

// Cache all modular files to ensure complete offline functionality
// Removed references to non-existent files to prevent cache.addAll from failing entirely.
const urlsToCache = [
'./',
'./index.html',
'./manifest.json',
'./frontend/css/styles.css',
'./frontend/js/core/config.js',
'./frontend/js/core/app.js',
'./frontend/js/utils/ui.js',
'./frontend/js/utils/rolodex.js',
'./frontend/js/pages/duration.js',
'./frontend/js/pages/end-time.js',
'./frontend/js/pages/expiry.js',
'./frontend/js/pages/purchasing2.js',
'./frontend/js/pages/stopwatch.js',
'./frontend/pages/duration.html',
'./frontend/pages/end-time.html',
'./frontend/pages/expiry.html',
'./frontend/pages/purchasing2.html',
'./frontend/pages/stopwatch.html',
'./frontend/pages/time-menu.html',
'./assets/icon-192.png',
'./assets/icon-512.png',
'./assets/note-50.png',
'./assets/note-10.png',
'./assets/note-5.png',
'./assets/note-2.png',
'./assets/coin-1.png',
'./assets/coin-50c.png',
'./assets/coin-20c.png',
'./assets/coin-10c.png',
'./assets/coin-5c.png',
'./assets/Organisation_Logo.png'
];

self.addEventListener('install', event => {
self.skipWaiting(); 
event.waitUntil(
   caches.open(CACHE_NAME)
       .then(cache => {
           // Enforce caching entirely
           const cacheBustedUrls = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
           return cache.addAll(cacheBustedUrls);
       })
       .catch(err => console.error('Failed to cache files on install:', err))
);
});

self.addEventListener('activate', event => {
event.waitUntil(
   caches.keys().then(cacheNames => {
       return Promise.all(
           cacheNames.map(cacheName => {
               if (cacheName !== CACHE_NAME) {
                   return caches.delete(cacheName);
               }
           })
       );
   })
);
return self.clients.claim(); 
});

self.addEventListener('fetch', event => {
if (event.request.method !== 'GET') return;

// Stricter Cache-First Strategy for isolated offline-ready execution.
event.respondWith(
   caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
       if (cachedResponse) {
           return cachedResponse;
       }
       // Only fetch if missing from cache (safety fallback)
       return fetch(event.request).then(networkResponse => {
           if (networkResponse && networkResponse.status === 200) {
               const responseToCache = networkResponse.clone();
               caches.open(CACHE_NAME).then(cache => {
                   cache.put(event.request, responseToCache);
               });
           }
           return networkResponse;
       }).catch(() => {}); // Gracefully fail if offline
   })
);
});