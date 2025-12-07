// ============================================
// GESTIONE SPLASH SCREEN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Anima la barra di caricamento
    const progressBar = document.getElementById('splash-bar');
    if (progressBar) {
        progressBar.style.width = '30%';
        setTimeout(() => { progressBar.style.width = '70%'; }, 500);
        setTimeout(() => { progressBar.style.width = '100%'; }, 1200);
    }
});

window.addEventListener('load', () => {
    // Nascondi splash screen quando tutto è carico
    const splash = document.getElementById('custom-splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('hidden');
        }, 1500); // Ritardo estetico
    }
});

// ============================================
// VARIABILI GLOBALI
// ============================================
let appData = { fontane: [], beverini: [], news: [] };
let currentLatLng = null;
let screenHistory = ['home-screen'];
let currentFilter = { fontane: 'all', beverini: 'all' };
let activityLog = [];
let searchResults = [];
let map = null;
let clusterGroup = null;
let markers = new Map();
let searchTimeout;
let isAdminAuthenticated = false;
let syncState = { isSyncing: false, pendingChanges: 0 };

// Firebase Collections
const COLLECTIONS = { FONTANE: 'fontane', BEVERINI: 'beverini', NEWS: 'news' };

// ============================================
// FIREBASE & DATA LOADING
// ============================================
async function loadFirebaseData(type) {
    try {
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const dataRef = collection(window.db, type);
        const snapshot = await getDocs(dataRef);
        
        const data = [];
        snapshot.forEach(doc => {
            data.push({ id: doc.id, ...doc.data() });
        });
        
        appData[type] = data;
        saveLocalData(); // Backup locale
        return data;
    } catch (error) {
        console.warn(`Errore caricamento ${type}, uso dati locali`, error);
        loadLocalData(type);
        return appData[type];
    }
}

// Funzioni Local Storage
function saveLocalData() {
    localStorage.setItem('appData', JSON.stringify(appData));
}

function loadLocalData(type = null) {
    const saved = localStorage.getItem('appData');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (type) appData[type] = parsed[type] || [];
        else appData = parsed;
    }
}

// ============================================
// NAVIGATION & UI
// ============================================
function showScreen(screenId) {
    // Nascondi tutte le schermate
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    
    // Mostra quella target
    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'flex';
        // Timeout per permettere il rendering display:flex prima dell'opacity
        setTimeout(() => target.classList.add('active'), 10);
        
        screenHistory.push(screenId);
        window.scrollTo(0, 0);
        initializeScreenContent(screenId);
        updateTabBar(screenId);
    }
}

function goBack() {
    if (screenHistory.length > 1) {
        screenHistory.pop();
        const prev = screenHistory[screenHistory.length - 1];
        showScreen(prev);
    } else {
        showScreen('home-screen');
    }
}

function updateTabBar(screenId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-target="${screenId}"]`);
    if (btn) btn.classList.add('active');
}

function initializeScreenContent(screenId) {
    if (screenId === 'fontane-screen') loadFontane();
    if (screenId === 'beverini-screen') loadBeverini();
    if (screenId === 'news-screen') loadNews();
    if (screenId === 'mappa-screen') initMappa();
}

// ============================================
// DISPLAY DATA FUNCTIONS
// ============================================
async function loadFontane() {
    const list = document.getElementById('fontane-list');
    if(!list) return;
    list.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    await loadFirebaseData('fontane');
    renderGridItems(list, getFilteredItems('fontane'), 'fontana');
}

async function loadBeverini() {
    const list = document.getElementById('beverini-list');
    if(!list) return;
    list.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    await loadFirebaseData('beverini');
    renderCompactItems(list, getFilteredItems('beverini'), 'beverino');
}

async function loadNews() {
    const list = document.getElementById('news-list');
    if(!list) return;
    list.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    await loadFirebaseData('news');
    renderNewsItems(list, appData.news);
}

function getFilteredItems(type) {
    const filter = currentFilter[type];
    if (filter === 'all') return appData[type] || [];
    return (appData[type] || []).filter(i => i.stato === filter);
}

function setFilter(type, status) {
    currentFilter[type] = status;
    document.querySelectorAll(`#${type}-screen .filter-btn`).forEach(b => b.classList.remove('active'));
    document.querySelector(`#${type}-screen .filter-btn.${status}`).classList.add('active');
    
    if (type === 'fontane') {
        renderGridItems(document.getElementById('fontane-list'), getFilteredItems('fontane'), 'fontana');
    } else {
        renderCompactItems(document.getElementById('beverini-list'), getFilteredItems('beverini'), 'beverino');
    }
}

