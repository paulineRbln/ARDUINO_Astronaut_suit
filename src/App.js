import React, { useState } from "react";

function App() {
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState([]);
  const [device, setDevice] = useState(null);
  const [error, setError] = useState("");

  const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
  const CHARACTERISTIC_UUID = "abcdef01-1234-5678-1234-56789abcdef0";

  const labels = [
    "⏱ Temps (ms)",
    "💓 BPM",
    "🌡 Température (°C)",
    "💧 Humidité (%)",
    "📈 AccX (BMI)",
    "📈 AccY (BMI)",
    "📈 AccZ (BMI)",
    "🌀 GyroX (BMI)",
    "🌀 GyroY (BMI)",
    "🌀 GyroZ (BMI)",
    "📈 AccX (MPU)",
    "📈 AccY (MPU)",
    "📈 AccZ (MPU)",
    "🌀 GyroX (MPU)",
    "🌀 GyroY (MPU)",
    "🌀 GyroZ (MPU)",
  ];

  const connectToNano = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "Nano" }],
        optionalServices: [SERVICE_UUID]
      });

      setDevice(device);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      await characteristic.startNotifications();

      characteristic.addEventListener("characteristicvaluechanged", (event) => {
        const buffer = event.target.value.buffer;
        const dataView = new DataView(buffer);

        const floats = [];
        for (let i = 0; i < 16; i++) {
          floats.push(dataView.getFloat32(i * 4, true)); // little endian
        }

        setData(floats);
      });

      setConnected(true);
      setError("");
    } catch (err) {
      console.error("❌ Erreur de connexion BLE :", err);
      setError("Erreur BLE : " + err.message);
      setConnected(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>💓 NanoSense+ Web BLE</h1>

      {!connected ? (
        <button onClick={connectToNano}>🔌 Se connecter à la carte</button>
      ) : (
        <p>✅ Connecté à {device?.name || "la carte"} !</p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data.length === 16 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>📊 Données reçues (affichage vertical)</h2>
          <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
            <tbody>
              {data.map((val, idx) => (
                <tr key={idx}>
                  <td><strong>{labels[idx]}</strong></td>
                  <td>{val.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
