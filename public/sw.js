// Service worker is going to create a cache storage for the application
const CACHE_NAME = 'FLbuddy-cache'
const DYNAMIC_CACHE_NAME = 'FLbuddy-dynamic-cache-v2'


// These are the urls need to store to the cache
const urlsToCache = ['/', '/offline', '/student', '/class', '/preference']


const self = this;

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME) // creaet a cache storage
            .then((cache) => {
                console.log('Opened cache')
                return cache.addAll(urlsToCache)
            })
    )
})

// Listen for requests
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request) // to get the cache with the event.request
            .then((response) => {
                // if the cache is exsited.
                if (response) {
                    return response // return the content of cache to html file
                } else {
                    // If there is no matched cache, use fetch to fetch the file content
                    return fetch(event.request)
                        .then((res) => {
                            console.log('[Service Worker] data fetched :', res)
                            // and cache the content to another cache storage( this case: dynamic cache storage).
                            return caches
                                .open(DYNAMIC_CACHE_NAME)
                                .then((cache) => {
                                    // cache.put accept 2 argument, and store the record as key value pair strutrue.
                                    // which is { url(Path) : content}
                                    // So, the two argument below is match this format

                                    // (As the response behaviour is consume, it can be used only once.
                                    //  so, to put it to the cache, and return it. response object provide a .clone() method. 
                                    cache.put(event.request.url, res.clone())
                                    return res; // After caching the content, return the content to html, otherwise there are failiure after caching.
                                })
                        }).catch((err) => {
                            return caches.open(CACHE_NAME)
                                .then((cache) => {
                                    return cache.match('/offline');
                                })
                        })
                }
                // return fetch(event.request)
            })
        // .catch(() => caches.match('offline.html'))
    )
})

// Activate the Service Worker
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [];
    cacheWhitelist.push(CACHE_NAME, DYNAMIC_CACHE_NAME);

    event.waitUntil(caches.keys().then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
                console.log('[Service Worker] Deleting the old cache')
                return caches.delete(cacheName)
            }
        })
    )))

    return self.clients.claim();
})

// Listen for requests
self.addEventListener('push', (event) => {
    console.log(event)
})