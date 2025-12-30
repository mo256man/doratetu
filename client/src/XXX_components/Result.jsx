import React from "react";
import numberToKanji from "./numberToKanji";

function Result({ score, results, goToTitle, onRestart }) {
  const balls = [];
  const styleCorrect = "ball light result-ball glow";
  const styleWrong = "ball dark result-ball"
  for (let i = 0; i < results.length; i++) {
    balls.push(
      <div key={i} className={i % 2 === 0 ? "result-ball-upper" : "result-ball-lower"}>
        <div className={results[i] ? styleCorrect : styleWrong}>
          {i+1}
        </div>
      </div>
    );
  }
  return (
    <div id="result">
      <div className="font-saiyan fs100 center">RESULT</div><br />
      <div className="result-ball-container">
        {balls}
      </div>
      <div className="font-saiyan fs50 center">SCORE: {numberToKanji(score)}</div><br />
      <br />
      <div className="menu-button fs50" onClick={goToTitle}>RETURN TO TITLE</div><br />
    </div>
  );
}

export default Result;