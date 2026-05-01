import React from "react";
import { numberToKanji } from "./utils";

function Score({ score, count, multiplier }) {
    console.log("score:", score, count, multiplier);
    const scoreKanji = numberToKanji(score);
    return (
        <div className="score frame fontL">
            <div className="score-count">第{count + 1}問</div><br />
            <table>
                <tbody>
                    <tr><th>スコア</th><td>{scoreKanji}</td></tr>
                    <tr><th>ヒント倍率</th><td>{multiplier}倍</td></tr>
                </tbody>
            </table>
        </div>
    );
}

export default Score;