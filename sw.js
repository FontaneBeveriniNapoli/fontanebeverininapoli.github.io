// Service Worker per Fontane & Beverini Napoli PWA

const CACHE_NAME = 'fontane-napoli-pwa-v1.2';
const OFFLINE_URL = '/fontane/index.html';

// Risorse da memorizzare nella cache
const PRECACHE_RESOURCES = [
    '/fontane/',
    '/fontane/index.html',
    '/fontane/style.css',
    '/fontane/app.js',
    '/fontane/manifest.json',
    '/fontane/sw.js',
    
    // Immagini
    '/fontane/images/icona-avvio.png',
    '/fontane/images/icona-avvio-512.png',
    '/fontane/images/icona-avvio-splash.png',
    '/fontane/images/logo-comune.png',
    '/fontane/images/sfondo-home.jpg',
    
    // CDN esterni
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css'
];

// Installazione Service Worker
self.addEventListener('install', event => {
    console.log('[Service Worker] Installazione in corso...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Cache aperta');
                return cache.addAll(PRECACHE_RESOURCES);
            })
            .then(() => {
                console.log('[Service Worker] Tutte le risorse precaricate');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[Service Worker] Errore installazione:', error);
            })
    );
});

// Attivazione Service Worker
self.addEventListener('activate', event => {
    console.log('[Service Worker] Attivazione in corso...');
    
    // Rimuovi vecchie cache
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
        })
        .then(() => {
            console.log('[Service Worker] Attivazione completata');
            return self.clients.claim();
        })
    );
});

// Gestione richieste fetch
self.addEventListener('fetch', event => {
    // Skip richieste non GET
    if (event.request.method !== 'GET') return;
    
    // Skip richieste Firebase e altre API
    if (event.request.url.includes('firebase') ||
        event.request.url.includes('googleapis') ||
        event.request.url.includes('gstatic.com') ||
        event.request.url.match(/\/api\//)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Se risorsa in cache, ritorna
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Altrimenti fai fetch
                return fetch(event.request)
                    .then(response => {
                        // Controlla risposta valida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clona risposta
                        const responseToCache = response.clone();
                        
                        // Aggiungi a cache
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.error('[Service Worker] Fetch fallito:', error);
                        
                        // Per pagine HTML, ritorna offline page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                        
                        // Per altre risorse, ritorna messaggio di errore
                        return new Response('Network error - Offline mode', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// Gestione messaggi dal client
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME);
    }
});

// Gestione sync
self.addEventListener('sync', event => {
    console.log('[Service Worker] Sync event:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    console.log('[Service Worker] Sincronizzazione dati offline...');
    // Implementa sincronizzazione dati offline
}

// Gestione push notifications
self.addEventListener('push', event => {
    console.log('[Service Worker] Push notification ricevuta');
    
    const options = {
        body: event.data ? event.data.text() : 'Nuovo aggiornamento disponibile',
        icon: '/fontane/images/icona-avvio.png',
        badge: '/fontane/images/icona-avvio.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/fontane/'
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
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url || '/fontane/');
                }
            })
    );
});

console.log('[Service Worker] Caricato correttamente');