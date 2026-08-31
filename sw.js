// Build substitutes a content-hashed version and the complete public app shell.
// API responses, files, and credentials are never stored by this service worker.
const CACHE = 'drop-pwa-shell-389213548c7583a6';
const PRECACHE = ["./","./bucket.svg","./manifest.webmanifest","./icon-180.png","./icon-512.png","./assets/pdf.worker.min-CLrFZWeq.mjs","./assets/index-DejAfOt0.css","./assets/index-BLHl10Tb.js","./assets/pdf-CplH8yZj.js"];
const scope = new URL(self.registration.scope);
self.addEventListener('install', event => {
  // Bypass the HTTP cache so an update cannot retain the previous index.html.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' })))));
  // Do not replace an open app: it may still be saving a local change.
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('drop-pwa-shell-') && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname) || event.request.headers.has('Authorization')) return;
  if (event.request.mode === 'navigate') {
    // Only the actual app entry points use the offline shell. Returning that
    // HTML for /shortcuts/ also resolves its relative JS under /shortcuts/assets/
    // and leaves a blank page instead of the installation instructions.
    if (url.pathname !== scope.pathname && url.pathname !== `${scope.pathname}index.html`) return;
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
