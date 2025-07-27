const cors = require("cors");
const express = require("express");
const session = require("express-session");
const axios = require("axios");
const path = require("path");
const app  = express();
const PORT = 3001;
const deployID = "AKfycbxWzQvV7mBMzodeRFzUSaIVPfjP6XViY3Q61Pj_aTxfCEWP1BYcPQjw9bxwCpxLu9nQNQ";
const GAS_URL = `https://script.google.com/macros/s/${deployID}/exec`;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(session({
  secret: "doratetsu",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, "..", "client", "dist")));

// GASから取り出す全データ（グローバル変数）
let ALL_STATIONS = [];
let ALL_ITEMS = [];

async function init() {
  const payload  = {command: "getAllData"};
  const config = {
    headers: { "Content-Type": "application/json" }
  };
  const response = await axios.post(GAS_URL, payload, config);
  ALL_STATIONS = response.data.all_stations;
  ALL_ITEMS = response.data.all_items;
  ALL_STATIONS = ALL_STATIONS.slice(1);   // 先頭の見出しを削除
  ALL_ITEMS = ALL_ITEMS.slice(1);         // 同上
  console.log("元データ取得完了");
}


// ゲームスタート スコアはreact側で初期化
app.post("/api/startGame", (req, res) => {
  const options = []
  const correctIndex = [];
  const correctItems = [];
  const correctLatlng = [];
  const correctMoney = [];

  // 6つの選択肢を作成
  const usedStations = new Set();                                           // 選択済みの駅
  for (let i = 0; i < 7; i++) {
    const oneOptions = [];
    while (oneOptions.length < 6) {
      const index = Math.floor(Math.random() * ALL_STATIONS.length);        // ランダムなインデックス
      console.log("駅データ", ALL_STATIONS[index]);
      const station = ALL_STATIONS[index][1];                               // 駅名
      if (!usedStations.has(station)) {                                     // 駅名がまだ選択されていなかったら
        oneOptions.push(station);                                           // 選択肢に追加
        usedStations.add(station);                                          // 選択済みの駅に追加
      }
    }
    console.log("選択肢:", oneOptions);
    options.push(oneOptions);                                               // 6個1組の選択肢を配列に追加

    // 正解データ
    const index = Math.floor(Math.random() * 6);                            // 6個の選択肢のうちランダムで正解を選ぶ
    correctIndex.push(index);                                               // 正解のインデックスを配列に追加
    const station = oneOptions[index];                                      // 正解の駅
    console.log("正解の駅:", station);
    const data = ALL_STATIONS.find(row => row[1] === station);              // 正解の駅のデータ
    console.log("data:", data);
    correctLatlng.push({ lat: data[2], lng: data[3] });                     // 正解の緯度経度を配列に追加
    const items = ALL_ITEMS.filter(row => row[3] === station);              // 正解の物件データ
    correctItems.push(items);                                               // 正解の物件データを配列に追加
    console.log("正解の物件データ:", items);

    // 正解の物件データの金額を計算
    let money = 0;
    for (const item of items) {
      console.log("item[1]:", item[1]);
      money += kanjiToNumber(item[1]);                                        // 物件の金額（漢字）を数値に直して合計を求める
    }
    correctMoney.push(money);                                                 // 正解の物件の金額を配列に追加
  }

  // Reatに送るJSONデータ
  const quizData = {
    options: options,
    correctIndex: correctIndex,
    correctItems: correctItems,
    correctLatlng: correctLatlng,
    correctMoney: correctMoney
  }

  // データ送信
  res.status(200).json({ quizData });
});






// // ゲームスタート スコアはreact側で初期化
// app.post("/api/startGameQ", (req, res) => {
//   req.session.stations = ALL_STATIONS.slice(1);     // 先頭（見出し）は削除 sliceはシャローコピーだがそれでも問題ない
//   req.session.items = ALL_ITEMS.slice(1);           // 同上
//   res.json({ message: "started" });
// });


// // クイズを作成
// app.post("/api/makeQuiz", (req, res) => {
//   // ここの方法を変える
//   // 重複しないインデックスを取得するだけにする　そうすればセッションは不要になる

//   // 7問のクイズをここで全部作成する　選択肢は6個
//   const optionArr = [];
//   const correctIndexArr = [];
//   const correstStationArr = [];
//   for (let i = 0; i < 7; i++) {
//     // 選択肢を取得
//     const options = [];
//     for (let j = 0; j < 6; j++) {
//       const cnt = req.session.stations.length;                // 残りの駅数
//       const index = Math.floor(Math.random() * cnt);          // 駅インデックス
//       const selectedStation = req.session.stations.splice(index, 1)[0]; // ランダムに駅を選び、セッションから削除
//       options.push(selectedStation[1]);                       // 選択肢に駅名追加
//     }
//     const correctIndex = Math.floor(Math.random() * 6);       // 正解のインデックス
//     const correstStation = req.session.options[correctIndex]; // 正解の駅名
//     optionArr.push(options);                                  // 各問題の選択肢を配列に追加
//     correctIndexArr.push(correctIndex);                       // 各問題の正解インデックスを配列に追加
//     correstStationArr.push(correstStation);                   // 各問題の正解駅名を配列に追加
//   }

