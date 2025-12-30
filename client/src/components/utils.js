// msミリ秒休む
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// // 漢字の金額を数値にする関数
// export function kanjiToNumber(kanji) {
//   let str = kanji.replace("円", "");              // 円を削除
//   const units = { "兆": 1e12, "億": 1e8, "万": 1e4, "一":1 };
//   let total = 0;
//   for (const unit of ["兆", "億", "万", "一"]) {
//     const arr = str.split(unit);            // 単位で分割
//     if (arr.length > 1) {                   // 単位が存在して分割できたならば
//       const num = arr[0].trim();            // 最初の部分を数値として取得
//       total += Number(num) * units[unit];   // 数値に変換して単位を掛ける
//       str = arr[1];                         // 残りの部分を次の処理に渡す
//     }
//   }
//   return total;
// }

export function numberToKanji(num) {
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