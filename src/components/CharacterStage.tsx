import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';

// Export an interface so that other parts of the app can use it
export interface CharacterStageApi {
  moveForward: (steps: number) => Promise<void>;
  turn: (direction: 'LEFT' | 'RIGHT', degrees: number) => Promise<void>;
  goTo: (x: number, y: number) => Promise<void>;
  glideToMouse: () => Promise<void>;
  say: (text: string, duration?: number) => Promise<void>;
  show: () => Promise<void>;
  hide: () => Promise<void>;
  playSound: (soundName: string) => Promise<void>;
  onClick: (callback: () => void) => void;
  changeOutfit: (outfit: string) => Promise<void>;
  paintColor: (color: string | number) => Promise<void>;
  dissolve: (amount: number) => Promise<void>;
  reset: () => void;
  clearRunState: () => void;
  pointInDirection: (degrees: number) => Promise<void>;
  pointTowardsMouse: () => Promise<void>;
  changeX: (dx: number) => Promise<void>;
  setX: (x: number) => Promise<void>;
  changeY: (dy: number) => Promise<void>;
  setY: (y: number) => Promise<void>;
  goToRandom: () => Promise<void>;
  glideToRandom: (secs: number) => Promise<void>;
  glideToXY: (x: number, y: number, secs: number) => Promise<void>;
  ifOnEdgeBounce: () => Promise<void>;
  setRotStyle: (style: 'all around' | 'left-right' | 'don\'t rotate') => Promise<void>;
  getX: () => number;
  getY: () => number;
  getDirection: () => number;
  sayForSecs: (text: string, secs: number) => Promise<void>;
  thinkForSecs: (text: string, secs: number) => Promise<void>;
  think: (text: string) => Promise<void>;
  nextCostume: () => Promise<void>;
  switchBackdrop: (backdrop: string) => Promise<void>;
  nextBackdrop: () => Promise<void>;
  changeSizeBy: (amount: number) => Promise<void>;
  setSizeTo: (percent: number) => Promise<void>;
  changeEffectBy: (effect: string, amount: number) => Promise<void>;
  setEffectTo: (effect: string, amount: number) => Promise<void>;
  clearGraphicEffects: () => Promise<void>;
  playSoundUntilDone: (soundName: string) => Promise<void>;
  startSound: (soundName: string) => Promise<void>;
  stopAllSounds: () => Promise<void>;
  changeSoundEffectBy: (effect: string, amount: number) => Promise<void>;
  setSoundEffectTo: (effect: string, value: number) => Promise<void>;
  clearSoundEffects: () => Promise<void>;
  changeVolumeBy: (amount: number) => Promise<void>;
  setVolumeTo: (percent: number) => Promise<void>;
  getVolume: () => number;
}

// Ensure the global window object knows about our API for the simulation
declare global {
  interface Window {
    characterStageApi?: CharacterStageApi;
  }
}

export interface CharacterStageProps {
  characterImage?: string;
  backgroundImage?: string;
}

