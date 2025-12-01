// Fontane & Beverini Napoli - PWA App
// Backend Firebase Firestore

// Variabili globali
let currentScreen = 'home';
let map = null;
let markersCluster = null;
let allFontane = [];
let allBeverini = [];
let allNews = [];
let currentUser = null;
let isAdmin = false;

// Dati di fallback locali
const LOCAL_DATA = {
    fontane: [
        {
            id: '1',
            nome: 'Fontana del Nettuno',
            indirizzo: 'Piazza Municipio, Napoli',
            stato: 'funzionante',
            lat: 40.8415,
            lng: 14.2528,
            descrizione: 'Fontana monumentale del XVI secolo',
            data_aggiornamento: '2024-01-15'
        },
        {
            id: '2',
            nome: 'Fontana di Monteoliveto',
            indirizzo: 'Piazza Monteoliveto, Napoli',
            stato: 'manutenzione',
            lat: 40.8472,
            lng: 14.2514,
            descrizione: 'Fontana barocca attualmente in restauro',
            data_aggiornamento: '2024-01-10'
        },
        {
            id: '3',
            nome: 'Fontana Medina',
            indirizzo: 'Piazza Dante, Napoli',
            stato: 'funzionante',
            lat: 40.8486,
            lng: 14.2497,
            descrizione: 'Fontana pubblica recentemente ristrutturata',
            data_aggiornamento: '2024-01-20'
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
            descrizione: 'Beverino pubblico con acqua potabile',
            data_aggiornamento: '2024-01-20'
        },
        {
            id: '2',
            indirizzo: 'Via dei Tribunali, 15',
            stato: 'non_funzionante',
            lat: 40.8512,
            lng: 14.2589,
            tipo: 'fontanella',
            descrizione: 'Beverino storico in riparazione',
            data_aggiornamento: '2024-01-18'
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
        },
        {
            id: '3',
            titolo: 'Monitoraggio qualità acqua',
            contenuto: 'Tutti i beverini pubblici sono stati sottoposti a controlli di qualità. I risultati confermano la potabilità dell\'acqua.',
            data: '2024-01-18',
            autore: 'Comune di Napoli'
        }
    ]
};

// Inizializzazione dell'app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App Fontane & Beverini Napoli - Inizializzazione');
    
    // Inizializza bottom navigation
    initializeBottomNav();
    
    // Inizializza admin secret
    setupAdminSecret();
    
    // Setup event listeners
    setupEventListeners();
    
    // Nascondi loading screen
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
    
    // Inizializza Firebase
    await initializeFirebase();
    
    // Carica tutti i dati
    await loadAllData();
    
    // Inizializza mappa
    initializeMap();
    
    // Aggiorna statistiche
    updateStats();
    
    // Mostra home screen
    showScreen('home');
    
    console.log('App inizializzata correttamente');
});

// ========== BOTTOM NAVIGATION ==========

function initializeBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Rimuovi active da tutti
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Aggiungi active a quello cliccato
            this.classList.add('active');
            
            // Ottieni target screen
            const target = this.getAttribute('href').substring(1);
            
            // Cambia schermata
            showScreen(target);
        });
    });
}

// ========== SCREEN MANAGEMENT ==========

function showScreen(screenId) {
    // Nascondi tutte le schermate
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostra schermata target
    const targetScreen = document.getElementById(screenId + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
        
        // Se è la mappa, aggiorna dimensioni
        if (screenId === 'mappa' && map) {
            setTimeout(() => {
                map.invalidateSize();
                updateMapMarkers();
            }, 300);
        }
    }
}

// ========== ADMIN SECRET ==========

