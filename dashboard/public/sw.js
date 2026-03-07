// F1 Naija Service Worker

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

// Handles both race event alerts (from Railway push-service) and news alerts
self.addEventListener('push', (e) => {
  let data = {
    title: '\u{1F3CE}\uFE0F F1 Naija',
    body: '',
    icon: '/icon.png',
    badge: '/icon.png',
    url: '/news',
  };

  if (e.data) {
    try { data = { ...data, ...e.data.json() }; } catch {}
  }

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
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
  );
});
