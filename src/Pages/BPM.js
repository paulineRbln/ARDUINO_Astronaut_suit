import React, { useState, useEffect } from 'react';
import { useBluetooth } from "../BluetoothContext";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Temp.css'; // Tu peux renommer Temp.css si tu veux un style séparé

// === Enregistrement des composants Chart.js ===
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// === Constantes ===
const TIME_WINDOW = 30;       // Nombre de points affichés (glissants)
const MAX_HISTORY = 300;      // Nombre total de points conservés (2m30 si 1 point/500ms)

function BPM() {
  const { sensorData } = useBluetooth();

  const [bpmHistory, setBpmHistory] = useState([]);
  const [timeHistory, setTimeHistory] = useState([]);

  // === Mettre à jour les historiques ===
  useEffect(() => {
    if (sensorData && sensorData[17] !== null && !isNaN(sensorData[17])) {
      const bpm = parseFloat(sensorData[17]);
      const time = new Date().toLocaleTimeString();

      setBpmHistory(prev => {
        const updated = [...prev, bpm];
        return updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated;
      });

      setTimeHistory(prev => {
        const updated = [...prev, time];
        return updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated;
      });
    }
  }, [sensorData]);

  // === Préparer la fenêtre glissante ===
  const startIndex = Math.max(0, timeHistory.length - TIME_WINDOW);
  const visibleLabels = timeHistory.slice(startIndex);
  const visibleBPM = bpmHistory.slice(startIndex);

  const minBPM = Math.min(...visibleBPM, 60);
  const maxBPM = Math.max(...visibleBPM, 100);

  const dataBPM = {
    labels: visibleLabels,
    datasets: [
      {
        label: 'BPM',
        data: visibleBPM,
        borderColor: '#d00000',
        backgroundColor: 'rgba(208, 0, 0, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    animation: false,
    scales: {
      x: {
        type: 'category',
        ticks: {
          autoSkip: true,
          maxTicksLimit: TIME_WINDOW,
        },
      },
      y: {
        min: minBPM - 5,
        max: maxBPM + 5,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  return (
    <div className="temp-container">
      <h1>❤️ Fréquence Cardiaque</h1>

      <div className="temperature-text">
        {bpmHistory.length ? (
          <div><strong>BPM : {bpmHistory[bpmHistory.length - 1]} bpm</strong></div>
        ) : (
          <p>En attente des données BPM...</p>
        )}
      </div>

      <div className="temperature-chart">
        <Line data={dataBPM} options={options} />
      </div>
    </div>
  );
}

export default BPM;