function setupAdminSecret() {
    let tapCount = 0;
    let lastTapTime = 0;
    
    const logo = document.getElementById('admin-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            const now = Date.now();
            
            // Reset tap count se passato più di 1 secondo
            if (now - lastTapTime > 1000) {
                tapCount = 0;
            }
            
            tapCount++;
            lastTapTime = now;
            
            console.log(`Tap count: ${tapCount}`);
            
            // Se 5 tap, apri admin
            if (tapCount >= 5) {
                openAdminPanel();
                tapCount = 0;
                
                // Feedback visivo
                logo.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    logo.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }
}

function openAdminPanel() {
    const modal = document.getElementById('adminModal');
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    
    // Reset form
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').textContent = '';
    
    // Mostra login form
    loginForm.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    
    // Mostra modale
    modal.classList.remove('hidden');
    
    console.log('Admin panel aperto');
}

// ========== FIREBASE FUNCTIONS ==========

async function initializeFirebase() {
    try {
        if (!window.firebaseApp || !window.firebaseDB) {
            console.warn('Firebase non inizializzato, uso dati locali');
            return false;
        }
        
        console.log('Firebase inizializzato correttamente');
        return true;
    } catch (error) {
        console.error('Errore inizializzazione Firebase:', error);
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
        if (!window.firebaseDB || !window.isAdmin) return false;
        
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

// ========== LOCAL STORAGE FUNCTIONS ==========

function saveToLocalStorage() {
    try {
        localStorage.setItem('fontane_napoli_fontane', JSON.stringify(allFontane));
        localStorage.setItem('fontane_napoli_beverini', JSON.stringify(allBeverini));
        localStorage.setItem('fontane_napoli_news', JSON.stringify(allNews));
        localStorage.setItem('fontane_napoli_last_sync', new Date().toISOString());
        console.log('Dati salvati in localStorage');
    } catch (error) {
        console.error('Errore salvataggio localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const fontaneData = localStorage.getItem('fontane_napoli_fontane');
        const beveriniData = localStorage.getItem('fontane_napoli_beverini');
        const newsData = localStorage.getItem('fontane_napoli_news');
        
        if (fontaneData) allFontane = JSON.parse(fontaneData);
        if (beveriniData) allBeverini = JSON.parse(beveriniData);
        if (newsData) allNews = JSON.parse(newsData);
        
        console.log(`Dati localStorage caricati: ${allFontane.length} fontane, ${allBeverini.length} beverini, ${allNews.length} news`);
        
        if (allFontane.length === 0 && allBeverini.length === 0 && allNews.length === 0) {
            throw new Error('Nessun dato in localStorage');
        }
        
    } catch (error) {
        console.error('Errore caricamento localStorage:', error);
        // Usa dati di default
        allFontane = LOCAL_DATA.fontane;
        allBeverini = LOCAL_DATA.beverini;
        allNews = LOCAL_DATA.news;
    }
}

// ========== UI RENDER FUNCTIONS ==========

function renderFontaneList() {
    const container = document.getElementById('fontaneList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (allFontane.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Nessuna fontana disponibile</p>
                ${isAdmin ? '<button class="btn-secondary" onclick="addNewItem(\'fontana\')">Aggiungi la prima</button>' : ''}
            </div>
        `;
        return;
    }
    
    allFontane.forEach(fontana => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-header">
                <h4>${fontana.nome}</h4>
                <span class="status-badge ${fontana.stato}">${getStatusLabel(fontana.stato)}</span>
            </div>
            <p class="item-address">${fontana.indirizzo}</p>
            <p class="item-desc">${fontana.descrizione || 'Nessuna descrizione'}</p>
            <div class="item-actions">
                <button class="btn-secondary" onclick="showDetails('fontana', '${fontana.id}')">
                    <i class="fas fa-info-circle"></i> Dettagli
                </button>
                <button class="btn-primary" onclick="navigateTo(${fontana.lat}, ${fontana.lng})">
                    <i class="fas fa-directions"></i> Naviga
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderBeveriniList() {
    const container = document.getElementById('beveriniList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (allBeverini.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Nessun beverino disponibile</p>
                ${isAdmin ? '<button class="btn-secondary" onclick="addNewItem(\'beverino\')">Aggiungi il primo</button>' : ''}
            </div>
        `;
        return;
    }
    
    allBeverini.forEach(beverino => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-header">
                <h4>Beverino</h4>
                <span class="status-badge ${beverino.stato}">${getStatusLabel(beverino.stato)}</span>
            </div>
            <p class="item-address">${beverino.indirizzo}</p>
            <p class="item-desc">${beverino.descrizione || 'Fontanella pubblica'}</p>
            <div class="item-actions">
                <button class="btn-secondary" onclick="showDetails('beverino', '${beverino.id}')">
                    <i class="fas fa-info-circle"></i> Dettagli
                </button>
                <button class="btn-primary" onclick="navigateTo(${beverino.lat}, ${beverino.lng})">
                    <i class="fas fa-directions"></i> Naviga
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderNews() {
    // Home preview
    const newsPreview = document.getElementById('newsPreview');
    if (newsPreview) {
        newsPreview.innerHTML = '';
        const recentNews = allNews.slice(0, 3);
        
        recentNews.forEach(news => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <h4>${news.titolo}</h4>
                <p>${news.contenuto.substring(0, 100)}...</p>
                <div class="news-footer">
                    <span>${news.autore}</span>
                    <span>${formatDate(news.data)}</span>
                </div>
            `;
            newsPreview.appendChild(newsItem);
        });
    }
    
    // News screen
    const newsContainer = document.getElementById('newsContainer');
    if (newsContainer) {
        newsContainer.innerHTML = '';
        
        allNews.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
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
    const totalBeverini = allBeverini.length;
    const totalWorking = allFontane.filter(f => f.stato === 'funzionante').length + 
                         allBeverini.filter(b => b.stato === 'funzionante').length;
    
    document.getElementById('totalFountains').textContent = totalFountains;
    document.getElementById('totalBeverini').textContent = totalBeverini;
    document.getElementById('totalWorking').textContent = totalWorking;
    
    // Aggiorna admin panel
    if (isAdmin) {
        document.getElementById('adminFountains').textContent = totalFountains;
        document.getElementById('adminBeverini').textContent = totalBeverini;
        document.getElementById('adminNews').textContent = allNews.length;
    }
}

// ========== MAP FUNCTIONS ==========

function initializeMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Centro su Napoli
    map = L.map('map').setView([40.8518, 14.2681], 13);
    
    // Aggiungi tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Crea cluster
    markersCluster = L.markerClusterGroup();
    map.addLayer(markersCluster);
    
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
            <div class="map-popup">
                <h4>${fontana.nome}</h4>
                <p><strong>Indirizzo:</strong> ${fontana.indirizzo}</p>
                <p><strong>Stato:</strong> ${getStatusLabel(fontana.stato)}</p>
                <button onclick="navigateTo(${fontana.lat}, ${fontana.lng})" class="btn-primary">
                    <i class="fas fa-directions"></i> Naviga qui
                </button>
            </div>
        `);
        
        // Icona personalizzata
        const icon = L.divIcon({
            html: `<div class="custom-marker fountain ${fontana.stato}">
                     <i class="fas fa-fountain"></i>
                   </div>`,
            className: 'custom-div-icon',
            iconSize: [40, 40]
        });
        marker.setIcon(icon);
        
        markersCluster.addLayer(marker);
    });
    
    // Aggiungi beverini
    allBeverini.forEach(beverino => {
        const marker = L.marker([beverino.lat, beverino.lng]);
        marker.bindPopup(`
            <div class="map-popup">
                <h4>Beverino</h4>
                <p><strong>Indirizzo:</strong> ${beverino.indirizzo}</p>
                <p><strong>Stato:</strong> ${getStatusLabel(beverino.stato)}</p>
                <button onclick="navigateTo(${beverino.lat}, ${beverino.lng})" class="btn-primary">
                    <i class="fas fa-directions"></i> Naviga qui
                </button>
            </div>
        `);
        
        const icon = L.divIcon({
            html: `<div class="custom-marker drinking ${beverino.stato}">
                     <i class="fas fa-tint"></i>
                   </div>`,
            className: 'custom-div-icon',
            iconSize: [40, 40]
        });
        marker.setIcon(icon);
        
        markersCluster.addLayer(marker);
    });
}

// ========== UTILITY FUNCTIONS ==========

function getStatusLabel(status) {
    const labels = {
        'funzionante': 'Funzionante',
        'non_funzionante': 'Non Funzionante',
        'manutenzione': 'In Manutenzione'
    };
    return labels[status] || 'Sconosciuto';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function showDetails(type, id) {
    let item, title;
    
    if (type === 'fontana') {
        item = allFontane.find(f => f.id === id);
        title = item.nome;
    } else {
        item = allBeverini.find(b => b.id === id);
        title = 'Beverino';
    }
    
    if (!item) return;
    
    document.getElementById('detailTitle').textContent = title;
    document.getElementById('detailBody').innerHTML = `
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
        ${item.lat && item.lng ? `
        <div class="detail-section">
            <h4>Coordinate</h4>
            <p>${item.lat.toFixed(6)}, ${item.lng.toFixed(6)}</p>
        </div>
        ` : ''}
    `;
    
    // Setup bottoni
    document.getElementById('navigateBtn').onclick = () => {
        if (item.lat && item.lng) {
            navigateTo(item.lat, item.lng);
        }
    };
    
    document.getElementById('reportBtn').onclick = () => {
        reportIssue(type, id);
    };
    
    document.getElementById('detailModal').classList.remove('hidden');
}

function navigateTo(lat, lng) {
    if (navigator.geolocation) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
        window.open(url, '_blank');
    } else {
        alert('Navigazione non supportata dal tuo dispositivo');
    }
}

function reportIssue(type, id) {
    alert('Segnalazione inviata al Comune di Napoli. Grazie per la tua segnalazione!');
    // Qui si potrebbe implementare l'invio a Firebase
}

function showNotification(message, type = 'info') {
    // Implementazione base di notifica
    console.log(`${type.toUpperCase()}: ${message}`);
    // Qui si potrebbe implementare un toast notification
}

// ========== EVENT LISTENERS ==========

function setupEventListeners() {
    // Header buttons
    document.getElementById('searchBtn').addEventListener('click', toggleSearch);
    document.getElementById('filterBtn').addEventListener('click', toggleFilter);
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    document.getElementById('clearSearch').addEventListener('click', clearSearch);
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    
    // Map controls
    document.getElementById('locateMe').addEventListener('click', locateUser);
    document.getElementById('toggleMapType').addEventListener('click', toggleMapType);
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Modal buttons
    document.getElementById('closeAdmin').addEventListener('click', () => {
        document.getElementById('adminModal').classList.add('hidden');
    });
    
    document.getElementById('closeDetail').addEventListener('click', () => {
        document.getElementById('detailModal').classList.add('hidden');
    });
    
    // Admin login
    document.getElementById('loginBtn').addEventListener('click', adminLogin);
    document.getElementById('logoutBtn').addEventListener('click', adminLogout);
    
    // Admin actions
    document.getElementById('syncData').addEventListener('click', syncWithFirebase);
    document.getElementById('exportData').addEventListener('click', exportToExcel);
    document.getElementById('importData').addEventListener('click', importFromExcel);
    document.getElementById('backupData').addEventListener('click', backupLocalData);
    
    // Add buttons
    document.getElementById('addFontanaBtn').addEventListener('click', () => addNewItem('fontana'));
    document.getElementById('addBeverinoBtn').addEventListener('click', () => addNewItem('beverino'));
    document.getElementById('addNewsBtn').addEventListener('click', () => addNewItem('news'));
    
    // Online/offline detection
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
}

// ========== SEARCH & FILTER FUNCTIONS ==========

function toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    const filterPanel = document.getElementById('filterPanel');
    
    searchBar.classList.toggle('hidden');
    filterPanel.classList.add('hidden');
    
    if (!searchBar.classList.contains('hidden')) {
        document.getElementById('searchInput').focus();
    }
}

function toggleFilter() {
    const filterPanel = document.getElementById('filterPanel');
    const searchBar = document.getElementById('searchBar');
    
    filterPanel.classList.toggle('hidden');
    searchBar.classList.add('hidden');
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (currentScreen === 'fontane') {
        const filtered = allFontane.filter(item =>
            item.nome.toLowerCase().includes(searchTerm) ||
            item.indirizzo.toLowerCase().includes(searchTerm) ||
            (item.descrizione && item.descrizione.toLowerCase().includes(searchTerm))
        );
        renderFilteredFontane(filtered);
    } else if (currentScreen === 'beverini') {
        const filtered = allBeverini.filter(item =>
            item.indirizzo.toLowerCase().includes(searchTerm) ||
            (item.descrizione && item.descrizione.toLowerCase().includes(searchTerm))
        );
        renderFilteredBeverini(filtered);
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    
    if (currentScreen === 'fontane') {
        renderFontaneList();
    } else if (currentScreen === 'beverini') {
        renderBeveriniList();
    }
}

function applyFilters() {
    // Qui implementeresti la logica di filtro
    document.getElementById('filterPanel').classList.add('hidden');
    showNotification('Filtri applicati');
}

// ========== ADMIN FUNCTIONS ==========

async function adminLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('loginError');
    
    try {
        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
        const auth = window.firebaseAuth;
        
        await signInWithEmailAndPassword(auth, email, password);
        
        // Successo
        isAdmin = true;
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        
        // Mostra bottoni admin
        document.querySelectorAll('.btn-add').forEach(btn => btn.classList.remove('hidden'));
        
        // Aggiorna statistiche admin
        updateStats();
        
        showNotification('Accesso amministratore effettuato', 'success');
        
    } catch (error) {
        console.error('Errore login:', error);
        errorElement.textContent = 'Credenziali errate. Riprova.';
    }
}

async function adminLogout() {
    try {
        const { signOut } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
        const auth = window.firebaseAuth;
        
        await signOut(auth);
        
        isAdmin = false;
        document.getElementById('adminModal').classList.add('hidden');
        
        // Nascondi bottoni admin
        document.querySelectorAll('.btn-add').forEach(btn => btn.classList.add('hidden'));
        
        showNotification('Disconnessione effettuata', 'success');
        
    } catch (error) {
        console.error('Errore logout:', error);
    }
}

async function syncWithFirebase() {
    try {
        showNotification('Sincronizzazione in corso...', 'info');
        await loadFromFirebase();
        renderFontaneList();
        renderBeveriniList();
        renderNews();
        updateStats();
        updateMapMarkers();
        showNotification('Dati sincronizzati con successo', 'success');
    } catch (error) {
        console.error('Errore sincronizzazione:', error);
        showNotification('Errore durante la sincronizzazione', 'error');
    }
}

function exportToExcel() {
    // Implementazione base
    const data = {
        fontane: allFontane,
        beverini: allBeverini,
        news: allNews
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fontane-napoli-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    showNotification('Backup esportato', 'success');
}

function importFromExcel() {
    // Implementazione base
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.fontane) allFontane = data.fontane;
                if (data.beverini) allBeverini = data.beverini;
                if (data.news) allNews = data.news;
                
                saveToLocalStorage();
                renderFontaneList();
                renderBeveriniList();
                renderNews();
                updateStats();
                updateMapMarkers();
                
                showNotification('Dati importati con successo', 'success');
            } catch (error) {
                console.error('Errore importazione:', error);
                showNotification('Errore durante l\'importazione', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function backupLocalData() {
    saveToLocalStorage();
    showNotification('Backup locale creato', 'success');
}

// ========== MAP CONTROLS ==========

function locateUser() {
    if (!map) return;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                map.setView([userLat, userLng], 16);
                
                // Aggiungi marker
                L.marker([userLat, userLng])
                    .addTo(map)
                    .bindPopup('La tua posizione')
                    .openPopup();
            },
            (error) => {
                showNotification('Impossibile ottenere la posizione: ' + error.message, 'error');
            }
        );
    } else {
        showNotification('Geolocalizzazione non supportata', 'error');
    }
}

function toggleMapType() {
    if (!map) return;
    
    // Implementazione base per cambiare tipo mappa
    showNotification('Funzionalità in sviluppo', 'info');
}

// ========== NETWORK FUNCTIONS ==========

function handleOnline() {
    console.log('Online - Sincronizzazione dati');
    syncWithFirebase();
}

function handleOffline() {
    console.log('Offline - Modalità offline');
    showNotification('Sei offline. I dati potrebbero non essere aggiornati.', 'warning');
}

// ========== HELPER FUNCTIONS ==========

function addNewItem(type) {
    if (!isAdmin) {
        showNotification('Accesso amministratore richiesto', 'error');
        return;
    }
    
    // Implementazione base
    showNotification(`Aggiungi nuovo ${type} - Funzionalità in sviluppo`, 'info');
}

function refreshData() {
    loadAllData();
    showNotification('Dati aggiornati', 'success');
}

function renderFilteredFontane(filtered) {
    const container = document.getElementById('fontaneList');
    if (!container) return;
    
    container.innerHTML = '';
    
    filtered.forEach(fontana => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-header">
                <h4>${fontana.nome}</h4>
                <span class="status-badge ${fontana.stato}">${getStatusLabel(fontana.stato)}</span>
            </div>
            <p class="item-address">${fontana.indirizzo}</p>
            <p class="item-desc">${fontana.descrizione || 'Nessuna descrizione'}</p>
            <div class="item-actions">
                <button class="btn-secondary" onclick="showDetails('fontana', '${fontana.id}')">
                    <i class="fas fa-info-circle"></i> Dettagli
                </button>
                <button class="btn-primary" onclick="navigateTo(${fontana.lat}, ${fontana.lng})">
                    <i class="fas fa-directions"></i> Naviga
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-state">Nessuna fontana trovata</p>';
    }
}

function renderFilteredBeverini(filtered) {
    const container = document.getElementById('beveriniList');
    if (!container) return;
    
    container.innerHTML = '';
    
    filtered.forEach(beverino => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-header">
                <h4>Beverino</h4>
                <span class="status-badge ${beverino.stato}">${getStatusLabel(beverino.stato)}</span>
            </div>
            <p class="item-address">${beverino.indirizzo}</p>
            <p class="item-desc">${beverino.descrizione || 'Fontanella pubblica'}</p>
            <div class="item-actions">
                <button class="btn-secondary" onclick="showDetails('beverino', '${beverino.id}')">
                    <i class="fas fa-info-circle"></i> Dettagli
                </button>
                <button class="btn-primary" onclick="navigateTo(${beverino.lat}, ${beverino.lng})">
                    <i class="fas fa-directions"></i> Naviga
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-state">Nessun beverino trovato</p>';
    }
}

// ========== GLOBAL EXPORTS ==========

// Espone funzioni necessarie agli eventi onclick
window.showDetails = showDetails;
window.navigateTo = navigateTo;
window.reportIssue = reportIssue;
window.addNewItem = addNewItem;

console.log('App.js caricato correttamente');