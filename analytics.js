[file name]: analytics.js
[file content begin]
// Analytics Manager
class AnalyticsManager {
    constructor() {
        this.isInitialized = false;
        this.queue = [];
        this.config = {
            trackingEnabled: true,
            sessionTimeout: 30 * 60 * 1000,
            batchSize: 10,
            flushInterval: 10000
        };
        
        this.session = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            pageViews: 0,
            events: 0,
            lastActivity: Date.now()
        };
        
        this.user = {
            id: this.getUserId(),
            device: this.getDeviceInfo(),
            preferences: {}
        };
        
        // Performance metrics
        this.metrics = {
            appStart: Date.now(),
            pageLoadTimes: [],
            imageLoadTimes: [],
            dataFetchTimes: []
        };
        
        // Initialize Service Worker for analytics - MODIFICA: meno aggressivo
        setTimeout(() => this.initializeServiceWorkerSupport(), 3000);
    }
    
    async initializeServiceWorkerSupport() {
        if ('serviceWorker' in navigator) {
            try {
                // MODIFICA: Usa timeout per evitare blocchi
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Service Worker timeout')), 2000)
                );
                
                const registrationPromise = navigator.serviceWorker.ready;
                const registration = await Promise.race([registrationPromise, timeoutPromise]);
                
                console.log('[Analytics] Service Worker pronto');
                
                // Send analytics config to Service Worker
                if (registration.active) {
                    registration.active.postMessage({
                        type: 'ANALYTICS_CONFIG',
                        config: {
                            enabled: this.config.trackingEnabled,
                            sessionId: this.session.id,
                            userId: this.user.id
                        }
                    });
                }
                
            } catch (error) {
                console.warn('[Analytics] Service Worker non disponibile:', error.message);
            }
        }
    }
    
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // MODIFICA: Attendi che Firebase sia pronto
            await this.waitForFirebase();
            await this.loadSavedData();
            this.startAutoFlush();
            this.trackSessionStart();
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[Analytics] Inizializzato con successo');
        } catch (error) {
            console.error('[Analytics] Errore inizializzazione:', error);
            // MODIFICA: Non bloccare l'app se analytics fallisce
            this.isInitialized = true; // Marca come inizializzato comunque
        }
    }
    
    // NUOVA FUNZIONE: Attendi che Firebase sia disponibile
    async waitForFirebase(maxWait = 10000) {
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const checkFirebase = () => {
                // MODIFICA: Verifica più flessibile per Firebase
                if (window.firebaseAnalytics || 
                    (window.app && typeof firebase !== 'undefined')) {
                    console.log('[Analytics] Firebase pronto dopo', Date.now() - startTime, 'ms');
                    resolve();
                } else if (Date.now() - startTime > maxWait) {
                    console.warn('[Analytics] Timeout attesa Firebase');
                    resolve(); // MODIFICA: Risolvi comunque per non bloccare
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            
            checkFirebase();
        });
    }
    
    async initializeFirebaseAnalytics() {
        // MODIFICA: Verifica prima se è già disponibile
        if (window.firebaseAnalytics) {
            console.log('[Analytics] Firebase Analytics già disponibile');
            return window.firebaseAnalytics;
        }
        
        try {
            // MODIFICA: Import dinamico con gestione errori migliorata
            const { getAnalytics, logEvent } = await import(
                "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js"
            ).catch(error => {
                console.warn('[Analytics] Errore import Firebase Analytics:', error);
                return { getAnalytics: null, logEvent: null };
            });
            
            if (getAnalytics && window.app) {
                window.firebaseAnalytics = getAnalytics(window.app);
                console.log('[Analytics] Firebase Analytics inizializzato');
                
                // Traccia prima pagina
                this.sendToFirebaseAnalytics({
                    type: 'APP_START',
                    timestamp: Date.now(),
                    session_id: this.session.id,
                    user_id: this.user.id,
                    device: this.user.device
                });
                
                return window.firebaseAnalytics;
            }
        } catch (error) {
            console.warn('[Analytics] Firebase Analytics non disponibile:', error);
        }
        
        return null;
    }
    
    trackEvent(category, action, label = null, value = null, customParams = {}) {
        if (!this.config.trackingEnabled) return;
        
        // MODIFICA: Verifica se è inizializzato
        if (!this.isInitialized) {
            console.warn('[Analytics] Non inizializzato, salva in coda');
        }
        
        const event = {
            type: 'EVENT',
            timestamp: Date.now(),
            category,
            action,
            label,
            value,
            session_id: this.session.id,
            user_id: this.user.id,
            ...customParams
        };
        
        this.queue.push(event);
        this.session.events++;
        
        // Invia a Firebase Analytics - MODIFICA: con try-catch
        try {
            this.sendToFirebaseAnalytics(event);
        } catch (error) {
            console.warn('[Analytics] Errore tracciamento evento:', error);
        }
        
        // Gestione coda locale
        if (this.queue.length >= this.config.batchSize) {
            this.flushQueue();
        }
        
        // Log attività locale
        this.logActivity(`Evento: ${category}.${action}`, event);
        
        return event;
    }
    
    trackPageView(pageName, customParams = {}) {
        if (!this.config.trackingEnabled) return;
        
        const pageView = {
            type: 'PAGE_VIEW',
            timestamp: Date.now(),
            page: pageName,
            session_id: this.session.id,
            user_id: this.user.id,
            page_views: ++this.session.pageViews,
            ...customParams
        };
        
        this.queue.push(pageView);
        
        // Invia a Firebase Analytics - MODIFICA: con try-catch
        try {
            this.sendToFirebaseAnalytics(pageView);
        } catch (error) {
            console.warn('[Analytics] Errore tracciamento page view:', error);
        }
        
        this.session.lastActivity = Date.now();
        this.logActivity(`Pagina vista: ${pageName}`, pageView);
        
        return pageView;
    }
    
    async sendToFirebaseAnalytics(eventData) {
        // MODIFICA: Verifica più robusta se Firebase è disponibile
        if (!window.firebaseAnalytics) {
            // Prova a inizializzarlo se non lo è
            try {
                await this.initializeFirebaseAnalytics();
            } catch (error) {
                // Se non riesce, salva localmente e esci
                console.warn('[Analytics] Firebase non disponibile, salvo localmente');
                return;
            }
        }
        
        // Se ancora non disponibile, esci
        if (!window.firebaseAnalytics) return;
        
        try {
            const { logEvent } = await import(
                "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js"
            ).catch(() => {
                console.warn('[Analytics] Errore import Firebase');
                return { logEvent: null };
            });
            
            if (!logEvent) return;
            
            switch(eventData.type) {
                case 'PAGE_VIEW':
                    logEvent(window.firebaseAnalytics, 'page_view', {
                        page_title: eventData.page,
                        page_location: window.location.href,
                        page_path: window.location.pathname,
                        session_id: eventData.session_id,
                        user_id: eventData.user_id
                    });
                    break;
                    
                case 'EVENT':
                    logEvent(window.firebaseAnalytics, eventData.action, {
                        event_category: eventData.category,
                        event_label: eventData.label,
                        value: eventData.value,
                        session_id: eventData.session_id,
                        user_id: eventData.user_id,
                        ...eventData.customParams
                    });
                    break;
                    
                case 'ERROR':
                    logEvent(window.firebaseAnalytics, 'error_occurred', {
                        error_name: eventData.error?.name || 'Unknown',
                        error_message: eventData.error?.message?.substring(0, 100) || 'Unknown error',
                        error_context: eventData.context,
                        error_severity: eventData.severity,
                        session_id: eventData.session_id,
                        user_id: eventData.user_id
                    });
                    break;
                    
                case 'PERFORMANCE':
                    logEvent(window.firebaseAnalytics, 'performance_metric', {
                        metric_name: eventData.metric_name,
                        metric_duration: eventData.duration,
                        session_id: eventData.session_id,
                        user_id: eventData.user_id
                    });
                    break;
                    
                case 'SESSION_START':
                    logEvent(window.firebaseAnalytics, 'session_start', {
                        session_id: eventData.session_id,
                        user_id: eventData.user_id,
                        device_platform: eventData.device?.platform,
                        device_online: eventData.device?.online,
                        app_version: '2.0.0'
                    });
                    break;
                    
                case 'APP_START':
                    logEvent(window.firebaseAnalytics, 'app_start', {
                        session_id: eventData.session_id,
                        user_id: eventData.user_id,
                        device_type: eventData.device?.userAgent?.includes('Mobile') ? 'mobile' : 'desktop',
                        pwa_mode: window.matchMedia('(display-mode: standalone)').matches
                    });
                    break;
            }
        } catch (error) {
            console.warn('[Analytics] Errore invio a Firebase:', error);
        }
    }
    
    // ... RESTANTE DEL CODICE RIMANE INVARIATO ...
    // TUTTE LE ALTRE FUNZIONI SONO OK, LE LASCIO COME SONO
    
    trackSessionStart() {
        const sessionEvent = {
            type: 'SESSION_START',
            timestamp: Date.now(),
            session_id: this.session.id,
            user_id: this.user.id,
            device: this.user.device,
            app_version: '2.0.0'
        };
        
        this.queue.push(sessionEvent);
        
        // MODIFICA: con try-catch
        try {
            this.sendToFirebaseAnalytics(sessionEvent);
        } catch (error) {
            console.warn('[Analytics] Errore tracciamento sessione:', error);
        }
        
        this.logActivity('Sessione iniziata', sessionEvent);
    }
}

