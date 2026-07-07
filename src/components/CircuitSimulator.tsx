import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import '@wokwi/elements';
import { useCircuitSimulation } from '../hooks/useCircuitSimulation';
import { Trash2 } from 'lucide-react';
import { COMPONENT_PINS } from '../utils/circuitPins';
import type { Wire } from '../utils/circuitPins';
import { BreadboardSVG } from './BreadboardSVG';
import { TMPSensorSVG } from './TMPSensorSVG';
import { MultimeterSVG } from './MultimeterSVG';
import { Battery9VSVG } from './Battery9VSVG';
import { BatteryCoinSVG } from './BatteryCoinSVG';
import { BatteryAASVG } from './BatteryAASVG';
import { TopToolbar } from './TopToolbar';


export type ComponentType = 'wokwi-arduino-uno' | 'wokwi-led' | 'wokwi-resistor' | 'wokwi-pushbutton' | 'wokwi-buzzer' | 'wokwi-servo' | 'wokwi-potentiometer' | 'wokwi-slide-switch' | 'wokwi-photoresistor-sensor' | 'wokwi-breadboard-half' | 'wokwi-rgb-led' | 'wokwi-hc-sr04' | 'wokwi-pir-motion-sensor' | 'wokwi-ntc-temperature-sensor' | 'custom-tmp36' | 'custom-multimeter' | 'custom-battery-9v' | 'custom-battery-coin' | 'custom-battery-aa';

export interface CircuitComponent {
    id: string;
    type: ComponentType;
    x: number;
    y: number;
    rotation?: number;
    mirrored?: boolean;
    properties: any;
}


const AVAILABLE_COMPONENTS: { type: ComponentType, label: string, defaultProps?: any, canvasScale: number, sidebarScale: number, height: number }[] = [
    { type: 'wokwi-arduino-uno', label: 'Arduino Uno R3', defaultProps: {}, canvasScale: 1, sidebarScale: 0.25, height: 80 },
    { type: 'wokwi-breadboard-half', label: 'Breadboard Small', defaultProps: {}, canvasScale: 1, sidebarScale: 0.2, height: 80 },
    { type: 'wokwi-led', label: 'LED', defaultProps: { color: 'red' }, canvasScale: 1, sidebarScale: 0.8, height: 60 },
    { type: 'wokwi-resistor', label: 'Resistor', defaultProps: { value: 1000 }, canvasScale: 1.0204, sidebarScale: 0.6, height: 60 },
    { type: 'wokwi-pushbutton', label: 'Pushbutton', defaultProps: { color: 'blue' }, canvasScale: 1.0448, sidebarScale: 0.8, height: 60 },
    { type: 'wokwi-potentiometer', label: 'Potentiometer', defaultProps: {}, canvasScale: 1, sidebarScale: 0.8, height: 60 },
    { type: 'wokwi-slide-switch', label: 'Slideswitch', defaultProps: {}, canvasScale: 1.0526, sidebarScale: 0.8, height: 60 },
    { type: 'wokwi-photoresistor-sensor', label: 'Photoresistor', defaultProps: {}, canvasScale: 1.0169, sidebarScale: 0.6, height: 60 },
    { type: 'wokwi-rgb-led', label: 'LED RGB', defaultProps: {}, canvasScale: 1.1029, sidebarScale: 0.8, height: 60 },
    { type: 'wokwi-hc-sr04', label: 'Ultrasonic Sensor', defaultProps: {}, canvasScale: 1, sidebarScale: 0.6, height: 60 },
    { type: 'wokwi-pir-motion-sensor', label: 'PIR Sensor', defaultProps: {}, canvasScale: 1.0276, sidebarScale: 0.6, height: 60 },
    { type: 'wokwi-ntc-temperature-sensor', label: 'Temperature Sensor', defaultProps: {}, canvasScale: 1.0363, sidebarScale: 0.6, height: 60 },
    { type: 'wokwi-buzzer', label: 'Piezo', defaultProps: {}, canvasScale: 1, sidebarScale: 0.8, height: 60 },
    { type: 'wokwi-servo', label: 'Micro Servo', defaultProps: {}, canvasScale: 1.0526, sidebarScale: 0.5, height: 60 },
    { type: 'custom-tmp36', label: 'Temperature Sensor (TMP)', defaultProps: {}, canvasScale: 1, sidebarScale: 0.8, height: 60 },
    { type: 'custom-multimeter', label: 'Multimeter', defaultProps: { mode: 'A' }, canvasScale: 1, sidebarScale: 0.6, height: 60 },
    { type: 'custom-battery-9v', label: '9V Battery', defaultProps: {}, canvasScale: 1, sidebarScale: 0.6, height: 60 },
    { type: 'custom-battery-coin', label: 'Coin Cell 3V', defaultProps: {}, canvasScale: 1, sidebarScale: 0.8, height: 60 },
    { type: 'custom-battery-aa', label: '1.5V Battery', defaultProps: {}, canvasScale: 1, sidebarScale: 0.8, height: 60 },
];

const playSnapSound = () => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
        setTimeout(() => ctx.close().catch(() => { }), 150);
    } catch (e) {
        // Ignore audio errors
    }
};

const getRotatedPinCoordinates = (compX: number, compY: number, pinX: number, pinY: number, rotation: number = 0, mirrored: boolean = false) => {
    let px = pinX;
    let py = pinY;
    if (mirrored) {
        px = -px;
    }
    if (rotation === 0) return { x: compX + px, y: compY + py };
    const rad = rotation * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = px * cos - py * sin;
    const ry = px * sin + py * cos;
    return { x: compX + rx, y: compY + ry };
};

const buildWirePath = (x1: number, y1: number, waypoints: { x: number, y: number }[] = [], x2: number, y2: number) => {
    let d = `M ${x1} ${y1}`;
    for (const wp of waypoints) {
        d += ` L ${wp.x} ${wp.y}`;
    }
    d += ` L ${x2} ${y2}`;
    return d;
};