//   // 正解の駅の物件データを取得
//   const correctItemArr = [];
//   for (const station of correstStationArr) {
//     const correctItems = ALL_ITEMS.filter(row => row[3] === station);
//     correctItemArr.push(correctItems);
//   }

//   // 正解の駅の緯度経度を取得
//   const correctLatlngArr = [];
//   for (const station of correstStationArr) {
//     const correctData = ALL_STATIONS.find(row => row[1] === station.trim());  // なぜかtrimしないと一致しない
//     correctLatlngArr.push({ lat: correctData[2], lng: correctData[3] });
//   }

//   const quiz = {
//     options: optionArr,
//     correctIndexes: correctIndexArr,
//     correctStations: correstStationArr,
//     correctItems: correctItemArr,
//     correctLatlngs: correctLatlngArr
//   }


//   // データ送信
//   res.status(200).json({ quiz });
// });

// // クイズを作成
// app.post("/api/makeQuiz0", (req, res) => {
//   // 選択肢を取得
//   req.session.options = [];
//   for (let i=0; i < 6; i++) {
//     const cnt = req.session.stations.length;
//     console.log("残りの駅数:", cnt);
//     const index = Math.floor(Math.random() * cnt);
//     console.log("選ばれたインデックス:", index);
//     const selectedStation = req.session.stations.splice(index, 1)[0]; // ランダムに駅を選び、セッションから削除
//     console.log("選択された駅:", selectedStation);
//     req.session.options.push(selectedStation[1]);           // 選択肢に駅名を追加
//   }
//   const correctIndex = Math.floor(Math.random() * 6);       // 正解のインデックス
//   const correstStation = req.session.options[correctIndex]; // 正解の駅名
//   req.session.correctIndex =correctIndex;
//   console.log("正解の駅:", correstStation);

//   // 正解の駅の物件データを取得
//   const correctItems = ALL_ITEMS.filter(row => row[3] === correstStation);
//   req.session.items = correctItems;
//   console.log(correstStation + "の物件データ:", correctItems);

//   // 正解の駅の緯度経度を取得 セッションからではなく ALL_STATIONS から取得
//   const correctData = ALL_STATIONS.find(row => row[1] === correstStation.trim());
//   console.log(correstStation + "のデータ:", correctData);
//   req.session.correctLatlng = { lat: correctData[2], lng: correctData[3] };
//   // データ送信
//   res.status(200).json({stations: req.session.options});
// });


// // セッションを取得する
// app.post("/api/fetchSession", (req, res) => {
//   // 数値や配列もjsonとして送る
//   console.log("選択肢:", req.session.options);
//   console.log("正解のインデックス:", req.session.correctIndex);
//   const correstStation = req.session.options[req.session.correctIndex];
//   console.log("正解の駅:", correstStation);
//   console.log(correstStation + "の緯度経度:", req.session.correctLatlng);
//   console.log(correstStation + "の物件:",  req.session.items);
//   res.status(200).json({
//     options: req.session.options,
//     correctIndex: req.session.correctIndex,
//     correctLatlng: req.session.correctLatlng,
//     items: req.session.items
//   });
// });

// // GASにPOSTし全データを取得する
// const getAllData = async (req, res) => {
//   const payload  = {command: "getAllData"};
//   const config = {
//     headers: { "Content-Type": "application/json" }
//   };
//   const response = await axios.post(GAS_URL, payload, config);
//   // console.log(response.data.result)
//   const { all_stations: all_stations, all_bukkens: all_bukkens } = response.data;
//   return response.data.result;
// };


// サーバ起動
app.listen(PORT, () => {
  console.log(`サーバー起動 at http://localhost:${PORT}`);
});

// クライアントのルーティング どのパスでもindex.htmlを返す
app.get("*", (req, res) => {
  console.log("session ID:", req.sessionID);
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});


// 漢字の金額を数値にする関数
function kanjiToNumber(str) {
  str = str.replace("円", "");              // 円を削除
  str += "一";                              // 末尾に「一」を追加して万未満の数値にも対応するようにする
  const units = { "兆": 1e12, "億": 1e8, "万": 1e4, "一":1 };
  let total = 0;
  for (const unit of ["兆", "億", "万", "一"]) {
    const arr = str.split(unit);            // 単位で分割
    if (arr.length > 1) {                   // 単位が存在して分割できたならば
      const num = arr[0].trim();            // 最初の部分を数値として取得
      total += Number(num) * units[unit];   // 数値に変換して単位を掛ける
      str = arr[1];                         // 残りの部分を次の処理に渡す
    }
  }
  return total;
}

init();
