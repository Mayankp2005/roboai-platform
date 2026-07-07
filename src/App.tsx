import { useState, useRef, useEffect, useCallback } from 'react';
import { Cloud, Save, Upload, Download } from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Configure Monaco to use the local npm package instead of a CDN (fixes Electron ENOENT error)
loader.config({ monaco });

import { BlocklyWorkspace, type BlocklyWorkspaceRef } from './components/BlocklyWorkspace';
import { CodeViewer } from './components/CodeViewer';
import { DataStudio } from './components/DataStudio';
import { StudentManual } from './components/StudentManual';
import { Header } from './components/Header';
import { SidePanel } from './components/SidePanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { CircuitSimulator } from './components/CircuitSimulator';
import { useToast } from './hooks/useToast';
import { useSerial } from './hooks/useSerial';
import { useBluetooth } from './hooks/useBluetooth';
import { useFlash } from './hooks/useFlash';
import { useSimulation } from './hooks/useSimulation';
import { auth } from './firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import './index.css';
import logoUrl from './assets/logo.jpg';

function App() {
  const editorRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<'blocks' | 'code' | 'circuit' | 'data' | 'manual'>('blocks');
  const [isCircuitCodeOpen, setIsCircuitCodeOpen] = useState(false);
  const [monitorTab, setMonitorTab] = useState<'serial' | 'simulation' | 'stage' | 'vision'>('stage');
  const [hardwareGeneratedCode, setHardwareGeneratedCode] = useState<string>('');
  const [softwareGeneratedCode, setSoftwareGeneratedCode] = useState<string>('');
  const [softwareCppCode, setSoftwareCppCode] = useState<string>('');
  const [circuitEditorMode, setCircuitEditorMode] = useState<'blocks' | 'blocks_text' | 'text'>('blocks');
  const [manualCode, setManualCode] = useState<string>('');
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [sidePanelWidth, setSidePanelWidth] = useState(420);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('./assets/images/character.png');
  const [selectedBackground, setSelectedBackground] = useState<string>('./assets/images/bg-space.jpg');


  const serialBufferRef = useRef<string>('');

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(420);
  const softwareWorkspaceRef = useRef<BlocklyWorkspaceRef>(null);
  const hardwareWorkspaceRef = useRef<BlocklyWorkspaceRef>(null);

  // --- Custom Hooks ---
  const { toasts, addToast, removeToast } = useToast();

  const effectiveHardwareCode = activeTab === 'blocks' 
    ? softwareCppCode 
    : (circuitEditorMode === 'text' ? manualCode : hardwareGeneratedCode);

  const syncWorkspaceState = (state: any, source: 'builder' | 'circuit') => {
    if (source === 'builder') {
      hardwareWorkspaceRef.current?.loadState(state);
    } else {
      softwareWorkspaceRef.current?.loadState(state);
    }
  };

  const handleModeSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as 'blocks' | 'blocks_text' | 'text';
    if (circuitEditorMode === 'text' && mode !== 'text') {
      const confirm = window.confirm("Switching back to blocks will discard any manual text edits. Continue?");
      if (!confirm) return;
    }
  
    if (mode === 'text' && circuitEditorMode !== 'text') {
      setManualCode(hardwareGeneratedCode);
    }
    setCircuitEditorMode(mode);
  };

  const serial = useSerial(addToast);
  const bluetooth = useBluetooth(addToast, serial.setSerialLogs);

  const { handleFlash } = useFlash({
    isConnected: serial.isConnected,
    setIsConnected: serial.setIsConnected,
    setSerialLogs: serial.setSerialLogs,
    portRef: serial.portRef,
    readerRef: serial.readerRef,
    closedPromiseRef: serial.closedPromiseRef,
    isConnectedRef: serial.isConnectedRef,
    readUntilClosed: serial.readUntilClosed,
    generatedCode: effectiveHardwareCode, // Hardware code flashes to ESP32
    addToast,
  });

  const { handleRunSimulation } = useSimulation({
    jsGeneratedCode: softwareGeneratedCode, // Software code runs the Stage
    setSimLogs,
    setMonitorTab,
    addToast,
  });

  // --- Side Effects ---

  // Drag-to-resize side panel
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidePanelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidePanelWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartX.current - e.clientX;
      const newWidth = Math.min(600, Math.max(220, dragStartWidth.current + delta));
      setSidePanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Listen for Authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        addToast(`Signed in as ${currentUser.displayName || currentUser.email?.split('@')[0]}`, 'success');
      }
    });
    return () => unsubscribe();
  }, [addToast]);

  // Web Serial & Bluetooth AI detection writer — bridges vision detections to ESP32
  const lastWriteTimeRef = useRef<number>(0);
  useEffect(() => {
    const handleVisionDetect = async (e: any) => {
      const isSerial = serial.isConnectedRef.current && serial.portRef.current && serial.portRef.current.writable;
      const isBle = bluetooth.isBleConnectedRef.current;

      if (!isSerial && !isBle) return;

      const now = Date.now();
      if (now - lastWriteTimeRef.current < 200) return;

      const detectedClasses = (e as CustomEvent).detail as string[];
      const newDetections = detectedClasses.join(',');
      const payload = `DETECT:${newDetections}\n`;

      lastWriteTimeRef.current = now;

      if (isSerial) {
        let writer;
        try {
          writer = serial.portRef.current.writable.getWriter();
          await writer.write(new TextEncoder().encode(payload));
        } catch (err) {
          // Ignore abrupt disconnects
        } finally {
          if (writer) writer.releaseLock();
        }
      } else if (isBle) {
        await bluetooth.writeBluetooth(payload);
      }
    };
    window.addEventListener('vision_detect', handleVisionDetect);
    return () => window.removeEventListener('vision_detect', handleVisionDetect);
  }, [serial.isConnectedRef, serial.portRef, bluetooth.isBleConnectedRef, bluetooth.writeBluetooth]);

  // Handle Theme switching on document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Ensure Blockly SVGs resize correctly when toggling visibility
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, isCircuitCodeOpen]);

  // --- Render ---
  return (
    <div className="app-layout">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        user={user}
        onSignInClick={() => setIsAuthModalOpen(true)}
        isConnected={serial.isConnected}
        onConnectDevice={serial.handleConnectDevice}
        isBleConnected={bluetooth.isBleConnected}
        onConnectBluetooth={bluetooth.handleConnectBluetooth}
        onFlash={handleFlash}
        onRunSimulation={handleRunSimulation}
        logoUrl={logoUrl}
      />

      <main className="main-content">
        {/* Workspace Area */}
        <div className="workspace-container glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Workspace Toolbar (Only visible on blocks tab) */}
          <div className="workspace-toolbar" style={{ display: (activeTab === 'blocks' || activeTab === 'circuit') ? 'flex' : 'none' }}>
            <div className="workspace-toolbar-left">
              <span className="workspace-label">
                {user ? <><Cloud size={14} color="var(--accent-blue)" /> Cloud Workspace</> : <><Save size={14} color="var(--text-muted)" /> Local Workspace</>}
                <span style={{ marginLeft: 8, opacity: 0.7 }}>({activeTab === 'circuit' ? 'Hardware' : 'Software'})</span>
              </span>
            </div>
            <div className="workspace-toolbar-right">
              <button className="btn btn-outline workspace-btn" onClick={() => (activeTab === 'circuit' ? hardwareWorkspaceRef : softwareWorkspaceRef).current?.loadWorkspace()} title="Import from File">
                <Upload size={14} /> Local
              </button>
              <button className="btn btn-outline workspace-btn" onClick={() => (activeTab === 'circuit' ? hardwareWorkspaceRef : softwareWorkspaceRef).current?.saveWorkspace()} title="Export to File">
                <Download size={14} /> Local
              </button>
              {activeTab === 'circuit' && (
                <>
                  <div className="divider-line divider-short"></div>
                  <select 
                    className="btn btn-outline workspace-btn"
                    style={{ appearance: 'auto', paddingRight: '24px', backgroundColor: 'var(--bg-panel)' }}
                    value={circuitEditorMode}
                    onChange={handleModeSwitch}
                  >
                    <option value="blocks">Blocks</option>
                    <option value="blocks_text">Blocks + Text</option>
                    <option value="text">Text</option>
                  </select>
                </>
              )}
              <div className="divider-line divider-short"></div>
              <button
                className="btn btn-outline workspace-btn"
                style={{
                  color: user ? 'var(--accent-blue)' : 'var(--text-muted)',
                  borderColor: user ? 'rgba(59, 130, 246, 0.4)' : ''
                }}
                onClick={() => user ? (activeTab === 'circuit' ? hardwareWorkspaceRef : softwareWorkspaceRef).current?.loadFromCloud(user.uid) : setIsAuthModalOpen(true)}
              >
                <Cloud size={14} /> {user ? 'Load Cloud' : 'Sign in to Load'}
              </button>
              <button
                className={user ? "btn btn-primary workspace-btn" : "btn btn-outline workspace-btn"}
                style={{ opacity: user ? 1 : 0.5 }}
                onClick={() => user ? (activeTab === 'circuit' ? hardwareWorkspaceRef : softwareWorkspaceRef).current?.saveToCloud(user.uid) : setIsAuthModalOpen(true)}
              >
                <Save size={14} /> {user ? 'Save Cloud' : 'Sign in to Save'}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
            {/* 1. Software Workspace (Visual Builder) */}
            <div style={{ 
                flex: 1, 
                position: 'relative', 
                display: activeTab === 'blocks' ? 'flex' : 'none',
            }}>
                <ErrorBoundary name="Software Workspace">
                  <BlocklyWorkspace
                    ref={softwareWorkspaceRef}
                    theme={theme}
                    workspaceType="builder"
                    onCodeChange={(cpp, js) => {
                      setSoftwareGeneratedCode(js);
                      setSoftwareCppCode(cpp);
                    }}
                    onWorkspaceLoaded={(state) => syncWorkspaceState(state, 'builder')}
                    onToast={addToast}
                  />
                </ErrorBoundary>
            </div>

            {/* 2. Hardware Workspace + Circuit Simulator (Split Screen) */}
            <div style={{ flex: 1, display: activeTab === 'circuit' ? 'flex' : 'none', position: 'relative', flexDirection: 'row' }}>
            {/* Circuit Simulator (Left Side) */}
            <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
              <CircuitSimulator 
                  generatedCode={effectiveHardwareCode} 
                  addToast={addToast} 
                  theme={theme} 
                  isCodeOpen={isCircuitCodeOpen}
                  onToggleCode={() => setIsCircuitCodeOpen(!isCircuitCodeOpen)}
                  onSerialOutput={(char: string) => {
                      if (char === '\n') {
                          const w = window as any;
                          if (!w._simLogQueue) w._simLogQueue = [];
                          w._simLogQueue.push(serialBufferRef.current);
                          serialBufferRef.current = '';
                          if (!w._simLogTimer) {
                              w._simLogTimer = setTimeout(() => {
                                  setSimLogs(prev => [...prev, ...w._simLogQueue].slice(-100));
                                  w._simLogQueue = [];
                                  w._simLogTimer = null;
                              }, 100);
                          }
                      } else {
                          serialBufferRef.current += char;
                      }
                  }}
                  simLogs={simLogs}
              />
            </div>

            {/* Hardware Blocks (Right Side) */}
            <div style={{ 
                flex: isCircuitCodeOpen ? '0 0 40%' : '0 0 0%', 
                display: isCircuitCodeOpen ? 'flex' : 'none',
                borderLeft: isCircuitCodeOpen ? '1px solid var(--border-main)' : 'none',
                position: 'relative',
                flexDirection: circuitEditorMode === 'blocks_text' ? 'column' : 'row'
            }}>
              <div style={{ flex: 1, display: circuitEditorMode === 'text' ? 'none' : 'block', position: 'relative' }}>
                <ErrorBoundary name="Hardware Workspace">
                  <BlocklyWorkspace
                    ref={hardwareWorkspaceRef}
                    theme={theme}
                    workspaceType="circuit"
                    onCodeChange={(cpp, _js) => {
                      setHardwareGeneratedCode(cpp);
                    }}
                    onWorkspaceLoaded={(state) => syncWorkspaceState(state, 'circuit')}
                    onToast={addToast}
                  />
                </ErrorBoundary>
              </div>
              
              <div style={{ 
                  flex: 1, 
                  display: circuitEditorMode === 'blocks' ? 'none' : 'block', 
                  borderTop: circuitEditorMode === 'blocks_text' ? '1px solid var(--border-main)' : 'none',
                  position: 'relative',
                  backgroundColor: 'var(--bg-panel-dark)'
              }}>
                <ErrorBoundary name="Hardware Code Editor">
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: '8px 0' }}>
                    <div style={{ padding: '0 16px 8px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{circuitEditorMode === 'blocks_text' ? 'C++ Code (Read Only)' : 'C++ Code (Editable)'}</span>
                    </div>
                    <div style={{ height: 'calc(100% - 28px)' }}>
                        <Editor
                          height="100%"
                          defaultLanguage="cpp"
                          theme={theme === 'dark' ? 'vs-dark' : 'light'}
                          value={effectiveHardwareCode}
                          onChange={(val) => {
                              if (circuitEditorMode === 'text') {
                                  setManualCode(val || '');
                              }
                          }}
                          onMount={(editor, monaco) => {
                              editorRef.current = editor;
                              // Explicitly bind Ctrl+C and Ctrl+V to bypass any Electron menu issues
                              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, async () => {
                                  if (editor.getOption(monaco.editor.EditorOption.readOnly)) return;
                                  try {
                                      const text = await navigator.clipboard.readText();
                                      editor.trigger('keyboard', 'type', { text });
                                  } catch (err) {
                                      console.error("Failed to read clipboard:", err);
                                  }
                              });
                              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, async () => {
                                  try {
                                      const selection = editor.getSelection();
                                      if (selection) {
                                          const text = editor.getModel()?.getValueInRange(selection);
                                          if (text) await navigator.clipboard.writeText(text);
                                      }
                                  } catch (err) {
                                      console.error("Failed to write clipboard:", err);
                                  }
                              });
                              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, async () => {
                                  if (editor.getOption(monaco.editor.EditorOption.readOnly)) return;
                                  try {
                                      const selection = editor.getSelection();
                                      if (selection) {
                                          const text = editor.getModel()?.getValueInRange(selection);
                                          if (text) {
                                              await navigator.clipboard.writeText(text);
                                              editor.executeEdits("clipboard", [{ range: selection, text: "" }]);
                                          }
                                      }
                                  } catch (err) {}
                              });
                          }}
                          options={{
                              readOnly: circuitEditorMode === 'blocks_text',
                              minimap: { enabled: false },
                              fontSize: 14,
                              fontFamily: 'monospace',
                              scrollBeyondLastLine: false,
                              wordWrap: 'on',
                              contextmenu: false // Disable Monaco's broken context menu so Electron native menu works
                          }}
                        />
                    </div>
                  </div>
                </ErrorBoundary>
              </div>
            </div>
          </div>

          {/* Other Tabs */}
          {activeTab === 'code' && <CodeViewer generatedCode={hardwareGeneratedCode} />}
          {activeTab === 'data' && <DataStudio isConnected={serial.isConnected} serialLogs={serial.serialLogs} />}
          {activeTab === 'manual' && <StudentManual />}
        </div>
      </div>

      {/* Drag Handle */}
      <div className="drag-handle" onMouseDown={handleDragStart} title="Drag to resize" />

      {/* Right Side Panel */}
      <div className="side-panel" style={{ width: `${sidePanelWidth}px`, minWidth: '220px', maxWidth: '600px', flexShrink: 0, display: activeTab === 'circuit' ? 'none' : 'flex' }}>
        <SidePanel
          monitorTab={monitorTab}
            setMonitorTab={setMonitorTab}
            serialLogs={serial.serialLogs}
            simLogs={simLogs}
            isConnected={serial.isConnected}
            selectedCharacter={selectedCharacter}
            setSelectedCharacter={setSelectedCharacter}
            selectedBackground={selectedBackground}
            setSelectedBackground={setSelectedBackground}
          />
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => addToast(msg, 'success')}
        onError={(msg) => addToast(msg, 'error')}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
