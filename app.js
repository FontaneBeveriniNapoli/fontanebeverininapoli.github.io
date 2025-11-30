// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBvDfxm-LSAcu0NwtJ8DYxxrjY-83LlLPU",
    authDomain: "abcnapolifontane.firebaseapp.com",
    projectId: "abcnapolifontane",
    storageBucket: "abcnapolifontane.firebasestorage.app",
    messagingSenderId: "686936372148",
    appId: "1:686936372148:web:4147bab1bab73583b638e1",
    measurementId: "G-DPEC2SNGDM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Variabili per la sequenza segreta
let secretSequence = [];
const correctSequence = ['logo', 'title', 'logo'];

// Funzione per gestire la sequenza segreta
function handleSecretSequence(elementType) {
    secretSequence.push(elementType);

    if (secretSequence.length === 3 &&
        secretSequence[0] === correctSequence[0] &&
        secretSequence[1] === correctSequence[1] &&
        secretSequence[2] === correctSequence[2]) {
        showAdminAuth();
        secretSequence = [];
    } else if (secretSequence.length >= 3) {
        setTimeout(() => {
            secretSequence = [];
        }, 2000);
    }
}

let appData = {
    fontane: [],
    beverini: [],
    news: []
};
let currentLatLng = null;
let mappaInizializzata = false;
let currentMapMarkers = [];
let currentDestination = null;
let screenHistory = ['home-screen'];
let currentPage = {
    fontane: 1,
    beverini: 1,
    news: 1
};
const itemsPerPage = 10;
let userMarker = null;
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
let searchTimeout;

// Firebase Auth State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User logged in:', user.email);
        updateUserEmail();
        showAdminPanel();
    } else {
        // User is signed out
        console.log('User logged out');
        closeAdminPanel();
    }
});

// Firebase Functions
async function loadFromFirebase(type) {
    try {
        showToast(`Caricamento ${type} da Firebase...`, 'info');
        
        const snapshot = await db.collection(type).get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        appData[type] = data;
        saveData();
        showToast(`${data.length} ${type} caricati da Firebase`, 'success');
        
        if (type === 'fontane') loadFontane();
        if (type === 'beverini') loadBeverini();
        if (type === 'news') loadNews();
        
        if (document.getElementById('admin-panel').style.display === 'flex') {
            if (type === 'fontane') loadAdminFontane();
            if (type === 'beverini') loadAdminBeverini();
            if (type === 'news') loadAdminNews();
        }
        
        return data;
    } catch (error) {
        showToast(`Errore nel caricamento ${type}: ${error.message}`, 'error');
        // Fallback ai dati locali
        loadData();
        throw error;
    }
}

async function saveToFirebase(type) {
    try {
        showToast(`Salvataggio ${type} su Firebase...`, 'info');
        
        const batch = db.batch();
        const collectionRef = db.collection(type);
        
        // Clear existing data
        const snapshot = await collectionRef.get();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Add new data
        appData[type].forEach(item => {
            const docRef = collectionRef.doc(item.id.toString());
            const { id, ...data } = item;
            batch.set(docRef, data);
        });
        
        await batch.commit();
        showToast(`${appData[type].length} ${type} salvati su Firebase`, 'success');
        return { success: true, total: appData[type].length };
    } catch (error) {
        showToast(`Errore nel salvataggio ${type}: ${error.message}`, 'error');
        throw error;
    }
}

async function syncAllWithFirebase() {
    try {
        showToast('Sincronizzazione completa con Firebase...', 'info');
        
        await saveToFirebase('fontane');
        await saveToFirebase('beverini');
        await saveToFirebase('news');
        
        showToast('Tutti i dati sincronizzati con Firebase', 'success');
    } catch (error) {
        showToast(`Errore nella sincronizzazione: ${error.message}`, 'error');
    }
}

// Funzione per aprire il pannello admin (con autenticazione)
function openAdminPanel() {
    const user = auth.currentUser;
    if (user) {
        showAdminPanel();
    } else {
        showAdminAuth();
    }
}

// Mostra il form di autenticazione
function showAdminAuth() {
    document.getElementById('admin-auth').style.display = 'flex';
    document.getElementById('admin-email').focus();
}

// Chiude il form di autenticazione
function closeAdminAuth() {
    document.getElementById('admin-auth').style.display = 'none';
    document.getElementById('admin-email').value = '';
    document.getElementById('admin-password').value = '';
    document.getElementById('auth-error').style.display = 'none';
}

