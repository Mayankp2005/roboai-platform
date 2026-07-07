import React from 'react';

export const BatteryAASVG: React.FC = () => {
    return (
        <svg width="30" height="90" viewBox="0 0 30 90" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="holderGradAA" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#222" />
                    <stop offset="50%" stopColor="#3a3a3a" />
                    <stop offset="100%" stopColor="#111" />
                </linearGradient>
                <linearGradient id="cyanGradAA" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#088c8c" />
                    <stop offset="25%" stopColor="#0bc2c2" />
                    <stop offset="75%" stopColor="#0bc2c2" />
                    <stop offset="100%" stopColor="#077" />
                </linearGradient>
                <linearGradient id="greyGradAA" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#444" />
                    <stop offset="25%" stopColor="#666" />
                    <stop offset="75%" stopColor="#666" />
                    <stop offset="100%" stopColor="#333" />
                </linearGradient>
                <filter id="shadowAA" x="-20%" y="-10%" width="140%" height="120%">
                  <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
                </filter>
            </defs>

            {/* Pins */}
            <rect x="12" y="2" width="6" height="4" fill="#999" />
            <path d="M 12 0 L 18 0 L 15 -4 Z" fill="#c00" />

            <rect x="12" y="84" width="6" height="4" fill="#999" />
            <path d="M 12 90 L 18 90 L 15 94 Z" fill="#222" />

            {/* Main Holder Body */}
            <g filter="url(#shadowAA)">
                <rect x="2" y="5" width="26" height="80" rx="3" fill="url(#holderGradAA)" stroke="#111" strokeWidth="1.5" />
                
                {/* Battery Insert */}
                <rect x="4" y="8" width="22" height="74" rx="2" fill="url(#greyGradAA)" />
                <rect x="4" y="8" width="22" height="30" rx="2" fill="url(#cyanGradAA)" />
                
                {/* Battery Cap Detail */}
                <rect x="10" y="6" width="10" height="2" fill="#aaa" />
                <rect x="8" y="80" width="14" height="2" fill="#aaa" />
            </g>

            {/* Text Labels */}
            <text x="15" y="22" fill="#fff" fontSize="14" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="middle">+</text>
            <text x="15" y="55" fill="#fff" fontSize="9" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="1" textAnchor="middle" transform="rotate(-90 15 50)">AA 1.5V</text>
            <text x="15" y="78" fill="#fff" fontSize="14" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="middle">-</text>
        </svg>
    );
};
