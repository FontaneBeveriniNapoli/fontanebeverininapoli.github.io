// ============================================
// SERVICE WORKER FUNCTIONS - VERSIONE CORRETTA
// ============================================

// Registrazione Service Worker - VERSIONE MIGLIORATA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Usa percorso corretto
        const swUrl = './sw.js';
        
        return navigator.serviceWorker.register(swUrl)
            .then(function(registration) {
                console.log('✅ Service Worker registrato con successo:', registration.scope);
                
                // Controlla se è la prima registrazione
                if (!navigator.serviceWorker.controller) {
                    console.log('🔄 Service Worker installato per la prima volta');
                } else {
                    console.log('📱 Service Worker già attivo');
                }
                
                // Controlla aggiornamenti
                registration.addEventListener('updatefound', function() {
                    const newWorker = registration.installing;
                    console.log('🔄 Nuova versione Service Worker trovata');
                    
                    newWorker.addEventListener('statechange', function() {
                        console.log(`📊 Stato SW: ${newWorker.state}`);
                        
                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // Nuovo content disponibile
                                showToast('Nuova versione disponibile! Ricarica la pagina.', 'info', 10000);
                                
                                // Aggiungi pulsante per forzare aggiornamento
                                setTimeout(() => {
                                    if (confirm('È disponibile un aggiornamento. Vuoi ricaricare l\'applicazione?')) {
                                        window.location.reload();
                                    }
                                }, 2000);
                            } else {
                                console.log('📱 Service Worker installato per la prima volta');
                            }
                        }
                    });
                });
                
                // Verifica periodicamente aggiornamenti (ogni ora)
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);
                
                return registration;
            })
            .catch(function(error) {
                console.error('❌ Errore durante la registrazione del Service Worker:', error);
                
                // Fallback: mostra messaggio utente friendly
                if (error.message.includes('404')) {
                    console.warn('⚠️ Service Worker non trovato. Modalità offline non disponibile.');
                }
                
                return null;
            });
    } else {
        console.warn('⚠️ Service Worker non supportato dal browser');
        return null;
    }
}

// Controlla stato Service Worker
function checkServiceWorkerStatus() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration()
            .then(function(registration) {
                if (registration) {
                    console.log('Service Worker attivo:', registration.active ? 'Sì' : 'No');
                    console.log('Scope:', registration.scope);
                } else {
                    console.log('Nessun Service Worker registrato');
                }
            });
    }
}

// Forza aggiornamento Service Worker
function forceServiceWorkerUpdate() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration()
            .then(function(registration) {
                if (registration) {
                    registration.update();
                    showToast('Aggiornamento Service Worker forzato', 'info');
                }
            });
    }
}

// Pulisci cache Service Worker (per sviluppo)
function clearServiceWorkerCache() {
    if ('serviceWorker' in navigator) {
        caches.keys().then(function(cacheNames) {
            cacheNames.forEach(function(cacheName) {
                caches.delete(cacheName);
                console.log('Cache eliminata:', cacheName);
            });
            showToast('Cache Service Worker pulita', 'info');
        });
        
        // Deregistra Service Worker
        navigator.serviceWorker.getRegistrations()
            .then(function(registrations) {
                registrations.forEach(function(registration) {
                    registration.unregister();
                    console.log('Service Worker deregistrato');
                });
            });
    }
}

// Verifica supporto API
function checkServiceWorkerSupport() {
    const supports = {
        serviceWorker: 'serviceWorker' in navigator,
        sync: 'sync' in (navigator.serviceWorker || {}),
        periodicSync: 'periodicSync' in (navigator.serviceWorker || {}),
        push: 'PushManager' in window,
        notification: 'Notification' in window,
        cache: 'caches' in window
    };
    
    console.log('Supporto API:', supports);
    return supports;
}

// Firebase Collections
const COLLECTIONS = {
    FONTANE: 'fontane',
    BEVERINI: 'beverini',
    NEWS: 'news'
};

// ============================================
// GESTIONE ERRORI COMPLETA
// ============================================

class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

class FirebaseError extends AppError {
    constructor(message, code, details) {
        super(message, `FIREBASE_${code}`, details);
        this.name = 'FirebaseError';
    }
}

class NetworkError extends AppError {
    constructor(message, details) {
        super(message, 'NETWORK_ERROR', details);
        this.name = 'NetworkError';
    }
}

class ValidationError extends AppError {
    constructor(message, field, value) {
        super(message, 'VALIDATION_ERROR', { field, value });
        this.name = 'ValidationError';
    }
}

// Error handler globale
window.addEventListener('error', function(event) {
    console.error('Errore globale:', event.error);
    logErrorToAnalytics(event.error, 'GLOBAL_ERROR', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
    event.preventDefault();
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Promise non gestita:', event.reason);
    logErrorToAnalytics(event.reason, 'UNHANDLED_PROMISE_REJECTION', {
        promise: event.promise
    });
});

// Funzioni di gestione errori
async function handleError(context, error, userMessage = null) {
    console.error(`[${context}]`, error);
    
    // Log per analytics
    logErrorToAnalytics(error, context);
    
    // Gestione specifica per tipo di errore
    if (error instanceof FirebaseError) {
        await handleFirebaseError(context, error);
    } else if (error instanceof NetworkError) {
        await handleNetworkError(context, error);
    } else if (error instanceof ValidationError) {
        await handleValidationError(context, error);
    } else {
        await handleGenericError(context, error);
    }
    
    // Mostra messaggio all'utente (ora disattivato in showToast)
    if (userMessage) {
        showToast(userMessage, 'error', 5000);
    }
    
    // Log attività
    logActivity(`Errore in ${context}: ${error.message}`);
}

async function handleFirebaseError(context, error) {
    console.error(`Firebase Error [${context}]:`, error.code, error.details);
    
    switch (error.code) {
        case 'FIREBASE_PERMISSION_DENIED':
            showToast('Accesso negato. Verifica i permessi.', 'error');
            if (context.includes('admin')) {
                logoutAdmin();
            }
            break;
        case 'FIREBASE_UNAVAILABLE':
            showToast('Servizio temporaneamente non disponibile', 'error');
            saveOfflineData(context, error.details.data);
            break;
        case 'FIREBASE_NOT_FOUND':
            showToast('Dato non trovato nel database', 'warning');
            break;
        default:
            showToast('Errore database: ' + error.message, 'error');
    }
}

async function handleNetworkError(context, error) {
    console.warn(`Network Error [${context}]:`, error.details);
    
    if (error.details.data) {
        saveOfflineData(context, error.details.data);
    }
    
    document.getElementById('offline-indicator').style.display = 'block';
    showToast('Connessione assente. Modalità offline attiva.', 'warning', 3000);
}

async function handleValidationError(context, error) {
    console.warn(`Validation Error [${context}]:`, error.details);
    
    const field = error.details.field;
    if (field) {
        const input = document.getElementById(field);
        if (input) {
            input.style.borderColor = 'var(--primary-red)';
            input.focus();
            
            setTimeout(() => {
                input.style.borderColor = '';
            }, 3000);
        }
    }
    
    showToast(error.message, 'error');
}

async function handleGenericError(context, error) {
    console.error(`Generic Error [${context}]:`, error);
    
    let userMessage = 'Si è verificato un errore';
    
    if (error.message.includes('quota')) {
        userMessage = 'Limite database raggiunto. Contatta l\'amministratore.';
    } else if (error.message.includes('timeout')) {
        userMessage = 'Timeout operazione. Riprova.';
    } else if (error.message.includes('storage')) {
        userMessage = 'Errore archiviazione. Verifica lo spazio.';
    }
    
    showToast(userMessage, 'error');
}

// Funzioni di validazione
function validateFontanaData(data) {
    const errors = [];
    
    if (!data.nome || data.nome.trim().length < 2) {
        errors.push(new ValidationError('Nome fontana richiesto (min 2 caratteri)', 'fontana-nome', data.nome));
    }
    
    if (!data.indirizzo || data.indirizzo.trim().length < 5) {
        errors.push(new ValidationError('Indirizzo richiesto', 'fontana-indirizzo', data.indirizzo));
    }
    
    if (!isValidCoordinate(data.latitudine, data.longitudine)) {
        errors.push(new ValidationError('Coordinate non valide', 'fontana-latitudine', data.latitudine));
    }
    
    if (!['funzionante', 'non-funzionante', 'manutenzione'].includes(data.stato)) {
        errors.push(new ValidationError('Stato non valido', 'fontana-stato', data.stato));
    }
    
    return errors;
}

function validateBeverinoData(data) {
    const errors = [];
    
    if (!data.nome || data.nome.trim().length < 2) {
        errors.push(new ValidationError('Nome beverino richiesto', 'beverino-nome', data.nome));
    }
    
    if (!isValidCoordinate(data.latitudine, data.longitudine)) {
        errors.push(new ValidationError('Coordinate non valide', 'beverino-latitudine', data.latitudine));
    }
    
    return errors;
}

// Wrapper per funzioni Firebase
async function safeFirebaseOperation(operation, context, ...args) {
    try {
        return await operation(...args);
    } catch (error) {
        throw new FirebaseError(
            error.message,
            error.code || 'UNKNOWN',
            { operation: context, args }
        );
    }
}

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Cache per immagini
const imageCache = new Map();
const MAX_IMAGE_CACHE_SIZE = 50;

// Lazy loading per immagini
function setupLazyLoading() {
    if (typeof IntersectionObserver === 'undefined') return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                // ✅ CORREZIONE: Controlla che img.src non sia già l'immagine corretta
                if (src && img.src !== src) { 
                    loadImageWithCache(img, src);
                }
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.1
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        observer.observe(img);
    });
}

