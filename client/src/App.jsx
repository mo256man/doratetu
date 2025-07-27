import React, { useState } from "react";
import axios from 'axios';
import Title from "./components/Title";
import Game from "./components/Game";

function App() {
  const [scene, setScene] = useState("title");
  const [quizData, setQuizData] = useState(null);

  const startGame = async () => {
    try {
      const res = await axios.post("/api/startGame", { method: "POST" }, { withCredentials: true });
      setQuizData(res.data.quizData);
      console.log("クイズデータ取得完了");
    } catch (err) {
      console.error("ゲームスタートエラー:", err);
    }
    setScene("game");

  };

  const goToTitle = () => setScene("title");
  return (
    <>
      {scene === "title" && <Title onStart={startGame} />}
      {scene === "game" && (
        <Game
          quizData={quizData}
          goToTitle={goToTitle}
        />
      )}
    </>
  );
}

export default App;