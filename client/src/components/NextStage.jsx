import React from "react";

function NextStage({ show, number }) {
  if (!show) return null;

  return (
    <div id="nextStage">
      <div className="nestStage_container">
        <span className="nextStage_word">第</span>
        <span className="nextStage_ball ball dark bold">{number}</span>
        <span className="nextStage_word">問</span>
      </div>
    </div>
  );
}

export default NextStage;