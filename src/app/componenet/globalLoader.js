// components/GlobalLoader.js
import React from 'react';
import { RingLoader } from 'react-spinners';

const GlobalLoader = ({ visible }) => {
    if (!visible) return null;

    return (
        <div className="preloader show" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050,
            backgroundColor: 'rgba(255,255,255,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <RingLoader color="#0b60d1" size={100} speedMultiplier={1.2} />
        </div>
    );
};

export default GlobalLoader;
