// Build substitutes a content-hashed version and the complete public app shell.
// API responses, files, and credentials are never stored by this service worker.
const CACHE = 'drop-pwa-shell-75c9b5696cf21f65';
const PRECACHE = ["./","./bucket.svg","./manifest.webmanifest","./icon-180.png","./icon-512.png","./assets/pdf.worker.min-CLrFZWeq.mjs","./assets/index-CR_h5uVX.css","./assets/index-BGeo8nPd.js","./assets/pdf-BFd-NW1U.js"];
const scope = new URL(self.registration.scope);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)));
  // Do not replace an open app: it may still be saving a local change.
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('drop-pwa-shell-') && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname) || event.request.headers.has('Authorization')) return;
  if (event.request.mode === 'navigate') {
    // Match HTML to this worker's precached JS, even during a deployment.
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match('./')) || fetch(event.request)));
  } else if (url.pathname.includes('/assets/') || url.pathname.includes('/pdfjs/') || /\.(png|svg|webmanifest)$/.test(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(async cache => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    }));
  }
});
