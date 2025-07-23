// src/pages/Connexion.js
import React, { useState, useEffect } from "react";
import BoutonConnexion from "../Petits_objets/BoutonConnexion";
import { useBluetooth } from "../BluetoothContext"; // Import du context
import './Connexion.css'; // ← import du style

function Connexion() {
  const { connectedDevice, setConnectedDevice, updateSensorData } = useBluetooth(); // Utilisation du context
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState("");

  const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
  const CHARACTERISTIC_UUID = "abcdef01-1234-5678-1234-56789abcdef0";

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
        // Décoder les données reçues
        const value = new TextDecoder().decode(event.target.value);
        const fields = value.trim().split(";"); // Exemple de formatage des données

        // Mettre à jour les données dans le contexte global
        updateSensorData(fields);  // Mise à jour des données dans le contexte

        console.log("📥 Données reçues :", fields);
      });

      localStorage.setItem("connectedDevice", JSON.stringify({
        name: device.name,
        connected: true,
      }));
    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setError("Connexion perdue");
      setConnectedDevice(null);
      setDeviceName("");
      localStorage.removeItem("connectedDevice");
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      const confirmDisconnect = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
      if (confirmDisconnect) {
        try {
          await connectedDevice.gatt.disconnect();
          localStorage.removeItem("connectedDevice");
          setConnectedDevice(null);
          setDeviceName("");
          setError("");
        } catch (err) {
          console.error("❌ Erreur de déconnexion :", err);
          setError("Erreur lors de la déconnexion");
        }
      }
    }
  };

  useEffect(() => {
    const savedDevice = JSON.parse(localStorage.getItem("connectedDevice"));
    if (savedDevice && savedDevice.connected) {
      setDeviceName(savedDevice.name);
    }
  }, [setConnectedDevice]);

  return (
    <div className="connexion-container">
      <h1>Welcome to your SmartSuit app</h1>

      <BoutonConnexion
        onClick={connectedDevice ? disconnectDevice : connectToSmartSuit}
        connected={!!connectedDevice}
        deviceName={deviceName}
        error={error}
      />
    </div>
  );
}

export default Connexion;
