// Firebase Configuration for Web Push Notifications
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyByTa7qJ7B_81AWbxLBLn1G2I-btOyISJ0",
  authDomain: "yoni-a0268.firebaseapp.com",
  projectId: "yoni-a0268",
  storageBucket: "yoni-a0268.firebasestorage.app",
  messagingSenderId: "1089722207217",
  appId: "1:1089722207217-web-531dc0dd3f6e9a11ec9250",
  measurementId: "G-70EZ0JG7C1"
};

// VAPID Key for Web Push
const vapidKey = "BA5gu0oaXyjTuJQGNyw2-LGETUvY12BGAit6AnztemXwqT8ebUlDNFrWhlc-d20ZggDsXRk9-RoUrpU2Bmb2W7U";

// Initialize Firebase
let messaging = null;
let app = null;

function initializeFirebase() {
  try {
    // Check if Firebase is already initialized
    if (!firebase.apps || firebase.apps.length === 0) {
      app = firebase.initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } else {
      app = firebase.app();
      console.log('✅ Firebase already initialized');
    }

    // Initialize Firebase Cloud Messaging
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      messaging = firebase.messaging();
      console.log('✅ Firebase Messaging initialized');
    } else {
      console.warn('⚠️ Browser does not support push notifications');
    }

    return { app, messaging };
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    return { app: null, messaging: null };
  }
}

// Export configuration
window.firebaseConfig = firebaseConfig;
window.vapidKey = vapidKey;
window.initializeFirebase = initializeFirebase;
