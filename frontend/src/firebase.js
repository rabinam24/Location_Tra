import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDWnCi9iwjRbwtUxI3pylCyKjkReHtq_dQ",
  authDomain: "location-d4215.firebaseapp.com",
  projectId: "location-d4215",
  storageBucket: "location-d4215.appspot.com",
  messagingSenderId: "427771918182",
  appId: "1:427771918182:web:d6a6a88eb1428336667aa7",
  measurementId: "G-Z57GJN7F7H"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const requestPermission = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: 'BHaTCzJoyv4MlvFQR7MIOERJpF9C5JEmgkdCspiN-ggQAB2Ph9XXL-0e9mIBitrUuGH6WR-m3n8ZvFEwGSwUIrk' });
    if (token) {
      console.log('FCM Token:', token);
      // Send the token to your backend server to store it
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
};

const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { requestPermission, onMessageListener };

// Call this function to request permission and get the token
requestPermission();
