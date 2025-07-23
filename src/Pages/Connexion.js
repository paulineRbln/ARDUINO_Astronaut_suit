import React, { useState, useEffect } from "react";
import BoutonConnexion from "../Petits_objets/BoutonConnexion";

function Connexion() {
  const [connectedDevice, setConnectedDevice] = useState(null);
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
        const value = event.target.value;
        console.log("📥 Données reçues :", value);
        // Traitement futur ici
      });

    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setError("Connexion perdue");
      setConnectedDevice(null);
      setDeviceName("");
    }
  };

  // Vérifie régulièrement si l'appareil est toujours connecté
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectedDevice && !connectedDevice.gatt.connected) {
        console.warn("⚠️ Connexion perdue");
        setError("Connexion perdue");
        setConnectedDevice(null);
        setDeviceName("");
      }
    }, 2000); // vérifie toutes les 2 secondes

    return () => clearInterval(interval);
  }, [connectedDevice]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", textAlign: "center" }}>
      <h1>Connect Your Smart Suit</h1>

      <BoutonConnexion
        onClick={connectToSmartSuit}
        connected={!!connectedDevice}
        deviceName={deviceName}
        error={error}
      />
    </div>
  );
}

export default Connexion;
