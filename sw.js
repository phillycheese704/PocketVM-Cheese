const CACHE = 'pocketvm-shell-v85';
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
  './store/deadwave/game.html',
  './store/blockblast/icon.svg',
  './store/blockblast/game.html',
  './store/crumbclicker/icon.svg',
  './store/crumbclicker/game.html',
  './store/pvz/icon.svg',
  './store/pvz/game.html',
  './store/flappy/icon.svg',
  './store/flappy/game.html',
  './store/apexrush/icon.svg',
  './store/apexrush/game.html',
  './store/apexrush/music.mp3',
  './store/penguinpull/icon.svg',
  './store/penguinpull/game.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg',
  "./app.js?v=85",
  "./store.js?v=85",
  "./icons/icon.svg?v=illustrated-v1",
  "./store/snake/icon.svg?v=illustrated-v1",
  "./store/deadwave/icon.svg?v=illustrated-v1",
  "./store/blockblast/icon.svg?v=illustrated-v1",
  "./store/crumbclicker/icon.svg?v=illustrated-v1",
  "./store/pvz/icon.svg?v=illustrated-v1",
  "./store/flappy/icon.svg?v=illustrated-v1",
  "./store/penguinpull/icon.svg?v=illustrated-v1",
  "./store/apexrush/icon.svg?v=illustrated-v1",
  "./store/wobblebay/icon.svg?v=illustrated-v1",
  "./store/crumbclicker/candy-icon.svg?v=illustrated-v1",
  "./store/wobblebay/game.html?v=bay-v4",
  "./store/wobblebay/engine.js?v=bay-v4",
  "./store/wobblebay/game.js?v=bay-v4",
  "./store/wobblebay/three.min.js?v=bay-v4",
  "./store/wobblebay/software-renderer.js?v=bay-v4",
  "./store/wobblebay/THREE-LICENSE.txt?v=bay-v4",
  './store/snake/game.html',
  './store/crumbclicker/candy-icon.svg',
  './store/crumbclicker/candy-favicon-32.png',
  './store/crumbclicker/candy-icon-180.png',
  './store/crumbclicker/candy-icon-512.png',
  "./store/snake/favicon-32.png",
  "./store/snake/icon-180.png",
  "./store/snake/icon-512.png",
  "./store/deadwave/favicon-32.png",
  "./store/deadwave/icon-180.png",
  "./store/deadwave/icon-512.png",
  "./store/blockblast/favicon-32.png",
  "./store/blockblast/icon-180.png",
  "./store/blockblast/icon-512.png",
  "./store/crumbclicker/favicon-32.png",
  "./store/crumbclicker/icon-180.png",
  "./store/crumbclicker/icon-512.png",
  "./store/pvz/favicon-32.png",
  "./store/pvz/icon-180.png",
  "./store/pvz/icon-512.png",
  "./store/flappy/favicon-32.png",
  "./store/flappy/icon-180.png",
  "./store/flappy/icon-512.png",
  "./store/penguinpull/favicon-32.png",
  "./store/penguinpull/icon-180.png",
  "./store/penguinpull/icon-512.png",
  "./store/apexrush/favicon-32.png",
  "./store/apexrush/icon-180.png",
  "./store/apexrush/icon-512.png",
  "./store/wobblebay/favicon-32.png",
  "./store/wobblebay/icon-180.png",
  "./store/wobblebay/icon-512.png",
  "./store/wobblebay/icon.svg",
  "./store/wobblebay/game.html",
  "./store/wobblebay/game.js",
  "./store/wobblebay/software-renderer.js",
  "./store/wobblebay/engine.js",
  "./store/wobblebay/three.min.js",
  "./store/wobblebay/THREE-LICENSE.txt",
  "./icons/favicon-32.png",
  "./icons/favicon-48.png",
  "./icons/icon-180.png",
  "./favicon.ico"
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
