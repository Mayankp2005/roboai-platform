// @ts-nocheck
import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';

export const cppGenerator = new Blockly.Generator('CPP');

// We use ORDER_ATOMIC as a catch-all precedence for our simple blocks
const CPP_ORDER_ATOMIC = 0;

cppGenerator.scrub_ = function (block: any, code: string, opt_thisOnly: boolean) {
    if (block.type.startsWith('event_')) return code;
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = opt_thisOnly ? '' : cppGenerator.blockToCode(nextBlock);
    return code + nextCode;
};

(cppGenerator as any).scrubNakedValue = function(code: string) {
    return '';
};

(cppGenerator as any).init = function(workspace: Blockly.Workspace) {
    (this as any).definitions_ = Object.create(null);
    (this as any).setups_ = Object.create(null);
    (this as any).includes_ = Object.create(null);
};

// Add Arduino wrap-up
(cppGenerator as any).finish = function (code: string) {
    const definitions = [];
    for (const name in (this as any).definitions_) {
        definitions.push((this as any).definitions_[name]);
    }
    const defsCode = definitions.join('\n\n');

    const hasRoboAI = code.includes('RoboAI::') || defsCode.includes('RoboAI::');
    const hasEdgeAI = code.includes('EdgeAI::') || defsCode.includes('EdgeAI::');
    const hasIoT = code.includes('IoT::') || defsCode.includes('IoT::');
    const hasStrategy = code.includes('Strategy::') || defsCode.includes('Strategy::');
    const hasBLE = !!(this as any).definitions_['%BLE_START'];

    let stubsCode = '';
    if (hasRoboAI || hasEdgeAI || hasIoT || hasStrategy) {
        stubsCode += `// --- RoboAI Hardware Stubs (Remove when library is installed) ---\n`;
    }

    if (hasRoboAI) {
        stubsCode += `struct RoboAILib {
    // L298N Motor Driver Pin Mapping
    // Motor A (Left)
    static const int ENA = 14; // Speed PWM - Motor A
    static const int IN1 = 27; // Direction
    static const int IN2 = 26; // Direction
    // Motor B (Right)
    static const int ENB = 12; // Speed PWM - Motor B
    static const int IN3 = 25; // Direction
    static const int IN4 = 33; // Direction

    static void _initMotors() {
        static bool initialized = false;
        if (!initialized) {
            pinMode(ENA, OUTPUT); pinMode(ENB, OUTPUT);
            pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);
            pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);
            initialized = true;
        }
    }

    static void driveMotor(String motor, int power, int dir) {
        _initMotors();
        int spd = map(power, 0, 100, 0, 255);
        
        static int last_spd_A = -1, last_dir_A = -1;
        static int last_spd_B = -1, last_dir_B = -1;

        if (motor == "LEFT" || motor == "BOTH") {
            if (spd != last_spd_A || dir != last_dir_A) {
                if (dir == 1) { digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); }
                else { digitalWrite(IN1, LOW); digitalWrite(IN2, HIGH); }
                analogWrite(ENA, spd);
                last_spd_A = spd; last_dir_A = dir;
            }
        }
        if (motor == "RIGHT" || motor == "BOTH") {
            if (spd != last_spd_B || dir != last_dir_B) {
                if (dir == 1) { digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW); }
                else { digitalWrite(IN3, LOW); digitalWrite(IN4, HIGH); }
                analogWrite(ENB, spd);
                last_spd_B = spd; last_dir_B = dir;
            }
        }
    }

    static void stopMotor(String motor) {
        _initMotors();
        if (motor == "LEFT" || motor == "BOTH") {
            analogWrite(ENA, 0);
            digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
        }
        if (motor == "RIGHT" || motor == "BOTH") {
            analogWrite(ENB, 0);
            digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
        }
    }

    static void advancePower(int p) { driveMotor("BOTH", p, 1); }
    static void steerAngle(int a) { /* Motor timing logic for steering */ }
    static void rotate4WD(String dir) { /* Skid steer logic */ }
    static void dance(String p) { /* Predefined movement sequence */ }

    // --- Physical Sensor Implementations ---
    static int readUltrasonic() {
        int trigPin = 5; int echoPin = 18;
        pinMode(trigPin, OUTPUT); pinMode(echoPin, INPUT);
        digitalWrite(trigPin, LOW); delayMicroseconds(2);
        digitalWrite(trigPin, HIGH); delayMicroseconds(10);
        digitalWrite(trigPin, LOW);
        long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout
        if (duration == 0) return 999; // No echo
        return duration * 0.034 / 2;
    }

    static int readIR(String pos) {
        int pin = (pos == "LEFT") ? 32 : ((pos == "CENTER") ? 35 : 13);
        pinMode(pin, INPUT);
        return digitalRead(pin);
    }

    static int readLightLevel() {
        return map(analogRead(34), 0, 4095, 0, 100);
    }

    // --- Real Hardware I2C for MPU6050 (Project 01 & 06) ---
    static float readIMU(String axis) {
        static bool imu_init = false;
        if (!imu_init) {
#if defined(ESP32)
            Wire.begin(21, 22);
            Wire.setTimeOut(150); // Prevent ESP32 from hanging if IMU is not wired correctly
#else
            Wire.begin();
#endif
            Serial.println("Initializing MPU6050...");
            Wire.beginTransmission(0x68);
            Wire.write(0x6B);
            Wire.write(0); // Wake up MPU6050
            byte error = Wire.endTransmission(true);
            if (error != 0) {
                Serial.println("ERROR: MPU6050 not found! Check wiring (SDA=21, SCL=22).");
                return 0.0;
            }
            imu_init = true;
        }
        Wire.beginTransmission(0x68);
        Wire.write(0x3B); // Start with register 0x3B (ACCEL_XOUT_H)
        Wire.endTransmission(false);
        Wire.requestFrom((uint8_t)0x68, (uint8_t)6, (uint8_t)1);
        
        int16_t AcX = Wire.read()<<8 | Wire.read();
        int16_t AcY = Wire.read()<<8 | Wire.read();
        int16_t AcZ = Wire.read()<<8 | Wire.read();
        
        if (axis == "AX") return AcX / 16384.0;
        if (axis == "AY") return AcY / 16384.0;
        if (axis == "AZ") return AcZ / 16384.0;
        if (axis == "PITCH") return (atan2(AcY, AcZ) * 180.0) / PI;
        if (axis == "ROLL")  return (atan2(-AcX, AcZ) * 180.0) / PI;
        return 0;
    }

    // --- Simulated Sensor Stubs (To prevent heavy library dependencies) ---
    static int readDHT11(String type) { return (type == "TEMP") ? 24 : 50; }
};
#define RoboAI RoboAILib\n\n`;
    }

    if (hasEdgeAI) {
        stubsCode += `String _roboai_lastDetect = "";\n`;
        stubsCode += `struct EdgeAILib {
    // --- Edge AI & Vision (Simulated Stubs for ESP32) ---
    // In a real launch, these would poll a local Python server or serial stream.
    static void checkSerial() {
        while (Serial.available() > 0) {
            String msg = Serial.readStringUntil('\\n');
            msg.trim();
            if (msg.startsWith("DETECT:")) {
                _roboai_lastDetect = msg.substring(7);
            }
        }
    }
${hasBLE ? `
    // --- BLE Setup for Edge AI ---
    class MyServerCallbacks: public BLEServerCallbacks {
        void onConnect(BLEServer* pServer) {
          deviceConnected = true;
          BLEDevice::startAdvertising();
        };
        void onDisconnect(BLEServer* pServer) {
          deviceConnected = false;
        }
    };

    class MyCallbacks: public BLECharacteristicCallbacks {
        void onWrite(BLECharacteristic *pCharacteristic) {
          String rxValue = pCharacteristic->getValue().c_str();
          if (rxValue.length() > 0) {
            rxValue.trim();
            if (rxValue.startsWith("DETECT:")) {
                _roboai_lastDetect = rxValue.substring(7);
            }
          }
        }
    };
` : ''}
    static bool visionDetect(String obj) {
        checkSerial();
        String search = obj;
        search.toLowerCase();
        if (search == "human face") search = "person";
        if (_roboai_lastDetect == "") return false;
        return (_roboai_lastDetect.indexOf(search) != -1);
    }
    static bool hearWakeWord(String word) { return random(0, 10) > 8; }
    static bool trackColor(String color) { return true; }
    static int predictSteering() { return random(-45, 45); }
    static String classifyTerrain() { return "SMOOTH"; }
    static String predictMazeMove() { return "FORWARD"; }
    static String predictWeather() { return "SUNNY"; }
    static bool detectEdge() { return false; }

    static void waitForWakeWord(String w) { delay(1000); }
    static String listenCommand() { return "turn left"; }
    static int getSoundLevel() { return random(20, 80); }
    static void speak(String text) { Serial.println("SPEAK: " + text); }
};
#define EdgeAI EdgeAILib\n\n`;
    }

    if (hasIoT) {
        stubsCode += `struct IoTLib {
    static void logToSheets(String data) { Serial.println("SHEET LOG: " + data); }
    static void triggerWebhook(String msg) { Serial.println("WEBHOOK: " + msg); }
    static String getWebTime() { return "12:00 PM"; }
};
#define IoT IoTLib\n\n`;
    }

    if (hasStrategy) {
        stubsCode += `struct StrategyLib {
    static void optimizePath() { Serial.println("Optimizing Maze Path..."); }
    static void storeMove(String move) { Serial.println("Stored Move: " + move); }
    static void rememberIntersection() { Serial.println("Intersection Logged."); }
};
#define Strategy StrategyLib\n\n`;
    }

    if (hasRoboAI || hasEdgeAI || hasIoT || hasStrategy) {
        stubsCode += `// ----------------------------------------------------------------\n`;
    }

    return `#include <Arduino.h>
#include <Wire.h>
${(this as any).definitions_['%BLE_START'] ? `
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E" // UART service UUID
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

BLEServer *pServer = NULL;
BLECharacteristic * pTxCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;
` : ''}

${stubsCode}

${defsCode}

void setup() {
  Serial.begin(115200);
${(this as any).definitions_['%BLE_START'] ? `
  // Setup BLE
  BLEDevice::init("${(this as any).definitions_['%BLE_START']}");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new EdgeAILib::MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pTxCharacteristic = pService->createCharacteristic(
										CHARACTERISTIC_UUID_TX,
										BLECharacteristic::PROPERTY_NOTIFY
									);
  pTxCharacteristic->addDescriptor(new BLE2902());

  BLECharacteristic * pRxCharacteristic = pService->createCharacteristic(
											 CHARACTERISTIC_UUID_RX,
											BLECharacteristic::PROPERTY_WRITE
										);
  pRxCharacteristic->setCallbacks(new EdgeAILib::MyCallbacks());

  pService->start();
  pServer->getAdvertising()->start();
  Serial.println("BLE Started. Waiting for connections...");
` : ''}
}

void loop() {
${(this as any).definitions_['%BLE_START'] ? `
    // disconnecting
    if (!deviceConnected && oldDeviceConnected) {
        delay(500); // give the bluetooth stack the chance to get things ready
        pServer->startAdvertising(); // restart advertising
        Serial.println("start advertising");
        oldDeviceConnected = deviceConnected;
    }
    // connecting
    if (deviceConnected && !oldDeviceConnected) {
		// do stuff here on connecting
        oldDeviceConnected = deviceConnected;
    }
` : ''}
${code}
}
`;
};

