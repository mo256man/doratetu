import React, { useState, useEffect } from "react";
import sleep from "./sleep";
import Header from "./Header";
import Deck from "./Deck";
import Score from "./Score";
import Question from "./Question";
import Judge from "./Judge";

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
  const [judgeResult, setJudgeResult] = useState(null);
  const [judgePoint, setJudgePoint] = useState(0);

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
    setAnswered(true);

    // 正誤判定
    if (idx === correctIndex) {
      setJudgeResult("correct");
      setJudgePoint(bonus * correctMoney);
      // この間はonJudgeはまだ呼ばない（親の進行はJudge表示→親のuseEffectで進行）
    } else {
      setJudgeResult("wrong");
      setJudgePoint(0);
    }
  };

  // Judgeが表示されたあと、一定時間でonJudgeを呼ぶ
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (answered && judgeResult) {
        await sleep(3000);
        if (!ignore && onJudge) onJudge(judgeResult, judgePoint);
      }
    })();
    return () => { ignore = true; };
  }, [answered, judgeResult, judgePoint, onJudge]);

  return (
    <div className="quiz">
      <Header />
      <Question correctLatlng={latlng} correctItems={correctItems} hintOpen={hintOpen} onShowHint={handleShowHint} />
      {!answered && <div className="ui_container">
        <Deck options={options} correctIndex={correctIndex} onChoice={onChoice} disabled={answered} />
        <Score score={score} count={count} bonus={bonus} />
      </div>}
      {answered && <Judge judge={{ result: judgeResult, point: judgePoint }} />}
    </div>
  );
}

export default Quiz;