// Caricamento immagini con cache
function loadImageWithCache(imgElement, src) {
    if (imageCache.has(src)) {
        imgElement.src = imageCache.get(src);
        return;
    }
    
    const img = new Image();
    const startTime = performance.now(); // Inizio misurazione performance
    
    img.onload = () => {
        const duration = performance.now() - startTime;
        logPerformanceMetric('image_load', duration); // Log performance
        
        if (imageCache.size >= MAX_IMAGE_CACHE_SIZE) {
            const firstKey = imageCache.keys().next().value;
            imageCache.delete(firstKey);
        }
        imageCache.set(src, src);
        imgElement.src = src;
    };
    
    img.onerror = () => {
        // Fallback più robusto
        if (imgElement.classList.contains('compact-item-image')) {
            imgElement.src = './images/default-beverino.jpg';
        } else {
            imgElement.src = './images/sfondo-home.jpg';
        }
        logErrorToAnalytics(new Error(`Image Load Failed: ${src}`), 'IMAGE_LOAD_ERROR', { url: src });
    };
    
    img.src = src;
}

// Debounce migliorato
function advancedDebounce(func, wait, immediate = false) {
    let timeout, result;
    const debounced = function(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(context, args);
        return result;
    };
    
    debounced.cancel = function() {
        clearTimeout(timeout);
        timeout = null;
    };
    
    return debounced;
}

// ============================================
// OFFLINE SYNC
// ============================================

let syncState = {
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
    retryCount: 0
};

// Inizializza offline sync
function initializeOfflineSync() {
    if (!navigator.onLine) {
        enableOfflineMode();
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setInterval(checkSyncStatus, 60000);
    loadSyncState();
}

// Abilita modalità offline
function enableOfflineMode() {
    document.getElementById('offline-indicator').style.display = 'block';
    showToast('Modalità offline attiva. Le modifiche saranno sincronizzate dopo.', 'info', 5000);
}

// Disabilita modalità offline
function disableOfflineMode() {
    document.getElementById('offline-indicator').style.display = 'none';
    triggerAutoSync();
}

// Gestisci evento online
function handleOnline() {
    disableOfflineMode();
    showToast('Connessione ripristinata. Sincronizzazione in corso...', 'success');
    checkForPendingSync();
}

// Gestisci evento offline
function handleOffline() {
    enableOfflineMode();
}

// Aggiungi operazione a coda sync
async function addToSyncQueue(operation, collection, data, docId = null) {
    const syncItem = {
        operation,
        collection,
        data,
        docId: docId || data.id,
        timestamp: Date.now(),
        metadata: {
            userAgent: navigator.userAgent,
            location: currentLatLng,
            appVersion: '2.0.0'
        }
    };
    
    try {
        await saveToLocalSyncQueue(syncItem);
        
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            
            if ('sync' in registration) {
                await registration.sync.register('sync-data');
            }
        }
        
        updateSyncUI();
        return true;
    } catch (error) {
        console.error('[Offline] Errore aggiunta a coda sync:', error);
        saveSyncItemToLocalStorage(syncItem);
        return false;
    }
}

// Salva in coda sync locale
async function saveToLocalSyncQueue(item) {
    const queue = await getLocalSyncQueue();
    queue.push(item);
    
    if (queue.length > 100) {
        queue.splice(0, queue.length - 100);
    }
    
    localStorage.setItem('localSyncQueue', JSON.stringify(queue));
    syncState.pendingChanges = queue.length;
    saveSyncState();
}

// Ottieni coda sync locale
async function getLocalSyncQueue() {
    const queue = localStorage.getItem('localSyncQueue');
    return queue ? JSON.parse(queue) : [];
}

// Salva sync item in localStorage
function saveSyncItemToLocalStorage(item) {
    const pendingItems = JSON.parse(localStorage.getItem('pendingSyncItems') || '[]');
    pendingItems.push(item);
    localStorage.setItem('pendingSyncItems', JSON.stringify(pendingItems));
}

// Trigger sync automatica
async function triggerAutoSync() {
    if (syncState.isSyncing) return;
    
    syncState.isSyncing = true;
    updateSyncUI();
    
    try {
        const queue = await getLocalSyncQueue();
        
        if (queue.length === 0) {
            syncState.isSyncing = false;
            return;
        }
        
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < queue.length; i += 5) {
            const batch = queue.slice(i, i + 5);
            
            const results = await Promise.allSettled(
                batch.map(item => syncSingleItem(item))
            );
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    successCount++;
                    removeFromLocalSyncQueue(batch[index].id);
                } else {
                    failCount++;
                    incrementRetryCount(batch[index].id);
                }
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        syncState.lastSync = Date.now();
        syncState.pendingChanges = await getLocalSyncQueue().length;
        syncState.retryCount = 0;
        
        showSyncResults(successCount, failCount);
        
    } catch (error) {
        console.error('[Sync] Errore durante sync:', error);
        syncState.retryCount++;
        scheduleRetry();
    } finally {
        syncState.isSyncing = false;
        updateSyncUI();
        saveSyncState();
    }
}

// Sincronizza singolo elemento
async function syncSingleItem(item) {
    const { doc, setDoc, deleteDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
    );
    
    try {
        switch (item.operation) {
            case 'CREATE':
            case 'UPDATE':
                const docRef = doc(window.db, item.collection, item.docId);
                await setDoc(docRef, item.data);
                break;
            case 'DELETE':
                const deleteRef = doc(window.db, item.collection, item.docId);
                await deleteDoc(deleteRef);
                break;
        }
        return { success: true, id: item.id };
    } catch (error) {
        throw new Error(`Sync fallito: ${error.message}`);
    }
}

// Rimuovi dalla coda locale
function removeFromLocalSyncQueue(itemId) {
    const queue = JSON.parse(localStorage.getItem('localSyncQueue') || '[]');
    const newQueue = queue.filter(item => item.id !== itemId);
    localStorage.setItem('localSyncQueue', JSON.stringify(newQueue));
}

// Programma retry
function scheduleRetry() {
    const backoffDelay = Math.min(300000, Math.pow(2, syncState.retryCount) * 5000);
    
    setTimeout(() => {
        if (navigator.onLine) {
            triggerAutoSync();
        }
    }, backoffDelay);
}