export const CharacterStage = forwardRef<CharacterStageApi, CharacterStageProps>(({ 
  characterImage = './assets/images/character.png',
  backgroundImage = ''
}, ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Center of stage is 0,0
  const [rotation, setRotation] = useState(0); // 0 degrees points right (like Scratch)
  const [visible, setVisible] = useState(true);
  const [speech, setSpeech] = useState<string | null>(null);
  const [speechType, setSpeechType] = useState<'say' | 'think'>('say');
  
  const [clickCallback, setClickCallback] = useState<(() => void) | null>(null);
  const [colorEffect, setColorEffect] = useState<number>(0);
  const [dissolveAmount, setDissolveAmount] = useState<number>(0);
  const [currentOutfit, setCurrentOutfit] = useState<string>(characterImage);
  const [rotationStyle, setRotationStyle] = useState<'all around' | 'left-right' | 'don\'t rotate'>('all around');
  const [size, setSize] = useState<number>(100);
  const [backdropIndex, setBackdropIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(100);
  const [pitchEffect, setPitchEffect] = useState<number>(0);

  const positionRef = useRef(position);
  useEffect(() => { positionRef.current = position; }, [position]);
  const rotationRef = useRef(rotation);
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);
  const volumeRef = useRef(volume);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  const pitchEffectRef = useRef(pitchEffect);
  useEffect(() => { pitchEffectRef.current = pitchEffect; }, [pitchEffect]);

  useEffect(() => {
    setCurrentOutfit(characterImage);
  }, [characterImage]);

  const stageWidth = 640;
  const stageHeight = 480;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = e.clientX - centerX;
      const y = -(e.clientY - centerY);
      
      mousePosRef.current = { x, y };
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // API implementations
  const moveForward = async (steps: number) => {
    return new Promise<void>((resolve) => {
      setPosition(prev => {
        // Calculate new X and Y based on rotation
        // CSS rotation: 0=right, 90=down. Screen coordinates: +Y is UP.
        const rad = rotation * (Math.PI / 180);
        const dx = Math.cos(rad) * steps;
        const dy = -Math.sin(rad) * steps; // Inverted Y because +Y on screen goes UP, but visual rotation 90 goes DOWN
        
        let newX = prev.x + dx;
        let newY = prev.y + dy;
        
        // Exact screen bounds clamping based on actual character dimensions (150x180)
        const charHalfWidth = 150 / 2;
        const charHalfHeight = 180 / 2;
        newX = Math.max(-stageWidth/2 + charHalfWidth, Math.min(stageWidth/2 - charHalfWidth, newX));
        newY = Math.max(-stageHeight/2 + charHalfHeight, Math.min(stageHeight/2 - charHalfHeight, newY));
        
        return { x: newX, y: newY };
      });
      // Delay for visual effect
      setTimeout(resolve, 500);
    });
  };

  const turn = async (direction: 'LEFT' | 'RIGHT', degrees: number) => {
    return new Promise<void>((resolve) => {
      setRotation(prev => {
        const change = direction === 'RIGHT' ? degrees : -degrees;
        return (prev + change) % 360;
      });
      setTimeout(resolve, 300);
    });
  };

  const goTo = async (x: number, y: number) => {
    return new Promise<void>((resolve) => {
      const charHalfWidth = 150 / 2;
      const charHalfHeight = 180 / 2;
      setPosition({ 
        x: Math.max(-stageWidth/2 + charHalfWidth, Math.min(stageWidth/2 - charHalfWidth, x)), 
        y: Math.max(-stageHeight/2 + charHalfHeight, Math.min(stageHeight/2 - charHalfHeight, y)) 
      });
      setTimeout(resolve, 500);
    });
  };

  const glideToMouse = async () => {
    return new Promise<void>((resolve) => {
      const target = mousePosRef.current;
      const charHalfWidth = 150 / 2;
      const charHalfHeight = 180 / 2;
      setPosition({ 
        x: Math.max(-stageWidth/2 + charHalfWidth, Math.min(stageWidth/2 - charHalfWidth, target.x)), 
        y: Math.max(-stageHeight/2 + charHalfHeight, Math.min(stageHeight/2 - charHalfHeight, target.y)) 
      });
      setTimeout(resolve, 500);
    });
  };

  const pointInDirection = async (degrees: number) => {
    return new Promise<void>((resolve) => {
      setRotation(degrees);
      setTimeout(resolve, 300);
    });
  };

  const pointTowardsMouse = async () => {
    return new Promise<void>((resolve) => {
      setPosition(prev => {
        const target = mousePosRef.current;
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        // Calculate angle: standard math atan2(dy, dx), but we have 0 degrees = right, 90 = down visually in Scratch.
        // Screen coords: +Y is UP, but mathematically usually we want 90 to be DOWN or UP depending on coordinate system.
        // Scratch has 0 pointing UP, 90 pointing RIGHT.
        // Currently: 0 = RIGHT, 90 = DOWN (CSS transform rotate).
        // Let's use atan2: y is inverted here (since HTML +y is down, but our prev.y +y is UP).
        // Actual screen pos uses calc(-50% - ypx) meaning +y is visually UP.
        // So dx is correct. target.y is + for UP. dy is + for UP.
        // We want 0 degrees to be RIGHT, 90 to be DOWN.
        // Math.atan2(dy, dx) returns angle from X axis.
        // dy is positive UP, dx is positive RIGHT.
        // So angle is CCW. We want CW.
        let angle = Math.atan2(-dy, dx) * (180 / Math.PI);
        setRotation(angle);
        return prev;
      });
      setTimeout(resolve, 300);
    });
  };

  const changeX = async (dx: number) => {
    return new Promise<void>((resolve) => {
      setPosition(prev => {
        const charHalfWidth = 150 / 2;
        const newX = Math.max(-stageWidth/2 + charHalfWidth, Math.min(stageWidth/2 - charHalfWidth, prev.x + dx));
        return { ...prev, x: newX };
      });
      setTimeout(resolve, 300);
    });
  };

  const setX = async (x: number) => {
    return new Promise<void>((resolve) => {
      setPosition(prev => {
        const charHalfWidth = 150 / 2;
        const newX = Math.max(-stageWidth/2 + charHalfWidth, Math.min(stageWidth/2 - charHalfWidth, x));
        return { ...prev, x: newX };
      });
      setTimeout(resolve, 300);
    });
  };

  const changeY = async (dy: number) => {
    return new Promise<void>((resolve) => {
      setPosition(prev => {
        const charHalfHeight = 180 / 2;
        const newY = Math.max(-stageHeight/2 + charHalfHeight, Math.min(stageHeight/2 - charHalfHeight, prev.y + dy));
        return { ...prev, y: newY };
      });
      setTimeout(resolve, 300);
    });
  };

  const setY = async (y: number) => {
    return new Promise<void>((resolve) => {
      setPosition(prev => {
        const charHalfHeight = 180 / 2;
        const newY = Math.max(-stageHeight/2 + charHalfHeight, Math.min(stageHeight/2 - charHalfHeight, y));
        return { ...prev, y: newY };
      });
      setTimeout(resolve, 300);
    });
  };

  const goToRandom = async () => {
    return new Promise<void>((resolve) => {
      const charHalfWidth = 150 / 2;
      const charHalfHeight = 180 / 2;
      const randX = (Math.random() - 0.5) * (stageWidth - charHalfWidth * 2);
      const randY = (Math.random() - 0.5) * (stageHeight - charHalfHeight * 2);
      setPosition({ x: randX, y: randY });
      setTimeout(resolve, 500);
    });
  };

  const glideToRandom = async (secs: number) => {
    return new Promise<void>((resolve) => {
      const charHalfWidth = 150 / 2;
      const charHalfHeight = 180 / 2;
      const randX = (Math.random() - 0.5) * (stageWidth - charHalfWidth * 2);
      const randY = (Math.random() - 0.5) * (stageHeight - charHalfHeight * 2);
      setPosition({ x: randX, y: randY });
      setTimeout(resolve, secs * 1000);
    });
  };

  const glideToXY = async (x: number, y: number, secs: number) => {
    return new Promise<void>((resolve) => {
      const charHalfWidth = 150 / 2;
      const charHalfHeight = 180 / 2;
      setPosition({ 
        x: Math.max(-stageWidth/2 + charHalfWidth, Math.min(stageWidth/2 - charHalfWidth, x)), 
        y: Math.max(-stageHeight/2 + charHalfHeight, Math.min(stageHeight/2 - charHalfHeight, y)) 
      });
      setTimeout(resolve, secs * 1000);
    });
  };

  const ifOnEdgeBounce = async () => {
    return new Promise<void>((resolve) => {
      setPosition(prevPos => {
        let {x, y} = prevPos;
        const charHalfWidth = 150 / 2;
        const charHalfHeight = 180 / 2;
        let hitEdge = false;
        
        let newRot = rotationRef.current; // Read current rotation directly
        
        if (x <= -stageWidth/2 + charHalfWidth) {
          x = -stageWidth/2 + charHalfWidth;
          newRot = (180 - newRot) % 360; // bounce horizontally
          hitEdge = true;
        } else if (x >= stageWidth/2 - charHalfWidth) {
          x = stageWidth/2 - charHalfWidth;
          newRot = (180 - newRot) % 360;
          hitEdge = true;
        }
        
        if (y <= -stageHeight/2 + charHalfHeight) {
          y = -stageHeight/2 + charHalfHeight;
          newRot = (360 - newRot) % 360; // bounce vertically
          hitEdge = true;
        } else if (y >= stageHeight/2 - charHalfHeight) {
          y = stageHeight/2 - charHalfHeight;
          newRot = (360 - newRot) % 360;
          hitEdge = true;
        }

        if (hitEdge) {
           setRotation(newRot);
           return {x, y};
        }
        return prevPos;
      });
      setTimeout(resolve, 100);
    });
  };

  const setRotStyle = async (style: 'all around' | 'left-right' | 'don\'t rotate') => {
    return new Promise<void>((resolve) => {
      setRotationStyle(style);
      setTimeout(resolve, 100);
    });
  };

  const getX = () => positionRef.current.x;
  const getY = () => positionRef.current.y;
  const getDirection = () => {
    let d = rotationRef.current % 360;
    if (d > 180) d -= 360;
    if (d <= -180) d += 360;
    return d;
  };

  const say = async (text: string, duration?: number) => {
    return new Promise<void>((resolve) => {
      setSpeech(text);
      setSpeechType('say');
      if (duration && duration > 0) {
        setTimeout(() => {
          setSpeech(null);
          resolve();
        }, duration);
      } else {
        resolve(); // Await finished, but speech stays
      }
    });
  };

  const sayForSecs = async (text: string, secs: number) => {
    return say(text, secs * 1000);
  };

  const think = async (text: string) => {
    return new Promise<void>((resolve) => {
      setSpeech(text);
      setSpeechType('think');
      resolve();
    });
  };

  const thinkForSecs = async (text: string, secs: number) => {
    return new Promise<void>((resolve) => {
      setSpeech(text);
      setSpeechType('think');
      setTimeout(() => {
        setSpeech(null);
        resolve();
      }, secs * 1000);
    });
  };

  const nextCostume = async () => {
    return new Promise<void>((resolve) => {
      // Mock cycling through fake costumes by changing colors
      setColorEffect(prev => (prev + 50) % 360);
      setTimeout(resolve, 50);
    });
  };

  const switchBackdrop = async (backdrop: string) => {
    return new Promise<void>((resolve) => {
      if (backdrop === 'backdrop1') setBackdropIndex(0);
      else if (backdrop === 'backdrop2') setBackdropIndex(1);
      setTimeout(resolve, 50);
    });
  };

  const nextBackdrop = async () => {
    return new Promise<void>((resolve) => {
      setBackdropIndex(prev => (prev + 1) % 3);
      setTimeout(resolve, 50);
    });
  };

  const changeSizeBy = async (amount: number) => {
    return new Promise<void>((resolve) => {
      setSize(prev => Math.max(10, prev + amount));
      setTimeout(resolve, 50);
    });
  };

  const setSizeTo = async (percent: number) => {
    return new Promise<void>((resolve) => {
      setSize(Math.max(10, percent));
      setTimeout(resolve, 50);
    });
  };

  const changeEffectBy = async (effect: string, amount: number) => {
    return new Promise<void>((resolve) => {
      if (effect === 'COLOR') setColorEffect(prev => (prev + amount) % 360);
      else if (effect === 'GHOST') setDissolveAmount(prev => Math.min(100, Math.max(0, prev + amount)));
      setTimeout(resolve, 50);
    });
  };

  const setEffectTo = async (effect: string, value: number) => {
    return new Promise<void>((resolve) => {
      if (effect === 'COLOR') setColorEffect(value % 360);
      else if (effect === 'GHOST') setDissolveAmount(Math.min(100, Math.max(0, value)));
      setTimeout(resolve, 50);
    });
  };

  const clearGraphicEffects = async () => {
    return new Promise<void>((resolve) => {
      setColorEffect(0);
      setDissolveAmount(0);
      setTimeout(resolve, 50);
    });
  };

  const show = async () => {
    return new Promise<void>((resolve) => {
      setVisible(true);
      setTimeout(resolve, 100);
    });
  };

  const hide = async () => {
    return new Promise<void>((resolve) => {
      setVisible(false);
      setTimeout(resolve, 100);
    });
  };

  const activeAudioContextsRef = useRef<Set<AudioContext>>(new Set());

  const playSoundUntilDone = async (soundName: string) => {
    return new Promise<void>((resolve) => {
      console.log(`[Stage] Playing sound: ${soundName}`);
      
      try {
        const uSound = soundName.toUpperCase();
        const vol = Math.max(0, volumeRef.current / 100);
        const pitchShift = pitchEffectRef.current;
        const pitchMult = Math.pow(2, pitchShift / 120);

        if (uSound === 'HI' || uSound === 'BARK') {
           if ('speechSynthesis' in window) {
             let text = uSound === 'HI' ? "Hi!" : "Woof!";
             
             let characterPitch = 1.0;
             let characterRate = 1.0;
             let isFemale = false;
             
             const outfitStr = currentOutfit.toLowerCase();
             if (outfitStr.includes('dog')) {
               characterPitch = 1.2;
               if (uSound === 'HI') text = "Woof woof!"; // Dog says woof instead of hi
             } else if (outfitStr.includes('boy')) {
               characterPitch = 0.6; // Deeper for boy
             } else if (outfitStr.includes('alien')) {
               characterPitch = 1.8; // High pitch for alien
             } else if (outfitStr.includes('retro')) {
               characterPitch = 0.5; // Robotic/deep for retro
               characterRate = 0.8;
             } else if (outfitStr.includes('ninja')) {
               characterPitch = 0.8; 
             } else {
               // Default (character.png/jpeg) is female
               isFemale = true;
               characterPitch = 1.2;
             }

             const utterance = new SpeechSynthesisUtterance(text);
             utterance.volume = vol;
             utterance.pitch = Math.max(0, Math.min(2, characterPitch * pitchMult));
             utterance.rate = characterRate;

             // Try to match voice if voices are loaded
             const voices = window.speechSynthesis.getVoices();
             if (voices.length > 0) {
                 if (isFemale) {
                     const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
                     if (femaleVoice) utterance.voice = femaleVoice;
                 } else if (outfitStr.includes('boy')) {
                     const maleVoice = voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Google UK English Male'));
                     if (maleVoice) utterance.voice = maleVoice;
                 }
             }

             utterance.onend = () => resolve();
             utterance.onerror = () => resolve();
             window.speechSynthesis.speak(utterance);
             return;
           }
        }

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          setTimeout(resolve, 500);
          return;
        }
        
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        activeAudioContextsRef.current.add(ctx);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        const applyParams = (freq: number, _dur: number) => {
           osc.frequency.setValueAtTime(freq * pitchMult, ctx.currentTime);
           gainNode.gain.setValueAtTime(vol * 0.5, ctx.currentTime);
        };

        let dur = 0.5;

        if (uSound === 'BEEP') {
          osc.type = 'sine';
          applyParams(800, 0.2);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          dur = 0.2;
        } else if (uSound === 'MAGIC') {
          osc.type = 'triangle';
          applyParams(400, 0.5);
          osc.frequency.exponentialRampToValueAtTime(800 * pitchMult, ctx.currentTime + 0.3);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          dur = 0.5;
        } else if (uSound === 'POP') {
          osc.type = 'square';
          applyParams(400, 0.1);
          osc.frequency.exponentialRampToValueAtTime(100 * pitchMult, ctx.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          dur = 0.1;
        } else {
          osc.type = 'sine';
          applyParams(440, 0.3);
          dur = 0.3;
        }
        
        osc.start();
        osc.stop(ctx.currentTime + dur);
        
        setTimeout(() => {
          try { if (ctx.state !== 'closed') ctx.close().catch(()=>{}); } catch(e) {}
          activeAudioContextsRef.current.delete(ctx);
          resolve();
        }, dur * 1000 + 50);

      } catch (err) {
        console.error(err);
        setTimeout(resolve, 500);
      }
    });
  };

  const startSound = async (soundName: string) => {
    playSoundUntilDone(soundName); // Do not await
    return Promise.resolve();
  };
  
  // Keep playSound for backwards compatibility
  const playSound = playSoundUntilDone;

  const stopAllSounds = async () => {
    return new Promise<void>((resolve) => {
      activeAudioContextsRef.current.forEach(ctx => {
        try { if (ctx.state !== 'closed') ctx.close().catch(()=>{}); } catch(e) {}
      });
      activeAudioContextsRef.current.clear();
      setTimeout(resolve, 50);
    });
  };

  const changeSoundEffectBy = async (effect: string, amount: number) => {
    return new Promise<void>((resolve) => {
      if (effect === 'PITCH') setPitchEffect(prev => prev + amount);
      setTimeout(resolve, 50);
    });
  };

  const setSoundEffectTo = async (effect: string, value: number) => {
    return new Promise<void>((resolve) => {
      if (effect === 'PITCH') setPitchEffect(value);
      setTimeout(resolve, 50);
    });
  };

  const clearSoundEffects = async () => {
    return new Promise<void>((resolve) => {
      setPitchEffect(0);
      setTimeout(resolve, 50);
    });
  };

  const changeVolumeBy = async (amount: number) => {
    return new Promise<void>((resolve) => {
      setVolume(prev => Math.min(100, Math.max(0, prev + amount)));
      setTimeout(resolve, 50);
    });
  };

  const setVolumeTo = async (percent: number) => {
    return new Promise<void>((resolve) => {
      setVolume(Math.min(100, Math.max(0, percent)));
      setTimeout(resolve, 50);
    });
  };

  const getVolume = () => volumeRef.current;

  const onClick = (callback: () => void) => {
    setClickCallback(() => callback);
  };

  const changeOutfit = async (outfit: string) => {
    return new Promise<void>((resolve) => {
      let newSrc = characterImage;
      if (outfit === 'O1') newSrc = './assets/images/character-retro.png';
      if (outfit === 'O2') newSrc = './assets/images/character-ninja.png';
      if (outfit === 'FUNKY') newSrc = './assets/images/character-alien.png';
      setCurrentOutfit(newSrc);
      setTimeout(resolve, 300);
    });
  };

  const paintColor = async (colorInfo: string | number) => {
    return new Promise<void>((resolve) => {
      setColorEffect(Number(colorInfo) || 0);
      setTimeout(resolve, 300);
    });
  };

  const dissolve = async (amount: number) => {
    return new Promise<void>((resolve) => {
      setDissolveAmount(Math.min(100, Math.max(0, amount)));
      setTimeout(resolve, 300);
    });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setVisible(true);
    setSpeech(null);
    setColorEffect(0);
    setDissolveAmount(0);
    setCurrentOutfit(characterImage);
    setClickCallback(null);
    setRotationStyle('all around');
    setSize(100);
    setBackdropIndex(0);
    setVolume(100);
    setPitchEffect(0);
  };

  const clearRunState = () => {
    // Only clears transient run state (like speech bubbles and event listeners)
    // but KEEPS position, rotation, and effects so the simulation is continuous!
    setSpeech(null);
    setClickCallback(null);
    activeAudioContextsRef.current.forEach(ctx => { try { if (ctx.state !== 'closed') ctx.close().catch(()=>{}); } catch(e){} });
    activeAudioContextsRef.current.clear();
  };

  const api: CharacterStageApi = { moveForward, turn, goTo, glideToMouse, say, show, hide, playSound, onClick, changeOutfit, paintColor, dissolve, reset, clearRunState, pointInDirection, pointTowardsMouse, changeX, setX, changeY, setY, goToRandom, glideToRandom, glideToXY, ifOnEdgeBounce, setRotStyle, getX, getY, getDirection, sayForSecs, thinkForSecs, think, nextCostume, switchBackdrop, nextBackdrop, changeSizeBy, setSizeTo, changeEffectBy, setEffectTo, clearGraphicEffects, playSoundUntilDone, startSound, stopAllSounds, changeSoundEffectBy, setSoundEffectTo, clearSoundEffects, changeVolumeBy, setVolumeTo, getVolume };

  useImperativeHandle(ref, () => api);

  useEffect(() => {
    window.characterStageApi = api;
    return () => {
      delete window.characterStageApi;
    };
  }, [position, rotation, visible, speech, speechType, currentOutfit, colorEffect, dissolveAmount, clickCallback, rotationStyle, size, backdropIndex, volume, pitchEffect]); // Re-bind on state change so closures have fresh data.
  // Using refs for state in the API would be better to avoid stale closures, but since we are returning promises that use functional state updates, it should be fine.
  
  // Actually, wait, useImperativeHandle does not need to re-bind if we use functional state updates.
  // But window.characterStageApi might get stale. Let's fix that below:

  return (
    <div 
      ref={containerRef}
      className="character-stage-container" 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden', 
        background: ['transparent', '#e0f7fa', '#fce4ec'][backdropIndex] || 'transparent',
        borderRadius: '8px',
        border: '1px solid var(--border-light)',
      }}
    >
      <div 
        className="stage-canvas"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${stageWidth}px`,
          height: `${stageHeight}px`,
          background: backgroundImage ? `url(${backgroundImage}) center/100% 100% no-repeat` : '#ffffff',
          overflow: 'visible'
        }}
      >
        {/* Origin point (center) - hidden */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 2, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', transform: 'translate(-50%, -50%)' }} />
        
        {visible && (
          <div
            className="character-sprite"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% - ${position.y}px))`, // Negative Y because typical graphs go up, but HTML goes down
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', // Playful bouncy transition
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            {speech && (
              <div 
                className="speech-bubble"
                style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '6px 12px',
                  borderRadius: speechType === 'think' ? '30px' : '16px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 20
                }}
              >
                {speech}
                {speechType === 'say' ? (
                  <div style={{
                    position: 'absolute',
                    bottom: '-5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid white'
                  }}/>
                ) : (
                  <>
                    <div style={{ position: 'absolute', bottom: '-10px', left: '20px', width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '-20px', left: '10px', width: '4px', height: '4px', backgroundColor: 'white', borderRadius: '50%' }} />
                  </>
                )}
              </div>
            )}
            
            <img 
              src={currentOutfit} 
              alt="Character" 
              onClick={() => { if (clickCallback) clickCallback(); }}
              style={{
                width: `${150 * (size / 100)}px`,
                height: `${180 * (size / 100)}px`,
                objectFit: 'contain',
                transform: (() => {
                  let displayRotation = rotation;
                  let scaleX = 1;
                  if (rotationStyle === 'left-right') {
                    displayRotation = 0;
                    const normRot = ((rotation % 360) + 360) % 360;
                    if (normRot > 90 && normRot < 270) {
                      scaleX = -1;
                    }
                  } else if (rotationStyle === 'don\'t rotate') {
                    displayRotation = 0;
                  }
                  return `rotate(${displayRotation}deg) scaleX(${scaleX})`;
                })(),
                transition: 'transform 0.3s ease-in-out, filter 0.3s ease-in-out',
                filter: `hue-rotate(${colorEffect}deg) opacity(${100 - dissolveAmount}%)`,
                cursor: clickCallback ? 'pointer' : 'default',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

CharacterStage.displayName = 'CharacterStage';
