// Speed-optimized service worker
const CACHE_VERSION = 'v1.2';
const STATIC_CACHE = `webview-static-${CACHE_VERSION}`;
const OFFLINE_CACHE = `webview-offline-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `webview-dynamic-${CACHE_VERSION}`;

// Files to precache
const STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/images/no-internet.gif'
];

// Aggressive caching for these extensions
const IMMUTABLE_EXTENSIONS = [
    '.js',
    '.css',
    '.woff2',
    '.woff',
    '.ttf',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.map'
];

function isImmutableRequest(url) {
    return IMMUTABLE_EXTENSIONS.some(ext => url.endsWith(ext)) ||
           url.includes('chunk') ||
           url.includes('static/');
}

// Install event with improved error handling
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            // Precache static files
            caches.open(STATIC_CACHE).then(async (cache) => {
                console.log('[ServiceWorker] Caching static files');
                try {
                    await cache.addAll(STATIC_FILES);
                } catch (error) {
                    console.error('[ServiceWorker] Failed to cache some static files:', error);
                    // Continue even if some files fail to cache
                }
            }),
            // Cache offline files
            caches.open(OFFLINE_CACHE).then(async (cache) => {
                try {
                    await cache.addAll(['/offline.html', '/images/no-internet.gif']);
                } catch (error) {
                    console.error('[ServiceWorker] Failed to cache offline files:', error);
                }
            })
        ]).then(() => self.skipWaiting())
    );
});

// Fetch event with optimized caching strategies
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    
    // Handle navigation requests
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache successful navigation responses
                    if (response.ok) {
                        const responseToCache = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => cache.put(event.request, responseToCache));
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then(response => {
                            // Try cached page first
                            if (response) {
                                return response;
                            }
                            // Fall back to offline page
                            return caches.match('/offline.html');
                        });
                })
        );
        return;
    }

    // Handle static assets - Cache First strategy
    if (isImmutableRequest(url.pathname)) {
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        // Return cached response immediately
                        return cachedResponse;
                    }

                    // If not in cache, fetch from network
                    return fetch(event.request)
                        .then(networkResponse => {
                            if (networkResponse.ok) {
                                // Cache the new response
                                const responseToCache = networkResponse.clone();
                                caches.open(STATIC_CACHE)
                                    .then(cache => cache.put(event.request, responseToCache));
                            }
                            return networkResponse;
                        })
                        .catch(() => { 
                            
                            return null;
                        });
                })
        );
        return;
    }

    // For all other requests, try network first then cache
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    // Cache other successful responses
                    const responseToCache = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(event.request, responseToCache));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith('webview-') && 
                            ![STATIC_CACHE, OFFLINE_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                // Claim all clients immediately
                return self.clients.claim();
            })
    );
});