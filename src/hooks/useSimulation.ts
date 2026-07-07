import type React from 'react';
import { useCallback } from 'react';
import type { ToastType } from '../components/Toast';
import { createModel } from 'vosk-browser';

let globalVoskModel: any = null;
let globalVoskRecognizer: any = null;

let currentOnPartial: ((text: string) => void) | null = null;
let currentOnResult: ((text: string) => void) | null = null;

async function initVosk() {
  if (!globalVoskModel) {
    globalVoskModel = await createModel('/vosk-model.zip');
    globalVoskRecognizer = new globalVoskModel.KaldiRecognizer(16000);
    globalVoskRecognizer.setWords(true);

    globalVoskRecognizer.on("result", (message: any) => {
      if (currentOnResult && message.result && message.result.text) {
        currentOnResult(message.result.text.toLowerCase());
      }
    });

    globalVoskRecognizer.on("partialresult", (message: any) => {
      if (currentOnPartial && message.result && message.result.partial) {
        currentOnPartial(message.result.partial.toLowerCase());
      }
    });
  }
  return globalVoskRecognizer;
}

async function startVoskListening(
  onPartial: (text: string) => void,
  onResult: (text: string) => void,
  onError: (err: any) => void
) {
  try {
    const recognizer = await initVosk();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate: 16000
      },
    });

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    let isStopped = false;
    
    currentOnPartial = onPartial;
    currentOnResult = onResult;

    const stop = () => {
      isStopped = true;
      currentOnPartial = null;
      currentOnResult = null;
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach(t => t.stop());
      try { audioContext.close(); } catch(e) {}
    };

    processor.onaudioprocess = (e) => {
      if (isStopped) return;
      try {
        recognizer.acceptWaveform(e.inputBuffer);
      } catch (err) {
        stop();
        onError(err);
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    return stop;
  } catch (err) {
    onError(err);
    return () => {};
  }
}


interface UseSimulationDeps {
  jsGeneratedCode: string;
  setSimLogs: React.Dispatch<React.SetStateAction<string[]>>;
  setMonitorTab: (tab: 'serial' | 'simulation' | 'stage' | 'vision') => void;
  addToast: (message: string, type: ToastType) => void;
}

