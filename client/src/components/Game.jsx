import React, { useState, useEffect } from "react";
import sleep from "./sleep";
import NextStage from "./NextStage";
import Dice from "./Dice";
import Quiz from "./Quiz";
import Result from "./Result";

function Game({ quizData, goToTitle }) {
  const [step, setStep] = useState("next"); // "next" | "dice" | "quiz" | "result"
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [diceIndex, setDiceIndex] = useState(undefined);
  const [results, setResults] = useState([]); // 各問の正誤（true/false）
  const [quiz, setQuiz] = useState({});  // gameData内のcount番目のクイズデータ

  useEffect(() => {
    let ignore = false;
    const asyncStep = async () => {
      if (step === "next") {
        await sleep(1000);
        if (!ignore) setStep("dice");
      }
      if (step === "judge") {
        await sleep(100000);
        if (!ignore) {
          console.log("count:", count);
          if (count >= 6) {
            setStep("result");
          } else {
            setStep("next");
          }
        }
      }
    };
    asyncStep();
    return () => { ignore = true; };
  }, [step, count]);

  const handleDice = (diceIndex) => {
    setDiceIndex(diceIndex);
    const oneQuiz = {};
    for (const key in quizData) {
      oneQuiz[key] = quizData[key][count];
    }
    // console.log("oneQuiz", oneQuiz);
    setQuiz(oneQuiz);
    setStep("quiz");
  };

  // Quizからの判定時コールバック
  const handleQuizJudge = (result, point) => {
    if (result === "correct") {
      setScore((prev) => prev + point);
      setResults(prev => [...prev, true]);
    } else {
      setResults(prev => [...prev, false]);
    }
    setCount((prev) => prev + 1);
    setStep("judge");
  };

  const handleRestart = () => {
    setScore(0);
    setCount(0);
    setDiceIndex(undefined);
    setResults([]);
    setStep("next");
  };

  return (
    <>
      {step === "next" && (
        <NextStage show={true} number={count + 1} />
      )}
      {step === "dice" && (
        <Dice setDiceIndex={handleDice} />
      )}
      {step === "quiz" && (
        <Quiz
          quiz={quiz}
          diceIndex={diceIndex}
          count={count}
          score={score}
          onJudge={handleQuizJudge}
        />
      )}
      {step === "result" && (
        <Result score={score} results={results} goToTitle={goToTitle} onRestart={handleRestart} />
      )}
    </>
  );
}

export default Game;