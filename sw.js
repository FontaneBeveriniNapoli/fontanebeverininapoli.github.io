const CACHE_NAME = 'fontane-beverini-v3.7.1'; // VERSIONE AGGIORNATA
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v2';

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
  './images/sfondo-home.jpg',         // Immagine Desktop
  './images/sfondo-home-mobile.jpg',  // NUOVA AGGIUNTA: Immagine Mobile
  './images/default-beverino.jpg',
  './images/icona-avvio-144.png',
  './images/icona-avvio-192.png',
  './images/icona-avvio-512.png',
  './images/icona-avvio-splash.png',
  './images/apple-touch-icon.png',
  './images/favicon.ico',
  './images/favicon-16x16.png',
  './images/favicon-32x32.png'  
];

const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
];

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
              console.warn(`[Service Worker] Asset non trovato: ${url}`);
              return Promise.resolve();
            })
            .catch(error => {
              console.warn(`[Service Worker] Errore caching ${url}:`, error.message);
              return Promise.resolve(); 
            });
        });
        
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('[Service Worker] Installazione completata');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Errore installazione:', error);
        return self.skipWaiting(); 
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Attivazione...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Pulisce le vecchie versioni
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Cancellazione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Attivazione completata');
      return self.clients.claim();
    })
    .catch(error => {
      console.error('[Service Worker] Errore attivazione:', error);
    })
  );
});

// Fetch Strategy
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Ignora schemi non supportati
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'chrome:' || 
      url.protocol === 'about:' ||
      url.protocol === 'data:' ||
      url.protocol === 'blob:' ||
      url.protocol === 'file:') {
    return;
  }
  
  // Ignora chiamate API/Firebase/Analytics (gestite dal browser direttamente o SDK)
  if (url.href.includes('firebase') ||
      url.href.includes('nominatim') ||
      url.href.includes('gstatic.com') ||
      url.href.includes('googleapis.com') ||
      url.href.includes('/analytics') ||
      url.href.includes('/firestore')) {
    return fetch(event.request);
  }

  // 1. GESTIONE SPECIALE IMMAGINI (Logica Cache-on-Demand)
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // A. Se è in cache (l'hai già vista), usala subito
        if (cachedResponse) {
          return cachedResponse;
        }

        // B. Se non è in cache, prova a scaricarla dalla rete
        return fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
             // C. Se il download riesce, SALVALA in cache per il futuro (offline)
             const responseToCache = networkResponse.clone();
             caches.open(DYNAMIC_CACHE).then(cache => {
               cache.put(event.request, responseToCache);
             });
          }
          return networkResponse;
        }).catch(() => {
          // D. SE SEI OFFLINE E NON È IN CACHE:
          // Ritorniamo un errore (404 o null) invece di un'immagine generica.
          // Questo farà scattare l'evento 'onerror' nel tag <img> in app.js,
          // che a quel punto deciderà quale immagine di default mostrare (Fontana o Beverino).
          return new Response(null, { status: 404, statusText: 'Not found in cache' });
        });
      })
    );
    return;
  }
  
  // 2. GESTIONE ALTRE RISORSE STATICHE (Maps, Script, CSS, HTML)
  // Cache-First strategy standard
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Se non è valida, prova a ritornare l'index.html (SPA routing)
            if (!response.ok) {
              if (event.request.url.includes('index.html') || 
                  event.request.headers.get('accept')?.includes('text/html')) {
                return caches.match('./index.html');
              }
              return response;
            }
            
            // Cache dinamica per altre risorse http (non esterne se non voluto)
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                if (event.request.url.startsWith('http')) {
                  return cache.put(event.request, responseToCache);
                }
              })
              .catch(err => console.warn('[SW] Cache put error:', err));
            
            return response;
          })
          .catch(error => {
            // Fallback Offline Generico
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('./index.html');
            }
            return new Response('Offline', { status: 503, statusText: 'Offline' });
          });
      })
  );
});

// Background Sync
self.addEventListener('sync', event => {
  console.log('[Service Worker] Sync event:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      syncOfflineData().catch(error => {
        console.error('[Service Worker] Sync error:', error);
        return Promise.resolve();
      })
    );
  }
});

async function syncOfflineData() {
  console.log('[Service Worker] Tentativo sincronizzazione dati offline...');
  
  try {
    const clients = await self.clients.matchAll();
    
    if (clients.length === 0) {
      console.log('[Service Worker] Nessun client attivo per la sincronizzazione');
      return Promise.resolve();
    }
    
    const syncPromises = clients.map(client => {
      return client.postMessage({
        type: 'SYNC_OFFLINE_DATA',
        timestamp: new Date().toISOString()
      });
    });
    
    await Promise.all(syncPromises);
    console.log('[Service Worker] Messaggio sync inviato a', clients.length, 'client(s)');
    
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Errore durante sync:', error);
    return Promise.resolve();
  }
}

// Handle messages
self.addEventListener('message', event => {
  const { data, ports } = event;
  
  if (data && data.type) {
    if (data.type === 'CLEAR_CACHE') {
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        })
        .then(() => {
          if (ports && ports[0]) {
            ports[0].postMessage({ success: true, message: 'Cache pulita' });
          }
        })
        .catch(error => {
          if (ports && ports[0]) {
            ports[0].postMessage({ success: false, error: error.message });
          }
        });
    }
    
    if (data.type === 'CHECK_UPDATE') {
      self.registration.update()
        .then(() => {
          if (ports && ports[0]) {
            ports[0].postMessage({ updateAvailable: true });
          }
        })
        .catch(error => {
          if (ports && ports[0]) {
            ports[0].postMessage({ updateAvailable: false, error: error.message });
          }
        });
    }
  }
});