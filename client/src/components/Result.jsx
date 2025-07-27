import React from "react";

function Result({ score, results, goToTitle, onRestart }) {
  return (
    <div>
      <h2>結果発表</h2>
      <p>あなたのスコア: {score} 点</p>
      <h3>各問の正誤</h3>
      <ul>
        {results.map((v, i) => (
          <li key={i}>
            {i + 1}問目: {String(v)}
          </li>
        ))}
      </ul>
      <button onClick={onRestart}>もう一度挑戦する</button>
      <button onClick={goToTitle}>タイトルに戻る</button>
    </div>
  );
}

export default Result;