import React, { useState, useEffect, useRef, useCallback } from "react";
import Question from "./Question";
import Dice from "./Dice";
import Deck from "./Deck";
import EduUi from "./EduUi";
import Upload from "./Upload";
import Score from "./Score";
import axios from "axios";

function Game({ gameProps }) {

    const {
        allStations,
        allItems,
        score,
        setScore,
        results,
        setResults,
        returnTitle,
        gameMode,
        handleComplete,
    } = gameProps;

    const [questionChoices, setQuestionChoices] = useState([]);
    const [correctStation, setCorrectStation] = useState({});
    const [correctItems, setCorrectItems] = useState({});
    const [status, setStatus] = useState("count");
    const [usedStations, setUsedStations] = useState([]);             // 出題済み駅リスト
    const [currentQuestion, setCurrentQuestion] = useState(null);     // 現在の問題
    const generatedRef = useRef(false);  // generateQuestion と初期化の二重呼び出し防止

    // diceIndexによりどのシャッターを開くか
    const getInitialHintOpen = (gameMode, diceIndex) => {
        let hintOpen;
        if (gameMode === "education") {
            hintOpen = [true, true, true]
        } else {
            if (diceIndex <= 2) {
                hintOpen = [true, false, false];
            } else if (diceIndex <= 4) {
                hintOpen = [false, true, false];
            } else {
                hintOpen = [false, false, true];
            }
        }
        console.log("ini_hintOpen", diceIndex, hintOpen);
        return hintOpen;
    }

    useEffect(() => {
        // 二重呼び出し防止
        if (generatedRef.current) return;
        generatedRef.current = true;

        if (gameMode === "education") {
            const tokyoStation = allStations.find(st => st.name === "東京");
            const tokyoItems = allItems.filter(item => item.station === "東京");
            setCorrectStation(tokyoStation);
            setCorrectItems(tokyoItems);
        } else if (gameMode === "play") {
                    // バックエンドにクイズ開始を要求（セッション初期化 + 第1問取得）
                    (async () => {
                        try {
                            const resp = await axios.post('/api/startQuiz', {}, { withCredentials: true });
                            const newQuiz = resp.data;
                            setQuestionChoices(newQuiz.questionChoices || []);
                            setCorrectStation(newQuiz.correctStation || {});
                            setCorrectItems(newQuiz.relatedItems || []);
                            // クライアント側のインデックスは 0 始まりで扱う
                            setCurrentIndex((newQuiz.questionNumber || 1) - 1);
                            setAnswered(false);
                            // サーバーデータを更新
                            setServerData({
                                totalScore: newQuiz.totalScore || 0,
                                questionNumber: newQuiz.questionNumber || 1,
                                totalQuestions: newQuiz.totalQuestions || 7,
                                multiplier: 1, // 初期は1倍（diceで1つ開いている状態）
                            });
                        } catch (err) {
                            console.error('startQuiz error', err);
                        }
                    })();
        }
    }, [gameMode]);

    useEffect(() => {
    const items = allItems.filter(i => i.station === correctStation.name);
        setCorrectItems(items);
        if (correctStation && correctStation.name) {
            setCorrectData({
                lat: correctStation.lat,
                lng: correctStation.lng,
                heading: correctStation.heading ?? 0,
                pitch: correctStation.pitch ?? 0,
                money: correctStation.money,
            });
        } else {
            setCorrectData({});
        }
    }, [correctStation, allItems]);

  const [diceIndex, setDiceIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hintOpen, setHintOpen] = useState([false, false, false]);
  const [correctData, setCorrectData] = useState({});
  const [judgeMsg, setJudgeMsg] = useState("");
  const [answered, setAnswered] = useState(false);
  // サーバーから返される情報を保持（Score表示用）
  const [serverData, setServerData] = useState({
    totalScore: 0,
    questionNumber: 0,
    totalQuestions: 7,
    multiplier: 1,
  });

  const bouns_multiplier = [1, 0.6, 0.3];

  // hintOpen が変わるたびに multiplier を更新
  useEffect(() => {
    const openCount = hintOpen.filter(h => h).length;
    const bonus = Math.max(0, openCount - 1); // dice で1つ開いているので、追加で開けた数
    const currentMultiplier = bouns_multiplier[Math.max(0, Math.min(2, bonus))];
    setServerData(prev => ({
      ...prev,
      multiplier: currentMultiplier,
    }));
  }, [hintOpen]);


  // Dice選択
  const handleDice = (diceIdx) => {
    setDiceIndex(diceIdx);
    // diceIdx（新しい値）を使って hintOpen を決定する
    const nextHintOpen = getInitialHintOpen(gameMode, diceIdx);
    setHintOpen(nextHintOpen);
    // setStatus("quiz");
  };

    // Dice が終了したときに呼ばれるハンドラ（メモ化して再生成を防ぐ）
    const handleDiceFinish = useCallback(() => {
        setStatus("quiz");
    }, []);

  // Deckで選択
  const onChoice = (idx, currentHintOpen) => {
        if (answered) return;
        setAnswered(true);
        setHintOpen([true, true, true]);

        (async () => {
            try {
                // 開いているヒント数を数えてサーバに送る
                const openCount = currentHintOpen.filter(h => h).length;
                const bonus = Math.max(0, openCount - 1); // dice で1つ開いているので、追加で開けた数
                const currentMultiplier = bouns_multiplier[Math.max(0, Math.min(2, bonus))];
                const resp = await axios.post('/api/checkAnswer', { selectedIndex: idx, bonus }, { withCredentials: true });
                const body = resp.data;
                const correct = body.correct;
                
                // サーバーデータを更新（判定後のスコアと問題番号）
                setServerData({
                    totalScore: body.totalScore || 0,
                    questionNumber: body.questionNumber || 0,
                    totalQuestions: body.totalQuestions || 7,
                    multiplier: currentMultiplier,
                });

                if (correct) {
                    const msg1 = <div className="fontM">正解！　ここは {body.correctStation?.name} です</div>;
                    const msg2 = <div className="row middle align-bottom">
                            <table>
                                    <tr><td className="fontS">物件資産</td><td></td><td className="fontS">ヒント倍率</td><tr></tr></tr>
                                    <tr><td className="fontM">{(body.relatedItems || []).reduce((a,b)=>a+(b.money||0),0)}</td><td className="fontM">×</td><td className="fontM">{bouns_multiplier[Math.max(0, Math.min(2, bonus))]}倍</td><td className="fontM">＝ {body.getScore} 獲得！</td></tr>
                            </table>
                    </div>;
                    setJudgeMsg(<>{msg1}<div className="align-bottom">{msg2}</div></>);
                    // サーバ側の合計スコアを反映
                    setScore(body.totalScore || 0);
                    setResults(prev => [...prev, true]);
                } else {
                    const msg3 = <div className="font-bold">不正解　ここは {body.correctStation?.name} です</div>;
                    setJudgeMsg(<>{msg3}</>);
                    setResults(prev => [...prev, false]);
                }

                setStatus('answered');

                setTimeout(async () => {
                    // 次問があれば generateQuiz を呼んで次問を取得、なければ結果へ
                    const qNum = body.questionNumber || 0;
                    const total = body.totalQuestions || 7;
                    if (qNum < total) {
                        try {
                            const nextResp = await axios.post('/api/generateQuiz', {}, { withCredentials: true });
                            const next = nextResp.data;
                            setQuestionChoices(next.questionChoices || []);
                            setCorrectStation(next.correctStation || {});
                            setCorrectItems(next.relatedItems || []);
                            setCurrentIndex((next.questionNumber || 1) - 1);
                            setAnswered(false);
                            setHintOpen(getInitialHintOpen(gameMode, diceIndex));
                            // 次問のサーバーデータを更新
                            setServerData(prev => ({
                                ...prev,
                                questionNumber: next.questionNumber || prev.questionNumber + 1,
                                totalQuestions: next.totalQuestions || 7,
                                multiplier: 1, // 新しい問題はdiceで1つ開いた状態からスタート
                            }));
                            setStatus('count');
                        } catch (err) {
                            console.error('generateQuiz error', err);
                            // 取得失敗したら終了
                            setStatus('result');
                            handleComplete();
                        }
                    } else {
                        setStatus('result');
                        handleComplete();
                    }
                }, 3000);

            } catch (err) {
                console.error('checkAnswer error', err);
            }
        })();
  };

  const renderPlayMode = () => {

    const balls = "ドラ鉄ゲッサー".split("").map((letter) => (
        <div key={letter} className="ball light ball-header">{letter}</div>
    ));

    const questionProps = {
        correctData,
        correctItems,
        correctStation,
        hintOpen: hintOpen,
        setHintOpen: setHintOpen,
        disabled: false,
    };

    return (
        <div className="base">
            <div className="emojiIcon" onClick={returnTitle}>🔙</div>
            <div className="header">{balls}</div>

            {status === "count" && (
                <Dice
                    status={status}
                    cnt={currentIndex + 1}
                    onFinish={handleDiceFinish}
                    setDiceIndex={handleDice}
                />
            )}

            {(status === "quiz" || status === "answered") && (
                <>
                    <Question questionProps={questionProps} />
                    <div className="controls">
                        {status === "quiz" && (
                            <>
                            <Deck
                                questionChoices={questionChoices}
                                correctStation={correctStation}
                                currentIndex={currentIndex}
                                onChoice={onChoice}
                                hintOpen={hintOpen}
                                disabled={answered}
                            />
                            <Score 
                                score={serverData.totalScore} 
                                count={serverData.questionNumber - 1} 
                                multiplier={serverData.multiplier}
                            />
                            </>
                        )}
                        {status === "answered" && (
                            <div className="judge">{judgeMsg}</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};


    const renderEducationMode = () => {
        if (!correctStation.name) return null; // またはローディング表示

        const questionProps = {
            correctData,
            correctItems,
            correctStation,
            hintOpen: [true, true, true],
            disabled: false,
        };

        const uiProps = {
            allStations,
            correctStation,
            setCorrectStation,
        };

        return (
            <div className="base">
                <div className="emojiIcon" onClick={ returnTitle }>🔙</div>
                <Question questionProps={ questionProps } />
                <div className="row">
                    <EduUi uiProps={ uiProps }/>
                    <Upload correctStation={correctStation} />
                </div>
            </div>
        );
    };


  return gameMode === "play" ? renderPlayMode() : renderEducationMode();
//   return (
//     <div className="base">
//       <div className="emojiIcon" onClick={returnTitle}>🔙</div>

//       {!isDebug && status === "count" && (
//         <Dice cnt={currentIndex+1} setDiceIndex={handleDice} />
//       )}

//       {(status === "quiz" || status === "answered") && (
//         <>
//           <Question correctData={correctData} correctItems={correctItems} correctStation={correctStation} hintOpen={hintOpen} onShowHint={(i)=>setHintOpen(prev=>{ const next = [...prev]; next[i]=true; return next;})}/>
//           {!isDebug && status === "quiz" && (
//             <Deck quizData={quizData} correctStation={correctStation} currentIndex={currentIndex} onChoice={onChoice} disabled={answered} />
//           )}
//           {!isDebug && status === "answered" && <div className="judge">{judgeMsg}</div>}
//         </>
//       )}
//     </div>
//   );
}

export default Game;
