import React, { useState, useEffect } from 'react';
import type { Wire } from '../utils/circuitPins';
import type { CircuitComponent } from './CircuitSimulator';
import { Undo2, Redo2, Trash2, Copy, RotateCw, FlipHorizontal } from 'lucide-react';

interface TopToolbarProps {
    selectedComponent: CircuitComponent | null;
    selectedWire: Wire | null;
    updateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
    updateWire: (id: string, updates: Partial<Wire>) => void;
    deleteComponent: (id: string) => void;
    deleteWire: (id: string) => void;
    duplicateComponent: (id: string) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const WIRE_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7', '#000000', '#ffffff'];
const LED_COLORS = ['red', 'green', 'blue', 'yellow', 'orange', 'white'];

export const TopToolbar: React.FC<TopToolbarProps> = ({
    selectedComponent,
    selectedWire,
    updateComponent,
    updateWire,
    deleteComponent,
    deleteWire,
    duplicateComponent,
    undo,
    redo,
    canUndo,
    canRedo
}) => {
    const [resValue, setResValue] = useState<string>('1000');
    const [resMultiplier, setResMultiplier] = useState<number>(1);

    useEffect(() => {
        if (selectedComponent?.type === 'wokwi-resistor') {
            const raw = parseFloat(selectedComponent.properties?.value as string) || 1000;
            if (raw >= 1000000) {
                setResValue((raw / 1000000).toString());
                setResMultiplier(1000000);
            } else if (raw >= 1000) {
                setResValue((raw / 1000).toString());
                setResMultiplier(1000);
            } else {
                setResValue(raw.toString());
                setResMultiplier(1);
            }
        }
    }, [selectedComponent]);

    const handleResistorChange = (val: string, mult: number) => {
        setResValue(val);
        setResMultiplier(mult);
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) {
            const finalValue = parsed * mult;
            updateComponent(selectedComponent!.id, { properties: { ...selectedComponent!.properties, value: finalValue.toString() } });
        }
    };

    const handleRotate = () => {
        if (!selectedComponent) return;
        const currentRot = selectedComponent.rotation || 0;
        updateComponent(selectedComponent.id, { rotation: (currentRot + 15) % 360 });
    };

    const handleMirror = () => {
        if (!selectedComponent) return;
        const node = document.querySelector(`[data-comp-id="${selectedComponent.id}"] > div`) as HTMLElement;
        const width = node ? (node.offsetWidth || 50) : 50; 

        const rot = selectedComponent.rotation || 0;
        const rad = rot * Math.PI / 180;
        const sign = selectedComponent.mirrored ? -1 : 1;
        
        const dx = width * Math.cos(rad) * sign;
        const dy = width * Math.sin(rad) * sign;
        
        updateComponent(selectedComponent.id, { 
            mirrored: !selectedComponent.mirrored,
            x: selectedComponent.x + dx,
            y: selectedComponent.y + dy
        });
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '56px',
            backgroundColor: 'var(--bg-panel)',
            borderRadius: '28px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-panel)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            color: 'var(--text-main)',
            zIndex: 1000,
            gap: '12px',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <style>{`
                .tb-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-main);
                    padding: 8px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .tb-btn:hover:not(:disabled) {
                    background: var(--bg-hover);
                    color: var(--accent-blue);
                    transform: translateY(-2px);
                }
                .tb-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .tb-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .tb-divider {
                    width: 1px;
                    height: 24px;
                    background: var(--border-light);
                    margin: 0 4px;
                }
            `}</style>
            
            {/* Global Actions */}
            <div style={{ display: 'flex', gap: '4px' }}>
                <button className="tb-btn" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
                    <Undo2 size={20} />
                </button>
                <button className="tb-btn" title="Redo (Ctrl+Y)" disabled={!canRedo} onClick={redo}>
                    <Redo2 size={20} />
                </button>
            </div>

            <div className="tb-divider" />

            {/* Component/Wire Actions */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                {(!selectedComponent && !selectedWire) && (
                    <span style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>
                        Select a component or wire to see properties...
                    </span>
                )}

                {selectedWire && (
                    <>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Wire</span>
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                            {WIRE_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => updateWire(selectedWire.id, { color })}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        backgroundColor: color,
                                        border: selectedWire.color === color ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        boxShadow: selectedWire.color === color ? '0 0 10px rgba(255,255,255,0.3)' : 'none'
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ flex: 1 }} />
                        <button className="tb-btn" style={{ color: '#ef4444' }} title="Delete Wire" onClick={() => deleteWire(selectedWire.id)}>
                            <Trash2 size={20} />
                        </button>
                    </>
                )}

