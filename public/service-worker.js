self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('shift-tracker-cache-v2').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
