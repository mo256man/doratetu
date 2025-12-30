import React, { useRef, useEffect } from "react";
import { numberToKanji } from "./utils";

function Result({ score, results, goToTitle }) {
    console.log(score);
    console.log(results);

    const reelRef = useRef(null);
    const symbols = [
        ["😵", "🤢", "😷", "🥶", "🤕", "🥵", "🤮"],
        ["💩", "👾", "👹", "🤖", "👽", "🤡", "👻"],
        ["😟", "😯", "🥺", "😨", "😣", "🤔", "🙄" ],
        ["🐶", "🐱", "🐮", "🦁", "🐷", "🐨", "🐼"],
        ["🩲", "📛", "🥼", "📿", "📟", "🧻", "🚽" ],
        ["🍰", "🍺", "🍲", "🥗", "🍙", "🍜", "🍣"],
        ["🍒", "🍋", "🔔", "⭐", "7⃣", "🍉", "🎰"],
        ["💎", "🏆", "✨", "🎁", "👑", "💍", "💖"],
    ];
    const spinDuration = 2000;

    // マウント直後に実行
    useEffect(() => {
        startSlot();
    }, []);

    // ドラゴンボールの作成
    const correctCnt = results.filter(element => element).length;       // 正解数
    let correctCntMsg;
    if (correctCnt==0) {
        correctCntMsg = "";
    } else if (correctCnt==results.length) {
        correctCntMsg = "";
    } else {
        correctCntMsg = "";
    }

    const balls = [];
    const styleCorrect = "ball light result-ball glow";
    const styleWrong = "ball dark result-ball"
    for (let i = 0; i < results.length; i++) {
        balls.push(
        <div key={i} className={i % 2 === 0 ? "result-ball-upper" : "result-ball-lower"}>
            <div className={results[i] ? styleCorrect : styleWrong}>
            {i+1}
            </div>
        </div>
        );
    }

    const createReelContent = () => {
        const reel = reelRef.current;
        const inner = document.createElement("div");
        inner.className = "reel-inner";
        for (let i = 0; i < 20; i++) {
        const symbol = document.createElement("div");
        symbol.textContent = symbols[correctCnt][Math.floor(Math.random() * symbols.length)];
        inner.appendChild(symbol);
        }
        reel.innerHTML = "";
        reel.appendChild(inner);
};

const startSlot = () => {
    const reel = reelRef.current;
    createReelContent();
    const inner = reel.querySelector(".reel-inner");
    const totalHeight = inner.scrollHeight - reel.clientHeight;
    inner.style.transition = "none";
    inner.style.top = "0px";

    setTimeout(() => {
        inner.style.transition = `top ${spinDuration}ms ease-out`;
        inner.style.top = `-${totalHeight}px`;
    }, 50);
};

    return (
        <div className="base">
        <div className="result frame">
            <div className="font-saiyan center fontXL">RESULT</div><br />
            <div className="result-ball-container">
            {balls}
            </div>
            <div className="font-saiyan fontL center">SCORE: {numberToKanji(score)}</div><br /><br />

            <div className="reel" ref={reelRef}></div>
            <button onClick={startSlot}>START</button>

            <div className="start-button font-saiyan" onClick={goToTitle}>タイトルに戻る</div><br />
        </div>
        </div>
    );
}

export default Result;
