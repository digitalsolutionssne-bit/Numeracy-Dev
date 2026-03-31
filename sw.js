const CACHE_NAME = 'lifecount-cache-v6';

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
    './pages/expiry.html',
    './pages/scan-expiry.html' // ADDED NEW FILE
];

self.addEventListener('install', event => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and fetching strictly fresh files for offline use');
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
                        console.log('Deleting old cache:', cacheName);
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

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
            if (cachedResponse) {
                event.waitUntil(
                    fetch(event.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, networkResponse.clone());
                            });
                        }
                    }).catch(() => {
                        // Background update failed. App still works offline.
                    })
                );
                return cachedResponse;
            }

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
