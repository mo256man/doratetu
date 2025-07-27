import React, { useState } from 'react';
import axios from 'axios';
import Demo from './Demo';
import '../styles.css';

function Title() {
  const [started, setStarted] = useState(false);

  const startGame = async () => {
    // サーバーにPOSTリクエスト（スコア初期化など）
    await axios.post("/api/startGame", { method: "POST" }, { withCredentials: true });
    setStarted(true);
  };

  if (started) {
    return <Demo showCount={true} onShowTitle={() => setStarted(false)} />;
  } else {
    return (
      <div id="title">
        <div className="title_container">
          <span className="font_sayan">DRA</span>
          <img src="./title_tetu.png" className="title_tesu"/>
          <span className="font_guessr">GUESSR</span>
        </div>
        <div id="btnStart" onClick={startGame}>
          START
        </div>
      </div>
    );
  }
}

export default Title;