const DraggableCircuitComponentBase: React.FC<{
    componentsRef: React.MutableRefObject<CircuitComponent[]>,
    comp: CircuitComponent,
    dynamicProps: any,
    isRunning: boolean,
    isSelected: boolean,
    isInvalid?: boolean,
    isBlown?: boolean,
    isDrawingWire: boolean,
    zoom: number,
    setSelectedComponentId: (id: string) => void,
    updateComponent: (id: string, updates: Partial<CircuitComponent>) => void,
    onPinClick: (e: React.MouseEvent, compId: string, pinName: string, globalX: number, globalY: number) => void
}> = ({ componentsRef, comp, dynamicProps, isRunning, isSelected, isInvalid, isBlown, isDrawingWire, zoom, setSelectedComponentId, updateComponent, onPinClick }) => {
    const nodeRef = React.useRef<HTMLDivElement>(null);
    const TagName = comp.type;
    const scale = AVAILABLE_COMPONENTS.find(c => c.type === comp.type)?.canvasScale || 1;
    const pins = COMPONENT_PINS[comp.type] || [];

    const [localPos, setLocalPos] = React.useState({ x: comp.x, y: comp.y });

    React.useEffect(() => {
        setLocalPos({ x: comp.x, y: comp.y });
    }, [comp.x, comp.y]);

    return (
        <Draggable
            nodeRef={nodeRef}
            scale={zoom}
            key={comp.id}
            position={localPos}
            onDrag={(_e, data) => {
                setLocalPos({ x: data.x, y: data.y });
            }}
            onStop={(_e, data) => {
                let finalX = data.x;
                let finalY = data.y;

                // Magnetic Snap to Breadboard Holes
                if (comp.type !== 'wokwi-breadboard-half' && comp.type !== 'wokwi-arduino-uno') {
                    let snapped = false;
                    const compScale = AVAILABLE_COMPONENTS.find(c => c.type === comp.type)?.canvasScale || 1;

                    for (const otherComp of componentsRef.current) {
                        if (otherComp.type === 'wokwi-breadboard-half') {
                            const bbPins = COMPONENT_PINS[otherComp.type] || [];
                            for (const p of pins) {
                                if (snapped) break;
                                const rPin = getRotatedPinCoordinates(0, 0, p.x * compScale, p.y * compScale, comp.rotation, comp.mirrored);
                                const absX = finalX + rPin.x;
                                const absY = finalY + rPin.y;

                                const bbScale = AVAILABLE_COMPONENTS.find(c => c.type === otherComp.type)?.canvasScale || 1;
                                for (const bp of bbPins) {
                                    const rBbPin = getRotatedPinCoordinates(0, 0, bp.x * bbScale, bp.y * bbScale, otherComp.rotation, otherComp.mirrored);
                                    const bAbsX = otherComp.x + rBbPin.x;
                                    const bAbsY = otherComp.y + rBbPin.y;

                                    // 5px magnetic snap radius to prevent aggressive jumping on a 10px grid
                                    if (Math.abs(absX - bAbsX) <= 5 && Math.abs(absY - bAbsY) <= 5) {
                                        finalX += (bAbsX - absX);
                                        finalY += (bAbsY - absY);
                                        snapped = true;
                                        playSnapSound();
                                        break;
                                    }
                                }
                            }
                        }
                        if (snapped) break;
                    }
                }
                setLocalPos({ x: finalX, y: finalY });
                updateComponent(comp.id, { x: finalX, y: finalY });
            }}
            onStart={(e) => {
                // Don't drag if clicking a pin
                if ((e.target as HTMLElement).classList?.contains('circuit-pin')) return false;
            }}
            disabled={isRunning}
        >
            <div
                ref={nodeRef}
                data-comp-id={comp.id}
                className={isInvalid ? 'error-animation' : ''}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedComponentId(comp.id); }}
                style={{
                    position: 'absolute',
                    cursor: isRunning ? 'default' : 'grab',
                    borderRadius: '4px',
                    padding: '0px',
                    zIndex: isSelected ? 20 : 5,
                    filter: isSelected ? 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 24px rgba(59, 130, 246, 0.4))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
                    transition: 'filter 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <div style={{ position: 'relative', transform: `rotate(${comp.rotation || 0}deg) scaleX(${comp.mirrored ? -scale : scale}) scaleY(${scale})`, transformOrigin: 'top left', transition: isDrawingWire ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    {comp.type === 'wokwi-breadboard-half' ? <BreadboardSVG /> :
                        comp.type === 'custom-tmp36' ? <TMPSensorSVG /> :
                            comp.type === 'custom-multimeter' ? <MultimeterSVG {...dynamicProps} /> :
                                comp.type === 'custom-battery-9v' ? <Battery9VSVG /> :
                                    comp.type === 'custom-battery-coin' ? <BatteryCoinSVG /> :
                                        comp.type === 'custom-battery-aa' ? <BatteryAASVG /> :
                                            comp.type === 'wokwi-led' ? (
                                                <>
                                                    {React.createElement(TagName, { ...dynamicProps, value: false, style: undefined })}
                                                    {dynamicProps.value && React.createElement(TagName, {
                                                        ...dynamicProps,
                                                        style: { position: 'absolute', top: 0, left: 0, opacity: dynamicProps._brightness ?? 1 }
                                                    })}
                                                </>
                                            ) :
                                                React.createElement(TagName, dynamicProps)}
                    {/* Invisible overlay to catch drag events and prevent Wokwi elements from swallowing them */}
                    {!isRunning && !comp.type.startsWith('custom-') && comp.type !== 'wokwi-breadboard-half' && (
                        <div style={{ 
                            position: 'absolute', 
                            top: 0, left: 0, right: 0, 
                            bottom: comp.type === 'wokwi-led' ? '50%' : (comp.type === 'wokwi-resistor' ? '25%' : 0), 
                            zIndex: 10, cursor: 'grab' 
                        }} />
                    )}

                    {/* Explosion Overlay if Blown */}
                    {isBlown && (
                        <svg style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', pointerEvents: 'none', zIndex: 100 }} viewBox="0 0 100 100">
                            <defs>
                                <radialGradient id={`fireGrad-${comp.id}`} cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#fff" />
                                    <stop offset="30%" stopColor="#ffeb3b" />
                                    <stop offset="70%" stopColor="#ff4500" />
                                    <stop offset="100%" stopColor="#8b0000" />
                                </radialGradient>
                                <filter id={`glow-${comp.id}`} x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            <g filter={`url(#glow-${comp.id})`}>
                                <path d="M 50 5 L 58 35 L 90 20 L 68 48 L 98 68 L 62 70 L 70 95 L 50 72 L 30 95 L 38 70 L 2 68 L 32 48 L 10 20 L 42 35 Z" fill={`url(#fireGrad-${comp.id})`}>
                                    <animateTransform attributeName="transform" type="scale" values="0.9;1.15;0.9" cx="50" cy="50" dur="0.12s" repeatCount="indefinite" />
                                    <animateTransform attributeName="transform" type="rotate" values="-5 50 50; 5 50 50; -5 50 50" dur="0.3s" repeatCount="indefinite" additive="sum" />
                                </path>
                                <path d="M 50 25 L 55 42 L 75 32 L 60 52 L 80 68 L 56 62 L 62 82 L 50 65 L 38 82 L 44 62 L 20 68 L 40 52 L 25 32 L 45 42 Z" fill="#ffffff" opacity="0.9">
                                    <animateTransform attributeName="transform" type="scale" values="1;0.6;1" cx="50" cy="50" dur="0.18s" repeatCount="indefinite" />
                                </path>
                                {/* Smoke plumes */}
                                <circle cx="40" cy="40" r="15" fill="#333" opacity="0.7">
                                    <animate attributeName="cy" values="40;20" dur="1s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.7;0" dur="1s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="60" cy="50" r="12" fill="#222" opacity="0.6">
                                    <animate attributeName="cy" values="50;30" dur="1.2s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.6;0" dur="1.2s" repeatCount="indefinite" />
                                </circle>
                            </g>
                        </svg>
                    )}

                    {/* Local Pins Layer */}
                    {!isRunning && pins.map(pin => (
                        <div
                            key={`${comp.id}-${pin.name}`}
                            className={`circuit-pin ${isDrawingWire ? 'is-drawing' : ''}`}
                            data-tooltip={pin.name}
                            onMouseDown={(e) => {
                                const rPos = getRotatedPinCoordinates(comp.x, comp.y, pin.x * scale, pin.y * scale, comp.rotation, comp.mirrored);
                                onPinClick(e, comp.id, pin.name, rPos.x, rPos.y);
                            }}
                            style={{
                                position: 'absolute',
                                left: pin.x - (6 / scale),
                                top: pin.y - (6 / scale),
                                width: 12 / scale,
                                height: 12 / scale,
                                cursor: 'crosshair',
                                pointerEvents: 'auto',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                zIndex: 20
                            }}
                        />
                    ))}
                </div>
            </div>
        </Draggable>
    );
};

const DraggableCircuitComponent = React.memo(DraggableCircuitComponentBase);

interface CircuitSimulatorProps {
    generatedCode: string;
    addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    theme?: 'light' | 'dark';
    isCodeOpen: boolean;
    onToggleCode: () => void;
    onSerialOutput?: (output: string) => void;
    simLogs?: string[];
}

