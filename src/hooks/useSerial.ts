import { useState, useRef, useCallback } from 'react';
import type { ToastType } from '../components/Toast';

export function useSerial(addToast: (message: string, type: ToastType) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);

  // Refs for Web Serial
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const closedPromiseRef = useRef<any>(null);
  // A ref-based flag so the async read loop is never stale (React state closes over old values)
  const isConnectedRef = useRef(false);

  // Helper: cleanly release any existing serial connection
  const forceClosePort = useCallback(async () => {
    isConnectedRef.current = false;
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
    } catch (e) { /* ignore */ }
    try {
      if (closedPromiseRef.current) {
        await closedPromiseRef.current;
        closedPromiseRef.current = null;
      }
    } catch (e) { /* ignore */ }
    try {
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (e) { /* ignore */ }
  }, []);

  const readUntilClosed = useCallback(async (port: any) => {
    // Use isConnectedRef (not the React state) — the ref is always up-to-date inside async closures
    while (port.readable && isConnectedRef.current) {
      const textDecoder = new TextDecoderStream();
      closedPromiseRef.current = port.readable.pipeTo(textDecoder.writable).catch((e: any) => console.log("Stream closed", e));
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            const incoming = value.trim();
            if (incoming) {
              setSerialLogs(prev => {
                const newLogs = [...prev, `> ${incoming}`];
                return newLogs.slice(-50);
              });
            }
          }
        }
      } catch (error) {
        // Ignore cancellation errors — they are expected on disconnect
        if ((error as any)?.name !== 'AbortError') {
          console.error("Serial read error:", error);
        }
      } finally {
        reader.releaseLock();
      }
    }
  }, []);

  const handleConnectDevice = useCallback(async () => {
    if (isConnected) {
      // Disconnect Logic
      await forceClosePort();
      setIsConnected(false);
      setSerialLogs(prev => [...prev, "[SYS] Device Disconnected."]);
      addToast("Device Disconnected", "info");
      return;
    }

    // Connect Logic
    try {
      const nav: any = navigator;
      if (!nav.serial) {
        addToast("Web Serial API not supported in this browser. Please use Chrome or Edge.", "error");
        return;
      }

      // Clean up any leftover connection from a previous session/flash
      await forceClosePort();

      // Diagnose: log how many previously-authorized ports the browser can see
      const ports = await nav.serial.getPorts();
      setSerialLogs(prev => [...prev, `[SYS] Scanning... Browser sees ${ports.length} authorized port(s).`]);
      let port = null;

      if (ports.length === 1) {
        // Exactly one authorized device is plugged in — auto-select it
        port = ports[0];
        setSerialLogs(prev => [...prev, '[SYS] Auto-selected previously authorized port.']);
      } else {
        // Show the port picker so the user can choose (or grant access for first time)
        setSerialLogs(prev => [...prev, '[SYS] Opening port picker — select your ESP32 COM port...']);
        port = await nav.serial.requestPort();
      }

      await port.open({ baudRate: 115200 });

      portRef.current = port;
      isConnectedRef.current = true;  // set BEFORE starting the read loop

      setIsConnected(true);
      setSerialLogs(prev => [...prev, "[SYS] ✅ Connected to RoboAI Core (ESP32) at 115200 baud."]);
      addToast("Connected to RoboAI Core", "success");

      // Read loop in background — uses isConnectedRef so it never sees a stale value
      readUntilClosed(port);

    } catch (err: any) {
      isConnectedRef.current = false;
      console.error('Error opening serial port', err);

      // Give the user a clear, actionable message based on the error type
      let userMessage = '';
      let logMessage = '';

      if (err.name === 'NotFoundError' || err.message?.includes('No port selected')) {
        userMessage = '⚠️ No ESP32 found! See Serial Monitor for fix steps.';
        logMessage = [
          '[ERROR] No serial port found in the picker. To fix:',
          '  1. Install CP2102 driver → silabs.com/developers/usb-to-uart-bridge-vcp-drivers',
          '  2. Unplug & replug your ESP32 USB cable',
          '  3. Open Device Manager → check "Ports (COM & LPT)" for "Silicon Labs CP210x (COMx)"',
          '  4. Try a different USB cable (must be data cable, not charge-only)',
          '  5. Click Connect Device again',
        ].join('\n');
      } else if (err.name === 'SecurityError') {
        userMessage = 'Connection blocked — use Chrome or Edge on localhost.';
        logMessage = `[ERROR] Security error: ${err.message}`;
      } else if (err.message?.includes('already open') || err.name === 'InvalidStateError') {
        userMessage = 'Port is busy. Unplug & replug your ESP32, then try again.';
        logMessage = `[ERROR] Port already in use: ${err.message}`;
      } else {
        userMessage = `Connection failed: ${err.message}`;
        logMessage = `[ERROR] ${err.message}`;
      }

      setSerialLogs(prev => [...prev, logMessage]);
      addToast(userMessage, "error");
    }
  }, [isConnected, forceClosePort, readUntilClosed, addToast]);

  return {
    isConnected,
    setIsConnected,
    serialLogs,
    setSerialLogs,
    portRef,
    readerRef,
    closedPromiseRef,
    isConnectedRef,
    forceClosePort,
    readUntilClosed,
    handleConnectDevice,
  };
}
