// src/context/BluetoothContext.js
import React, { createContext, useContext, useState } from "react";

// Création du contexte
const BluetoothContext = createContext();

// Hook personnalisé pour accéder plus simplement au contexte
export const useBluetooth = () => useContext(BluetoothContext);

// Provider global
export const BluetoothProvider = ({ children }) => {
  const [connectedDevice, setConnectedDevice] = useState(null);

  return (
    <BluetoothContext.Provider value={{ connectedDevice, setConnectedDevice }}>
      {children}
    </BluetoothContext.Provider>
  );
};
