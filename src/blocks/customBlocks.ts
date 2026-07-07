import * as Blockly from 'blockly/core';

// --- Sparks (Event) Blocks ---
Blockly.Blocks['event_when_flag_clicked'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🏁 When 🟢 Flag clicked");
        this.setNextStatement(true, null);
        this.setColour('#EAB308'); // Yellow for Events
        this.setTooltip("Start executing when the green flag is clicked.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['event_when_sprite_clicked'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("👆 When I am clicked");
        this.setNextStatement(true, null);
        this.setColour('#EAB308'); 
        this.setTooltip("Start executing when this character is clicked.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['event_when_key_pressed'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("⌨️ When")
            .appendField(new Blockly.FieldDropdown([["Space", "SPACE"], ["Up Arrow", "UP"], ["Down Arrow", "DOWN"], ["Any", "ANY"]]), "KEY")
            .appendField("key pressed");
        this.setNextStatement(true, null);
        this.setColour('#EAB308'); 
        this.setTooltip("Start executing when the specified key is pressed.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['event_when_loud_noise'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🔊 When I hear a loud noise");
        this.setNextStatement(true, null);
        this.setColour('#EAB308'); 
        this.setTooltip("Start executing when the mic detects a loud noise.");
        this.setHelpUrl("");
    }
};

// --- Brain Games (Logic & Math) ---
Blockly.Blocks['logic_surprise_number'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🎲 Surprise Number from")
            .appendField(new Blockly.FieldNumber(1), "FROM")
            .appendField("to")
            .appendField(new Blockly.FieldNumber(10), "TO");
        this.setOutput(true, "Number");
        this.setColour('#F97316'); // Math color
        this.setTooltip("Get a random number between the two values.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['logic_wait_sec'] = {
    init: function () {
        this.appendValueInput("SECONDS")
            .setCheck("Number")
            .appendField("⏳ Wait");
        this.appendDummyInput()
            .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#60A5FA'); // Control loops color
        this.setTooltip("Wait for a specific amount of time.");
        this.setHelpUrl("");
    }
};

// --- Kid-Friendly Logic & Loops ---
Blockly.Blocks['control_repeat_forever'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🔁 Repeat forever");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("👇 Do this:");
        this.setPreviousStatement(true, null);
        this.setColour('#22C55E');
        this.setTooltip("Repeat the actions inside forever.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['control_wait_until'] = {
    init: function () {
        this.appendValueInput("CONDITION")
            .setCheck(["Boolean", "Number"])
            .appendField("⏳ Wait until");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#60A5FA');
        this.setTooltip("Pause the program until the condition comes true.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['control_if_simple'] = {
    init: function () {
        this.appendValueInput("CONDITION")
            .setCheck(["Boolean", "Number"])
            .appendField("🤔 If this happens:");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("👇 Then do this:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#60A5FA');
        this.setTooltip("If the condition is true, do the actions inside.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['control_if_else_simple'] = {
    init: function () {
        this.appendValueInput("CONDITION")
            .setCheck(["Boolean", "Number"])
            .appendField("🤔 If this happens:");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("👇 Then do this:");
        this.appendStatementInput("ELSE")
            .setCheck(null)
            .appendField("🤷 Otherwise, do this:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#60A5FA');
        this.setTooltip("If the condition is true, do the first actions. Otherwise, do the second actions.");
        this.setHelpUrl("");
    }
};

// --- Brain Link (App UI / Hardware Connectivity) ---
Blockly.Blocks['roboai_start_bluetooth'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("📡 Start Bluetooth Server")
            .appendField(new Blockly.FieldTextInput("RoboAI_Car"), "NAME");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#64748B'); // Light blue
        this.setTooltip("Initialize BLE Server on the ESP32 to allow wireless connection.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_brain_connect'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🔌 Connect via Telepathy (Web Serial)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#64748B'); // Light blue
        this.setTooltip("Connect the platform to the ESP32-S3 over Web Serial.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['roboai_brain_transfer'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🧠 Transfer Brain (Upload Mode)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#64748B');
        this.setTooltip("Upload the current logic as C++ code to the hardware.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['roboai_brain_sync'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("⚡ Sync Live (Computer Control)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#64748B');
        this.setTooltip("Control the hardware live over the serial connection.");
        this.setHelpUrl("");
    }
};

// --- Motor Blocks ---
Blockly.Blocks['roboai_motor_drive'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Drive Motor ")
            .appendField(new Blockly.FieldDropdown([["Left", "LEFT"], ["Right", "RIGHT"], ["Both", "BOTH"]]), "MOTOR");
        this.appendValueInput("SPEED")
            .setCheck("Number")
            .appendField("at speed (%)");
        this.appendDummyInput()
            .appendField("direction")
            .appendField(new Blockly.FieldDropdown([["Forward", "FORWARD"], ["Backward", "BACKWARD"]]), "DIR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#64748B'); // Indigo for Motors
        this.setTooltip("Drive the motors of the RoboAI platform.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_motor_stop'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Stop Motor ")
            .appendField(new Blockly.FieldDropdown([["Left", "LEFT"], ["Right", "RIGHT"], ["Both", "BOTH"]]), "MOTOR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#64748B'); // Indigo for Motors
        this.setTooltip("Stop the motors.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_motor_advance_power'] = {
    init: function () {
        this.appendValueInput("POWER")
            .setCheck("Number")
            .appendField("Advance at");
        this.appendDummyInput()
            .appendField("% power");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#64748B');
        this.setTooltip("Advance both motors at a specific power level.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_motor_steer_angle'] = {
    init: function () {
        this.appendValueInput("ANGLE")
            .setCheck("Number")
            .appendField("Steer");
        this.appendDummyInput()
            .appendField("degrees");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#64748B');
        this.setTooltip("Steer the robot by a specific angle.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_motor_rotate_4wd'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Rotate 4-Wheel Drive")
            .appendField(new Blockly.FieldDropdown([["Left", "LEFT"], ["Right", "RIGHT"]]), "DIR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#64748B');
        this.setTooltip("Perform a 0-degree turn using 4WD mechanum or skid steering.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_motor_dance'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Dance pattern:")
            .appendField(new Blockly.FieldDropdown([["Spin", "SPIN"], ["ZigZag", "ZIGZAG"], ["Wiggle", "WIGGLE"]]), "PATTERN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#64748B');
        this.setTooltip("Execute a predefined dancing motor pattern.");
        this.setHelpUrl("");
    }
};

// --- Sensor Blocks ---
Blockly.Blocks['roboai_sensor_ultrasonic'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Read Ultrasonic Distance (cm)");
        this.setOutput(true, "Number");
        this.setColour('#64748B'); // Orange for Sensors
        this.setTooltip("Get the current distance measured by the ultrasonic sensor in cm.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_sensor_imu'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Read IMU Axis ")
            .appendField(new Blockly.FieldDropdown([["Accel X", "AX"], ["Accel Y", "AY"], ["Accel Z", "AZ"], ["Gyro X", "GX"], ["Gyro Y", "GY"], ["Gyro Z", "GZ"]]), "AXIS");
        this.setOutput(true, "Number");
        this.setColour('#64748B'); // Orange for Sensors
        this.setTooltip("Read a specific acceleration or gyroscope axis from the MPU6050.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_sensor_ir'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Read IR Line Sensor ")
            .appendField(new Blockly.FieldDropdown([["Left", "LEFT"], ["Center", "CENTER"], ["Right", "RIGHT"]]), "POS");
        this.setOutput(true, "Number"); // Usually 0 or 1 for digital IR, or analog value
        this.setColour('#64748B'); // Orange for Sensors
        this.setTooltip("Read the value of the infrared line-following sensor.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_sensor_environment'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Read DHT11 ")
            .appendField(new Blockly.FieldDropdown([["Temperature (°C)", "TEMP"], ["Humidity (%)", "HUMIDITY"]]), "MEASUREMENT");
        this.setOutput(true, "Number");
        this.setColour('#64748B'); // Orange for Sensors
        this.setTooltip("Read temperature or humidity from the DHT11 sensor.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_sensor_light'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Read Light Level (LDR)");
        this.setOutput(true, "Number");
        this.setColour('#64748B'); // Orange for Sensors
        this.setTooltip("Read the ambient light brightness using an LDR (0-100%).");
        this.setHelpUrl("");
    }
};

// --- Edge AI Blocks ---
Blockly.Blocks['roboai_ai_vision_classify'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Camera sees ")
            .appendField(new Blockly.FieldDropdown([["Stop Sign", "STOP"], ["Green Light", "GO"], ["Human Face", "FACE"], ["Custom Object", "CUSTOM"]]), "OBJECT");
        this.setOutput(true, "Boolean");
        this.setColour('#06B6D4');
        this.setTooltip("Returns true if the Edge Vision model detects the selected object.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_ai_wakeword'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Heard Wake-Word:")
            .appendField(new Blockly.FieldTextInput("\"Computer\""), "WORD");
        this.setOutput(true, "Boolean");
        this.setColour('#06B6D4');
        this.setTooltip("Returns true if the selected wake word was just detected by the digital mic.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_ai_vision_track_color'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Camera sees color ")
            .appendField(new Blockly.FieldDropdown([["Red", "RED"], ["Blue", "BLUE"], ["Green", "GREEN"], ["Custom", "CUSTOM"]]), "COLOR");
        this.setOutput(true, "Boolean");
        this.setColour('#06B6D4');
        this.setTooltip("Returns true if the Edge Vision model detects the selected color.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_ai_predict_steering'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Predict Steering Angle (IR)");
        this.setOutput(true, "Number");
        this.setColour('#06B6D4');
        this.setTooltip("Uses AI to predict the required steering angle based on the IR sensor array.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_ai_classify_terrain'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Classify Terrain is ")
            .appendField(new Blockly.FieldDropdown([["Smooth", "SMOOTH"], ["Rough", "ROUGH"], ["Pothole", "POTHOLE"]]), "TERRAIN");
        this.setOutput(true, "Boolean");
        this.setColour('#06B6D4');
        this.setTooltip("Uses vibration data to classify road quality.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_ai_maze_next_move'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Predict Next Maze Move (RL)");
        this.setOutput(true, "String");
        this.setColour('#06B6D4');
        this.setTooltip("Gets the next recommended move (FORWARD, LEFT, RIGHT) from the Reinforcement Learning model.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_ai_predict_weather'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Predict Local Weather");
        this.setOutput(true, "String");
        this.setColour('#06B6D4');
        this.setTooltip("Predicts weather condition using DHT11 and LDR data.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['roboai_ai_detect_edge'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Detected Dangerous Edge");
        this.setOutput(true, "Boolean");
        this.setColour('#06B6D4');
        this.setTooltip("Returns true if the AI detects a dangerous edge (drop-off) in front.");
        this.setHelpUrl("");
    }
};

// --- Audio AI ---
Blockly.Blocks['roboai_ai_wait_wakeword'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Wait for Wake-Word:")
            .appendField(new Blockly.FieldTextInput("Computer"), "WORD");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#06B6D4');
        this.setTooltip("Pause execution until the wake word is heard.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['roboai_ai_listen_command'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Listen for AI Command");
        this.setOutput(true, "String");
        this.setColour('#06B6D4');
        this.setTooltip("Record audio and transcribe it into a text command.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['roboai_ai_sound_level'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Get Sound Level (%)");
        this.setOutput(true, "Number");
        this.setColour('#06B6D4');
        this.setTooltip("Returns the current ambient sound level volume (0-100%).");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['roboai_ai_speak'] = {
    init: function () {
        this.appendValueInput("TEXT")
            .setCheck(["String", "Number"])
            .appendField("Speak message");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#06B6D4');
        this.setTooltip("Use I2S/speaker to text-to-speech the given message.");
        this.setHelpUrl("");
    }
};

// --- IoT (Telepathy) ---
Blockly.Blocks['iot_log_sheets'] = {
    init: function () {
        this.appendValueInput("DATA")
            .setCheck(null)
            .appendField("Log data to Web-Ledger (Sheets)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#06B6D4'); // Emerald
        this.setTooltip("Send a data point to a configured Google Sheet.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['iot_webhook'] = {
    init: function () {
        this.appendValueInput("MESSAGE")
            .setCheck(null)
            .appendField("Shout to Phone (Webhook)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#06B6D4'); 
        this.setTooltip("Trigger a Webhook to send a notification to a phone/app.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['iot_get_time'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Get Web-Time");
        this.setOutput(true, "String");
        this.setColour('#06B6D4');
        this.setTooltip("Fetch the current time from an NTP server.");
        this.setHelpUrl("");
    }
};

// --- AI Strategy ---
Blockly.Blocks['ai_optimize_path'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Optimize Shortest Path");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#06B6D4');
        this.setTooltip("Run path optimization algorithm on the stored maze map.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['ai_store_map'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Store move in Map:")
            .appendField(new Blockly.FieldDropdown([["Forward", "F"], ["Left", "L"], ["Right", "R"], ["Turn Around", "B"]]), "MOVE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#06B6D4');
        this.setTooltip("Record the last move taken into the maze map array.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['ai_remember_intersection'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Remember Intersection node");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#06B6D4');
        this.setTooltip("Store the current location as an intersection for pathfinding.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['text_print_inline'] = {
    init: function () {
        this.appendValueInput("TEXT")
            .setCheck(null)
            .appendField("print inline (no new line)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#14B8A6'); // Teal
        this.setTooltip("Print text continuously on the same line.");
        this.setHelpUrl("");
    }
};

// --- Custom Inline Variables ---
Blockly.Blocks['variables_set_inline'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("📦 Store inside")
            .appendField(new Blockly.FieldTextInput("myBox"), "VAR")
            .appendField("the value");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#F59E0B'); // Amber for Variables
        this.setTooltip("Sets a variable with the given name to a value.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['variables_get_inline'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("📦 Look inside")
            .appendField(new Blockly.FieldTextInput("myBox"), "VAR");
        this.setOutput(true, null);
        this.setColour('#F59E0B'); // Amber
        this.setTooltip("Returns the value of a variable by name.");
        this.setHelpUrl("");
    }
};

// --- Character Blocks ---
Blockly.Blocks['character_move_forward'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🚶 Move forward");
        this.appendValueInput("STEPS")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("steps");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6'); // Blue for Motion
        this.setTooltip("Move the character forward by a number of steps.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_turn'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🔄 Turn")
            .appendField(new Blockly.FieldDropdown([["Right ↻", "RIGHT"], ["Left ↺", "LEFT"]]), "DIR");
        this.appendValueInput("DEGREES")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("degrees");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6'); // Blue for Motion
        this.setTooltip("Turn the character left or right.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_go_to'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("📍 Go to X:");
        this.appendValueInput("X")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("Y:");
        this.appendValueInput("Y")
            .setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6'); // Blue for Motion
        this.setTooltip("Move the character to a specific X, Y coordinate.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_say'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("💬 Say");
        this.appendValueInput("TEXT")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6'); // Purple for Looks
        this.setTooltip("Make the character say something in a speech bubble.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_say_for_secs'] = {
    init: function () {
        this.appendDummyInput().appendField("say");
        this.appendValueInput("TEXT").setCheck(null);
        this.appendDummyInput().appendField("for");
        this.appendValueInput("SECS").setCheck("Number");
        this.appendDummyInput().appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Make the character say something for a specific amount of time.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_think_for_secs'] = {
    init: function () {
        this.appendDummyInput().appendField("think");
        this.appendValueInput("TEXT").setCheck(null);
        this.appendDummyInput().appendField("for");
        this.appendValueInput("SECS").setCheck("Number");
        this.appendDummyInput().appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Make the character think something for a specific amount of time.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_think'] = {
    init: function () {
        this.appendDummyInput().appendField("think");
        this.appendValueInput("TEXT").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Make the character think something.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_next_costume'] = {
    init: function () {
        this.appendDummyInput().appendField("next costume");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Switch to the next costume.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_switch_backdrop'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("switch backdrop to")
            .appendField(new Blockly.FieldDropdown([["backdrop1", "backdrop1"], ["backdrop2", "backdrop2"]]), "BACKDROP");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Switch to a specific backdrop.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_next_backdrop'] = {
    init: function () {
        this.appendDummyInput().appendField("next backdrop");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Switch to the next backdrop.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_change_size'] = {
    init: function () {
        this.appendDummyInput().appendField("change size by");
        this.appendValueInput("CHANGE").setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Change the character's size.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_set_size'] = {
    init: function () {
        this.appendDummyInput().appendField("set size to");
        this.appendValueInput("SIZE").setCheck("Number");
        this.appendDummyInput().appendField("%");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Set the character's size.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_change_effect'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("change")
            .appendField(new Blockly.FieldDropdown([["color", "COLOR"], ["ghost", "GHOST"]]), "EFFECT")
            .appendField("effect by");
        this.appendValueInput("CHANGE").setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Change a graphic effect.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_set_effect'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("set")
            .appendField(new Blockly.FieldDropdown([["color", "COLOR"], ["ghost", "GHOST"]]), "EFFECT")
            .appendField("effect to");
        this.appendValueInput("VALUE").setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Set a graphic effect.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_clear_graphic_effects'] = {
    init: function () {
        this.appendDummyInput().appendField("clear graphic effects");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Clear all graphic effects.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_show'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("👁️ Show Character");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6'); // Purple for Looks
        this.setTooltip("Make the character visible on the stage.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_hide'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🙈 Hide Character");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6'); // Purple for Looks
        this.setTooltip("Hide the character from the stage.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_glide_to_mouse'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("滑 Glide to Mouse Pointer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6'); 
        this.setTooltip("Glide the character smoothly to where the mouse is pointing.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_play_sound_until_done'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("play sound")
            .appendField(new Blockly.FieldDropdown([["Hi", "HI"], ["Bark", "BARK"], ["Magic", "MAGIC"], ["Pop", "POP"], ["Beep", "BEEP"]]), "SOUND")
            .appendField("until done");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#EC4899'); // Pink for Sound
        this.setTooltip("Play a sound and wait for it to finish.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_start_sound'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("start sound")
            .appendField(new Blockly.FieldDropdown([["Hi", "HI"], ["Bark", "BARK"], ["Magic", "MAGIC"], ["Pop", "POP"], ["Beep", "BEEP"]]), "SOUND");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#EC4899'); // Pink for Sound
        this.setTooltip("Start playing a sound.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_stop_all_sounds'] = {
    init: function () {
        this.appendDummyInput().appendField("stop all sounds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#EC4899');
        this.setTooltip("Stop all playing sounds.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_change_sound_effect'] = {
    init: function () {
        this.appendValueInput("CHANGE")
            .setCheck("Number")
            .appendField("change")
            .appendField(new Blockly.FieldDropdown([["pitch", "PITCH"], ["pan left/right", "PAN"]]), "EFFECT")
            .appendField("effect by");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#EC4899');
        this.setTooltip("Change a sound effect.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_set_sound_effect'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("set")
            .appendField(new Blockly.FieldDropdown([["pitch", "PITCH"], ["pan left/right", "PAN"]]), "EFFECT")
            .appendField("effect to");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#EC4899');
        this.setTooltip("Set a sound effect.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_clear_sound_effects'] = {
    init: function () {
        this.appendDummyInput().appendField("clear sound effects");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#EC4899');
        this.setTooltip("Clear all sound effects.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_change_volume'] = {
    init: function () {
        this.appendValueInput("CHANGE")
            .setCheck("Number")
            .appendField("change volume by");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#EC4899');
        this.setTooltip("Change the volume.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_set_volume'] = {
    init: function () {
        this.appendValueInput("VOLUME")
            .setCheck("Number")
            .appendField("set volume to");
        this.appendDummyInput().appendField("%");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#EC4899');
        this.setTooltip("Set the volume.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_volume'] = {
    init: function () {
        this.appendDummyInput().appendField("volume");
        this.setOutput(true, "Number");
        this.setColour('#EC4899');
        this.setTooltip("Get the current volume.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['character_change_outfit'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("👕 Change outfit to")
            .appendField(new Blockly.FieldDropdown([["Outfit 1", "O1"], ["Outfit 2", "O2"], ["Funky", "FUNKY"]]), "OUTFIT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6'); // Purple (Looks)
        this.setTooltip("Change the character's costume.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_paint_color'] = {
    init: function () {
        this.appendValueInput("COLOR")
            .setCheck(null)
            .appendField("🎨 Paint color effect to");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6'); // Purple
        this.setTooltip("Apply a color tint to the character.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_dissolve_effect'] = {
    init: function () {
        this.appendValueInput("AMOUNT")
            .setCheck("Number")
            .appendField("✨ Dissolve effect by");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6'); // Purple
        this.setTooltip("Change the transparency or dissolve amount of the character.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_go_to_random'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("📍 Go to random position");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("Move the character to a random position on the stage.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_glide_secs_to_random'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("滑 Glide");
        this.appendValueInput("SECS")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("secs to random position");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("Glide the character to a random position over a specified time.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_glide_secs_to_x_y'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("滑 Glide");
        this.appendValueInput("SECS")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("secs to X:");
        this.appendValueInput("X")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("Y:");
        this.appendValueInput("Y")
            .setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("Glide the character to a specific X, Y coordinate over a specified time.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_point_in_direction'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🧭 Point in direction");
        this.appendValueInput("DEGREES")
            .setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("Point the character in a specific direction (90 is right, 0 is up).");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_point_towards_mouse'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🧭 Point towards mouse-pointer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("Point the character towards the mouse pointer.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_change_x'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("↔️ Change X by");
        this.appendValueInput("DX")
            .setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("Change the character's X position by a certain amount.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_set_x'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("↔️ Set X to");
        this.appendValueInput("X")
            .setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("Set the character's X position to a specific value.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_change_y'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("↕️ Change Y by");
        this.appendValueInput("DY")
            .setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("Change the character's Y position by a certain amount.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_set_y'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("↕️ Set Y to");
        this.appendValueInput("Y")
            .setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("Set the character's Y position to a specific value.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_if_on_edge_bounce'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("if on edge, bounce");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("If touching the edge of the stage, bounce off.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_set_rotation_style'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("set rotation style")
            .appendField(new Blockly.FieldDropdown([["left-right", "left-right"], ["don't rotate", "don't rotate"], ["all around", "all around"]]), "STYLE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip("Set how the character visually rotates.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_x_position'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("x position");
        this.setOutput(true, "Number");
        this.setColour('#3B82F6');
        this.setTooltip("The character's current X position.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_y_position'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("y position");
        this.setOutput(true, "Number");
        this.setColour('#3B82F6');
        this.setTooltip("The character's current Y position.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['character_direction'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("direction");
        this.setOutput(true, "Number");
        this.setColour('#3B82F6');
        this.setTooltip("The character's current direction.");
        this.setHelpUrl("");
    }
};

// --- Tinkercad Output Blocks ---
Blockly.Blocks['output_set_builtin_led'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("set built-in LED to")
            .appendField(new Blockly.FieldDropdown([["HIGH", "HIGH"], ["LOW", "LOW"]]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6'); // Tinkercad blue for output
        this.setTooltip("Turn the built-in LED on or off.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_set_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("set pin")
            .appendField(new Blockly.FieldNumber(0, 0, 13), "PIN")
            .appendField("to")
            .appendField(new Blockly.FieldDropdown([["HIGH", "HIGH"], ["LOW", "LOW"]]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Set a digital pin to HIGH or LOW.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_set_pin_analog'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("set pin")
            .appendField(new Blockly.FieldNumber(3, 0, 13), "PIN")
            .appendField("to");
        this.appendValueInput("VALUE")
            .setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Set a PWM capable pin to a value between 0 and 255.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_rotate_servo'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("rotate servo on pin")
            .appendField(new Blockly.FieldNumber(0, 0, 13), "PIN")
            .appendField("to");
        this.appendValueInput("DEGREES")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("degrees");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Rotate a servo connected to a pin to a specific angle (0-180).");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_play_speaker'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("play speaker on pin")
            .appendField(new Blockly.FieldNumber(0, 0, 13), "PIN")
            .appendField("with tone");
        this.appendValueInput("TONE")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("for");
        this.appendValueInput("SECS")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("secs");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Play a tone on a piezo buzzer for a specific duration.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_turn_off_speaker'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("turn off speaker on pin")
            .appendField(new Blockly.FieldNumber(0, 0, 13), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Stop playing tone on the specified pin.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_print_serial'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("print to serial monitor");
        this.appendValueInput("TEXT")
            .setCheck(null);
        this.appendDummyInput()
            .appendField("with")
            .appendField(new Blockly.FieldDropdown([["newline", "NEWLINE"], ["no newline", "NONEWLINE"]]), "NEWLINE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Print text or numbers to the serial monitor.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_set_rgb_led'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("set RGB LED in pins")
            .appendField(new Blockly.FieldNumber(3, 0, 13), "PIN_R")
            .appendField(new Blockly.FieldNumber(6, 0, 13), "PIN_G")
            .appendField(new Blockly.FieldNumber(5, 0, 13), "PIN_B")
            .appendField("to color");
        this.appendValueInput("COLOR")
            .setCheck("Colour");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Set the color of an RGB LED connected to 3 PWM pins.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_configure_lcd'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("configure LCD")
            .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "LCD_ID")
            .appendField("type to")
            .appendField(new Blockly.FieldDropdown([["I2C", "I2C"]]), "LCD_TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Configure an LCD display.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_print_lcd'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("print to LCD")
            .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "LCD_ID");
        this.appendValueInput("TEXT")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Print text to the LCD.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_set_position_lcd'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("set position on LCD")
            .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "LCD_ID")
            .appendField("to column");
        this.appendValueInput("COL")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("row");
        this.appendValueInput("ROW")
            .setCheck("Number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Set the cursor position on the LCD.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_clear_lcd'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("on LCD")
            .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "LCD_ID")
            .appendField("clear the screen");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Clear the LCD screen.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_configure_led_display'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("configure LED display")
            .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "LED_ID")
            .appendField("type to")
            .appendField(new Blockly.FieldDropdown([["7 segment", "7SEG"]]), "LED_TYPE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Configure a 7-segment LED display.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_print_led_display'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("print to LED display")
            .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "LED_ID");
        this.appendValueInput("VALUE")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Print a number to the LED display.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['output_clear_led_display'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("on LED display")
            .appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"]]), "LED_ID")
            .appendField("clear the screen");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3b82f6');
        this.setTooltip("Clear the LED display screen.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['input_read_digital_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("read digital pin")
            .appendField(new Blockly.FieldNumber(0, 0, 13), "PIN");
        this.setOutput(true, ["Number", "Boolean"]);
        this.setColour('#a855f7');
        this.setTooltip("Read the state of a digital pin.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['input_read_analog_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("read analog pin")
            .appendField(new Blockly.FieldDropdown([["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]]), "PIN");
        this.setOutput(true, "Number");
        this.setColour('#a855f7');
        this.setTooltip("Read the value of an analog pin.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['input_read_servo_degrees'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("read degrees of servo on pin")
            .appendField(new Blockly.FieldNumber(0, 0, 13), "PIN");
        this.setOutput(true, "Number");
        this.setColour('#a855f7');
        this.setTooltip("Read the current angle of a servo.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['input_serial_available'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("number of serial characters available");
        this.setOutput(true, ["Number", "Boolean"]);
        this.setColour('#a855f7');
        this.setTooltip("Get the number of bytes available for reading from the serial port.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['input_read_serial'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("read from serial");
        this.setOutput(true, "Number");
        this.setColour('#a855f7');
        this.setTooltip("Read a character from the serial port.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['input_read_ultrasonic'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("read ultrasonic distance sensor on trigger pin")
            .appendField(new Blockly.FieldNumber(0, 0, 13), "TRIG")
            .appendField("echo pin")
            .appendField(new Blockly.FieldNumber(1, 0, 13), "ECHO")
            .appendField("in")
            .appendField(new Blockly.FieldDropdown([["cm", "cm"], ["inch", "inch"]]), "UNIT");
        this.setOutput(true, "Number");
        this.setColour('#a855f7');
        this.setTooltip("Read the distance measured by an ultrasonic sensor.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['input_read_temperature'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("read temperature sensor on pin")
            .appendField(new Blockly.FieldDropdown([["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]]), "PIN")
            .appendField("in")
            .appendField(new Blockly.FieldDropdown([["�C", "C"], ["�F", "F"]]), "UNIT");
        this.setOutput(true, "Number");
        this.setColour('#a855f7');
        this.setTooltip("Read the temperature from an analog sensor (e.g. TMP36).");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['input_read_ntc_temperature'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("read NTC thermistor on pin")
            .appendField(new Blockly.FieldDropdown([["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]]), "PIN")
            .appendField("in")
            .appendField(new Blockly.FieldDropdown([["°C", "C"], ["°F", "F"]]), "UNIT");
        this.setOutput(true, "Number");
        this.setColour('#a855f7');
        this.setTooltip("Read the temperature from an NTC thermistor (like the standard Wokwi temp sensor).");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['input_read_infrared'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("read infrared sensor pin")
            .appendField(new Blockly.FieldNumber(0, 0, 13), "PIN");
        this.setOutput(true, ["Number", "Boolean"]);
        this.setColour('#a855f7');
        this.setTooltip("Read the state of an IR sensor.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['control_on_start'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("on start");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setColour('#f59e0b');
        this.setTooltip("Code that runs once when the simulation starts.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['control_forever'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("forever");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setColour('#f59e0b');
        this.setTooltip("Code that runs repeatedly.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['control_wait'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("wait")
            .appendField(new Blockly.FieldNumber(1, 0), "TIME")
            .appendField(new Blockly.FieldDropdown([["secs", "secs"], ["msecs", "msecs"]]), "UNIT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip("Pause the simulation for a specific amount of time.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['control_repeat_times'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("repeat")
            .appendField(new Blockly.FieldNumber(10, 1), "TIMES")
            .appendField("times");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip("Repeat some code a specific number of times.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['control_repeat_while'] = {
    init: function () {
        this.appendValueInput("COND")
            .setCheck("Boolean")
            .appendField("repeat")
            .appendField(new Blockly.FieldDropdown([["while", "while"], ["until", "until"]]), "MODE");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip("Repeat some code while or until a condition is true.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['control_if'] = {
    init: function () {
        this.appendValueInput("COND")
            .setCheck("Boolean")
            .appendField("if");
        this.appendDummyInput()
            .appendField("then");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip("Run some code if a condition is true.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['control_if_else'] = {
    init: function () {
        this.appendValueInput("COND")
            .setCheck("Boolean")
            .appendField("if");
        this.appendDummyInput()
            .appendField("then");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.appendDummyInput()
            .appendField("else");
        this.appendStatementInput("ELSE")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip("Run some code if a condition is true, otherwise run other code.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['control_count'] = {
    init: function () {
        this.appendValueInput("FROM")
            .setCheck("Number")
            .appendField("count")
            .appendField(new Blockly.FieldDropdown([["up", "up"], ["down", "down"]]), "DIR")
            .appendField("by")
            .appendField(new Blockly.FieldNumber(1, 1), "BY")
            .appendField("for")
            .appendField(new Blockly.FieldVariable("i"), "VAR")
            .appendField("from");
        this.appendValueInput("TO")
            .setCheck("Number")
            .appendField("to");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(true);
        this.setColour('#f59e0b');
        this.setTooltip("Count up or down by a specific amount for a variable.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['notation_title'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("title block comment")
            .appendField(new Blockly.FieldTextInput("describe your code here"), "COMMENT");
        this.setNextStatement(true, null);
        this.setColour('#8a8a8a');
        this.setTooltip("Add a title block comment to your code.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['notation_comment'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("comment")
            .appendField(new Blockly.FieldTextInput("helpful single-line comment here"), "COMMENT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8a8a8a');
        this.setTooltip("Add a single-line comment to your code.");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['math_arithmetic_custom'] = {
    init: function () {
        this.appendValueInput("A")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["+", "ADD"], ["-", "MINUS"], ["*", "MULTIPLY"], ["/", "DIVIDE"], ["%", "MODULO"]]), "OP");
        this.appendValueInput("B")
            .setCheck("Number");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour('#F97316');
        this.setTooltip("Perform basic arithmetic operations.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['math_compare_custom'] = {
    init: function () {
        this.appendValueInput("A")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["<", "LT"], ["<=", "LTE"], [">", "GT"], [">=", "GTE"], ["=", "EQ"], ["!=", "NEQ"]]), "OP");
        this.appendValueInput("B")
            .setCheck("Number");
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour('#F97316');
        this.setTooltip("Compare two numbers.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['math_random_custom'] = {
    init: function () {
        this.appendValueInput("MIN")
            .setCheck("Number")
            .appendField("pick random");
        this.appendValueInput("MAX")
            .setCheck("Number")
            .appendField("to");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour('#F97316');
        this.setTooltip("Return a random integer between the two limits (inclusive).");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['math_logic_custom'] = {
    init: function () {
        this.appendValueInput("A")
            .setCheck("Boolean");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["and", "AND"], ["or", "OR"]]), "OP");
        this.appendValueInput("B")
            .setCheck("Boolean");
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour('#F97316');
        this.setTooltip("Perform logical operations.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['math_not_custom'] = {
    init: function () {
        this.appendValueInput("BOOL")
            .setCheck("Boolean")
            .appendField("not");
        this.setOutput(true, "Boolean");
        this.setColour('#F97316');
        this.setTooltip("Reverse a boolean value.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['math_function_custom'] = {
    init: function () {
        this.appendValueInput("NUM")
            .setCheck("Number")
            .appendField(new Blockly.FieldDropdown([["abs", "ABS"], ["sqrt", "SQRT"], ["sin", "SIN"], ["cos", "COS"], ["tan", "TAN"]]), "OP")
            .appendField("of");
        this.setOutput(true, "Number");
        this.setColour('#F97316');
        this.setTooltip("Perform a mathematical function.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['math_map_custom'] = {
    init: function () {
        this.appendValueInput("VAL")
            .setCheck("Number")
            .appendField("map");
        this.appendValueInput("TO_MIN")
            .setCheck("Number")
            .appendField("to range");
        this.appendValueInput("TO_MAX")
            .setCheck("Number")
            .appendField("to");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour('#F97316');
        this.setTooltip("Map a number from 0-1023 to a new range.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['math_constrain_custom'] = {
    init: function () {
        this.appendValueInput("VAL")
            .setCheck("Number")
            .appendField("constrain");
        this.appendValueInput("MIN")
            .setCheck("Number")
            .appendField("to range");
        this.appendValueInput("MAX")
            .setCheck("Number")
            .appendField("to");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour('#F97316');
        this.setTooltip("Constrain a number to be within a range.");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['math_state_custom'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["HIGH", "HIGH"], ["LOW", "LOW"]]), "STATE");
        this.setOutput(true, null); // Can act as number or boolean
        this.setColour('#F97316');
        this.setTooltip("HIGH or LOW state.");
        this.setHelpUrl("");
    }
};


// --- Colour Blocks ---
Blockly.Blocks['colour_picker'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["🟥 Red", "#ff0000"],
                ["🟩 Green", "#00ff00"],
                ["🟦 Blue", "#0000ff"],
                ["🟨 Yellow", "#ffff00"],
                ["🟪 Purple", "#800080"],
                ["🟧 Orange", "#ffa500"],
                ["⬜ White", "#ffffff"],
                ["⬛ Black", "#000000"]
            ]), "COLOUR");
        this.setOutput(true, "Colour");
        this.setColour('#D946EF');
        this.setTooltip("Select a color.");
    }
};

Blockly.Blocks['colour_random'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("🎲 Random Color");
        this.setOutput(true, "Colour");
        this.setColour('#D946EF');
        this.setTooltip("Get a random color.");
    }
};

Blockly.Blocks['colour_rgb'] = {
    init: function () {
        this.appendValueInput("RED")
            .setCheck("Number")
            .appendField("🎨 Color R");
        this.appendValueInput("GREEN")
            .setCheck("Number")
            .appendField("G");
        this.appendValueInput("BLUE")
            .setCheck("Number")
            .appendField("B");
        this.setInputsInline(true);
        this.setOutput(true, "Colour");
        this.setColour('#D946EF');
        this.setTooltip("Create a color from R, G, B values (0-255).");
    }
};
