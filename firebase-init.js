// Firebase Configuration and Initialization

// Check if firebase is already initialized
if (!window.firebaseInitialized) {
    console.log('Initializing Firebase...');
    
    // Nuova configurazione EUROPA (COMPLETA)
    const firebaseConfig = {
        apiKey: "AIzaSyCc7latF6oH6gUNE02gAqwlWNsjVeC5gI4",
        authDomain: "abcnapolifontanebeverini.firebaseapp.com",
        projectId: "abcnapolifontanebeverini",
        storageBucket: "abcnapolifontanebeverini.firebasestorage.app",
        messagingSenderId: "212459088024",
        appId: "1:212459088024:web:57e11ef44c10d307cd88ed",
        measurementId: "G-43PW58S5TL"
    };
    
    // Initialize Firebase (Standard method if library is loaded via script tag)
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        // Tenta di inizializzare analytics se la libreria è presente
        if (firebase.analytics) {
            firebase.analytics();
        }
    }

    // Set flag to prevent double initialization
    window.firebaseInitialized = true;
    
    console.log('Firebase configuration loaded');
} else {
    console.log('Firebase already initialized');
}