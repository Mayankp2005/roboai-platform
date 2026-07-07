import type React from 'react';
import { useCallback } from 'react';
import { ESPLoader, Transport } from 'esptool-js';
import type { ToastType } from '../components/Toast';

interface UseFlashDeps {
  isConnected: boolean;
  setIsConnected: (v: boolean) => void;
  setSerialLogs: React.Dispatch<React.SetStateAction<string[]>>;
  portRef: React.MutableRefObject<any>;
  readerRef: React.MutableRefObject<any>;
  closedPromiseRef: React.MutableRefObject<any>;
  isConnectedRef: React.MutableRefObject<boolean>;
  readUntilClosed: (port: any) => Promise<void>;
  generatedCode: string;
  addToast: (message: string, type: ToastType) => void;
}

export function useFlash(deps: UseFlashDeps) {
  const {
    isConnected, setIsConnected, setSerialLogs,
    portRef, readerRef, closedPromiseRef, isConnectedRef,
    readUntilClosed, generatedCode, addToast,
  } = deps;

  const handleFlash = useCallback(async () => {
    if (!isConnected || !portRef.current) {
      addToast("Please connect to the device first!", "error");
      return;
    }

    setSerialLogs(prev => [...prev, "[SYS] Compiling C++ Firmware on Local Server..."]);
    setSerialLogs(prev => [...prev, "[SYS] ⏳ First-time compile may take 1-5 min (downloading ESP32 packages). Please wait!"]);
    addToast("Compiling Firmware... (may take a few minutes first time)", "info");

    // Poll /status every 2s to show live compile progress
    let elapsedSec = 0;
    const progressInterval = setInterval(async () => {
      elapsedSec += 2;
      try {
        const st = await fetch('http://localhost:3001/status').then(r => r.json());
        if (st.busy) {
          setSerialLogs(prev => {
            const filtered = prev.filter(l => !l.startsWith('[SYS] ⏳ Compiling'));
            return [...filtered, `[SYS] ⏳ Compiling... ${st.elapsedSeconds}s elapsed (${st.stage})`];
          });
        }
      } catch (_) { /* server not yet ready */ }
    }, 2000);

    try {
      // 1. Ask the backend to compile our C++ string into a .bin
      const response = await fetch('http://localhost:3001/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: generatedCode,
        signal: AbortSignal.timeout(6 * 60 * 1000), // 6 minute browser-side timeout
      });

      clearInterval(progressInterval);
      setSerialLogs(prev => prev.filter(l => !l.startsWith('[SYS] ⏳')));

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || `HTTP ${response.status}`);
      }

      let payload;
      try {
        payload = await response.json();
      } catch (jsonErr) {
        throw new Error("Compiler Server Outdated! Please completely stop 'node server.js' and restart it in your terminal to receive the new Unbrick files!");
      }

      const arrayToBinStr = (arr: Uint8Array) => {
        let binStr = "";
        for (let i = 0; i < arr.length; i++) {
          binStr += String.fromCharCode(arr[i]);
        }
        return binStr;
      };

      const fileArrayList = [];

      // Standard ESP32 Application Offset
      const appBin = Uint8Array.from(atob(payload.app), c => c.charCodeAt(0));
      fileArrayList.push({ data: arrayToBinStr(appBin), address: 0x10000 });

      // Completely unbrick by flashing Bootloader and Partitions to their proper offsets
      if (payload.bootloader) {
        const blBin = Uint8Array.from(atob(payload.bootloader), c => c.charCodeAt(0));
        fileArrayList.push({ data: arrayToBinStr(blBin), address: 0x1000 });
      }
      if (payload.partitions) {
        const partBin = Uint8Array.from(atob(payload.partitions), c => c.charCodeAt(0));
        fileArrayList.push({ data: arrayToBinStr(partBin), address: 0x8000 });
      }

      setSerialLogs(prev => [...prev, "[SYS] Compilation successful! Preparing to Flash..."]);

      // 2. We must completely close our serial connection so esptool can take over the port
      isConnectedRef.current = false; // stop the read loop immediately
      setIsConnected(false);
      if (readerRef.current) {
        await readerRef.current.cancel().catch((e: unknown) => console.warn(e));
        readerRef.current = null;
      }

      if (closedPromiseRef.current) {
        await closedPromiseRef.current.catch(() => {});
        closedPromiseRef.current = null;
      }

      // Give the browser a generous moment to fully release the port
      setSerialLogs(prev => [...prev, "[SYS] Releasing port to initialize flasher..."]);
      await new Promise(r => setTimeout(r, 500));

      if (portRef.current) {
        try {
          await portRef.current.close();
        } catch (e) {
          console.warn("Could not cleanly close port, it might be locked natively:", e);
        }
      }

      // 3. Initialize esptool-js with the port (esptool will handle re-opening it)
      const espTerminal = {
        clean: () => { },
        writeLine: (msg: string) => {
          setSerialLogs(prev => {
            const newLogs = [...prev, `[ESPTool] ${msg}`];
            return newLogs.slice(-100);
          });
        },
        write: (_msg: string) => { }
      };

      const transport = new Transport(portRef.current, true);
      const loader = new ESPLoader({ transport, baudrate: 115200, terminal: espTerminal, romBaudrate: 115200 });

      // 4. Try to connect to bootloader with retries
      setSerialLogs(prev => [...prev, "[SYS] Auto-connecting to ESP32 Bootloader..."]);
      let connected = false;
      let lastErr: any = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          setSerialLogs(prev => [...prev, `[SYS] Bootloader sync attempt ${attempt}/3...`]);
          await loader.main();
          connected = true;
          break;
        } catch (e: any) {
          lastErr = e;
          console.warn(`Bootloader attempt ${attempt} failed:`, e.message);
          await transport.disconnect().catch(() => {});
          if (attempt < 3) {
            setSerialLogs(prev => [...prev, `[SYS] Retrying auto-connection...`]);
            await new Promise(r => setTimeout(r, 800));
          }
        }
      }

      if (!connected) {
        const msg = lastErr?.message || 'Unknown error';
        setSerialLogs(prev => [...prev,
          `[ERROR] Could not enter bootloader after 3 attempts.`,
          `[HELP]  1. Hold the BOOT (IO0) button on the ESP32`,
          `[HELP]  2. Click Flash & Run again (keep holding BOOT)`,
          `[HELP]  3. Release BOOT only after you see "Flashing..." appear`,
          `[HELP]  4. If still failing, unplug & replug USB cable and try again`,
        ]);
        throw new Error(`Bootloader connection failed: ${msg}. Hold the BOOT button on your ESP32 and try again.`);
      }

      setSerialLogs(prev => [...prev, "[SYS] Bootloader connected! Erasing & Flashing... Please wait..."]);
      addToast("Flashing to Device...", "info");

      await loader.writeFlash({
        fileArray: fileArrayList,
        flashSize: 'keep',
        flashMode: 'dio',
        flashFreq: '40m',
        eraseAll: true, // Force erase to fix invalid magic byte and corrupted partitions
        compress: true,
        reportProgress: (_fileIndex: number, written: number, total: number) => {
          if (written % (1024 * 32) === 0 || written === total) {
            setSerialLogs(prev => {
              const newLogs = [...prev, `[SYS] Flashed ${Math.round((written / total) * 100)}%`];
              return newLogs.slice(-100);
            });
          }
        }
      });

      setSerialLogs(prev => [...prev, "[SYS] Flashing complete! Hard resetting..."]);
      addToast("Flashing Complete! Click 'Connect Device' to reconnect.", "success");

      // Hard reset the ESP32 via RTS/DTR
      try {
        await transport.setDTR(false);
        await new Promise(r => setTimeout(r, 100));
        await transport.setRTS(true);
        await new Promise(r => setTimeout(r, 150));
        await transport.setRTS(false);
      } catch (e) { /* ignore reset errors */ }

      // Fully release the port so reconnect works cleanly
      try { await transport.disconnect(); } catch (e) { }
      try { await portRef.current?.close(); } catch (e) { }

      portRef.current = null;
      readerRef.current = null;
      closedPromiseRef.current = null;
      setIsConnected(false);
      setSerialLogs(prev => [...prev, "[SYS] Board rebooted. Click 'Connect Device' to start Serial Monitor."]);

    } catch (error: any) {
      clearInterval(progressInterval);
      setSerialLogs(prev => prev.filter(l => !l.startsWith('[SYS] ⏳')));
      console.error("Flash error:", error);
      const errMsg = error.name === 'TimeoutError'
        ? 'Compile timed out after 6 minutes. Is arduino-cli downloading packages? Check the compile-server terminal.'
        : error.message;
      setSerialLogs(prev => [...prev, `[ERROR] Flash failed: ${errMsg}`]);
      addToast(`Flash Error: ${errMsg}`, "error");

      // Try to restore serial monitor if port is still accessible
      if (portRef.current) {
        try {
          await portRef.current.open({ baudRate: 115200 });
          isConnectedRef.current = true;
          setIsConnected(true);
          readUntilClosed(portRef.current);
          setSerialLogs(prev => [...prev, "[SYS] Serial Monitor restored."]);
        } catch (e) {
          portRef.current = null;
        }
      }
    }
  }, [isConnected, portRef, readerRef, closedPromiseRef, isConnectedRef, setIsConnected, setSerialLogs, readUntilClosed, generatedCode, addToast]);

  return { handleFlash };
}
