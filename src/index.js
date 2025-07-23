import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BluetoothProvider } from './BluetoothContext'; // ⬅️ On importe le Provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BluetoothProvider>  {/* ⬅️ On englobe l'app dans le context */}
      <App />
    </BluetoothProvider>
  </React.StrictMode>
);

reportWebVitals();
