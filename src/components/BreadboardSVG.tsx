import React from 'react';

const BreadboardSVGComponent: React.FC = () => {
    const columns = Array.from({ length: 30 }, (_, i) => i);
    const rows = [0, 1, 2, 3, 4];
    const powerCols = Array.from({ length: 25 }, (_, i) => i);
    
    const dx = 10;
    const dy = 10;
    const startX = 50;
    const width = 400;
    const height = 220;

    const renderHole = (x: number, y: number, key: string) => (
        <g key={key}>
            {/* Dark inner shadow/hole */}
            <circle cx={x} cy={y} r="3" fill="#222" />
            <circle cx={x} cy={y} r="2.5" fill="#333" />
            <path d={`M ${x-2.5} ${y-1} A 2.5 2.5 0 0 1 ${x+2.5} ${y-1}`} stroke="#000" strokeWidth="1" fill="none" opacity="0.4" />
            <path d={`M ${x-2.5} ${y+1} A 2.5 2.5 0 0 0 ${x+2.5} ${y+1}`} stroke="#fff" strokeWidth="1" fill="none" opacity="0.4" />
        </g>
    );

    const validCols = [
      0, 1, 2, 3, 4,
      6, 7, 8, 9, 10,
      12, 13, 14, 15, 16,
      18, 19, 20, 21, 22,
      24, 25, 26, 27, 28
    ];

    const topPowerHoles = [];
    for (let i = 0; i < powerCols.length; i++) {
        const col = powerCols[i];
        const cx = startX + validCols[col] * dx;
        topPowerHoles.push(renderHole(cx, 20, `power-top-minus-${col}`));
        topPowerHoles.push(renderHole(cx, 30, `power-top-plus-${col}`));
    }

    const centerHoles = [];
    for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const cx = startX + col * dx;
        
        const topHoles = [];
        for (let j = 0; j < rows.length; j++) {
            topHoles.push(renderHole(cx, 60 + j * dy, `top-${col}-${j}`));
        }
        
        const bottomHoles = [];
        for (let j = 0; j < rows.length; j++) {
            bottomHoles.push(renderHole(cx, 120 + j * dy, `bottom-${col}-${j}`));
        }
        
        centerHoles.push(
            <g key={`col-${col}`}>
                {topHoles}
                {bottomHoles}
            </g>
        );
    }

    const bottomPowerHoles = [];
    for (let i = 0; i < powerCols.length; i++) {
        const col = powerCols[i];
        const cx = startX + validCols[col] * dx;
        bottomPowerHoles.push(renderHole(cx, 190, `power-bot-plus-${col}`));
        bottomPowerHoles.push(renderHole(cx, 200, `power-bot-minus-${col}`));
    }

    const columnLabelsTop = [];
    for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const cx = startX + col * dx;
        columnLabelsTop.push(
            <text key={`col-label-t-${col}`} x={cx} y={48} fontSize="7" fill="#555" textAnchor="middle" fontFamily="monospace" transform={`rotate(-90 ${cx} ${48})`}>
                {col + 1}
            </text>
        );
    }

    const columnLabelsBottom = [];
    for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const cx = startX + col * dx;
        columnLabelsBottom.push(
            <text key={`col-label-b-${col}`} x={cx} y={178} fontSize="7" fill="#555" textAnchor="middle" fontFamily="monospace" transform={`rotate(-90 ${cx} ${178})`}>
                {col + 1}
            </text>
        );
    }

    const rowLettersTop = ['j', 'i', 'h', 'g', 'f'];
    const rowLabelsTop = [];
    for (let j = 0; j < rows.length; j++) {
        const cy = 60 + j * dy;
        rowLabelsTop.push(<text key={`row-top-l-${j}`} x={38} y={cy + 2.5} fontSize="9" fill="#555" textAnchor="middle" fontFamily="sans-serif">{rowLettersTop[j]}</text>);
        rowLabelsTop.push(<text key={`row-top-r-${j}`} x={362} y={cy + 2.5} fontSize="9" fill="#555" textAnchor="middle" fontFamily="sans-serif">{rowLettersTop[j]}</text>);
    }

    const rowLettersBottom = ['e', 'd', 'c', 'b', 'a'];
    const rowLabelsBottom = [];
    for (let j = 0; j < rows.length; j++) {
        const cy = 120 + j * dy;
        rowLabelsBottom.push(<text key={`row-bot-l-${j}`} x={38} y={cy + 2.5} fontSize="9" fill="#555" textAnchor="middle" fontFamily="sans-serif">{rowLettersBottom[j]}</text>);
        rowLabelsBottom.push(<text key={`row-bot-r-${j}`} x={362} y={cy + 2.5} fontSize="9" fill="#555" textAnchor="middle" fontFamily="sans-serif">{rowLettersBottom[j]}</text>);
    }

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width={width} height={height} fill="#e6e6e6" rx="6" ry="6" stroke="#4a90e2" strokeWidth="3" />
            
            {/* Top Power Rail Area */}
            <rect x="25" y="10" width="350" height="30" fill="#dfdfdf" />
            <text x={20} y={23} fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">-</text>
            <text x={380} y={23} fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">-</text>
            <line x1="30" y1="13" x2="370" y2="13" stroke="#333" strokeWidth="1" />
            
            <text x={20} y={34} fontSize="14" fill="#b91c1c" textAnchor="middle" fontWeight="bold">+</text>
            <text x={380} y={34} fontSize="14" fill="#b91c1c" textAnchor="middle" fontWeight="bold">+</text>
            <line x1="30" y1="37" x2="370" y2="37" stroke="#b91c1c" strokeWidth="1" />
            
            {topPowerHoles}
            
            {/* Divider Line */}
            <line x1="10" y1="45" x2="390" y2="45" stroke="#ccc" strokeWidth="1" />

            {/* Top Block */}
            {columnLabelsTop}
            {rowLabelsTop}
            
            {/* Center Valley */}
            <rect x="20" y="106" width="360" height="8" fill="#d0d0d0" rx="2" />
            
            {/* Bottom Block */}
            {centerHoles}
            {rowLabelsBottom}
            {columnLabelsBottom}
            
            {/* Divider Line */}
            <line x1="10" y1="175" x2="390" y2="175" stroke="#ccc" strokeWidth="1" />

            {/* Bottom Power Rail Area */}
            <rect x="25" y="180" width="350" height="30" fill="#dfdfdf" />
            <text x={20} y={194} fontSize="14" fill="#b91c1c" textAnchor="middle" fontWeight="bold">+</text>
            <text x={380} y={194} fontSize="14" fill="#b91c1c" textAnchor="middle" fontWeight="bold">+</text>
            <line x1="30" y1="183" x2="370" y2="183" stroke="#b91c1c" strokeWidth="1" />
            
            <text x={20} y={204} fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">-</text>
            <text x={380} y={204} fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">-</text>
            <line x1="30" y1="207" x2="370" y2="207" stroke="#333" strokeWidth="1" />
            
            {bottomPowerHoles}
        </svg>
    );
};

export const BreadboardSVG = React.memo(BreadboardSVGComponent);
