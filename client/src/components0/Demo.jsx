import Count from './Count';
import Dice from './Dice';
import Main from './Main';
import { sleep } from './sleep';
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';

function Demo({showCount, onShowTitle}) {
  const called = useRef(false);
  const [demoState, setDemoState] = useState(0);
  const [diceResult, setDiceResult] = useState(null);

  useEffect(() => {
    // 初期の demoState === 0 処理：一度だけ実行
    if (!called.current && demoState === 0) {
      called.current = true;
      sleep(1000).then(() => {
        setDemoState(1);
      });
    }

    // demoState === 2 のときは常に fetchQuiz 実行
    if (demoState === 2) {
      const fetchQuiz = async () => {
        try {
          const res = await axios.post("/api/makeQuiz", {}, { withCredentials: true });
          console.log('クイズデータ:', res.data);
          setDemoState(3);
        } catch (err) {
          console.error(err);
        }
      };
      fetchQuiz();
    }
  }, [demoState]);

  // Dice から出目を受け取って demoState を 2 に
  const handleDiceResult = (result) => {
    setDiceResult(result);
    setDemoState(2);
  };

  return (
    <>
      {demoState === 0 && <Count />}
      {demoState === 1 && <Dice onResult={handleDiceResult} />}
      {demoState === 2 && <div>待ってね</div>}
      {demoState === 3 && <Main diceIndex={diceResult} onShowTitle={onShowTitle}/>}
    </>
  );
}

export default Demo;