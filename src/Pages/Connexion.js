import React, { useState, useEffect } from "react";
import BoutonConnexion from "../Petits_objets/BoutonConnexion";

function Connexion() {
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState("");

  const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
  const CHARACTERISTIC_UUID = "abcdef01-1234-5678-1234-56789abcdef0";

  // Fonction pour connecter la Smart Suit
  const connectToSmartSuit = async () => {
    try {
      setError("");

      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: "SmartSuit 1" },
          { name: "SmartSuit 2" }
        ],
        optionalServices: [SERVICE_UUID],
      });

      setConnectedDevice(device);
      setDeviceName(device.name);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      await characteristic.startNotifications();

      characteristic.addEventListener("characteristicvaluechanged", (event) => {
        const value = event.target.value;
        console.log("📥 Données reçues :", value);
        // Traitement futur ici
      });

      // Sauvegarder la connexion dans le localStorage
      localStorage.setItem("connectedDevice", JSON.stringify({
        name: device.name,
        connected: true,
      }));

    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setError("Connexion perdue");
      setConnectedDevice(null);
      setDeviceName("");

      // En cas d'erreur, nettoyer l'état dans le localStorage
      localStorage.removeItem("connectedDevice");
    }
  };

  // Déconnexion de l'appareil et nettoyage de l'état
  const disconnectDevice = async () => {
    if (connectedDevice) {
      const confirmDisconnect = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
      if (confirmDisconnect) {
        try {
          // Déconnexion de l'appareil
          await connectedDevice.gatt.disconnect();
          
          // Nettoyage de l'état localStorage
          localStorage.removeItem("connectedDevice");
          
          // Réinitialisation des états
          setConnectedDevice(null);
          setDeviceName("");
          setError(""); // Clear error if disconnected
        } catch (err) {
          console.error("❌ Erreur de déconnexion :", err);
          setError("Erreur lors de la déconnexion");
        }
      }
    }
  };

  // Fonction pour réinitialiser le localStorage
  const resetLocalStorage = () => {
    localStorage.removeItem("connectedDevice");
    setConnectedDevice(null);
    setDeviceName("");
    setError(""); // Clear any error on reset
  };

  // Vérifie régulièrement si l'appareil est toujours connecté
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectedDevice && connectedDevice.gatt && !connectedDevice.gatt.connected) {
        console.warn("⚠️ Connexion perdue");
        setError("Connexion perdue");
        setConnectedDevice(null);
        setDeviceName("");
        localStorage.removeItem("connectedDevice"); // Nettoyage de l'état localStorage
      }
    }, 1000); // vérifie toutes les 1 secondes

    return () => clearInterval(interval); // Nettoyage de l'intervalle à la destruction du composant
  }, [connectedDevice]);

  // Vérification de l'état de la connexion dès le chargement de la page (quand on revient)
  useEffect(() => {
    const savedDevice = JSON.parse(localStorage.getItem("connectedDevice"));

    if (savedDevice && savedDevice.connected) {
      // Si un périphérique est déjà enregistré comme connecté
      setDeviceName(savedDevice.name);
      setConnectedDevice(savedDevice);
      setError(""); // Clear error if previously connected
    }
  }, []); // Le tableau vide signifie qu'on l'appelle une seule fois au chargement du composant

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", textAlign: "center" }}>
      <h1>Connect Your Smart Suit</h1>

      <BoutonConnexion
        onClick={connectedDevice ? disconnectDevice : connectToSmartSuit} // Si connecté, déconnecte, sinon connecte
        connected={!!connectedDevice}
        deviceName={deviceName}
        error={error}
      />

      <button 
        style={{
          marginTop: "2rem", 
          padding: "1rem", 
          backgroundColor: "#ff4d4d", 
          color: "white", 
          border: "none", 
          borderRadius: "5px",
          cursor: "pointer"
        }}
        onClick={resetLocalStorage}
      >
        Reset
      </button>
    </div>
  );
}

export default Connexion;
