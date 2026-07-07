import React from 'react';

interface CodeViewerProps {
    generatedCode: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ generatedCode }) => {
    return (
        <div style={{ padding: '24px', fontFamily: 'monospace', width: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'var(--accent-purple)' }}>// Generated Firmware Logic</h3>
            </div>
            <pre className="glass-panel" style={{
                color: 'var(--text-main)',
                background: 'var(--bg-panel-dark)',
                padding: '24px',
                borderRadius: '8px',
                minHeight: '300px',
                overflowX: 'auto',
                fontSize: '0.95rem',
                border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
                {generatedCode || '// Drag blocks into the workspace to generate code...'}
            </pre>
        </div>
    );
};