const debouncedFilter = debounce((type, query) => {
    const list = document.getElementById(`${type}-list`);
    if (!list) return;
    const items = list.querySelectorAll(type === 'fontane' ? '.grid-item' : '.compact-item');
    
    let visible = 0;
    const q = query.toLowerCase();
    
    items.forEach(el => {
        const text = el.innerText.toLowerCase();
        if (text.includes(q)) {
            el.style.display = 'flex';
            visible++;
        } else {
            el.style.display = 'none';
        }
    });
    
    // Gestione empty state per ricerca
    const emptyMsg = list.querySelector('.empty-search');
    if (visible === 0 && query !== '') {
        if (!emptyMsg) {
            list.innerHTML += `<div class="empty-state empty-search">Nessun risultato</div>`;
        }
    } else if (emptyMsg) {
        emptyMsg.remove();
    }
}, 300);

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ============================================
// RENDERING UI
// ============================================
function renderGridItems(container, items, type) {
    container.innerHTML = '';
    if(!items.length) {
        container.innerHTML = '<div class="empty-state">Nessun elemento trovato</div>';
        return;
    }
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'grid-item';
        div.onclick = () => showDetail(item.id, type);
        
        const hasImg = item.immagine && item.immagine.length > 10;
        
        div.innerHTML = `
            <div class="item-image-container">
                <img src="${hasImg ? item.immagine : './images/sfondo-home.jpg'}" class="item-image" onerror="this.src='./images/sfondo-home.jpg'">
            </div>
            <div class="item-content">
                <div class="item-name">${item.nome}</div>
                <div class="item-address">${item.indirizzo}</div>
                <div class="item-status status-${item.stato}">${getStatusText(item.stato)}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderCompactItems(container, items, type) {
    container.innerHTML = '';
    if(!items.length) {
        container.innerHTML = '<div class="empty-state">Nessun elemento trovato</div>';
        return;
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'compact-item';
        div.onclick = () => showDetail(item.id, type);
        
        const hasImg = item.immagine && item.immagine.length > 10;
        
        div.innerHTML = `
             <img src="${hasImg ? item.immagine : './images/sfondo-home.jpg'}" class="compact-item-image" onerror="this.src='./images/sfondo-home.jpg'">
             <div class="compact-item-content">
                <div class="compact-item-header">
                    <div class="compact-item-name">${item.nome}</div>
                </div>
                <div class="compact-item-address">${item.indirizzo}</div>
                <div class="compact-item-footer">
                    <span class="compact-item-status status-${item.stato}">${getStatusText(item.stato)}</span>
                </div>
             </div>
        `;
        container.appendChild(div);
    });
}

function renderNewsItems(container, items) {
    container.innerHTML = '';
    items.sort((a,b) => new Date(b.data) - new Date(a.data)).forEach(n => {
        container.innerHTML += `
        <div class="news-card">
            <div class="news-header">
                <div class="news-title">${n.titolo}</div>
                <div class="news-date">${formatDate(n.data)}</div>
            </div>
            <div class="news-content">${n.contenuto}</div>
            <div class="news-footer"><span class="news-category">${n.categoria}</span></div>
        </div>`;
    });
}

// ============================================
// DETAIL VIEW (AGGIORNATA PER STICKY FOOTER)
// ============================================
function showDetail(id, type) {
    let item, screenId, titleEl, contentEl, footerEl;
    
    if (type === 'fontana') {
        item = appData.fontane.find(f => f.id == id);
        screenId = 'fontana-detail-screen';
        titleEl = document.getElementById('fontana-detail-title');
        contentEl = document.getElementById('fontana-detail-content');
        footerEl = document.getElementById('fontana-detail-footer');
    } else {
        item = appData.beverini.find(b => b.id == id);
        screenId = 'beverino-detail-screen';
        titleEl = document.getElementById('beverino-detail-title');
        contentEl = document.getElementById('beverino-detail-content');
        footerEl = document.getElementById('beverino-detail-footer');
    }

    if (!item) return;

    titleEl.textContent = item.nome;
    
    // 1. Inserisce contenuto scrollabile
    contentEl.innerHTML = generateDetailHTML(item, type);
    
    // 2. Inserisce pulsanti nel footer fisso
    if (footerEl) {
        footerEl.innerHTML = `
            <div class="detail-actions">
                <button class="detail-action-btn primary" onclick="navigateTo(${item.latitudine}, ${item.longitudine})">
                    <i class="fas fa-map-marker-alt"></i> Naviga
                </button>
                <button class="detail-action-btn secondary" onclick="shareItem('${item.id}', '${type}')">
                    <i class="fas fa-share-alt"></i> Condividi
                </button>
            </div>
        `;
    }

    currentLatLng = { lat: item.latitudine, lng: item.longitudine };
    showScreen(screenId);
}

function generateDetailHTML(item, type) {
    // Genera solo la parte informativa
    let extra = '';
    if (type === 'fontana') {
        extra = `
            ${item.anno ? `<div class="info-item"><span class="info-label">Anno:</span><span class="info-value">${item.anno}</span></div>` : ''}
            ${item.storico ? `<div class="info-item"><span class="info-label">Storico:</span><span class="info-value">${item.storico}</span></div>` : ''}
        `;
    }
    
    return `
        <img src="${item.immagine || './images/sfondo-home.jpg'}" class="detail-image" onerror="this.src='./images/sfondo-home.jpg'">
        <div class="detail-info">
            <div class="info-item"><span class="info-label">Indirizzo:</span><span class="info-value">${item.indirizzo}</span></div>
            <div class="info-item"><span class="info-label">Stato:</span><span class="info-value">${getStatusText(item.stato)}</span></div>
            ${extra}
            <div class="info-item"><span class="info-label">Descrizione:</span><span class="info-value">${item.descrizione || 'Nessuna descrizione'}</span></div>
        </div>
    `;
}

// ============================================
// MAPPA
// ============================================
function initMappa() {
    if (!map) {
        map = L.map('map').setView([40.8518, 14.2681], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        clusterGroup = L.markerClusterGroup();
        map.addLayer(clusterGroup);
        
        // Controlli mappa
        addMapControls();
    }
    
    clusterGroup.clearLayers();
    
    // Aggiungi Fontane
    appData.fontane.forEach(f => createMarker(f, 'fontana'));
    // Aggiungi Beverini
    appData.beverini.forEach(b => createMarker(b, 'beverino'));
    
    requestUserLocation();
}

function createMarker(item, type) {
    if (!item.latitudine || !item.longitudine) return;
    
    const iconUrl = type === 'fontana' 
        ? 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
        : 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png';
        
    const marker = L.marker([item.latitudine, item.longitudine], {
        icon: L.icon({ iconUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] })
    });
    
    marker.bindPopup(`
        <b>${item.nome}</b><br>${item.indirizzo}<br>
        <button onclick="showDetail('${item.id}', '${type}')" class="popup-btn">Dettagli</button>
    `);
    
    clusterGroup.addLayer(marker);
}

function addMapControls() {
    // Aggiungi pulsante "Centra su di me"
    const btn = document.createElement('div');
    btn.className = 'map-controls';
    btn.innerHTML = `<button class="map-control-btn" onclick="requestUserLocation()"><i class="fas fa-location-arrow"></i></button>`;
    document.getElementById('mappa-screen').appendChild(btn);
}

function requestUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            if (map) map.setView([latitude, longitude], 15);
            
            // Marker utente
            L.marker([latitude, longitude], {
                icon: L.icon({
                    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    iconSize: [25, 41], iconAnchor: [12, 41]
                })
            }).addTo(map).bindPopup('Tu sei qui');
        });
    }
}

function performMapSearch() {
    const q = document.getElementById('map-search-input').value;
    if (!q) return;
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=it`)
        .then(res => res.json())
        .then(data => {
            const resultsDiv = document.getElementById('map-search-results');
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = data.map(d => 
                `<div class="search-result-item" onclick="map.setView([${d.lat}, ${d.lon}], 16); document.getElementById('map-search-results').style.display='none'">${d.display_name}</div>`
            ).join('');
        });
}

