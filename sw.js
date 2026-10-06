const CACHE = 'pocketvm-shell-v43';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './storage.js',
  './files.js',
  './system.js',
  './store.js',
  './code.js',
  './store/snake/icon.svg',
  './store/deadwave/icon.svg',
  './store/blockblast/icon.svg',
  './store/blockblast/game.html',
  './store/crumbclicker/icon.svg',
  './store/crumbclicker/game.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first keeps GitHub Pages updates fresh, while still working offline.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(async () => {
        const hit = await caches.match(event.request);
        if (hit) return hit;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});