import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import './Temp.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Paramètres de configuration
const WINDOW_SIZE = 8;
const EMA_ALPHA = 0.2;
const THRESHOLD = 100000;
const MIN_INTERVAL = 300;
const TIME_WINDOW = 150;

function BPM() {
  const { sensorData } = useBluetooth();

  // États pour l'historique et l'affichage des données
  const [irHistory, setIrHistory] = useState([]);
  const [bpmDisplay, setBpmDisplay] = useState(null);
  const [bpmHistory, setBpmHistory] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [smoothedIrHistory, setSmoothedIrHistory] = useState([]);

  // Références pour les calculs en cours
  const lastBeat = useRef(0);
  const emaBpm = useRef(0);
  const bpmWindow = useRef(new Array(WINDOW_SIZE).fill(0));
  const bpmIndex = useRef(0);
  const prevIr = useRef(0);
  const prevPrevIr = useRef(0);
  const lastPrint = useRef(0);

  // Fonction de lissage (Moyenne glissante)
  const movingAverage = useCallback((data, size = 3) => {
    if (data.length < size) return data;
    return data.map((_, i, arr) => {
      const start = Math.max(0, i - size + 1);
      const slice = arr.slice(start, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      return avg;
    });
  }, []);

  // Fonction de détection des pics et calcul du BPM
  useEffect(() => {
    if (!sensorData || !sensorData[1]) return;

    const timestamp = parseInt(sensorData[0]);
    const ir = parseInt(sensorData[1]);
    const time = new Date().toLocaleTimeString();

    // Mise à jour de l'historique pour les graphes
    setIrHistory(prev => [...prev.slice(-TIME_WINDOW + 1), ir]);
    setTimeLabels(prev => [...prev.slice(-TIME_WINDOW + 1), time]);

    const smoothed = movingAverage([...irHistory, ir]);
    setSmoothedIrHistory(smoothed);

    const prev = prevIr.current;
    const prevPrev = prevPrevIr.current;

    // Détection d’un pic
    const isPeak = prev > THRESHOLD && prev > ir && prev > prevPrev;
    const timeSinceLast = timestamp - lastBeat.current;

    if (isPeak && timeSinceLast > MIN_INTERVAL) {
      const now = timestamp;
      const delta = now - lastBeat.current;
      lastBeat.current = now;

      const instantBPM = 60 / (delta / 1000);
      if (instantBPM > 20 && instantBPM < 220) {
        bpmWindow.current[bpmIndex.current++] = instantBPM;
        if (bpmIndex.current >= WINDOW_SIZE) bpmIndex.current = 0;

        const avg = bpmWindow.current.reduce((a, b) => a + b, 0) / WINDOW_SIZE;
        emaBpm.current = EMA_ALPHA * avg + (1 - EMA_ALPHA) * emaBpm.current;

        // Mise à jour de l'affichage du BPM
        if (timestamp - lastPrint.current > 1000) {
          lastPrint.current = timestamp;
          setBpmDisplay(Math.round(emaBpm.current));
          setBpmHistory(prev => [...prev.slice(-TIME_WINDOW + 1), Math.round(emaBpm.current)]);
        }
      }
    }

    prevPrevIr.current = prevIr.current;
    prevIr.current = ir;

  }, [sensorData, movingAverage]);

  // === Graphiques ===
  const dataIR = {
    labels: timeLabels,
    datasets: [
      {
        label: 'IR lissé',
        data: smoothedIrHistory,
        borderColor: '#ff4d6d',
        backgroundColor: 'rgba(255,77,109,0.1)',
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      },
      {
        label: 'IR brut',
        data: irHistory,
        borderColor: '#ffc2d1',
        backgroundColor: 'rgba(255,194,209,0.1)',
        tension: 0.4,
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  const dataBPM = {
    labels: bpmHistory.map((_, i) => i + 1),
    datasets: [
      {
        label: 'BPM',
        data: bpmHistory,
        borderColor: '#800f2f',
        backgroundColor: 'rgba(128,15,47,0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: { ticks: { autoSkip: true } },
      y: { beginAtZero: false }
    }
  };

  return (
    <div className="temp-container">
      <h1>🩺 Fréquence cardiaque</h1>

      <div className="temperature-text">
        {bpmDisplay ? (
          <h2>❤️ BPM : {bpmDisplay} bpm</h2>
        ) : (
          <p>Détection du rythme cardiaque en cours...</p>
        )}
      </div>

      <div className="temperature-chart">
        <h3>📈 Signal IR</h3>
        <Line data={dataIR} options={chartOptions} />
      </div>

      <div className="temperature-chart">
        <h3>📊 Historique BPM</h3>
        <Line data={dataBPM} options={chartOptions} />
      </div>
    </div>
  );
}

export default BPM;