// Inizializza Analytics Manager
window.Analytics = new AnalyticsManager();

// MODIFICA: Inizializzazione migliorata con ritardo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // MODIFICA: Attendi che tutto sia pronto
        setTimeout(async () => {
            try {
                // Initialize analytics
                await window.Analytics.initialize();
                
                // Traccia avvio app
                window.Analytics.trackEvent('app', 'loaded', null, null, {
                    online: navigator.onLine,
                    pwa: window.matchMedia('(display-mode: standalone)').matches,
                    platform: navigator.platform,
                    screen_size: `${window.screen.width}x${window.screen.height}`,
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                    service_worker: 'serviceWorker' in navigator
                });
                
                // Traccia prima pagina
                window.Analytics.trackPageView('app_start', {
                    load_time: window.performance?.timing ? 
                        window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : 0
                });
                
                console.log('[Analytics] Inizializzazione completata');
            } catch (error) {
                console.error('[Analytics] Errore inizializzazione ritardata:', error);
            }
        }, 2000); // MODIFICA: Attendi 2 secondi
    } catch (error) {
        console.error('[Analytics] Errore inizializzazione:', error);
    }
});

// ... RESTANTE DEL CODICE RIMANE INVARIATO ...
// HOOK e altre funzioni rimangono uguali

// Hook per tracciare cambio schermate
const originalShowScreen = window.showScreen;
if (originalShowScreen) {
    window.showScreen = function(screenId) {
        const currentScreen = window.screenHistory ? window.screenHistory[window.screenHistory.length - 1] : 'home-screen';
        
        // Traccia cambio schermata
        if (window.Analytics && window.Analytics.isInitialized) {
            window.Analytics.trackEvent('navigation', 'screen_change', `${currentScreen}_to_${screenId}`, null, {
                from_screen: currentScreen,
                to_screen: screenId,
                history_length: window.screenHistory?.length || 0
            });
            
            window.Analytics.trackPageView(`screen_${screenId}`, {
                screen_name: screenId,
                screen_type: screenId.includes('detail') ? 'detail' : 
                          screenId.includes('list') ? 'list' : 
                          screenId === 'home-screen' ? 'home' : 'other'
            });
        }
        
        return originalShowScreen.call(this, screenId);
    };
}

