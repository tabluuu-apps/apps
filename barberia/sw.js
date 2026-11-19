/* Hace que el celular reconozca la agenda como app.
   Solo guarda el diseño (esta página e íconos). Las citas, clientes y dinero
   siempre se piden en vivo a Google y nunca se guardan en el celular. */
var VERSION = 'barberia-v1';
var BASE = ['./', 'manifest.json', 'iconos/icono-192.png', 'iconos/icono-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(BASE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return; /* Google: siempre en vivo */
  e.respondWith(
    fetch(r).then(function (res) {
      var copia = res.clone();
      caches.open(VERSION).then(function (c) { c.put(r.mode === 'navigate' ? './' : r, copia); });
      return res;
    }).catch(function () {
      return caches.match(r.mode === 'navigate' ? './' : r);
    })
  );
});
