import React from 'react';

export interface MultimeterProps {
    value?: string | number;
    mode?: 'V' | 'A' | 'R';
    onModeChange?: () => void;
}

export const MultimeterSVG: React.FC<MultimeterProps> = ({ value, mode = 'A', onModeChange }) => {
    const displayValue = value !== undefined ? Number(value).toFixed(1) : '0.0';
    const unit = mode === 'V' ? 'V' : mode === 'A' ? 'mA' : 'Ω';
    const displayString = `${displayValue} ${unit}`;
    
    const dialRotations = {
        'V': -45,
        'A': 0,
        'R': 45
    };
    const rotation = dialRotations[mode] || 0;

    return (
        <svg width="100" height="70" viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
            {/* Probes connection points (bottom) */}
            <rect x="30" y="45" width="8" height="15" fill="#333" />
            <polygon points="34,60 30,70 38,70" fill="black" /> {/* COM */}

            <rect x="62" y="45" width="8" height="15" fill="#333" />
            <polygon points="66,60 62,70 70,70" fill="#ef4444" /> {/* V/A */}

            {/* Main yellow body */}
            <rect x="5" y="5" width="90" height="45" rx="4" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            
            {/* Screen */}
            <rect x="12" y="12" width="60" height="30" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
            <text x="68" y="32" fill="#334155" fontSize={displayString.length > 6 ? 11 : 14} fontFamily="monospace" textAnchor="end" fontWeight="bold">
                {displayString}
            </text>

            {/* Dial */}
            <g 
                onClick={(e) => { e.stopPropagation(); onModeChange && onModeChange(); }} 
                style={{ cursor: 'pointer' }}
                transform-origin="82 27"
            >
                <circle cx="82" cy="27" r="10" fill="transparent" /> {/* Hit area */}
                <circle cx="82" cy="27" r="8" fill="#334155" />
                <circle cx="82" cy="27" r="2" fill="#eab308" />
                <path 
                    d="M 82 27 L 82 20" 
                    stroke="#eab308" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    transform={`rotate(${rotation} 82 27)`}
                    style={{ transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                
                {/* Labels */}
                <text x="73" y="20" fill="#fff" fontSize="5" fontWeight="bold">V</text>
                <text x="80.5" y="16" fill="#fff" fontSize="5" fontWeight="bold">A</text>
                <text x="88" y="20" fill="#fff" fontSize="5" fontWeight="bold">Ω</text>
            </g>
        </svg>
    );
};
