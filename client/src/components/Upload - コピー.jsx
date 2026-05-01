import React, { useState, useEffect } from "react";

function Upload({quizData, correctStation, setCorrectStation}) {

return <>
    <div className="upload frame center">
        <div className="upload-onegai">おねがい</div>
        <div className="upload-msg">
            緯度経度はWikipediaから自動で取得しているため、<br />
            ストリートビューの景色はイケていないものが少なくありません<br />
            （鎌倉が鎌倉大仏でも鶴岡八幡宮でもなく市役所だったりしています）<br />
            マップやストリートビューを操作して、ぜひナイスなビューを提案してください！<br />
        </div>
        <div className="row">
            <input type="text" placeholder="おなまえ（空白でも可）" id="upload-input"></input> <button>提案</button>
        </div>
    </div>
</>}

export default Upload;