// C++ Basic mappings
(cppGenerator as any).forBlock['controls_if'] = function (block: any) {
    let n = 0;
    let code = '';
    do {
        const conditionCode = cppGenerator.valueToCode(block, 'IF' + n, CPP_ORDER_ATOMIC) || 'false';
        let branchCode = cppGenerator.statementToCode(block, 'DO' + n);
        if (branchCode === '') branchCode = '  // empty branch\n';

        code += (n > 0 ? 'else if (' : 'if (') + conditionCode + ') {\n' + branchCode + '}\n';
        ++n;
    } while (block.getInput('IF' + n));

    if (block.getInput('ELSE')) {
        let branchCode = cppGenerator.statementToCode(block, 'ELSE');
        if (branchCode === '') branchCode = '  // empty branch\n';
        code += 'else {\n' + branchCode + '}\n';
    }
    return code;
};
(cppGenerator as any).forBlock['controls_ifelse'] = (cppGenerator as any).forBlock['controls_if'];

(cppGenerator as any).forBlock['logic_compare'] = function (block: any) {
    const OP_MAP: { [key: string]: string } = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' };
    const op = OP_MAP[block.getFieldValue('OP')] || '==';
    const a = cppGenerator.valueToCode(block, 'A', CPP_ORDER_ATOMIC) || '0';
    const b = cppGenerator.valueToCode(block, 'B', CPP_ORDER_ATOMIC) || '0';
    return [`${a} ${op} ${b}`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['logic_operation'] = function (block: any) {
    const op = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
    const a = cppGenerator.valueToCode(block, 'A', CPP_ORDER_ATOMIC) || 'false';
    const b = cppGenerator.valueToCode(block, 'B', CPP_ORDER_ATOMIC) || 'false';
    return [`${a} ${op} ${b}`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['logic_negate'] = function (block: any) {
    const val = cppGenerator.valueToCode(block, 'BOOL', CPP_ORDER_ATOMIC) || 'false';
    return [`!${val}`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['logic_boolean'] = function (block: any) {
    return [block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false', CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['logic_null'] = function () {
    return ['NULL', CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['logic_ternary'] = function (block: any) {
    const ifCode = cppGenerator.valueToCode(block, 'IF', CPP_ORDER_ATOMIC) || 'false';
    const thenCode = cppGenerator.valueToCode(block, 'THEN', CPP_ORDER_ATOMIC) || '0';
    const elseCode = cppGenerator.valueToCode(block, 'ELSE', CPP_ORDER_ATOMIC) || '0';
    return [`${ifCode} ? ${thenCode} : ${elseCode}`, CPP_ORDER_ATOMIC];
};

// C++ Loops
(cppGenerator as any).forBlock['controls_repeat_ext'] = function (block: any) {
    const repeats = cppGenerator.valueToCode(block, 'TIMES', CPP_ORDER_ATOMIC) || '0';
    let branchCode = cppGenerator.statementToCode(block, 'DO');
    const loopVar = Blockly.utils.idGenerator.genUid().slice(0, 5);
    return `for (int _i_${loopVar} = 0; _i_${loopVar} < ${repeats}; _i_${loopVar}++) {\n${branchCode}  delay(10);\n}\n`;
};

(cppGenerator as any).forBlock['controls_whileUntil'] = function (block: any) {
    const until = block.getFieldValue('MODE') === 'UNTIL';
    let condition = cppGenerator.valueToCode(block, 'BOOL', CPP_ORDER_ATOMIC) || 'false';
    if (until) condition = `!(${condition})`;
    let branchCode = cppGenerator.statementToCode(block, 'DO');
    return `while (${condition}) {\n${branchCode}  delay(10);\n}\n`;
};

(cppGenerator as any).forBlock['controls_for'] = function (block: any) {
    const varName = block.getField('VAR')?.getText() || 'i';
    const fromCode = cppGenerator.valueToCode(block, 'FROM', CPP_ORDER_ATOMIC) || '0';
    const toCode = cppGenerator.valueToCode(block, 'TO', CPP_ORDER_ATOMIC) || '10';
    const byCode = cppGenerator.valueToCode(block, 'BY', CPP_ORDER_ATOMIC) || '1';
    let branchCode = cppGenerator.statementToCode(block, 'DO');
    return `for (int ${varName} = ${fromCode}; ${varName} <= ${toCode}; ${varName} += ${byCode}) {\n${branchCode}  delay(10);\n}\n`;
};

(cppGenerator as any).forBlock['controls_flow_statements'] = function (block: any) {
    return block.getFieldValue('FLOW') === 'BREAK' ? 'break;\n' : 'continue;\n';
};

// C++ Kid-Friendly Logic & Loops
(cppGenerator as any).forBlock['control_repeat_forever'] = function (block: any) {
    let branchCode = cppGenerator.statementToCode(block, 'DO');
    return `while (true) {\n${branchCode}  delay(10); // Prevent ESP32 Watchdog Crash\n}\n`;
};

(cppGenerator as any).forBlock['control_wait_until'] = function (block: any) {
    let condition = cppGenerator.valueToCode(block, 'CONDITION', CPP_ORDER_ATOMIC) || 'false';
    return `while (!(${condition})) {\n  delay(10);\n}\n`;
};

(cppGenerator as any).forBlock['control_if_simple'] = function (block: any) {
    const conditionCode = cppGenerator.valueToCode(block, 'CONDITION', CPP_ORDER_ATOMIC) || 'false';
    let branchCode = cppGenerator.statementToCode(block, 'DO');
    if (branchCode === '') branchCode = '  // empty branch\n';
    return `if (${conditionCode}) {\n${branchCode}}\n`;
};

(cppGenerator as any).forBlock['control_if_else_simple'] = function (block: any) {
    const conditionCode = cppGenerator.valueToCode(block, 'CONDITION', CPP_ORDER_ATOMIC) || 'false';
    let branchCode = cppGenerator.statementToCode(block, 'DO');
    if (branchCode === '') branchCode = '  // empty branch\n';
    let elseCode = cppGenerator.statementToCode(block, 'ELSE');
    if (elseCode === '') elseCode = '  // empty branch\n';
    return `if (${conditionCode}) {\n${branchCode}}\nelse {\n${elseCode}}\n`;
};

// C++ Math
(cppGenerator as any).forBlock['math_number'] = function (block: any) {
    return [block.getFieldValue('NUM'), CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['math_arithmetic'] = function (block: any) {
    const OP_MAP: { [key: string]: string } = { 'ADD': '+', 'MINUS': '-', 'MULTIPLY': '*', 'DIVIDE': '/', 'POWER': 'pow' };
    const op = block.getFieldValue('OP');
    const a = cppGenerator.valueToCode(block, 'A', CPP_ORDER_ATOMIC) || '0';
    const b = cppGenerator.valueToCode(block, 'B', CPP_ORDER_ATOMIC) || '0';
    if (op === 'POWER') {
        return [`pow(${a}, ${b})`, CPP_ORDER_ATOMIC];
    }
    return [`${a} ${OP_MAP[op] || '+'} ${b}`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['math_single'] = function (block: any) {
    const OP_MAP: { [key: string]: string } = {
        'ROOT': 'sqrt', 'ABS': 'abs', 'NEG': '-', 'LN': 'log', 'LOG10': 'log10', 'EXP': 'exp', 'POW10': 'pow10'
    };
    const op = block.getFieldValue('OP');
    const num = cppGenerator.valueToCode(block, 'NUM', CPP_ORDER_ATOMIC) || '0';
    if (op === 'NEG') {
        return [`-${num}`, CPP_ORDER_ATOMIC];
    }
    if (op === 'POW10') {
        return [`pow(10, ${num})`, CPP_ORDER_ATOMIC];
    }
    return [`${OP_MAP[op] || 'abs'}(${num})`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['math_modulo'] = function (block: any) {
    const a = cppGenerator.valueToCode(block, 'DIVIDEND', CPP_ORDER_ATOMIC) || '0';
    const b = cppGenerator.valueToCode(block, 'DIVISOR', CPP_ORDER_ATOMIC) || '1';
    return [`${a} % ${b}`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['math_random_int'] = function (block: any) {
    const a = cppGenerator.valueToCode(block, 'FROM', CPP_ORDER_ATOMIC) || '0';
    const b = cppGenerator.valueToCode(block, 'TO', CPP_ORDER_ATOMIC) || '100';
    return [`random(${a}, ${b})`, CPP_ORDER_ATOMIC];
};


// C++ Variables
(cppGenerator as any).forBlock['variables_get'] = function (block: any) {
    const code = block.getField('VAR')?.getText() || 'unnamed_var';
    return [code, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['variables_set'] = function (block: any) {
    const varName = block.getField('VAR')?.getText() || 'unnamed_var';
    const value = cppGenerator.valueToCode(block, 'VALUE', CPP_ORDER_ATOMIC) || '0';
    return `${varName} = ${value};\n`;
};

(cppGenerator as any).forBlock['variables_set_inline'] = function (block: any) {
    const varName = block.getFieldValue('VAR') || 'unnamed_var';
    const value = cppGenerator.valueToCode(block, 'VALUE', CPP_ORDER_ATOMIC) || '0';
    // For C++, if we want to support dynamic inline definition we might need to know if it's declared
    // but in a simplified model, we'll assume it's just an assignment, or `auto` for a new one.
    // For simplicity, we just do auto.
    return `auto ${varName} = ${value};\n`;
};

(cppGenerator as any).forBlock['variables_get_inline'] = function (block: any) {
    const varName = block.getFieldValue('VAR') || 'unnamed_var';
    return [varName, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['math_change'] = function (block: any) {
    const varName = block.getField('VAR')?.getText() || 'unnamed_var';
    const value = cppGenerator.valueToCode(block, 'DELTA', CPP_ORDER_ATOMIC) || '0';
    return `${varName} += ${value};\n`;
};

// C++ Functions
(cppGenerator as any).forBlock['procedures_defreturn'] = function (block: any) {
    const funcName = block.getFieldValue('NAME');
    let branch = cppGenerator.statementToCode(block, 'STACK');
    let returnValue = cppGenerator.valueToCode(block, 'RETURN', CPP_ORDER_ATOMIC) || '';
    if (returnValue) {
        returnValue = `  return ${returnValue};\n`;
    }

    // In Arduino, variables are usually typed but Blockly is dynamically typed. 
    // We default to `int` for return type unless empty.
    const returnType = returnValue ? 'int' : 'void';

    // We add it to definitions so it appears above setup/loop normally
    const code = `${returnType} ${funcName}() {\n${branch}${returnValue}}\n`;
    (cppGenerator as any).definitions_[`%${funcName}`] = code;
    return null; // Procedure definition blocks don't return code inline
};

(cppGenerator as any).forBlock['procedures_defnoreturn'] = (cppGenerator as any).forBlock['procedures_defreturn'];

(cppGenerator as any).forBlock['procedures_callreturn'] = function (block: any) {
    const funcName = block.getFieldValue('NAME');
    return [`${funcName}()`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['procedures_callnoreturn'] = function (block: any) {
    const funcName = block.getFieldValue('NAME');
    return `${funcName}();\n`;
};
(cppGenerator as any).forBlock['procedures_ifreturn'] = function (block: any) {
    const condition = cppGenerator.valueToCode(block, 'CONDITION', CPP_ORDER_ATOMIC) || 'false';
    let code = `if (${condition}) {\n`;
    if (block.hasReturnValue_) {
        const value = cppGenerator.valueToCode(block, 'VALUE', CPP_ORDER_ATOMIC) || '0';
        code += `  return ${value};\n`;
    } else {
        code += `  return;\n`;
    }
    code += `}\n`;
    return code;
};

// C++ Motor Blocks
(cppGenerator as any).forBlock['roboai_motor_drive'] = function (block: any) {
    const motor = block.getFieldValue('MOTOR');
    const dir = block.getFieldValue('DIR') === 'FORWARD' ? '1' : '-1';
    let speed = cppGenerator.valueToCode(block, 'SPEED', CPP_ORDER_ATOMIC) || '0';
    return `RoboAI::driveMotor("${motor}", ${speed}, ${dir});\n`;
};

(cppGenerator as any).forBlock['roboai_motor_stop'] = function (block: any) {
    const motor = block.getFieldValue('MOTOR');
    return `RoboAI::stopMotor("${motor}");\n`;
};

// C++ Tinkercad Output Blocks
(cppGenerator as any).forBlock['output_set_builtin_led'] = function (block: any) {
    const state = block.getFieldValue('STATE');
    return `pinMode(LED_BUILTIN, OUTPUT);\ndigitalWrite(LED_BUILTIN, ${state});\n`;
};
(cppGenerator as any).forBlock['output_set_pin'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const state = block.getFieldValue('STATE');
    return `pinMode(${pin}, OUTPUT);\ndigitalWrite(${pin}, ${state});\n`;
};
(cppGenerator as any).forBlock['output_set_pin_analog'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const value = cppGenerator.valueToCode(block, 'VALUE', CPP_ORDER_ATOMIC) || '0';
    return `pinMode(${pin}, OUTPUT);\nanalogWrite(${pin}, ${value});\n`;
};
(cppGenerator as any).forBlock['output_rotate_servo'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const degrees = cppGenerator.valueToCode(block, 'DEGREES', CPP_ORDER_ATOMIC) || '0';
    (cppGenerator as any).definitions_['include_servo'] = '#include <Servo.h>';
    (cppGenerator as any).definitions_[`servo_${pin}`] = `Servo myServo_${pin};`;
    // We need to attach in setup. We can do this using a setup definitions hack, but a simpler inline attach works if we track it.
    // However, attaching in loop is bad. Let's create a wrapper function.
    const funcName = `rotateServo_${pin}`;
    (cppGenerator as any).definitions_[`func_${funcName}`] = `void ${funcName}(int angle) {\n  if(!myServo_${pin}.attached()) myServo_${pin}.attach(${pin});\n  myServo_${pin}.write(angle);\n}`;
    return `${funcName}(${degrees});\n`;
};
(cppGenerator as any).forBlock['output_play_speaker'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const tone = cppGenerator.valueToCode(block, 'TONE', CPP_ORDER_ATOMIC) || '0';
    const secs = cppGenerator.valueToCode(block, 'SECS', CPP_ORDER_ATOMIC) || '0';
    return `tone(${pin}, ${tone});\ndelay((${secs}) * 1000);\nnoTone(${pin});\n`;
};
(cppGenerator as any).forBlock['output_turn_off_speaker'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    return `noTone(${pin});\n`;
};
(cppGenerator as any).forBlock['output_print_serial'] = function (block: any) {
    const text = cppGenerator.valueToCode(block, 'TEXT', CPP_ORDER_ATOMIC) || '""';
    const newline = block.getFieldValue('NEWLINE');
    if (newline === 'NEWLINE') return `Serial.println(${text});\n`;
    return `Serial.print(${text});\n`;
};
(cppGenerator as any).forBlock['output_set_rgb_led'] = function (block: any) {
    const pinR = block.getFieldValue('PIN_R');
    const pinG = block.getFieldValue('PIN_G');
    const pinB = block.getFieldValue('PIN_B');
    // Block colour returns a hex string like "'#ff0000'" (wrapped in quotes usually depending on JS gen, wait, Colour block returns #hex as string).
    // Let's assume COLOR returns a hex string, we parse it or we can just assume it's an int if we use a specific block. 
    // Actually, Blockly's default color block returns a string like "'#ff0000'".
    const color = cppGenerator.valueToCode(block, 'COLOR', CPP_ORDER_ATOMIC) || "'#000000'";
    
    const funcName = `setRGB_${pinR}_${pinG}_${pinB}`;
    (cppGenerator as any).definitions_[`func_${funcName}`] = `void ${funcName}(String hexColor) {\n  long number = strtol(hexColor.c_str() + 1, NULL, 16);\n  int r = number >> 16;\n  int g = number >> 8 & 0xFF;\n  int b = number & 0xFF;\n  pinMode(${pinR}, OUTPUT); pinMode(${pinG}, OUTPUT); pinMode(${pinB}, OUTPUT);\n  analogWrite(${pinR}, r);\n  analogWrite(${pinG}, g);\n  analogWrite(${pinB}, b);\n}`;
    return `${funcName}(${color});\n`;
};

// C++ Sensors
(cppGenerator as any).forBlock['roboai_sensor_ultrasonic'] = function () {
    return ['RoboAI::readUltrasonic()', CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_sensor_imu'] = function (block: any) {
    const axis = block.getFieldValue('AXIS');
    return [`RoboAI::readIMU("${axis}")`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_sensor_ir'] = function (block: any) {
    const pos = block.getFieldValue('POS');
    return [`RoboAI::readIR("${pos}")`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_sensor_environment'] = function (block: any) {
    const type = block.getFieldValue('MEASUREMENT');
    return [`RoboAI::readDHT11("${type}")`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_sensor_light'] = function () {
    return ['RoboAI::readLightLevel()', CPP_ORDER_ATOMIC];
};

// C++ AI Vision
(cppGenerator as any).forBlock['roboai_ai_vision_classify'] = function (block: any) {
    const obj = block.getFieldValue('OBJECT');
    let cocoLabel = obj;
    if (obj === 'FACE') cocoLabel = 'person';
    else if (obj === 'STOP') cocoLabel = 'stop sign';
    else if (obj === 'GO') cocoLabel = 'traffic light';
    return [`EdgeAI::visionDetect("${cocoLabel}")`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_ai_wakeword'] = function (block: any) {
    const word = block.getFieldValue('WORD');
    return [`EdgeAI::hearWakeWord("${word}")`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_ai_vision_track_color'] = function (block: any) {
    const color = block.getFieldValue('COLOR');
    return [`EdgeAI::trackColor("${color}")`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_ai_predict_steering'] = function () {
    return ['EdgeAI::predictSteering()', CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_ai_classify_terrain'] = function (block: any) {
    const terrain = block.getFieldValue('TERRAIN');
    return [`EdgeAI::classifyTerrain() == "${terrain}"`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_ai_maze_next_move'] = function () {
    return ['EdgeAI::predictMazeMove()', CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_ai_predict_weather'] = function () {
    return ['EdgeAI::predictWeather()', CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['roboai_ai_detect_edge'] = function () {
    return ['EdgeAI::detectEdge()', CPP_ORDER_ATOMIC];
};

// C++ Character blocks (Stubbed for C++)
(cppGenerator as any).forBlock['character_move_forward'] = function (block: any) {
    const steps = cppGenerator.valueToCode(block, 'STEPS', CPP_ORDER_ATOMIC) || '0';
    return `// Character Move Forward ${steps}\n`;
};
(cppGenerator as any).forBlock['character_turn'] = function (block: any) {
    const dir = block.getFieldValue('DIR');
    const degrees = cppGenerator.valueToCode(block, 'DEGREES', CPP_ORDER_ATOMIC) || '0';
    return `// Character Turn ${dir} ${degrees}\n`;
};
(cppGenerator as any).forBlock['character_go_to'] = function (block: any) {
    const x = cppGenerator.valueToCode(block, 'X', CPP_ORDER_ATOMIC) || '0';
    const y = cppGenerator.valueToCode(block, 'Y', CPP_ORDER_ATOMIC) || '0';
    return `// Character GoTo ${x}, ${y}\n`;
};
(cppGenerator as any).forBlock['character_say'] = function (block: any) {
    const text = cppGenerator.valueToCode(block, 'TEXT', CPP_ORDER_ATOMIC) || '""';
    return `// Character Say ${text}\n`;
};
(cppGenerator as any).forBlock['character_show'] = function () { return `// Character Show\n`; };
(cppGenerator as any).forBlock['character_hide'] = function () { return `// Character Hide\n`; };
(cppGenerator as any).forBlock['character_play_sound'] = function (block: any) {
    const sound = block.getFieldValue('SOUND');
    return `// Character Sound ${sound}\n`;
};


// C++ Sparks / Events
(cppGenerator as any).forBlock['event_when_flag_clicked'] = function(block: any) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = nextBlock ? cppGenerator.blockToCode(nextBlock) : '';
    return `// EVENT: On Green Flag\n${nextCode}\n`;
};
(cppGenerator as any).forBlock['event_when_sprite_clicked'] = function() { return "// EVENT: On Sprite Clicked\n"; };
(cppGenerator as any).forBlock['event_when_key_pressed'] = function(block: any) {
    const key = block.getFieldValue('KEY');
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = nextBlock ? cppGenerator.blockToCode(nextBlock) : '';
    const funcName = `onKey_${key}_Pressed`;
    (cppGenerator as any).definitions_[funcName] = `void ${funcName}() {\n${nextCode}}\n`;
    return ``;
};
(cppGenerator as any).forBlock['event_when_loud_noise'] = function(block: any) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = nextBlock ? cppGenerator.blockToCode(nextBlock) : '';
    const funcName = `onLoudNoise`;
    (cppGenerator as any).definitions_[funcName] = `void ${funcName}() {\n${nextCode}}\n`;
    return ``;
};

// C++ Brain Games (Logic/Math)
(cppGenerator as any).forBlock['logic_surprise_number'] = function(block: any) {
    const a = block.getFieldValue('FROM') || '1';
    const b = block.getFieldValue('TO') || '10';
    return [`random(${a}, ${b})`, CPP_ORDER_ATOMIC];
};
(cppGenerator as any).forBlock['logic_wait_sec'] = function(block: any) {
    const secs = cppGenerator.valueToCode(block, 'SECONDS', CPP_ORDER_ATOMIC) || '0';
    return `delay(${secs} * 1000);\n`;
};

// C++ Brain Link
(cppGenerator as any).forBlock['roboai_start_bluetooth'] = function(block: any) {
    const name = block.getFieldValue('NAME') || 'RoboAI_Car';
    (cppGenerator as any).definitions_['%BLE_START'] = name;
    return `// BLE Server started with name: ${name}\n`;
};
(cppGenerator as any).forBlock['roboai_brain_connect'] = function() { return "// SYS: Connect via Telepathy\n"; };
(cppGenerator as any).forBlock['roboai_brain_transfer'] = function() { return "// SYS: Transfer Brain (Upload)\n"; };
(cppGenerator as any).forBlock['roboai_brain_sync'] = function() { return "// SYS: Sync Live Mode\n"; };

// C++ HW Motor Additions
(cppGenerator as any).forBlock['roboai_motor_advance_power'] = function(block: any) {
    const power = cppGenerator.valueToCode(block, 'POWER', CPP_ORDER_ATOMIC) || '0';
    return `RoboAI::advancePower(${power});\n`;
};
(cppGenerator as any).forBlock['roboai_motor_steer_angle'] = function(block: any) {
    const angle = cppGenerator.valueToCode(block, 'ANGLE', CPP_ORDER_ATOMIC) || '0';
    return `RoboAI::steerAngle(${angle});\n`;
};
(cppGenerator as any).forBlock['roboai_motor_rotate_4wd'] = function(block: any) {
    const dir = block.getFieldValue('DIR');
    return `RoboAI::rotate4WD("${dir}");\n`;
};
(cppGenerator as any).forBlock['roboai_motor_dance'] = function(block: any) {
    const pattern = block.getFieldValue('PATTERN');
    return `RoboAI::dance("${pattern}");\n`;
};

// C++ HW Audio AI Additions
(cppGenerator as any).forBlock['roboai_ai_wait_wakeword'] = function(block: any) {
    const word = block.getFieldValue('WORD');
    return `EdgeAI::waitForWakeWord("${word}");\n`;
};
(cppGenerator as any).forBlock['roboai_ai_listen_command'] = function() {
    return ['EdgeAI::listenCommand()', CPP_ORDER_ATOMIC];
};
(cppGenerator as any).forBlock['roboai_ai_sound_level'] = function() {
    return ['EdgeAI::getSoundLevel()', CPP_ORDER_ATOMIC];
};
(cppGenerator as any).forBlock['roboai_ai_speak'] = function(block: any) {
    const text = cppGenerator.valueToCode(block, 'TEXT', CPP_ORDER_ATOMIC) || '""';
    return `EdgeAI::speak(${text});\n`;
};

// C++ IoT Additions
(cppGenerator as any).forBlock['iot_log_sheets'] = function(block: any) {
    const data = cppGenerator.valueToCode(block, 'DATA', CPP_ORDER_ATOMIC) || '""';
    return `IoT::logToSheets(${data});\n`;
};
(cppGenerator as any).forBlock['iot_webhook'] = function(block: any) {
    const msg = cppGenerator.valueToCode(block, 'MESSAGE', CPP_ORDER_ATOMIC) || '""';
    return `IoT::triggerWebhook(${msg});\n`;
};
(cppGenerator as any).forBlock['iot_get_time'] = function() {
    return ['IoT::getWebTime()', CPP_ORDER_ATOMIC];
};

// C++ AI Strategy Additions
(cppGenerator as any).forBlock['ai_optimize_path'] = function() { return `Strategy::optimizePath();\n`; };
(cppGenerator as any).forBlock['ai_store_map'] = function(block: any) {
    const move = block.getFieldValue('MOVE');
    return `Strategy::storeMove("${move}");\n`;
};
(cppGenerator as any).forBlock['ai_remember_intersection'] = function() { return `Strategy::rememberIntersection();\n`; };

// C++ Character Additions
(cppGenerator as any).forBlock['character_glide_to_mouse'] = function() { return `// Character Glide to Mouse\n`; };
(cppGenerator as any).forBlock['character_change_outfit'] = function(block: any) { return `// Character Change Outfit: ${block.getFieldValue('OUTFIT')}\n`; };
(cppGenerator as any).forBlock['character_paint_color'] = function(block: any) { return `// Character Paint Color: ${cppGenerator.valueToCode(block, 'COLOR', CPP_ORDER_ATOMIC) || '0'}\n`; };
(cppGenerator as any).forBlock['character_dissolve_effect'] = function(block: any) { return `// Character Dissolve: ${cppGenerator.valueToCode(block, 'AMOUNT', CPP_ORDER_ATOMIC) || '0'}\n`; };

(cppGenerator as any).forBlock['character_play_sound_until_done'] = function(block: any) { return `// Character Play Sound Until Done: ${block.getFieldValue('SOUND')}\n`; };
(cppGenerator as any).forBlock['character_start_sound'] = function(block: any) { return `// Character Start Sound: ${block.getFieldValue('SOUND')}\n`; };
(cppGenerator as any).forBlock['character_stop_all_sounds'] = function(block: any) { return `// Character Stop All Sounds\n`; };
(cppGenerator as any).forBlock['character_change_sound_effect'] = function(block: any) { return `// Character Change Sound Effect: ${block.getFieldValue('EFFECT')}\n`; };
(cppGenerator as any).forBlock['character_set_sound_effect'] = function(block: any) { return `// Character Set Sound Effect: ${block.getFieldValue('EFFECT')}\n`; };
(cppGenerator as any).forBlock['character_clear_sound_effects'] = function(block: any) { return `// Character Clear Sound Effects\n`; };
(cppGenerator as any).forBlock['character_change_volume'] = function(block: any) { return `// Character Change Volume\n`; };
(cppGenerator as any).forBlock['character_set_volume'] = function(block: any) { return `// Character Set Volume\n`; };
(cppGenerator as any).forBlock['character_volume'] = function(block: any) { return [`// Character Volume`, (cppGenerator as any).ORDER_ATOMIC]; };

(cppGenerator as any).forBlock['character_say_for_secs'] = function (block: any) { return `// Character Say For Secs\n`; };
(cppGenerator as any).forBlock['character_think_for_secs'] = function (block: any) { return `// Character Think For Secs\n`; };
(cppGenerator as any).forBlock['character_think'] = function (block: any) { return `// Character Think\n`; };
(cppGenerator as any).forBlock['character_next_costume'] = function (block: any) { return `// Character Next Costume\n`; };
(cppGenerator as any).forBlock['character_switch_backdrop'] = function (block: any) { return `// Character Switch Backdrop: ${block.getFieldValue('BACKDROP')}\n`; };
(cppGenerator as any).forBlock['character_next_backdrop'] = function (block: any) { return `// Character Next Backdrop\n`; };
(cppGenerator as any).forBlock['character_change_size'] = function (block: any) { return `// Character Change Size\n`; };
(cppGenerator as any).forBlock['character_set_size'] = function (block: any) { return `// Character Set Size\n`; };
(cppGenerator as any).forBlock['character_change_effect'] = function (block: any) { return `// Character Change Effect: ${block.getFieldValue('EFFECT')}\n`; };
(cppGenerator as any).forBlock['character_set_effect'] = function (block: any) { return `// Character Set Effect: ${block.getFieldValue('EFFECT')}\n`; };
(cppGenerator as any).forBlock['character_clear_graphic_effects'] = function (block: any) { return `// Character Clear Graphic Effects\n`; };

(cppGenerator as any).forBlock['character_go_to_random'] = function () { return `// Character GoTo Random\n`; };
(cppGenerator as any).forBlock['character_glide_secs_to_random'] = function (block: any) { return `// Character Glide to Random over ${cppGenerator.valueToCode(block, 'SECS', CPP_ORDER_ATOMIC) || '0'} secs\n`; };
(cppGenerator as any).forBlock['character_glide_secs_to_x_y'] = function (block: any) { return `// Character Glide to X/Y\n`; };
(cppGenerator as any).forBlock['character_point_in_direction'] = function (block: any) { return `// Character Point in Direction\n`; };
(cppGenerator as any).forBlock['character_point_towards_mouse'] = function () { return `// Character Point towards Mouse\n`; };
(cppGenerator as any).forBlock['character_change_x'] = function (block: any) { return `// Character Change X\n`; };
(cppGenerator as any).forBlock['character_set_x'] = function (block: any) { return `// Character Set X\n`; };
(cppGenerator as any).forBlock['character_change_y'] = function (block: any) { return `// Character Change Y\n`; };
(cppGenerator as any).forBlock['character_set_y'] = function (block: any) { return `// Character Set Y\n`; };
(cppGenerator as any).forBlock['character_if_on_edge_bounce'] = function (block: any) { return `// Character If On Edge, Bounce\n`; };
(cppGenerator as any).forBlock['character_set_rotation_style'] = function (block: any) { return `// Character Set Rotation Style: ${block.getFieldValue('STYLE')}\n`; };
(cppGenerator as any).forBlock['character_x_position'] = function (block: any) { return [`0`, CPP_ORDER_ATOMIC]; };
(cppGenerator as any).forBlock['character_y_position'] = function (block: any) { return [`0`, CPP_ORDER_ATOMIC]; };
(cppGenerator as any).forBlock['character_direction'] = function (block: any) { return [`0`, CPP_ORDER_ATOMIC]; };

// ----------------------------------------------------
// JAVASCRIPT SIMULATION GENERATOR
// ----------------------------------------------------

javascriptGenerator.scrub_ = function (block: any, code: string, opt_thisOnly: boolean) {
    if (block.type.startsWith('event_')) return code;
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = opt_thisOnly ? '' : javascriptGenerator.blockToCode(nextBlock);
    return code + nextCode;
};

// JS Kid-Friendly Logic & Loops
javascriptGenerator.forBlock['roboai_start_bluetooth'] = function (block: any) {
    const name = block.getFieldValue('NAME') || 'RoboAI_Car';
    return `console.log("[SIMULATION] Bluetooth Server Started: ${name}");\n`;
};

javascriptGenerator.forBlock['control_repeat_forever'] = function (block: any) {
    let branchCode = javascriptGenerator.statementToCode(block, 'DO');
    return `while (true) {\n${branchCode}  await new Promise(r => setTimeout(r, 10)); // Prevent freeze\n}\n`;
};

javascriptGenerator.forBlock['control_wait_until'] = function (block: any) {
    let condition = javascriptGenerator.valueToCode(block, 'CONDITION', Order.ATOMIC) || 'false';
    return `while (!(${condition})) {\n  await new Promise(r => setTimeout(r, 50));\n}\n`;
};

javascriptGenerator.forBlock['control_if_simple'] = function (block: any) {
    const conditionCode = javascriptGenerator.valueToCode(block, 'CONDITION', Order.ATOMIC) || 'false';
    let branchCode = javascriptGenerator.statementToCode(block, 'DO');
    return `if (${conditionCode}) {\n${branchCode}}\n`;
};

javascriptGenerator.forBlock['control_if_else_simple'] = function (block: any) {
    const conditionCode = javascriptGenerator.valueToCode(block, 'CONDITION', Order.ATOMIC) || 'false';
    let branchCode = javascriptGenerator.statementToCode(block, 'DO');
    let elseCode = javascriptGenerator.statementToCode(block, 'ELSE');
    return `if (${conditionCode}) {\n${branchCode}}\nelse {\n${elseCode}}\n`;
};

// JS Variables Inline
javascriptGenerator.forBlock['variables_set_inline'] = function (block: any) {
    const varName = block.getFieldValue('VAR') || 'unnamed_var';
    const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0';
    return `let ${varName} = ${value};\n`;
};

javascriptGenerator.forBlock['variables_get_inline'] = function (block: any) {
    const varName = block.getFieldValue('VAR') || 'unnamed_var';
    return [varName, Order.ATOMIC];
};

// JS Motor Blocks
javascriptGenerator.forBlock['roboai_motor_drive'] = function (block: any) {
    const motor = block.getFieldValue('MOTOR');
    const dir = block.getFieldValue('DIR');
    let speed = javascriptGenerator.valueToCode(block, 'SPEED', Order.ATOMIC) || '0';
    return `console.log("[SIMULATION] Driving Motor ${motor} at Speed ${speed}% (${dir})");\n`;
};

javascriptGenerator.forBlock['roboai_motor_stop'] = function (block: any) {
    const motor = block.getFieldValue('MOTOR');
    return `console.log("[SIMULATION] Stopping Motor ${motor}");\n`;
};

// JS Output Blocks
javascriptGenerator.forBlock['output_set_builtin_led'] = function (block: any) {
    const state = block.getFieldValue('STATE');
    return `console.log("[SIMULATION] Set Built-in LED: ${state}");\n`;
};
javascriptGenerator.forBlock['output_set_pin'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const state = block.getFieldValue('STATE');
    return `console.log("[SIMULATION] Set Pin ${pin}: ${state}");\n`;
};
javascriptGenerator.forBlock['output_set_pin_analog'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0';
    return `console.log("[SIMULATION] Set Pin ${pin} Analog: " + ${value});\n`;
};
javascriptGenerator.forBlock['output_rotate_servo'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const degrees = javascriptGenerator.valueToCode(block, 'DEGREES', Order.ATOMIC) || '0';
    return `console.log("[SIMULATION] Rotate Servo on Pin ${pin} to " + ${degrees} + " degrees");\n`;
};
javascriptGenerator.forBlock['output_play_speaker'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const tone = javascriptGenerator.valueToCode(block, 'TONE', Order.ATOMIC) || '0';
    const secs = javascriptGenerator.valueToCode(block, 'SECS', Order.ATOMIC) || '0';
    return `console.log("[SIMULATION] Play Speaker on Pin ${pin} Tone: " + ${tone});\nawait new Promise(r => setTimeout(r, (${secs}) * 1000));\n`;
};
javascriptGenerator.forBlock['output_turn_off_speaker'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    return `console.log("[SIMULATION] Turn off Speaker on Pin ${pin}");\n`;
};
javascriptGenerator.forBlock['output_print_serial'] = function (block: any) {
    const text = javascriptGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || '""';
    const newline = block.getFieldValue('NEWLINE');
    if (newline === 'NEWLINE') return `console.log(${text});\n`;
    return `console.log(${text}); // no newline not strictly supported in basic console.log\n`;
};
javascriptGenerator.forBlock['output_set_rgb_led'] = function (block: any) {
    const pinR = block.getFieldValue('PIN_R');
    const pinG = block.getFieldValue('PIN_G');
    const pinB = block.getFieldValue('PIN_B');
    const color = javascriptGenerator.valueToCode(block, 'COLOR', Order.ATOMIC) || "'#000000'";
    return `console.log("[SIMULATION] Set RGB LED (${pinR},${pinG},${pinB}) to color " + ${color});\n`;
};

// JS Sensors (Mock returns)
javascriptGenerator.forBlock['roboai_sensor_ultrasonic'] = function () {
    return ['(Math.floor(Math.random() * 100))', Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_sensor_imu'] = function () {
    return [`(Math.random().toFixed(2))`, Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_sensor_ir'] = function () {
    return ['(Math.random() > 0.5 ? 1 : 0)', Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_sensor_environment'] = function (block: any) {
    const type = block.getFieldValue('MEASUREMENT');
    return type === 'TEMP' ? ['(Math.floor(Math.random() * 15) + 20)', Order.ATOMIC] : ['(Math.floor(Math.random() * 50) + 30)', Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_sensor_light'] = function () {
    return ['(Math.floor(Math.random() * 100))', Order.ATOMIC];
};

// JS AI Vision
javascriptGenerator.forBlock['roboai_ai_vision_classify'] = function (block: any) {
    const obj = block.getFieldValue('OBJECT');
    return [`(() => {
        if (!window.__simVisionLogged) {
            console.log("Simulating OpenCV: Did the camera see a " + "${obj}" + "? (Randomized)");
            window.__simVisionLogged = true;
        }
        return Math.random() > 0.5;
    })()`, Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_ai_wakeword'] = function (block: any) {
    const word = block.getFieldValue('WORD');
    const safeWord = word ? word.replace(/"/g, '\\"') : '';
    return [`(await (typeof simulateWakeWord !== 'undefined' ? simulateWakeWord("${safeWord}") : Promise.resolve(confirm("Fallback: Did you hear: ${safeWord}?"))))`, Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_ai_vision_track_color'] = function (block: any) {
    const color = block.getFieldValue('COLOR');
    return [`(() => {
        if (!window.__simTrackLogged) {
            console.log("Simulating OpenCV: Did the camera track the color " + "${color}" + "? (Randomized)");
            window.__simTrackLogged = true;
        }
        return Math.random() > 0.5;
    })()`, Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_ai_predict_steering'] = function () {
    return ['(Math.floor(Math.random() * 90) - 45)', Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_ai_classify_terrain'] = function (block: any) {
    const terrain = block.getFieldValue('TERRAIN');
    return [`(() => {
        const terrains = ["SMOOTH", "ROUGH", "POTHOLE"];
        const rand = terrains[Math.floor(Math.random() * terrains.length)];
        return rand === "${terrain}";
    })()`, Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_ai_maze_next_move'] = function () {
    return [`(() => {
        const moves = ["FORWARD", "LEFT", "RIGHT"];
        return moves[Math.floor(Math.random() * moves.length)];
    })()`, Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_ai_predict_weather'] = function () {
    return [`(() => {
        const weathers = ["RAIN", "NO RAIN"];
        return weathers[Math.floor(Math.random() * weathers.length)];
    })()`, Order.ATOMIC];
};

javascriptGenerator.forBlock['roboai_ai_detect_edge'] = function () {
    return [`(() => {
        if (!window.__simEdgeLogged) {
            console.log("Simulate Edge Detection (Randomized)");
            window.__simEdgeLogged = true;
        }
        return Math.random() > 0.5;
    })()`, Order.ATOMIC];
};

// JS Print Override
javascriptGenerator.forBlock['text_print'] = function (block: any) {
    const msg = javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    return `console.log(${msg});\n`;
};

javascriptGenerator.forBlock['text_print_inline'] = function (block: any) {
    const msg = javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    return `console.printInline(${msg});\n`;
};

// JS Character Blocks
javascriptGenerator.forBlock['character_move_forward'] = function (block: any) {
    const steps = javascriptGenerator.valueToCode(block, 'STEPS', Order.ATOMIC) || '0';
    return `if (window.characterStageApi) await window.characterStageApi.moveForward(${steps});\n`;
};

javascriptGenerator.forBlock['character_turn'] = function (block: any) {
    const dir = block.getFieldValue('DIR');
    const degrees = javascriptGenerator.valueToCode(block, 'DEGREES', Order.ATOMIC) || '0';
    return `if (window.characterStageApi) await window.characterStageApi.turn('${dir}', ${degrees});\n`;
};

javascriptGenerator.forBlock['character_go_to'] = function (block: any) {
    const x = javascriptGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
    const y = javascriptGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '0';
    return `if (window.characterStageApi) await window.characterStageApi.goTo(${x}, ${y});\n`;
};

javascriptGenerator.forBlock['character_say'] = function (block: any) {
    const text = javascriptGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''";
    return `if (window.characterStageApi) await window.characterStageApi.say(String(${text}));\n`;
};

javascriptGenerator.forBlock['character_show'] = function () {
    return `if (window.characterStageApi) await window.characterStageApi.show();\n`;
};

javascriptGenerator.forBlock['character_hide'] = function () {
    return `if (window.characterStageApi) await window.characterStageApi.hide();\n`;
};

javascriptGenerator.forBlock['character_play_sound'] = function (block: any) {
    const sound = block.getFieldValue('SOUND');
    return `if (window.characterStageApi) await window.characterStageApi.playSound('${sound}');\n`;
};

// C++ Text String
(cppGenerator as any).forBlock['text'] = function (block: any) {
    const textValue = block.getFieldValue('TEXT');
    const escaped = textValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return [`"${escaped}"`, CPP_ORDER_ATOMIC];
};

// C++ Print Override
(cppGenerator as any).forBlock['text_print'] = function (block: any) {
    const msg = cppGenerator.valueToCode(block, 'TEXT', CPP_ORDER_ATOMIC) || '""';
    return `Serial.println(${msg});\n`;
};

(cppGenerator as any).forBlock['text_print_inline'] = function (block: any) {
    const msg = cppGenerator.valueToCode(block, 'TEXT', CPP_ORDER_ATOMIC) || '""';
    return `Serial.print(${msg});\n`;
};

// JS Sparks / Events
javascriptGenerator.forBlock['event_when_flag_clicked'] = function(block: any) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = nextBlock ? javascriptGenerator.blockToCode(nextBlock) : '';
    return `// EVENT: On Green Flag\n${nextCode}\n`;
};
javascriptGenerator.forBlock['event_when_sprite_clicked'] = function(block: any) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = nextBlock ? javascriptGenerator.blockToCode(nextBlock) : '';
    return `if (window.characterStageApi) { window.characterStageApi.onClick(async () => { ${nextCode} }); }\n`;
};
javascriptGenerator.forBlock['event_when_key_pressed'] = function(block: any) {
    const key = block.getFieldValue('KEY');
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = nextBlock ? javascriptGenerator.blockToCode(nextBlock) : '';
    let jsKey = 'Space';
    if(key === 'UP') jsKey = 'ArrowUp';
    if(key === 'DOWN') jsKey = 'ArrowDown';
    if(key === 'ANY') jsKey = 'Any';
    return `if (typeof registerEvent !== 'undefined') { registerEvent('keydown', async (e) => { if ('${key}' === 'ANY' || e.code === '${jsKey}') { ${nextCode} } }); } else { window.addEventListener('keydown', async (e) => { if ('${key}' === 'ANY' || e.code === '${jsKey}') { ${nextCode} } }); }\n`;
};
javascriptGenerator.forBlock['event_when_loud_noise'] = function(block: any) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = nextBlock ? javascriptGenerator.blockToCode(nextBlock) : '';
    return `if (typeof registerTimeout !== 'undefined') { registerTimeout(async () => { console.log("[SIMULATION EVENT] Loud Noise detected by Mic!"); \n${nextCode}\n }, 3000); } else { setTimeout(async () => { console.log("[SIMULATION EVENT] Loud Noise detected by Mic!"); \n${nextCode}\n }, 3000); }\n`;
};

// JS Brain Games (Logic/Math)
javascriptGenerator.forBlock['logic_surprise_number'] = function(block: any) {
    const a = block.getFieldValue('FROM') || '1';
    const b = block.getFieldValue('TO') || '10';
    return [`(Math.floor(Math.random() * (${b} - ${a} + 1)) + parseInt(${a}))`, Order.ATOMIC];
};
javascriptGenerator.forBlock['logic_wait_sec'] = function(block: any) {
    const secs = javascriptGenerator.valueToCode(block, 'SECONDS', Order.ATOMIC) || '0';
    return `await new Promise(r => setTimeout(r, ${secs} * 1000));\n`;
};

// JS Brain Link
javascriptGenerator.forBlock['roboai_brain_connect'] = function() { return `console.log("[SYS] Connecting via Web Serial...");\n`; };
javascriptGenerator.forBlock['roboai_brain_transfer'] = function() { return `console.log("[SYS] Uploading Brain to Hardware...");\n`; };
javascriptGenerator.forBlock['roboai_brain_sync'] = function() { return `console.log("[SYS] Syncing Live Control Mode...");\n`; };

// JS HW Motor Additions
javascriptGenerator.forBlock['roboai_motor_advance_power'] = function(block: any) {
    const power = javascriptGenerator.valueToCode(block, 'POWER', Order.ATOMIC) || '0';
    return `console.log("[SIMULATION] Advance Motors at " + ${power} + "% power");\n`;
};
javascriptGenerator.forBlock['roboai_motor_steer_angle'] = function(block: any) {
    const angle = javascriptGenerator.valueToCode(block, 'ANGLE', Order.ATOMIC) || '0';
    return `console.log("[SIMULATION] Steer Robot by " + ${angle} + " degrees");\n`;
};
javascriptGenerator.forBlock['roboai_motor_rotate_4wd'] = function(block: any) {
    const dir = block.getFieldValue('DIR');
    return `console.log("[SIMULATION] Rotate 4WD direction: ${dir}");\n`;
};
javascriptGenerator.forBlock['roboai_motor_dance'] = function(block: any) {
    const pattern = block.getFieldValue('PATTERN');
    return `console.log("[SIMULATION] Dance Pattern: ${pattern}");\n`;
};

// JS HW Audio AI Additions
javascriptGenerator.forBlock['roboai_ai_wait_wakeword'] = function(block: any) {
    const word = block.getFieldValue('WORD');
    const safeWord = word ? word.replace(/"/g, '\\"') : '';
    return `console.log("[SIMULATION] Waiting for Wake-word: ${safeWord}");\nif (typeof simulateWakeWord !== 'undefined') {\n  let _heard = false;\n  while(!_heard) { _heard = await simulateWakeWord("${safeWord}");\n  if(!_heard) await new Promise(r => setTimeout(r, 1000)); }\n} else {\n  await new Promise(r => setTimeout(r, 2000));\n}\n`;
};
javascriptGenerator.forBlock['roboai_ai_listen_command'] = function() {
    return [`(await (typeof simulateListenCommand !== 'undefined' ? simulateListenCommand() : Promise.resolve(prompt("Simulate Audio AI Command:", "turn left") || "")))`, Order.ATOMIC];
};
javascriptGenerator.forBlock['roboai_ai_sound_level'] = function() {
    return ['(Math.floor(Math.random() * 100))', Order.ATOMIC];
};
javascriptGenerator.forBlock['roboai_ai_speak'] = function(block: any) {
    const text = javascriptGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || '""';
    return `console.log("[SIMULATION Speaker]: " + ${text});\n`;
};

// JS IoT Additions
javascriptGenerator.forBlock['iot_log_sheets'] = function(block: any) {
    const data = javascriptGenerator.valueToCode(block, 'DATA', Order.ATOMIC) || '""';
    return `console.log("[SIMULATION] Logging to Google Sheets: " + ${data});\n`;
};
javascriptGenerator.forBlock['iot_webhook'] = function(block: any) {
    const msg = javascriptGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '""';
    return `console.log("[SIMULATION] Triggering Webhook: " + ${msg});\n`;
};
javascriptGenerator.forBlock['iot_get_time'] = function() {
    return [`(new Date().toLocaleTimeString())`, Order.ATOMIC];
};

// JS AI Strategy Additions
javascriptGenerator.forBlock['ai_optimize_path'] = function() { return `console.log("[SIMULATION] Optimizing Shortest Path...");\n`; };
javascriptGenerator.forBlock['ai_store_map'] = function(block: any) {
    const move = block.getFieldValue('MOVE');
    return `console.log("[SIMULATION] Stored Maze Move: ${move}");\n`;
};
javascriptGenerator.forBlock['ai_remember_intersection'] = function() { return `console.log("[SIMULATION] Remembered Intersection.");\n`; };

// JS Character Additions
javascriptGenerator.forBlock['character_glide_to_mouse'] = function() { return `if (window.characterStageApi) await window.characterStageApi.glideToMouse();\n`; };
javascriptGenerator.forBlock['character_change_outfit'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.changeOutfit('${block.getFieldValue('OUTFIT')}');\n`; };
javascriptGenerator.forBlock['character_paint_color'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.paintColor(${javascriptGenerator.valueToCode(block, 'COLOR', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_dissolve_effect'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.dissolve(${javascriptGenerator.valueToCode(block, 'AMOUNT', Order.ATOMIC) || '0'});\n`; };

javascriptGenerator.forBlock['character_play_sound_until_done'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.playSoundUntilDone('${block.getFieldValue('SOUND')}');\n`; };
javascriptGenerator.forBlock['character_start_sound'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.startSound('${block.getFieldValue('SOUND')}');\n`; };
javascriptGenerator.forBlock['character_stop_all_sounds'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.stopAllSounds();\n`; };
javascriptGenerator.forBlock['character_change_sound_effect'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.changeSoundEffectBy('${block.getFieldValue('EFFECT')}', ${javascriptGenerator.valueToCode(block, 'CHANGE', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_set_sound_effect'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.setSoundEffectTo('${block.getFieldValue('EFFECT')}', ${javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_clear_sound_effects'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.clearSoundEffects();\n`; };
javascriptGenerator.forBlock['character_change_volume'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.changeVolumeBy(${javascriptGenerator.valueToCode(block, 'CHANGE', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_set_volume'] = function(block: any) { return `if (window.characterStageApi) await window.characterStageApi.setVolumeTo(${javascriptGenerator.valueToCode(block, 'VOLUME', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_volume'] = function(block: any) { return [`(window.characterStageApi ? window.characterStageApi.getVolume() : 100)`, Order.ATOMIC]; };

javascriptGenerator.forBlock['character_say_for_secs'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.sayForSecs(${javascriptGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"}, ${javascriptGenerator.valueToCode(block, 'SECS', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_think_for_secs'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.thinkForSecs(${javascriptGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"}, ${javascriptGenerator.valueToCode(block, 'SECS', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_think'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.think(${javascriptGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"});\n`; };
javascriptGenerator.forBlock['character_next_costume'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.nextCostume();\n`; };
javascriptGenerator.forBlock['character_switch_backdrop'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.switchBackdrop('${block.getFieldValue('BACKDROP')}');\n`; };
javascriptGenerator.forBlock['character_next_backdrop'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.nextBackdrop();\n`; };
javascriptGenerator.forBlock['character_change_size'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.changeSizeBy(${javascriptGenerator.valueToCode(block, 'CHANGE', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_set_size'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.setSizeTo(${javascriptGenerator.valueToCode(block, 'SIZE', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_change_effect'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.changeEffectBy('${block.getFieldValue('EFFECT')}', ${javascriptGenerator.valueToCode(block, 'CHANGE', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_set_effect'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.setEffectTo('${block.getFieldValue('EFFECT')}', ${javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_clear_graphic_effects'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.clearGraphicEffects();\n`; };

javascriptGenerator.forBlock['character_go_to_random'] = function () { return `if (window.characterStageApi) await window.characterStageApi.goToRandom();\n`; };
javascriptGenerator.forBlock['character_glide_secs_to_random'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.glideToRandom(${javascriptGenerator.valueToCode(block, 'SECS', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_glide_secs_to_x_y'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.glideToXY(${javascriptGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0'}, ${javascriptGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '0'}, ${javascriptGenerator.valueToCode(block, 'SECS', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_point_in_direction'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.pointInDirection(${javascriptGenerator.valueToCode(block, 'DEGREES', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_point_towards_mouse'] = function () { return `if (window.characterStageApi) await window.characterStageApi.pointTowardsMouse();\n`; };
javascriptGenerator.forBlock['character_change_x'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.changeX(${javascriptGenerator.valueToCode(block, 'DX', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_set_x'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.setX(${javascriptGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_change_y'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.changeY(${javascriptGenerator.valueToCode(block, 'DY', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_set_y'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.setY(${javascriptGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '0'});\n`; };
javascriptGenerator.forBlock['character_if_on_edge_bounce'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.ifOnEdgeBounce();\n`; };
javascriptGenerator.forBlock['character_set_rotation_style'] = function (block: any) { return `if (window.characterStageApi) await window.characterStageApi.setRotStyle('${block.getFieldValue('STYLE')}');\n`; };
javascriptGenerator.forBlock['character_x_position'] = function (block: any) { return [`(window.characterStageApi ? window.characterStageApi.getX() : 0)`, Order.ATOMIC]; };
javascriptGenerator.forBlock['character_y_position'] = function (block: any) { return [`(window.characterStageApi ? window.characterStageApi.getY() : 0)`, Order.ATOMIC]; };
javascriptGenerator.forBlock['character_direction'] = function (block: any) { return [`(window.characterStageApi ? window.characterStageApi.getDirection() : 0)`, Order.ATOMIC]; };

// --- Colour Blocks ---
(cppGenerator as any).forBlock['colour_picker'] = function (block: any) {
    const colour = block.getFieldValue('COLOUR');
    return [`"${colour}"`, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['colour_random'] = function () {
    const code = `String("#") + String(random(256), HEX) + String(random(256), HEX) + String(random(256), HEX)`;
    return [code, CPP_ORDER_ATOMIC];
};

(cppGenerator as any).forBlock['colour_rgb'] = function (block: any) {
    const r = cppGenerator.valueToCode(block, 'RED', CPP_ORDER_NONE) || 0;
    const g = cppGenerator.valueToCode(block, 'GREEN', CPP_ORDER_NONE) || 0;
    const b = cppGenerator.valueToCode(block, 'BLUE', CPP_ORDER_NONE) || 0;
    // C++ hack to format rgb as hex string
    (cppGenerator as any).definitions_['func_rgbToHex'] = `String rgbToHex(int r, int g, int b) {\n  char hex[8];\n  sprintf(hex, "#%02x%02x%02x", r, g, b);\n  return String(hex);\n}`;
    const code = `rgbToHex(${r}, ${g}, ${b})`;
    return [code, CPP_ORDER_ATOMIC];
};

javascriptGenerator.forBlock['colour_picker'] = function (block: any) {
    const colour = block.getFieldValue('COLOUR');
    return [`'${colour}'`, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['colour_random'] = function () {
    const code = `'#' + Math.floor(Math.random()*16777215).toString(16)`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['colour_rgb'] = function (block: any) {
    const r = javascriptGenerator.valueToCode(block, 'RED', javascriptGenerator.ORDER_NONE) || 0;
    const g = javascriptGenerator.valueToCode(block, 'GREEN', javascriptGenerator.ORDER_NONE) || 0;
    const b = javascriptGenerator.valueToCode(block, 'BLUE', javascriptGenerator.ORDER_NONE) || 0;
    const code = `((r,g,b) => '#' + ((1<<24) + (Math.round(r)<<16) + (Math.round(g)<<8) + Math.round(b)).toString(16).slice(1))(${r},${g},${b})`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

export { javascriptGenerator };
cppGenerator.forBlock['output_configure_lcd'] = function (block: any) {
    cppGenerator.includes_['Wire'] = '#include <Wire.h>';
    cppGenerator.includes_['LiquidCrystal_I2C'] = '#include <LiquidCrystal_I2C.h>';
    cppGenerator.definitions_['lcd'] = 'LiquidCrystal_I2C lcd(0x27, 16, 2);';
    cppGenerator.setups_['lcd_init'] = 'lcd.init();\n  lcd.backlight();';
    return '';
};

cppGenerator.forBlock['output_print_lcd'] = function (block: any) {
    const text = cppGenerator.valueToCode(block, 'TEXT', Order.NONE) || '""';
    return `lcd.print(${text});\n`;
};

cppGenerator.forBlock['output_set_position_lcd'] = function (block: any) {
    const col = cppGenerator.valueToCode(block, 'COL', Order.NONE) || '0';
    const row = cppGenerator.valueToCode(block, 'ROW', Order.NONE) || '0';
    return `lcd.setCursor(${col}, ${row});\n`;
};

cppGenerator.forBlock['output_clear_lcd'] = function (block: any) {
    return 'lcd.clear();\n';
};

cppGenerator.forBlock['output_configure_led_display'] = function (block: any) {
    cppGenerator.includes_['TM1637Display'] = '#include <TM1637Display.h>';
    cppGenerator.definitions_['tm1637'] = 'TM1637Display display(2, 3); // CLK, DIO';
    cppGenerator.setups_['tm1637_brightness'] = 'display.setBrightness(0x0f);';
    return '';
};

cppGenerator.forBlock['output_print_led_display'] = function (block: any) {
    const value = cppGenerator.valueToCode(block, 'VALUE', Order.NONE) || '0';
    return `display.showNumberDec(${value});\n`;
};

cppGenerator.forBlock['output_clear_led_display'] = function (block: any) {
    return 'display.clear();\n';
};

javascriptGenerator.forBlock['output_configure_lcd'] = function (block: any) { return `console.log("LCD Configured");\n`; };
javascriptGenerator.forBlock['output_print_lcd'] = function (block: any) { return `console.log("LCD Print: " + (${javascriptGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"}));\n`; };
javascriptGenerator.forBlock['output_set_position_lcd'] = function (block: any) { return `console.log("LCD Set Position: Col " + (${javascriptGenerator.valueToCode(block, 'COL', Order.ATOMIC) || '0'}) + " Row " + (${javascriptGenerator.valueToCode(block, 'ROW', Order.ATOMIC) || '0'}));\n`; };
javascriptGenerator.forBlock['output_clear_lcd'] = function (block: any) { return `console.log("LCD Cleared");\n`; };
javascriptGenerator.forBlock['output_configure_led_display'] = function (block: any) { return `console.log("LED Matrix Configured");\n`; };
javascriptGenerator.forBlock['output_print_led_display'] = function (block: any) { return `console.log("LED Matrix Print: " + (${javascriptGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || "''"}));\n`; };
javascriptGenerator.forBlock['output_clear_led_display'] = function (block: any) { return `console.log("LED Matrix Cleared");\n`; };

cppGenerator.forBlock['input_read_digital_pin'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    cppGenerator.setups_['pinMode_' + pin] = `pinMode(${pin}, INPUT);`;
    const code = `digitalRead(${pin})`;
    return [code, Order.ATOMIC];
};

cppGenerator.forBlock['input_read_analog_pin'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const code = `analogRead(${pin})`;
    return [code, Order.ATOMIC];
};

cppGenerator.forBlock['input_read_servo_degrees'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    cppGenerator.includes_['Servo'] = '#include <Servo.h>';
    cppGenerator.definitions_['servo_' + pin] = `Servo servo_${pin};`;
    cppGenerator.setups_['servo_attach_' + pin] = `servo_${pin}.attach(${pin});`;
    const code = `servo_${pin}.read()`;
    return [code, Order.ATOMIC];
};

cppGenerator.forBlock['input_serial_available'] = function (block: any) {
    cppGenerator.setups_['serial_begin'] = 'Serial.begin(9600);';
    const code = 'Serial.available()';
    return [code, Order.ATOMIC];
};

cppGenerator.forBlock['input_read_serial'] = function (block: any) {
    cppGenerator.setups_['serial_begin'] = 'Serial.begin(9600);';
    const code = 'Serial.read()';
    return [code, Order.ATOMIC];
};

cppGenerator.forBlock['input_read_ultrasonic'] = function (block: any) {
    const trig = block.getFieldValue('TRIG');
    const echo = block.getFieldValue('ECHO');
    const unit = block.getFieldValue('UNIT');
    
    cppGenerator.definitions_['readUltrasonic'] = `
float readUltrasonic(int trigPin, int echoPin, String unit) {
  pinMode(trigPin, OUTPUT);
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  pinMode(echoPin, INPUT);
  long duration = pulseIn(echoPin, HIGH);
  float distance = duration * 0.034 / 2;
  if (unit == "inch") return distance / 2.54;
  return distance;
}
`;
    const code = `readUltrasonic(${trig}, ${echo}, "${unit}")`;
    return [code, Order.ATOMIC];
};

cppGenerator.forBlock['input_read_temperature'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const unit = block.getFieldValue('UNIT');
    
    // Using a standard TMP36 or similar analog temp sensor logic: (analogRead * 5.0 / 1023.0 - 0.5) * 100
    cppGenerator.definitions_['readTemp'] = `
float readTemperature(int pin, String unit) {
  int val = analogRead(pin);
  float voltage = val * 5.0 / 1023.0;
  float tempC = (voltage - 0.5) * 100.0;
  if (unit == "F") return tempC * 1.8 + 32.0;
  return tempC;
}
`;
    const code = `readTemperature(${pin}, "${unit}")`;
    return [code, Order.ATOMIC];
};

cppGenerator.forBlock['input_read_ntc_temperature'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    const unit = block.getFieldValue('UNIT');
    
    // NTC thermistor logic (10k thermistor, 10k pulldown, Beta 3950)
    cppGenerator.definitions_['readNTCTemp'] = `
float readNTCTemperature(int pin, String unit) {
  int analogValue = analogRead(pin);
  if (analogValue == 0) return -273.15; // Prevent div by zero
  float celsius = 1.0 / (log(1.0 / (1023.0 / analogValue - 1.0)) / 3950.0 + 1.0 / 298.15) - 273.15;
  if (unit == "F") return celsius * 1.8 + 32.0;
  return celsius;
}
`;
    const code = `readNTCTemperature(${pin}, "${unit}")`;
    return [code, Order.ATOMIC];
};

cppGenerator.forBlock['input_read_infrared'] = function (block: any) {
    const pin = block.getFieldValue('PIN');
    cppGenerator.setups_['pinMode_' + pin] = `pinMode(${pin}, INPUT);`;
    const code = `digitalRead(${pin})`;
    return [code, Order.ATOMIC];
};

// JavaScript generators for input blocks (placeholder)
javascriptGenerator.forBlock['input_read_digital_pin'] = function () { return ['0', Order.ATOMIC]; };
javascriptGenerator.forBlock['input_read_analog_pin'] = function () { return ['0', Order.ATOMIC]; };
javascriptGenerator.forBlock['input_read_servo_degrees'] = function () { return ['0', Order.ATOMIC]; };
javascriptGenerator.forBlock['input_serial_available'] = function () { return ['0', Order.ATOMIC]; };
javascriptGenerator.forBlock['input_read_serial'] = function () { return ['0', Order.ATOMIC]; };
javascriptGenerator.forBlock['input_read_ultrasonic'] = function () { return ['0', Order.ATOMIC]; };
javascriptGenerator.forBlock['input_read_temperature'] = function () { return ['0', Order.ATOMIC]; };
javascriptGenerator.forBlock['input_read_infrared'] = function () { return ['0', Order.ATOMIC]; };

cppGenerator.forBlock['control_on_start'] = function (block: any) {
    const doCode = cppGenerator.statementToCode(block, 'DO');
    // We add this to setups_ so it runs in void setup()
    // Use a unique key based on block ID so multiple blocks don't overwrite
    if (doCode) {
        cppGenerator.setups_['on_start_' + block.id] = doCode;
    }
    return ''; // Returns nothing to the main loop()
};

cppGenerator.forBlock['control_forever'] = function (block: any) {
    // This is essentially just the code that goes into loop()
    const doCode = cppGenerator.statementToCode(block, 'DO');
    return doCode;
};

cppGenerator.forBlock['control_wait'] = function (block: any) {
    const time = block.getFieldValue('TIME');
    const unit = block.getFieldValue('UNIT');
    if (unit === 'secs') {
        return `delay(${time * 1000});\n`;
    } else {
        return `delay(${time});\n`;
    }
};

cppGenerator.forBlock['control_repeat_times'] = function (block: any) {
    const times = block.getFieldValue('TIMES');
    const doCode = cppGenerator.statementToCode(block, 'DO');
    // Using a simple loop
    return `for (int i = 0; i < ${times}; i++) {\n${doCode}}\n`;
};

cppGenerator.forBlock['control_repeat_while'] = function (block: any) {
    const mode = block.getFieldValue('MODE');
    const condCode = cppGenerator.valueToCode(block, 'COND', Order.NONE) || 'false';
    const doCode = cppGenerator.statementToCode(block, 'DO');
    if (mode === 'while') {
        return `while (${condCode}) {\n${doCode}}\n`;
    } else {
        return `while (!(${condCode})) {\n${doCode}}\n`;
    }
};

cppGenerator.forBlock['control_if'] = function (block: any) {
    const condCode = cppGenerator.valueToCode(block, 'COND', Order.NONE) || 'false';
    const doCode = cppGenerator.statementToCode(block, 'DO');
    return `if (${condCode}) {\n${doCode}}\n`;
};

cppGenerator.forBlock['control_if_else'] = function (block: any) {
    const condCode = cppGenerator.valueToCode(block, 'COND', Order.NONE) || 'false';
    const doCode = cppGenerator.statementToCode(block, 'DO');
    const elseCode = cppGenerator.statementToCode(block, 'ELSE');
    return `if (${condCode}) {\n${doCode}} else {\n${elseCode}}\n`;
};

cppGenerator.forBlock['control_count'] = function (block: any) {
    const dir = block.getFieldValue('DIR');
    const by = block.getFieldValue('BY');
    const variable = block.getField('VAR')?.getText() || 'i';
    const from = cppGenerator.valueToCode(block, 'FROM', Order.NONE) || '1';
    const to = cppGenerator.valueToCode(block, 'TO', Order.NONE) || '10';
    const doCode = cppGenerator.statementToCode(block, 'DO');
    
    if (dir === 'up') {
        return `for (int ${variable} = ${from}; ${variable} <= ${to}; ${variable} += ${by}) {\n${doCode}}\n`;
    } else {
        return `for (int ${variable} = ${from}; ${variable} >= ${to}; ${variable} -= ${by}) {\n${doCode}}\n`;
    }
};

// JavaScript generators for control blocks
javascriptGenerator.forBlock['control_on_start'] = function (block: any) { return javascriptGenerator.statementToCode(block, 'DO'); };
javascriptGenerator.forBlock['control_forever'] = function (block: any) { 
  return `while (true) {\n${javascriptGenerator.statementToCode(block, 'DO')}\n  await new Promise(r => setTimeout(r, 20));\n}\n`; 
};
javascriptGenerator.forBlock['control_wait'] = function (block: any) { 
  return `await new Promise(r => setTimeout(r, (${javascriptGenerator.valueToCode(block, 'TIME', Order.ATOMIC) || '0'}) * 1000));\n`; 
};
javascriptGenerator.forBlock['control_repeat_times'] = function (block: any) { 
  return `for (let i = 0; i < (${javascriptGenerator.valueToCode(block, 'TIMES', Order.ATOMIC) || '0'}); i++) {\n${javascriptGenerator.statementToCode(block, 'DO')}\n  await new Promise(r => setTimeout(r, 20));\n}\n`; 
};
javascriptGenerator.forBlock['control_repeat_while'] = function (block: any) { 
  return `while (${javascriptGenerator.valueToCode(block, 'CONDITION', Order.NONE) || 'false'}) {\n${javascriptGenerator.statementToCode(block, 'DO')}\n  await new Promise(r => setTimeout(r, 20));\n}\n`; 
};
javascriptGenerator.forBlock['control_count'] = function (block: any) { 
  const byCode = javascriptGenerator.valueToCode(block, 'BY', Order.ATOMIC) || '1';
  return `for (let ${block.getFieldValue('VAR')} = ${javascriptGenerator.valueToCode(block, 'FROM', Order.ATOMIC) || '1'}; ${block.getFieldValue('DIR') === 'up' ? '<=' : '>='} ${javascriptGenerator.valueToCode(block, 'TO', Order.ATOMIC) || '10'}; ${block.getFieldValue('VAR')} += ${block.getFieldValue('DIR') === 'up' ? byCode : '-' + byCode}) {\n${javascriptGenerator.statementToCode(block, 'DO')}\n  await new Promise(r => setTimeout(r, 20));\n}\n`; 
};
javascriptGenerator.forBlock['control_if'] = function (block: any) { 
  return `if (${javascriptGenerator.valueToCode(block, 'CONDITION', Order.NONE) || 'false'}) {\n${javascriptGenerator.statementToCode(block, 'DO')}\n}\n`; 
};
javascriptGenerator.forBlock['control_if_else'] = function (block: any) { 
  return `if (${javascriptGenerator.valueToCode(block, 'CONDITION', Order.NONE) || 'false'}) {\n${javascriptGenerator.statementToCode(block, 'DO')}\n} else {\n${javascriptGenerator.statementToCode(block, 'ELSE')}\n}\n`; 
};

cppGenerator.forBlock['notation_title'] = function (block: any) {
    const comment = block.getFieldValue('COMMENT');
    return `/* ${comment} */\n`;
};

cppGenerator.forBlock['notation_comment'] = function (block: any) {
    const comment = block.getFieldValue('COMMENT');
    return `// ${comment}\n`;
};

javascriptGenerator.forBlock['notation_title'] = function (block: any) { return `// ${block.getFieldValue('COMMENT')}\n`; };
javascriptGenerator.forBlock['notation_comment'] = function (block: any) { return `// ${block.getFieldValue('COMMENT')}\n`; };

cppGenerator.forBlock['math_arithmetic_custom'] = function (block: any) {
    const a = cppGenerator.valueToCode(block, 'A', Order.NONE) || '0';
    const b = cppGenerator.valueToCode(block, 'B', Order.NONE) || '0';
    const opMap: Record<string, string> = { 'ADD': '+', 'MINUS': '-', 'MULTIPLY': '*', 'DIVIDE': '/', 'MODULO': '%' };
    const op = opMap[block.getFieldValue('OP')] || '+';
    return [`(${a} ${op} ${b})`, Order.ATOMIC];
};

cppGenerator.forBlock['math_compare_custom'] = function (block: any) {
    const a = cppGenerator.valueToCode(block, 'A', Order.NONE) || '0';
    const b = cppGenerator.valueToCode(block, 'B', Order.NONE) || '0';
    const opMap: Record<string, string> = { 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=', 'EQ': '==', 'NEQ': '!=' };
    const op = opMap[block.getFieldValue('OP')] || '==';
    return [`(${a} ${op} ${b})`, Order.ATOMIC];
};

cppGenerator.forBlock['math_random_custom'] = function (block: any) {
    const min = cppGenerator.valueToCode(block, 'MIN', Order.NONE) || '1';
    const max = cppGenerator.valueToCode(block, 'MAX', Order.NONE) || '10';
    return [`random(${min}, (${max}) + 1)`, Order.ATOMIC];
};

cppGenerator.forBlock['math_logic_custom'] = function (block: any) {
    const a = cppGenerator.valueToCode(block, 'A', Order.NONE) || 'false';
    const b = cppGenerator.valueToCode(block, 'B', Order.NONE) || 'false';
    const opMap: Record<string, string> = { 'AND': '&&', 'OR': '||' };
    const op = opMap[block.getFieldValue('OP')] || '&&';
    return [`(${a} ${op} ${b})`, Order.ATOMIC];
};

cppGenerator.forBlock['math_not_custom'] = function (block: any) {
    const bool = cppGenerator.valueToCode(block, 'BOOL', Order.NONE) || 'false';
    return [`!(${bool})`, Order.ATOMIC];
};

cppGenerator.forBlock['math_function_custom'] = function (block: any) {
    const num = cppGenerator.valueToCode(block, 'NUM', Order.NONE) || '0';
    const opMap: Record<string, string> = { 'ABS': 'abs', 'SQRT': 'sqrt', 'SIN': 'sin', 'COS': 'cos', 'TAN': 'tan' };
    const op = opMap[block.getFieldValue('OP')] || 'abs';
    return [`${op}(${num})`, Order.ATOMIC];
};

cppGenerator.forBlock['math_map_custom'] = function (block: any) {
    const val = cppGenerator.valueToCode(block, 'VAL', Order.NONE) || '0';
    const toMin = cppGenerator.valueToCode(block, 'TO_MIN', Order.NONE) || '0';
    const toMax = cppGenerator.valueToCode(block, 'TO_MAX', Order.NONE) || '180';
    return [`map(${val}, 0, 1023, ${toMin}, ${toMax})`, CPP_ORDER_ATOMIC];
};

cppGenerator.forBlock['math_constrain_custom'] = function (block: any) {
    const val = cppGenerator.valueToCode(block, 'VAL', Order.NONE) || '0';
    const min = cppGenerator.valueToCode(block, 'MIN', Order.NONE) || '0';
    const max = cppGenerator.valueToCode(block, 'MAX', Order.NONE) || '255';
    return [`constrain(${val}, ${min}, ${max})`, Order.ATOMIC];
};

cppGenerator.forBlock['math_state_custom'] = function (block: any) {
    const state = block.getFieldValue('STATE');
    return [state, Order.ATOMIC];
};

// JS generator implementations
javascriptGenerator.forBlock['math_arithmetic_custom'] = function (block: any) { 
    const a = javascriptGenerator.valueToCode(block, 'A', Order.NONE) || '0';
    const b = javascriptGenerator.valueToCode(block, 'B', Order.NONE) || '0';
    const op = { 'ADD': '+', 'MINUS': '-', 'MULTIPLY': '*', 'DIVIDE': '/', 'MODULO': '%' }[block.getFieldValue('OP')] || '+';
    return [`(${a} ${op} ${b})`, Order.ATOMIC]; 
};
javascriptGenerator.forBlock['math_compare_custom'] = function (block: any) { 
    const a = javascriptGenerator.valueToCode(block, 'A', Order.NONE) || '0';
    const b = javascriptGenerator.valueToCode(block, 'B', Order.NONE) || '0';
    const op = { 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=', 'EQ': '===', 'NEQ': '!==' }[block.getFieldValue('OP')] || '===';
    return [`(${a} ${op} ${b})`, Order.ATOMIC]; 
};
javascriptGenerator.forBlock['math_random_custom'] = function (block: any) { 
    const min = javascriptGenerator.valueToCode(block, 'MIN', Order.NONE) || '1';
    const max = javascriptGenerator.valueToCode(block, 'MAX', Order.NONE) || '10';
    return [`(Math.floor(Math.random() * ((${max}) - (${min}) + 1)) + (${min}))`, Order.ATOMIC]; 
};
javascriptGenerator.forBlock['math_logic_custom'] = function (block: any) { 
    const a = javascriptGenerator.valueToCode(block, 'A', Order.NONE) || 'false';
    const b = javascriptGenerator.valueToCode(block, 'B', Order.NONE) || 'false';
    const op = { 'AND': '&&', 'OR': '||' }[block.getFieldValue('OP')] || '&&';
    return [`(${a} ${op} ${b})`, Order.ATOMIC]; 
};
javascriptGenerator.forBlock['math_not_custom'] = function (block: any) { 
    return [`!(${javascriptGenerator.valueToCode(block, 'BOOL', Order.NONE) || 'false'})`, Order.ATOMIC]; 
};
javascriptGenerator.forBlock['math_function_custom'] = function (block: any) { 
    const num = javascriptGenerator.valueToCode(block, 'NUM', Order.NONE) || '0';
    const opMap: Record<string, string> = { 'ABS': 'Math.abs', 'SQRT': 'Math.sqrt', 'SIN': 'Math.sin', 'COS': 'Math.cos', 'TAN': 'Math.tan' };
    const op = opMap[block.getFieldValue('OP')] || 'Math.abs';
    return [`${op}(${num})`, Order.ATOMIC]; 
};
javascriptGenerator.forBlock['math_map_custom'] = function (block: any) { 
    const val = javascriptGenerator.valueToCode(block, 'VAL', Order.NONE) || '0';
    const toMin = javascriptGenerator.valueToCode(block, 'TO_MIN', Order.NONE) || '0';
    const toMax = javascriptGenerator.valueToCode(block, 'TO_MAX', Order.NONE) || '180';
    return [`(((${val}) - 0) * ((${toMax}) - (${toMin})) / (1023 - 0) + (${toMin}))`, Order.ATOMIC]; 
};
javascriptGenerator.forBlock['math_constrain_custom'] = function (block: any) { 
    const val = javascriptGenerator.valueToCode(block, 'VAL', Order.NONE) || '0';
    const min = javascriptGenerator.valueToCode(block, 'MIN', Order.NONE) || '0';
    const max = javascriptGenerator.valueToCode(block, 'MAX', Order.NONE) || '255';
    return [`Math.min(Math.max(${val}, ${min}), ${max})`, Order.ATOMIC]; 
};
javascriptGenerator.forBlock['math_state_custom'] = function (block: any) { 
    return [block.getFieldValue('STATE') === 'HIGH' ? '1' : '0', Order.ATOMIC]; 
};
