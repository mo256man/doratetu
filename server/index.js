const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require("axios");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(session({
  secret: "doratetsu_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// GASから取り出す全データ（グローバル変数）
let ALL_STATIONS = [];
let ALL_ITEMS = [];

const deployID = "AKfycbyxz_J9LUQ1-YBW9rzcQ6L1Y68XFWa8t811DR76RPpuE3ZrUJ1L2iXFbNlkI0U9mNhQNg";
const GAS_URL = `https://script.google.com/macros/s/${deployID}/exec`;

async function init() {
  const payload  = {command: "getAllData"};
  const config = {
    headers: { "Content-Type": "application/json" }
  };
  const response = await axios.post(GAS_URL, payload, config);
  ALL_STATIONS = response.data.all_stations;
  ALL_ITEMS = response.data.all_items;
  console.log(ALL_STATIONS[0]);
  console.log(ALL_ITEMS[0]);
  console.log("元データ取得完了");
}

// 起動時にデータ取得
init();

// リセット
app.post("/api/reset", (req, res) => {
  req.session.score = 0;
  req.session.usedStations = [];
  req.session.quizCnt = 0;
  res.json({});
});

// クイズ作成
app.post("/api/getQuestion", (req, res) => {
  // 未使用の駅名のみ抽出
  const unusedStations = ALL_STATIONS
    .map(s => s.name)
    .filter(name => !req.session.usedStations.includes(name));

  // 7個ランダムに選ぶ（optionsは station.name の配列）
  const options = [];
  const pool = [...unusedStations];
  for (let i = 0; i < 7 && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const name = pool[idx];
    options.push(name);
    req.session.usedStations.push(name);
    pool.splice(idx, 1);
  }

  // 正答インデックス
  req.session.correctIdx = Math.floor(Math.random() * options.length);
  const correctStation = options[req.session.correctIdx];

  // 正答の駅に対応する item / kanji のみ取得
  const correctItems = ALL_ITEMS
    .filter(item => item.station === correctStation)
    .map(item => ({ item: item.item, kanji: item.kanji }));

  req.session.quizCnt += 1;

  res.json({
    options,
    correctItems,
  });
});


// スコアを返す関数
app.post("/api/getScoreKanji", (req, res) => {
  const rawScore = req.session.score;
  const scoreKanji = numberToKanji(rawScore);
  res.json({ score: scoreKanji });
});


// 何問目かを返す関数
app.post("/api/getQuizCount", (req, res) => {
  const quizCnt = req.session.quizCnt;
  res.json({ quizCnt: quizCnt });
});


// スコアとクイズカウントをまとめて返すエンドポイント
app.post("/api/getStatus", (req, res) => {
  const rawScore = req.session.score;
  const scoreKanji = numberToKanji(rawScore);
  const quizCnt = req.session.quizCnt;
  res.json({
    score: scoreKanji,
    quizCnt: quizCnt
  });
});


// 漢字の金額を数値にする関数
function kanjiToNumber(kanji) {
  let str = kanji.replace("円", "");        // 円を削除
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
  // console.log(kanji + "=>" + total);
  return total;
}

function numberToKanji(num) {
  if (num === 0) return "0円";
    const units = [
        { kanji: "兆", value: 1e12 },
        { kanji: "億", value: 1e8 },
        { kanji: "万", value: 1e4 },
    ];
  let result = "";
  for (const { kanji, value } of units) {
    if (num >= value) {
      const unitNum = Math.floor(num / value);
      result += unitNum + kanji;
      num -= unitNum * value;
    }
  }
  if (num > 0) {
    result += num;
  }
  result += "円";
  return result;
}

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});