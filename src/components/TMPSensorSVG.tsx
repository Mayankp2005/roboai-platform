import React from 'react';

export const TMPSensorSVG: React.FC = () => {
    return (
        <svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
            {/* Pins */}
            <path d="M 15 40 L 15 60" fill="none" stroke="#9ca3af" strokeWidth="3" strokeLinejoin="round" />
            <path d="M 25 40 L 25 60" fill="none" stroke="#9ca3af" strokeWidth="3" />
            <path d="M 35 40 L 35 60" fill="none" stroke="#9ca3af" strokeWidth="3" strokeLinejoin="round" />
            
            {/* Body Back */}
            <path d="M 5 20 A 20 20 0 0 1 45 20 L 45 40 L 5 40 Z" fill="#374151" />
            {/* Body Front Flat face */}
            <path d="M 8 22 A 17 17 0 0 1 42 22 L 42 40 L 8 40 Z" fill="#4b5563" />
            
            {/* Text */}
            <text x="25" y="34" fill="#f9fafb" fontSize="12" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">TMP</text>
        </svg>
    );
};
