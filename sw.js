const CACHE_NAME = 'lifecount-cache-v5';

// All the core files needed for the app to function 100% offline
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
];

// Install event: Cache all vital files immediately upon app installation
self.addEventListener('install', event => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and fetching strictly fresh files for offline use');
                
                // CRITICAL FIX: Forces the browser to ignore HTTP caches and fetch directly from server
                const cacheBustedUrls = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
                return cache.addAll(cacheBustedUrls);
            })
            .catch(err => console.error('Failed to cache files on install:', err))
    );
});

// Activate event: Cleanup old caches when we push a new version
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); 
});

// Fetch event: Rock-solid Offline-First strategy (Cache First, Background Update)
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
            
            // 1. If we have the file in cache, RETURN IT IMMEDIATELY
            if (cachedResponse) {
                // 2. Silently check the network in the background to update the cache for next time
                event.waitUntil(
                    fetch(event.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, networkResponse.clone());
                            });
                        }
                    }).catch(() => {
                        // Background update failed. Do nothing, app still works!
                    })
                );
                return cachedResponse;
            }

            // 3. If file is NOT in cache, try fetching from the network
            return fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                console.error('Offline and file not cached:', event.request.url);
            });
        })
    );
});
