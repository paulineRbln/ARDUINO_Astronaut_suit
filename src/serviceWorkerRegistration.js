// src/serviceWorkerRegistration.js

// Fonction qui enregistre le service worker
export function register() {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      // Vérifiez si le service worker est disponible
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log('Service Worker enregistré : ', registration);
          })
          .catch((error) => {
            console.error('Service Worker non enregistré : ', error);
          });
      });
    }
  }
  
  // Fonction pour désenregistrer le service worker (optionnel)
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.unregister();
      });
    }
  }
  