// Mostra risultati sync
function showSyncResults(successCount, failCount) {
    if (successCount > 0 || failCount > 0) {
        const message = `Sincronizzazione: ${successCount} successi, ${failCount} falliti`;
        
        if (failCount === 0) {
            showToast(message, 'success');
        } else {
            showToast(message, 'warning');
        }
    }
}

// Controlla stato sync
async function checkSyncStatus() {
    if (!navigator.onLine) return;
    
    const localQueue = await getLocalSyncQueue();
    
    if (localQueue.length > 0 && !syncState.isSyncing) {
        triggerAutoSync();
    }
}

// Verifica dati pendenti
async function checkForPendingSync() {
    const localQueue = await getLocalSyncQueue();
    const pendingStorage = JSON.parse(localStorage.getItem('pendingSyncItems') || '[]');
    
    if (localQueue.length > 0 || pendingStorage.length > 0) {
        if (pendingStorage.length > 0) {
            pendingStorage.forEach(item => {
                addToSyncQueue(item.operation, item.collection, item.data, item.docId);
            });
            localStorage.removeItem('pendingSyncItems');
        }
        
        setTimeout(() => triggerAutoSync(), 2000);
    }
}

// Aggiorna UI sync
function updateSyncUI() {
    // MODIFICA: Abbiamo disabilitato la creazione dell'indicatore visivo
    return;

    /* CODICE ORIGINALE COMMENTATO:
    let syncIndicator = document.getElementById('sync-indicator');
    
    if (!syncIndicator) {
        syncIndicator = document.createElement('div');
        syncIndicator.id = 'sync-indicator';
        syncIndicator.className = 'sync-indicator';
        syncIndicator.innerHTML = '<i class="fas fa-sync-alt"></i>';
        document.body.appendChild(syncIndicator);
    }
    
    if (syncState.isSyncing) {
        syncIndicator.classList.add('syncing');
        syncIndicator.title = 'Sincronizzazione in corso...';
    } else if (syncState.pendingChanges > 0) {
        syncIndicator.classList.add('pending');
        syncIndicator.title = `${syncState.pendingChanges} modifiche in attesa`;
    } else {
        syncIndicator.classList.remove('syncing', 'pending');
        syncIndicator.title = 'Tutto sincronizzato';
    }
    */
}

// Salva stato sync
function saveSyncState() {
    localStorage.setItem('syncState', JSON.stringify(syncState));
}

// Carica stato sync
function loadSyncState() {
    const savedState = localStorage.getItem('syncState');
    if (savedState) {
        syncState = JSON.parse(savedState);
        updateSyncUI();
    }
}

// Funzione per salvataggio dati offline
function saveOfflineData(context, data) {
    try {
        const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
        offlineData.push({
            type: context,
            data: data,
            timestamp: new Date().toISOString(),
            attempts: 0
        });
        localStorage.setItem('offlineData', JSON.stringify(offlineData));
        
        showToast('Dati salvati offline. Sincronizzazione in background.', 'info');
        
    } catch (error) {
        console.error('Errore salvataggio offline:', error);
    }
}

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

function logErrorToAnalytics(error, context, additionalData = {}) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        context,
        error: {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        },
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        url: window.location.href,
        ...additionalData
    };
    
    const analyticsLog = JSON.parse(localStorage.getItem('analytics_errors') || '[]');
    analyticsLog.push(errorLog);
    
    if (analyticsLog.length > 100) {
        analyticsLog.splice(0, analyticsLog.length - 100);
    }
    
    localStorage.setItem('analytics_errors', JSON.stringify(analyticsLog));
    
    // Firebase Analytics se disponibile
    if (window.firebaseAnalytics) {
        window.firebaseAnalytics.logEvent('error_occurred', {
            error_context: context,
            error_message: error.message.substring(0, 100),
            error_code: error.code || 'none'
        });
    }
}

function logPerformanceMetric(name, duration) {
    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    metrics.push({
        name,
        duration,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    });
    
    if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100);
    }
    
    localStorage.setItem('performance_metrics', JSON.stringify(metrics));
}

// ============================================
// VARIABILI GLOBALI ORIGINALI
// ============================================

let appData = {
    fontane: [],
    beverini: [],
    news: []
};
let currentLatLng = null;
let screenHistory = ['home-screen'];
let currentFilter = {
    fontane: 'all',
    beverini: 'all'
};
let activityLog = [];
let searchResults = [];
let searchMarker = null;
let map = null;
let clusterGroup = null;
let markers = new Map();

// Variabili per la gestione del doppio tocco/uscita
let backPressTimer = null;
const EXIT_TOAST_TIMEOUT = 2000; 

let searchTimeout;
let isAdminAuthenticated = false;
let adminAuthTimeout = null;

// ============================================
// NUOVA FUNZIONE CENTRALE PER RESET SCROLL (Correzione scroll ovunque)
// ============================================
function resetScroll() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
    });
}
// Rimosso: window.addEventListener('load', resetScroll);


// ============================================
// FUNZIONI ORIGINALI (MODIFICATE CON NUOVE FEATURES)
// ============================================

// Firebase Firestore functions
async function loadFirebaseData(type) {
    try {
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        
        const collectionMap = {
            'fontane': 'fontane',
            'beverini': 'beverini',
            'news': 'news'
        };
        
        const collectionName = collectionMap[type];
        
        const dataRef = collection(window.db, collectionName);
        const snapshot = await safeFirebaseOperation(getDocs, `getDocs_${type}`, dataRef);
        
        const data = [];
        snapshot.forEach(doc => {
            const docData = doc.data();
            data.push({ 
                id: doc.id, 
                nome: docData.nome || '',
                indirizzo: docData.indirizzo || '',
                stato: docData.stato || 'funzionante',
                latitudine: docData.latitudine || 0,
                longitudine: docData.longitudine || 0,
                immagine: docData.immagine || '',
                anno: docData.anno || '',
                descrizione: docData.descrizione || '',
                storico: docData.storico || '',
                titolo: docData.titolo || '',
                contenuto: docData.contenuto || '',
                data: docData.data || new Date().toISOString().split('T')[0],
                categoria: docData.categoria || '',
                fonte: docData.fonte || '',
                last_modified: docData.last_modified || new Date().toISOString()
            });
        });
        
        appData[type] = data;
        saveLocalData();
        
        showToast(`${data.length} ${type} caricati da Firebase`, 'success');
        logActivity(`${data.length} ${type} caricati da Firebase`);
        
        return data;
    } catch (error) {
        await handleError(`loadFirebaseData_${type}`, error, `Utilizzo dati locali per ${type}`);
        loadLocalData(type);
        return appData[type];
    }
}

async function saveFirebaseData(type, item, id = null) {
    try {
        const { doc, setDoc, updateDoc, collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        
        let savedId;
        const collectionName = COLLECTIONS[type.toUpperCase()];
        
        if (id) {
            const docRef = doc(window.db, collectionName, id);
            await updateDoc(docRef, item);
            savedId = id;
        } else {
            const dataRef = collection(window.db, collectionName);
            const newDoc = await addDoc(dataRef, item);
            savedId = newDoc.id;
        }
        
        return savedId;
    } catch (error) {
        console.error(`Errore nel salvataggio ${type}:`, error);
        throw error;
    }
}

async function deleteFirebaseData(type, id) {
    try {
        const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const collectionName = COLLECTIONS[type.toUpperCase()];
        const docRef = doc(window.db, collectionName, id);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error(`Errore nell'eliminazione ${type}:`, error);
        throw error;
    }
}

// Local Storage functions
function saveLocalData() {
    try {
        localStorage.setItem('fontaneBeveriniData', JSON.stringify(appData));
        localStorage.setItem('fontaneBeveriniLastSync', new Date().toISOString());
    } catch (error) {
        console.error('Errore nel salvataggio locale:', error);
    }
}

function loadLocalData(type = null) {
    try {
        const savedData = localStorage.getItem('fontaneBeveriniData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (type) {
                return parsedData[type] || [];
            }
            appData = parsedData;
        }
    } catch (error) {
        console.error('Errore nel caricamento locale:', error);
    }
    return type ? [] : appData;
}