// ============================================
// ADMIN & AUTH
// ============================================
function openAdminPanel() {
    if (isAdminAuthenticated) {
        document.getElementById('admin-panel').style.display = 'flex';
        loadAdminFontane(); loadAdminBeverini(); loadAdminNews();
        updateDashboardStats();
    } else {
        document.getElementById('admin-auth').style.display = 'flex';
    }
}

function closeAdminPanel() { document.getElementById('admin-panel').style.display = 'none'; }
function closeAdminAuth() { document.getElementById('admin-auth').style.display = 'none'; }

async function checkAdminAuth() {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-password').value;
    
    try {
        await window.firebaseSignIn(window.auth, email, pass);
        isAdminAuthenticated = true;
        closeAdminAuth();
        openAdminPanel();
        showToast('Login effettuato', 'success');
    } catch (e) {
        document.getElementById('auth-error').style.display = 'block';
    }
}

function logoutAdmin() {
    isAdminAuthenticated = false;
    closeAdminPanel();
    showToast('Logout effettuato', 'success');
}

// Admin Loading Functions
function loadAdminFontane() {
    const tbody = document.getElementById('fontane-table-body');
    tbody.innerHTML = appData.fontane.map(f => 
        `<tr><td>${f.nome}</td><td>${f.stato}</td><td>
        <button class="edit-btn" onclick="editFontana('${f.id}')">Modif</button>
        <button class="delete-btn" onclick="deleteItem('fontane', '${f.id}')">Elim</button>
        </td></tr>`
    ).join('');
}

