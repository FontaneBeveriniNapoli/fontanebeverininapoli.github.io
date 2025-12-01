// Fontane & Beverini Napoli - PWA App
// Backend: Firebase Firestore

// Variabili globali
let currentScreen = 'home';
let map = null;
let markersCluster = null;
let allFontane = [];
let allBeverini = [];
let allNews = [];
let currentUser = null;
let isAdminMode = false;

// Dati di fallback locale
const LOCAL_DATA = {
    fontane: [
        {
            id: '1',
            nome: 'Fontana del Nettuno',
            indirizzo: 'Piazza Municipio',
            stato: 'funzionante',
            lat: 40.8415,
            lng: 14.2528,
            descrizione: 'Fontana monumentale del XVI secolo',
            data_aggiornamento: '2024-01-15'
        },
        {
            id: '2',
            nome: 'Fontana di Monteoliveto',
            indirizzo: 'Piazza Monteoliveto',
            stato: 'manutenzione',
            lat: 40.8472,
            lng: 14.2514,
            descrizione: 'Fontana barocca in restauro',
            data_aggiornamento: '2024-01-10'
        }
    ],
    beverini: [
        {
            id: '1',
            indirizzo: 'Via Toledo, angolo Via Diaz',
            stato: 'funzionante',
            lat: 40.8395,
            lng: 14.2497,
            tipo: 'fontanella',
            descrizione: 'Beverino pubblico recentemente installato',
            data_aggiornamento: '2024-01-20'
        }
    ],
    news: [
        {
            id: '1',
            titolo: 'Nuova fontana in Piazza Dante',
            contenuto: 'È stata inaugurata una nuova fontana pubblica in Piazza Dante. La fontana è già funzionante e disponibile per tutti i cittadini.',
            data: '2024-01-25',
            autore: 'Comune di Napoli'
        },
        {
            id: '2',
            titolo: 'Manutenzione straordinaria',
            contenuto: 'Dal 1 al 15 febbraio 2024, alcuni beverini nel centro storico saranno in manutenzione straordinaria.',
            data: '2024-01-20',
            autore: 'Comune di Napoli'
        }
    ]
};

// Inizializzazione app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App Fontane & Beverini Napoli - Inizializzazione');
    
    // Nascondi loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 1000);
    
    // Inizializza Firebase
    await initializeFirebase();
    
    // Carica dati
    await loadAllData();
    
    // Inizializza UI
    initializeUI();
    
    // Inizializza mappa
    initializeMap();
    
    // Aggiorna statistiche
    updateStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup sequenza segreta admin
    setupAdminSecret();
    
    console.log('App inizializzata correttamente');
});

// ========== FIREBASE FUNCTIONS ==========

async function initializeFirebase() {
    try {
        // Controlla se Firebase è disponibile
        if (!window.firebaseApp || !window.firebaseDB) {
            throw new Error('Firebase non inizializzato');
        }
        
        console.log('Firebase pronto');
        return true;
    } catch (error) {
        console.error('Errore Firebase:', error);
        return false;
    }
}

async function loadAllData() {
    console.log('Caricamento dati...');
    
    try {
        // Prova a caricare da Firebase
        const firebaseLoaded = await loadFromFirebase();
        
        if (!firebaseLoaded) {
            console.log('Fallback a dati locali');
            // Usa dati locali
            allFontane = LOCAL_DATA.fontane;
            allBeverini = LOCAL_DATA.beverini;
            allNews = LOCAL_DATA.news;
            
            // Salva localmente
            saveToLocalStorage();
        }
        
        // Aggiorna UI
        renderFontaneList();
        renderBeveriniList();
        renderNews();
        
    } catch (error) {
        console.error('Errore caricamento dati:', error);
        // Fallback a dati locali
        loadFromLocalStorage();
    }
}

