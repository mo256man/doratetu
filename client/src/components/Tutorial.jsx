import React from "react";

function Tutorial({ onClose }) {
  return (
    <div id="tutorial">
      <div id="header">
        <div className="ball light ball_howtoplay"></div>
        <div className="ball light ball_howtoplay">あ</div>
        <div className="ball light ball_howtoplay">そ</div>
        <div className="ball light ball_howtoplay">び</div>
        <div className="ball light ball_howtoplay">か</div>
        <div className="ball light ball_howtoplay">た</div>
        <div className="ball light ball_howtoplay"></div>
      </div>
      <div className="setumei">
        <br />
        <span className="font_dragon fs50">DRAGON RADAR</span>と<img src="momotetu.png" className="momotetu50" />物件リストと<br />
        <span className="font_guessr fs50">GEO GUESSR</span> 的ストリートビューをヒントに<br />
        <img src="momotetu.png" className="momotetu50" />の駅を当てよう！<br />
        <br />
        追加でヒントを見ることもできるけど<br />
        ボーナス倍率が3倍→2倍→1倍と減ってしまうぞ！<br />
        <br />
      </div>
      <button className="menu_button" onClick={onClose}>タイトルに戻る</button>
    </div>
  );
}

export default Tutorial;
