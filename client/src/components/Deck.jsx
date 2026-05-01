import React, { useState } from "react";

function Deck({ questionChoices, correctStation, currentIndex, onChoice, hintOpen, disabled }) {
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [decided, setDecided] = useState(false);

    const handleClick = (idx) => {
        if (disabled || decided) return;
        setSelectedIdx(idx);
        setDecided(true);
        onChoice(idx, hintOpen);
    };

    const handleMouseEnter = (idx) => {
        if (disabled || decided) return;
        setSelectedIdx(idx);
    };

    const handleMouseLeave = () => {
        if (disabled || decided) return;
        setSelectedIdx(null);
    };

    // questionChoices が null または空の場合の安全な処理
    const choices = questionChoices || [];
    console.log("Deck questionChoices:", questionChoices, "choices:", choices);
    
    if (choices.length === 0) {
        return <div className="deck frame center">カードを読み込み中...</div>;
    }
    
    return (
        <div className="deck frame center">
            <div className="cards">
            {choices.slice(0, 6).map((label, idx) => (
                <div
                key={idx}
                className={label.length <= 3 ? "card fontL" : "card fontM"}
                onClick={() => handleClick(idx)}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={() => handleMouseLeave()}
                >
                {label}
                </div>
            ))}
            </div>
        </div>
    );
}

export default Deck;