function loadAdminBeverini() {
    const tbody = document.getElementById('beverini-table-body');
    tbody.innerHTML = appData.beverini.map(b => 
        `<tr><td>${b.nome}</td><td>${b.stato}</td><td>
        <button class="edit-btn" onclick="editBeverino('${b.id}')">Modif</button>
        <button class="delete-btn" onclick="deleteItem('beverini', '${b.id}')">Elim</button>
        </td></tr>`
    ).join('');
}

function loadAdminNews() {
    const tbody = document.getElementById('news-table-body');
    tbody.innerHTML = appData.news.map(n => 
        `<tr><td>${n.titolo}</td><td>${n.data}</td><td>
        <button class="edit-btn" onclick="editNews('${n.id}')">Modif</button>
        <button class="delete-btn" onclick="deleteItem('news', '${n.id}')">Elim</button>
        </td></tr>`
    ).join('');
}

function updateDashboardStats() {
    document.getElementById('total-fontane').innerText = appData.fontane.length;
    document.getElementById('total-beverini').innerText = appData.beverini.length;
    document.getElementById('total-news').innerText = appData.news.length;
}

// CRUD Operations (con Offline Sync)
async function saveFontana(e) {
    e.preventDefault();
    const id = document.getElementById('fontana-id').value;
    const data = {
        nome: document.getElementById('fontana-nome').value,
        indirizzo: document.getElementById('fontana-indirizzo').value,
        stato: document.getElementById('fontana-stato').value,
        latitudine: parseFloat(document.getElementById('fontana-latitudine').value),
        longitudine: parseFloat(document.getElementById('fontana-longitudine').value),
        immagine: document.getElementById('fontana-immagine').value,
        descrizione: document.getElementById('fontana-descrizione').value
    };
    
    await handleSave('fontane', data, id);
    resetFontanaForm();
    loadAdminFontane();
}

