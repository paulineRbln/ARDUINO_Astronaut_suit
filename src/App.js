import React, { useState } from 'react';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('');
  const [temperature, setTemperature] = useState(null);

  const connectToNano = async () => {
    setConnectionStatus('Connexion en cours...');

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'Nano33BLESense' }],
        optionalServices: ['00001234-0000-1000-8000-00805f9b34fb']  // Ajoute l'UUID du service ici
      });

      const server = await device.gatt.connect();
      console.log('✅ Connecté à', device.name);

      // Mettre à jour le statut de la connexion
      setConnectionStatus(`Connecté à ${device.name}`);

      // Récupérer le service et la caractéristique avec l'UUID correct
      const service = await server.getPrimaryService('00001234-0000-1000-8000-00805f9b34fb'); // UUID complet du service
      const characteristic = await service.getCharacteristic('00005678-0000-1000-8000-00805f9b34fb');  // UUID complet de la caractéristique
      await characteristic.startNotifications();  // Démarrer les notifications

      // Écouter les notifications de la caractéristique
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

    } catch (err) {
      console.error('❌ Erreur de connexion BLE :', err);
      setConnectionStatus('Erreur de connexion');
    }
  };

  // Fonction de gestion des notifications
  const handleCharacteristicValueChanged = (event) => {
    const value = event.target.value;
    const receivedData = new TextDecoder().decode(value); // Décoder les données reçues
    console.log('Données reçues:', receivedData);

    // Extraire la température de la chaîne de données
    const dataParts = receivedData.split(',');
    const temp = dataParts[1];  // Température est la deuxième valeur

    setTemperature(temp);  // Mettre à jour l'état de la température
  };

  return (
    <div className="App">
      <h1>Connexion à la Nano 33 BLE Sense</h1>
      <button onClick={connectToNano}>🔗 Se connecter à la carte</button>

      {/* Affichage du statut de la connexion */}
      {connectionStatus && <p>{connectionStatus}</p>}

      {/* Affichage de la température reçue */}
      {temperature !== null && <p>Température reçue : {temperature}°C</p>}
    </div>
  );
}

export default App;
