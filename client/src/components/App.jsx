import { useState, useEffect, useRef } from "react"
import axios from 'axios';
import Title from "./Title"
import Game from "./Game";
import Result from "./Result";

function App() {
  const [scene, setScene] = useState("title");
  const [gameMode, setGameMode] = useState("");
  const [allStations, setAllStations] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);

  // 開発時に2回レンダリングされるのを防ぐ
  const called = useRef(false);

  // APIからデータを取得する関数
  const fetchData = async () => {
    try {
      const res = await axios.post("/api/startGame", null, { withCredentials: true });
      setAllStations(res.data.allStations);
      setAllItems(res.data.allItems);
      console.log("クイズデータ取得完了");
    } catch (err) {
      console.error("データ取得エラー:", err);
    }
  };

  // App 呼び出し時に自動で API データ取得（ガード付き）
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    fetchData();
  }, []); // 空依存配列でマウント時のみ実行

  const handleComplete = () => setScene("result");
  const returnTitle = () => setScene("title");
  const goToTitle = () => setScene("title");

  const gameProps = {
    allStations,
    allItems,
    score,
    setScore,
    results,
    setResults,
    returnTitle,
    gameMode,
    handleComplete,
  };

  const startGameMode = (mode) => {
    setGameMode(mode);
    setScore(0);
    setResults([]);
    setScene("game");
  };

  if (scene === "title") return <Title startGameMode={startGameMode} />;
  if (scene === "game") return <Game gameProps={gameProps} />;
  if (scene === "result") return <Result score={score} results={results} goToTitle={goToTitle} />;
}

export default App;
