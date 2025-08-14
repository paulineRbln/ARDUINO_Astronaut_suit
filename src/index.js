import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BluetoothProvider } from './BluetoothContext';

// ⬇️ Ajoute cette ligne pour importer le service worker
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BluetoothProvider>
      <App />
    </BluetoothProvider>
  </React.StrictMode>
);

// ⬇️ Active le service worker ici
serviceWorkerRegistration.register();

reportWebVitals();
