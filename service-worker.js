const CACHE_VERSION = 'jpo-interior-pwa-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_URL = 'offline.html';

const PRECACHE_URLS = [
  OFFLINE_URL,
  'css/bootstrap.min.css',
  'css/tiny-slider.css',
  'css/style.css',
  'css/style-fixes.css',
  'js/bootstrap.bundle.min.js',
  'js/tiny-slider.js',
  'js/custom.js',
  'images/favicon.png',
  'images/LOGO.jpg',
  'images/icons/icon-192.png',
  'images/icons/icon-512.png'
];

const SENSITIVE_PATHS = [
  '/api/',
  '/admin',
  '/login',
  '/logout',
  '/signin',
  '/signup',
  '/account',
  '/dashboard',
  '/checkout',
  '/cart'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('jpo-interior-pwa-') && cacheName !== STATIC_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const path = url.pathname.toLowerCase();
  const isSensitive = SENSITIVE_PATHS.some((sensitivePath) => path.startsWith(sensitivePath));

  if (!isSameOrigin || isSensitive) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  const isStaticAsset = ['style', 'script', 'image', 'font'].includes(request.destination);
  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseToCache));
        return networkResponse;
      });
    })
  );
});
