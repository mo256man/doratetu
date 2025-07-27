import React, { useRef, useEffect } from 'react';
import '../styles.css';

function TitleBall({ onShowTitle }) {
  const called = useRef(false);
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    // ここまで、開発時に2回レンダリングされるのを防ぐためのフラグ
  }, []);

  return (
    <div id="titleBall">
      <div onClick={onShowTitle} className="ball ball_main">戻</div>
      <div className="ball ball_main">ド</div>
      <div className="ball ball_main">ラ</div>
      <div className="ball ball_main">鉄</div>
      <div className="ball ball_main">ゲ</div>
      <div className="ball ball_main">ッ</div>
      <div className="ball ball_main">サ</div>
      <div className="ball ball_main">ー</div>
    </div>
  );
}

export default TitleBall;
