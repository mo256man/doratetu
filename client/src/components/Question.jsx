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
    <div id={id} className="content-div">
      <div className="content-area">
        {contentDiv}
      </div>
      <div className={`shutter${isOpen ? " open" : ""}`}
          onClick={disabled ? undefined : onOpen}
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
          <img
            className="open-label"
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

function Question({ correctLatlng, correctItems, hintOpen, onShowHint, disabled = false }) {
  const called = useRef(false);
  useEffect(() => {
      if (called.current) return;
      called.current = true;
      // ここまで、開発時に2回レンダリングされるのを防ぐためのフラグ
  }, []);

  const [open, setOpen] = useState(() => [false, false, false]);
  const [latlng, setLatlng] = useState(correctLatlng);
  const ready = useGoogleMaps(GOOGLE_MAPS_API_KEY);

  const mapRef = useRef(null);
  const stViewRef = useRef(null);
  const mapObj = useRef(null);
  const stViewObj = useRef(null);

  useEffect(() => {
    if (!ready || !open[0] || !mapRef.current) return;
    if (!mapObj.current) {
      mapObj.current = new window.google.maps.Map(mapRef.current, {
        center: latlng,
        zoom: 16,
        disableDefaultUI: false,
      });
      mapObj.current.addListener("click", (e) => {
        const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setLatlng(latLng);
      });
    }
    mapObj.current.setCenter(latlng);
  }, [ready, open[0], latlng]);

  useEffect(() => {
    if (!ready || !open[2] || !stViewRef.current) return;
    if (!stViewObj.current) {
      stViewObj.current = new window.google.maps.StreetViewPanorama(stViewRef.current, {
        position: latlng,
        pov: { heading: 0, pitch: 0 },
        disableDefaultUI: false,
      });
      stViewObj.current.addListener("position_changed", () => {
        const pos = stViewObj.current.getPosition();
        if (pos) {
          const newLatLng = { lat: pos.lat(), lng: pos.lng() };
          setLatlng(prev => {
            if (prev.lat !== newLatLng.lat || prev.lng !== newLatLng.lng) {
              return newLatLng;
            }
            return prev;
          });
        }
      });
    }
    stViewObj.current.setPosition(latlng);
  }, [ready, open[2], latlng]);

  useEffect(() => {
    if (open[0] && mapObj.current) mapObj.current.setCenter(latlng);
    if (open[2] && stViewObj.current) stViewObj.current.setPosition(latlng);
  }, [latlng, open[0], open[2]]);

  useEffect(() => {
    setOpen(hintOpen);
  }, [hintOpen]);

  const handleOpen = idx => {
    if (open[idx]) return; // すでに開いているなら何もしない
    setOpen(prev => prev.map((v, i) => (i === idx ? true : v)));
    if (onShowHint) onShowHint(idx);
  };

  const rows = [];
  console.log(correctItems);
  console.log(typeof correctItems);
  console.log("isArray:", Array.isArray(correctItems));

  for (const row of correctItems) {
    const cells = <><td className="item">{row[0]}</td><td className="kanji">{row[1]}</td></>;
    rows.push(<tr>{cells}</tr>);
  }

  const tableItems = <><table className="items"><tbody>{rows}</tbody></table></>
  console.log(tableItems);

  return (
    <div id="question" style={{ display: "flex", flexDirection: "row", gap: 12 }}>
      <ContentDiv
        disabled={disabled}
        openImgSrc="./dice_dr.png"
        id="map_container"
        contentDiv={
          <>
          <div ref={mapRef} className="map_inner" />
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
        openImgSrc="./dice_tetu.png"
        id="bukken_container"
        contentDiv={<><div className="bukken_inner">{tableItems}</div></>}
        isOpen={open[1]}
        onOpen={() => handleOpen(1)}
      >
      </ContentDiv>
      <ContentDiv
        disabled={disabled}
        openImgSrc="./dice_guessr.png"
        id="stview_container"
        contentDiv={ready && <div ref={stViewRef} className="stview_inner" />}
        isOpen={open[2]}
        onOpen={() => handleOpen(2)}
      >
      </ContentDiv>
    </div>
  );
}

export default Question;