// Verifica l'autenticazione admin con Firebase
async function checkAdminAuth() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorElement = document.getElementById('auth-error');

    try {
        showToast('Accesso in corso...', 'info');
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        showToast(`Accesso effettuato come ${user.email}`, 'success');
        closeAdminAuth();
        showAdminPanel();
        logActivity(`Accesso amministratore: ${user.email}`);
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Errore di accesso';
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Email non valida';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Account disabilitato';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Utente non trovato';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Password errata';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Troppi tentativi. Riprova più tardi';
                break;
            default:
                errorMessage = error.message;
        }
        
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
    }
}

// Mostra il pannello admin (dopo autenticazione)
function showAdminPanel() {
    const user = auth.currentUser;
    if (!user) {
        showAdminAuth();
        return;
    }

    document.getElementById('admin-panel').style.display = 'flex';
    document.querySelector('.admin-fab').style.display = 'flex';

    loadFirebaseConfig();
    loadAdminFontane();
    loadAdminBeverini();
    loadAdminNews();
    updateDashboardStats();

    const savedLog = localStorage.getItem('activityLog');
    if (savedLog) {
        activityLog = JSON.parse(savedLog);
        updateActivityLog();
    }

    loadBackupList();
}

function closeAdminPanel() {
    document.getElementById('admin-panel').style.display = 'none';
    document.querySelector('.admin-fab').style.display = 'none';
}

// Carica le configurazioni Firebase
function loadFirebaseConfig() {
    const user = auth.currentUser;
    const configSection = document.querySelector('.admin-config-section');

    configSection.innerHTML = `
        <h3>Configurazione Firebase</h3>

        <div class="secure-config-section">
            <h4>Connessione Firebase</h4>
            <div class="api-status connected">
                <i class="fas fa-check-circle"></i> Connesso a Firebase
            </div>
            <div style="margin-top: 10px; font-size: 0.9rem;">
                <strong>Utente:</strong> ${user.email}
            </div>
        </div>

        <div class="sync-actions">
            <button class="admin-btn primary" onclick="syncAllWithFirebase()">
                <i class="fas fa-sync-alt"></i> Sincronizza Tutto con Firebase
            </button>
            <button class="admin-btn secondary" onclick="loadAllFromFirebase()">
                <i class="fas fa-download"></i> Carica Tutto da Firebase
            </button>
            <button class="admin-btn secondary" onclick="saveAllToFirebase()">
                <i class="fas fa-upload"></i> Salva Tutto su Firebase
            </button>
        </div>
    `;
}

// Funzione per logout amministratore
async function logoutAdmin() {
    try {
        await auth.signOut();
        showToast('Logout effettuato con successo', 'success');
        logActivity('Logout amministratore');
    } catch (error) {
        showToast('Errore durante il logout', 'error');
    }
}

// Funzione per cambiare password
async function changeAdminPassword() {
    const newPassword = prompt('Inserisci la nuova password:');
    if (newPassword && newPassword.length >= 6) {
        try {
            const user = auth.currentUser;
            await user.updatePassword(newPassword);
            alert('Password cambiata con successo.');
            logActivity('Password admin cambiata');
        } catch (error) {
            alert('Errore nel cambio password: ' + error.message);
        }
    } else {
        alert('La password deve essere di almeno 6 caratteri.');
    }
}

// Aggiorna l'email utente nella UI
function updateUserEmail() {
    const user = auth.currentUser;
    if (user) {
        const emailElement = document.getElementById('current-user-email');
        if (emailElement) {
            emailElement.textContent = user.email;
        }
    }
}

async function loadAllFromFirebase() {
    try {
        showToast('Caricamento di tutti i dati da Firebase...', 'info');

        await loadFromFirebase('fontane');
        await loadFromFirebase('beverini');
        await loadFromFirebase('news');

        showToast('Tutti i dati caricati da Firebase', 'success');
    } catch (error) {
        showToast(`Errore nel caricamento: ${error.message}`, 'error');
    }
}

async function saveAllToFirebase() {
    try {
        showToast('Salvataggio di tutti i dati su Firebase...', 'info');
        await saveToFirebase('fontane');
        await saveToFirebase('beverini');
        await saveToFirebase('news');
        showToast('Tutti i dati salvati su Firebase', 'success');
    } catch (error) {
        showToast(`Errore nel salvataggio: ${error.message}`, 'error');
    }
}

