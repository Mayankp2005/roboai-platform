import { useRef, useEffect, useState } from 'react';
import { Terminal, Radio } from 'lucide-react';
import { CharacterStage } from './CharacterStage';
import { VisionMonitor } from './VisionMonitor';
import { ErrorBoundary } from './ErrorBoundary';

interface SidePanelProps {
  monitorTab: 'serial' | 'simulation' | 'stage' | 'vision';
  setMonitorTab: (tab: 'serial' | 'simulation' | 'stage' | 'vision') => void;
  serialLogs: string[];
  simLogs: string[];
  isConnected: boolean;
  selectedCharacter: string;
  setSelectedCharacter: (src: string) => void;
  selectedBackground: string;
  setSelectedBackground: (src: string) => void;
}

const CHARACTERS = [
  { id: 'default', src: './assets/images/character.png', name: 'Original' },
  { id: 'dog', src: './assets/images/character-dog.png', name: 'Robot Dog' },
  { id: 'astronaut', src: './assets/images/character-astronaut.png', name: 'Astronaut' },
  { id: 'alien', src: './assets/images/character-alien.png', name: 'Alien' },
  { id: 'boy', src: './assets/images/character-boy.png', name: 'Robot Boy' },
  { id: 'retro', src: './assets/images/character-retro.png', name: 'Retro Robot' },
  { id: 'ninja', src: './assets/images/character-ninja.png', name: 'Ninja' },
];

const BACKGROUNDS = [
  { id: 'default', src: '', name: 'Blank White' },
  { id: 'space', src: './assets/images/bg-space.png', name: 'Space' },
  { id: 'robotics', src: './assets/images/bg-robotics.png', name: 'Robotics Lab' },
  { id: 'tech', src: './assets/images/bg-tech.png', name: 'Technology' },
];

