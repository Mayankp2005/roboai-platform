import React from 'react';

export const Battery9VSVG: React.FC = () => {
    return (
        <svg width="100" height="60" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bodyGrad9v" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e69c5e" />
                    <stop offset="50%" stopColor="#d97736" />
                    <stop offset="100%" stopColor="#c56121" />
                </linearGradient>
                <linearGradient id="darkGrad9v" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#444" />
                    <stop offset="50%" stopColor="#333" />
                    <stop offset="100%" stopColor="#222" />
                </linearGradient>
                <linearGradient id="pinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#bbb" />
                    <stop offset="50%" stopColor="#e0e0e0" />
                    <stop offset="100%" stopColor="#888" />
                </linearGradient>
                <filter id="shadow9v" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
                </filter>
            </defs>

            {/* Pins */}
            <g transform="translate(4, 11)">
                <rect x="0" y="0" width="8" height="14" rx="2" fill="url(#pinGrad)" />
                <rect x="-3" y="3" width="5" height="2" fill="#c00" />
                <rect x="-3" y="9" width="5" height="2" fill="#c00" />
            </g>
            <g transform="translate(4, 35)">
                <rect x="0" y="0" width="8" height="14" rx="2" fill="url(#pinGrad)" />
                <circle cx="4" cy="7" r="4" fill="#666" />
                <rect x="-3" y="3" width="5" height="2" fill="#222" />
                <rect x="-3" y="9" width="5" height="2" fill="#222" />
            </g>

            {/* Main Body */}
            <g filter="url(#shadow9v)">
                <rect x="12" y="5" width="83" height="50" rx="4" fill="url(#bodyGrad9v)" />
                <rect x="35" y="5" width="60" height="50" rx="4" fill="url(#darkGrad9v)" />
                {/* Highlights */}
                <rect x="12" y="5" width="83" height="2" fill="#fff" opacity="0.3" />
                <rect x="12" y="53" width="83" height="2" fill="#000" opacity="0.3" />
            </g>
            
            {/* Text and Labels */}
            <text x="65" y="37" fill="#fff" fontSize="22" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="middle" transform="rotate(90 65 30)">9V</text>
            <text x="26" y="23" fill="#fff" fontSize="16" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="middle">+</text>
            <text x="26" y="46" fill="#fff" fontSize="16" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="middle">-</text>
            
            {/* Outline overlay */}
            <rect x="12" y="5" width="83" height="50" rx="4" fill="none" stroke="#222" strokeWidth="1.5" />
        </svg>
    );
};
