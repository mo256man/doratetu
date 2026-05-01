import React, { useState, useRef, useEffect } from "react";

function useGoogleMaps(apiKey) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.google && window.google.maps) {
      setReady(true);
      return;
    }
    const scriptId = "google-maps-js";
    if (document.getElementById(scriptId)) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [apiKey]);
  return ready;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyCqAJnZ7H3ZLuBJD-GKBuHYikJPcsbf68E";

function ContentDiv({ disabled, openImgSrc, id, isOpen, onOpen, contentDiv }) {
  return (
    <div id={id} className="question">
      <div>
        {contentDiv}
      </div>
      <div className={`shutter${isOpen ? " open" : ""}`}
          onClick={disabled ? undefined : onOpen}
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
          <img
            className="shutter-label"
            src={openImgSrc}
            style={{
              opacity: disabled ? 0.5 : 1,
            }}
            draggable={false}
            alt=""
          />
      </div>
    </div>
  );
}

// function Question({ correctLatlng, correctItems, hintOpen, onShowHint, disabled = false }) {
// function Question({ correctData, correctItems, correctStation, hintOpen, onShowHint, disabled = false }) {
function Question({ questionProps }) {
  const called = useRef(false);
  useEffect(() => {
      if (called.current) return;
      called.current = true;
      // ここまで、開発時に2回レンダリングされるのを防ぐためのフラグ
      console.log("Question props:", questionProps);
  }, [questionProps]);

  let {
      correctData,
      correctItems,
      correctStation,
      hintOpen,
      setHintOpen,
      disabled,
  } = questionProps || {};

  // デフォルト値の設定
  hintOpen = hintOpen ?? [false, false, false];
  disabled = disabled ?? false;
  correctItems = correctItems || [];
  correctData = correctData || {};
  const mapRef = useRef(null);
  const stViewRef = useRef(null);
  const mapObj = useRef(null);
  const stViewObj = useRef(null);
  const [open, setOpen] = useState([false, false, false]);  // ヒントの初期状態：全閉

  console.log(hintOpen);

  // 初期状態は全て閉じていて、親から渡された hintOpen に応じて自動で開く
  React.useEffect(() => {
    setOpen(prev => prev.map((v, i) => v || hintOpen[i]));
  }, [hintOpen]);

  // クリックしたらシャッターが開く
  const handleOpen = idx => {
    if (open[idx]) return;         // すでに開いているなら何もしない
    setOpen(prev => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
    // 親の hintOpen 状態も更新
    if (typeof setHintOpen === 'function') {
      setHintOpen(prev => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
    }
  };

  // マップ
  const mapContent = () => {
    const lat = correctData.lat;
    const lng = correctData.lng;
    const latlng = {lat: lat, lng: lng};
    // console.log("latlng", latlng);
    return (<>
        {lat} {lng}
    </>);
  }

  // 物件
  console.log("correctItems:", correctItems);
  const itemsContent = (
    <table className="frame items">
      <tbody>
        {correctItems.map((object, index) =>
          <tr key={index}><td className="item">{object.item}</td><td className="kanji">{object.kanji}</td></tr>
        )}
      </tbody>
    </table>
  );

  // ストリートビュー
  const stviewContent = () => {
    const pitch = correctData.pitch;
    const heading = correctData.heading;
    return (<>
        {pitch} {heading}
    </>);
  }

  const Div = (content) =>
    <div className="question">{content}</div>

  return (
    <div className="questions">
      <ContentDiv
        disabled={disabled}
        openImgSrc="./trans_dr.png"
        id="map_container"
        contentDiv={
          <>
          <div ref={mapRef} className="map-inner" />
          <div className="radar">
            <div className="radar_scanner"></div>
            <div className="radar_grid"></div>
            <div className="radar_case"></div>
          </div>
          </>
        }
        isOpen={open[0]}
        onOpen={() => handleOpen(0)}
      >
      </ContentDiv>
      <ContentDiv
        disabled={disabled}
        openImgSrc="./trans_tetu.png"
        id="bukken_container"
        contentDiv={<><div className="bukken-inner">{itemsContent}</div></>}
        isOpen={open[1]}
        onOpen={() => handleOpen(1)}
      >
      </ContentDiv>
      <ContentDiv
        disabled={disabled}
        openImgSrc="./trans_guessr.png"
        id="stview_container"
        contentDiv={true &&
          <div className="stview-inner">
            <div ref={stViewRef} className="stview-inner" />
            <div className="prefecture">{correctStation["ken"]}</div>
          </div>}
        isOpen={open[2]}
        onOpen={() => handleOpen(2)}
      >
      </ContentDiv>
    </div>
  );
}

export default Question;
