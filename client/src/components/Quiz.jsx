import React, { useState, useEffect } from "react";
import sleep from "./sleep";
import Header from "./Header";
import Deck from "./Deck";
import Score from "./Score";
import Question from "./Question";
import numberToKanji from "./numberToKanji";

// diceIndexによりどのシャッターを開くか
function getInitialHintOpen(diceIndex) {
  if (diceIndex <= 2) {
    return [true, false, false];
  } else if (diceIndex <= 4) {
    return [false, true, false];
  } else {
    return [false, false, true];
  }
}

function Quiz({ quiz, diceIndex, score, count, onJudge}) {
  // console.log("quiz", quiz);
  const [bonus, setBonus] = useState(3);
  const [hintOpen, setHintOpen] = useState(getInitialHintOpen(diceIndex));
  const [answered, setAnswered] = useState(false);
  const [judgePoint, setJudgePoint] = useState(0);
  const [judgeMsg, setJudgeMsg] = useState("");

  const options = quiz.options;
  const correctIndex = quiz.correctIndex;
  const latlng = quiz.correctLatlng;
  const correctItems = quiz.correctItems;
  const correctMoney = quiz.correctMoney;

  const handleShowHint = (index) => {
    if (!hintOpen[index] && !answered) {
      const numOpened = hintOpen.filter(Boolean).length;
      if (numOpened < 3 && bonus > 1) setBonus(bonus - 1);
      setHintOpen((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    }
  };

  const onChoice = (idx) => {
    if (answered) return; // すでに判定済みなら無視

    // すべてのヒントを開く
    setHintOpen([true, true, true]);

    // 正誤判定
    if (idx === correctIndex) {
      setJudgePoint(correctMoney * bonus);
      const msg1 = <div className="font-bold">正解！　ここは {options[correctIndex]} です</div>;
      const msg2 = <>
        <div className="align-center"><span className="font-small">物件資産</span><br />{numberToKanji(correctMoney)}</div>
        <div> ×</div>
        <div className="align-center"><span className="font-small">ボーナス倍率</span><br />{bonus}倍</div>
        <div>＝ {numberToKanji(correctMoney * bonus)} 獲得！</div></>;
      setJudgeMsg(<>{msg1}<div className="align-bottom">{msg2}</div></>);
    } else {
      setJudgePoint(0);
      const msg3 = <div className="font-bold">不正解　ここは {options[correctIndex]} です</div>;
      setJudgeMsg(<>{msg3}</>);
    }

    setAnswered(true);
  };

  // Judgeが表示されたあと、一定時間でonJudgeを呼ぶ
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (answered) {
        await sleep(5000);
        if (!ignore && onJudge) onJudge(judgePoint);  // 獲得した点数を親要素に返す
      }
    })();
    return () => { ignore = true; };
  }, [answered, judgePoint, onJudge]);

  return (
    <div id="quiz">
      <Header />
      <Question correctLatlng={latlng} correctItems={correctItems} hintOpen={hintOpen} onShowHint={handleShowHint} />
      <div className="ui-container">
        {!answered && <>
          <Deck options={options} correctIndex={correctIndex} onChoice={onChoice} disabled={answered} />
          <Score score={score} count={count} bonus={bonus} />
        </>}
        {answered && <>
          <div className="judge frame">{judgeMsg}</div>
        </>}
      </div>
    </div>
  );
}

export default Quiz;