import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import Overlay from './Overlay';
import TitleBall from './TitleBall';
import Cards from './Cards';
import Map from './Map';
import Bukken from './Bukken';
import StreetView from './StreetView';
import Question from './Question';
import Demo from './Demo';
import '../styles.css';

function Main({ diceIndex, onShowTitle }) {
  const called = useRef(false);
  const [showDice, setShowDice] = useState(false);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [correctLatlng, setcorrectLatlng] = useState(null);
  const [options, setOptions] = useState(null);
  const [items, setItems] = useState(null);
  const [done, setDone] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlaySymbol, setOverlaySymbol] = useState('');
  const [isDone, setIsDone] = useState(false);

  const handleAnswer = (isCorrect) => {
    setOverlaySymbol(isCorrect ? '○' : '✕');
    setOverlayVisible(true);
  };

  const handleOverlayDone = (done) => {
    if (done) {
      setOverlayVisible(false);
      setIsDone(true);
    }
  };

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const fetchSession = async () => {
      try {
        const res = await axios.post("/api/fetchSession", {}, { withCredentials: true });
        setCorrectIndex(res.data.correctIndex);
        setcorrectLatlng(res.data.correctLatlng);
        setOptions(res.data.options);
        setItems(res.data.items);
        setDone(true);
      } catch (error) {
        console.error('セッション取得エラー:', error);
      }
    };
    fetchSession();
  }, []);

  // ▼ return はフックの後に条件分岐で置く
  if (isDone) {
    return <Demo showCount={true} onShowTitle={onShowTitle} />;
  }

  if (!done) return null;

  return (
    <>
      <Overlay
        visible={overlayVisible}
        symbol={overlaySymbol}
        onDone={handleOverlayDone}
      />
      <div id="main">
        <TitleBall onShowTitle={onShowTitle} />
        <Question latlng={correctLatlng} items={items} diceIndex={diceIndex}/>
        <div id="answer">
          <Cards
            options={options}
            correctIndex={correctIndex}
            onAnswer={handleAnswer}
          />
        </div>
      </div>
    </>
  );
}

export default Main;