// Gestione dati locali
function loadData() {
    try {
        const savedData = localStorage.getItem('fontaneBeveriniData');
        if (savedData) {
            appData = JSON.parse(savedData);
            showToast('Dati caricati con successo', 'success');
        } else {
            // Dati di default
            appData = {
                fontane: [
                    {
                        id: "1",
                        nome: "Fontana Cariati",
                        indirizzo: "Via Santa Caterina da Siena",
                        stato: "funzionante",
                        anno: "",
                        descrizione: "",
                        storico: "",
                        latitudine: 40.8478,
                        longitudine: 14.2504,
                        immagine: "./images/sfondo-home.jpg"
                    }
                ],
                beverini: [],
                news: [
                    {
                        id: "1",
                        titolo: "Ristrutturazione Fontana del Gigante",
                        contenuto: "È iniziato il restauro conservativo della Fontana del Gigante, uno dei monumenti più iconici di Napoli.",
                        data: "2024-01-15",
                        categoria: "Manutenzione",
                        fonte: "Comune di Napoli"
                    }
                ]
            };
            saveData();
            showToast('Dati inizializzati con valori predefiniti', 'info');
        }
    } catch (error) {
        showToast('Errore nel caricamento dati. Ripristino backup...', 'error');
        restoreFromBackup();
    }
}

function saveData() {
    try {
        localStorage.setItem('fontaneBeveriniData', JSON.stringify(appData));
        autoBackupData();
    } catch (error) {
        showToast('Errore nel salvataggio dati', 'error');
    }
}

function autoBackupData() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupKey = `fontaneBeveriniBackup_${timestamp}`;
        localStorage.setItem(backupKey, JSON.stringify(appData));
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('fontaneBeveriniBackup_'))
            .sort()
            .reverse();
        if (backupKeys.length > 5) {
            for (let i = 5; i < backupKeys.length; i++) {
                localStorage.removeItem(backupKeys[i]);
            }
        }
    } catch (error) {
    }
}

// Gestione schermate
function showScreen(screenId) {
    if (screenHistory[screenHistory.length - 1] !== screenId) {
        screenHistory.push(screenId);
    }
    if (screenHistory.length > 10) {
        screenHistory = screenHistory.slice(-10);
    }
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        setTimeout(() => {
            targetScreen.classList.add('active');
        }, 10);
        window.scrollTo(0, 0);
        initializeScreenContent(screenId);
    }
    updateTabBar(screenId);
    document.getElementById('fixed-navigate-btn').classList.add('hidden');
}

function goBack() {
    if (screenHistory.length > 1) {
        screenHistory.pop();
        const previousScreen = screenHistory[screenHistory.length - 1];
        showScreen(previousScreen);
    } else {
        showScreen('home-screen');
    }
}

function initializeScreenContent(screenId) {
    switch(screenId) {
        case 'fontane-screen':
            loadFontane();
            break;

        case 'beverini-screen':
            loadBeverini();
            break;

        case 'mappa-screen': initMappa(); break;
        case 'news-screen': loadNews(); break;
    }
}

function updateTabBar(activeScreen) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.querySelector(`.tab-btn[data-target="${activeScreen}"]`);
    if (activeTab) activeTab.classList.add('active');
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    checkOnlineStatus();
    showScreen('home-screen');
    handleUrlParameters();

    // Nascondi il FAB admin all'avvio
    document.querySelector('.admin-fab').style.display = 'none';

    setTimeout(() => {
        loadAllFromFirebase().then(() => {
        }).catch(error => {
            showToast('Utilizzo dati locali', 'info');
        });
    }, 1000);

    // Aggiungi gli event listener per la sequenza segreta
    const logo = document.querySelector('.app-logo');
    const title = document.querySelector('.home-title');

    // Doppio click sul logo
    logo.addEventListener('dblclick', function() {
        handleSecretSequence('logo');
    });

    // Click sul titolo
    title.addEventListener('click', function() {
        handleSecretSequence('title');
    });

    logActivity('Applicazione avviata');
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// [INSERISCI QUI TUTTE LE ALTRE FUNZIONI DELL'APP ORIGINALE...]
// Funzioni di utility, gestione UI, mappa, etc.
// ... (tutto il resto del codice rimane identico)