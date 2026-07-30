const cacheName = 'vinny-bird-v1';
const assets = [
  './',
  'index.html',
  'flappy.css',
  'flappy.js',
  'manifest.json',
  'bird.png',
  'background.jpeg',
  'pillar.png',
  'background sound untill fail.mp3',
  'fail sound.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(assets))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
