import React, { useState, useEffect } from 'react';
import type { Wire } from '../utils/circuitPins';
import type { CircuitComponent } from './CircuitSimulator';

interface PropertiesPanelProps {
    selectedComponent: CircuitComponent | null;
    selectedWire: Wire | null;
    updateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
    updateWire: (id: string, updates: Partial<Wire>) => void;
    deleteComponent: (id: string) => void;
    deleteWire: (id: string) => void;
}

const WIRE_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7', '#000000', '#ffffff'];
const LED_COLORS = ['red', 'green', 'blue', 'yellow', 'orange', 'white'];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
    selectedComponent,
    selectedWire,
    updateComponent,
    updateWire,
    deleteComponent,
    deleteWire
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

    if (!selectedComponent && !selectedWire) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            width: '280px',
            backgroundColor: 'rgba(25, 25, 30, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            padding: '20px',
            color: 'white',
            zIndex: 1000,
            animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .prop-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 13px;
                }
                .prop-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                .prop-btn.danger {
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.3);
                    background: rgba(239, 68, 68, 0.1);
                }
                .prop-btn.danger:hover {
                    background: rgba(239, 68, 68, 0.2);
                }
            `}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {selectedWire ? 'Wire Properties' : (selectedComponent?.type || '').replace('wokwi-', '').replace('-', ' ').toUpperCase()}
                </h3>
            </div>

            {selectedWire && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Wire Color</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                    </div>
                    <button className="prop-btn danger" onClick={() => deleteWire(selectedWire.id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                        Delete Wire
                    </button>
                </div>
            )}

            {selectedComponent && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {selectedComponent.type === 'wokwi-resistor' && (
                        <div>
                            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Resistance</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="number"
                                    value={resValue}
                                    onChange={(e) => handleResistorChange(e.target.value, resMultiplier)}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        outline: 'none'
                                    }}
                                />
                                <select 
                                    value={resMultiplier}
                                    onChange={(e) => handleResistorChange(resValue, Number(e.target.value))}
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value={1}>Ω</option>
                                    <option value={1000}>kΩ</option>
                                    <option value={1000000}>MΩ</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {selectedComponent.type === 'wokwi-led' && (
                        <div>
                            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>LED Color</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {LED_COLORS.map(color => {
                                    const actualColor = color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : color === 'blue' ? '#3b82f6' : color === 'yellow' ? '#eab308' : color === 'orange' ? '#f97316' : '#ffffff';
                                    const isSelected = (selectedComponent.properties?.color || 'red') === color;
                                    return (
                                        <button
                                            key={color}
                                            onClick={() => updateComponent(selectedComponent.id, { properties: { ...selectedComponent.properties, color } })}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '8px',
                                                backgroundColor: actualColor,
                                                border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                                                cursor: 'pointer',
                                                outline: 'none',
                                                boxShadow: isSelected ? `0 0 12px ${actualColor}` : 'none'
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {selectedComponent.type === 'wokwi-hc-sr04' && (
                        <div>
                            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>
                                Target Distance (cm)
                            </label>
                            <input 
                                type="range" 
                                min="2" 
                                max="400" 
                                value={selectedComponent.properties?.distance || 100}
                                onChange={(e) => updateComponent(selectedComponent.id, { properties: { ...selectedComponent.properties, distance: parseInt(e.target.value) } })}
                                style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
                            />
                            <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '4px', fontWeight: 'bold' }}>
                                {selectedComponent.properties?.distance || 100} cm
                            </div>
                        </div>
                    )}

                    {selectedComponent.type === 'wokwi-photoresistor-sensor' && (
                        <div>
                            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>
                                Light Level (Lux)
                            </label>
                            <input 
                                type="range" 
                                min="0" 
                                max="100000" 
                                value={selectedComponent.properties?.illuminance || 500}
                                onChange={(e) => updateComponent(selectedComponent.id, { properties: { ...selectedComponent.properties, illuminance: e.target.value } })}
                                style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
                            />
                            <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '4px', fontWeight: 'bold' }}>
                                {selectedComponent.properties?.illuminance || 500} Lux
                            </div>
                        </div>
                    )}

                    {(selectedComponent.type === 'custom-tmp36' || selectedComponent.type === 'wokwi-ntc-temperature-sensor') && (
                        <div>
                            <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>
                                Temperature (°C)
                            </label>
                            <input 
                                type="range" 
                                min="-40" 
                                max="125" 
                                value={selectedComponent.properties?.temperature || 25}
                                onChange={(e) => updateComponent(selectedComponent.id, { properties: { ...selectedComponent.properties, temperature: e.target.value } })}
                                style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
                            />
                            <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '4px', fontWeight: 'bold' }}>
                                {selectedComponent.properties?.temperature || 25}°C
                            </div>
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '4px' }}>
                        <button className="prop-btn danger" style={{ width: '100%' }} onClick={() => deleteComponent(selectedComponent.id)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                            Delete Component
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
