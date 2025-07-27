import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import '../styles.css';

function Bukken({items}) {
    const called = useRef(false);

    useEffect(() => {
        if (called.current) return;
        called.current = true;
        // ここまで、開発時に2回レンダリングされるのを防ぐためのフラグ

    }, []);

    return (
        <div>
            <table className="itemTable">
                <tbody>
                    {items.map((row, i) => (
                    <tr key={i}>
                        <td>{row[0]}</td>
                        <td>{row[1]}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Bukken;