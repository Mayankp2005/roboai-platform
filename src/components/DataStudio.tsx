import React from 'react';
import { Database } from 'lucide-react';

interface DataStudioProps {
    isConnected: boolean;
    serialLogs?: string[];
}

export const DataStudio: React.FC<DataStudioProps> = ({ isConnected, serialLogs = [] }) => {
    // Find the latest valid data log (ignoring system messages)
    const latestData = [...serialLogs].reverse().find(log => log && !log.startsWith('['));
    const cleanLog = latestData ? latestData.replace('>', '').trim() : '';
    const parsedNum = cleanLog ? parseFloat(cleanLog) : null;
    const axValue = (parsedNum !== null && !isNaN(parsedNum)) ? parsedNum.toFixed(2) : "0.00";

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', overflowY: 'auto' }}>
            <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}>
                    <Database size={24} color="var(--accent-blue)" />
                    Data Studio & ML Training
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    Record real-time sensor streams from the connected RoboAI board to train Edge AI models.
                </p>
            </div>

            <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-panel-alt)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>Live Telemetry</h3>
                    <button className="btn btn-outline" disabled={!isConnected}>Start Recording (CSV)</button>
                </div>

                {!isConnected ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-panel-alt)', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                        Connect your ESP32 device to view live telemetry.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ background: 'var(--bg-console)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>IMU (MPU6050)</h4>
                            <div style={{ fontFamily: 'monospace', color: 'var(--accent-green)', fontSize: '1.1rem' }}>
                                <div>AX: {axValue.padStart(5, ' ')} | AY: -0.01 | AZ:  0.98</div>
                                <div>GX: -0.00 | GY:  0.01 | GZ: -0.01</div>
                            </div>
                        </div>
                        <div style={{ background: 'var(--bg-console)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Environment</h4>
                            <div style={{ fontFamily: 'monospace', color: 'var(--accent-blue)', fontSize: '1.1rem' }}>
                                <div>Distance: 12.4 cm</div>
                                <div>Brightness: 84 %</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
