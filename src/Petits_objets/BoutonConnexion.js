import React from "react";
import "./BoutonConnexion.css";

function BoutonConnexion({ onClick, connected, deviceName, error }) {
  const getButtonText = () => {
    if (error) return "❌ Connection lost";
    if (connected) return `✅ Connected to ${deviceName}`;
    return "🔌 Connect my Smart Suit";
  };

  const className = `bouton-connexion${error ? " error" : connected ? " connected" : ""}`;

  return (
    <button className={className} onClick={onClick}>
      {getButtonText()}
    </button>
  );
}

export default BoutonConnexion;
