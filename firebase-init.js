// Firebase Configuration and Initialization

// Check if firebase is already initialized
if (!window.firebaseInitialized) {
    console.log('Initializing Firebase...');
    
    // Firebase configuration (same as in index.html)
    const firebaseConfig = {
        apiKey: "AIzaSyBvDfxm-LSAcu0NwtJ8DYxxrjY-83LlLPU",
        authDomain: "abcnapolifontane.firebaseapp.com",
        projectId: "abcnapolifontane",
        storageBucket: "abcnapolifontane.firebasestorage.app",
        messagingSenderId: "686936372148",
        appId: "1:686936372148:web:4147bab1bab73583b638e1",
        measurementId: "G-DPEC2SNGDM"
    };
    
    // Set flag to prevent double initialization
    window.firebaseInitialized = true;
    
    console.log('Firebase configuration loaded');
} else {
    console.log('Firebase already initialized');
}