export const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({ generatedCode, addToast, theme = 'dark', isCodeOpen, onToggleCode, onSerialOutput, simLogs = [] }) => {
    const { isRunning, isCompiling, runSimulation, stopSimulation, arduinoPins, servoAngles, setArduinoInput, setUltrasonicDistance, syncUltrasonics } = useCircuitSimulation(addToast, onSerialOutput);

    const [components, setComponents] = useState<CircuitComponent[]>(() => {
        try {
            const saved = localStorage.getItem('roboai_circuit_components');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
    const [clipboardComponent, setClipboardComponent] = useState<CircuitComponent | null>(null);
    const [historyPast, setHistoryPast] = useState<{ components: CircuitComponent[], wires: Wire[] }[]>([]);
    const [historyFuture, setHistoryFuture] = useState<{ components: CircuitComponent[], wires: Wire[] }[]>([]);

    const handleUndo = () => {
        if (historyPast.length > 0) {
            const previous = historyPast[historyPast.length - 1];
            setHistoryFuture(prev => [{ components, wires }, ...prev]);
            setHistoryPast(prev => prev.slice(0, -1));
            setComponents(previous.components);
            setWires(previous.wires);
            setSelectedComponentId(null);
            setSelectedWireId(null);
        }
    };

    const handleRedo = () => {
        if (historyFuture.length > 0) {
            const next = historyFuture[0];
            setHistoryPast(prev => [...prev, { components, wires }]);
            setHistoryFuture(prev => prev.slice(1));
            setComponents(next.components);
            setWires(next.wires);
            setSelectedComponentId(null);
            setSelectedWireId(null);
        }
    };

    const handleDuplicateComponent = (id: string) => {
        const compToCopy = componentsRef.current.find(c => c.id === id);
        if (!compToCopy) return;
        const newComp: CircuitComponent = {
            ...compToCopy,
            id: `${compToCopy.type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            x: compToCopy.x + 20,
            y: compToCopy.y + 20
        };
        saveHistoryState(components, wires);
        setComponents(prev => [...(prev || []), newComp]);
        setSelectedComponentId(newComp.id);
    };

    const [invalidComponentIds, setInvalidComponentIds] = useState<string[]>([]);
    const [blownComponentIds, setBlownComponentIds] = useState<string[]>([]);
    const [zoom, setZoom] = useState<number>(1.5);
    const [panX, setPanX] = useState<number>(0);
    const [panY, setPanY] = useState<number>(0);
    const [isPanning, setIsPanning] = useState<boolean>(false);

    const componentsRef = React.useRef(components);
    React.useEffect(() => {
        componentsRef.current = components;
    }, [components]);

    const [wires, setWires] = useState<Wire[]>(() => {
        try {
            const saved = localStorage.getItem('roboai_circuit_wires');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('roboai_circuit_components', JSON.stringify(components));
        localStorage.setItem('roboai_circuit_wires', JSON.stringify(wires));
    }, [components, wires]);

    const saveHistoryState = (comps: CircuitComponent[], ws: Wire[]) => {
        setHistoryPast(prev => [...prev, { components: JSON.parse(JSON.stringify(comps)), wires: JSON.parse(JSON.stringify(ws)) }]);
        setHistoryFuture([]);
    };
    const [drawingWire, setDrawingWire] = useState<{
        fromComp: string;
        fromPin: string;
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        color: string;
        waypoints?: { x: number, y: number }[];
    } | null>(null);

    const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set());
    const [switchStates, setSwitchStates] = useState<Record<string, number>>({});

    const handlePinClick = (e: React.MouseEvent, compId: string, pinName: string, globalX: number, globalY: number) => {
        e.stopPropagation();
        if (isRunning) return;

        if (drawingWire) {
            // Finish drawing
            if (drawingWire.fromComp !== compId || drawingWire.fromPin !== pinName) {
                const newWire: Wire = {
                    id: `wire-${Date.now()}`,
                    fromComp: drawingWire.fromComp,
                    fromPin: drawingWire.fromPin,
                    toComp: compId,
                    toPin: pinName,
                    color: drawingWire.color,
                    waypoints: drawingWire.waypoints
                };
                saveHistoryState(components, wires);
                setWires(prev => [...prev, newWire]);
            }
            setDrawingWire(null);
        } else {
            // Start drawing
            const allColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#000000', '#ffffff'];
            const usedColors = wires.filter(w => w.fromComp === compId || w.toComp === compId).map(w => w.color);
            const availableColors = allColors.filter(c => !usedColors.includes(c));
            const colorToUse = availableColors.length > 0
                ? availableColors[Math.floor(Math.random() * availableColors.length)]
                : allColors[Math.floor(Math.random() * allColors.length)];

            setDrawingWire({
                fromComp: compId,
                fromPin: pinName,
                startX: globalX,
                startY: globalY,
                endX: globalX,
                endY: globalY,
                color: colorToUse
            });
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (drawingWire) {
            const rect = e.currentTarget.getBoundingClientRect();
            const newEndX = ((e.clientX - rect.left) - panX) / zoom;
            const newEndY = ((e.clientY - rect.top) - panY) / zoom;
            setDrawingWire(prev => prev ? {
                ...prev,
                endX: newEndX,
                endY: newEndY
            } : null);
        } else if (isPanning) {
            setPanX(prev => prev + e.movementX);
            setPanY(prev => prev + e.movementY);
        }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        setSelectedComponentId(null);
        setSelectedWireId(null);
        if (drawingWire) {
            const container = document.querySelector('.circuit-simulator-container');
            if (container) {
                const rect = container.getBoundingClientRect();
                const wx = ((e.clientX - rect.left) - panX) / zoom;
                const wy = ((e.clientY - rect.top) - panY) / zoom;
                setDrawingWire(prev => prev ? {
                    ...prev,
                    waypoints: [...(prev.waypoints || []), { x: wx, y: wy }]
                } : null);
            }
        } else if (!isPanning) {
            setSelectedComponentId(null);
        }
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (drawingWire) {
            if (e.button === 2) { // Right click cancels wire
                e.preventDefault();
                setDrawingWire(null);
            } else if (e.button === 0) {
                e.preventDefault(); // Prevent native drag which suppresses mousemove!
            }
        } else if (e.button === 0 || e.button === 1 || e.button === 2) {
            e.preventDefault();
            setIsPanning(true);
        }
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setDrawingWire(null);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const handleCanvasMouseUp = () => {
        setIsPanning(false);
    };

    const addComponent = (type: ComponentType, defaultProps: any = {}) => {
        saveHistoryState(components, wires);
        const newComp: CircuitComponent = {
            id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type,
            x: Math.round((window.innerWidth / 2 - 200) / 5) * 5,
            y: Math.round((window.innerHeight / 2 - 150) / 5) * 5,
            properties: { ...defaultProps }
        };
        setComponents([...(components || []), newComp]);
    };

    const updateComponent = (id: string, updates: Partial<CircuitComponent>) => {
        saveHistoryState(componentsRef.current, wires);
        setComponents(comps => (comps || []).map(c => c.id === id ? { ...c, ...updates } : c));

        if (updates.properties && updates.properties.distance !== undefined) {
            setUltrasonicDistance(id, updates.properties.distance);
        }
    };

    const updateWire = (id: string, updates: Partial<Wire>) => {
        saveHistoryState(components, wires);
        setWires(ws => (ws || []).map(w => w.id === id ? { ...w, ...updates } : w));
    };

    const deleteSelected = () => {
        if (selectedComponentId) {
            saveHistoryState(components, wires);
            setComponents((components || []).filter(c => c.id !== selectedComponentId));
            setWires((wires || []).filter(w => w.fromComp !== selectedComponentId && w.toComp !== selectedComponentId));
            setSelectedComponentId(null);
        }
    };

    const deleteWire = (wireId: string) => {
        saveHistoryState(components, wires);
        setWires((wires || []).filter(w => w.id !== wireId));
        if (selectedWireId === wireId) setSelectedWireId(null);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore keydown if user is typing in an input field (like the properties panel)
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'SELECT') {
                return;
            }
            if (isRunning) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedComponentId) deleteSelected();
                if (selectedWireId) deleteWire(selectedWireId);
            } else if (e.key.toLowerCase() === 'r' && selectedComponentId) {
                setComponents(prev => (prev || []).map(c => {
                    if (c.id === selectedComponentId) {
                        const currentRot = c.rotation || 0;
                        return { ...c, rotation: (currentRot + 90) % 360 };
                    }
                    return c;
                }));
            } else if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey) && selectedComponentId) {
                const compToCopy = componentsRef.current.find(c => c.id === selectedComponentId);
                if (compToCopy) setClipboardComponent(compToCopy);
            } else if (e.key.toLowerCase() === 'v' && (e.ctrlKey || e.metaKey) && clipboardComponent) {
                const newComp: CircuitComponent = {
                    ...clipboardComponent,
                    id: `${clipboardComponent.type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    x: clipboardComponent.x + 20,
                    y: clipboardComponent.y + 20
                };
                setComponents(prev => [...(prev || []), newComp]);
                setSelectedComponentId(newComp.id);
            } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
                handleUndo();
            } else if (e.key.toLowerCase() === 'y' && (e.ctrlKey || e.metaKey)) {
                handleRedo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedComponentId, selectedWireId, clipboardComponent, historyPast, historyFuture, components, wires, isRunning]);

    // --- Graph Solver ---
    const getBreadboardConnectedPins = (pinName: string): string[] => {
        const pins: string[] = [];
        if (pinName.startsWith('T_+_') || pinName.startsWith('T_-_') || pinName.startsWith('B_+_') || pinName.startsWith('B_-_')) {
            const prefix = pinName.substring(0, 4);
            for (let i = 0; i < 25; i++) pins.push(`${prefix}${i}`);
        } else {
            const matchA = pinName.match(/^(\d+)([a-e])$/);
            if (matchA) {
                const col = matchA[1];
                ['a', 'b', 'c', 'd', 'e'].forEach(p => pins.push(`${col}${p}`));
            }
            const matchF = pinName.match(/^(\d+)([f-j])$/);
            if (matchF) {
                const col = matchF[1];
                ['f', 'g', 'h', 'i', 'j'].forEach(p => pins.push(`${col}${p}`));
            }
        }
        return pins.filter(p => p !== pinName);
    };

    const getOverlappingConnections = (compId: string, pinName: string): { toComp: string, toPin: string }[] => {
        const comp = components.find(c => c.id === compId);
        if (!comp) return [];
        const compScale = AVAILABLE_COMPONENTS.find(c => c.type === comp.type)?.canvasScale || 1;
        const compPins = COMPONENT_PINS[comp.type] || [];
        const pinDef = compPins.find(p => p.name === pinName);
        if (!pinDef) return [];

        const absStart = getRotatedPinCoordinates(comp.x, comp.y, pinDef.x * compScale, pinDef.y * compScale, comp.rotation, comp.mirrored);
        const absX = absStart.x;
        const absY = absStart.y;

        const overlaps: { toComp: string, toPin: string }[] = [];

        for (const otherComp of components) {
            if (otherComp.id === compId) continue;
            const otherScale = AVAILABLE_COMPONENTS.find(c => c.type === otherComp.type)?.canvasScale || 1;
            const otherPins = COMPONENT_PINS[otherComp.type] || [];
            for (const op of otherPins) {
                const absOther = getRotatedPinCoordinates(otherComp.x, otherComp.y, op.x * otherScale, op.y * otherScale, otherComp.rotation, otherComp.mirrored);
                const oX = absOther.x;
                const oY = absOther.y;
                // Decreased threshold to 4px to strictly prevent short-circuiting across 10px grid holes
                if (Math.abs(absX - oX) <= 4 && Math.abs(absY - oY) <= 4) {
                    overlaps.push({ toComp: otherComp.id, toPin: op.name });
                }
            }
        }
        return overlaps;
    };

    const findVoltageSource = (startCompId: string, startPin: string, targetType: 'HIGH' | 'GND'): { res: number, voltage: number } => {
        const distances = new Map<string, number>();
        const queue: { compId: string, pin: string, res: number }[] = [];

        const startKey = `${startCompId}:${startPin}`;
        distances.set(startKey, 0);
        queue.push({ compId: startCompId, pin: startPin, res: 0 });

        let minRes = Infinity;
        let foundVoltage = 0.0;

        while (queue.length > 0) {
            queue.sort((a, b) => a.res - b.res);
            const current = queue.shift()!;
            const currentKey = `${current.compId}:${current.pin}`;

            if (current.res > (distances.get(currentKey) ?? Infinity)) continue;

            const comp = components.find(c => c.id === current.compId);
            if (!comp) continue;

            if (comp.type === 'wokwi-arduino-uno' || comp.type.startsWith('custom-battery-')) {
                if (targetType === 'GND' && (current.pin.startsWith('GND') || current.pin === '-')) {
                    if (current.res < minRes) { minRes = current.res; foundVoltage = 0.0; }
                    continue;
                }
                if (targetType === 'HIGH') {
                    if (comp.type === 'custom-battery-9v' && current.pin === 'VCC') {
                        if (current.res < minRes) { minRes = current.res; foundVoltage = 9.0; }
                        continue;
                    }
                    if (comp.type === 'custom-battery-coin' && current.pin === 'VCC') {
                        if (current.res < minRes) { minRes = current.res; foundVoltage = 3.0; }
                        continue;
                    }
                    if (comp.type === 'custom-battery-aa' && current.pin === 'VCC') {
                        if (current.res < minRes) { minRes = current.res; foundVoltage = 1.5; }
                        continue;
                    }
                    if (comp.type === 'wokwi-arduino-uno') {
                        if (current.pin === '5V' || current.pin === 'VCC') {
                            if (current.res < minRes) { minRes = current.res; foundVoltage = 5.0; }
                            continue;
                        }
                        if (current.pin === '3.3V') {
                            if (current.res < minRes) { minRes = current.res; foundVoltage = 3.3; }
                            continue;
                        }
                        if ((arduinoPins[current.pin] || 0) > 128) {
                            if (current.res < minRes) { minRes = current.res; foundVoltage = 5.0; }
                            continue;
                        }
                    }
                }
            }

            const addNeighbor = (nextCompId: string, nextPin: string, addedRes: number) => {
                const nextKey = `${nextCompId}:${nextPin}`;
                const newRes = current.res + addedRes;
                if (newRes < (distances.get(nextKey) ?? Infinity)) {
                    distances.set(nextKey, newRes);
                    queue.push({ compId: nextCompId, pin: nextPin, res: newRes });
                }
            };

            const connectedWires = wires.filter(w =>
                (w.fromComp === current.compId && w.fromPin === current.pin) ||
                (w.toComp === current.compId && w.toPin === current.pin)
            );
            for (const wire of connectedWires) {
                let nextCompId: string;
                let nextPin: string;
                if (wire.fromComp === current.compId && wire.fromPin === current.pin) {
                    nextCompId = wire.toComp;
                    nextPin = wire.toPin;
                } else {
                    nextCompId = wire.fromComp;
                    nextPin = wire.fromPin;
                }
                addNeighbor(nextCompId, nextPin, 0);
            }

            const overlapping = getOverlappingConnections(current.compId, current.pin);
            for (const overlap of overlapping) {
                addNeighbor(overlap.toComp, overlap.toPin, 0);
            }

            if (comp.type === 'wokwi-resistor') {
                const otherPin = current.pin === '1' ? '2' : '1';
                const rValue = comp.properties?.value ? parseFloat(comp.properties.value as string) : 1000;
                addNeighbor(current.compId, otherPin, rValue);
            } else if (comp.type === 'wokwi-breadboard-half') {
                const connectedPins = getBreadboardConnectedPins(current.pin);
                for (const otherPin of connectedPins) {
                    addNeighbor(current.compId, otherPin, 0);
                }
            } else if (comp.type === 'wokwi-pushbutton') {
                if (current.pin === '1.l') addNeighbor(current.compId, '1.r', 0);
                if (current.pin === '1.r') addNeighbor(current.compId, '1.l', 0);
                if (current.pin === '2.l') addNeighbor(current.compId, '2.r', 0);
                if (current.pin === '2.r') addNeighbor(current.compId, '2.l', 0);

                if (pressedButtons.has(current.compId)) {
                    if (current.pin === '1.l' || current.pin === '1.r') {
                        addNeighbor(current.compId, '2.l', 0);
                        addNeighbor(current.compId, '2.r', 0);
                    } else if (current.pin === '2.l' || current.pin === '2.r') {
                        addNeighbor(current.compId, '1.l', 0);
                        addNeighbor(current.compId, '1.r', 0);
                    }
                }
            } else if (comp.type === 'wokwi-slide-switch') {
                const state = switchStates[current.compId] || 0;
                // If state is 0, pins 1 and 2 are connected
                // If state is 1, pins 2 and 3 are connected
                if (current.pin === '2') {
                    addNeighbor(current.compId, state === 1 ? '3' : '1', 0);
                } else if (current.pin === '1' && state === 0) {
                    addNeighbor(current.compId, '2', 0);
                } else if (current.pin === '3' && state === 1) {
                    addNeighbor(current.compId, '2', 0);
                }
            }
        }

        return { res: minRes, voltage: foundVoltage };
    };

    const getConnectedArduinoPin = (startCompId: string, startPin: string, visited = new Set<string>()): string | null => {
        const nodeKey = `${startCompId}:${startPin}`;
        if (visited.has(nodeKey)) return null;
        visited.add(nodeKey);

        const startComp = components.find(c => c.id === startCompId);
        if (!startComp) return null;

        if (startComp.type === 'wokwi-arduino-uno') {
            return startPin;
        }

        const connectedWires = wires.filter(w =>
            (w.fromComp === startCompId && w.fromPin === startPin) ||
            (w.toComp === startCompId && w.toPin === startPin)
        );

        for (const wire of connectedWires) {
            let nextCompId: string;
            let nextPin: string;
            if (wire.fromComp === startCompId && wire.fromPin === startPin) {
                nextCompId = wire.toComp;
                nextPin = wire.toPin;
            } else {
                nextCompId = wire.fromComp;
                nextPin = wire.fromPin;
            }

            const pin = getConnectedArduinoPin(nextCompId, nextPin, visited);
            if (pin) return pin;
        }

        const overlapping = getOverlappingConnections(startCompId, startPin);
        for (const overlap of overlapping) {
            const pin = getConnectedArduinoPin(overlap.toComp, overlap.toPin, visited);
            if (pin) return pin;
        }

        if (startComp.type === 'wokwi-resistor') {
            const otherPin = startPin === '1' ? '2' : '1';
            const pin = getConnectedArduinoPin(startCompId, otherPin, visited);
            if (pin) return pin;
        } else if (startComp.type === 'wokwi-breadboard-half') {
            const connectedPins = getBreadboardConnectedPins(startPin);
            for (const otherPin of connectedPins) {
                const pin = getConnectedArduinoPin(startCompId, otherPin, visited);
                if (pin) return pin;
            }
        } else if (startComp.type === 'wokwi-pushbutton') {
            let pin: string | null = null;
            if (startPin === '1.l') pin = getConnectedArduinoPin(startCompId, '1.r', visited);
            if (startPin === '1.r') pin = getConnectedArduinoPin(startCompId, '1.l', visited);
            if (startPin === '2.l') pin = getConnectedArduinoPin(startCompId, '2.r', visited);
            if (startPin === '2.r') pin = getConnectedArduinoPin(startCompId, '2.l', visited);
            if (pin) return pin;

            if (pressedButtons.has(startCompId)) {
                if (startPin === '1.l' || startPin === '1.r') {
                    pin = getConnectedArduinoPin(startCompId, '2.l', visited) || getConnectedArduinoPin(startCompId, '2.r', visited);
                } else if (startPin === '2.l' || startPin === '2.r') {
                    pin = getConnectedArduinoPin(startCompId, '1.l', visited) || getConnectedArduinoPin(startCompId, '1.r', visited);
                }
                if (pin) return pin;
            }
        } else if (startComp.type === 'wokwi-slide-switch') {
            const state = switchStates[startCompId] || 0;
            if (startPin === '2') {
                const pin = getConnectedArduinoPin(startCompId, state === 1 ? '3' : '1', visited);
                if (pin) return pin;
            } else if (startPin === '1' && state === 0) {
                const pin = getConnectedArduinoPin(startCompId, '2', visited);
                if (pin) return pin;
            } else if (startPin === '3' && state === 1) {
                const pin = getConnectedArduinoPin(startCompId, '2', visited);
                if (pin) return pin;
            }
        }

        return null;
    };

    useEffect(() => {
        if (isRunning) {
            const ultrasonics = components
                .filter(c => c.type === 'wokwi-hc-sr04')
                .map(c => ({
                    compId: c.id,
                    trigPin: getConnectedArduinoPin(c.id, 'TRIG'),
                    echoPin: getConnectedArduinoPin(c.id, 'ECHO'),
                    distance: c.properties?.distance !== undefined ? parseFloat(c.properties.distance as string) : 100
                }));
            syncUltrasonics(ultrasonics);
        }
    }, [components, wires, isRunning, syncUltrasonics]);
    const resolveComponentState = (comp: CircuitComponent) => {
        let dynamicProps = { ...comp.properties };
        if (!isRunning) return dynamicProps;

        // Handle Outputs
        if (comp.type === 'wokwi-led' || comp.type === 'wokwi-buzzer') {
            if (blownComponentIds.includes(comp.id)) {
                dynamicProps.value = undefined; // blown
            } else {
                const highPin = comp.type === 'wokwi-led' ? 'A' : '1';
                const gndPin = comp.type === 'wokwi-led' ? 'C' : '2';
                const highSource = findVoltageSource(comp.id, highPin, 'HIGH');
                const gndSource = findVoltageSource(comp.id, gndPin, 'GND');

                if (highSource.res !== Infinity && gndSource.res !== Infinity && highSource.voltage > 0) {
                    if (comp.type === 'wokwi-led') {
                        dynamicProps.value = true;
                        dynamicProps._brightness = Math.max(0.15, Math.min(1.0, (highSource.voltage - 1.0) / 2.0));
                    }
                    if (comp.type === 'wokwi-buzzer') dynamicProps.hasSignal = true;
                }
            }
        } else if (comp.type === 'wokwi-servo') {
            const pin = getConnectedArduinoPin(comp.id, 'PWM');
            if (pin && servoAngles[pin] !== undefined) {
                dynamicProps.angle = servoAngles[pin];
            }
        } else if (comp.type === 'wokwi-rgb-led') {
            if (blownComponentIds.includes(comp.id)) {
                dynamicProps.ledRed = 0;
                dynamicProps.ledGreen = 0;
                dynamicProps.ledBlue = 0;
            } else {
                const rSource = findVoltageSource(comp.id, 'R', 'HIGH');
                const gSource = findVoltageSource(comp.id, 'G', 'HIGH');
                const bSource = findVoltageSource(comp.id, 'B', 'HIGH');
                const comSource = findVoltageSource(comp.id, 'COM', 'GND');
                
                if (comSource.res !== Infinity) {
                    dynamicProps.ledRed = (rSource.res !== Infinity && rSource.voltage > 0) ? Math.max(0.1, 1.0 - (rSource.res / 10000)) : 0;
                    dynamicProps.ledGreen = (gSource.res !== Infinity && gSource.voltage > 0) ? Math.max(0.1, 1.0 - (gSource.res / 10000)) : 0;
                    dynamicProps.ledBlue = (bSource.res !== Infinity && bSource.voltage > 0) ? Math.max(0.1, 1.0 - (bSource.res / 10000)) : 0;
                } else {
                    dynamicProps.ledRed = 0;
                    dynamicProps.ledGreen = 0;
                    dynamicProps.ledBlue = 0;
                }
            }
        } else if (comp.type === 'wokwi-arduino-uno') {
            dynamicProps.led13 = (arduinoPins['13'] || 0) > 128 ? true : undefined;
            dynamicProps.ledRX = (arduinoPins['1'] || 0) > 128 ? true : undefined;
            dynamicProps.ledTX = (arduinoPins['0'] || 0) > 128 ? true : undefined;
        } else if (comp.type === 'custom-multimeter') {
            const mode = comp.properties?.mode || 'V';
            dynamicProps.mode = mode;
            dynamicProps.onModeChange = () => {
                const nextMode = mode === 'V' ? 'A' : mode === 'A' ? 'R' : 'V';
                updateComponent(comp.id, { properties: { ...comp.properties, mode: nextMode } });
            };

            if (mode === 'V') {
                const vHigh = findVoltageSource(comp.id, 'V', 'HIGH');
                const vGnd = findVoltageSource(comp.id, 'V', 'GND');
                const comHigh = findVoltageSource(comp.id, 'COM', 'HIGH');
                const comGnd = findVoltageSource(comp.id, 'COM', 'GND');

                if (vHigh.res !== Infinity && comGnd.res !== Infinity) {
                    dynamicProps.value = vHigh.voltage;
                } else if (vGnd.res !== Infinity && comHigh.res !== Infinity) {
                    dynamicProps.value = -comHigh.voltage;
                } else {
                    dynamicProps.value = 0.0;
                }
            } else if (mode === 'R') {
                // Sim simplified calculation
                const gndSource = findVoltageSource(comp.id, 'V', 'GND');
                dynamicProps.value = (gndSource.res !== Infinity && gndSource.res > 0) ? gndSource.res : 0.0;
            } else if (mode === 'A') {
                // Current simulation check
                dynamicProps.value = 0.0;
            }
        }

        return dynamicProps;
    };

    useEffect(() => {
        if (!isRunning) return;

        const unoComp = components.find(c => c.type === 'wokwi-arduino-uno');
        if (!unoComp) return;

        const digitalPins = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
        const analogPins = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

        for (const pin of [...digitalPins, ...analogPins]) {
            const gndSource = findVoltageSource(unoComp.id, pin, 'GND');
            const highSource = findVoltageSource(unoComp.id, pin, 'HIGH');

            if (gndSource.res < highSource.res && gndSource.res !== Infinity) {
                setArduinoInput(pin, 0);
            } else if (highSource.res < gndSource.res && highSource.res !== Infinity) {
                setArduinoInput(pin, 1);
            } else if (gndSource.res === Infinity && highSource.res === Infinity) {
                setArduinoInput(pin, undefined);
            }
        }
    }, [isRunning, components, wires, pressedButtons, switchStates, setArduinoInput]);

    useEffect(() => {
        if (!isRunning) {
            setBlownComponentIds(prev => prev.length > 0 ? [] : prev);
            return;
        }

        const newBlown = new Set(blownComponentIds);
        let changed = false;

        for (const comp of components) {
            if (comp.type === 'wokwi-led' || comp.type === 'wokwi-buzzer') {
                if (!newBlown.has(comp.id)) {
                    const highPin = comp.type === 'wokwi-led' ? 'A' : '1';
                    const gndPin = comp.type === 'wokwi-led' ? 'C' : '2';
                    const highSource = findVoltageSource(comp.id, highPin, 'HIGH');
                    const gndSource = findVoltageSource(comp.id, gndPin, 'GND');

                    if (highSource.res !== Infinity && gndSource.res !== Infinity) {
                        if ((highSource.res + gndSource.res) < 150 && highSource.voltage > 3.0 && comp.type === 'wokwi-led') {
                            newBlown.add(comp.id);
                            changed = true;
                        }
                    }
                }
            } else if (comp.type === 'wokwi-rgb-led') {
                if (!newBlown.has(comp.id)) {
                    const comSource = findVoltageSource(comp.id, 'COM', 'GND');
                    if (comSource.res !== Infinity) {
                        const rSource = findVoltageSource(comp.id, 'R', 'HIGH');
                        const gSource = findVoltageSource(comp.id, 'G', 'HIGH');
                        const bSource = findVoltageSource(comp.id, 'B', 'HIGH');
                        
                        if (
                            (rSource.res !== Infinity && (rSource.res + comSource.res) < 150 && rSource.voltage > 3.0) ||
                            (gSource.res !== Infinity && (gSource.res + comSource.res) < 150 && gSource.voltage > 3.0) ||
                            (bSource.res !== Infinity && (bSource.res + comSource.res) < 150 && bSource.voltage > 3.0)
                        ) {
                            newBlown.add(comp.id);
                            changed = true;
                        }
                    }
                }
            } else if (comp.type === 'custom-tmp36') {
                // Map TMP36 temperature property directly to Arduino Analog input constantly
                const tempC = comp.properties?.temperature !== undefined ? parseFloat(comp.properties.temperature as string) : 25;
                const voutPin = getConnectedArduinoPin(comp.id, 'VOUT');
                if (voutPin) {
                    const v = (tempC * 0.01) + 0.5; // TMP36 characteristic equation
                    setArduinoInput(voutPin, Math.max(0, Math.min(5.0, v)));
                }
            } else if (comp.type === 'wokwi-photoresistor-sensor') {
                const lux = comp.properties?.illuminance !== undefined ? parseFloat(comp.properties.illuminance as string) : 500;
                const aoPin = getConnectedArduinoPin(comp.id, 'AO');
                const doPin = getConnectedArduinoPin(comp.id, 'DO');

                if (aoPin || doPin) {
                    const luxLog = Math.max(0, Math.log10(lux));
                    const v = Math.min(5.0, luxLog * 1.0);
                    if (aoPin) setArduinoInput(aoPin, v);
                    if (doPin) setArduinoInput(doPin, lux > 100 ? 0 : 1);
                }
            }
        }

        if (changed) {
            setBlownComponentIds(Array.from(newBlown));
            addToast("WARNING: Component exploded due to overcurrent! (Needs a resistor \u2265 150\u03A9)", "error");
        }

        const container = document.querySelector('.circuit-simulator-container');
        if (!container) return;

        const handleInput = (e: Event) => {
            const target = e.target as HTMLElement;
            const wrapper = target.closest('div[data-comp-id]');
            if (!wrapper) return;

            const compId = wrapper.getAttribute('data-comp-id');
            if (!compId) return;

            const comp = components.find(c => c.id === compId);
            if (!comp) return;

            if (comp.type === 'wokwi-potentiometer' && 'value' in target) {
                const potPin = getConnectedArduinoPin(compId, 'SIG');
                if (potPin) {
                    const val = parseFloat((target as any).value) || 0;
                    setArduinoInput(potPin, (val / 1023) * 5.0);
                }
            } else if (comp.type === 'wokwi-hc-sr04' && 'distance' in target) {
                const val = parseFloat((target as any).distance) || 0;
                setUltrasonicDistance(compId, val);
            } else if (comp.type === 'wokwi-ntc-temperature-sensor' && 'temperature' in target) {
                const tempC = parseFloat((target as any).temperature) || 25;
                const outPin = getConnectedArduinoPin(compId, 'OUT');
                if (outPin) {
                    // Exact physics for 10k NTC thermistor with Beta=3950 and 10k pulldown
                    const tempK = tempC + 273.15;
                    const rNtc = 10000.0 * Math.exp(3950.0 * (1.0 / tempK - 1.0 / 298.15));
                    let v = 5.0 / (10000.0 / rNtc + 1.0);
                    v = Math.max(0, Math.min(5.0, v));
                    setArduinoInput(outPin, v);
                }
            } else if (comp.type === 'wokwi-photoresistor-sensor' && 'illuminance' in target) {
                const lux = parseFloat((target as any).illuminance) || 500;
                const aoPin = getConnectedArduinoPin(compId, 'AO');
                const doPin = getConnectedArduinoPin(compId, 'DO');

                // Dark (~0.1 lux) -> High resistance -> Low AO voltage (e.g. <1V)
                // Bright (>1000 lux) -> Low resistance -> High AO voltage (e.g. >4V)
                // Let's use log scale for lux mapping
                const luxLog = Math.max(0, Math.log10(lux)); // 0.1 lux = -1 (clamped 0), 10 lux = 1, 1000 = 3, 100000 = 5
                const v = Math.min(5.0, luxLog * 1.0); // 0V to 5V max

                if (aoPin) setArduinoInput(aoPin, v);
                if (doPin) setArduinoInput(doPin, lux > 100 ? 0 : 1); // Typical DO behavior: LOW when bright, HIGH when dark
            } else if (comp.type === 'wokwi-slide-switch' && 'value' in target) {
                const val = parseInt((target as any).value) || 0;
                setSwitchStates(prev => ({ ...prev, [compId]: val }));
            }
        };

        const handleButtonPress = (e: Event) => {
            const target = e.target as HTMLElement;
            const wrapper = target.closest('div[data-comp-id]');
            if (!wrapper) return;
            const compId = wrapper.getAttribute('data-comp-id');
            if (!compId) return;

            if (e.type === 'button-press') {
                setPressedButtons(prev => { const n = new Set(prev); n.add(compId); return n; });
            } else {
                setPressedButtons(prev => { const n = new Set(prev); n.delete(compId); return n; });
            }
        };

        const handleMotion = (e: Event) => {
            const target = e.target as HTMLElement;
            const wrapper = target.closest('div[data-comp-id]');
            if (!wrapper) return;
            const compId = wrapper.getAttribute('data-comp-id');
            if (!compId) return;

            const outPin = getConnectedArduinoPin(compId, 'OUT');
            if (outPin) {
                setArduinoInput(outPin, e.type === 'motion-start' ? 1 : 0);
            }
        };

        const handleComponentClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const wrapper = target.closest('div[data-comp-id]');
            if (!wrapper) return;
            const compId = wrapper.getAttribute('data-comp-id');
            if (!compId) return;
            const comp = components.find(c => c.id === compId);
            if (comp?.type === 'wokwi-slide-switch') {
                setTimeout(() => {
                    const el = wrapper.querySelector('wokwi-slide-switch');
                    if (el && 'value' in el) {
                        const val = parseInt((el as any).value) || 0;
                        setSwitchStates(prev => ({ ...prev, [compId]: val }));
                    }
                }, 10);
            } else if (comp?.type === 'wokwi-pir-motion-sensor') {
                const outPin = getConnectedArduinoPin(compId, 'OUT');
                
                // Realistic physics: Ensure sensor is powered
                const vcc = findVoltageSource(compId, 'VCC', 'HIGH');
                const gnd = findVoltageSource(compId, 'GND', 'GND');
                
                if (vcc.res === Infinity || gnd.res === Infinity || vcc.voltage < 3.0) {
                    const indicator = document.createElement('div');
                    indicator.textContent = '⚠️ NO POWER (Connect VCC & GND)';
                    indicator.style.position = 'absolute';
                    indicator.style.top = '0';
                    indicator.style.left = '50%';
                    indicator.style.transform = 'translateX(-50%) translateY(-100%)';
                    indicator.style.background = 'rgba(239, 68, 68, 0.9)';
                    indicator.style.color = 'white';
                    indicator.style.padding = '4px 8px';
                    indicator.style.borderRadius = '4px';
                    indicator.style.fontSize = '12px';
                    indicator.style.fontWeight = 'bold';
                    indicator.style.pointerEvents = 'none';
                    indicator.style.zIndex = '100';
                    wrapper.appendChild(indicator);
                    setTimeout(() => { if (indicator.parentNode) indicator.parentNode.removeChild(indicator); }, 2000);
                    return;
                }

                if (outPin) {
                    setArduinoInput(outPin, 1);
                    const indicator = document.createElement('div');
                    indicator.textContent = 'MOTION DETECTED!';
                    indicator.style.position = 'absolute';
                    indicator.style.top = '0';
                    indicator.style.left = '50%';
                    indicator.style.transform = 'translateX(-50%) translateY(-100%)';
                    indicator.style.background = 'rgba(34, 197, 94, 0.9)'; // Green
                    indicator.style.color = 'white';
                    indicator.style.padding = '4px 8px';
                    indicator.style.borderRadius = '4px';
                    indicator.style.fontSize = '12px';
                    indicator.style.fontWeight = 'bold';
                    indicator.style.pointerEvents = 'none';
                    indicator.style.zIndex = '100';
                    wrapper.appendChild(indicator);
                    
                    setTimeout(() => {
                        setArduinoInput(outPin, 0);
                        if (indicator.parentNode) {
                            indicator.parentNode.removeChild(indicator);
                        }
                    }, 3000);
                }
            }
        };

        container.addEventListener('input', handleInput, true);
        container.addEventListener('click', handleComponentClick);
        container.addEventListener('button-press', handleButtonPress, true);
        container.addEventListener('button-release', handleButtonPress, true);
        container.addEventListener('motion-start', handleMotion, true);
        container.addEventListener('motion-end', handleMotion, true);

        return () => {
            container.removeEventListener('input', handleInput, true);
            container.removeEventListener('click', handleComponentClick);
            container.removeEventListener('button-press', handleButtonPress, true);
            container.removeEventListener('button-release', handleButtonPress, true);
            container.removeEventListener('motion-start', handleMotion, true);
            container.removeEventListener('motion-end', handleMotion, true);
        };
    }, [isRunning, components, wires, arduinoPins]);


    return (
        <div
            className="circuit-simulator-container"
            style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
        >

            {/* Main Canvas Area (Center) */}
            <div
                className="circuit-simulator-canvas"
                style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundImage: 'radial-gradient(var(--border-light) 1px, transparent 1px)', backgroundSize: `${10 * zoom}px ${10 * zoom}px`, backgroundPosition: `${panX}px ${panY}px`, backgroundColor: 'var(--bg-canvas)' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const type = e.dataTransfer.getData('componentType') as ComponentType;
                    const props = e.dataTransfer.getData('defaultProps');
                    if (type) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const newComp: CircuitComponent = {
                            id: `${type}-${Date.now()}`,
                            type,
                            x: Math.round(((e.clientX - rect.left - panX) / zoom - 40) / 5) * 5,
                            y: Math.round(((e.clientY - rect.top - panY) / zoom - 40) / 5) * 5,
                            properties: props ? JSON.parse(props) : {}
                        };
                        setComponents(prev => [...prev, newComp]);
                    }
                }}
                onWheel={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    setZoom(prevZoom => {
                        let newZoom = prevZoom;
                        if (e.ctrlKey || e.metaKey) {
                            newZoom = Math.min(Math.max(0.2, prevZoom - e.deltaY * 0.003), 3);
                        } else {
                            newZoom = Math.min(Math.max(0.2, prevZoom - Math.sign(e.deltaY) * 0.15), 3);
                        }

                        if (newZoom !== prevZoom) {
                            setPanX(prevPanX => mouseX - ((mouseX - prevPanX) / prevZoom) * newZoom);
                            setPanY(prevPanY => mouseY - ((mouseY - prevPanY) / prevZoom) * newZoom);
                        }
                        return newZoom;
                    });
                }}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
            >
                {/* Toolbar */}
                <div className="simulator-toolbar" style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 100, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
                        <button
                            className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
                            style={{
                                backgroundColor: isRunning ? '#ef4444' : '#10b981',
                                color: 'white',
                                padding: '10px 24px',
                                fontSize: '14px',
                                fontWeight: 600,
                                borderRadius: '20px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isRunning) {
                                    stopSimulation();
                                } else {
                                    const missingWires: string[] = [];
                                    for (const comp of components) {
                                        if (comp.type === 'wokwi-arduino-uno' || comp.type === 'wokwi-breadboard-half') continue;
                                        const connectedWires = wires.filter(w => w.fromComp === comp.id || w.toComp === comp.id);

                                        let totalConnections = connectedWires.length;
                                        const compPins = COMPONENT_PINS[comp.type] || [];
                                        for (const p of compPins) {
                                            // If this pin doesn't have a direct wire, check if it overlaps with anything (e.g. breadboard)
                                            const hasDirectWire = connectedWires.some(w => (w.fromComp === comp.id && w.fromPin === p.name) || (w.toComp === comp.id && w.toPin === p.name));
                                            if (!hasDirectWire) {
                                                const overlaps = getOverlappingConnections(comp.id, p.name);
                                                if (overlaps.length > 0) totalConnections++;
                                            }
                                        }

                                        let minWires = 2;
                                        if (['wokwi-servo', 'wokwi-potentiometer', 'wokwi-pir-motion-sensor', 'wokwi-ntc-temperature-sensor', 'wokwi-photoresistor-sensor', 'custom-tmp36'].includes(comp.type)) minWires = 3;
                                        if (['wokwi-rgb-led', 'wokwi-hc-sr04'].includes(comp.type)) minWires = 4;
                                        if (['custom-multimeter'].includes(comp.type)) minWires = 2;

                                        if (totalConnections < minWires) missingWires.push(comp.id);
                                    }

                                    if (missingWires.length > 0) {
                                        setInvalidComponentIds(missingWires);
                                        addToast("Warning: Some components appear to be missing wires or are not properly connected.", "warning");
                                        setTimeout(() => setInvalidComponentIds([]), 2500);
                                        // Allow simulation to continue
                                    }

                                    // Pre-flight Short-Circuit Check
                                    const uno = components.find(c => c.type === 'wokwi-arduino-uno');
                                    if (uno) {
                                        const shortGnd5V = findVoltageSource(uno.id, '5V', 'GND');
                                        const shortGnd3V = findVoltageSource(uno.id, '3.3V', 'GND');
                                        if (shortGnd5V.res === 0 || shortGnd3V.res === 0) {
                                            addToast("CRITICAL SAFETY WARNING: Short Circuit Detected! 5V or 3.3V is directly wired to Ground. The Arduino has been protected and the simulation was aborted.", "error");
                                            return;
                                        }
                                    }

                                    setBlownComponentIds([]);

                                    // Extract ultrasonic configurations based on physical wiring
                                    const ultrasonics = components
                                        .filter(c => c.type === 'wokwi-hc-sr04')
                                        .map(c => ({
                                            compId: c.id,
                                            trigPin: getConnectedArduinoPin(c.id, 'TRIG'),
                                            echoPin: getConnectedArduinoPin(c.id, 'ECHO'),
                                            distance: c.properties?.distance !== undefined ? parseFloat(c.properties.distance as string) : 100
                                        }));

                                    console.log('[DEBUG] Running simulation with code:', generatedCode);
                                    runSimulation(generatedCode, ultrasonics).then(() => {
                                        setTimeout(() => {
                                            const simContainer = document.querySelector('.circuit-simulator-container');
                                            if (simContainer) {
                                                const inputs = simContainer.querySelectorAll('wokwi-potentiometer, wokwi-ntc-temperature-sensor, wokwi-photoresistor-sensor, wokwi-slide-switch, custom-tmp36');
                                                inputs.forEach(input => {
                                                    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                                                });
                                            }
                                        }, 50);
                                    });
                                }
                            }}
                            disabled={isCompiling}
                        >
                            {isCompiling ? '⏳ Compiling AVR...' : isRunning ? '⏹ Stop Simulation' : '▶ Start Simulation'}
                        </button>
                    </div>

                    <div style={{ paddingLeft: '12px', pointerEvents: 'auto' }}>
                        <button
                            className="btn btn-outline"
                            style={{
                                color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'var(--bg-panel)',
                                padding: '8px 16px', fontSize: '14px', fontWeight: 600, borderRadius: '8px', boxShadow: 'var(--shadow-sm)'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to clear the entire circuit workspace?')) {
                                    setComponents([]);
                                    setWires([]);
                                }
                            }}
                        >
                            <Trash2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Clear
                        </button>
                    </div>

                    <div style={{ flex: 1 }}></div>

                    <div style={{ pointerEvents: 'auto' }}>
                        <button
                            className="btn btn-outline"
                            style={{
                                backgroundColor: isCodeOpen ? 'var(--accent-blue)' : 'var(--bg-panel)',
                                color: isCodeOpen ? 'white' : 'var(--text-main)',
                                borderColor: isCodeOpen ? 'var(--accent-blue)' : 'var(--border-main)',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 600,
                                borderRadius: '8px',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onClick={(e) => { e.stopPropagation(); onToggleCode && onToggleCode(); }}
                        >
                            &lt;/&gt; Code
                        </button>
                    </div>
                </div>

                {/* Zoom Controls (Bottom Right) */}
                <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 100, pointerEvents: 'auto', display: 'flex', gap: '4px', alignItems: 'center', backgroundColor: 'var(--bg-panel)', padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                    <button className="btn" style={{ padding: '4px 8px', backgroundColor: 'transparent', color: 'var(--text-main)', border: 'none', cursor: 'pointer' }} onClick={(e) => {
                        e.stopPropagation();
                        setZoom(prevZoom => {
                            const newZoom = Math.max(0.2, prevZoom - 0.2);
                            if (newZoom !== prevZoom) {
                                const container = document.querySelector('.circuit-simulator-container > div');
                                const rect = container?.getBoundingClientRect();
                                const mouseX = rect ? rect.width / 2 : window.innerWidth / 2;
                                const mouseY = rect ? rect.height / 2 : window.innerHeight / 2;
                                setPanX(prevPanX => mouseX - ((mouseX - prevPanX) / prevZoom) * newZoom);
                                setPanY(prevPanY => mouseY - ((mouseY - prevPanY) / prevZoom) * newZoom);
                            }
                            return newZoom;
                        });
                    }}>-</button>
                    <span style={{ fontSize: '13px', color: 'var(--text-main)', width: '40px', textAlign: 'center', fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>
                    <button className="btn" style={{ padding: '4px 8px', backgroundColor: 'transparent', color: 'var(--text-main)', border: 'none', cursor: 'pointer' }} onClick={(e) => {
                        e.stopPropagation();
                        setZoom(prevZoom => {
                            const newZoom = Math.min(3, prevZoom + 0.2);
                            if (newZoom !== prevZoom) {
                                const container = document.querySelector('.circuit-simulator-container > div');
                                const rect = container?.getBoundingClientRect();
                                const mouseX = rect ? rect.width / 2 : window.innerWidth / 2;
                                const mouseY = rect ? rect.height / 2 : window.innerHeight / 2;
                                setPanX(prevPanX => mouseX - ((mouseX - prevPanX) / prevZoom) * newZoom);
                                setPanY(prevPanY => mouseY - ((mouseY - prevPanY) / prevZoom) * newZoom);
                            }
                            return newZoom;
                        });
                    }}>+</button>
                </div>

                {/* Scaled Container */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0' }}>
                    {/* Invisible interaction layer covering huge area so clicks work everywhere */}
                    <div
                        style={{ position: 'absolute', top: -20000, left: -20000, width: 40000, height: 40000, zIndex: 1, cursor: isPanning ? 'grabbing' : 'auto' }}
                        onClick={handleCanvasClick}
                        onMouseDown={handleCanvasMouseDown}
                    />

                    {/* SVG Wire Layer */}
                    <svg style={{ position: 'absolute', top: -20000, left: -20000, width: 40000, height: 40000, pointerEvents: 'none', zIndex: 15, overflow: 'visible' }} viewBox="-20000 -20000 40000 40000">
                        {/* Placed Wires */}
                        {(wires || []).map(wire => {
                            const startComp = components.find(c => c.id === wire.fromComp);
                            const endComp = components.find(c => c.id === wire.toComp);
                            if (!startComp || !endComp) return null;

                            const startScale = AVAILABLE_COMPONENTS.find(c => c.type === startComp.type)?.canvasScale || 1;
                            const endScale = AVAILABLE_COMPONENTS.find(c => c.type === endComp.type)?.canvasScale || 1;

                            const startPinDef = COMPONENT_PINS[startComp.type]?.find(p => p.name === wire.fromPin);
                            const endPinDef = COMPONENT_PINS[endComp.type]?.find(p => p.name === wire.toPin);
                            if (!startPinDef || !endPinDef) return null;

                            const startPos = getRotatedPinCoordinates(startComp.x, startComp.y, startPinDef.x * startScale, startPinDef.y * startScale, startComp.rotation, startComp.mirrored);
                            const endPos = getRotatedPinCoordinates(endComp.x, endComp.y, endPinDef.x * endScale, endPinDef.y * endScale, endComp.rotation, endComp.mirrored);

                            const x1 = startPos.x;
                            const y1 = startPos.y;
                            const x2 = endPos.x;
                            const y2 = endPos.y;

                            const pathD = buildWirePath(x1, y1, wire.waypoints, x2, y2);

                            return (
                                <g key={wire.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSelectedWireId(wire.id); setSelectedComponentId(null); }} onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedWireId(wire.id); setSelectedComponentId(null); }}>
                                    {/* Visibility Outline */}
                                    <path
                                        d={pathD}
                                        fill="none"
                                        stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {/* Main Wire */}
                                    <path
                                        d={pathD}
                                        fill="none"
                                        stroke={wire.color}
                                        strokeWidth={selectedWireId === wire.id ? "6" : "4"}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ transition: 'stroke-width 0.2s', filter: selectedWireId === wire.id ? 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' : 'none' }}
                                    />
                                </g>
                            );
                        })}

                        {/* Wire currently being drawn */}
                        {drawingWire && (() => {
                            const { startX, startY, endX, endY, waypoints } = drawingWire;
                            const pathD = buildWirePath(startX, startY, waypoints, endX, endY);
                            return (
                                <g>
                                    <path
                                        d={pathD}
                                        fill="none"
                                        stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d={pathD}
                                        fill="none"
                                        stroke={drawingWire.color}
                                        strokeWidth="4"
                                        strokeDasharray="4 4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </g>
                            );
                        })()}
                    </svg>

                    {/* Render Components */}
                    {(components || []).map(comp => (
                        <DraggableCircuitComponent
                            key={comp.id}
                            componentsRef={componentsRef}
                            comp={comp}
                            dynamicProps={resolveComponentState(comp)}
                            isRunning={isRunning}
                            isSelected={selectedComponentId === comp.id}
                            isInvalid={invalidComponentIds.includes(comp.id)}
                            isBlown={blownComponentIds.includes(comp.id)}
                            isDrawingWire={!!drawingWire}
                            zoom={zoom}
                            setSelectedComponentId={(id) => { setSelectedComponentId(id); setSelectedWireId(null); }}
                            updateComponent={updateComponent}
                            onPinClick={handlePinClick}
                        />
                    ))}



                </div> {/* End Scaled Container */}
            </div>

            {/* Component Palette (Right) */}
            {!isCodeOpen && (
                <div className="components-palette" style={{ width: '280px', backgroundColor: 'rgba(15, 15, 20, 0.75)', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', zIndex: 10, boxShadow: '-12px 0 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'white', letterSpacing: '0.5px' }}>Components</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>Drag and drop to canvas</p>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <style>{`
                .comp-item {
                    transition: all 0.2s ease-in-out;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    background: rgba(25, 25, 30, 0.5);
                }
                .comp-item:hover {
                    transform: translateX(4px);
                    background: rgba(40, 40, 50, 0.8);
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
            `}</style>
                        {(AVAILABLE_COMPONENTS || []).map(c => (
                            <div
                                key={c.label}
                                className="comp-item"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('componentType', c.type);
                                    e.dataTransfer.setData('defaultProps', JSON.stringify(c.defaultProps));
                                }}
                                onClick={() => addComponent(c.type, c.defaultProps)}
                                style={{
                                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                                    padding: '8px 12px', cursor: 'pointer', gap: '16px'
                                }}
                            >
                                <div style={{ height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                    <div style={{ transform: `scale(${c.sidebarScale * 0.6})`, transformOrigin: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                        {c.type === 'wokwi-breadboard-half' ? <BreadboardSVG /> :
                                            c.type === 'custom-tmp36' ? <TMPSensorSVG /> :
                                                c.type === 'custom-multimeter' ? <MultimeterSVG {...c.defaultProps} /> :
                                                    c.type === 'custom-battery-9v' ? <Battery9VSVG /> :
                                                        c.type === 'custom-battery-coin' ? <BatteryCoinSVG /> :
                                                            c.type === 'custom-battery-aa' ? <BatteryAASVG /> :
                                                                React.createElement(c.type as any, c.defaultProps)}
                                    </div>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>{c.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Toolbar */}
            <TopToolbar
                selectedComponent={components.find(c => c.id === selectedComponentId) || null}
                selectedWire={wires.find(w => w.id === selectedWireId) || null}
                updateComponent={updateComponent}
                updateWire={updateWire}
                deleteComponent={deleteSelected}
                deleteWire={deleteWire}
                duplicateComponent={handleDuplicateComponent}
                undo={handleUndo}
                redo={handleRedo}
                canUndo={historyPast.length > 0}
                canRedo={historyFuture.length > 0}
            />

            {/* Arduino Speech Bubble (Visual Serial Output) */}
            {(() => {
                const arduinoComp = components.find(c => c.type === 'wokwi-arduino-uno');
                const lastLog = simLogs.length > 0 ? simLogs[simLogs.length - 1] : null;

                if (!arduinoComp || !lastLog || !isRunning) return null;

                return (
                    <div style={{
                        position: 'absolute',
                        left: arduinoComp.x + 160,
                        top: arduinoComp.y - 45,
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 12px rgba(56,189,248,0.2)',
                        pointerEvents: 'none',
                        zIndex: 50,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ 
                            fontSize: '10px', 
                            color: '#94a3b8', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.5px',
                            fontFamily: 'sans-serif',
                            fontWeight: 600
                        }}>
                            TX {' > '}
                        </span>
                        <span style={{ 
                            color: '#10b981', 
                            textShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: '"Fira Code", Consolas, monospace'
                        }}>
                            {lastLog}
                        </span>
                    </div>
                );
            })()}
        </div>
    );
};