                {selectedComponent && (
                    <>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                            {(selectedComponent.type || '').replace('wokwi-', '').replace('custom-', '').replace('-', ' ').toUpperCase()}
                        </span>
                        
                        <div className="tb-divider" style={{ margin: '0 8px' }} />

                        {/* Common Component Actions */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="tb-btn" title="Copy / Duplicate" onClick={() => duplicateComponent(selectedComponent.id)}>
                                <Copy size={20} />
                            </button>
                            <button className="tb-btn" title="Rotate 15°" onClick={handleRotate}>
                                <RotateCw size={20} />
                            </button>
                            <button className="tb-btn" title="Mirror (Flip)" onClick={handleMirror}>
                                <FlipHorizontal size={20} />
                            </button>
                        </div>

                        <div className="tb-divider" style={{ margin: '0 8px' }} />

                        {/* Specific Properties */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {selectedComponent.type === 'wokwi-resistor' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 500 }}>Resistance:</span>
                                    <input 
                                        type="number"
                                        value={resValue}
                                        onChange={(e) => handleResistorChange(e.target.value, resMultiplier)}
                                        style={{ width: '70px', background: 'var(--bg-canvas)', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '6px 8px', borderRadius: '6px', outline: 'none' }}
                                    />
                                    <select 
                                        value={resMultiplier}
                                        onChange={(e) => handleResistorChange(resValue, Number(e.target.value))}
                                        style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '6px 8px', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}
                                    >
                                        <option value={1}>Ω</option>
                                        <option value={1000}>kΩ</option>
                                        <option value={1000000}>MΩ</option>
                                    </select>
                                </div>
                            )}

                            {selectedComponent.type === 'wokwi-led' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>Color:</span>
                                    {LED_COLORS.map(color => {
                                        const actualColor = color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : color === 'blue' ? '#3b82f6' : color === 'yellow' ? '#eab308' : color === 'orange' ? '#f97316' : '#ffffff';
                                        const isSelected = (selectedComponent.properties?.color || 'red') === color;
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => updateComponent(selectedComponent.id, { properties: { ...selectedComponent.properties, color } })}
                                                style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: actualColor, border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', outline: 'none' }}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {selectedComponent.type === 'wokwi-hc-sr04' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>Distance ({selectedComponent.properties?.distance || 100}cm):</span>
                                    <input 
                                        type="range" min="2" max="400" 
                                        value={selectedComponent.properties?.distance || 100}
                                        onChange={(e) => updateComponent(selectedComponent.id, { properties: { ...selectedComponent.properties, distance: parseInt(e.target.value) } })}
                                    />
                                </div>
                            )}

                            {(selectedComponent.type === 'custom-tmp36' || selectedComponent.type === 'wokwi-ntc-temperature-sensor') && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>Temp ({selectedComponent.properties?.temperature || 25}°C):</span>
                                    <input 
                                        type="range" min="-40" max="125" 
                                        value={selectedComponent.properties?.temperature || 25}
                                        onChange={(e) => updateComponent(selectedComponent.id, { properties: { ...selectedComponent.properties, temperature: e.target.value } })}
                                    />
                                </div>
                            )}

                            {selectedComponent.type === 'wokwi-photoresistor-sensor' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>Lux ({selectedComponent.properties?.illuminance || 500}):</span>
                                    <input 
                                        type="range" min="0" max="100000" 
                                        value={selectedComponent.properties?.illuminance || 500}
                                        onChange={(e) => updateComponent(selectedComponent.id, { properties: { ...selectedComponent.properties, illuminance: e.target.value } })}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ flex: 1 }} />
                        <button className="tb-btn" style={{ color: '#ef4444' }} title="Delete Component" onClick={() => deleteComponent(selectedComponent.id)}>
                            <Trash2 size={20} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
