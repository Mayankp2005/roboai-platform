# 🤖 RoboAI Platform

**A visual programming IDE for teaching robotics and AI** — students drag blocks to build logic, simulate it in-browser, and flash real ESP32 hardware with one click.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript) ![Blockly](https://img.shields.io/badge/Blockly-12-4285F4?logo=google) ![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4-FF6F00?logo=tensorflow) ![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Visual Builder** | Drag-and-drop block programming powered by [Google Blockly](https://developers.google.com/blockly) with kid-friendly labels and emoji icons |
| **Dual Code Generation** | Blocks compile to both **C++ firmware** (for ESP32) and **JavaScript** (for in-browser simulation) in real time |
| **In-Browser Simulation** | Run your robot logic instantly — character stage with movement, speech bubbles, sound effects, and real microphone input via Web Speech API |
| **Hardware Flashing** | One-click compile + flash to ESP32 via [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) and [esptool-js](https://github.com/nicePeng/esptool-js) — no Arduino IDE needed |
| **AI Vision** | Real-time object detection using [TensorFlow.js](https://www.tensorflow.org/js) + COCO-SSD on an IP webcam feed, with detection events streamed to the ESP32 over serial |
| **Cloud Saves** | Firebase authentication (Email) with Firestore project storage |
| **Dark/Light Theme** | Glassmorphism UI with smooth theme transitions |
| **Student Manual** | Built-in guided curriculum for 10 robotics projects with wiring diagrams and step-by-step block instructions |

## 🏗️ Architecture

```
roboai-platform/
├── src/
│   ├── App.tsx                  # Thin orchestrator — composes hooks & components
│   ├── hooks/
│   │   ├── useToast.ts          # Toast notification state
│   │   ├── useSerial.ts         # Web Serial communication (connect/disconnect/read)
│   │   ├── useFlash.ts          # Firmware compile + ESP32 flashing pipeline
│   │   └── useSimulation.ts     # Sandboxed JS simulation runtime
│   ├── components/
│   │   ├── Header.tsx           # App header (tabs, auth, actions)
│   │   ├── SidePanel.tsx        # Monitor tabs, logs, stage, vision, device info
│   │   ├── BlocklyWorkspace.tsx # Blockly editor with cloud/local persistence
│   │   ├── CharacterStage.tsx   # Animated character canvas (Scratch-like)
│   │   ├── VisionMonitor.tsx    # TF.js object detection on IP webcam
│   │   ├── ErrorBoundary.tsx    # Crash-resilient component boundaries
│   │   ├── AuthModal.tsx        # Firebase auth modal
│   │   ├── Toast.tsx            # Toast notifications
│   │   ├── CodeViewer.tsx       # Generated C++ code viewer
│   │   ├── DataStudio.tsx       # Sensor telemetry dashboard
│   │   └── StudentManual.tsx    # Built-in 10-project curriculum
│   ├── blocks/
│   │   ├── customBlocks.ts      # Custom Blockly block definitions
│   │   └── generator.ts         # C++ and JavaScript code generators
│   ├── firebase.ts              # Firebase configuration
│   └── index.css                # Design system (CSS variables, glassmorphism, components)
├── compile-server/
│   ├── server.js                # Express server wrapping arduino-cli
│   ├── arduino-cli.exe          # Bundled ESP32 compiler
│   └── install-compiler.js      # First-time ESP32 board package installer
└── public/assets/               # Character sprites, backgrounds
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **Chrome** or **Edge** (required for Web Serial API)
- An **ESP32 DevKit V1** + USB data cable (for hardware flashing)

### 1. Install & Run the Platform

```bash
cd roboai-platform
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in Chrome.

### 2. Set Up the Compile Server (for hardware flashing)

```bash
cd compile-server
npm install
node install-compiler.js   # Downloads ESP32 board packages (first time only, ~5 min)
node server.js             # Starts local compile server on port 3001
```

### 3. Flash Your ESP32

1. Plug in your ESP32 via USB
2. Click **Connect Device** in the platform
3. Build your block logic in the Visual Builder
4. Click **Flash & Run** — hold the **BOOT** button on your ESP32 when prompted

## 📚 The 10-Kit Projects

| # | Project | Hardware |
|---|---------|----------|
| 01 | Gesture Pilot | ESP32 + MPU6050 IMU |
| 02 | Vision-Based Follower | ESP32 + Motors + Camera |
| 03 | Neural Line Follower | ESP32 + Motors + 3× IR Sensors |
| 04 | Voice Command Bot | ESP32 + Microphone |
| 05 | Smart Traffic Car | ESP32 + Motors + Camera |
| 06 | Pothole/Terrain Mapper | ESP32 + MPU6050 IMU |
| 07 | Autonomous Maze Solver | ESP32 + Motors + Ultrasonic |
| 08 | Obstacle Intelligence | ESP32 + Motors + Ultrasonic + Camera |
| 09 | IoT Weather Scout | ESP32 + DHT11 + LDR |
| 10 | Safety/Edge Guard | ESP32 + Motors + Ultrasonic |

Detailed wiring instructions and block-by-block guides are in the **Student Manual** tab.

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 7
- **Block Editor**: Google Blockly 12
- **AI/ML**: TensorFlow.js + COCO-SSD (real-time object detection)
- **Hardware**: Web Serial API + esptool-js (browser-based ESP32 flashing)
- **Backend**: Firebase Auth + Firestore (cloud saves)
- **Compile Server**: Express + arduino-cli (C++ to firmware binary)
- **Styling**: Vanilla CSS with CSS variables, glassmorphism, dark/light themes

## 📄 License

This project is part of the RoboAI educational robotics ecosystem.
