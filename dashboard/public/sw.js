// F1 Naija Service Worker
const CACHE_NAME = 'f1-naija-static-v1';

// Static assets worth caching for fast repeat loads
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/pwa-icon.png',
  '/tag-logo.png',
];

// ── Install: pre-cache shell assets ──────────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
});

// ── Activate: remove stale caches ────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => clients.claim())
  );
});

// ── Fetch: stale-while-revalidate for static assets; network-only for API ────
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Skip API / SSE / Next.js HMR routes — always network
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/_next/data/')
  ) return;

  // _next/static assets (JS/CSS chunks) — cache-first, long TTL
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      })
    );
    return;
  }

  // Images & fonts — stale-while-revalidate
  if (
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf)$/)
  ) {
    e.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((fresh) => {
          if (fresh.ok) cache.put(request, fresh.clone());
          return fresh;
        });
        return cached ?? fetchPromise;
      })
    );
    return;
  }

  // HTML navigation pages — network-first, fall back to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, res.clone()));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached ?? caches.match('/');
        })
    );
  }
});

// ── Push notifications ────────────────────────────────────────────────────────
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

// ── Notification click: focus or open window ──────────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const targetUrl = e.notification.data?.url ?? '/news';

  e.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            if ('navigate' in client) {
              return client.navigate(targetUrl).then((c) => c && c.focus());
            }
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
  );
});
