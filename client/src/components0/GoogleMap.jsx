import React, { useEffect, useRef } from 'react';

function MapComponent({ lat, lng }) {
    const called = useRef(false);
    useEffect(() => {
        if (called.current) return;
        called.current = true;
        // ここまで、開発時に2回レンダリングされるのを防ぐためのフラグ

        const mapRef = useRef(null);
        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat, lng },
            zoom: 14,
        });
  }, [lat, lng]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
}

export default MapComponent;
