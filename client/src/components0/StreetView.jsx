import React, { useRef, useEffect } from 'react';
import '../styles.css';

const API_KEY = "AIzaSyCqAJnZ7H3ZLuBJD-GKBuHYikJPcsbf68E";

function StreetView({ latlng }) {
    const called = useRef(false);
    const panoramaRef = useRef(null);

    useEffect(() => {
        if (called.current) return;
        called.current = true;
        // ここまで、開発時に2回レンダリングされるのを防ぐためのフラグ

        window.initStreetView = () => {
            // ストリートビューの初期化
            new window.google.maps.StreetViewPanorama(panoramaRef.current, {
                position: latlng,
                pov: {
                    heading: 0,
                    pitch: 0
                },
                zoom: 1
            });
        };

        // Google Maps APIを一回だけ読み込み
        if (!document.querySelector('#google-maps-script')) {
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.async = true;
            script.defer = true;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initStreetView`;
            document.head.appendChild(script);
        } else {
            if (window.google && window.google.maps && window.initStreetView) {
                window.initStreetView();
            }
        }
    }, []);

    return (
        <>
            <div className="street_view" ref={panoramaRef}></div>
        </>
    );
}

export default StreetView;
