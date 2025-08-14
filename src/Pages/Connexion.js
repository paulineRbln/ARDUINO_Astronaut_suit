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
    // On enregistre les données uniquement si l'enregistrement est en cours et qu'il y a des nouvelles données
    if (recording && sensorData && sensorData.length > 0) {
      const timestamp = new Date().toISOString();
      const line = [timestamp, ...sensorData];
      setRecordedData((prev) => [...prev, line]);
      console.log("📈 Nouvelle donnée ajoutée :", line);
    }
  }, [sensorData, recording]);

  const toggleRecording = () => {
    if (recording) {
      setRecording(false); // Arrêter l'enregistrement

      // Sauvegarder les données dans localStorage une fois l'enregistrement terminé
      const date = new Date();
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}_${(date.getMonth() + 1).toString().padStart(2, '0')}_${date.getFullYear().toString().slice(2)}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
      const fileName = `DATA_${formattedDate}`;

      const headers = [
        "Time",
        "timestamp_ms",
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

      const rows = recordedData.map((row) => row.join(";"));
      const csvContent = [headers, ...rows].join("\n");

      // Sauvegarder dans le localStorage
      localStorage.setItem(fileName, csvContent);

      // Ajouter à la liste des fichiers enregistrés
      const fileList = JSON.parse(localStorage.getItem("fileList")) || [];
      fileList.push(fileName);
      localStorage.setItem("fileList", JSON.stringify(fileList));

      setRecordedData([]); // Réinitialiser les données après sauvegarde
      console.log("📂 Données sauvegardées sous le fichier :", fileName);
    } else {
      setRecordedData([]); // Réinitialiser les données avant de commencer un nouvel enregistrement
      console.log("🔴 Démarrage de l'enregistrement");
      setRecording(true);
    }
  };

  return (
    <div className="connexion-container">
      <h1>👩‍🚀SmartSuit</h1>

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

          {/* Affichage du message avant l'enregistrement */}
          {!recording && (
            <div>
              <p className="info-text">
                The file will be available in your files once the recording is finished.
              </p>
            </div>
          )}

          {/* Affichage du message quand l'enregistrement est en cours */}
          {recording && (
            <div>
              <p style={{ color: "green", marginTop: "1em" }}>
                ⏺ Recording in progress… {recordedData.length} lines
              </p>
              <p className="info-text">
                Please stay on this page for the recording to be valid.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

}

export default Connexion;