// Hook per tracciare click importanti
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Traccia click su pulsanti home
        document.querySelectorAll('.home-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const btnType = this.className.includes('fontane') ? 'fontane' :
                              this.className.includes('beverini') ? 'beverini' :
                              this.className.includes('mappa') ? 'mappa' :
                              this.className.includes('news') ? 'news' : 'other';
                
                if (window.Analytics && window.Analytics.isInitialized) {
                    window.Analytics.trackEvent('home', 'button_click', btnType, null, {
                        button_text: this.querySelector('.btn-text')?.textContent || 'N/A'
                    });
                }
            });
        });
        
        // Traccia click su elementi lista
        document.addEventListener('click', function(e) {
            if (!window.Analytics || !window.Analytics.isInitialized) return;
            
            const gridItem = e.target.closest('.grid-item');
            const compactItem = e.target.closest('.compact-item');
            const newsCard = e.target.closest('.news-card');
            
            if (gridItem) {
                const name = gridItem.querySelector('.item-name')?.textContent;
                window.Analytics.trackEvent('list', 'item_click', 'grid_item', null, {
                    item_name: name || 'N/A',
                    item_type: 'fontana'
                });
            }
            
            if (compactItem) {
                const name = compactItem.querySelector('.compact-item-name')?.textContent;
                window.Analytics.trackEvent('list', 'item_click', 'compact_item', null, {
                    item_name: name || 'N/A',
                    item_type: 'beverino'
                });
            }
            
            if (newsCard) {
                const title = newsCard.querySelector('.news-title')?.textContent;
                window.Analytics.trackEvent('news', 'card_click', null, null, {
                    news_title: title || 'N/A'
                });
            }
        });
    }, 3000); // MODIFICA: Attendi di più per assicurarsi che tutto sia pronto
});

// Esporta funzioni globali per il pannello admin - MODIFICA: verifica inizializzazione
window.analyticsFunctions = {
    refreshAnalytics: () => {
        if (window.Analytics && window.Analytics.isInitialized) {
            return window.Analytics.getAnalyticsSummary();
        }
        return { error: 'Analytics non inizializzato' };
    },
    exportAnalyticsData: () => {
        if (window.Analytics && window.Analytics.isInitialized) {
            return window.Analytics.exportAnalyticsData();
        }
        return null;
    },
    resetAnalyticsData: () => {
        if (window.Analytics && window.Analytics.isInitialized) {
            return window.Analytics.resetUserData();
        }
        return null;
    },
    toggleTracking: (enabled) => {
        if (window.Analytics) {
            return window.Analytics.setTrackingEnabled(enabled);
        }
        return false;
    },
    getConfig: () => {
        if (window.Analytics) {
            return { ...window.Analytics.config };
        }
        return null;
    },
    isInitialized: () => {
        return window.Analytics ? window.Analytics.isInitialized : false;
    }
};
[file content end]