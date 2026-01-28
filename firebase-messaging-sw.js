// Firebase Cloud Messaging Service Worker
// This file handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByTa7qJ7B_81AWbxLBLn1G2I-btOyISJ0",
  authDomain: "yoni-a0268.firebaseapp.com",
  projectId: "yoni-a0268",
  storageBucket: "yoni-a0268.firebasestorage.app",
  messagingSenderId: "1089722207217",
  appId: "1:1089722207217-web-531dc0dd3f6e9a11ec9250",
  measurementId: "G-70EZ0JG7C1"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📬 Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'YONI 約你';
  const notificationOptions = {
    body: payload.notification?.body || '您有新的通知',
    icon: payload.notification?.icon || '/yoni_icon.ico',
    badge: '/yoni_icon.ico',
    tag: payload.data?.tag || 'yoni-notification',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: '查看'
      },
      {
        action: 'close',
        title: '關閉'
      }
    ]
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app or navigate to specific page
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus().then(() => {
                if (urlToOpen !== '/') {
                  return client.navigate(urlToOpen);
                }
              });
            }
          }
          // Open new window if not already open
          if (clients.openWindow) {
            return clients.openWindow(self.location.origin + urlToOpen);
          }
        })
    );
  }
});

// Handle push event (alternative method)
self.addEventListener('push', (event) => {
  console.log('📨 Push event received:', event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data:', data);
    } catch (e) {
      console.log('Push data (text):', event.data.text());
    }
  }
});

// Service Worker activation
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
});

// Service Worker installation
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing');
  self.skipWaiting();
});
