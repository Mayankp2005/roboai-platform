export interface PinDefinition {
  name: string;
  x: number;
  y: number;
}

export const getRotatedPinCoordinates = (compX: number, compY: number, pinX: number, pinY: number, rotation: number = 0, mirrored: boolean = false) => {
    let px = pinX;
    let py = pinY;
    if (mirrored) {
        px = -px;
    }
    
    if (rotation === 0) return { x: compX + px, y: compY + py };
    const rad = rotation * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = px * cos - py * sin;
    const ry = px * sin + py * cos;
    return { x: compX + rx, y: compY + ry };
};

const generateBreadboardPins = (): PinDefinition[] => {
    const pins: PinDefinition[] = [];
    const dx = 10;
    const startX = 50;
    
    // Top Power: y=20 (-), y=30 (+)
    // Top Power loop has been moved below to use validCols
    // Top Block: j(60), i(70), h(80), g(90), f(100)
    const topLetters = ['j', 'i', 'h', 'g', 'f']; 
    for (let col = 0; col < 30; col++) {
      const cx = startX + col * dx;
      for (let row = 0; row < 5; row++) {
        pins.push({ name: `${col + 1}${topLetters[row]}`, x: cx, y: 60 + row * 10 });
      }
    }
    
    // Bottom Block: e(120), d(130), c(140), b(150), a(160)
    const bottomLetters = ['e', 'd', 'c', 'b', 'a'];
    for (let col = 0; col < 30; col++) {
      const cx = startX + col * dx;
      for (let row = 0; row < 5; row++) {
        pins.push({ name: `${col + 1}${bottomLetters[row]}`, x: cx, y: 120 + row * 10 });
      }
    }
    
    // Bottom Power: y=190 (+), y=200 (-)
    const validCols = [
      0, 1, 2, 3, 4,
      6, 7, 8, 9, 10,
      12, 13, 14, 15, 16,
      18, 19, 20, 21, 22,
      24, 25, 26, 27, 28
    ];
    for (let i = 0; i < 25; i++) {
      const cx = startX + validCols[i] * dx;
      pins.push({ name: `B_+_${i}`, x: cx, y: 190 });
      pins.push({ name: `B_-_${i}`, x: cx, y: 200 });
    }
    
    // Top Power (if needed, although previously it was missed or combined, let's make sure it exists)
    for (let i = 0; i < 25; i++) {
      const cx = startX + validCols[i] * dx;
      pins.push({ name: `T_-_${i}`, x: cx, y: 20 });
      pins.push({ name: `T_+_${i}`, x: cx, y: 30 });
    }
    
    return pins;
};

export const COMPONENT_PINS: Record<string, PinDefinition[]> = {
  'wokwi-arduino-uno': [
    {name:"GND.1",x:115.5,y:9},
    {name:"13",x:125,y:9},
    {name:"12",x:134.5,y:9},
    {name:"11",x:144,y:9},
    {name:"10",x:153.5,y:9},
    {name:"9",x:163,y:9},
    {name:"8",x:173,y:9},
    {name:"7",x:189,y:9},
    {name:"6",x:198.5,y:9},
    {name:"5",x:208,y:9},
    {name:"4",x:217.5,y:9},
    {name:"3",x:227,y:9},
    {name:"2",x:236.5,y:9},
    {name:"1",x:246,y:9},
    {name:"0",x:255.5,y:9},
    {name:"3.3V",x:150,y:191.5},
    {name:"5V",x:160,y:191.5},
    {name:"GND.2",x:169.5,y:191.5},
    {name:"GND.3",x:179,y:191.5},
    {name:"VIN",x:188.5,y:191.5},
    {name:"A0",x:208,y:191.5},
    {name:"A1",x:217.5,y:191.5},
    {name:"A2",x:227,y:191.5},
    {name:"A3",x:236.5,y:191.5},
    {name:"A4",x:246,y:191.5},
    {name:"A5",x:255.5,y:191.5}
  ],
  'wokwi-led': [
    {name: "A", x: 25, y: 42},
    {name: "C", x: 15, y: 42}
  ],
  'wokwi-resistor': [
    {name: "1", x: 0, y: 5.65},
    {name: "2", x: 58.8, y: 5.65}
  ],
  'wokwi-pushbutton': [
    {name: "1.l", x: 0, y: 13},
    {name: "2.l", x: 0, y: 32},
    {name: "1.r", x: 67, y: 13},
    {name: "2.r", x: 67, y: 32}
  ],
  'wokwi-buzzer': [
    {name: "1", x: 27, y: 84},
    {name: "2", x: 37, y: 84}
  ],
  'wokwi-servo': [
    {name: "GND", x: 0, y: 50},
    {name: "V+", x: 0, y: 59.5},
    {name: "PWM", x: 0, y: 69}
  ],
  'wokwi-potentiometer': [
    {name: "GND", x: 29, y: 68.5},
    {name: "SIG", x: 39, y: 68.5},
    {name: "VCC", x: 49, y: 68.5}
  ],
  'wokwi-slide-switch': [
    {name: "1", x: 6.5, y: 34},
    {name: "2", x: 16, y: 34},
    {name: "3", x: 25.5, y: 34}
  ],
  'wokwi-photoresistor-sensor': [
    {name: "VCC", x: 172, y: 16},
    {name: "GND", x: 172, y: 26},
    {name: "DO", x: 172, y: 35.8},
    {name: "AO", x: 172, y: 45.5}
  ],
  'wokwi-rgb-led': [
    { name: 'R', x: 8.5, y: 44 },
    { name: 'COM', x: 18, y: 54 },
    { name: 'G', x: 26.4, y: 44 },
    { name: 'B', x: 35.7, y: 44 }
  ],
  'wokwi-hc-sr04': [
    { name: 'VCC', x: 71.3, y: 94.5 },
    { name: 'TRIG', x: 81.3, y: 94.5 },
    { name: 'ECHO', x: 91.3, y: 94.5 },
    { name: 'GND', x: 101.3, y: 94.5 }
  ],
  'wokwi-pir-motion-sensor': [
    { name: 'VCC', x: 36.178, y: 92 },
    { name: 'OUT', x: 45.9175, y: 92 },
    { name: 'GND', x: 55.6415, y: 92 }
  ],
  'wokwi-ntc-temperature-sensor': [
    { name: 'GND', x: 135, y: 26.2 },
    { name: 'VCC', x: 135, y: 35.8 },
    { name: 'OUT', x: 135, y: 45.5 }
  ],
  'wokwi-breadboard-half': generateBreadboardPins(),
  'custom-tmp36': [
    { name: 'VCC', x: 15, y: 60 },
    { name: 'VOUT', x: 25, y: 60 },
    { name: 'GND', x: 35, y: 60 }
  ],
  'custom-multimeter': [
    { name: 'COM', x: 34, y: 70 },
    { name: 'V', x: 66, y: 70 }
  ],
  'custom-battery-9v': [
    { name: 'VCC', x: 0, y: 18 },
    { name: 'GND', x: 0, y: 42 }
  ],
  'custom-battery-coin': [
    { name: 'VCC', x: 30, y: 0 },
    { name: 'GND', x: 30, y: 70 }
  ],
  'custom-battery-aa': [
    { name: 'VCC', x: 15, y: 0 },
    { name: 'GND', x: 15, y: 90 }
  ]
};

export interface Wire {
  id: string;
  fromComp: string;
  fromPin: string;
  toComp: string;
  toPin: string;
  color: string;
  waypoints?: {x: number, y: number}[];
}
