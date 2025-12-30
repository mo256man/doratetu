import React, { useState } from "react";

function Config({ onClose, setDebug, isDebug }) {

    return (
        <div className="overlay">
            <div className={`frame msg base ${isDebug ? "color-debug" : "color-game"}`}>
                <div className="chapter center">デバッグモード</div>
                <div className="text">
                    現時点では緯度経度はWikipediaから取得しているため、市役所前だったり駅前だったりと<br />
                    「ストリートビューで見える景色」として必ずしも適切ではありません<br />
                    そこで皆さんにも地図の登録を手伝っていただきたいです<br />
                </div>
                <div className="center">
                    <button className="menu-button font-saiyan" onClick={() => setDebug(false)}>GAME MODE</button>
                    <button className="menu-button font-saiyan" style={{color:"red"}} onClick={() => setDebug(true)}>DEBUG MODE</button>
                </div>
                <button className="menu-button font-saiyan" onClick={() => onClose(false)}>CLOSE</button>
            </div>
        </div>
    );
}

export default Config;
