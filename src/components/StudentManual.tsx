import React from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';

export const StudentManual: React.FC = () => {
    return (
        <div style={{ padding: '32px', width: '100%', overflowY: 'auto', color: 'var(--text-main)', lineHeight: '1.6' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h2 style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <BookOpen size={28} />
                    RoboAI 10-Kit Student Manual
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '32px' }}>
                    Welcome to the RoboAI visual programming workspace! This guide will help you understand how to build and execute your robot logic.
                </p>

                <h3 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>1. The Block Workspace</h3>
                <p>
                    The <strong>Visual Builder</strong> tab is your primary workspace. You can drag and drop blocks from the left-hand menu to create logic for your robot without writing text-based code.
                </p>
                <ul style={{ marginBottom: '24px', listStyleType: 'disc', paddingLeft: '24px' }}>
                    <li><strong style={{ color: '#a55b80' }}>Hardware:</strong> Blocks to control motors and read physical sensors (Ultrasonic, IMU).</li>
                    <li><strong style={{ color: '#8b5cf6' }}>Edge AI:</strong> Advanced blocks for Vision Classification and Wake-word detection.</li>
                    <li><strong style={{ color: '#5b80a5' }}>Logic & Math:</strong> Standard blocks to compare values, make decisions (<code>if/else</code>), and do calculations.</li>
                    <li><strong style={{ color: '#5ba58c' }}>Text:</strong> Use the <code>print</code> block to output values like numbers or text to the screen!</li>
                </ul>

                <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--accent-blue)', marginBottom: '32px', display: 'flex', gap: '12px' }}>
                    <AlertCircle color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} size={20} />
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>Pro Tip: Saving Your Work</h4>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>Use the "Save Project" and "Load Project" buttons at the top right of the Visual Builder to save your block layout as a file on your computer!</p>
                    </div>
                </div>

                <h3 style={{ color: 'var(--accent-green)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>2. Executing Your Code</h3>
                <p>
                    Once you snap your blocks together, there are two ways to see them in action:
                </p>
                <div style={{ background: 'var(--bg-panel-dark)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>Option A: Run Simulation (No Hardware Needed)</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                        Click the <strong>Run Simulation</strong> button at the top right. This translates your blocks into Javascript and runs them right here in the browser. The results (like printed text or simulated sensor values) will appear in the <strong>Simulation Output</strong> tab in the right-side panel.
                    </p>
                </div>
                <div style={{ background: 'var(--bg-panel-dark)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Option B: Flash & Run (Real Hardware)</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                        Connect your real RoboAI 10-Kit ESP32 board using a USB cable. Click <strong>Connect Device</strong> to link the browser to the board. Then, click <strong>Flash & Run</strong> to convert your blocks into real C++ firmware and install it on the robot! Check the <strong>Serial Monitor</strong> tab for live hardware logs.
                    </p>
                </div>

                <h3 style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>3. Advanced Tabs</h3>
                <p>
                    - <strong>C++ Firmware:</strong> Curious how your blocks look in real code? Click this tab to see the C++ code updating in real-time as you drag blocks.<br />
                    - <strong>Data Studio:</strong> Used for collecting live telemetry data from your connected robot to train machine learning models.
                </p>

                <h3 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginTop: '32px' }}>4. The 10-Kit Projects Guide</h3>
                <p>Welcome to the <strong>RoboAI "Intelligence-First" Ecosystem</strong>. Here are guided step-by-step instructions to build the 10 official robotics applications using your blocks:</p>

                <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--accent-green)', marginBottom: '16px', display: 'flex', gap: '12px' }}>
                    <div style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>⚡</div>
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>Hardware Crash Course: What are GPIO Pins?</h4>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>Think of the ESP32 main board as the robot's brain. The little metal spikes sticking out from the edges are called <strong>GPIO Pins</strong> (General Purpose Input/Output). You can think of them as the robot's <strong>Mouths and Ears</strong>!<br/><br/>
                        • <strong>Inputs (Ears):</strong> This is where you plug in sensors so the robot can hear, see, or feel things (like distance or light).<br/>
                        • <strong>Outputs (Mouths/Hands):</strong> This is where you plug in motors or speakers so the robot can talk or move!<br/><br/>
                        When the guide below says "Connect to a GPIO pin", simply grab a colorful jumper wire, plug one end into your sensor/motor driver, and slip the other end onto any empty numbered metal spike on the ESP32 (like <code>Pin 13</code> or <code>Pin 4</code>). You will then select this pin number inside your blocks!</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--accent-purple)', marginBottom: '32px', display: 'flex', gap: '12px' }}>
                    <AlertCircle color="var(--accent-purple)" style={{ flexShrink: 0, marginTop: '2px' }} size={20} />
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>📸 IP Camera / Wi-Fi Camera Setup</h4>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>Some projects require AI Vision! Since we use a standard Wi-Fi ESP32, you will use your smartphone or laptop's camera as the robot's "eyes". To do this: <strong>1.</strong> Connect your phone to the same Wi-Fi as your computer. <strong>2.</strong> Open an IP Webcam app on your phone. <strong>3.</strong> Type the URL shown on the app into the RoboAI Platform's Vision Settings! Now your AI can see!</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Project 01 */}
                    <div style={{ background: 'var(--bg-panel-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>01</span>
                            Gesture Pilot
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧰 Hardware & Wiring</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Components:</strong> ESP32 Main Board, MPU6050 (IMU Sensor).</p>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>🔴 <strong>VCC</strong> ➔ <strong>3.3V</strong></li>
                                    <li>⚫ <strong>GND</strong> ➔ <strong>GND</strong></li>
                                    <li>🟡 <strong>SDA</strong> ➔ <strong>Pin 21</strong></li>
                                    <li>🟢 <strong>SCL</strong> ➔ <strong>Pin 22</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧩 Block Logic Steps</h5>
                                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Open the <strong style={{color:'#5ba58c'}}>Text</strong> menu and drag out a <code>Print Message</code> block.</li>
                                    <li>Open the <strong style={{color:'#a55b80'}}>Hardware</strong> menu and drag out a <code>Read IMU Axis</code> block.</li>
                                    <li>Snap the IMU block into the empty slot of the Print block.</li>
                                    <li>Run the code to see your tilt data!</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Project 02 */}
                    <div style={{ background: 'var(--bg-panel-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>02</span>
                            Vision-Based Follower
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧰 Hardware & Wiring</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Components:</strong> ESP32, L298N Motor Driver, 2 Motors, Camera.</p>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li><strong style={{color:'var(--text-main)'}}>Motors to Driver:</strong></li>
                                    <li>⚙️ <strong>Left Motor</strong> ➔ <strong>OUT1 / OUT2</strong></li>
                                    <li>⚙️ <strong>Right Motor</strong> ➔ <strong>OUT3 / OUT4</strong></li>
                                    <li style={{marginTop: '8px'}}><strong style={{color:'var(--text-main)'}}>Driver to ESP32:</strong></li>
                                    <li>🔵 <strong>ENA</strong> ➔ <strong>Pin 14</strong> | <strong>ENB</strong> ➔ <strong>Pin 12</strong></li>
                                    <li>🔵 <strong>IN1</strong> ➔ <strong>Pin 27</strong> | <strong>IN2</strong> ➔ <strong>Pin 26</strong></li>
                                    <li>🔵 <strong>IN3</strong> ➔ <strong>Pin 25</strong> | <strong>IN4</strong> ➔ <strong>Pin 33</strong></li>
                                    <li>⚫ <strong>GND</strong> ➔ <strong>GND</strong> (Crucial: Share ground!)</li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧩 Block Logic Steps</h5>
                                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Drag an <code>🤔 If this happens:</code> block from the <strong style={{color:'#5b80a5'}}>Logic</strong> menu.</li>
                                    <li>Drag a <code>Camera sees [Face]</code> block from the <strong style={{color:'#8b5cf6'}}>Edge AI</strong> menu into the top slot.</li>
                                    <li>Drag a <code>Drive Motor [Both] Forward</code> block from <strong style={{color:'#a55b80'}}>Hardware</strong>.</li>
                                    <li>Snap the motor block inside the "If" block.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Project 03 */}
                    <div style={{ background: 'var(--bg-panel-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>03</span>
                            Neural Line Follower
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧰 Hardware & Wiring</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Components:</strong> ESP32, Motor Driver, Motors, 3x IR Line Sensors.</p>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li><strong style={{color:'var(--text-main)'}}>IR Sensors:</strong></li>
                                    <li>🔴 <strong>VCC</strong> ➔ <strong>3.3V</strong></li>
                                    <li>⚫ <strong>GND</strong> ➔ <strong>GND</strong></li>
                                    <li>🟡 <strong>Left OUT</strong> ➔ <strong>Pin 32</strong></li>
                                    <li>🟡 <strong>Center OUT</strong> ➔ <strong>Pin 35</strong></li>
                                    <li>🟡 <strong>Right OUT</strong> ➔ <strong>Pin 13</strong></li>
                                    <li><em>(Motor driver wired as in Project 02)</em></li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧩 Block Logic Steps</h5>
                                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Drag a <code>🔁 Repeat forever</code> loop from the <strong style={{color:'#5b80a5'}}>Logic</strong> menu.</li>
                                    <li>Place an <code>if / otherwise</code> block inside the loop.</li>
                                    <li>Use a <code>Read IR Line Sensor</code> block as the condition.</li>
                                    <li><strong>If true:</strong> add a <code>Drive Motor [Both] Forward</code> block.</li>
                                    <li><strong>Otherwise:</strong> add a motor block to turn and find the line.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Project 04 */}
                    <div style={{ background: 'var(--bg-panel-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>04</span>
                            Voice Command Bot
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧰 Hardware & Wiring</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Components:</strong> ESP32, INMP441 Mic (or Laptop Mic for simulation).</p>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>🔴 <strong>VDD</strong> ➔ <strong>3.3V</strong></li>
                                    <li>⚫ <strong>GND</strong> ➔ <strong>GND</strong></li>
                                    <li>🟡 <strong>WS</strong> ➔ <strong>Pin 25</strong></li>
                                    <li>🟢 <strong>SCK</strong> ➔ <strong>Pin 26</strong></li>
                                    <li>🔵 <strong>SD</strong> ➔ <strong>Pin 32</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧩 Block Logic Steps</h5>
                                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Drag an <code>🤔 If this happens:</code> block from the <strong style={{color:'#5b80a5'}}>Logic</strong> menu.</li>
                                    <li>Snap a <code>Heard Wake-Word</code> block from <strong style={{color:'#8b5cf6'}}>Edge AI</strong> into the top slot.</li>
                                    <li>Add a <code>💬 Say</code> block or a motor block inside the "If" block.</li>
                                    <li><em>Simulation note: the browser will ask for mic permission!</em></li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Project 05 */}
                    <div style={{ background: 'var(--bg-panel-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>05</span>
                            Smart Traffic Car
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧰 Hardware & Wiring</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Components:</strong> ESP32, Motor Driver, Motors, Camera.</p>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li><em>(Motor driver wired exactly as in Project 02)</em></li>
                                    <li>📱 Use IP Webcam on your phone and hold up paper traffic signs!</li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧩 Block Logic Steps</h5>
                                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Drag an <code>🤔 If this happens:</code> block from the <strong style={{color:'#5b80a5'}}>Logic</strong> menu.</li>
                                    <li>Snap a <code>Camera sees [Stop Sign]</code> block from <strong style={{color:'#8b5cf6'}}>Edge AI</strong> into the top slot.</li>
                                    <li>Drag a <code>🛑 Stop Motor</code> block from <strong style={{color:'#a55b80'}}>Hardware</strong> and place it inside the "If" block.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Project 06 */}
                    <div style={{ background: 'var(--bg-panel-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>06</span>
                            Pothole/Terrain Mapper
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧰 Hardware & Wiring</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Components:</strong> ESP32, MPU6050 (IMU Sensor).</p>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>🔴 <strong>VCC</strong> ➔ <strong>3.3V</strong></li>
                                    <li>⚫ <strong>GND</strong> ➔ <strong>GND</strong></li>
                                    <li>🟡 <strong>SDA</strong> ➔ <strong>Pin 21</strong></li>
                                    <li>🟢 <strong>SCL</strong> ➔ <strong>Pin 22</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧩 Block Logic Steps</h5>
                                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Drag an <code>🤔 If this happens:</code> block from the <strong style={{color:'#5b80a5'}}>Logic</strong> menu.</li>
                                    <li>Snap a <code>Classify Terrain is [Pothole]</code> block into the top slot.</li>
                                    <li>Drag a <code>Print Inline</code> block and place it inside the "If" block to log the bump.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Project 07 */}
                    <div style={{ background: 'var(--bg-panel-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>07</span>
                            Autonomous Maze Solver
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧰 Hardware & Wiring</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Components:</strong> ESP32, Motor Driver, Motors, 1x Ultrasonic Sensor (HC-SR04).</p>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li><strong style={{color:'var(--text-main)'}}>Ultrasonic Sensor:</strong></li>
                                    <li>🔴 <strong>VCC</strong> ➔ <strong>5V (or VIN)</strong></li>
                                    <li>⚫ <strong>GND</strong> ➔ <strong>GND</strong></li>
                                    <li>🟡 <strong>Trig</strong> ➔ <strong>Pin 5</strong></li>
                                    <li>🟢 <strong>Echo</strong> ➔ <strong>Pin 18</strong></li>
                                    <li><em>(Motor driver wired as in Project 02)</em></li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧩 Block Logic Steps</h5>
                                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Drag a <code>🔁 Repeat forever</code> block and place an <code>if / otherwise</code> block inside it.</li>
                                    <li>Use Math blocks to build: <code>Read Ultrasonic Distance &gt; 10 cm</code>. Use this as the condition.</li>
                                    <li><strong>If true (path clear):</strong> <code>Drive Motor [Both] Forward</code>.</li>
                                    <li><strong>Otherwise (wall ahead):</strong> steer right to dodge the wall!</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Project 08 */}
                    <div style={{ background: 'var(--bg-panel-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>08</span>
                            Obstacle Intelligence
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧰 Hardware & Wiring</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Components:</strong> ESP32, Motors, Ultrasonic Sensor, Camera.</p>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Combine your super-bot setup!</li>
                                    <li><em>(Combine Motor Driver and Ultrasonic Sensor wiring from previous projects)</em></li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧩 Block Logic Steps</h5>
                                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Add an <code>🤔 If this happens:</code> block and check if <code>Camera sees Human Face</code> to follow.</li>
                                    <li>Add another <code>If</code> block checking if <code>Ultrasonic Distance &lt; 15</code>.</li>
                                    <li>If true, use a <code>🛑 Stop Motor</code> block to prevent collision!</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Project 09 */}
                    <div style={{ background: 'var(--bg-panel-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>09</span>
                            IoT Weather Scout
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧰 Hardware & Wiring</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Components:</strong> ESP32, DHT11 (Temp/Humidity), LDR (Light Sensor).</p>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li><strong style={{color:'var(--text-main)'}}>DHT11 Sensor:</strong></li>
                                    <li>🔴 <strong>VCC</strong> ➔ <strong>3.3V</strong> | ⚫ <strong>GND</strong> ➔ <strong>GND</strong></li>
                                    <li>🟡 <strong>Data</strong> ➔ <strong>Pin 4</strong></li>
                                    <li style={{marginTop: '8px'}}><strong style={{color:'var(--text-main)'}}>LDR Light Sensor:</strong></li>
                                    <li>🔌 <strong>Leg 1</strong> ➔ <strong>3.3V</strong></li>
                                    <li>🔌 <strong>Leg 2</strong> ➔ <strong>10k Resistor to GND</strong></li>
                                    <li>🟡 <strong>Middle Junction</strong> ➔ <strong>Pin 34</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧩 Block Logic Steps</h5>
                                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Drag a <code>Print Message</code> block from the <strong style={{color:'#5ba58c'}}>Text</strong> menu.</li>
                                    <li>Snap a <code>Predict Local Weather</code> AI block inside the print block.</li>
                                    <li>Run the code to see the predicted weather based on sensor data!</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Project 10 */}
                    <div style={{ background: 'var(--bg-panel-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent-blue)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>10</span>
                            Safety/Edge Guard
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧰 Hardware & Wiring</h5>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Components:</strong> ESP32, Motor Driver, Motors, Ultrasonic Sensor.</p>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li><em>(Motor driver and Ultrasonic Sensor wired as in Project 07)</em></li>
                                    <li>⚠️ <strong>Note:</strong> Mount the Ultrasonic sensor pointing <strong>straight down</strong> at the table!</li>
                                </ul>
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--text-main)', marginBottom: '12px' }}>🧩 Block Logic Steps</h5>
                                <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <li>Drag an <code>🤔 If this happens:</code> block from the <strong style={{color:'#5b80a5'}}>Logic</strong> menu.</li>
                                    <li>Build the condition using Math: <code>Read Ultrasonic Distance &gt; 20 cm</code> (detecting the floor vs table).</li>
                                    <li><strong>If true (edge detected):</strong> run the <code>🛑 Stop Motor</code> block instantly!</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};
