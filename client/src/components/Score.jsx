import React from "react";
import numberToKanji from "./numberToKanji";

function Score({ score, count, bonus }) {
  const scoreKanji = numberToKanji(score);
  return (
    <div className="score">
      <p>スコア: {scoreKanji}</p>
      <p>問題: {count + 1} / 7</p>
      <p>ボーナス倍率: {bonus}倍</p>
    </div>
  );
}

export default Score;