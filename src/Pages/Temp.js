import React, { useState, useEffect } from 'react';
import { useBluetooth } from "../BluetoothContext"; // Import the context to access data
import { Line } from 'react-chartjs-2'; // Import the Chart.js component
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './Temp.css'; // Import the CSS file specific to the page

// Register necessary components from Chart.js
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
  const { sensorData } = useBluetooth(); // Get the data from context (including temperature and humidity)
  const [temperatureHistory, setTemperatureHistory] = useState([]); // Temperature history
  const [humidityHistory, setHumidityHistory] = useState([]); // Humidity history
  const [timeHistory, setTimeHistory] = useState([]); // Time history

  // Define the time window (in number of data points)
  const TIME_WINDOW = 30; // This value can be easily changed to enlarge or reduce the window

  // Effect to update history each time new data is received
  useEffect(() => {
    if (sensorData && sensorData[3] !== null && sensorData[4] !== null) {
      const currentTime = new Date().toLocaleTimeString();

      // Add new temperature, humidity, and time to the history
      setTemperatureHistory(prevHistory => [...prevHistory, sensorData[3]]);
      setHumidityHistory(prevHistory => [...prevHistory, sensorData[4]]);
      setTimeHistory(prevHistory => [...prevHistory, currentTime]);
    }
  }, [sensorData]);

  // Effect to limit the history to the defined time window
  useEffect(() => {
    if (temperatureHistory.length > TIME_WINDOW) {
      setTemperatureHistory(prevHistory => prevHistory.slice(1));  // Remove the first element if the size exceeds TIME_WINDOW
      setHumidityHistory(prevHistory => prevHistory.slice(1));  // Remove the first element of humidityHistory as well
      setTimeHistory(prevHistory => prevHistory.slice(1));  // Remove the first element of timeHistory
    }
  }, [temperatureHistory.length, humidityHistory.length]); // Added both history arrays in the dependencies

  // Calculate min and max temperature and humidity for dynamic Y-axis scaling
  const minTemp = Math.min(...temperatureHistory);
  const maxTemp = Math.max(...temperatureHistory);
  const minHumidity = Math.min(...humidityHistory);
  const maxHumidity = Math.max(...humidityHistory);

  // Data for the temperature and humidity charts
  const dataTemp = {
    labels: timeHistory, // Labels representing the time of data
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperatureHistory, // Temperatures for the chart
        borderColor: 'rgba(75,192,192,1)', // Line color for temperature
        backgroundColor: 'rgba(75,192,192,0.2)', // Fill color for temperature
        fill: true, // Fill the area under the line
        tension: 0.4, // Smooth the line
        pointRadius: 0, // No visible points on the line
      }
    ]
  };

  const dataHumidity = {
    labels: timeHistory, // Labels representing the time of data
    datasets: [
      {
        label: 'Humidity (%)',
        data: humidityHistory, // Humidity for the chart
        borderColor: 'rgba(0,0,128,1)', // Dark blue line color for humidity
        backgroundColor: 'rgba(0,0,128,0.2)', // Fill color for humidity
        fill: true, // Fill the area under the line
        tension: 0.4, // Smooth the line
        pointRadius: 0, // No visible points on the line
      }
    ]
  };

  // Options for the temperature and humidity charts
  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'category',
        ticks: {
          autoSkip: true,
          maxTicksLimit: TIME_WINDOW, // Limit the number of ticks based on the time window
        },
      },
      y: {
        min: minTemp - 1,  // Set the lower margin for the min value
        max: maxTemp + 1,  // Set the upper margin for the max value
        ticks: {
          stepSize: 1, // Interval for ticks on the Y-axis
        },
      },
    },
  };

  const optionsHumidity = {
    responsive: true,
    scales: {
      x: {
        type: 'category',
        ticks: {
          autoSkip: true,
          maxTicksLimit: TIME_WINDOW, // Limit the number of ticks based on the time window
        },
      },
      y: {
        min: minHumidity - 1,  // Set the lower margin for the min humidity value
        max: maxHumidity + 1,  // Set the upper margin for the max humidity value
        ticks: {
          stepSize: 1, // Interval for ticks on the Y-axis
        },
      },
    },
  };

  if (!sensorData) {
    return <p>Waiting for Bluetooth data...</p>;
  }

  return (
    <div className="temp-container">
      <h1> 🫁🌡️ Metabolism </h1>

      {/* Displaying the temperature */}
      <div className="temperature-text">
        {sensorData[3] !== null ? (
          <>
            <div>Temperature: {sensorData[3]} °C</div>
          </>
        ) : (
          <p>Waiting for temperature data...</p>
        )}
      </div>

      

      {/* Displaying the temperature chart */}
      <div className="temperature-chart">
        <Line data={dataTemp} options={options} />
      </div>

    {/* Displaying the humidity */}
      <div className="humidity-text">
        {sensorData[4] !== null ? (
          <>
            <div>Humidity: {sensorData[4]} %</div>
          </>
        ) : (
          <p>Waiting for humidity data...</p>
        )}
      </div>

      {/* Displaying the humidity chart */}
      <div className="humidity-chart">
        <Line data={dataHumidity} options={optionsHumidity} />
      </div>
    </div>
  );
}

export default Temp;
