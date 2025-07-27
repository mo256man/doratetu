import React from "react";

function Deck({ choices, onChoice, disabled }) {
  return (
    <div>
      {choices.map((label, idx) => (
        <button
          key={idx}
          onClick={() => onChoice(idx)}
          disabled={disabled}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default Deck;