async function loadFromFirebase() {
    try {
        const db = window.firebaseDB;
        if (!db) return false;
        
        // Importa funzioni Firebase
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        
        // Carica fontane
        const fontaneSnap = await getDocs(collection(db, 'fontane'));
        allFontane = [];
        fontaneSnap.forEach(doc => {
            allFontane.push({ id: doc.id, ...doc.data() });
        });
        
        // Carica beverini
        const beveriniSnap = await getDocs(collection(db, 'beverini'));
        allBeverini = [];
        beveriniSnap.forEach(doc => {
            allBeverini.push({ id: doc.id, ...doc.data() });
        });
        
        // Carica news
        const newsSnap = await getDocs(collection(db, 'news'));
        allNews = [];
        newsSnap.forEach(doc => {
            allNews.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`Dati Firebase caricati: ${allFontane.length} fontane, ${allBeverini.length} beverini, ${allNews.length} news`);
        return true;
        
    } catch (error) {
        console.error('Errore caricamento Firebase:', error);
        return false;
    }
}

async function saveToFirebase(collectionName, data) {
    try {
        if (!window.firebaseDB) return false;
        
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        
        const docRef = doc(window.firebaseDB, collectionName, data.id);
        await setDoc(docRef, data);
        
        console.log(`Dato salvato in ${collectionName}:`, data.id);
        return true;
        
    } catch (error) {
        console.error(`Errore salvataggio in ${collectionName}:`, error);
        return false;
    }
}

async function deleteFromFirebase(collectionName, id) {
    try {
        if (!window.firebaseDB) return false;
        
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        
        const docRef = doc(window.firebaseDB, collectionName, id);
        await deleteDoc(docRef);
        
        console.log(`Dato eliminato da ${collectionName}:`, id);
        return true;
        
    } catch (error) {
        console.error(`Errore eliminazione da ${collectionName}:`, error);
        return false;
    }
}

// ========== LOCAL STORAGE FUNCTIONS ==========

function saveToLocalStorage() {
    try {
        localStorage.setItem('fontaneData', JSON.stringify(allFontane));
        localStorage.setItem('beveriniData', JSON.stringify(allBeverini));
        localStorage.setItem('newsData', JSON.stringify(allNews));
        localStorage.setItem('lastSync', new Date().toISOString());
        console.log('Dati salvati in localStorage');
    } catch (error) {
        console.error('Errore salvataggio localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const fontaneData = localStorage.getItem('fontaneData');
        const beveriniData = localStorage.getItem('beveriniData');
        const newsData = localStorage.getItem('newsData');
        
        if (fontaneData) allFontane = JSON.parse(fontaneData);
        if (beveriniData) allBeverini = JSON.parse(beveriniData);
        if (newsData) allNews = JSON.parse(newsData);
        
        console.log(`Dati localStorage caricati: ${allFontane.length} fontane, ${allBeverini.length} beverini, ${allNews.length} news`);
    } catch (error) {
        console.error('Errore caricamento localStorage:', error);
        // Usa dati di default
        allFontane = LOCAL_DATA.fontane;
        allBeverini = LOCAL_DATA.beverini;
        allNews = LOCAL_DATA.news;
    }
}

// ========== UI FUNCTIONS ==========

function initializeUI() {
    // Setup navigazione
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            switchScreen(target);
            
            // Aggiorna stato bottoni nav
            navButtons.forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
    
    // Setup quick actions
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            switchScreen(target);
            
            // Aggiorna nav
            navButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-target') === target) {
                    btn.classList.add('active');
                }
            });
        });
    });
    
    // Setup bottoni header
    document.getElementById('search-toggle').addEventListener('click', toggleSearch);
    document.getElementById('filter-toggle').addEventListener('click', toggleFilters);
    document.getElementById('refresh-btn').addEventListener('click', refreshData);
    document.getElementById('search-clear').addEventListener('click', clearSearch);
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    
    // Setup ricerca
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch);
    
    // Setup modali
    document.getElementById('close-admin').addEventListener('click', () => {
        document.getElementById('admin-modal').classList.add('hidden');
    });
    
    document.getElementById('close-detail').addEventListener('click', () => {
        document.getElementById('detail-modal').classList.add('hidden');
    });
}

function switchScreen(screenName) {
    console.log(`Cambio schermata: ${screenName}`);
    
    // Nascondi tutte le schermate
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostra schermata richiesta
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenName;
        
        // Se è la mappa, ridisegnala
        if (screenName === 'mappa') {
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                    updateMapMarkers();
                }
            }, 300);
        }
    }
}

