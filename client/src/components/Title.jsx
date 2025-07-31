import React, { useState } from "react";
import Tutorial from "./Tutorial";
import Credit from "./Credit";

function Title({ onStart }) {
  const [showCredit, setShowCredit] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <div id="title">
        {!showTutorial && <div className="credit"><img src="mo_square.png" className="mo" onClick={() => setShowCredit(true)}></img></div>}
        <div className="title_container">
          <span className="font-saiyan fs100">DRA</span>
          <img src="./title_tetu.png" className="title_tesu" alt="title" />
          <span className="font-guessr fs100"> GUESSR</span>
        </div>
        <div id="header">
          <div className="ball light glow ball_header">ド</div>
          <div className="ball light glow ball_header">ラ</div>
          <div className="ball light glow ball_header">鉄</div>
          <div className="ball light glow ball_header">ゲ</div>
          <div className="ball light glow ball_header">ッ</div>
          <div className="ball light glow ball_header">サ</div>
          <div className="ball light glow ball_header">ー</div>
        </div>
        <br />
        <div className="menu-button fs50" onClick={onStart}>START</div>
        <div className="menu-button fs50" onClick={() => setShowTutorial(true)}>How to play</div>
        {showCredit && <Credit onClose={() => setShowCredit(false)} />}
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
        </div>
    </>
  );
}

export default Title;