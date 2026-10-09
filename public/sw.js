// Service worker "de limpieza".
// Una versión vieja de la app (que no salió de este repo) instaló un service worker en /sw.js
// que guardaba esa versión y la seguía mostrando aunque Vercel publicara una nueva.
// Los navegadores buscan actualizaciones de /sw.js solos: al encontrar este archivo, lo instalan,
// borran todo lo que el viejo había guardado, se desinstalan y recargan la página.
// La app actual NO usa service worker: no registrar ninguno nuevo sin revisar esto.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
