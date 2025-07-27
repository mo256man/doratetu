import React, { useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';

function Count() {
    const called = useRef(false);
    useEffect(() => {
        if (called.current) return;
        called.current = true;
        // ここまで、開発時に2回レンダリングされるのを防ぐためのフラグ
    }, []);

    return (
        <div id="count_back">
            <div className="count_num">第</div><div className="ball ball_count">1</div><div className="count_num">問</div>
        </div>
    );
}

export default Count;