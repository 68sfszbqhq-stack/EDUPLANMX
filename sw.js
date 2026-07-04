/**
 * Service Worker de EduPlan MX
 *
 * Estrategia pensada para escuelas con internet inestable Y para no repetir
 * el problema de caché de GitHub Pages:
 *  - Navegaciones (index.html): RED PRIMERO, caché solo si no hay conexión.
 *    Así una nueva versión desplegada siempre gana si hay internet.
 *  - Assets con hash (/assets/*.js|css): CACHÉ PRIMERO (su nombre cambia en
 *    cada build, no pueden quedar obsoletos).
 *  - Nunca intercepta llamadas a otros dominios (Firebase, Gemini, Analytics).
 */

const CACHE = 'eduplan-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Solo mismo origen y solo GET; Firebase/Gemini/GA pasan directo
    if (url.origin !== self.location.origin || event.request.method !== 'GET') return;

    // Navegaciones: red primero (la app siempre fresca), caché como paracaídas offline
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(resp => {
                    const copia = resp.clone();
                    caches.open(CACHE).then(c => c.put(event.request, copia));
                    return resp;
                })
                .catch(() => caches.match(event.request).then(r => r || caches.match(self.registration.scope)))
        );
        return;
    }

    // Assets con hash + íconos + manifest: caché primero
    if (url.pathname.includes('/assets/') || url.pathname.includes('/icons/') || url.pathname.endsWith('.webmanifest')) {
        event.respondWith(
            caches.match(event.request).then(cacheado =>
                cacheado || fetch(event.request).then(resp => {
                    const copia = resp.clone();
                    caches.open(CACHE).then(c => c.put(event.request, copia));
                    return resp;
                })
            )
        );
    }
});
