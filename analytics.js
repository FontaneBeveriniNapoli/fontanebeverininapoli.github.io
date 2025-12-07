// Analytics Manager Completo
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
        
        // Performance metrics storage
        this.metrics = {
            appStart: Date.now(),
            pageLoadTimes: [],
            imageLoadTimes: [],
            dataFetchTimes: []
        };
        
        this.initializeServiceWorkerSupport();
    }
    
    async initializeServiceWorkerSupport() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                if (registration.active) {
                    registration.active.postMessage({
                        type: 'ANALYTICS_CONFIG',
                        config: { enabled: this.config.trackingEnabled, sessionId: this.session.id }
                    });
                }
            } catch (e) { console.warn('[Analytics] SW msg failed', e); }
        }
    }
    
    async initialize() {
        if (this.isInitialized) return;
        try {
            await this.loadSavedData();
            this.startAutoFlush();
            this.trackSessionStart();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('[Analytics] Inizializzato');
        } catch (error) {
            console.error('[Analytics] Init error:', error);
        }
    }
    
    // Core Tracking Functions
    trackEvent(category, action, label = null, value = null, customParams = {}) {
        if (!this.config.trackingEnabled) return;
        
        const event = {
            type: 'EVENT',
            timestamp: Date.now(),
            category, action, label, value,
            session_id: this.session.id,
            user_id: this.user.id,
            ...customParams
        };
        
        this.queue.push(event);
        this.session.events++;
        this.sendToFirebaseAnalytics(event);
        this.saveEventsLocally([event]); // Backup locale
        
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
        this.sendToFirebaseAnalytics(pageView);
        this.session.lastActivity = Date.now();
        this.saveEventsLocally([pageView]);
        
        return pageView;
    }
    
    trackError(error, context, severity = 'medium', customParams = {}) {
        const errorEvent = {
            type: 'ERROR',
            timestamp: Date.now(),
            error: {
                name: error.name || 'Error',
                message: error.message || String(error),
                stack: error.stack,
                code: error.code
            },
            context, severity,
            session_id: this.session.id,
            ...customParams
        };
        
        // Salva errore in storage separato per admin panel
        const errors = JSON.parse(localStorage.getItem('analytics_errors') || '[]');
        errors.unshift(errorEvent);
        if(errors.length > 50) errors.pop();
        localStorage.setItem('analytics_errors', JSON.stringify(errors));
        
        this.queue.push(errorEvent);
        this.sendToFirebaseAnalytics(errorEvent);
        
        return errorEvent;
    }
    
    trackPerformance(name, duration, customParams = {}) {
        const perfEvent = {
            type: 'PERFORMANCE',
            timestamp: Date.now(),
            metric_name: name,
            duration: duration,
            session_id: this.session.id,
            ...customParams
        };
        
        if (name.includes('page_load')) this.metrics.pageLoadTimes.push(duration);
        else if (name.includes('image')) this.metrics.imageLoadTimes.push(duration);
        
        this.queue.push(perfEvent);
        // Save metrics to local storage for admin panel
        localStorage.setItem('performance_metrics', JSON.stringify(this.metrics));
        
        return perfEvent;
    }
    
    // Firebase Integration
    async sendToFirebaseAnalytics(eventData) {
        if (!window.firebaseAnalytics) return;
        
        try {
            const { logEvent } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js");
            
            // Mapping eventi interni -> Firebase
            switch(eventData.type) {
                case 'PAGE_VIEW':
                    logEvent(window.firebaseAnalytics, 'page_view', {
                        page_title: eventData.page,
                        page_location: window.location.href
                    });
                    break;
                case 'EVENT':
                    logEvent(window.firebaseAnalytics, eventData.action, {
                        event_category: eventData.category,
                        event_label: eventData.label,
                        value: eventData.value
                    });
                    break;
                case 'ERROR':
                    logEvent(window.firebaseAnalytics, 'error_occurred', {
                        error_name: eventData.error?.name,
                        error_message: eventData.error?.message,
                        fatal: eventData.severity === 'high'
                    });
                    break;
            }
        } catch (error) {
            console.warn('[Analytics] Firebase send failed', error);
        }
    }
    
    // Session Management
    trackSessionStart() {
        const event = {
            type: 'SESSION_START',
            timestamp: Date.now(),
            session_id: this.session.id,
            user_id: this.user.id,
            device: this.user.device
        };
        this.queue.push(event);
        this.saveEventsLocally([event]);
    }
    
    // Data Management
    saveEventsLocally(events) {
        try {
            const local = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            local.push(...events);
            // Mantieni max 1000 eventi locali per non riempire la memoria
            if (local.length > 1000) local.splice(0, local.length - 1000);
            localStorage.setItem('analytics_events', JSON.stringify(local));
        } catch(e) {}
    }
    
    async loadSavedData() {
        // Ripristina metriche salvate
        const savedMetrics = localStorage.getItem('performance_metrics');
        if(savedMetrics) this.metrics = JSON.parse(savedMetrics);
    }
    
    startAutoFlush() {
        setInterval(() => this.flushQueue(), this.config.flushInterval);
    }
    
    flushQueue() {
        // Qui andrebbe la logica di invio batch al backend custom se esistesse
        // Per ora svuotiamo la coda memoria poiché salviamo in locale/firebase man mano
        this.queue = []; 
    }
    
    // Helpers
    generateSessionId() { return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5); }
    
    getUserId() {
        let uid = localStorage.getItem('analytics_user_id');
        if (!uid) {
            uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            localStorage.setItem('analytics_user_id', uid);
        }
        return uid;
    }
    
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screen: `${window.screen.width}x${window.screen.height}`,
            pwa: window.matchMedia('(display-mode: standalone)').matches
        };
    }
    
    setupEventListeners() {
        // Performance Observer
        if ('PerformanceObserver' in window) {
            try {
                new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.entryType === 'navigation') this.trackPerformance('page_load', entry.duration);
                        if (entry.entryType === 'resource' && entry.initiatorType === 'img') this.trackPerformance('image_load', entry.duration);
                    });
                }).observe({ entryTypes: ['navigation', 'resource'] });
            } catch(e){}
        }
    }

    // ✅ FUNZIONE CRUCIALE PER ADMIN PANEL
    getAnalyticsSummary() {
        const today = new Date().toDateString();
        const allEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        const allErrors = JSON.parse(localStorage.getItem('analytics_errors') || '[]');
        
        // Filtra eventi di oggi
        const todayEvents = allEvents.filter(e => new Date(e.timestamp).toDateString() === today);
        const todaySessions = todayEvents.filter(e => e.type === 'SESSION_START');
        const todayErrors = allErrors.filter(e => new Date(e.timestamp).toDateString() === today);
        
        // Calcola medie performance
        const avgPageLoad = this.metrics.pageLoadTimes.length ? 
            this.metrics.pageLoadTimes.reduce((a,b)=>a+b,0)/this.metrics.pageLoadTimes.length : 0;
        const avgImgLoad = this.metrics.imageLoadTimes.length ? 
            this.metrics.imageLoadTimes.reduce((a,b)=>a+b,0)/this.metrics.imageLoadTimes.length : 0;

        return {
            sessions: { today: todaySessions.length, current: this.session },
            events: { today: todayEvents.length, total: allEvents.length },
            pageViews: { today: todayEvents.filter(e => e.type === 'PAGE_VIEW').length },
            errors: { today: todayErrors.length, total: allErrors.length },
            metrics: {
                performance: { average: avgPageLoad, imageLoad: avgImgLoad },
                storage: { eventsSize: new Blob([JSON.stringify(allEvents)]).size }
            },
            user: { id: this.user.id }
        };
    }
    
    exportAnalyticsData() {
        const data = {
            events: JSON.parse(localStorage.getItem('analytics_events') || '[]'),
            errors: JSON.parse(localStorage.getItem('analytics_errors') || '[]'),
            metrics: this.metrics,
            session: this.session
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type : 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        return a.download;
    }
    
    resetUserData() {
        localStorage.removeItem('analytics_events');
        localStorage.removeItem('analytics_errors');
        localStorage.removeItem('performance_metrics');
        this.metrics = { appStart: Date.now(), pageLoadTimes: [], imageLoadTimes: [], dataFetchTimes: [] };
        return true;
    }
    
    setTrackingEnabled(enabled) {
        this.config.trackingEnabled = enabled;
        return enabled;
    }
}