export function useSimulation(deps: UseSimulationDeps) {
  const { jsGeneratedCode, setSimLogs, setMonitorTab, addToast } = deps;

  const handleRunSimulation = useCallback(() => {
    if (!jsGeneratedCode) {
      addToast("No blocks to simulate!", "warning");
      return;
    }

    // Switch to Stage tab so the user sees the character animate
    setMonitorTab('stage');
    setSimLogs(prev => [...prev, "[SIMULATION] Starting execution..."]);

    // Sandboxed simulator with blocked dangerous globals
    try {
      if (window.characterStageApi) {
        window.characterStageApi.clearRunState();
      }

      // Cleanup previous event listeners and timeouts
      if ((window as any).activeRoboAIEventListeners) {
        (window as any).activeRoboAIEventListeners.forEach((listener: any) => {
          window.removeEventListener(listener.type, listener.fn);
        });
      }
      (window as any).activeRoboAIEventListeners = [];

      if ((window as any).activeRoboAITimeouts) {
        (window as any).activeRoboAITimeouts.forEach((id: any) => clearTimeout(id));
      }
      (window as any).activeRoboAITimeouts = [];

      const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

      // Frozen scope: block dangerous globals by shadowing them as undefined parameters
      const simulate = new AsyncFunction(
        'console', 'registerEvent', 'registerTimeout', 'simulateWakeWord', 'simulateListenCommand',
        // Blocked globals — shadowed as undefined to prevent user code from accessing them
        'fetch', 'XMLHttpRequest', 'localStorage', 'sessionStorage',
        'document', 'indexedDB', 'WebSocket', 'Worker', 'SharedWorker',
        'importScripts',
        `
        "use strict";
        try {
          ${jsGeneratedCode}
        } catch(e) {
          console.error(e);
        }
        `
      );

      const registerEvent = (type: string, fn: any) => {
        window.addEventListener(type, fn);
        (window as any).activeRoboAIEventListeners.push({ type, fn });
      };

      const registerTimeout = (fn: any, delay: number) => {
        const id = setTimeout(fn, delay);
        (window as any).activeRoboAITimeouts.push(id);
        return id;
      };

      const simulateWakeWord = (wakeWord: string) => {
        return new Promise<boolean>(async (resolve) => {
          const doFallback = async () => {
            const res = window.confirm("Fallback: Simulate Microphone heard wake word: " + wakeWord + "?");
            if (!res) await new Promise(r => setTimeout(r, 2000));
            resolve(res);
          };

          addToast(`🎤 Loading offline AI Voice model...`, 'info');
          
          let stopListening = () => {};
          let handled = false;
          
          const finish = (result: boolean) => {
            if (handled) return;
            handled = true;
            stopListening();
            resolve(result);
          };

          stopListening = await startVoskListening(
            (partialText) => {
              const strippedWake = wakeWord.replace(/[^a-z0-9]/gi, '').toLowerCase();
              const strippedPartial = partialText.replace(/[^a-z0-9]/gi, '').toLowerCase();
              
              if (strippedWake.length > 0 && strippedPartial.length > 0 && strippedPartial.includes(strippedWake)) {
                finish(true);
              }
            },
            (resultText) => {
              if (resultText.trim().length > 0) {
                console.log("[SIMULATION Vosk] Heard:", resultText);
              }
              const strippedWake = wakeWord.replace(/[^a-z0-9]/gi, '').toLowerCase();
              const strippedResult = resultText.replace(/[^a-z0-9]/gi, '').toLowerCase();
              
              if (strippedWake.length > 0 && strippedResult.length > 0 && strippedResult.includes(strippedWake)) {
                finish(true);
              }
            },
            (err) => {
              console.error("[SIMULATION Vosk] Error:", err);
              addToast(`🎤 Error starting mic/AI: ${err.message || err}`, 'error');
              if (!handled) doFallback();
            }
          );
          
          if (!handled) {
            addToast(`🎤 Listening continuously for: "${wakeWord}"...`, 'info');
          }
        });
      };

      const simulateListenCommand = () => {
        return new Promise<string>(async (resolve) => {
          const doFallback = async () => {
            const res = window.prompt("Fallback: Enter voice command:", "");
            if (res === null || res === "") await new Promise(r => setTimeout(r, 2000));
            resolve(res || "");
          };

          addToast(`🎤 Loading offline AI Voice model...`, 'info');
          
          let stopListening = () => {};
          let handled = false;
          
          const finish = (result: string) => {
            if (handled) return;
            handled = true;
            stopListening();
            resolve(result);
          };

          stopListening = await startVoskListening(
            (_partialText) => {
              // Wait for full sentence
            },
            (resultText) => {
              if (resultText.trim().length > 0) {
                console.log("[SIMULATION Vosk] Command:", resultText);
                finish(resultText);
              }
            },
            (err) => {
              console.error("[SIMULATION Vosk] Error:", err);
              addToast(`🎤 Error starting mic/AI: ${err.message || err}`, 'error');
              if (!handled) doFallback();
            }
          );
          
          if (!handled) {
            addToast(`🎤 Listening for command...`, 'info');
          }
        });
      };

      const customConsole = {
        log: (msg: any) => setSimLogs(prev => [...prev, `> ${msg}`]),
        printInline: (msg: any) => setSimLogs(prev => {
          if (prev.length === 0) return [`> ${msg}`];
          const newLogs = [...prev];
          const lastIdx = newLogs.length - 1;
          const lastLog = newLogs[lastIdx];
          if (lastLog.startsWith("> ")) {
            newLogs[lastIdx] = lastLog + String(msg);
          } else {
            newLogs.push(`> ${msg}`);
          }
          return newLogs;
        }),
        error: (msg: any) => setSimLogs(prev => [...prev, `[ERROR] ${msg}`])
      };

      // Pass undefined for all blocked globals so user code cannot access them
      simulate(
        customConsole, registerEvent, registerTimeout, simulateWakeWord, simulateListenCommand,
        undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined,
        undefined, undefined
      ).then(() => {
        setSimLogs(prev => [...prev, "[SIMULATION] Finished execution."]);
        addToast("Simulation Finished", "success");
      }).catch((e: any) => {
        setSimLogs(prev => [...prev, `[SIMULATION ERROR] ${e.message}`]);
        addToast("Simulation Error", "error");
      });
    } catch (e: any) {
      setSimLogs(prev => [...prev, `[SIMULATION ERROR] ${e.message}`]);
      addToast("Simulation Error", "error");
    }
  }, [jsGeneratedCode, setSimLogs, setMonitorTab, addToast]);

  return { handleRunSimulation };
}
