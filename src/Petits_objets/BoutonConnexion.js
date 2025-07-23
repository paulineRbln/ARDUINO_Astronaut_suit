import React from "react";
import "./BoutonConnexion.css";

function BoutonConnexion({ onClick, connected, deviceName, error }) {
  const getButtonText = () => {
    if (error) return "❌ Connexion perdue";
    if (connected) return `✅ Connecté à ${deviceName}`;
    return "🔌 Connecter ma Smart Suit";
  };

  const className = `bouton-connexion${error ? " error" : connected ? " connected" : ""}`;

  return (
    <button className={className} onClick={onClick}>
      {getButtonText()}
    </button>
  );
}

export default BoutonConnexion;
