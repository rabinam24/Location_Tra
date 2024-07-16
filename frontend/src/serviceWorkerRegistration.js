// serviceWorkerRegistration.js
export default function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registration successful with scope: ', registration.scope);
        })
        .catch((err) => {
          console.log('Service Worker registration failed: ', err);
        });
    }
  }
  