// Funzioni principali
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getStatusText(stato) {
    const statusMap = {
        'funzionante': 'Funzionante',
        'non-funzionante': 'Non Funzionante',
        'manutenzione': 'In Manutenzione'
    };
    return statusMap[stato] || 'Stato sconosciuto';
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
}

// ======================================================
// MODIFICA: Funzione showToast() con output visivo rimosso
// ======================================================
function showToast(message, type = 'info', duration = 3000) {
    // La logica per mostrare il toast è stata rimossa per disabilitare le notifiche visive.
    // Manteniamo solo la registrazione in console per debug.
    console.log(`[Toast Disabled] Tipo: ${type}, Messaggio: ${message}`);
    
    /* const toast = document.getElementById('toast');
    
    const typeConfig = {
        error: { background: 'var(--primary-red)', icon: 'fa-exclamation-triangle' },
        success: { background: 'var(--primary-green)', icon: 'fa-check-circle' },
        info: { background: 'var(--primary-blue)', icon: 'fa-info-circle' },
        warning: { background: 'var(--primary-orange)', icon: 'fa-exclamation-circle' }
    };
    
    const config = typeConfig[type] || typeConfig.info;
    
    toast.innerHTML = `<i class="fas ${config.icon}"></i> ${message}`;
    toast.style.background = config.background;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration); 
    */
}
// ======================================================
// FINE MODIFICA
// ======================================================

function logActivity(description) {
    const timestamp = new Date().toLocaleString('it-IT');
    activityLog.unshift({ description, timestamp });

    if (activityLog.length > 10) {
        activityLog = activityLog.slice(0, 10);
    }

    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    updateActivityLog();
}

function updateActivityLog() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    activityLog.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-desc">${activity.description}</div>
            <div class="activity-time">${activity.timestamp}</div>
        `;
        activityList.appendChild(activityItem);
    });
}

function updateDashboardStats() {
    document.getElementById('total-fontane').textContent = appData.fontane.length;
    document.getElementById('fontane-funzionanti').textContent = appData.fontane.filter(f => f.stato === 'funzionante').length;
    document.getElementById('fontane-non-funzionanti').textContent = appData.fontane.filter(f => f.stato === 'non-funzionante').length;
    document.getElementById('fontane-manutenzione').textContent = appData.fontane.filter(f => f.stato === 'manutenzione').length;
    
    document.getElementById('total-beverini').textContent = appData.beverini.length;
    document.getElementById('beverini-funzionanti').textContent = appData.beverini.filter(b => b.stato === 'funzionante').length;
    document.getElementById('beverini-non-funzionanti').textContent = appData.beverini.filter(b => b.stato === 'non-funzionante').length;
    document.getElementById('beverini-manutenzione').textContent = appData.beverini.filter(b => b.stato === 'manutenzione').length;
    
    document.getElementById('total-news').textContent = appData.news.length;
}

// Admin Authentication
function openAdminPanel() {
    if (isAdminAuthenticated) {
        showAdminPanel();
    } else {
        showAdminAuth();
    }
}

function showAdminAuth() {
    document.getElementById('admin-auth').style.display = 'flex';
    document.getElementById('admin-password').focus();
}

function closeAdminAuth() {
    document.getElementById('admin-auth').style.display = 'none';
    document.getElementById('admin-password').value = '';
    document.getElementById('auth-error').style.display = 'none';
}

async function checkAdminAuth() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorElement = document.getElementById('auth-error');

    try {
        const userCredential = await window.firebaseSignIn(window.auth, email, password);
        isAdminAuthenticated = true;
        
        closeAdminAuth();
        showAdminPanel();
        
        if (adminAuthTimeout) {
            clearTimeout(adminAuthTimeout);
        }
        adminAuthTimeout = setTimeout(() => {
            isAdminAuthenticated = false;
            showToast('Sessione amministratore scaduta', 'info');
        }, 30 * 60 * 1000);
        
        showToast('Accesso amministratore effettuato', 'success');
        logActivity('Accesso amministratore effettuato');
        
    } catch (error) {
        errorElement.style.display = 'block';
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
        console.error('Errore autenticazione:', error);
    }
}

function showAdminPanel() {
    document.getElementById('admin-panel').style.display = 'flex';
    
    loadAdminFontane();
    loadAdminBeverini();
    loadAdminNews();
    updateDashboardStats();
    
    // ✅ CARICA ANALYTICS DASHBOARD
    loadAnalyticsDashboard();
    updatePerformanceMetrics();
    
    const savedLog = localStorage.getItem('activityLog');
    if (savedLog) {
        activityLog = JSON.parse(savedLog);
        updateActivityLog();
    }
}

function closeAdminPanel() {
    document.getElementById('admin-panel').style.display = 'none';
}

function logoutAdmin() {
    isAdminAuthenticated = false;
    if (adminAuthTimeout) {
        clearTimeout(adminAuthTimeout);
        adminAuthTimeout = null;
    }
    closeAdminPanel();
    showToast('Logout amministratore effettuato', 'success');
    logActivity('Logout amministratore');
}

// Navigation and Screen Management
function showScreen(screenId) {
    const currentScreen = screenHistory[screenHistory.length - 1];
    
    if (currentScreen === screenId) return;
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'flex';
        setTimeout(() => {
            targetScreen.classList.add('active');
        }, 10);
        
        screenHistory.push(screenId);
        if (screenHistory.length > 10) {
            screenHistory = screenHistory.slice(-10);
        }
        
        // ✅ CORREZIONE FONDAMENTALE: Forza lo scroll all'inizio della pagina per tutte le schermate
        resetScroll();
        
        initializeScreenContent(screenId);
    }
    
    updateTabBar(screenId);
    
    // CORREZIONE: Nascondi sempre il pulsante di navigazione quando si cambia schermata
    document.getElementById('fixed-navigate-btn').classList.add('hidden');
    
    // Pulisci il backPressTimer se navighiamo in avanti dalla Home
    if (backPressTimer) {
        clearTimeout(backPressTimer);
        backPressTimer = null;
        const toast = document.getElementById('toast');
        if (toast) toast.classList.remove('show');
    }
}

function goBack() {
    // CORREZIONE: Nascondi subito il pulsante di navigazione all'inizio di goBack
    document.getElementById('fixed-navigate-btn').classList.add('hidden');
    
    if (screenHistory.length > 1) {
        screenHistory.pop();
        const previousScreen = screenHistory[screenHistory.length - 1];
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(previousScreen);
        if (targetScreen) {
            targetScreen.style.display = 'block';
            setTimeout(() => {
                targetScreen.classList.add('active');
            }, 10);
            
            // ✅ CORREZIONE: Forza lo scroll anche quando si torna indietro
            resetScroll();
            
            initializeScreenContent(previousScreen);
        }
        updateTabBar(previousScreen);
    } else {
        showScreen('home-screen');
    }
}

function updateTabBar(activeScreen) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.querySelector(`.tab-btn[data-target="${activeScreen}"]`);
    if (activeTab) activeTab.classList.add('active');
}

function initializeScreenContent(screenId) {
    switch(screenId) {
        case 'fontane-screen':
            loadFontane();
            break;
        case 'beverini-screen':
            loadBeverini();
            break;
        case 'mappa-screen':
            initMappa();
            break;
        case 'news-screen':
            loadNews();
            break;
    }
}
// Data Loading Functions
async function loadFontane() {
    const fontaneList = document.getElementById('fontane-list');
    if (!fontaneList) return;
    
    showSkeletonLoader(fontaneList);
    
    try {
        await loadFirebaseData('fontane');
        renderGridItems(fontaneList, getFilteredItems('fontane'), 'fontana');
        // ✅ Applica lazy loading dopo il rendering
        setupLazyLoading(); 
    } catch (error) {
        showToast('Errore nel caricamento fontane', 'error');
    }
}

async function loadBeverini() {
    const beveriniList = document.getElementById('beverini-list');
    if (!beveriniList) return;
    
    showSkeletonLoaderCompact(beveriniList);
    
    try {
        await loadFirebaseData('beverini');
        renderCompactItems(beveriniList, getFilteredItems('beverini'), 'beverino');
        // ✅ Applica lazy loading dopo il rendering
        setupLazyLoading(); 
    } catch (error) {
        showToast('Errore nel caricamento beverini', 'error');
    }
}

async function loadNews() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;
    
    try {
        await loadFirebaseData('news');
        renderNewsItems(newsList, appData.news);
    } catch (error) {
        showToast('Errore nel caricamento news', 'error');
    }
}

function getFilteredItems(type) {
    const items = appData[type];
    const filter = currentFilter[type];

    if (!items || filter === 'all') {
        return items || [];
    }

    return items.filter(item => item.stato === filter);
}

function setFilter(type, stato) {
    currentFilter[type] = stato;

    document.querySelectorAll(`#${type}-screen .filter-btn`).forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`#${type}-screen .filter-btn.${stato}`).classList.add('active');

    if (type === 'fontane') {
        renderGridItems(document.getElementById('fontane-list'), getFilteredItems('fontane'), 'fontana');
        setupLazyLoading(); // Ri-applica dopo il filtraggio
    } else if (type === 'beverini') {
        renderCompactItems(document.getElementById('beverini-list'), getFilteredItems('beverini'), 'beverino');
        setupLazyLoading(); // Ri-applica dopo il filtraggio
    }
}

