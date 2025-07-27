import React, { useRef, useEffect } from 'react';
import '../styles.css';

const API_KEY = "AIzaSyCqAJnZ7H3ZLuBJD-GKBuHYikJPcsbf68E";

function MapWithStreetView({ latlng }) {
    const called = useRef(false);
    const mapRef = useRef(null);
    const streetViewRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (called.current) return;
        called.current = true;

        window.initMapWithStreetView = () => {
            // --- Google Map初期化 ---
            const map = new window.google.maps.Map(mapRef.current, {
                center: latlng,
                zoom: 16
            });

            // --- マーカー初期化 ---
            const marker = new window.google.maps.Marker({
                position: latlng,
                map,
                draggable: true
            });
            markerRef.current = marker;

            // --- ストリートビュー初期化 ---
            const streetView = new window.google.maps.StreetViewPanorama(streetViewRef.current, {
                position: latlng,
                pov: { heading: 0, pitch: 0, zoom: 0 }
            });

            // 地図とストリートビューを同期
            map.setStreetView(streetView);

            // マーカーを動かすとストリートビューも移動
            marker.addListener('dragend', function(event) {
                const pos = event.latLng;
                map.panTo(pos);
                streetView.setPosition(pos);
            });

            // 地図クリックでマーカー＆ストリートビュー移動
            map.addListener('click', function(event) {
                marker.setPosition(event.latLng);
                map.panTo(event.latLng);
                streetView.setPosition(event.latLng);
            });

            // ストリートビューで移動したときマーカーも追従
            streetView.addListener('position_changed', function() {
                const pos = streetView.getPosition();
                marker.setPosition(pos);
                map.panTo(pos);
            });
        };

        // Google Maps APIを一回だけ読み込み
        if (!document.querySelector('#google-maps-script')) {
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.async = true;
            script.defer = true;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMapWithStreetView`;
            document.head.appendChild(script);
        } else {
            if (window.google && window.google.maps && window.initMapWithStreetView) {
                window.initMapWithStreetView();
            }
        }
    }, []);

    return (
        <div style={{ display: 'flex', gap: '2vw' }}>
            <div className="dragon_radar">
                <div className="shutter" id="shutter">
                    <div className="open-label" id="openLabel">
                        <img src="dice_dr.png" alt="dice" />
                    </div>
                </div>
                <div className="googleMap" ref={mapRef}></div>
                <div className="radar">
                    <div className="radar_mesh"></div>
                    <div className="radar_scanner"></div>
                    <div className="radar_case"></div>
                </div>
            </div>
            <div className="street_view_container">
                <div className="street_view" ref={streetViewRef} style={{ width: '400px', height: '300px', background: '#eee' }}></div>
            </div>
        </div>
    );
}

export default MapWithStreetView;