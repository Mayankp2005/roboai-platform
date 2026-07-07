import React from 'react';

export const BatteryCoinSVG: React.FC = () => {
    return (
        <svg width="60" height="70" viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="holderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#555" />
                    <stop offset="100%" stopColor="#222" />
                </linearGradient>
                <linearGradient id="batteryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fff" />
                    <stop offset="50%" stopColor="#e0e0e0" />
                    <stop offset="100%" stopColor="#aaa" />
                </linearGradient>
                <filter id="shadowCoin" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
                </filter>
            </defs>

            {/* Pins */}
            <g>
                {/* Top Pin (VCC) */}
                <rect x="27" y="2" width="6" height="8" fill="#aaa" />
                <path d="M 27 0 L 33 0 L 30 -4 Z" fill="#c00" />
                
                {/* Bottom Pin (GND) */}
                <rect x="27" y="60" width="6" height="8" fill="#aaa" />
                <path d="M 27 70 L 33 70 L 30 74 Z" fill="#222" />
            </g>

            <g filter="url(#shadowCoin)">
                {/* Outer Holder */}
                <circle cx="30" cy="35" r="26" fill="url(#holderGrad)" stroke="#111" strokeWidth="2" />
                
                {/* Notches / Grip details on holder */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <rect key={i} x="28" y="7" width="4" height="4" fill="#111" transform={`rotate(${angle} 30 35)`} />
                ))}

                {/* Inner Battery */}
                <circle cx="30" cy="35" r="21" fill="url(#batteryGrad)" stroke="#999" strokeWidth="1" />
                <circle cx="30" cy="35" r="19" fill="none" stroke="#ddd" strokeWidth="1" />
            </g>
            
            {/* Text */}
            <text x="30" y="26" fill="#444" fontSize="16" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="middle">+</text>
            <text x="30" y="36" fill="#666" fontSize="5" fontFamily="Arial, sans-serif" letterSpacing="0.5" textAnchor="middle">COIN BATTERY</text>
            <text x="30" y="44" fill="#666" fontSize="6" fontFamily="Arial, sans-serif" letterSpacing="0.5" textAnchor="middle">CR 2032</text>
            <text x="30" y="52" fill="#666" fontSize="5" fontFamily="Arial, sans-serif" letterSpacing="0.5" textAnchor="middle">3.0V</text>
        </svg>
    );
};