async function saveBeverino(e) {
    e.preventDefault();
    const id = document.getElementById('beverino-id').value;
    const data = {
        nome: document.getElementById('beverino-nome').value,
        indirizzo: document.getElementById('beverino-indirizzo').value,
        stato: document.getElementById('beverino-stato').value,
        latitudine: parseFloat(document.getElementById('beverino-latitudine').value),
        longitudine: parseFloat(document.getElementById('beverino-longitudine').value),
        immagine: document.getElementById('beverino-immagine').value
    };
    
    await handleSave('beverini', data, id);
    resetBeverinoForm();
    loadAdminBeverini();
}

async function saveNews(e) {
    e.preventDefault();
    const id = document.getElementById('news-id').value;
    const data = {
        titolo: document.getElementById('news-titolo').value,
        contenuto: document.getElementById('news-contenuto').value,
        data: document.getElementById('news-data').value,
        categoria: document.getElementById('news-categoria').value
    };
    
    await handleSave('news', data, id);
    resetNewsForm();
    loadAdminNews();
}

async function handleSave(collectionName, data, id) {
    if (navigator.onLine) {
        const { doc, setDoc, addDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        if (id) {
            await setDoc(doc(window.db, collectionName, id), data, { merge: true });
            showToast('Aggiornato!', 'success');
        } else {
            await addDoc(collection(window.db, collectionName), data);
            showToast('Salvato!', 'success');
        }
        loadFirebaseData(collectionName); // Ricarica
    } else {
        addToSyncQueue(id ? 'UPDATE' : 'CREATE', collectionName, data, id);
        showToast('Salvato offline. Sincronizzerò dopo.', 'info');
    }
}

async function deleteItem(collectionName, id) {
    if(!confirm('Sicuro?')) return;
    if (navigator.onLine) {
        const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await deleteDoc(doc(window.db, collectionName, id));
        showToast('Eliminato', 'success');
        loadFirebaseData(collectionName);
        if(collectionName === 'fontane') loadAdminFontane();
        if(collectionName === 'beverini') loadAdminBeverini();
        if(collectionName === 'news') loadAdminNews();
    } else {
        addToSyncQueue('DELETE', collectionName, {}, id);
        showToast('Eliminazione in coda offline', 'info');
    }
}

// Edit population helpers
function editFontana(id) {
    const f = appData.fontane.find(x => x.id === id);
    document.getElementById('fontana-id').value = f.id;
    document.getElementById('fontana-nome').value = f.nome;
    document.getElementById('fontana-indirizzo').value = f.indirizzo;
    document.getElementById('fontana-stato').value = f.stato;
    document.getElementById('fontana-latitudine').value = f.latitudine;
    document.getElementById('fontana-longitudine').value = f.longitudine;
    document.getElementById('fontana-immagine').value = f.immagine;
    document.getElementById('fontana-descrizione').value = f.descrizione || '';
    document.getElementById('fontane-admin').scrollIntoView();
}
function editBeverino(id) {
    const b = appData.beverini.find(x => x.id === id);
    document.getElementById('beverino-id').value = b.id;
    document.getElementById('beverino-nome').value = b.nome;
    document.getElementById('beverino-indirizzo').value = b.indirizzo;
    document.getElementById('beverino-stato').value = b.stato;
    document.getElementById('beverino-latitudine').value = b.latitudine;
    document.getElementById('beverino-longitudine').value = b.longitudine;
    document.getElementById('beverino-immagine').value = b.immagine;
}
function editNews(id) {
    const n = appData.news.find(x => x.id === id);
    document.getElementById('news-id').value = n.id;
    document.getElementById('news-titolo').value = n.titolo;
    document.getElementById('news-contenuto').value = n.contenuto;
    document.getElementById('news-data').value = n.data;
    document.getElementById('news-categoria').value = n.categoria;
}

function resetFontanaForm() { document.getElementById('fontana-form').reset(); document.getElementById('fontana-id').value = ''; }
function resetBeverinoForm() { document.getElementById('beverino-form').reset(); document.getElementById('beverino-id').value = ''; }
function resetNewsForm() { document.getElementById('news-form').reset(); document.getElementById('news-id').value = ''; }

// ============================================
// OFFLINE SYNC SYSTEM
// ============================================
function addToSyncQueue(op, col, data, id) {
    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    queue.push({ op, col, data, id, time: Date.now() });
    localStorage.setItem('syncQueue', JSON.stringify(queue));
}

async function triggerAutoSync() {
    if (!navigator.onLine) return;
    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    if (!queue.length) return;

    showToast('Sincronizzazione...', 'info');
    const { doc, setDoc, addDoc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

    for (const item of queue) {
        try {
            if (item.op === 'CREATE') await addDoc(collection(window.db, item.col), item.data);
            if (item.op === 'UPDATE') await setDoc(doc(window.db, item.col, item.id), item.data, { merge: true });
            if (item.op === 'DELETE') await deleteDoc(doc(window.db, item.col, item.id));
        } catch (e) { console.error('Sync failed item', e); }
    }
    localStorage.removeItem('syncQueue');
    showToast('Sincronizzazione completata', 'success');
}

window.addEventListener('online', triggerAutoSync);

// ============================================
// UTILS
// ============================================
function getStatusText(s) {
    if(s === 'funzionante') return 'Funzionante';
    if(s === 'non-funzionante') return 'Non Funzionante';
    return 'Manutenzione';
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('it-IT');
}

function showToast(msg, type) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast show ${type}`;
    setTimeout(() => t.classList.remove('show'), 3000);
}

function navigateTo(lat, lng) {
    document.getElementById('navigation-modal').style.display = 'flex';
    currentLatLng = { lat, lng };
}

function openGoogleMaps() {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentLatLng.lat},${currentLatLng.lng}&travelmode=walking`);
    closeNavigationModal();
}

