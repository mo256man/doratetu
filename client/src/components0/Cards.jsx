import React, { useRef, useEffect, useState } from 'react';
import '../styles.css';

function Cards({ options, correctIndex, onAnswer}) {
    const called = useRef(false);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [decided, setDecided] = useState(false);

    useEffect(() => {
        if (called.current) return;
        called.current = true;
        // ここまで、開発時に2回レンダリングされるのを防ぐためのフラグ
    }, []);

    // カードクリックで決定
    const handleCardClick = idx => {
        if (decided) return;
        setSelectedIdx(idx);
        setDecided(true);
        const isCorrect = idx === correctIndex;
        onAnswer(isCorrect);
    };

    // ホバーで選択状態
    const handleMouseEnter = (idx) => {
        if (decided) return;
        setSelectedIdx(idx);
    };

    const handleMouseLeave = () => {
        if (decided) return;
        setSelectedIdx(null);
    };

    return (
        <div className="right">
            {options.slice(0, 6).map((item, idx) => (
                <div
                    key={idx}
                    className={
                        "card faceup" +
                        (selectedIdx === idx ? " selected" : "") +
                        (decided && selectedIdx === idx
                            ? (selectedIdx === correctIndex ? " correct" : " incorrect")
                            : "")
                    }
                    onClick={() => handleCardClick(idx)}
                    onMouseEnter={() => handleMouseEnter(idx)}
                    onMouseLeave={() => handleMouseLeave(idx)}
                    style={{ cursor: decided ? "default" : "pointer" }}
                >
                    <div className="card-inner">
                        <div className="card-front">
                            <div className="number" style={{ fontSize: 28 }}>{item}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Cards;