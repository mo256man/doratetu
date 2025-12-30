const cors = require("cors");
const express = require("express");
const session = require("express-session");
const axios = require("axios");
const path = require("path");
const app  = express();
const PORT = 3001;
const deployID = "AKfycbyxz_J9LUQ1-YBW9rzcQ6L1Y68XFWa8t811DR76RPpuE3ZrUJ1L2iXFbNlkI0U9mNhQNg";
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

  // 物件について、漢字での金額から数値を取得し辞書に追加する
  for (const item of ALL_ITEMS) {
    item.money = kanjiToNumber(item.kanji);
  }

  // 駅について、物件の金額の計を辞書に追加する
  for (const station of ALL_STATIONS) {
    const name = station.name;
    const relatedItems = ALL_ITEMS.filter(item => item.station === name);
    let totalMoney = 0;
    for (const item of relatedItems) {
      totalMoney += item.money;
    }
    station.money = totalMoney;
  }
  console.log("元データ取得完了");
}

app.post("/api/startGame", (req, res) => {
  res.status(200).json({
    allStations: ALL_STATIONS,
    allItems: ALL_ITEMS
  });
});


// クイズを生成してセッションに保存する（1問分）
app.post("/api/generateQuiz", (req, res) => {
  // 追加の呼び出しで次問を生成する（startQuiz で初期化されている想定）
  if (!req.session.usedStations) req.session.usedStations = [];
  if (!req.session.totalQuestions) req.session.totalQuestions = 7;
  if (typeof req.session.currentQuestionNumber !== 'number') req.session.currentQuestionNumber = 0;

  // 既にすべて出題済みなら400
  if (req.session.currentQuestionNumber >= req.session.totalQuestions) {
    return res.status(400).json({ error: 'All questions generated' });
  }

  const usedStations = req.session.usedStations;
  const questionChoices = [];
  const stationsPool = ALL_STATIONS.slice();

  while (questionChoices.length < 6 && stationsPool.length > 0) {
    const idx = Math.floor(Math.random() * stationsPool.length);
    const station = stationsPool[idx];
    if (!usedStations.includes(station.name)) {
      questionChoices.push(station);
      usedStations.push(station.name);
    }
    stationsPool.splice(idx, 1);
  }

  while (questionChoices.length < 6) {
    const idx = Math.floor(Math.random() * ALL_STATIONS.length);
    const station = ALL_STATIONS[idx];
    questionChoices.push(station);
  }

  const correctIndex = Math.floor(Math.random() * 6);
  const correctStation = questionChoices[correctIndex];
  const relatedItems = ALL_ITEMS.filter(item => item.station === correctStation.name);

  // セッションに現在の問題を保存（内部で正解インデックスを保持）
  req.session.currentQuiz = {
    questionChoices: questionChoices.map(s => s.name),
    correctIndex,
    correctStation,
    relatedItems,
  };

  // 問題番号をインクリメント（1始まりで返す）
  req.session.currentQuestionNumber = (req.session.currentQuestionNumber || 0) + 1;

  res.status(200).json({
    questionChoices: req.session.currentQuiz.questionChoices,
    correctStation: {
      name: correctStation.name,
      lat: correctStation.lat,
      lng: correctStation.lng,
      heading: correctStation.heading || 0,
      pitch: correctStation.pitch || 0,
      money: correctStation.money || 0,
    },
    relatedItems: req.session.currentQuiz.relatedItems,
    questionNumber: req.session.currentQuestionNumber,
    totalQuestions: req.session.totalQuestions,
  });
});


// クイズ開始：セッション初期化して第1問を返す
app.post('/api/startQuiz', (req, res) => {
  req.session.usedStations = [];
  req.session.currentQuestionNumber = 0;
  req.session.totalQuestions = 7; // 全7問
  req.session.score = 0;
  // delegate to generateQuiz logic by calling same generation code path
  // We'll reuse the /api/generateQuiz logic by invoking it programmatically
  // For simplicity, replicate generation here (avoid coupling)

  const usedStations = req.session.usedStations;
  const questionChoices = [];
  const stationsPool = ALL_STATIONS.slice();

  while (questionChoices.length < 6 && stationsPool.length > 0) {
    const idx = Math.floor(Math.random() * stationsPool.length);
    const station = stationsPool[idx];
    if (!usedStations.includes(station.name)) {
      questionChoices.push(station);
      usedStations.push(station.name);
    }
    stationsPool.splice(idx, 1);
  }
  while (questionChoices.length < 6) {
    const idx = Math.floor(Math.random() * ALL_STATIONS.length);
    const station = ALL_STATIONS[idx];
    questionChoices.push(station);
  }
  const correctIndex = Math.floor(Math.random() * 6);
  const correctStation = questionChoices[correctIndex];
  const relatedItems = ALL_ITEMS.filter(item => item.station === correctStation.name);
  req.session.currentQuiz = {
    questionChoices: questionChoices.map(s => s.name),
    correctIndex,
    correctStation,
    relatedItems,
  };
  req.session.currentQuestionNumber = 1;

  res.status(200).json({
    questionChoices: req.session.currentQuiz.questionChoices,
    correctStation: {
      name: correctStation.name,
      lat: correctStation.lat,
      lng: correctStation.lng,
      heading: correctStation.heading || 0,
      pitch: correctStation.pitch || 0,
      money: correctStation.money || 0,
    },
    relatedItems: req.session.currentQuiz.relatedItems,
    questionNumber: req.session.currentQuestionNumber,
    totalQuestions: req.session.totalQuestions,
    totalScore: req.session.score,
  });
});


// 回答を受け取り判定する
app.post("/api/checkAnswer", (req, res) => {
  const { selectedIndex, bonus } = req.body;
  const quiz = req.session.currentQuiz;
  if (!quiz) {
    return res.status(400).json({ error: "No quiz in session" });
  }

  const correct = Number(selectedIndex) === Number(quiz.correctIndex);

  // ヒント倍率（クライアントと同じ配列で扱う）
  const bouns_multiplier = [1, 0.6, 0.3];
  const bIdx = Math.max(0, Math.min(2, Number(bonus) || 0));
  const mult = bouns_multiplier[bIdx] || 1;

  const correctMoney = (quiz.relatedItems || []).reduce((acc, it) => acc + (it.money || 0), 0);
  const getScore = correct ? Math.round(correctMoney * mult) : 0;

  // セッションのスコアを更新
  if (typeof req.session.score !== 'number') req.session.score = 0;
  req.session.score += getScore;

  const payload = {
    correct,
    correctStation: {
      name: quiz.correctStation.name,
      lat: quiz.correctStation.lat,
      lng: quiz.correctStation.lng,
      heading: quiz.correctStation.heading || 0,
      pitch: quiz.correctStation.pitch || 0,
      money: quiz.correctStation.money || 0,
    },
    relatedItems: quiz.relatedItems,
    getScore,
    totalScore: req.session.score,
    questionNumber: req.session.currentQuestionNumber || 0,
    totalQuestions: req.session.totalQuestions || 7,
  };

  // 現在の問題は消す（次問は generateQuiz を呼ぶ）
  delete req.session.currentQuiz;

  res.status(200).json(payload);
});


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

init();
