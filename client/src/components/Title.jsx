import React, { useState } from "react";
import Tutorial from "./Tutorial";

function Title({ onStart }) {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <div id="title">
        <div className="title_container">
          <span className="font_dragon fs100">DRA</span>
          <img src="./title_tetu.png" className="title_tesu" alt="title" />
          <span className="font_guessr fs100"> GUESSR</span>
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
        <div className="menu_button" onClick={onStart}>START</div>
        <div className="menu_button" onClick={() => setShowTutorial(true)}>あそびかた</div>
      </div>
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
    </>
  );
}

export default Title;