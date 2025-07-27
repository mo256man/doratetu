import React, { useEffect } from 'react';
import { sleep } from './sleep';
import '../styles.css';

function Overlay({ visible, symbol, onDone }) {
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    const run = async () => {
      await sleep(2000);
      if (!cancelled) onDone(true);
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [visible, onDone]);

  const color = symbol === "○" ? "red" : "black";
  if (!visible) return null;

  return (
    <div className="overlay">
      <span className="symbol" style={{ color: color }}>{symbol}</span>
    </div>
  );
}

export default Overlay;
