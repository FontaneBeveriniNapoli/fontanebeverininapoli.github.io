const CACHE_NAME = 'abc-napoli-v3.0.0';
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './analytics.js',
  './manifest.json',
  './images/logo-app.png',
  './images/logo-comune.png',
  './images/sfondo-home.jpg',
  './images/icona-avvio-144.png',
  './images/icona-avvio-192.png',
  './images/icona-avvio-512.png',
  './images/icona-avvio-splash.png',
  './images/apple-touch-icon.png',
  './images/favicon.ico',
  './images/favicon-16x16.png',
  './images/favicon-32x32.png',
  './images/screenshot-1.png'
];

// Installazione: Scarica le risorse statiche
self.addEventListener('install', event => {
  console.log('[Service Worker] Installazione...');
  // Forza l'attivazione immediata
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        // Cache robusta: se un file manca, non bloccare tutto
        const cachePromises = STATIC_ASSETS.map(url => {
          return fetch(url, { mode: 'no-cors' })
            .then(response => {
              if (response.ok || response.type === 'opaque') {
                return cache.put(url, response.clone());
              }
            })
            .catch(e => console.warn(`[SW] Skip asset: ${url}`, e));
        });
        return Promise.all(cachePromises);
      })
  );
});

// Attivazione: Pulisci vecchie cache
self.addEventListener('activate', event => {
  console.log('[Service Worker] Attivazione...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Rimozione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Gestione richieste di rete e offline
self.addEventListener('fetch', event => {
  // Ignora richieste non GET
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Ignora chiamate API esterne (Firebase, Google Maps, ecc)
  if (url.origin.includes('firebase') || 
      url.origin.includes('googleapis') || 
      url.origin.includes('gstatic')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // 1. Se è in cache, usalo
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // 2. Altrimenti prova la rete
        return fetch(event.request)
          .then(response => {
            // Se la risposta non è valida, ritornala e basta
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Se valida, salvala in cache dinamica per il futuro
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            // 3. GESTIONE ERRORI OFFLINE (FALLBACK)
            
            // FIX CRITICO: Se è uno script (.js), ritorna codice vuoto valido
            // Questo evita "Uncaught SyntaxError" che blocca l'app
            if (event.request.destination === 'script' || event.request.url.endsWith('.js')) {
                 return new Response('/* Offline: script not available */', {
                    headers: { 'Content-Type': 'application/javascript' }
                 });
            }
            
            // Se è una pagina HTML, ritorna la home (o una pagina offline se esistesse)
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('./index.html');
            }
            
            // Se è un'immagine, ritorna lo sfondo di default
            if (event.request.destination === 'image') {
              return caches.match('./images/sfondo-home.jpg');
            }
            
            // Per tutto il resto
            return new Response('Offline', { status: 503, statusText: 'Offline' });
          });
      })
  );
});

// Background Sync (Gestione salvataggio dati offline)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Notifica i client (la pagina web) che la connessione è tornata
  // La logica vera e propria è delegata ad app.js per semplicità di import moduli
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_OFFLINE_DATA', timestamp: Date.now() });
  });
}

// Gestione Messaggi dalla pagina
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});