export const SidePanel: React.FC<SidePanelProps> = ({
  monitorTab, setMonitorTab,
  serialLogs, simLogs, isConnected,
  selectedCharacter, setSelectedCharacter,
  selectedBackground, setSelectedBackground,
}) => {
  const serialEndRef = useRef<HTMLDivElement>(null);
  const simEndRef = useRef<HTMLDivElement>(null);
  const [isCharSelectorOpen, setIsCharSelectorOpen] = useState(false);
  const [isBgSelectorOpen, setIsBgSelectorOpen] = useState(false);

  // Auto-scroll to bottom whenever new logs arrive
  useEffect(() => {
    if (serialEndRef.current) {
      serialEndRef.current.scrollTop = serialEndRef.current.scrollHeight;
    }
  }, [serialLogs]);

  useEffect(() => {
    if (simEndRef.current) {
      simEndRef.current.scrollTop = simEndRef.current.scrollHeight;
    }
  }, [simLogs]);

  return (
    <>
      <div className="glass-panel side-panel-main">
        <div className="monitor-header">
          <Terminal size={18} color="var(--text-muted)" />
          <div className="monitor-tabs">
            <button
              className={`monitor-tab-btn ${monitorTab === 'serial' ? 'active' : ''}`}
              onClick={() => setMonitorTab('serial')}
            >
              Serial Monitor
            </button>
            <button
              className={`monitor-tab-btn ${monitorTab === 'simulation' ? 'active' : ''}`}
              onClick={() => setMonitorTab('simulation')}
            >
              Simulation
            </button>
            <button
              className={`monitor-tab-btn ${monitorTab === 'stage' ? 'active accent-blue' : ''}`}
              onClick={() => setMonitorTab('stage')}
            >
              🤖 Stage
            </button>
            <button
              className={`monitor-tab-btn ${monitorTab === 'vision' ? 'active accent-purple' : ''}`}
              onClick={() => setMonitorTab('vision')}
            >
              📷 Vision
            </button>
          </div>
        </div>

        {/* Serial Monitor Log */}
        <div
          ref={serialEndRef}
          className="log-panel log-panel--serial"
          style={{ flex: monitorTab === 'serial' ? 1 : 0, display: monitorTab === 'serial' ? 'flex' : 'none' }}
        >
          {serialLogs.length === 0 && (
            <div style={{ color: 'var(--text-muted)' }}>No serial data yet.</div>
          )}
          {(serialLogs || []).map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>

        {/* Simulation Log */}
        <div
          ref={simEndRef}
          className="log-panel log-panel--sim"
          style={{ flex: monitorTab === 'simulation' ? 1 : 0, display: monitorTab === 'simulation' ? 'flex' : 'none' }}
        >
          {simLogs.length === 0 && (
            <div style={{ color: 'var(--text-muted)' }}>Run a simulation to see output here.</div>
          )}
          {(simLogs || []).map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>

        {/* Character Stage */}
        <div style={{ flex: monitorTab === 'stage' ? 1 : 0, display: monitorTab === 'stage' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <ErrorBoundary name="Character Stage">
              <CharacterStage characterImage={selectedCharacter} backgroundImage={selectedBackground} />
            </ErrorBoundary>
          </div>

          <div className="char-controls">
            <button
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '6px 16px', borderColor: isCharSelectorOpen ? 'var(--accent-blue)' : '' }}
              onClick={() => {
                setIsCharSelectorOpen(!isCharSelectorOpen);
                if (!isCharSelectorOpen) setIsBgSelectorOpen(false);
              }}
            >
              {isCharSelectorOpen ? 'Hide Characters' : 'Choose Character'}
            </button>
            <button
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '6px 16px', borderColor: isBgSelectorOpen ? 'var(--accent-purple)' : '' }}
              onClick={() => {
                setIsBgSelectorOpen(!isBgSelectorOpen);
                if (!isBgSelectorOpen) setIsCharSelectorOpen(false);
              }}
            >
              {isBgSelectorOpen ? 'Hide Backgrounds' : 'Choose Background'}
            </button>
            <button
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '6px 16px', marginLeft: 'auto', borderColor: 'var(--border-light)' }}
              onClick={() => window.characterStageApi?.reset()}
              title="Reset character position and effects"
            >
              Reset Stage
            </button>
          </div>

          {isCharSelectorOpen && (
            <div className="selector-strip">
              {(CHARACTERS || []).map((char) => (
                <button
                  key={char.id}
                  onClick={() => { setSelectedCharacter(char.src); setIsCharSelectorOpen(false); }}
                  title={char.name}
                  className={`selector-option ${selectedCharacter === char.src ? 'selected-blue' : ''}`}
                  style={{ width: '48px', height: '48px' }}
                >
                  <img src={char.src} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          )}

          {isBgSelectorOpen && (
            <div className="selector-strip">
              {(BACKGROUNDS || []).map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => { setSelectedBackground(bg.src); setIsBgSelectorOpen(false); }}
                  title={bg.name}
                  className={`selector-option ${selectedBackground === bg.src ? 'selected-purple' : ''}`}
                  style={{ width: '80px', height: '60px' }}
                >
                  {bg.src ? (
                    <img src={bg.src} alt={bg.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>{bg.name}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vision Monitor */}
        <div style={{ flex: monitorTab === 'vision' ? 1 : 0, display: monitorTab === 'vision' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
          <ErrorBoundary name="Vision Monitor">
            <VisionMonitor />
          </ErrorBoundary>
        </div>
      </div>

      {/* Device Info Panel */}
      <div className="glass-panel device-info-panel">
        <div className="section-header">
          <Radio size={18} color="var(--text-muted)" />
          <h3>Device Info</h3>
        </div>
        <div className="device-info-body">
          <div className="device-info-row">
            <span>Board:</span>
            <span className="device-info-value">{isConnected ? 'RoboAI Core (S3)' : '-'}</span>
          </div>
          <div className="device-info-row">
            <span>Status:</span>
            <span className={`device-info-status ${isConnected ? 'online' : 'offline'}`}>
              {isConnected && <span className="status-dot"></span>}
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
