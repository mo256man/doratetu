import React from "react";

function Judge({ judge }) {
  if (!judge) return null;
  return (
    <div className="ui_container">
        {judge.result === "correct" ? "正解！" : "不正解"}
        {judge.result === "correct" && ` +${judge.point}点`}
    </div>
  );
}

export default Judge;