const debouncedFilter = debounce(function(type, query) {
    const container = document.getElementById(`${type}-list`);
    if (!container) return;
    
    let items;
    if (type === 'beverini') {
        items = container.getElementsByClassName('compact-item');
    } else {
        items = container.getElementsByClassName('grid-item');
    }

    let visibleCount = 0;
    for (let i = 0; i < items.length; i++) {
        let name, address;

        if (type === 'beverini') {
            name = items[i].getElementsByClassName('compact-item-name')[0].textContent;
            address = items[i].getElementsByClassName('compact-item-address')[0].textContent;
        } else {
            name = items[i].getElementsByClassName('item-name')[0].textContent;
            address = items[i].getElementsByClassName('item-address')[0].textContent;
        }

        const isVisible = name.toLowerCase().includes(query.toLowerCase()) ||
                         address.toLowerCase().includes(query.toLowerCase());
        items[i].style.display = isVisible ? 'flex' : 'none';
        if (isVisible) visibleCount++;
    }

    if (visibleCount === 0 && query) {
        const existingEmptyStates = container.getElementsByClassName('empty-state');
        for (let i = 0; i < existingEmptyStates.length; i++) {
            existingEmptyStates[i].remove();
        }
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon"><i class="fas fa-search"></i></div>
            <div class="empty-state-text">Nessun risultato trovato</div>
            <div class="empty-state-subtext">Prova a modificare i termini di ricerca</div>
        `;
        container.appendChild(emptyState);
    } else if (query === '') {
        const emptyStates = container.getElementsByClassName('empty-state');
        for (let i = 0; i < emptyStates.length; i++) {
            emptyStates[i].remove();
        }
    }
}, 300);

// Rendering Functions
function showSkeletonLoader(container, count = 6) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeletonItem = document.createElement('div');
        skeletonItem.className = 'grid-item';
        skeletonItem.innerHTML = `
            <div class="skeleton-loader skeleton-image"></div>
            <div class="item-content">
                <div class="skeleton-loader skeleton-text"></div>
                <div class="skeleton-loader skeleton-text short"></div>
                <div class="item-footer">
                    <div class="skeleton-loader skeleton-text" style="width: 80px;"></div>
                    <div class="skeleton-loader skeleton-text" style="width: 40px;"></div>
                </div>
            </div>
        `;
        container.appendChild(skeletonItem);
    }
}

function showSkeletonLoaderCompact(container, count = 6) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeletonItem = document.createElement('div');
        skeletonItem.className = 'compact-item';
        skeletonItem.innerHTML = `
            <div class="skeleton-loader" style="width: 80px; height: 80px;"></div>
            <div class="compact-item-content">
                <div class="compact-item-header">
                    <div class="skeleton-loader skeleton-text" style="width: 70%;"></div>
                    <div class="skeleton-loader skeleton-text" style="width: 20px; height: 20px;"></div>
                </div>
                <div class="skeleton-loader skeleton-text short" style="width: 90%;"></div>
                <div class="compact-item-footer">
                    <div class="skeleton-loader skeleton-text" style="width: 80px;"></div>
                    <div class="skeleton-loader skeleton-text" style="width: 40px;"></div>
                </div>
            </div>
        `;
        container.appendChild(skeletonItem);
    }
}

function renderGridItems(container, items, type) {
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-${type === 'fontana' ? 'monument' : 'faucet'}"></i></div>
                <div class="empty-state-text">Nessuna ${type} disponibile</div>
                <div class="empty-state-subtext">${currentFilter[type + 's'] !== 'all' ? 'Prova a cambiare filtro' : 'Aggiungi tramite il pannello di controllo'}</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    items.forEach(item => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.onclick = () => {
            showDetail(item.id, type);
            currentLatLng = { lat: item.latitudine, lng: item.longitudine };
            document.getElementById('fixed-navigate-btn').classList.remove('hidden');
        };
        
        const hasCustomImage = item.immagine && item.immagine.trim() !== '';
        
        // MODIFICATO: Usa data-src per lazy loading e fallback in src
        gridItem.innerHTML = `
            <div class="item-image-container">
                <img src="./images/sfondo-home.jpg" 
                     data-src="${item.immagine || './images/sfondo-home.jpg'}" 
                     alt="${item.nome}" 
                     class="item-image" 
                     onerror="this.src='./images/sfondo-home.jpg'">
            </div>
            <div class="item-content">
                <div class="item-name">${item.nome}</div>
                <div class="item-address">${item.indirizzo}</div>
                <div class="item-footer">
                    <span class="item-status status-${item.stato}">${getStatusText(item.stato)}</span>
                    <span class="image-indicator ${hasCustomImage ? 'image-custom' : 'image-default'}">${hasCustomImage ? '<i class="fas fa-check"></i>' : '<i class="fas fa-image"></i>'}</span>
                </div>
            </div>
        `;
        container.appendChild(gridItem);
    });
}

function renderCompactItems(container, items, type) {
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-${type === 'beverino' ? 'faucet' : 'monument'}"></i></div>
                <div class="empty-state-text">Nessun ${type} disponibile</div>
                <div class="empty-state-subtext">${currentFilter[type + 's'] !== 'all' ? 'Prova a cambiare filtro' : 'Aggiungi tramite il pannello di controllo'}</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    items.forEach(item => {
        const compactItem = document.createElement('div');
        compactItem.className = 'compact-item';

        const totalLength = (item.nome || '').length + (item.indirizzo || '').length;
        let heightClass = '';

        if (totalLength > 100) {
            heightClass = 'very-long-content';
        } else if (totalLength > 60) {
            heightClass = 'long-content';
        }

        if (heightClass) {
            compactItem.classList.add(heightClass);
        }

        compactItem.onclick = () => {
            showDetail(item.id, type);
            currentLatLng = { lat: item.latitudine, lng: item.longitudine };
            document.getElementById('fixed-navigate-btn').classList.remove('hidden');
        };

        const hasCustomImage = item.immagine && item.immagine.trim() !== '';
        
        // MODIFICATO: Usa data-src per lazy loading e fallback in src
        compactItem.innerHTML = `
            <img src="./images/default-beverino.jpg"
                 data-src="${item.immagine || './images/default-beverino.jpg'}"
                 alt="${item.nome}"
                 class="compact-item-image"
                 onerror="this.src='./images/default-beverino.jpg'">
            <div class="compact-item-content">
                <div class="compact-item-header">
                    <div class="compact-item-name">${item.nome}</div>
                    <span class="image-indicator ${hasCustomImage ? 'image-custom' : 'image-default'}">
                        ${hasCustomImage ? '<i class="fas fa-check"></i>' : '<i class="fas fa-image"></i>'}
                    </span>
                </div>
                <div class="compact-item-address">${item.indirizzo}</div>
                <div class="compact-item-footer">
                    <span class="compact-item-status status-${item.stato}">${getStatusText(item.stato)}</span>
                </div>
            </div>
        `;
        container.appendChild(compactItem);
    });
}

function renderNewsItems(container, news) {
    if (!news || news.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-newspaper"></i></div>
                <div class="empty-state-text">Nessuna news disponibile</div>
                <div class="empty-state-subtext">Torna presto per aggiornamenti</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    const sortedNews = [...news].sort((a, b) => new Date(b.data) - new Date(a.data));
    sortedNews.forEach(item => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.innerHTML = `
            <div class="news-header">
                <div class="news-title">${item.titolo}</div>
                <div class="news-date">${formatDate(item.data)}</div>
            </div>
            <div class="news-content">${item.contenuto}</div>
            <div class="news-footer">
                <span class="news-category">${item.categoria}</span>
                <span class="news-source">Fonte: ${item.fonte}</span>
            </div>
        `;
        container.appendChild(newsCard);
    });
}

// Detail View
function showDetail(id, type) {
    let item, screenId, titleElement, contentElement;
    
    if (type === 'fontana') {
        item = appData.fontane.find(f => f.id == id);
        screenId = 'fontana-detail-screen';
        titleElement = document.getElementById('fontana-detail-title');
        contentElement = document.getElementById('fontana-detail-content');
    } else {
        item = appData.beverini.find(b => b.id == id);
        screenId = 'beverino-detail-screen';
        titleElement = document.getElementById('beverino-detail-title');
        contentElement = document.getElementById('beverino-detail-content');
    }
    
    if (!item) {
        showToast('Elemento non trovato', 'error');
        return;
    }
    
    titleElement.textContent = item.nome;
    contentElement.innerHTML = generateDetailHTML(item, type);
    currentLatLng = { lat: item.latitudine, lng: item.longitudine };
    document.getElementById('fixed-navigate-btn').classList.remove('hidden');
    showScreen(screenId);
}

// ✅ generateDetailHTML con logica condizionale per nascondere la descrizione vuota
function generateDetailHTML(item, type) {
    let specificFields = '';
    if (type === 'fontana') {
        specificFields = `
            ${item.anno ? `<div class="info-item"><span class="info-label">Anno:</span><span class="info-value">${item.anno}</span></div>` : ''}
            ${item.storico ? `<div class="info-item"><span class="info-label">Storico:</span><span class="info-value">${item.storico}</span></div>` : ''}
        `;
    }
    
    // MODIFICA: Determina l'immagine di fallback condizionale
    const fallbackImage = type === 'fontana' ? './images/sfondo-home.jpg' : './images/default-beverino.jpg';

    // ✅ LOGICA CONDIZIONALE: crea il blocco HTML solo se la descrizione non è vuota.
    const descriptionHTML = (item.descrizione && item.descrizione.trim())
        ? `
            <div class="detail-info">
                <div class="info-item">
                    <span class="info-label">Descrizione:</span>
                    <span class="info-value">${item.descrizione}</span>
                </div>
            </div>
        ` 
        : ''; // Se vuota, la riga non appare

    return `
        <img src="${item.immagine || fallbackImage}" class="detail-image" alt="${item.nome}" onerror="this.src='${fallbackImage}'">
        <div class="detail-info">
            <div class="info-item">
                <span class="info-label">${type === 'fontana' ? 'Indirizzo:' : 'Posizione:'}</span>
                <span class="info-value">${item.indirizzo}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Stato:</span>
                <span class="info-value">${getStatusText(item.stato)}</span>
            </div>
            ${specificFields}
        </div>
        ${descriptionHTML}
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

// Navigation
function navigateTo(lat, lng) {
    currentLatLng = { lat, lng };
    document.getElementById('navigation-modal').style.display = 'flex';
}

function navigateToFixed() {
    if (!currentLatLng) return;
    navigateTo(currentLatLng.lat, currentLatLng.lng);
}

function openGoogleMaps() {
    if (!currentLatLng) return;
    const { lat, lng } = currentLatLng;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    window.open(url, '_blank');
    closeNavigationModal();
    showToast('Apertura Google Maps...', 'info');
}

function openAppleMaps() {
    if (!currentLatLng) return;
    const { lat, lng } = currentLatLng;
    const url = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`;
    window.open(url, '_blank');
    closeNavigationModal();
    showToast('Apertura Apple Maps...', 'info');
}

function closeNavigationModal() {
    document.getElementById('navigation-modal').style.display = 'none';
    currentLatLng = null;
}

// Map Functions
function initMappa() {
    if (!map) {
        map = L.map('map').setView([40.8518, 14.2681], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        clusterGroup = L.markerClusterGroup();
        map.addLayer(clusterGroup);

        addMapControls();
        setupSearchAutocomplete();
    }

    clusterGroup.clearLayers();
    markers.clear();

    appData.fontane.forEach(fontana => {
        if (isValidCoordinate(fontana.latitudine, fontana.longitudine)) {
            const marker = createMarker(fontana, 'fontana');
            const markerId = `fontana-${fontana.id}`;

            markers.set(markerId, marker);
            clusterGroup.addLayer(marker);
        }
    });

    appData.beverini.forEach(beverino => {
        if (isValidCoordinate(beverino.latitudine, beverino.longitudine)) {
            const marker = createMarker(beverino, 'beverino');
            const markerId = `beverino-${beverino.id}`;

            markers.set(markerId, marker);
            clusterGroup.addLayer(marker);
        }
    });

    if (markers.size > 0) {
        const bounds = clusterGroup.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds.pad(0.1));
        }
    }

    requestUserLocation();
}

function createMarker(item, type) {
    const icon = getIconForType(type);
    const marker = L.marker([item.latitudine, item.longitudine], { icon });

    marker.bindPopup(`
        <div class="leaflet-popup-content">
            <div class="popup-title">${item.nome}</div>
            <p>${item.indirizzo}</p>
            <p>Stato: ${getStatusText(item.stato)}</p>
            <button class="popup-btn" onclick="showDetail('${item.id}', '${type}')">Dettagli</button>
            <button class="popup-btn" onclick="navigateTo(${item.latitudine}, ${item.longitudine})" style="margin-top: 5px; background: var(--primary-green);">Naviga</button>
        </div>
    `);

    return marker;
}

function isValidCoordinate(lat, lng) {
    return !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 &&
           lng >= -180 && lng <= 180;
}

function getIconForType(type) {
    const iconConfigs = {
        fontana: {
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        },
        beverino: {
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        }
    };

    return L.icon(iconConfigs[type] || iconConfigs.fontana);
}

function addMapControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'map-controls';
    
    const locateBtn = document.createElement('button');
    locateBtn.className = 'map-control-btn';
    locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
    locateBtn.title = 'Centra sulla mia posizione';
    locateBtn.onclick = requestUserLocation;
    
    const fitBoundsBtn = document.createElement('button');
    fitBoundsBtn.className = 'map-control-btn';
    fitBoundsBtn.innerHTML = '<i class="fas fa-expand"></i>';
    fitBoundsBtn.title = 'Mostra tutti i punti';
    fitBoundsBtn.onclick = fitMapToMarkers;
    
    controlsContainer.appendChild(locateBtn);
    controlsContainer.appendChild(fitBoundsBtn);
    document.getElementById('mappa-screen').appendChild(controlsContainer);
}

function requestUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                if (window.userMarker) {
                    map.removeLayer(window.userMarker);
                }
                window.userMarker = L.marker([latitude, longitude], {
                    icon: L.icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34]
                    })
                })
                .addTo(map)
                .bindPopup('La tua posizione');

                map.setView([latitude, longitude], 16);
                showToast('Posizione corrente visualizzata sulla mappa', 'success');
            },
            error => {
                handleGeolocationError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        showToast('Geolocalizzazione non supportata dal browser', 'error');
    }
}

function handleGeolocationError(error) {
    let message = 'Errore nel rilevamento posizione';

    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Autorizzazione alla geolocalizzazione negata.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Posizione non disponibile. Verifica che il GPS sia attivo.';
            break;
        case error.TIMEOUT:
            message = 'Timeout nel rilevamento. Riprova in zona con migliore ricezione.';
            break;
        default:
            message = `Errore: ${error.message}`;
    }

    showToast(message, 'error');
}

function fitMapToMarkers() {
    if (markers.size > 0) {
        const bounds = clusterGroup.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds.pad(0.1));
            showToast('Vista adattata a tutti i punti', 'success');
        }
    } else {
        showToast('Nessun punto da mostrare', 'info');
    }
}

// Share Function
function shareItem(id, type) {
    let item;
    if (type === 'fontana') {
        item = appData.fontane.find(f => f.id == id);
    } else {
        item = appData.beverini.find(b => b.id == id);
    }
    if (!item) {
        showToast('Elemento non trovato', 'error');
        return;
    }
    
    const text = `${item.nome} - ${item.indirizzo}`;
    const url = `${window.location.origin}${window.location.pathname}?${type}=${id}`;
    
    if (navigator.share) {
        navigator.share({
            title: item.nome,
            text: text,
            url: url
        })
        .then(() => showToast('Condivisione completata', 'success'))
        .catch(error => {
            if (error.name !== 'AbortError') {
                showToast('Errore nella condivisione', 'error');
            }
        });
    } else {
        navigator.clipboard.writeText(`${text} - ${url}`)
            .then(() => showToast('Link copiato negli appunti', 'success'))
            .catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = `${text} - ${url}`;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('Link copiato negli appunti', 'success');
            });
    }
}

// Search Functions
async function searchAddressOnMap(query) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=it&accept-language=it`,
            {
                headers: {
                    'User-Agent': 'FontaneBeveriniNapoli/1.0'
                }
            }
        );

        const results = await response.json();

        if (results.length > 0) {
            return results;
        } else {
            showToast('Nessun risultato trovato', 'warning');
            return [];
        }
    } catch (error) {
        showToast('Errore nella ricerca', 'error');
        return [];
    }
}

function handleMapSearch(event) {
    if (event.key === 'Enter') {
        performMapSearch();
    }
}

async function performMapSearch() {
    const query = document.getElementById('map-search-input').value.trim();
    if (!query) return;

    showToast('Ricerca in corso...', 'info');

    const results = await searchAddressOnMap(query);
    displaySearchResults(results);
}

function displaySearchResults(results) {
    searchResults = results;
    const container = document.getElementById('map-search-results');

    if (results.length === 0) {
        container.innerHTML = '<div class="search-result-item">Nessun risultato trovato</div>';
        container.style.display = 'block';
        return;
    }

    container.innerHTML = results.map((result, index) => `
        <div class="search-result-item" onclick="selectSearchResult(${index})">
            <div class="search-result-name">${result.display_name.split(',')[0]}</div>
            <div class="search-result-address">${result.display_name}</div>
        </div>
    `).join('');

    container.style.display = 'block';
}

function selectSearchResult(index) {
    const result = searchResults[index];

    if (searchMarker) {
        map.removeLayer(searchMarker);
    }

    searchMarker = L.marker([result.lat, result.lon])
        .addTo(map)
        .bindPopup(`
            <div class="leaflet-popup-content">
                <div class="popup-title">${result.display_name.split(',')[0]}</div>
                <p>${result.display_name}</p>
                <button class="popup-btn" onclick="centerOnSearchResult(${result.lat}, ${result.lon})">Centra qui</button>
                <button class="popup-btn" onclick="addAsNewPoint('${result.display_name}', ${result.lat}, ${result.lon})"
                        style="background: var(--primary-green); margin-top: 5px;">
                    Aggiungi come nuovo punto
                </button>
            </div>
        `)
        .openPopup();

    map.setView([result.lat], [result.lon], 16);

    document.getElementById('map-search-results').style.display = 'none';
    document.getElementById('map-search-input').value = '';

    showToast('Risultato trovato!', 'success');
}

function centerOnSearchResult(lat, lng) {
    map.setView([lat, lng], 16);
}

function addAsNewPoint(name, lat, lng) {
    const type = name.toLowerCase().includes('fontana') ? 'fontana' : 'beverino';

    showAdminTab(`${type}-admin`);

    document.getElementById(`${type}-nome`).value = name.split(',')[0];
    document.getElementById(`${type}-indirizzo`).value = name;
    document.getElementById(`${type}-latitudine`).value = lat;
    document.getElementById(`${type}-longitudine`).value = lng;

    showToast(`Compila i campi mancanti e salva il nuovo ${type}`, 'info');
}

function setupSearchAutocomplete() {
    const searchInput = document.getElementById('map-search-input');

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length < 3) {
            document.getElementById('map-search-results').style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            const results = await searchAddressOnMap(query);
            displaySearchResults(results);
        }, 500);
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.map-search-container')) {
            document.getElementById('map-search-results').style.display = 'none';
        }
    });
}

