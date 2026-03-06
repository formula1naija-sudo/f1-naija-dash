// F1 Naija Service Worker
// Required for PWA installability on iOS and Android

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Handle server-sent push events (future use)
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'F1 Naija', {
      body: data.body || '',
      icon: '/tag-logo.png',
      badge: '/tag-logo.png',
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const client = clients.find((c) => c.url.includes('/dashboard'));
      if (client) {
        client.focus();
      } else {
        self.clients.openWindow('/dashboard');
      }
    })
  );
});
