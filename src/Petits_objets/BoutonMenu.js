import React from 'react';
import { useNavigate } from 'react-router-dom'; // Utilisation de useNavigate au lieu de useHistory
import './BoutonMenu.css'; // Importer le fichier CSS

const BoutonMenu = ({ icon, text, lien, color }) => {
  const navigate = useNavigate(); // Utilisation de useNavigate pour la navigation

  // Fonction pour gérer le clic et la redirection
  const handleClick = () => {
    navigate(lien); // Redirige vers le lien spécifié
  };

  return (
    <div className="menu-button" onClick={handleClick}>
      {icon && (
        <div className="menu-icon" style={{ color: color }}>
          {icon}
        </div>
      )}
      {text && <span style={{ color: color }} >{text}</span >}
    </div>
  );
};

export default BoutonMenu;
