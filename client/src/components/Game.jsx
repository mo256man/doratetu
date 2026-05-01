import React, { useEffect, useState } from "react";
import Question from "./Question";
import { getQuestion, getStatus } from "./utils";

function Game({ view, setView }) {
    const [scene, setScene] = useState(0);
    const [score, setScore] = useState(null);
    const [quizCnt, setQuizCnt] = useState(null);
    const [options, setOptions] = useState([]);
    const [items, setItems] = useState([]);

    useEffect(() => {
        getStatus().then(status => {
            setScore(status.score);
            setQuizCnt(status.quizCnt);
        });

        getQuestion().then(res => {
            if (res && Array.isArray(res.options) && Array.isArray(res.correctItems)) {
                setOptions(res.options);
                setItems(res.correctItems);
            } else {
                setOptions([]);
                setItems([]);
            }
        });
    }, []);

    console.log("score:", score);
    console.log("quizCnt:", quizCnt);
    console.log("options:", options);
    console.log("items:", items);
    console.log(quizCnt, score);


    const renderBalls = ( 
        <div className="header">
            <div style={{ display: "flex", justifyContent: "center", width: "100%", gap: "10px" }}>
                {"ドラ鉄ゲッサー".split("").map((letter) => (
                <div key={letter} className="ball light ball-header">{letter}</div>))}
            </div>
        </div>
    );

    const renderMap = () => (
        <div className="question">
            map
        </div>
    );

    const renderItems = () => (
        <div className="question">
            <table className="frame items">
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td className="item">{item?.item}</td>
                            <td className="kanji">{item?.kanji}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderStreetView = () => (
        <div className="question">
            ストリートビュー
        </div>
    );

    const renderCards = () => (
        <div className="frame center cards">
            {options.slice(0, 6).map((label, idx) => (
                <div
                    key={idx}
                    className={label.length <= 3 ? "card fontL" : "card fontM"}
                >
                    {label}
                </div>
            ))}
        </div>
    );

    const renderUI = () => (
        <div className="frame center ui">
            <div>第 {quizCnt} 問</div>
            <div>スコア: {score}</div>
        </div>
    );

    const renderStep0 = () => (
        <div className="overlay" onClick={() => setScene(1)}>
            <div className="modal">
                中央の内容
            </div>
        </div>
    );

    const renderStep1 = () => (
        <>
            {renderBalls}
            <div className="questions">
                {renderMap()}
                {renderItems()}
                {renderStreetView()}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
                {renderCards()}
                {renderUI()}
            </div>
        </>
    );

    return (
        <>
            {scene === 0 && renderStep0()}
            {scene === 1 && renderStep1()}
        </>
    );
}

export default Game;