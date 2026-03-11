self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, fireAt, tag } = e.data;
    const delay = fireAt - Date.now();
    if (delay < 0) return;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: '/todo-icon.png',
        badge: '/todo-icon.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: 'dismiss', title: '✓ Kuittaa' },
          { action: 'snooze', title: '💤 15 min' }
        ]
      });
    }, delay);
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'snooze') {
    // Re-schedule 15 min later
    const fireAt = Date.now() + 15 * 60 * 1000;
    setTimeout(() => {
      self.registration.showNotification(e.notification.title, {
        body: e.notification.body,
        tag: e.notification.tag + '_snooze',
        vibrate: [200, 100, 200],
        requireInteraction: true,
      });
    }, 15 * 60 * 1000);
  }
  // Open app on click
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('./todo.html');
    })
  );
});
