import React, { useState } from "react";
import Credit from "./Credit";
import Config from "./Config";

function Title({ startGameMode }) {
    const [showCredit, setShowCredit] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const credit =
        <div className="credit">
            <img src="mo_square.png" className="img-credit" onClick={() => setShowDebug(true)} />
        </div>

    const title =
        <div className="row middle">
            <span className="title-word font-saiyan">DRA</span>
            <img src="./title_tetu.png" className="title-tetu" alt="title" />
            <span className="font-guessr title-word"> GUESSR</span>
        </div>

    const areaStart =
        <div className="frame start-area color-game">
            <div className="center"><div className="start-button font-saiyan" onClick={() => {startGameMode("play")}}>ゲームスタート</div></div>
            <span className="font-saiyan">DRAGON BALL</span> のドラゴンレーダーと<br />
            <img className="img-setumei" src="/momotetu.png"/> の物件リストと<br />
            <span className="font-guessr">GEO GUESSER</span> 的ストリートビューで<br />
            <img className="img-setumei" src="/momotetu.png"/> の駅を当てよう！
        </div>

    const areaDebug =
        <div className="frame start-area color-debug">
            <div className="center"><div className="start-button font-saiyan" onClick={() => startGameMode("education")}>教育版スタート</div></div>
            物件と地図とストリートビューを<br />
            駅名（地名）と照らし合わせながら<br />
            地理の勉強をしよう！<br />
        </div>


    return <>
        <div className="base">
        {credit}
        {title}
        <div className="start-container fontS">
            {areaStart}
            {areaDebug}
        </div>
        </div>
    </>
}

export default Title;
