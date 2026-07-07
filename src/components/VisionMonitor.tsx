import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, Link } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export const VisionMonitor: React.FC = () => {
    const [streamUrl, setStreamUrl] = useState<string>('');
    const [connectUrl, setConnectUrl] = useState<string>('');
    const [hasError, setHasError] = useState<boolean>(false);
    
    // AI State
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Try to load cached URL
    useEffect(() => {
        const cached = localStorage.getItem('roboai_vision_url');
        if (cached) {
            setStreamUrl(cached);
            setConnectUrl(cached);
        }
    }, []);

    // Load TensorFlow COCO-SSD Model
    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                console.log("AI Model Loaded Successfully");
            } catch (e) {
                console.error("Failed to load AI model", e);
            }
        };
        loadModel();
    }, []);

    // Object Detection Loop
    useEffect(() => {
        let animationId: number;
        
        const detectLoop = async () => {
            if (model && imgRef.current && canvasRef.current && streamUrl && !hasError) {
                // Ensure image is actually loaded and has dimensions
                if (imgRef.current.complete && imgRef.current.naturalWidth > 0) {
                    try {
                        const predictions = await model.detect(imgRef.current);
                        
                        const ctx = canvasRef.current.getContext('2d');
                        if (ctx) {
                            // Clear previous drawings
                            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                            
                            // Scale coordinates if the image is resized
                            const scaleX = canvasRef.current.width / imgRef.current.naturalWidth;
                            const scaleY = canvasRef.current.height / imgRef.current.naturalHeight;

                            const detectedClasses = (predictions || []).map(p => p.class);
                            // Broadcast to App.tsx so it can send to ESP32!
                            window.dispatchEvent(new CustomEvent('vision_detect', { detail: detectedClasses }));

                            // Draw new bounding boxes
                            predictions.forEach(prediction => {
                                const [x, y, width, height] = prediction.bbox;
                                const scaledX = x * scaleX;
                                const scaledY = y * scaleY;
                                const scaledW = width * scaleX;
                                const scaledH = height * scaleY;

                                ctx.strokeStyle = '#a855f7'; // accent-purple
                                ctx.lineWidth = 4;
                                ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);
                                
                                ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
                                ctx.fillRect(scaledX, scaledY > 25 ? scaledY - 25 : scaledY, scaledW, 25);
                                
                                ctx.fillStyle = '#ffffff';
                                ctx.font = '16px "Inter", sans-serif';
                                ctx.fillText(
                                    `${prediction.class} (${Math.round(prediction.score * 100)}%)`, 
                                    scaledX + 4, 
                                    scaledY > 25 ? scaledY - 7 : scaledY + 18
                                );
                            });
                        }
                    } catch (e) {
                        // MJPEG frames might be incomplete causing occasional TF errors, safe to ignore
                    }
                }
            }
            animationId = requestAnimationFrame(detectLoop);
        };
        
        detectLoop();
        return () => cancelAnimationFrame(animationId);
    }, [model, streamUrl, hasError]);

    const handleConnect = () => {
        if (!connectUrl) return;
        
        let finalUrl = connectUrl.trim();
        
        try {
            if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                finalUrl = 'http://' + finalUrl;
            }
            
            const parsedUrl = new URL(finalUrl);
            
            // If the user just typed the IP and port but forgot the video path, append it automatically
            if (parsedUrl.pathname === '/' || parsedUrl.pathname === '') {
                // The standard path for Android 'IP Webcam' app MJPEG stream is /video
                parsedUrl.pathname = '/video';
                finalUrl = parsedUrl.toString();
            }
        } catch (e) {
            console.error("Invalid URL format");
        }

        setStreamUrl(finalUrl);
        localStorage.setItem('roboai_vision_url', finalUrl);
        setHasError(false);
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', background: 'var(--bg-panel-alt)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Camera size={20} color="var(--accent-purple)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>AI Vision Source</h3>
                {model ? (
                    <span style={{ marginLeft: 'auto', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                        AI Active
                    </span>
                ) : (
                    <span style={{ marginLeft: 'auto', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                        Loading AI...
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                        <Link size={16} />
                    </div>
                    <input 
                        type="text" 
                        value={connectUrl}
                        onChange={(e) => setConnectUrl(e.target.value)}
                        placeholder="e.g. http://192.168.1.10:8080/video"
                        className="input-field"
                        style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-panel)', color: 'var(--text-main)', outline: 'none' }}
                        onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }} onClick={handleConnect}>
                        Connect
                    </button>
                    {streamUrl && (
                        <button className="btn btn-outline" style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }} onClick={() => setStreamUrl('')}>
                            Stop
                        </button>
                    )}
                </div>
            </div>

            <div style={{ 
                flex: 1, 
                background: 'var(--bg-panel-dark)', 
                borderRadius: '8px', 
                border: '1px dashed var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {!streamUrl ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        <Camera size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>No Camera Connected</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>Enter your IP Webcam URL above to launch the feed!</p>
                    </div>
                ) : (
                    <>
                        {hasError && (
                            <div style={{ position: 'absolute', zIndex: 10, background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                <AlertCircle size={16} /> Network Error or Invalid Format
                            </div>
                        )}
                        {/* crossOrigin is CRITICAL for TensorFlow to read pixels from the remote IP webcam */}
                        <img 
                            ref={imgRef}
                            src={streamUrl} 
                            crossOrigin="anonymous"
                            alt="Live Vision Feed" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={() => setHasError(true)}
                            onLoad={() => {
                                setHasError(false);
                                if (imgRef.current && canvasRef.current) {
                                    // Match canvas size to displayed image size
                                    canvasRef.current.width = imgRef.current.clientWidth;
                                    canvasRef.current.height = imgRef.current.clientHeight;
                                }
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                        />
                    </>
                )}
            </div>
            
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(168, 85, 247, 0.1)', borderLeft: '3px solid var(--accent-purple)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--accent-purple)' }}>Pro Tip:</strong> Download an "IP Webcam" app on your smartphone, start the server, and type the URL it gives you (make sure to add <code>/video</code> at the end for the raw stream!).
            </div>
        </div>
    );
};
