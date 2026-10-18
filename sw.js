// Offline support. The deploy workflow (tools/build-sw.js) stamps VERSION and FILES; during local
// development they stay empty and the page does not register this worker.
const VERSION = 'dev';
const FILES = [];
const CACHE = `mortal-path-${VERSION}`;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('mortal-path-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Cache first for the game's own files (they change together, per VERSION); anything else from this
// origin is fetched and kept for next time.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === 'navigate') return (await c.match('./')) || (await c.match('index.html')) || Response.error();
      throw err;
    }
  }));
});
