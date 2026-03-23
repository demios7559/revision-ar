const CACHE_NAME = 'revision-ar-v1';
const STATIC_ASSETS = [
  '/revision-ar/',
  '/revision-ar/index.html',
  '/revision-ar/manifest.json',
  '/revision-ar/icon-192.png',
  '/revision-ar/icon-512.png'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first for API, cache first for static
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls: always network (no cache)
  if (url.hostname !== location.hostname || url.pathname.includes('/api/')) {
    return;
  }

  // Static assets: network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
