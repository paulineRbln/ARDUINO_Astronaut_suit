import React, { useState, useEffect } from "react";
import BoutonConnexion from "../Petits_objets/BoutonConnexion";
import { useBluetooth } from "../BluetoothContext"; // 👈 import du contexte

function Connexion() {
  const { connectedDevice, setConnectedDevice } = useBluetooth(); // 👈 on utilise le contexte
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

      setConnectedDevice(device); // 👈 contexte
      setDeviceName(device.name);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      await characteristic.startNotifications();

      characteristic.addEventListener("characteristicvaluechanged", (event) => {
        const value = event.target.value;
        console.log("📥 Données reçues :", value);
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
      console.log(connectedDevice);
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

  const resetLocalStorage = () => {
    localStorage.removeItem("connectedDevice");
    setConnectedDevice(null);
    setDeviceName("");
    setError("");
  };

  useEffect(() => {
    console.log(connectedDevice);
    const interval = setInterval(() => {
      if (connectedDevice && connectedDevice.gatt && !connectedDevice.gatt.connected) {
        console.warn("⚠️ Connexion perdue");
        setError("Connexion perdue");
        setConnectedDevice(null);
        setDeviceName("");
        localStorage.removeItem("connectedDevice");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [connectedDevice, setConnectedDevice]);

  useEffect(() => {
    const savedDevice = JSON.parse(localStorage.getItem("connectedDevice"));
    if (savedDevice && savedDevice.connected) {
      setDeviceName(savedDevice.name);
      // setConnectedDevice est appelée uniquement si ce n'est pas déjà défini (évite doublons)
    }
  }, [setConnectedDevice]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", textAlign: "center" }}>
      <h1>Connect Your Smart Suit</h1>

      <BoutonConnexion
        onClick={connectedDevice ? disconnectDevice : connectToSmartSuit}
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
