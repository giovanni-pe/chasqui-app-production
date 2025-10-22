/* public/sw.js */
self.addEventListener('install', evt => {
  self.skipWaiting();
  console.log('SW instalado');
});

self.addEventListener('activate', evt => {
  self.clients.claim();
  console.log('SW activo');
});

self.addEventListener('periodicsync', evt => {
  if (evt.tag === 'chasqui-sync') {
    evt.waitUntil(syncAll());
  }
});

async function syncAll() {
  const routes = [
    '/passenger/dashboard',
    '/passenger/trip-request',
    '/passenger/active-trip'
  ];
  for (const path of routes) {
    try {
      await fetch(`https://chasqui-explorer.space${path}`, {
        credentials: 'include'
      });
      console.log('[SW] Sincronizado:', path);
    } catch (err) {
      console.warn('[SW] Error en sync:', path, err);
    }
  }
}
