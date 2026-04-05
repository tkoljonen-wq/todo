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
        // Store a copy in cache for offline use
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, fireAt, tag } = e.data;
    const delay = fireAt - Date.now();
    if (delay < 0) return;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: './icons/icon-192.svg',
        badge: './icons/icon-192.svg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: 'dismiss', title: '✓ Kuittaa' },
          { action: 'snooze',  title: '💤 15 min' }
        ]
      });
    }, delay);
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'snooze') {
    setTimeout(() => {
      self.registration.showNotification(e.notification.title, {
        body: e.notification.body,
        tag: e.notification.tag + '_snooze',
        vibrate: [200, 100, 200],
        requireInteraction: true,
      });
    }, 15 * 60 * 1000);
  }
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('./index.html');
    })
  );
});
