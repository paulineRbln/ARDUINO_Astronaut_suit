import React, { useState, useEffect, useRef } from 'react';
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
  Legend,
  Filler
} from 'chart.js';
import './Temp.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function IMU() {
  const { sensorData } = useBluetooth();
  
  const [accelHistory, setAccelHistory] = useState({ ax2: [], ay2: [], az2: [] });
  const [gyroHistory, setGyroHistory] = useState({ gx2: [], gy2: [], gz2: [] });
  const [timeHistory, setTimeHistory] = useState([]);

  const TIME_WINDOW = 30;
  const MAX_HISTORY = 300;
  const updateInterval = 200;

  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    const handleSensorData = () => {
      if (sensorData && sensorData.length >= 15) {
        const currentTime = Date.now();
        if (currentTime - lastUpdate.current >= updateInterval) {
          lastUpdate.current = currentTime;

          const time = new Date().toLocaleTimeString();

          setAccelHistory(prev => {
            const updated = {
              ax2: [...prev.ax2, parseFloat(sensorData[9])],
              ay2: [...prev.ay2, parseFloat(sensorData[10])],
              az2: [...prev.az2, parseFloat(sensorData[11])]
            };
            return {
              ax2: updated.ax2.slice(-MAX_HISTORY),
              ay2: updated.ay2.slice(-MAX_HISTORY),
              az2: updated.az2.slice(-MAX_HISTORY)
            };
          });

          setGyroHistory(prev => {
            const updated = {
              gx2: [...prev.gx2, parseFloat(sensorData[12])],
              gy2: [...prev.gy2, parseFloat(sensorData[13])],
              gz2: [...prev.gz2, parseFloat(sensorData[14])]
            };
            return {
              gx2: updated.gx2.slice(-MAX_HISTORY),
              gy2: updated.gy2.slice(-MAX_HISTORY),
              gz2: updated.gz2.slice(-MAX_HISTORY)
            };
          });

          setTimeHistory(prev => {
            const updated = [...prev, time];
            return updated.slice(-MAX_HISTORY);
          });
        }
      }
    };

    handleSensorData();

  }, [sensorData]);

  const startIndex = Math.max(0, timeHistory.length - TIME_WINDOW);
  const visibleLabels = timeHistory.slice(startIndex);
  const getVisible = (arr) => arr.slice(startIndex);

  const accelData = {
    labels: visibleLabels,
    datasets: [
      {
        label: 'ax2 (g)',
        data: getVisible(accelHistory.ax2),
        borderColor: '#ff0000',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'ay2 (g)',
        data: getVisible(accelHistory.ay2),
        borderColor: '#00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'az2 (g)',
        data: getVisible(accelHistory.az2),
        borderColor: '#0000ff',
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ]
  };

  const gyroData = {
    labels: visibleLabels,
    datasets: [
      {
        label: 'gx2 (°/s)',
        data: getVisible(gyroHistory.gx2),
        borderColor: '#ffa500',
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'gy2 (°/s)',
        data: getVisible(gyroHistory.gy2),
        borderColor: '#800080',
        backgroundColor: 'rgba(128, 0, 128, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'gz2 (°/s)',
        data: getVisible(gyroHistory.gz2),
        borderColor: '#008080',
        backgroundColor: 'rgba(0, 128, 128, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ]
  };

  const chartOptions = {
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
        beginAtZero: false,
      },
    },
  };

  if (!sensorData) return <p>Waiting for Bluetooth data...</p>;

  return (
    <div className="temp-container">
      <h1>💪 External IMU</h1>

      <h2>📈 Accelerometer</h2>
      <div className="temperature-chart">
        <Line data={accelData} options={chartOptions} />
      </div>

      <h2>📉 Gyroscope</h2>
      <div className="humidity-chart">
        <Line data={gyroData} options={chartOptions} />
      </div>
    </div>
  );
}

export default IMU;
