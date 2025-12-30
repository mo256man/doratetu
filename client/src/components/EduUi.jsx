import React, { useState, useEffect } from "react";

function EduUi({ uiProps }) {
    const {
        allStations,
        correctStation,
        setCorrectStation,
    } = uiProps;

    const [selectedKen, setSelectedKen] = useState(correctStation.ken);

    // useEffect(() => {
    //     const matched = quizData.stations.find(item => item.name === correctStation);
    //     if (matched) {
    //         setSelectedKen(matched.ken);
    //     }
    // }, []);

    // 全駅の配列
    const stationArray = allStations.map(item => item.name);

    // ユニークな都道府県の配列
    const kenArray =  [...new Set(allStations.map(item => item.ken))];


    // 都道府県のプルダウンリスト
    const selectKen =
        <select
            className="select-ken"
            value={selectedKen}
            onChange={e => {
                const newKen = e.target.value;
                setSelectedKen(newKen);
                const firstStation = allStations.find(item => item.ken === newKen);
                setCorrectStation(firstStation);
            }}
        >
        {kenArray.map((ken) => (
        <option key={ken} value={ken}>
            {ken}
        </option>
        ))}
        </select>

    // 都道府県に対応する駅の配列
    const kenStations = allStations
        .filter(item => item.ken === selectedKen)
        .map(item => item.name);
    console.log("kenStations:", kenStations);

    // 駅のプルダウンリスト
    const selectKenStation =
        <select
        className="select-ken"
        value={correctStation.name}
        onChange={e => {
            const newStationName = e.target.value;
            const matchedStation = allStations.find(
            item => item.name === newStationName && item.ken === selectedKen
            );
            if (matchedStation) {
            setCorrectStation(matchedStation);
            }
        }}
        disabled={!selectedKen}
        >
        {kenStations.map((station, i) => (
            <option key={i} value={station}>
                {station}
            </option>
        ))}
        </select>


    // 駅のインデックス
    const currentIndex = stationArray.indexOf(correctStation.name);

    // 前後ボタンで駅を変更する
    const changeStation = (offset) => {
        const newIndex = currentIndex + offset;
        if (newIndex >= 0 && newIndex < stationArray.length) {
            const newStation = allStations[newIndex];
            setCorrectStation(newStation);
            setSelectedKen(newStation.ken);
        }
    };

    // 選択された駅データ
    const selectedObject = allStations.find(item => item.name === correctStation);

    return <>
            <div className="debug frame center">
                <div className="station-container">
                    {selectKen}{selectKenStation}
                </div>
                <div className="station-container">
                    <button className="debug-arrow" onClick={() => changeStation(-1)} disabled={currentIndex <= 0}>◀</button>
                    <div className="card">{correctStation.name}</div>
                    <button className="debug-arrow" onClick={() => changeStation(1)} disabled={currentIndex < 0 || currentIndex >= allStations.length - 1}>▶</button>
                </div>
            </div>
        </>
}

export default EduUi;
