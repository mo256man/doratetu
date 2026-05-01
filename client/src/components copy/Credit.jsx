import React, { useState } from "react";

function Credit({ onStart }) {
    const [showCredit, setShowCredit] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    const clickCredit = () => {
        setShowCredit(true);
        setShowTutorial(false);
        setShowDebug(false);
    }

    const clickTutorial = () => {
        setShowCredit(false);
        setShowTutorial(true);
        setShowDebug(false);
    }

    const clickDebug = () => {
        setShowCredit(false);
        setShowTutorial(false);
        setShowDebug(true);
    }

    const ckickDebug = () => {
        setShowDebug(true);
    }
    const credit =
        <div className="credit">
            <img src="mo_square.png" className="img-credit" onClick={ckickDebug}></img>
        </div>

    const title =
        <div className="row">
            <span className="title-word font-saiyan">DRA</span>
            <img src="./title_tetu.png" className="title-tetu" alt="title" />
            <span className="font-guessr title-word"> GUESSR</span>
        </div>

    return <>

    </>
}

export default Credit;
