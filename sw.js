const CACHE_NAME = 'fontane-beverini-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  
  // ✅ IMMAGINI PRINCIPALI
  './images/logo-app.png',
  './images/logo-comune.png',
  './images/sfondo-home.jpg',
  
  // ✅ ICONE PWA (TUTTE)
  './images/icona-avvio-144.png',
  './images/icona-avvio-192.png',
  './images/icona-avvio-512.png',
  './images/icona-avvio-splash.png',
  './images/apple-touch-icon.png',
  
  // ✅ FAVICON (PER BROWSER DESKTOP)
  './images/favicon.ico',
  './images/favicon-16x16.png',
  './images/favicon-32x32.png',
  
  // ✅ CSS ESTERNI
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta, aggiungendo file alla cache...');
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Errore durante cache.addAll:', error);
          // Aggiungi file singolarmente per debug
          return Promise.all(
            urlsToCache.map(url => {
              return cache.add(url).catch(err => {
                console.warn(`Non posso memorizzare ${url}:`, err);
              });
            })
          );
        });
      })
      .then(() => {
        console.log('Tutti i file sono stati aggiunti alla cache');
        return self.skipWaiting();
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cancellazione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker attivato con successo');
      return self.clients.claim();
    })
  );
});

// Fetch Strategy: Cache First, then Network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;

  // Skip Firebase requests (always go to network)
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For map tiles, use cache-first strategy
  if (event.request.url.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(networkResponse => {
          // Don't cache map tiles
          return networkResponse;
        });
      })
    );
    return;
  }

  // Per favicon e icone, usa cache-first con fallback
  if (event.request.url.includes('favicon') || 
      event.request.url.includes('apple-touch-icon') ||
      event.request.url.includes('icona-avvio')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(networkResponse => {
          // Cache the response if it's valid
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback per icone mancanti
          if (event.request.url.includes('favicon')) {
            return caches.match('./images/favicon.ico');
          }
          if (event.request.url.includes('icona-avvio-192')) {
            return caches.match('./images/icona-avvio-192.png');
          }
          return new Response('Icona non trovata', { status: 404 });
        });
      })
    );
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(networkResponse => {
          // Don't cache if not a success response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clone the response
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        });
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.url.includes('.html') || 
            event.request.url === self.location.origin + '/' ||
            event.request.url === self.location.origin + '/index.html') {
          return caches.match('/index.html');
        }
        
        // Per immagini, restituisci placeholder
        if (event.request.url.match(/\.(jpg|jpeg|png|gif|ico)$/i)) {
          if (event.request.url.includes('sfondo-home')) {
            return caches.match('./images/sfondo-home.jpg');
          }
          return new Response('', { 
            status: 404, 
            headers: { 'Content-Type': 'text/plain' } 
          });
        }
        
        return new Response('Connessione assente', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Background Sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  console.log('Sincronizzazione dati in background...');
  
  try {
    const { collection, getDocs, setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    
    // Recupera dati offline dal localStorage
    const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
    
    if (offlineData.length === 0) {
      console.log('Nessun dato offline da sincronizzare');
      return;
    }
    
    console.log(`Sincronizzazione di ${offlineData.length} elementi...`);
    
    for (const item of offlineData) {
      try {
        const collectionName = item.type === 'fontana' ? 'fontane' : 
                              item.type === 'beverino' ? 'beverini' : 'news';
        
        const dataRef = collection(window.db, collectionName);
        if (item.id) {
          // Aggiorna documento esistente
          const docRef = doc(window.db, collectionName, item.id);
          await setDoc(docRef, item.data);
        } else {
          // Crea nuovo documento
          await setDoc(doc(dataRef), item.data);
        }
        
        console.log(`Sincronizzato: ${item.type} ${item.id || 'nuovo'}`);
      } catch (error) {
        console.error(`Errore sincronizzazione ${item.type}:`, error);
      }
    }
    
    // Pulisci dati offline dopo sincronizzazione
    localStorage.removeItem('offlineData');
    
    console.log('Sincronizzazione completata');
    
    // Invia notifica all'app
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          count: offlineData.length
        });
      });
    });
    
  } catch (error) {
    console.error('Errore nella sincronizzazione background:', error);
  }
}

// Gestione messaggi dalla app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    caches.open(CACHE_NAME).then(cache => {
      cache.keys().then(keys => {
        event.ports[0].postMessage({ 
          cacheName: CACHE_NAME,
          cachedItems: keys.length,
          urls: keys.map(k => k.url)
        });
      });
    });
  }
});

// Gestione push notifications (per feature future)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nuova notifica dalla app Fontane Napoli',
    icon: './images/icona-avvio-192.png',
    badge: './images/icona-avvio-144.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Fontane Napoli', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action) {
    // Gestisci azioni personalizzate
    console.log('Azione notifica:', event.action);
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});