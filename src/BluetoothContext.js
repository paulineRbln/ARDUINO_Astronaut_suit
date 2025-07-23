// src/context/BluetoothContext.js
import React, { createContext, useContext, useState } from "react";

// Création du contexte Bluetooth
const BluetoothContext = createContext();

// Hook personnalisé pour accéder au contexte
export const useBluetooth = () => useContext(BluetoothContext);

// Provider global
export const BluetoothProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState(null); // Les données reçues
  const [connectedDevice, setConnectedDevice] = useState(null); // L'appareil connecté

  // Fonction pour mettre à jour les données à chaque réception
  const updateSensorData = (data) => {
    setSensorData(data);
  };

  return (
    <BluetoothContext.Provider value={{ connectedDevice, setConnectedDevice, sensorData, updateSensorData }}>
      {children}
    </BluetoothContext.Provider>
  );
};
