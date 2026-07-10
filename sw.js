const CACHE = 'todo-v1';

// ── LIFECYCLE ─────────────────────────────────────────────────────────────────
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ── FETCH: network first, cache fallback ──────────────────────────────────────
self.addEventListener('fetch', e => {
  // Only handle GET requests for same-origin or app resources
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Cache successful responses (opaque = cross-origin no-cors, e.g. fonts)
        if (response.ok || response.type === 'opaque') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
