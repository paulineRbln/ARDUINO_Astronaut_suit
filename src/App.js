import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Menu from './Grands_objets/Menu';

// Pages principales
import BPM from './Pages/BPM';
import BMI from './Pages/BMI';
import IMU from './Pages/IMU';
import Temperature from './Pages/Temp';
import Files from './Pages/Files';
import Connexion from './Pages/Connexion';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/bpm" element={<BPM />} />
          <Route path="/bmi" element={<BMI />} />
          <Route path="/imu" element={<IMU />} />
          <Route path="/temperature" element={<Temperature />} />
          <Route path="/files" element={<Files />} />
          <Route path="/connexion" element={<Connexion />} />
          
          {/* Route par défaut vers /bpm */}
          <Route path="*" element={<Navigate to="/connexion" />} />
        </Routes>

        <Menu />
      </div>
    </Router>
  );
}

export default App;
