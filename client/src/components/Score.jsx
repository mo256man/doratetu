import React from "react";
import numberToKanji from "./numberToKanji";

function Score({ score, count, bonus }) {
  const scoreKanji = numberToKanji(score);
  return (
    <div className="score frame">
      <div className="fs30"><b>第{count + 1}問</b></div><br />
      <table className="table-score">
      <tr><th className="score">スコア</th><td>{scoreKanji}</td></tr>
      <tr><th className="score">ボーナス倍率</th><td>{bonus}倍</td></tr>
      </table>
    </div>
  );
}

export default Score;