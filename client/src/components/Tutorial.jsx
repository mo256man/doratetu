import React from "react";

function Tutorial({ onClose }) {
  const howToPlay = ["", "あ", "そ", "び", "か", "た", ""].map((item, index) =>
    <div key={index} className="ball light ball-tutorial">{item}</div>
  );

  return (
    <div id="tutorial">
      <div className="header-tutorial">
        {howToPlay}
      </div>
      <div className="setumei">
        <span className="font-saiyan fs50">DRAGON BALL</span> のドラゴンレーダーと<br />
        <img src="momotetu.png" className="momotetu50" /> 物件リストと<br />
        <span className="font-guessr fs50">GEO GUESSR</span> 的ストリートビューをヒントに<br />
        <img src="momotetu.png" className="momotetu50" /> の駅を当てよう！<br />
        <br />
        緯度経度は自動で取得したものなので間違ってたらゴメン！ 報告して！<br />
        （報告用のシステムは作ってないけど）<br />
      </div>
      <button className="menu-button fs50" onClick={onClose}>RETURN TO TITLE</button>
    </div>
  );
}

export default Tutorial;
