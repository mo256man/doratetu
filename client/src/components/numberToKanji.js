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
export default numberToKanji;
