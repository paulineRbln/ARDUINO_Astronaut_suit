// src/pages/Connexion.js
import React, { useState, useEffect } from "react";
import BoutonConnexion from "../Petits_objets/BoutonConnexion";
import { useBluetooth } from "../BluetoothContext";
import './Connexion.css';

function Connexion() {
  const { connectedDevice, setConnectedDevice, updateSensorData, sensorData } = useBluetooth();
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState("");

  const [recording, setRecording] = useState(false);
  const [recordedData, setRecordedData] = useState([]);

  const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
  const CHARACTERISTIC_UUID = "abcdef01-1234-5678-1234-56789abcdef0";

  // --- Connexion Bluetooth ---
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
        const value = new TextDecoder().decode(event.target.value);
        const fields = value.trim().split(";");
        updateSensorData(fields);
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

  // --- Enregistrement automatique des données ---
  useEffect(() => {
    if (recording && sensorData && sensorData.length > 0) {
      const timestamp = new Date().toISOString();
      const line = [timestamp, ...sensorData];
      setRecordedData(prev => [...prev, line]);
    }
  }, [sensorData, recording]);

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
    } else {
      setRecordedData([]); // reset avant enregistrement
      setRecording(true);
    }
  };

  const downloadCSV = () => {
    if (!recordedData.length) return;

    const headers = [
      "Time",
      "timestamp_ms",
      "ir_value",
      "red_value",
      "temperature_C",
      "humidity_percent",
      "accel_bmi270_x",
      "accel_bmi270_y",
      "accel_bmi270_z",
      "gyro_bmi270_x",
      "gyro_bmi270_y",
      "gyro_bmi270_z",
      "accel_mpu6050_x",
      "accel_mpu6050_y",
      "accel_mpu6050_z",
      "gyro_mpu6050_x",
      "gyro_mpu6050_y",
      "gyro_mpu6050_z",
      "bpm"
    ].join(";");

    const rows = recordedData.map(row => row.join(";"));
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "smart_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="connexion-container">
      <h1>Welcome to your SmartSuit app</h1>

      <BoutonConnexion
        onClick={connectedDevice ? disconnectDevice : connectToSmartSuit}
        connected={!!connectedDevice}
        deviceName={deviceName}
        error={error}
      />

      {/* Enregistrement des données */}
      {connectedDevice && (
        <div className="record-controls" style={{ marginTop: "2em" }}>
          <button onClick={toggleRecording}>
            {recording ? "🛑 Stop Record" : "🎬 Start Record"}
          </button>

          {!recording && recordedData.length > 0 && (
            <button onClick={downloadCSV} style={{ marginLeft: "1em" }}>
              ⬇️ Télécharger CSV
            </button>
          )}

          {recording && (
            <p style={{ color: "green", marginTop: "1em" }}>
              ⏺ Enregistrement en cours… {recordedData.length} lignes
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Connexion;
