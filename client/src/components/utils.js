// リセット関数
export const reset = async () => {
  try {
    await axios.post("/api/reset", null, { withCredentials: true });
  } catch (err) {
    console.error("リセットエラー:", err);
  }
}
// スコアとクイズカウントをまとめて取得する関数
export const getStatus = async () => {
  try {
    const res = await axios.post("/api/getStatus", null, { withCredentials: true });
    if (res.data && typeof res.data.score !== 'undefined' && typeof res.data.quizCnt !== 'undefined') {
      return { score: res.data.score, quizCnt: res.data.quizCnt };
    }
    return null;
  } catch (err) {
    console.error("状態取得エラー:", err);
    return null;
  }
}
import { useState, useEffect } from "react";
import axios from "axios";

// スコアを取得する非同期関数
export const getScore = async () => {
  try {
    const res = await axios.post("/api/getScoreKanji", null, { withCredentials: true });
    return res.data.score;
  } catch (err) {
    console.error("スコア取得エラー:", err);
    return null;
  }
}

// クイズの問題数を取得する非同期関数
export const getQuizCnt = async () => {
  try {
    const res = await axios.post("/api/getQuizCount", null, { withCredentials: true });
    return res.data.quizCnt;
  } catch (err) {
    console.error("クイズ問題数取得エラー:", err);
    return null;
  }
}

// クイズ問題を取得する関数（options, correctItemsを返す）
export const getQuestion = async () => {
  try {
    const res = await axios.post("/api/getQuestion", null, { withCredentials: true });
    if (res.data && Array.isArray(res.data.options) && Array.isArray(res.data.correctItems)) {
      return { options: res.data.options, correctItems: res.data.correctItems };
    }
    return null;
  } catch (err) {
    console.error("クイズ取得エラー:", err);
    return null;
  }
}


// msミリ秒休む
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