// Istanza Globale
window.Analytics = new AnalyticsManager();

// ✅ AUTO-INIT CON FIX RACE CONDITION (Wait For Firebase)
document.addEventListener('DOMContentLoaded', async () => {
    
    // Funzione di attesa intelligente
    const waitForFirebase = (retries = 0) => {
        return new Promise((resolve) => {
            // Se firebase è pronto O se abbiamo aspettato troppo (5 sec), procedi
            if ((window.app && window.firebaseAnalytics) || retries > 10) {
                if(retries > 10) console.warn('[Analytics] Firebase timeout, avvio limitato');
                resolve();
            } else {
                setTimeout(() => waitForFirebase(retries + 1).then(resolve), 500);
            }
        });
    };

    try {
        if ('serviceWorker' in navigator) {
            try { await navigator.serviceWorker.ready; } catch(e){}
        }
        
        // Aspetta che Firebase sia caricato prima di inizializzare Analytics
        await waitForFirebase();
        
        await window.Analytics.initialize();
        
        // Traccia avvio app
        window.Analytics.trackEvent('app', 'loaded', null, null, {
            pwa: window.matchMedia('(display-mode: standalone)').matches
        });
        
        window.Analytics.trackPageView('app_start');
        
    } catch (error) {
        console.error('[Analytics] Critical Init Error:', error);
    }
});