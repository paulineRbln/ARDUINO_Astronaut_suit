import React from 'react';
import { FaHeartbeat, FaFileAlt, FaTemperatureHigh, FaBluetooth  } from 'react-icons/fa';
import { GiBodyHeight } from 'react-icons/gi';
import { MdSensors } from 'react-icons/md';
import BoutonMenu from '../Petits_objets/BoutonMenu';
import { useLocation } from 'react-router-dom';
import './Menu.css';

const Menu = () => {
  const location = useLocation();
  const isActive = (lien) => location.pathname === lien ? '#EBACAC' : '#C5C7CC';

  return (
    <div className="menu">
        <BoutonMenu 
        icon={<FaBluetooth  />} 
        text="Board" 
        lien="/connexion" 
        color={isActive('/connexion')} 
      />
      <BoutonMenu 
        icon={<FaHeartbeat />} 
        text="BPM" 
        lien="/bpm" 
        color={isActive('/bpm')} 
      />
      <BoutonMenu 
        icon={<GiBodyHeight />} 
        text="BMI" 
        lien="/bmi" 
        color={isActive('/bmi')} 
      />
      <BoutonMenu 
        icon={<MdSensors />} 
        text="IMU" 
        lien="/imu" 
        color={isActive('/imu')} 
      />
      <BoutonMenu 
        icon={<FaTemperatureHigh />} 
        text="Temp°" 
        lien="/temperature" 
        color={isActive('/temperature')} 
      />
      <BoutonMenu 
        icon={<FaFileAlt />} 
        text="Files" 
        lien="/files" 
        color={isActive('/files')} 
      />
    </div>
  );
};

export default Menu;
