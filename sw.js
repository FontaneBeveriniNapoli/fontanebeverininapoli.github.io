// Service Worker per Fontane & Beverini Napoli PWA

const CACHE_NAME = 'fontane-napoli-v1.0';
const urlsToCache = [
  '/fontane/',
  '/fontane/index.html',
  '/fontane/style.css',
  '/fontane/app.js',
  '/fontane/manifest.json',
  '/fontane/images/icona-avvio.png',
  '/fontane/images/icona-avvio-splash.png',
  '/fontane/images/logo-comune.png',
  '/fontane/images/sfondo-home.jpg',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css'
];

// Installazione
self.addEventListener('install', event => {
  console.log('[Service Worker] Installazione in corso...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache aperta');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Installazione completata');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Errore installazione:', error);
      })
  );
});

// Attivazione
self.addEventListener('activate', event => {
  console.log('[Service Worker] Attivazione in corso...');
  
  // Pulisci vecchie cache
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Rimozione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Attivazione completata');
      return self.clients.claim();
    })
  );
});

// Fetch
self.addEventListener('fetch', event => {
  // Escludi richieste Firebase e Google Maps
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - ritorna risorsa
        if (response) {
          return response;
        }
        
        // Altrimenti fai richiesta
        return fetch(event.request)
          .then(response => {
            // Controlla se la risposta è valida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clona la risposta
            const responseToCache = response.clone();
            
            // Aggiungi alla cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch fallito:', error);
            
            // Per pagine HTML, ritorna home page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/fontane/index.html');
            }
            
            // Per altre risorse, ritorna fallback
            return new Response(JSON.stringify({
              error: 'Network error',
              message: 'Sei offline. I dati potrebbero non essere aggiornati.'
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
      })
  );
});

// Sync
self.addEventListener('sync', event => {
  console.log('[Service Worker] Sync event:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[Service Worker] Sincronizzazione dati...');
  
  // Qui implementeresti la sincronizzazione con Firebase
  // Per ora è solo un placeholder
  return Promise.resolve();
}

// Messaggi
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push ricevuto:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nuova notifica da Fontane Napoli',
    icon: '/fontane/images/icona-avvio.png',
    badge: '/fontane/images/icona-avvio.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Fontane Napoli', options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notifica cliccata');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/fontane/');
      }
    })
  );
});