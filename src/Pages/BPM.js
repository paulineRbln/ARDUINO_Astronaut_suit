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
  Filler,
  Legend
} from 'chart.js';
import './Temp.css';  // On réutilise le CSS global pour garder la cohérence

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const TIME_WINDOW = 30;
const MAX_HISTORY = 300;

function BPM() {
  const { sensorData } = useBluetooth();

  const [bpmHistory, setBpmHistory] = useState([]);
  const [timeHistory, setTimeHistory] = useState([]);

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

  const startIndex = Math.max(0, timeHistory.length - TIME_WINDOW);
  const visibleLabels = timeHistory.slice(startIndex);
  const visibleBPM = bpmHistory.slice(startIndex);

  const minBPM = Math.min(...visibleBPM, 60);
  const maxBPM = Math.max(...visibleBPM, 100);

  const dataBPM = {
    labels: visibleLabels,
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: visibleBPM,
        borderColor: '#d00000',
        backgroundColor: 'rgba(208, 0, 0, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
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
      <h1>❤️Heart Rate</h1>

      <div className="temperature-text" style={{ color: '#d00000' }}>
        {bpmHistory.length ? (
          <div>BPM: {bpmHistory[bpmHistory.length - 1]} bpm</div>
        ) : (
          <p>Waiting for BPM data...</p>
        )}
      </div>

      <div className="temperature-chart">
        <Line data={dataBPM} options={options} />
      </div>
    </div>
  );
}

export default BPM;
