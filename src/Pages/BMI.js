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

function BMI() {
  const { sensorData } = useBluetooth();

  const [accelHistory, setAccelHistory] = useState({ ax1: [], ay1: [], az1: [] });
  const [gyroHistory, setGyroHistory] = useState({ gx1: [], gy1: [], gz1: [] });
  const [timeHistory, setTimeHistory] = useState([]);

  const TIME_WINDOW = 30;
  const MAX_HISTORY = 300;
  const updateInterval = 200;

  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    const handleSensorData = () => {
      if (sensorData && sensorData.length >= 11) {
        const currentTime = Date.now();
        if (currentTime - lastUpdate.current >= updateInterval) {
          lastUpdate.current = currentTime;

          const time = new Date().toLocaleTimeString();

          setAccelHistory(prev => {
            const updated = {
              ax1: [...prev.ax1, parseFloat(sensorData[5])],
              ay1: [...prev.ay1, parseFloat(sensorData[6])],
              az1: [...prev.az1, parseFloat(sensorData[7])]
            };
            return {
              ax1: updated.ax1.slice(-MAX_HISTORY),
              ay1: updated.ay1.slice(-MAX_HISTORY),
              az1: updated.az1.slice(-MAX_HISTORY)
            };
          });

          setGyroHistory(prev => {
            const updated = {
              gx1: [...prev.gx1, parseFloat(sensorData[8])],
              gy1: [...prev.gy1, parseFloat(sensorData[9])],
              gz1: [...prev.gz1, parseFloat(sensorData[10])]
            };
            return {
              gx1: updated.gx1.slice(-MAX_HISTORY),
              gy1: updated.gy1.slice(-MAX_HISTORY),
              gz1: updated.gz1.slice(-MAX_HISTORY)
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
        label: 'ax1 (g)',
        data: getVisible(accelHistory.ax1),
        borderColor: '#ff0000',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'ay1 (g)',
        data: getVisible(accelHistory.ay1),
        borderColor: '#00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'az1 (g)',
        data: getVisible(accelHistory.az1),
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
        label: 'gx1 (°/s)',
        data: getVisible(gyroHistory.gx1),
        borderColor: '#ffa500',
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'gy1 (°/s)',
        data: getVisible(gyroHistory.gy1),
        borderColor: '#800080',
        backgroundColor: 'rgba(128, 0, 128, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'gz1 (°/s)',
        data: getVisible(gyroHistory.gz1),
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
      <h1>🚶‍♀️ Central IMU</h1>

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

export default BMI;
