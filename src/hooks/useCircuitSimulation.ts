import { useState, useRef, useCallback, useEffect } from 'react';
import { CPU, avrInstruction, AVRIOPort, AVRTimer, timer0Config, timer1Config, timer2Config, AVRADC, portBConfig, portCConfig, portDConfig, adcConfig, AVRUSART, usart0Config } from 'avr8js';
import { loadHex } from '../utils/loadHex';


export interface PinState {
  value: number; // 0-255 for outputs (PWM or Digital), or 0-5 for analog inputs
}

export interface UltrasonicConfig {
  trigPin: string | null;
  echoPin: string | null;
  distance: number;
  compId: string;
}

export const useCircuitSimulation = (onToast?: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void, onSerialOutput?: (output: string) => void) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [arduinoPins, setArduinoPins] = useState<{ [key: string]: number }>({});
  const [servoAngles, setServoAngles] = useState<{ [key: string]: number }>({});
  
  const runnerRef = useRef<number | null>(null);
  const cpuRef = useRef<CPU | null>(null);
  const ultrasonicsRef = useRef<UltrasonicConfig[]>([]);
  // Keep track of input states (Analog and Digital) from the UI to feed into the CPU
  const inputStatesRef = useRef<{ [key: string]: number | undefined }>({});
  const lastPinsJsonRef = useRef<string>('');
  const lastServoJsonRef = useRef<string>('');

  const setArduinoInput = useCallback((pin: string, value: number | undefined) => {
      inputStatesRef.current[pin] = value;
  }, []);

  const setUltrasonicDistance = useCallback((compId: string, distance: number) => {
      const sensor = ultrasonicsRef.current.find(u => u.compId === compId);
      if (sensor) sensor.distance = distance;
  }, []);

  const syncUltrasonics = useCallback((ultrasonics: UltrasonicConfig[]) => {
      ultrasonicsRef.current = ultrasonics;
  }, []);

  const stopSimulation = (showToast: boolean = true) => {
      setIsRunning(false);
      setIsCompiling(false);
      if (runnerRef.current !== null) {
          cancelAnimationFrame(runnerRef.current);
          runnerRef.current = null;
      }
      cpuRef.current = null;
      setArduinoPins({});
      setServoAngles({});
      inputStatesRef.current = {};
      if (showToast && onToast) onToast('Simulation Stopped', 'info');
  };

  const runSimulation = async (code: string, ultrasonics: UltrasonicConfig[] = []) => {
    stopSimulation(false);
    setIsCompiling(true);
    ultrasonicsRef.current = ultrasonics;
    
    try {
      // 1. Compile
      const response = await fetch('http://localhost:3001/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, fqbn: 'arduino:avr:uno' })
      });
      
      let data;
      try {
          data = await response.json();
      } catch (_parseError) {
          throw new Error('Compile server crashed or returned an invalid response. Please restart the app.');
      }
      
      if (!response.ok) throw new Error(data.error || 'Failed to compile');
      
      const hex = data.hex;
      if (!hex) throw new Error('No hex file returned from compiler');

      // 2. Setup CPU
      const program = new Uint16Array(32768);
      loadHex(hex, new Uint8Array(program.buffer));
      
      const cpu = new CPU(program);
      cpuRef.current = cpu;
      new AVRTimer(cpu, timer0Config);
      new AVRTimer(cpu, timer1Config);
      new AVRTimer(cpu, timer2Config);
      
      const portB = new AVRIOPort(cpu, portBConfig);
      const portC = new AVRIOPort(cpu, portCConfig); // Analog pins
      const portD = new AVRIOPort(cpu, portDConfig); 
      
      const usart = new AVRUSART(cpu, usart0Config, 16e6);
      usart.onByteTransmit = (data) => {
          if (onSerialOutput) onSerialOutput(String.fromCharCode(data));
      }; 
      
      // ADC Setup
      const adc = new AVRADC(cpu, adcConfig);

      const currentPins: { [key: string]: number } = {};
      const servoAnglesRef: { [key: string]: number } = {};
      const pinLastHigh: { [key: string]: number } = {};
      const scheduledEvents: { cycle: number, pin: string, state: boolean }[] = [];

      const setAvrPin = (pinStr: string, isHigh: boolean) => {
          const pin = parseInt(pinStr);
          if (!isNaN(pin)) {
              if (pin >= 0 && pin <= 7) portD.setPin(pin, isHigh);
              else if (pin >= 8 && pin <= 13) portB.setPin(pin - 8, isHigh);
              else if (pin >= 14 && pin <= 19) portC.setPin(pin - 14, isHigh);
          } else if (pinStr.startsWith('A')) {
              const ch = parseInt(pinStr.charAt(1));
              if (ch >= 0 && ch <= 5) portC.setPin(ch, isHigh);
          }
      };

      const updatePin = (pin: string, isHigh: boolean) => {
          if (isHigh) {
              pinLastHigh[pin] = cpu.cycles;
              currentPins[pin] = 255;
          } else {
              if (pinLastHigh[pin] !== undefined) {
                  const cycles = cpu.cycles - pinLastHigh[pin];
                  const us = cycles / 16;
                  if (us >= 500 && us <= 2500) {
                      let angle = (us - 544) / (2400 - 544) * 180;
                      if (angle < 0) angle = 0;
                      if (angle > 180) angle = 180;
                      servoAnglesRef[pin] = angle;
                  }

                  // Ultrasonic Simulation
                  const ultrasonic = ultrasonicsRef.current.find(u => u.trigPin === pin);
                  if (ultrasonic && ultrasonic.echoPin && us >= 2) {
                      const distanceUs = Math.max(10, ultrasonic.distance * 58);
                      const currentCycle = cpu.cycles;
                      // Sensor takes ~400us to process and start echo
                      scheduledEvents.push({ cycle: currentCycle + 400 * 16, pin: ultrasonic.echoPin, state: true });
                      scheduledEvents.push({ cycle: currentCycle + (400 + distanceUs) * 16, pin: ultrasonic.echoPin, state: false });
                      // Sort descending so pop() gets the earliest cycle
                      scheduledEvents.sort((a, b) => b.cycle - a.cycle);
                  }
              }
              currentPins[pin] = 0;
          }
      };

      portB.addListener((value) => {
          updatePin('8', (value & 1) !== 0);
          updatePin('9', (value & 2) !== 0);
          updatePin('10', (value & 4) !== 0);
          updatePin('11', (value & 8) !== 0);
          updatePin('12', (value & 16) !== 0);
          updatePin('13', (value & 32) !== 0);
      });

      portD.addListener((value) => {
          updatePin('0', (value & 1) !== 0);
          updatePin('1', (value & 2) !== 0);
          updatePin('2', (value & 4) !== 0);
          updatePin('3', (value & 8) !== 0);
          updatePin('4', (value & 16) !== 0);
          updatePin('5', (value & 32) !== 0);
          updatePin('6', (value & 64) !== 0);
          updatePin('7', (value & 128) !== 0);
      });

      portC.addListener((value) => {
          updatePin('A0', (value & 1) !== 0);
          updatePin('A1', (value & 2) !== 0);
          updatePin('A2', (value & 4) !== 0);
          updatePin('A3', (value & 8) !== 0);
          updatePin('A4', (value & 16) !== 0);
          updatePin('A5', (value & 32) !== 0);
      });

      setIsRunning(true);
      
      // 3. Run Loop
      const runLoop = () => {
         const instructionCount = 50000; // run 50k instructions per frame
         try {
             for (let i = 0; i < instructionCount; i++) {
                 avrInstruction(cpu);
                 cpu.tick();
                 
                 // Process exact cycle events
                 while (scheduledEvents.length > 0 && cpu.cycles >= scheduledEvents[scheduledEvents.length - 1].cycle) {
                     const ev = scheduledEvents.pop()!;
                     setAvrPin(ev.pin, ev.state);
                 }
             }
         } catch (err) {
             console.error("Simulation crashed inside loop:", err);
         }
         
         // Apply Input States to the CPU (Pushbuttons, Potentiometers)
         // ADC channels A0-A5 correspond to channels 0-5
         for (let ch = 0; ch < 6; ch++) {
             const inputVal = inputStatesRef.current[`A${ch}`];
             // Scale 0-5V to 0-5V for AVRADC channel values array
             adc.channelValues[ch] = inputVal !== undefined ? inputVal : 0;
         }

         // Digital Inputs (Port B, D)
         for (let i = 0; i <= 5; i++) {
             const pin = (8 + i).toString();
             const val = inputStatesRef.current[pin];
             if (val !== undefined) {
                 portB.setPin(i, val > 0);
             } else {
                 const ddr = cpu.data[portBConfig.DDR];
                 if ((ddr & (1 << i)) === 0) {
                     const portVal = cpu.data[portBConfig.PORT];
                     portB.setPin(i, (portVal & (1 << i)) !== 0);
                 }
             }
         }
         
         for (let i = 0; i <= 7; i++) {
             const pin = i.toString();
             const val = inputStatesRef.current[pin];
             if (val !== undefined) {
                 portD.setPin(i, val > 0);
             } else {
                 const ddr = cpu.data[portDConfig.DDR];
                 if ((ddr & (1 << i)) === 0) {
                     const portVal = cpu.data[portDConfig.PORT];
                     portD.setPin(i, (portVal & (1 << i)) !== 0);
                 }
             }
         }

         // Batch React state updates at 60fps only if changed
         const pinsJson = JSON.stringify(currentPins);
         if (pinsJson !== lastPinsJsonRef.current) {
             setArduinoPins({ ...currentPins });
             lastPinsJsonRef.current = pinsJson;
         }
         
         const servoJson = JSON.stringify(servoAnglesRef);
         if (servoJson !== lastServoJsonRef.current) {
             setServoAngles({ ...servoAnglesRef });
             lastServoJsonRef.current = servoJson;
         }

         if (runnerRef.current !== null) {
             runnerRef.current = requestAnimationFrame(runLoop);
         }
      };
      
      runnerRef.current = requestAnimationFrame(runLoop);
      if (onToast) onToast('Simulation Started', 'success');
      
    } catch (e: any) {
        if (onToast) onToast(e.message, 'error');
    } finally {
        setIsCompiling(false);
    }
  };

  useEffect(() => {
      return () => {
          stopSimulation(false);
      };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isRunning, isCompiling, runSimulation, stopSimulation, arduinoPins, servoAngles, setArduinoInput, setUltrasonicDistance, syncUltrasonics };
};