function openAppleMaps() {
    window.open(`http://maps.apple.com/?daddr=${currentLatLng.lat},${currentLatLng.lng}&dirflg=w`);
    closeNavigationModal();
}

function closeNavigationModal() { document.getElementById('navigation-modal').style.display = 'none'; }

function shareItem(id, type) {
    if (navigator.share) {
        navigator.share({ title: 'ABC Napoli', text: 'Guarda questo punto acqua!', url: window.location.href });
    } else {
        showToast('Condivisione non supportata', 'info');
    }
}

function getCurrentLocationCoordinatesOnly(type) {
    navigator.geolocation.getCurrentPosition(pos => {
        document.getElementById(`${type}-latitudine`).value = pos.coords.latitude;
        document.getElementById(`${type}-longitudine`).value = pos.coords.longitude;
    });
}

function getCurrentLocationWithAddress(type) {
    getCurrentLocationCoordinatesOnly(type);
    showToast('Coordinate prese. Inserisci indirizzo.', 'info');
}

function clearActivityLog() {
    document.getElementById('activity-list').innerHTML = '';
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    showScreen('home-screen');
    checkOnlineStatus();
});

function checkOnlineStatus() {
    const el = document.getElementById('offline-indicator');
    if (!navigator.onLine) el.style.display = 'block';
    else el.style.display = 'none';
}
window.addEventListener('offline', checkOnlineStatus);