import { useState, useEffect, useRef } from "react"
import axios from 'axios';
import Title from "./Title"
import Game from "./Game";
// import Result from "./Result";

function App() {
  // 開発時に2回レンダリングされるのを防ぐ
  const called = useRef(false);

  const [view, setView] = useState("title");
  const [isFinished, setIsFinished] = useState(false);

  // viewが"title"になったときにresetGameを発動
  useEffect(() => {
    if (view === "title") {
      resetGame();
    }
  }, [view]);

  const resetGame = async () => {
    try {
      const res = await axios.post("/api/reset", null, { withCredentials: true });
      setIsFinished(false);
      console.log("ゲームリセット完了");
    } catch (err) {
      console.error("ゲームリセットエラー:", err);
    }
  };

  const getQuestion = async () => {
    try {
      const res = await axios.post("/api/getQuestion", null, { withCredentials: true });
      console.log("クイズ取得完了:", res.data);
      // クイズデータを状態に保存するなどの処理をここで行う
    }
    catch (err) {
      console.error("クイズ取得エラー:", err);
    }
  };

  if (view === "title") {
    return <Title setView={setView} />
  };
  if (view === "game") return <Game view={view} setView={setView}/>;
  // if (view === "result") return <Result setView={setView}/>;

}

export default App;