// Location Functions
function getCurrentLocationCoordinatesOnly(type) {
    showToast('Rilevamento coordinate in corso...', 'info');

    if (!navigator.geolocation) {
        showToast('Geolocalizzazione non supportata dal browser', 'error');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            document.getElementById(`${type}-latitudine`).value = lat.toFixed(6);
            document.getElementById(`${type}-longitudine`).value = lng.toFixed(6);

            showToast('Coordinate rilevate con successo!', 'success');
            logActivity(`Coordinate rilevate per ${type}`);
        },
        handleGeolocationError,
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        }
    );
}

async function getCurrentLocationWithAddress(type) {
    showToast('Rilevamento posizione e indirizzo...', 'info');

    if (!navigator.geolocation) {
        showToast('Geolocalizzazione non supportata dal browser', 'error');
        return;
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        });
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        document.getElementById(`${type}-latitudine`).value = lat.toFixed(6);
        document.getElementById(`${type}-longitudine`).value = lng.toFixed(6);

        try {
            const address = await reverseGeocode(lat, lng);
            if (address) {
                document.getElementById(`${type}-indirizzo`).value = address;
                showToast('Posizione e indirizzo rilevati!', 'success');
                logActivity(`Posizione e indirizzo rilevati per ${type}`);
            } else {
                document.getElementById(`${type}-indirizzo`).value = `Coordinate: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                showToast('Posizione rilevata (indirizzo non disponibile)', 'warning');
            }
        } catch (geocodeError) {
            document.getElementById(`${type}-indirizzo`).value = `Coordinate: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            showToast('Posizione rilevata - inserisci indirizzo manualmente', 'warning');
        }

    } catch (error) {
        handleGeolocationError(error);
    }
}

