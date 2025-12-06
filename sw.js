const CACHE_NAME = 'fontane-beverini-v2.0.0';
const SYNC_QUEUE = 'sync-queue';
const MAX_RETRY_ATTEMPTS = 3;

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
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
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta, aggiungendo file...');
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Errore cache.addAll:', error);
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

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== SYNC_QUEUE) {
            console.log('Cancellazione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker attivato');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis')) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.url.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        });
      })
      .catch(() => {
        if (event.request.url.includes('.html') || 
            event.request.url === self.location.origin + '/' ||
            event.request.url === self.location.origin + '/index.html') {
          return caches.match('/index.html');
        }
        
        return new Response('Connessione assente', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  console.log('Sincronizzazione dati in background...');
  
  try {
    const { collection, getDocs, setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    
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
          const docRef = doc(window.db, collectionName, item.id);
          await setDoc(docRef, item.data);
        } else {
          await setDoc(doc(dataRef), item.data);
        }
        
        console.log(`Sincronizzato: ${item.type} ${item.id || 'nuovo'}`);
      } catch (error) {
        console.error(`Errore sincronizzazione ${item.type}:`, error);
      }
    }
    
    localStorage.removeItem('offlineData');
    
    console.log('Sincronizzazione completata');
    
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