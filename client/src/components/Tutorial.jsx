import React from "react";

function Tutorial({ onClose }) {
  const howToPlay = ["", "あ", "そ", "び", "か", "た", ""].map((item, index) =>
    <div key={index} className="ball light ball-howtoplay">{item}</div>
  );

  return (
    <div id="tutorial">
      <div className="header-howtoplay">
        {howToPlay}
      </div>
      <div className="setumei">
        <span className="font-saiyan fs50">DRAGON BALL</span> のドラゴンレーダーと<br />
        <img src="momotetu.png" className="momotetu50" /> 物件リストと<br />
        <span className="font-guessr fs50">GEO GUESSR</span> 的ストリートビューをヒントに<br />
        <img src="momotetu.png" className="momotetu50" /> の駅を当てよう！<br />
        <br />
        緯度経度の取得は自動でおこなったので間違ってたらゴメン！ 報告して！<br />
      </div>
      <button className="menu-button fs50" onClick={onClose}>RETURN TO TITLE</button>
    </div>
  );
}

export default Tutorial;