async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'it-IT,it;q=0.9',
                    'User-Agent': 'FontaneBeveriniNapoli/1.0'
                }
            }
        );
        
        const data = await response.json();
        
        if (data && data.address) {
            const parts = [];
            if (data.address.road) parts.push(data.address.road);
            if (data.address.house_number) parts.push(data.address.house_number);
            
            if (parts.length > 0) {
                let formattedAddress = parts.join(', ');
                
                if (data.address.city || data.address.town || data.address.village) {
                    const city = data.address.city || data.address.town || data.address.village;
                    if (data.address.postcode) {
                        formattedAddress += `, ${data.address.postcode} ${city}`;
                    } else {
                        formattedAddress += `, ${city}`;
                    }
                }
                return formattedAddress;
            }
            
            return data.address.city || data.address.town || data.address.village || null;
        }
    } catch (error) {
        console.error('Errore reverse geocoding:', error);
    }
    
    return null;
}

// Admin Panel Functions
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

function showAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.admin-tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Fontane Admin
async function loadAdminFontane() {
    const tbody = document.getElementById('fontane-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    appData.fontane.forEach(fontana => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fontana.id}</td>
            <td>${fontana.nome}</td>
            <td>${fontana.indirizzo}</td>
            <td><span class="item-status status-${fontana.stato}">${getStatusText(fontana.stato)}</span></td>
            <td class="admin-item-actions">
                <button class="edit-btn" onclick="editFontana('${fontana.id}')">Modifica</button>
                <button class="delete-btn" onclick="deleteFontana('${fontana.id}')">Elimina</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editFontana(id) {
    const fontana = appData.fontane.find(f => f.id == id);
    if (!fontana) return;
    
    document.getElementById('fontana-id').value = fontana.id;
    document.getElementById('fontana-nome').value = fontana.nome || '';
    document.getElementById('fontana-indirizzo').value = fontana.indirizzo || '';
    document.getElementById('fontana-stato').value = fontana.stato || 'funzionante';
    document.getElementById('fontana-anno').value = fontana.anno || '';
    document.getElementById('fontana-descrizione').value = fontana.descrizione || '';
    document.getElementById('fontana-storico').value = fontana.storico || '';
    document.getElementById('fontana-latitudine').value = fontana.latitudine || '';
    document.getElementById('fontana-longitudine').value = fontana.longitudine || '';
    document.getElementById('fontana-immagine').value = fontana.immagine || '';
    
    showAdminTab('fontane-admin');
}

// MODIFICA: saveFontana con supporto offline
async function saveFontana(e) {
    e.preventDefault();
    
    try {
        const id = document.getElementById('fontana-id').value;
        const nome = document.getElementById('fontana-nome').value.trim();
        const indirizzo = document.getElementById('fontana-indirizzo').value.trim();
        const stato = document.getElementById('fontana-stato').value;
        const anno = document.getElementById('fontana-anno').value.trim();
        const descrizione = document.getElementById('fontana-descrizione').value.trim();
        const storico = document.getElementById('fontana-storico').value.trim();
        const latitudine = parseFloat(document.getElementById('fontana-latitudine').value) || 0;
        const longitudine = parseFloat(document.getElementById('fontana-longitudine').value) || 0;
        const immagine = document.getElementById('fontana-immagine').value.trim();
        
        const fontanaData = {
            nome,
            indirizzo,
            stato,
            anno,
            descrizione,
            storico,
            latitudine,
            longitudine,
            immagine,
            last_modified: new Date().toISOString()
        };
        
        // Validazione
        const validationErrors = validateFontanaData(fontanaData);
        if (validationErrors.length > 0) {
            throw validationErrors[0];
        }
        
        let savedId;
        const operation = id ? 'UPDATE' : 'CREATE';
        
        if (navigator.onLine) {
            // Online: salva direttamente
            if (id && id.trim() !== '') {
                savedId = await safeFirebaseOperation(
                    saveFirebaseData,
                    'update_fontana',
                    'fontane',
                    fontanaData,
                    id
                );
                
                const index = appData.fontane.findIndex(f => f.id == id);
                if (index !== -1) {
                    appData.fontane[index] = { id, ...fontanaData };
                }
                showToast('Fontana modificata con successo', 'success');
            } else {
                savedId = await safeFirebaseOperation(
                    saveFirebaseData,
                    'create_fontana',
                    'fontane',
                    fontanaData
                );
                
                appData.fontane.push({ id: savedId, ...fontanaData });
                showToast(`Fontana aggiunta con successo (ID: ${savedId})`, 'success');
            }
        } else {
            // Offline: aggiungi a coda sync
            savedId = id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await addToSyncQueue(
                operation,
                'fontane',
                fontanaData,
                savedId
            );
            
            if (operation === 'UPDATE') {
                const index = appData.fontane.findIndex(f => f.id == id);
                if (index !== -1) {
                    appData.fontane[index] = { id: savedId, ...fontanaData };
                }
            } else {
                appData.fontane.push({ id: savedId, ...fontanaData });
            }
            
            showToast('Fontana salvata localmente. Sarà sincronizzata online dopo.', 'info');
        }
        
        saveLocalData();
        loadAdminFontane();
        resetFontanaForm();
        
        loadFontane();
        updateDashboardStats();
        
        console.log('Fontana salvata, ID:', savedId);
        
    } catch (error) {
        await handleError('saveFontana', error, 'Errore nel salvataggio della fontana');
    }
}

function resetFontanaForm() {
    document.getElementById('fontana-form').reset();
    document.getElementById('fontana-id').value = '';
}

async function deleteFontana(id) {
    if (!confirm('Sei sicuro di voler eliminare questa fontana?')) return;
    
    try {
        if (navigator.onLine) {
            await deleteFirebaseData('fontane', id);
        } else {
            // Offline: aggiungi a coda sync
            const fontana = appData.fontane.find(f => f.id == id);
            if (fontana) {
                await addToSyncQueue('DELETE', 'fontane', fontana, id);
            }
        }
        
        appData.fontane = appData.fontane.filter(f => f.id != id);
        
        saveLocalData();
        loadAdminFontane();
        loadFontane();
        updateDashboardStats();
        
        showToast('Fontana eliminata con successo', 'success');
        logActivity('Fontana eliminata');
    } catch (error) {
        showToast('Errore nell\'eliminazione della fontana', 'error');
    }
}

// Beverini Admin
async function loadAdminBeverini() {
    const tbody = document.getElementById('beverini-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    appData.beverini.forEach(beverino => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${beverino.id}</td>
            <td>${beverino.nome}</td>
            <td>${beverino.indirizzo}</td>
            <td><span class="item-status status-${beverino.stato}">${getStatusText(beverino.stato)}</span></td>
            <td class="admin-item-actions">
                <button class="edit-btn" onclick="editBeverino('${beverino.id}')">Modifica</button>
                <button class="delete-btn" onclick="deleteBeverino('${beverino.id}')">Elimina</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ✅ MODIFICA A: editBeverino con caricamento campo descrizione
function editBeverino(id) {
    const beverino = appData.beverini.find(b => b.id == id);
    if (!beverino) return;
    
    document.getElementById('beverino-id').value = beverino.id;
    document.getElementById('beverino-nome').value = beverino.nome || '';
    document.getElementById('beverino-indirizzo').value = beverino.indirizzo || '';
    document.getElementById('beverino-stato').value = beverino.stato || 'funzionante';
    
    // ✅ CARICA LA DESCRIZIONE
    document.getElementById('beverino-descrizione').value = beverino.descrizione || ''; 
    
    document.getElementById('beverino-latitudine').value = beverino.latitudine || '';
    document.getElementById('beverino-longitudine').value = beverino.longitudine || '';
    document.getElementById('beverino-immagine').value = beverino.immagine || '';
    
    showAdminTab('beverini-admin');
}

// ✅ MODIFICA B: saveBeverino con salvataggio campo descrizione e supporto offline
async function saveBeverino(e) {
    e.preventDefault();
    
    const id = document.getElementById('beverino-id').value;
    const nome = document.getElementById('beverino-nome').value.trim();
    const indirizzo = document.getElementById('beverino-indirizzo').value.trim();
    const stato = document.getElementById('beverino-stato').value;
    const latitudine = parseFloat(document.getElementById('beverino-latitudine').value) || 0;
    const longitudine = parseFloat(document.getElementById('beverino-longitudine').value) || 0;
    const immagine = document.getElementById('beverino-immagine').value.trim();
    
    // ✅ LEGGE LA DESCRIZIONE DAL FORM
    const descrizione = document.getElementById('beverino-descrizione').value.trim();
    
    const beverinoData = {
        nome,
        indirizzo,
        stato,
        latitudine,
        longitudine,
        immagine,
        // ✅ INCLUDE LA DESCRIZIONE NEI DATI
        descrizione, 
        last_modified: new Date().toISOString()
    };
    
    try {
        const validationErrors = validateBeverinoData(beverinoData);
        if (validationErrors.length > 0) {
            throw validationErrors[0];
        }
        
        let savedId;
        const operation = id ? 'UPDATE' : 'CREATE';
        
        if (navigator.onLine) {
            if (id && id.trim() !== '') {
                savedId = await safeFirebaseOperation(
                    saveFirebaseData,
                    'update_beverino',
                    'beverini',
                    beverinoData,
                    id
                );
                
                const index = appData.beverini.findIndex(b => b.id == id);
                if (index !== -1) {
                    appData.beverini