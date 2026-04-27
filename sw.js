const CACHE_NAME = 'fontane-beverini-v8.1.0-EUROPA'; // 🔥 Targa aggiornata per forzare la pulizia
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';
const MAX_DYNAMIC_ITEMS = 80; // Il limite massimo di file (foto) prima di cancellare i vecchi

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './analytics.js',
  './firebase-init.js',
  './manifest.json',
  './images/logo-app.png',
  './images/logo-comune.png',
  './images/sfondo-home.jpg',
  './images/sfondo-home-mobile.jpg',
  './images/default-beverino.jpg',
  './images/icona-avvio-144.png',
  './images/icona-avvio-192.png',
  './images/icona-avvio-512.png',
  './images/icona-avvio-splash.png',
  './images/apple-touch-icon.png',
  './images/favicon.ico',
  './images/favicon-16x16.png',
  './images/favicon-32x32.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'
];

// Funzione "Taglia-erba" per non far esplodere la memoria dello smartphone
const trimCache = (cacheName, maxItems) => {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => trimCache(cacheName, maxItems));
      }
    });
  });
};

// Install Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installazione in corso...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Cache asset statici');
        const cachePromises = STATIC_ASSETS.map(url => {
          return fetch(url, { mode: 'no-cors' })
            .then(response => {
              if (response.ok || response.type === 'opaque') {
                return cache.put(url, response.clone());
              }
              return Promise.resolve();
            }).catch(() => Promise.resolve());
        });
        return Promise.all(cachePromises);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker (La Candeggina per i file vecchi)
self.addEventListener('activate', event => {
  console.log('[Service Worker] Attivazione...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Cancellazione vecchia cache pesante:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch Strategy
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Esclusioni di base
  if (url.protocol.startsWith('chrome') || url.protocol.startsWith('about') || url.protocol.startsWith('data') || url.protocol.startsWith('blob') || url.protocol.startsWith('file')) return;

  // Richieste da non mettere MAI in cache (es. Database in tempo reale)
  if (url.href.includes('firebase') || url.href.includes('nominatim') || url.href.includes('gstatic.com') || url.href.includes('googleapis.com') || url.href.includes('/analytics') || url.href.includes('/firestore')) {
    return fetch(event.request);
  }

  // 🌍 MAPPE: Network First (Non salviamo le mappe in cache per non occupare 800 MB)
  if (url.href.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 📷 FOTO (ImgBB): Cache First con Limitatore di Sicurezza
  if (url.href.includes('i.ibb.co') || url.href.includes('raw.githubusercontent.com')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request).then(response => {
          if (response.ok || response.type === 'opaque') {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, clone);
              trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS); // Controlla il tetto degli 80 file
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategia Standard per tutto il resto
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(response => {
        if (!response.ok) {
          if (event.request.url.includes('index.html') || event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
          return response;
        }

        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => {
          if (url.protocol.startsWith('http')) {
            cache.put(event.request, responseToCache);
            trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
          }
        }).catch(err => console.warn('[SW] Cache put error:', err));

        return response;
      }).catch(error => {
        console.warn('[SW] Fallback offline:', error.message);
        if (event.request.headers.get('accept')?.includes('text/html')) return caches.match('./index.html');
        if (event.request.destination === 'image') return caches.match('./images/sfondo-home.jpg');
        if (event.request.destination === 'script') {
          return new Response('/* Offline */', { headers: { 'Content-Type': 'application/javascript' } });
        }
        return new Response('Modalità offline.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      });
    })
  );
});

// Background Sync (Originale intatto)
self.addEventListener('sync', event => {
  console.log('[Service Worker] Sync event:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData().catch(err => console.error('[SW] Sync err:', err)));
  }
});

async function syncOfflineData() {
  console.log('[Service Worker] Tentativo sincronizzazione dati offline...');
  try {
    const clients = await self.clients.matchAll();
    if (clients.length === 0) return Promise.resolve();
    const syncPromises = clients.map(client => {
      return client.postMessage({ type: 'SYNC_OFFLINE_DATA', timestamp: new Date().toISOString() });
    });
    await Promise.all(syncPromises);
    return Promise.resolve();
  } catch (error) {
    return Promise.resolve();
  }
}

// Handle messages (Originale intatto)
self.addEventListener('message', event => {
  const { data, ports } = event;
  if (data && data.type) {
    if (data.type === 'CLEAR_CACHE') {
      caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      }).then(() => {
        if (ports && ports[0]) ports[0].postMessage({ success: true, message: 'Cache pulita' });
      }).catch(error => {
        if (ports && ports[0]) ports[0].postMessage({ success: false, error: error.message });
      });
    }
    if (data.type === 'CHECK_UPDATE') {
      self.registration.update().then(() => {
        if (ports && ports[0]) ports[0].postMessage({ updateAvailable: true });
      }).catch(error => {
        if (ports && ports[0]) ports[0].postMessage({ updateAvailable: false, error: error.message });
      });
    }
  }
});