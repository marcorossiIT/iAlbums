const CACHE_NAME = 'album-rating-cache-v1';
const OFFLINE_URL = 'index.html';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([
      './',
      './index.html',
      './manifest.json',
      './css/style.css',
      './js/config.js',
      './js/idb.js',
      './js/db.js',
      './js/sync.js',
      './js/main.js',
      'https://cdn.jsdelivr.net/npm/framework7@6.3.14/framework7.bundle.min.css',
      'https://cdn.jsdelivr.net/npm/framework7@6.3.14/framework7.bundle.min.js'
    ]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key !== CACHE_NAME) {
        await caches.delete(key);
      }
    }
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    try {
      return await fetch(event.request);
    } catch (e) {
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(event.request) || await cache.match(OFFLINE_URL);
    }
  })());
});
