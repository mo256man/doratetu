import React from "react";

function Tutorial({ onClose }) {
  return (
    <div className="overlay">
      <div className="frame msg">
        <button className="menu-button font-saiyan" onClick={onClose}>RETURN TO TITLE</button>
      </div>
    </div>
  );
}

export default Tutorial;
