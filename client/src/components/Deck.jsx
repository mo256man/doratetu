import React, { useState } from "react";

function Deck({ options, correctIndex, onChoice, disabled }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [decided, setDecided] = useState(false);

  const handleClick = (idx) => {
    if (disabled || decided) return;
    setSelectedIdx(idx);
    setDecided(true);
    onChoice(idx);
  };

  const handleMouseEnter = (idx) => {
    if (disabled || decided) return;
    setSelectedIdx(idx);
  };

  const handleMouseLeave = () => {
    if (disabled || decided) return;
    setSelectedIdx(null);
  };

  return (
    <div className="deck frame">
      <div className="select-card">
        SELECT CARD
      </div>
      <div className="cards">
      {options.slice(0, 6).map((label, idx) => (
        <div
          key={idx}
          className={
            "card faceup" +
            (selectedIdx === idx ? " selected" : "")
          }
          onClick={() => handleClick(idx)}
          onMouseEnter={() => handleMouseEnter(idx)}
          onMouseLeave={() => handleMouseLeave()}
          style={{ cursor: disabled ? "default" : "pointer" }}
        >
          <div className="card-inner">
            <div className="card-front">
              <div style={{ fontSize: label.length > 4 ? 30 : 36 }}>{label}</div>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

export default Deck;
