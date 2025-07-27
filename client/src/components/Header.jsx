import React from "react";

function Header({ goToTitle }) {
  return (
    <div id="header">
      <div className="ball light ball_header">ド</div>
      <div className="ball light ball_header">ラ</div>
      <div className="ball light ball_header">鉄</div>
      <div className="ball light ball_header">ゲ</div>
      <div className="ball light ball_header">ッ</div>
      <div className="ball light ball_header">サ</div>
      <div className="ball light ball_header">ー</div>
      <button onClick={goToTitle}>タイトルに戻る</button>
    </div>
  );
}

export default Header;