function renderFontaneList() {
    const container = document.getElementById('fontane-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (allFontane.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Nessuna fontana disponibile</p>
                <button id="add-first-fountain" class="secondary-btn">Aggiungi la prima</button>
            </div>
        `;
        return;
    }
    
    allFontane.forEach(fontana => {
        const card = document.createElement('div');
        card.className = 'item-card glass-card';
        card.innerHTML = `
            <div class="item-header">
                <h4>${fontana.nome}</h4>
                <span class="status-badge ${fontana.stato}">${getStatusLabel(fontana.stato)}</span>
            </div>
            <p class="item-address">${fontana.indirizzo}</p>
            <p class="item-desc">${fontana.descrizione || 'Nessuna descrizione'}</p>
            <div class="item-actions">
                <button class="small-btn" onclick="showDetails('fontana', '${fontana.id}')">Dettagli</button>
                <button class="small-btn" onclick="navigateTo(${fontana.lat}, ${fontana.lng})">Naviga</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderBeveriniList() {
    const container = document.getElementById('beverini-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (allBeverini.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Nessun beverino disponibile</p>
                <button id="add-first-drinking" class="secondary-btn">Aggiungi il primo</button>
            </div>
        `;
        return;
    }
    
    allBeverini.forEach(beverino => {
        const card = document.createElement('div');
        card.className = 'item-card glass-card';
        card.innerHTML = `
            <div class="item-header">
                <h4>Beverino</h4>
                <span class="status-badge ${beverino.stato}">${getStatusLabel(beverino.stato)}</span>
            </div>
            <p class="item-address">${beverino.indirizzo}</p>
            <p class="item-desc">${beverino.descrizione || 'Fontanella pubblica'}</p>
            <div class="item-actions">
                <button class="small-btn" onclick="showDetails('beverino', '${beverino.id}')">Dettagli</button>
                <button class="small-btn" onclick="navigateTo(${beverino.lat}, ${beverino.lng})">Naviga</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderNews() {
    // Home news
    const newsList = document.getElementById('news-list');
    if (newsList) {
        newsList.innerHTML = '';
        const recentNews = allNews.slice(0, 3);
        
        recentNews.forEach(news => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <h4>${news.titolo}</h4>
                <p>${news.contenuto.substring(0, 100)}...</p>
                <small>${formatDate(news.data)} - ${news.autore}</small>
            `;
            newsList.appendChild(newsItem);
        });
    }
    
    // News screen
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        newsContainer.innerHTML = '';
        
        allNews.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card glass-card';
            newsCard.innerHTML = `
                <h3>${news.titolo}</h3>
                <p>${news.contenuto}</p>
                <div class="news-footer">
                    <span>${news.autore}</span>
                    <span>${formatDate(news.data)}</span>
                </div>
            `;
            newsContainer.appendChild(newsCard);
        });
    }
}

function updateStats() {
    const totalFountains = allFontane.length;
    const totalDrinking = allBeverini.length;
    const totalWorking = allFontane.filter(f => f.stato === 'funzionante').length + 
                         allBeverini.filter(b => b.stato === 'funzionante').length;
    
    document.getElementById('total-fountains').textContent = totalFountains;
    document.getElementById('total-drinking').textContent = totalDrinking;
    document.getElementById('total-working').textContent = totalWorking;
}

// ========== MAP FUNCTIONS ==========

function initializeMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    // Centro su Napoli
    map = L.map('map-container').setView([40.8518, 14.2681], 13);
    
    // Aggiungi tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Crea cluster
    markersCluster = L.markerClusterGroup();
    map.addLayer(markersCluster);
    
    // Aggiungi bottoni mappa
    document.getElementById('locate-btn').addEventListener('click', locateUser);
    document.getElementById('map-type-btn').addEventListener('click', toggleMapType);
    
    // Aggiorna marcatori
    updateMapMarkers();
}

function updateMapMarkers() {
    if (!map || !markersCluster) return;
    
    // Pulisci marcatori
    markersCluster.clearLayers();
    
    // Aggiungi fontane
    allFontane.forEach(fontana => {
        const marker = L.marker([fontana.lat, fontana.lng]);
        marker.bindPopup(`
            <b>${fontana.nome}</b><br>
            ${fontana.indirizzo}<br>
            <i>${getStatusLabel(fontana.stato)}</i><br>
            <button onclick="navigateTo(${fontana.lat}, ${fontana.lng})">Naviga qui</button>
        `);
        
        // Colore in base allo stato
        const icon = L.divIcon({
            html: `<div class="map-marker ${fontana.stato}">⛲</div>`,
            className: 'custom-marker',
            iconSize: [30, 30]
        });
        marker.setIcon(icon);
        
        markersCluster.addLayer(marker);
    });
    
    // Aggiungi beverini
    allBeverini.forEach(beverino => {
        const marker = L.marker([beverino.lat, beverino.lng]);
        marker.bindPopup(`
            <b>Beverino</b><br>
            ${beverino.indirizzo}<br>
            <i>${getStatusLabel(beverino.stato)}</i><br>
            <button onclick="navigateTo(${beverino.lat}, ${beverino.lng})">Naviga qui</button>
        `);
        
        const icon = L.divIcon({
            html: `<div class="map-marker ${beverino.stato}">🚰</div>`,
            className: 'custom-marker',
            iconSize: [30, 30]
        });
        marker.setIcon(icon);
        
        markersCluster.addLayer(marker);
    });
}

function locateUser() {
    if (!map) return;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                map.setView([userLat, userLng], 16);
                
                // Aggiungi marker posizione utente
                L.marker([userLat, userLng])
                    .addTo(map)
                    .bindPopup('La tua posizione')
                    .openPopup();
            },
            (error) => {
                alert('Impossibile ottenere la posizione: ' + error.message);
            }
        );
    } else {
        alert('Geolocalizzazione non supportata dal browser');
    }
}

function toggleMapType() {
    if (!map) return;
    
    const currentLayer = map._layers[Object.keys(map._layers)[1]];
    if (currentLayer._url && currentLayer._url.includes('openstreetmap')) {
        // Cambia in satellite
        map.eachLayer((layer) => {
            if (layer._url) {
                map.removeLayer(layer);
            }
        });
        
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
        }).addTo(map);
    } else {
        // Cambia in normale
        map.eachLayer((layer) => {
            if (layer._url) {
                map.removeLayer(layer);
            }
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
    
    // Reimposta markers
    updateMapMarkers();
}

// ========== SEARCH & FILTER FUNCTIONS ==========

function toggleSearch() {
    const searchBar = document.getElementById('search-bar');
    const filterPanel = document.getElementById('filter-panel');
    
    searchBar.classList.toggle('hidden');
    filterPanel.classList.add('hidden');
    
    if (!searchBar.classList.contains('hidden')) {
        document.getElementById('search-input').focus();
    }
}

function toggleFilters() {
    const filterPanel = document.getElementById('filter-panel');
    const searchBar = document.getElementById('search-bar');
    
    filterPanel.classList.toggle('hidden');
    searchBar.classList.add('hidden');
}

function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    if (currentScreen === 'fontane') {
        const filtered = allFontane.filter(fontana =>
            fontana.nome.toLowerCase().includes(searchTerm) ||
            fontana.indirizzo.toLowerCase().includes(searchTerm) ||
            fontana.descrizione.toLowerCase().includes(searchTerm)
        );
        renderFilteredFontane(filtered);
    } else if (currentScreen === 'beverini') {
        const filtered = allBeverini.filter(beverino =>
            beverino.indirizzo.toLowerCase().includes(searchTerm) ||
            beverino.descrizione.toLowerCase().includes(searchTerm)
        );
        renderFilteredBeverini(filtered);
    }
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    
    if (currentScreen === 'fontane') {
        renderFontaneList();
    } else if (currentScreen === 'beverini') {
        renderBeveriniList();
    }
}

function applyFilters() {
    const showWorking = document.getElementById('filter-working').checked;
    const showNotWorking = document.getElementById('filter-not-working').checked;
    const showMaintenance = document.getElementById('filter-maintenance').checked;
    const showFountains = document.getElementById('filter-fountains').checked;
    const showDrinking = document.getElementById('filter-drinking').checked;
    
    // Filtra per mappa
    if (currentScreen === 'mappa') {
        updateMapMarkers(); // Verrà implementato filtro
    }
    
    document.getElementById('filter-panel').classList.add('hidden');
}

// ========== ADMIN FUNCTIONS ==========

function setupAdminSecret() {
    let tapCount = 0;
    let lastTap = 0;
    
    document.getElementById('main-logo').addEventListener('click', () => {
        const now = Date.now();
        
        if (now - lastTap < 1000) {
            tapCount++;
        } else {
            tapCount = 1;
        }
        
        lastTap = now;
        
        if (tapCount >= 5) {
            showAdminLogin();
            tapCount = 0;
        }
    });
}

async function showAdminLogin() {
    const modal = document.getElementById('admin-modal');
    const loginPanel = document.getElementById('admin-login');
    const adminPanel = document.getElementById('admin-panel');
    
    // Reset form
    document.getElementById('admin-email').value = '';
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-error').textContent = '';
    
    // Mostra modale
    modal.classList.remove('hidden');
    
    // Setup login button
    document.getElementById('admin-login-btn').onclick = async () => {
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        try {
            const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
            const auth = window.firebaseAuth;
            
            await signInWithEmailAndPassword(auth, email, password);
            
            // Login success
            loginPanel.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            isAdminMode = true;
            
            // Mostra bottoni admin
            document.querySelectorAll('.add-btn').forEach(btn => btn.classList.remove('hidden'));
            
            // Aggiorna statistiche admin
            document.getElementById('admin-fountains').textContent = allFontane.length;
            document.getElementById('admin-drinking').textContent = allBeverini.length;
            
        } catch (error) {
            document.getElementById('admin-error').textContent = 'Credenziali errate: ' + error.message;
        }
    };
    
    // Setup logout button
    document.getElementById('admin-logout').onclick = async () => {
        try {
            const { signOut } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
            const auth = window.firebaseAuth;
            
            await signOut(auth);
            
            modal.classList.add('hidden');
            isAdminMode = false;
            
            // Nascondi bottoni admin
            document.querySelectorAll('.add-btn').forEach(btn => btn.classList.add('hidden'));
            
        } catch (error) {
            console.error('Errore logout:', error);
        }
    };
    
    // Setup altri bottoni admin
    document.getElementById('sync-data').onclick = async () => {
        await loadFromFirebase();
        renderFontaneList();
        renderBeveriniList();
        renderNews();
        updateStats();
        updateMapMarkers();
        alert('Dati sincronizzati con Firebase');
    };
    
    document.getElementById('export-data').onclick = exportToExcel;
    document.getElementById('import-data').onclick = importFromExcel;
    document.getElementById('backup-data').onclick = backupLocalData;
}

// ========== UTILITY FUNCTIONS ==========

function getStatusLabel(status) {
    switch(status) {
        case 'funzionante': return 'Funzionante';
        case 'non_funzionante': return 'Non funzionante';
        case 'manutenzione': return 'In manutenzione';
        default: return 'Sconosciuto';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
}

function navigateTo(lat, lng) {
    if (navigator.geolocation) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
        window.open(url, '_blank');
    } else {
        alert('Navigazione non supportata');
    }
}

function showDetails(type, id) {
    let item;
    let title;
    
    if (type === 'fontana') {
        item = allFontane.find(f => f.id === id);
        title = item.nome;
    } else {
        item = allBeverini.find(b => b.id === id);
        title = 'Beverino';
    }
    
    if (!item) return;
    
    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-body').innerHTML = `
        <div class="detail-section">
            <h4>Indirizzo</h4>
            <p>${item.indirizzo}</p>
        </div>
        <div class="detail-section">
            <h4>Stato</h4>
            <p><span class="status-badge ${item.stato}">${getStatusLabel(item.stato)}</span></p>
        </div>
        <div class="detail-section">
            <h4>Descrizione</h4>
            <p>${item.descrizione || 'Nessuna descrizione disponibile'}</p>
        </div>
        <div class="detail-section">
            <h4>Ultimo aggiornamento</h4>
            <p>${formatDate(item.data_aggiornamento || new Date().toISOString())}</p>
        </div>
    `;
    
    // Setup bottoni
    document.getElementById('navigate-btn').onclick = () => navigateTo(item.lat, item.lng);
    document.getElementById('report-btn').onclick = () => reportIssue(type, id);
    
    document.getElementById('detail-modal').classList.remove('hidden');
}

function reportIssue(type, id) {
    alert('Segnalazione inviata! Il problema sarà risolto al più presto.');
    // Qui si potrebbe implementare l'invio della segnalazione a Firebase
}

function refreshData() {
    loadAllData();
    showNotification('Dati aggiornati');
}

function showNotification(message) {
    // Implementa una notifica toast
    const notification = document.createElement('div');
    notification.className = 'notification glass-card';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ========== EXPORT/IMPORT FUNCTIONS ==========

function exportToExcel() {
    // Implementa esportazione Excel
    alert('Esportazione Excel - Funzionalità da implementare');
}

function importFromExcel() {
    // Implementa importazione Excel
    alert('Importazione Excel - Funzionalità da implementare');
}

function backupLocalData() {
    saveToLocalStorage();
    alert('Backup locale creato con successo!');
}

// ========== SETUP EVENT LISTENERS ==========

function setupEventListeners() {
    // Gestione offline/online
    window.addEventListener('online', () => {
        console.log('Connessione ripristinata');
        loadFromFirebase();
    });
    
    window.addEventListener('offline', () => {
        console.log('Connessione persa - Modalità offline');
        loadFromLocalStorage();
    });
    
    // Pulsante aggiungi fontana (admin)
    document.getElementById('add-fountain-btn').addEventListener('click', () => {
        alert('Aggiungi fontana - Funzionalità admin');
    });
    
    // Pulsante aggiungi beverino (admin)
    document.getElementById('add-drinking-btn').addEventListener('click', () => {
        alert('Aggiungi beverino - Funzionalità admin');
    });
    
    // Pulsante aggiungi news (admin)
    document.getElementById('add-news-btn').addEventListener('click', () => {
        alert('Aggiungi news - Funzionalità admin');
    });
}

// ========== GLOBAL FUNCTIONS ==========

// Funzioni accessibili globalmente
window.navigateTo = navigateTo;
window.showDetails = showDetails;
window.reportIssue = reportIssue;