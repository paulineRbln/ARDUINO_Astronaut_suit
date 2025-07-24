import React, { useState, useEffect } from 'react';
import { useBluetooth } from "../BluetoothContext";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
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

function Temp() {
  const { sensorData } = useBluetooth();

  const [temperatureHistory, setTemperatureHistory] = useState([]);
  const [humidityHistory, setHumidityHistory] = useState([]);
  const [timeHistory, setTimeHistory] = useState([]);

  const TIME_WINDOW = 30;     // Nb de points visibles (15s si 1 point/500ms)
  const MAX_HISTORY = 300;    // Nb total de points gardés (2m30 de données)

  useEffect(() => {
    if (sensorData && sensorData[3] !== null && sensorData[4] !== null) {
      const currentTime = new Date().toLocaleTimeString();

      setTemperatureHistory(prev => {
        const updated = [...prev, sensorData[3]];
        return updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated;
      });

      setHumidityHistory(prev => {
        const updated = [...prev, sensorData[4]];
        return updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated;
      });

      setTimeHistory(prev => {
        const updated = [...prev, currentTime];
        return updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated;
      });
    }
  }, [sensorData]);

  const startIndex = Math.max(0, timeHistory.length - TIME_WINDOW);
  const visibleLabels = timeHistory.slice(startIndex);
  const visibleTemperature = temperatureHistory.slice(startIndex);
  const visibleHumidity = humidityHistory.slice(startIndex);

  const minTemp = Math.min(...visibleTemperature);
  const maxTemp = Math.max(...visibleTemperature);
  const minHumidity = Math.min(...visibleHumidity);
  const maxHumidity = Math.max(...visibleHumidity);

  const dataTemp = {
    labels: visibleLabels,
    datasets: [{
      label: 'Temperature (°C)',
      data: visibleTemperature,
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }]
  };

  const dataHumidity = {
    labels: visibleLabels,
    datasets: [{
      label: 'Humidity (%)',
      data: visibleHumidity,
      borderColor: 'rgba(0,0,128,1)',
      backgroundColor: 'rgba(0,0,128,0.2)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }]
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
        min: minTemp - 1,
        max: maxTemp + 1,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const optionsHumidity = {
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
        min: minHumidity - 1,
        max: maxHumidity + 1,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (!sensorData) {
    return <p>Waiting for Bluetooth data...</p>;
  }

  return (
    <div className="temp-container">
      <h1>🫁🌡️ Metabolism</h1>

      <div className="temperature-text">
        {sensorData[3] !== null ? (
          <div>Temperature: {sensorData[3]} °C</div>
        ) : (
          <p>Waiting for temperature data...</p>
        )}
      </div>

      <div className="temperature-chart">
        <Line data={dataTemp} options={options} />
      </div>

      <div className="humidity-text">
        {sensorData[4] !== null ? (
          <div>Humidity: {sensorData[4]} %</div>
        ) : (
          <p>Waiting for humidity data...</p>
        )}
      </div>

      <div className="humidity-chart">
        <Line data={dataHumidity} options={optionsHumidity} />
      </div>
    </div>
  );
}

export default Temp;
