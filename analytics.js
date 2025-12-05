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
    }
    
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            await this.initializeFirebaseAnalytics();
            await this.loadSavedData();
            this.startAutoFlush();
            this.trackSessionStart();
            this.setupEventListeners();
            
            this.isInitialized = true;
        } catch (error) {
            console.error('[Analytics] Errore inizializzazione:', error);
        }
    }
    
    async initializeFirebaseAnalytics() {
        if (typeof firebase !== 'undefined') {
            try {
                const { getAnalytics } = await import(
                    "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js"
                );
                window.firebaseAnalytics = getAnalytics(window.app);
            } catch (error) {
                console.warn('[Analytics] Firebase Analytics non disponibile:', error);
            }
        }
    }
    
    trackEvent(category, action, label = null, value = null, customParams = {}) {
        if (!this.config.trackingEnabled) return;
        
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
        
        if (window.firebaseAnalytics) {
            window.firebaseAnalytics.logEvent(action, {
                event_category: category,
                event_label: label,
                value: value,
                ...customParams
            });
        }
        
        if (this.queue.length >= this.config.batchSize) {
            this.flushQueue();
        }
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
        
        if (window.firebaseAnalytics) {
            window.firebaseAnalytics.logEvent('page_view', {
                page_title: pageName,
                page_location: window.location.pathname,
                ...customParams
            });
        }
        
        this.session.lastActivity = Date.now();
    }
    
    trackError(error, context, severity = 'medium', customParams = {}) {
        const errorEvent = {
            type: 'ERROR',
            timestamp: Date.now(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code
            },
            context,
            severity,
            session_id: this.session.id,
            user_id: this.user.id,
            ...customParams
        };
        
        this.queue.push(errorEvent);
        
        if (window.firebaseAnalytics) {
            window.firebaseAnalytics.logEvent('error_occurred', {
                error_context: context,
                error_message: error.message.substring(0, 100),
                error_name: error.name,
                severity: severity
            });
        }
    }
    
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
        
        if (window.firebaseAnalytics) {
            window.firebaseAnalytics.logEvent('session_start', {
                session_id: this.session.id,
                user_id: this.user.id
            });
        }
    }
    
    async flushQueue(force = false) {
        if (this.queue.length === 0) return;
        
        if (!force && this.queue.length < this.config.batchSize) {
            return;
        }
        
        const eventsToSend = [...this.queue];
        this.queue = [];
        
        try {
            this.saveEventsLocally(eventsToSend);
            
            if (navigator.onLine && window.db) {
                await this.sendToFirestore(eventsToSend);
                this.cleanupOldLocalEvents();
            } else {
                this.saveForLater(eventsToSend);
            }
        } catch (error) {
            console.error('[Analytics] Errore flush queue:', error);
            this.queue.unshift(...eventsToSend);
            this.saveForLater(eventsToSend);
        }
    }
    
    async sendToFirestore(events) {
        const { collection, addDoc } = await import(
            "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
        );
        
        const batchData = {
            events: events,
            sent_at: new Date().toISOString(),
            session_id: this.session.id,
            user_id: this.user.id,
            device: this.user.device
        };
        
        const analyticsRef = collection(window.db, 'analytics');
        await addDoc(analyticsRef, batchData);
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getUserId() {
        let userId = localStorage.getItem('analytics_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('analytics_user_id', userId);
        }
        return userId;
    }
    
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen: {
                width: window.screen.width,
                height: window.screen.height
            },
            online: navigator.onLine,
            pwa: window.matchMedia('(display-mode: standalone)').matches
        };
    }
    
    startAutoFlush() {
        setInterval(() => {
            this.flushQueue();
        }, this.config.flushInterval);
        
        setTimeout(() => {
            this.sendPendingEvents();
        }, 5000);
    }
    
    saveEventsLocally(events) {
        const localEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        localEvents.push(...events);
        
        if (localEvents.length > 1000) {
            localEvents.splice(0, localEvents.length - 1000);
        }
        
        localStorage.setItem('analytics_events', JSON.stringify(localEvents));
    }
    
    saveForLater(events) {
        const pendingEvents = JSON.parse(localStorage.getItem('analytics_pending') || '[]');
        pendingEvents.push(...events);
        localStorage.setItem('analytics_pending', JSON.stringify(pendingEvents));
    }
    
    async sendPendingEvents() {
        const pendingEvents = JSON.parse(localStorage.getItem('analytics_pending') || '[]');
        
        if (pendingEvents.length === 0) return;
        
        try {
            await this.sendToFirestore(pendingEvents);
            localStorage.removeItem('analytics_pending');
        } catch (error) {
            console.error('[Analytics] Errore invio eventi pendenti:', error);
        }
    }
    
    setupEventListeners() {
        setInterval(() => {
            const inactiveTime = Date.now() - this.session.lastActivity;
            if (inactiveTime > this.config.sessionTimeout) {
                this.trackSessionEnd();
            }
        }, 60000);
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.trackSessionEnd();
            }
        });
    }
}

window.Analytics = new AnalyticsManager();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.Analytics.initialize();
        
        window.Analytics.trackEvent('app', 'started', null, null, {
            online: navigator.onLine,
            pwa: window.matchMedia('(display-mode: standalone)').matches
        });
        
        window.Analytics.trackPageView('app_loaded');
        
    } catch (error) {
        console.error('[Analytics] Errore inizializzazione:', error);
    }
});