importScripts('https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.18.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyDWnCi9iwjRbwtUxI3pylCyKjkReHtq_dQ",
  authDomain: "location-d4215.firebaseapp.com",
  projectId: "location-d4215",
  storageBucket: "location-d4215.appspot.com",
  messagingSenderId: "427771918182",
  appId: "1:427771918182:web:d6a6a88eb1428336667aa7",
  measurementId: "G-Z57GJN7F7H"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

self.addEventListener('push', (event) => {
  const payload = event.data.json();
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/path/to/icon.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
