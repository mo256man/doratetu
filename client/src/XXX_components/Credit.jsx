import React from "react";

function Credit({ onClose }) {
  const howToPlay = ["", "ク", "レ", "ジ", "ッ", "ト", ""].map((item, index) =>
    <div key={index} className="ball light ball-tutorial">{item}</div>
  );

  return (
    <div id="tutorial">
      <div className="header-tutorial">
        {howToPlay}
      </div>
      <div className="left">
        <table className="frame items">
          <tr><td><span className="bold">元ネタ　</span></td><td><span className="font-saiyan fs30">DRAGON BALL</span></td><td><a href="https://dragon-ball-official.com/" target="_blank"> オフィシャルサイト</a></td></tr>
          <tr><td></td><td><span className="font-guessr fs30">GEO GUESSR</span></td><td><a href="https://www.geoguessr.com/ja" target="_blank"> 公式サイト</a></td></tr>
          <tr><td></td><td><img src="momotetu.png" className="momotetu40" /></td><td><a href="https://www.konami.com/games/momotetsu/teiban/" target="_blank"> 公式サイト</a></td></tr>
        </table>
      </div>
      <div className="left">
        <table className="frame items">
          <tr><td><span className="bold">素材　</span></td><td><span className="font-saiyan fs30">DRAGON BALL</span> なフォント</td><td><a href="https://www.cdnfonts.com/saiyan-sans.font" target="_blank">Saiyan</a></td></tr>
          <tr><td></td><td><span className="font-dragon fs30">DRAGON BALL</span> なフォント</td><td><a href="https://fonts.google.com/specimen/Anton" target="_blank">Anton</a>（<a href="https://pa-tu.work/blog/dragonball-anton" target="_blank">作り方</a>）</td></tr>
          <tr><td></td><td><span className="font-guessr fs30">GEO GUESSR</span> なフォント</td><td><a href="https://fonts.google.com/specimen/Open+Sans" target="_blank">Open Sans</a>（<a href="https://design.geoguessr.com/the-brand/logotype" target="_blank">本家</a>）</td></tr>
          <tr><td></td><td><img src="momotetu.png" className="momotetu40" /> のロゴっぽい画像</td><td>勘亭流フォントより作成</td></tr>
          <tr><td></td><td><img src="momotetu.png" className="momotetu40" /> っぽい丸ゴシック</td><td><a href="https://fonts.google.com/specimen/Kosugi+Maru" target="_blank">Kosugi Maru</a></td><td></td></tr>
        </table>
      </div>
      <div className="left">
        <table className="frame items">
          <tr><td><span className="bold">システム</span></td><th>PaaS</th><td><a href="https://render.com/" target="_blank">Render</a></td></tr>
          <tr><td></td><th>地図</th><td><a href="https://www.google.co.jp/maps?hl=ja" target="_blank">Googleマップ</a></td></tr>
          <tr><td></td><th>データベース</th><td><a href="https://docs.google.com/spreadsheets/create?hl=ja" target="_blank">Googleスプレッドシート</a></td><td></td></tr>
        </table>
      </div>
      <button className="menu-button fs50" onClick={onClose}>RETURN TO TITLE</button>
    </div>
  );
}

export default Credit;
