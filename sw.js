const CACHE_NAME = 'lifecount-cache-v2'; // Bumped version to ensure new page is cached immediately
const urlsToCache =[
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './pages/purchasing.html',
    './pages/time-menu.html',
    './pages/stopwatch.html',
    './pages/duration.html',
    './pages/end-time.html',
    './pages/expiry.html'
    // Add icon paths here once generated
];

// Install event: cache initial files
self.addEventListener('install', event => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Fetch event: Stale-While-Revalidate strategy for offline-first and background updates
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // If network is available, update the cache in the background
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Ignore network errors (user is offline). App will load from cachedResponse.
            });

            // Return cached response immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
        })
    );
});

// Activate event: Cleanup old caches when a new version is installed
self.addEventListener('activate', event => {
    const cacheWhitelist =[CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
