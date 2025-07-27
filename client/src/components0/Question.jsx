import React, { useRef, useEffect } from 'react';
import '../styles.css';

const API_KEY = "AIzaSyCqAJnZ7H3ZLuBJD-GKBuHYikJPcsbf68E";

function Question({ latlng, items, diceIndex }) {
    const called = useRef(false);
    const mapRef = useRef(null);
    const streetViewRef = useRef(null);

    useEffect(() => {
        if (called.current) return;
        called.current = true;

        let map, marker, streetView;
        const initialLatLng = latlng;

        function syncLocation(latLng) {
            if (marker) marker.setPosition(latLng);
            if (map) map.panTo(latLng);
            if (streetView) streetView.setPosition(latLng);
        }

        window.initMapWithStreetView = () => {
            if (!streetViewRef.current) {
                console.error('streetViewRef is null');
                return;
            }
            map = new window.google.maps.Map(mapRef.current, {
                center: initialLatLng,
                zoom: 16
            });

            marker = new window.google.maps.Marker({
                position: initialLatLng,
                map,
                draggable: true
            });

            streetView = new window.google.maps.StreetViewPanorama(streetViewRef.current, {
                position: initialLatLng,
                pov: { heading: 0, pitch: 0, zoom: 0 }
            });

            marker.addListener('dragend', (event) => {
                const latLng = event.latLng;
                syncLocation(latLng);
            });

            map.addListener('click', (event) => {
                syncLocation(event.latLng);
            });

            streetView.addListener('position_changed', () => {
                const latLng = streetView.getPosition();
                syncLocation(latLng);
            });

            map.setStreetView(streetView);
        };

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
    }, [latlng]);

    console.log(diceIndex);
    const dr_visible = (diceIndex === 0 || diceIndex === 1) ? "hidden" : "hidden";
    const tetu_visible = (diceIndex === 2 || diceIndex === 3) ? "hidden" : "hidden";
    const guessr_visible = (diceIndex === 4 || diceIndex === 5) ? "hidden" : "hidden";

    return (
        <div id="question">
            <div className="dragon_radar_container">
                <div className="shutter" id="shutter_dr" style={{ visibility: dr_visible }}>
                    <div className="open-label" id="open_dr"><img src="dice_dr.png" /></div>
                </div>
                <div className="googleMap" id="map" ref={mapRef}></div>
                <div className="radar">
                    <div className="radar_mesh"></div>
                    <div className="radar_scanner"></div>
                    <div className="radar_case"></div>
                </div>
            </div>
            <div className="street_view_container">
                <div className="shutter" id="shutter_guessr" style={{ visibility: guessr_visible }}>
                    <div className="open-label" id="open_guessr"><img src="dice_guessr.png" /></div>
                </div>
                <div className="street_view" ref={streetViewRef}></div>
            </div>
        </div>
    );
}

export default Question;
