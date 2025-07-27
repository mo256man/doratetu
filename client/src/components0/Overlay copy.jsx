import React, { useRef, useEffect } from 'react';
import { sleep } from './sleep';
import '../styles.css';

function Overlay({ visible, symbol, onDone }) {
  const called = useRef(false);
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    // ここまで、開発時に2回レンダリングされるのを防ぐためのフラグ

    const run = async () => {
      if (visible) {
        await sleep(2000);
        onDone(true); // 表示後2秒でMainにonDone=trueを通知
      }
    };
    run();
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="overlay">
      <span className="symbol">{symbol}</span>
    </div>
  );
}

export default Overlay;
