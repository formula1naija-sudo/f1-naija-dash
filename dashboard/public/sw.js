// F1 Naija Service Worker

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', (e) => { e.waitUntil(clients.claim()); });

// Handles push notifications on all platforms including iOS PWA (16.4+)
self.addEventListener('push', (e) => {
  let data = {
    title: '\u{1F3CE}\uFE0F F1 Naija',
    body: '',
    icon: '/pwa-icon.png',
    badge: '/pwa-icon.png',
    url: '/news',
  };

  if (e.data) {
    try { data = { ...data, ...e.data.json() }; } catch {}
  }

  // vibrate and requireInteraction are ignored on iOS but harmless on Android
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: 'f1-naija',
      renotify: true,
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: { url: data.url },
    })
  );
});

// Navigate to the URL stored in the notification data
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const targetUrl = e.notification.data?.url ?? '/news';

  e.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus an existing window first
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            // client.navigate may not exist on all platforms (e.g. some iOS versions)
            if ('navigate' in client) {
              return client.navigate(targetUrl).then((c) => c && c.focus());
            }
            return client.focus();
          }
        }
        // No existing window — open a new one
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
  );
});
