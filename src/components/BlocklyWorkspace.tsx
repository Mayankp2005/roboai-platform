import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks'; // Import default standard blocks (logic, loops, math)
import * as En from 'blockly/msg/en'; // Import english translations for standard blocks

// Load the english translations into Blockly before init
Blockly.setLocale(En as any);

// --- Kid-Friendly Overrides for Logic & Loops ---
Blockly.Msg.CONTROLS_IF_MSG_IF = '🤔 If';
Blockly.Msg.CONTROLS_IF_MSG_THEN = '👇 Then do this:';
Blockly.Msg.CONTROLS_IF_MSG_ELSE = '🤷 Otherwise, do this:';
Blockly.Msg.CONTROLS_IF_ELSEIF_TITLE_ELSEIF = '🤔 Or if';
Blockly.Msg.CONTROLS_REPEAT_TITLE = '🔁 Repeat %1 times';
Blockly.Msg.CONTROLS_REPEAT_INPUT_DO = '👇 Do this:';
Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_WHILE = '🔁 Keep doing while';
Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_UNTIL = '🛑 Keep doing until';
Blockly.Msg.CONTROLS_WHILEUNTIL_INPUT_DO = '👇 Do this:';
Blockly.Msg.CONTROLS_FOR_TITLE = '🔢 Count %1 from %2 to %3 by %4';
Blockly.Msg.CONTROLS_FOR_INPUT_DO = '👇 Do this:';
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK = '⛔ Stop the loop';
Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE = '⏭️ Skip to next loop';
Blockly.Msg.LOGIC_BOOLEAN_TRUE = '✅ True (Yes)';
Blockly.Msg.LOGIC_BOOLEAN_FALSE = '❌ False (No)';
Blockly.Msg.LOGIC_NEGATE_TITLE = '🚫 Not %1 (Opposite)';
Blockly.Msg.LOGIC_OPERATION_AND = '🤝 AND (Both)';
Blockly.Msg.LOGIC_OPERATION_OR = '🤷 OR (Either)';
Blockly.Msg.LOGIC_NULL = '🚫 Nothing (Empty)';
Blockly.Msg.LOGIC_TERNARY_CONDITION = '🤔 Test:';
Blockly.Msg.LOGIC_TERNARY_IF_TRUE = '✅ if true';
Blockly.Msg.LOGIC_TERNARY_IF_FALSE = '❌ if false';

// --- Kid-Friendly Overrides for Math ---
Blockly.Msg.MATH_ADDITION_SYMBOL = '➕';
Blockly.Msg.MATH_SUBTRACTION_SYMBOL = '➖';
Blockly.Msg.MATH_MULTIPLICATION_SYMBOL = '✖️';
Blockly.Msg.MATH_DIVISION_SYMBOL = '➗';

// --- Kid-Friendly Overrides for Variables ---
Blockly.Msg.NEW_VARIABLE = '➕ Create a new Box (Variable)...';
Blockly.Msg.RENAME_VARIABLE = '✏️ Rename this Box...';
Blockly.Msg.DELETE_VARIABLE = '🗑️ Throw away the "%1" Box';
Blockly.Msg.VARIABLES_SET = '📦 Store inside %1 the value';
Blockly.Msg.VARIABLES_GET = '📦 Look inside %1';

// --- Kid-Friendly Overrides for Functions (Procedures) ---
Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE = '🛠️ New Action';
Blockly.Msg.PROCEDURES_DEFRETURN_TITLE = '🛠️ New Question';
Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = 'my_action';
Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE = 'my_question';
Blockly.Msg.PROCEDURES_DEFNORETURN_DO = '👇 Do these steps:';
Blockly.Msg.PROCEDURES_DEFRETURN_DO = '👇 Do these steps:';
Blockly.Msg.PROCEDURES_DEFRETURN_RETURN = '📤 Give back answer:';
Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TITLE = '📥 Inputs (Ingredients)';
Blockly.Msg.PROCEDURES_CALL_BEFORE_PARAMS = 'with ingredients:';
Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT = '📝 What does this action do?';

import '../blocks/customBlocks';
import { cppGenerator, javascriptGenerator } from '../blocks/generator';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const BUILDER_TOOLBOX = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'Events (Sparks)',
            colour: '#EAB308',
            contents: [
                { kind: 'block', type: 'event_when_flag_clicked' },
                { kind: 'block', type: 'event_when_sprite_clicked' },
                { kind: 'block', type: 'event_when_key_pressed' },
                { kind: 'block', type: 'event_when_loud_noise' },
            ],
        },
        {
            kind: 'category',
            name: 'Logic',
            colour: '#60A5FA',
            contents: [
                { kind: 'block', type: 'control_if_simple' },
                { kind: 'block', type: 'control_if_else_simple' },
                { kind: 'block', type: 'logic_compare' },
                { kind: 'block', type: 'logic_operation' },
                { kind: 'block', type: 'logic_negate' },
                { kind: 'block', type: 'logic_boolean' },
                { kind: 'block', type: 'logic_null' },
                { kind: 'block', type: 'logic_ternary' },
                { kind: 'block', type: 'logic_wait_sec' },
                { kind: 'block', type: 'control_wait_until' },
            ],
        },
        {
            kind: 'category',
            name: 'Loops',
            colour: '#22C55E',
            contents: [
                { kind: 'block', type: 'controls_repeat_ext' },
                { kind: 'block', type: 'control_repeat_forever' },
                { kind: 'block', type: 'controls_for' },
                { kind: 'block', type: 'controls_flow_statements' },
            ],
        },
        {
            kind: 'category',
            name: 'Math',
            colour: '#F97316',
            contents: [
                { kind: 'block', type: 'math_number' },
                { kind: 'block', type: 'math_arithmetic' },
                { kind: 'block', type: 'math_single' },
                { kind: 'block', type: 'math_modulo' },
                { kind: 'block', type: 'math_random_int' },
                { kind: 'block', type: 'logic_surprise_number' },
            ],
        },
        {
            kind: 'category',
            name: 'Text',
            colour: '#14B8A6', // Teal
            contents: [
                { kind: 'block', type: 'text' },
                { kind: 'block', type: 'text_print' },
                { kind: 'block', type: 'text_print_inline' }
            ],
        },
        {
            kind: 'sep',
        },
        {
            kind: 'category',
            name: 'Variables',
            colour: '#EF4444', // Amber
            custom: 'MY_VARIABLE_CATEGORY', // This populates both default and custom variables
        },
        {
            kind: 'category',
            name: 'Functions',
            colour: '#D946EF', // Pink
            custom: 'PROCEDURE',
        },
        {
            kind: 'sep',
        },

        {
            kind: 'category',
            name: 'Character Motion',
            colour: '#3B82F6', // Blue
            contents: [
                { kind: 'block', type: 'character_move_forward' },
                { kind: 'block', type: 'character_turn' },
                { kind: 'block', type: 'character_go_to_random' },
                { kind: 'block', type: 'character_go_to' },
                { kind: 'block', type: 'character_glide_secs_to_random' },
                { kind: 'block', type: 'character_glide_secs_to_x_y' },
                { kind: 'block', type: 'character_glide_to_mouse' },
                { kind: 'block', type: 'character_point_in_direction' },
                { kind: 'block', type: 'character_point_towards_mouse' },
                { kind: 'block', type: 'character_change_x' },
                { kind: 'block', type: 'character_set_x' },
                { kind: 'block', type: 'character_change_y' },
                { kind: 'block', type: 'character_set_y' },
                { kind: 'block', type: 'character_if_on_edge_bounce' },
                { kind: 'block', type: 'character_set_rotation_style' },
                { kind: 'block', type: 'character_x_position' },
                { kind: 'block', type: 'character_y_position' },
                { kind: 'block', type: 'character_direction' },
            ],
        },
        {
            kind: 'category',
            name: 'Character Looks',
            colour: '#8B5CF6', // Purple
            contents: [
                { kind: 'block', type: 'character_say_for_secs' },
                { kind: 'block', type: 'character_say' },
                { kind: 'block', type: 'character_think_for_secs' },
                { kind: 'block', type: 'character_think' },
                { kind: 'block', type: 'character_change_outfit' },
                { kind: 'block', type: 'character_next_costume' },
                { kind: 'block', type: 'character_switch_backdrop' },
                { kind: 'block', type: 'character_next_backdrop' },
                { kind: 'block', type: 'character_change_size' },
                { kind: 'block', type: 'character_set_size' },
                { kind: 'block', type: 'character_change_effect' },
                { kind: 'block', type: 'character_set_effect' },
                { kind: 'block', type: 'character_clear_graphic_effects' },
                { kind: 'block', type: 'character_show' },
                { kind: 'block', type: 'character_hide' },
            ],
        },
        {
            kind: 'category',
            name: 'Character Sound',
            colour: '#EC4899', // Pink
            contents: [
                { kind: 'block', type: 'character_play_sound_until_done' },
                { kind: 'block', type: 'character_start_sound' },
                { kind: 'block', type: 'character_stop_all_sounds' },
                { kind: 'block', type: 'character_change_sound_effect' },
                { kind: 'block', type: 'character_set_sound_effect' },
                { kind: 'block', type: 'character_clear_sound_effects' },
                { kind: 'block', type: 'character_change_volume' },
                { kind: 'block', type: 'character_set_volume' },
                { kind: 'block', type: 'character_volume' },
            ],
        },
        {
            kind: 'category',
            name: 'Edge AI & IoT',
            colour: '#06B6D4',
            contents: [
                { kind: 'block', type: 'roboai_ai_vision_classify' },
                { kind: 'block', type: 'roboai_ai_wakeword' },
                { kind: 'block', type: 'roboai_ai_wait_wakeword' },
                { kind: 'block', type: 'roboai_ai_listen_command' },
                { kind: 'block', type: 'roboai_ai_sound_level' },
                { kind: 'block', type: 'roboai_ai_speak' },
                { kind: 'block', type: 'roboai_ai_vision_track_color' },
                { kind: 'block', type: 'roboai_ai_predict_steering' },
                { kind: 'block', type: 'roboai_ai_classify_terrain' },
                { kind: 'block', type: 'roboai_ai_maze_next_move' },
                { kind: 'block', type: 'ai_optimize_path' },
                { kind: 'block', type: 'ai_store_map' },
                { kind: 'block', type: 'ai_remember_intersection' },
                { kind: 'block', type: 'roboai_ai_predict_weather' },
                { kind: 'block', type: 'roboai_ai_detect_edge' },
                { kind: 'block', type: 'iot_log_sheets' },
                { kind: 'block', type: 'iot_webhook' },
                { kind: 'block', type: 'iot_get_time' },
            ],
        },
        {
            kind: 'sep',
        },
        {
            kind: 'category',
            name: 'Hardware',
            colour: '#64748B', // Light Blue/Cyan
            contents: [
                { kind: 'block', type: 'roboai_start_bluetooth' },
                { kind: 'block', type: 'roboai_brain_connect' },
                { kind: 'block', type: 'roboai_brain_transfer' },
                { kind: 'block', type: 'roboai_brain_sync' },
                { kind: 'block', type: 'roboai_motor_drive' },
                { kind: 'block', type: 'roboai_motor_stop' },
                { kind: 'block', type: 'roboai_motor_advance_power' },
                { kind: 'block', type: 'roboai_motor_steer_angle' },
                { kind: 'block', type: 'roboai_motor_rotate_4wd' },
                { kind: 'block', type: 'roboai_motor_dance' },
                { kind: 'block', type: 'roboai_sensor_ultrasonic' },
                { kind: 'block', type: 'roboai_sensor_imu' },
                { kind: 'block', type: 'roboai_sensor_ir' },
                { kind: 'block', type: 'roboai_sensor_environment' },
                { kind: 'block', type: 'roboai_sensor_light' },
            ],
        },
    ],
};

const CIRCUIT_TOOLBOX = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'Output',
            colour: '#3b82f6', // Tinkercad Output Blue
            contents: [
                { kind: 'block', type: 'output_set_builtin_led' },
                { kind: 'block', type: 'output_set_pin' },
                { kind: 'block', type: 'output_set_pin_analog' },
                { kind: 'block', type: 'output_rotate_servo' },
                { kind: 'block', type: 'output_play_speaker' },
                { kind: 'block', type: 'output_turn_off_speaker' },
                { kind: 'block', type: 'output_print_serial' },
                { kind: 'block', type: 'output_set_rgb_led' },
                { kind: 'block', type: 'output_configure_lcd' },
                { kind: 'block', type: 'output_print_lcd' },
                { kind: 'block', type: 'output_set_position_lcd' },
                { kind: 'block', type: 'output_clear_lcd' },
                { kind: 'block', type: 'output_configure_led_display' },
                { kind: 'block', type: 'output_print_led_display' },
                { kind: 'block', type: 'output_clear_led_display' },
            ],
        },
        {
            kind: 'category',
            name: 'Input',
            colour: '#a855f7', // Purple
            contents: [
                { kind: 'block', type: 'input_read_digital_pin' },
                { kind: 'block', type: 'input_read_analog_pin' },
                { kind: 'block', type: 'input_read_servo_degrees' },
                { kind: 'block', type: 'input_serial_available' },
                { kind: 'block', type: 'input_read_serial' },
                { kind: 'block', type: 'input_read_ultrasonic' },
                { kind: 'block', type: 'input_read_temperature' },
                { kind: 'block', type: 'input_read_ntc_temperature' },
                { kind: 'block', type: 'input_read_infrared' },
            ],
        },
        {
            kind: 'category',
            name: 'Control',
            colour: '#f59e0b', // Orange/Yellow
            contents: [
                { kind: 'block', type: 'control_on_start' },
                { kind: 'block', type: 'control_forever' },
                { kind: 'block', type: 'control_wait' },
                { kind: 'block', type: 'control_repeat_times' },
                { kind: 'block', type: 'control_repeat_while' },
                { kind: 'block', type: 'control_count' },
                { kind: 'block', type: 'control_if' },
                { kind: 'block', type: 'control_if_else' },
            ],
        },
        {
            kind: 'category',
            name: 'Notation',
            colour: '#8a8a8a', // Grey
            contents: [
                { kind: 'block', type: 'notation_title' },
                { kind: 'block', type: 'notation_comment' },
            ],
        },
        {
            kind: 'category',
            name: 'Math',
            colour: '#F97316',
            contents: [
                { kind: 'block', type: 'math_number' },
                { kind: 'block', type: 'math_arithmetic_custom' },
                { kind: 'block', type: 'math_compare_custom' },
                { kind: 'block', type: 'math_random_custom' },
                { kind: 'block', type: 'math_logic_custom' },
                { kind: 'block', type: 'math_not_custom' },
                { kind: 'block', type: 'math_function_custom' },
                { kind: 'block', type: 'math_map_custom' },
                { kind: 'block', type: 'math_constrain_custom' },
                { kind: 'block', type: 'math_state_custom' },
            ],
        },
        {
            kind: 'category',
            name: 'Colors',
            colour: '#ec4899', // Pink
            contents: [
                { kind: 'block', type: 'colour_picker' },
                { kind: 'block', type: 'colour_random' },
                { kind: 'block', type: 'colour_rgb' },
            ],
        },
        {
            kind: 'category',
            name: 'Variables',
            colour: '#EF4444',
            custom: 'MY_VARIABLE_CATEGORY',
            contents: []
        }
    ],
};

// Define a custom dark theme for Blockly to match the glassmorphism UI
const darkTheme = Blockly.Theme.defineTheme('darkTheme', {
    name: 'darkTheme',
    base: Blockly.Themes.Classic,
    componentStyles: {
        workspaceBackgroundColour: 'transparent',
        toolboxBackgroundColour: 'rgba(15, 23, 42, 0.9)',
        toolboxForegroundColour: '#f8fafc',
        flyoutBackgroundColour: 'rgba(30, 41, 59, 0.95)',
        flyoutForegroundColour: '#f8fafc',
        flyoutOpacity: 1,
        scrollbarColour: '#3b82f6',
        scrollbarOpacity: 0.5,
    },
});

const lightTheme = Blockly.Theme.defineTheme('lightTheme', {
    name: 'lightTheme',
    base: Blockly.Themes.Classic,
    componentStyles: {
        workspaceBackgroundColour: 'transparent',
        toolboxBackgroundColour: 'rgba(241, 245, 249, 0.9)',
        toolboxForegroundColour: '#0f172a',
        flyoutBackgroundColour: 'rgba(248, 250, 252, 0.95)',
        flyoutForegroundColour: '#0f172a',
        flyoutOpacity: 1,
        scrollbarColour: '#3b82f6',
        scrollbarOpacity: 0.5,
    },
});

export interface BlocklyWorkspaceRef {
    saveWorkspace: () => void;
    loadWorkspace: () => void;
    saveToCloud: (uid: string) => void;
    loadFromCloud: (uid: string) => void;
    loadState: (state: any) => void;
}

interface Props {
    onCodeChange?: (cppCode: string, jsCode: string) => void;
    onToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    theme?: 'light' | 'dark';
    workspaceType?: 'builder' | 'circuit';
    onWorkspaceLoaded?: (state: any) => void;
}

interface PromptData {
    message: string;
    defaultValue: string;
    callback: (value: string | null) => void;
}

export const BlocklyWorkspace = React.forwardRef<BlocklyWorkspaceRef, Props>(({ onCodeChange, onToast, theme = 'dark', workspaceType = 'builder', onWorkspaceLoaded }, ref) => {
    const blocklyDiv = useRef<HTMLDivElement>(null);
    const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
    const onCodeChangeRef = useRef(onCodeChange);
    const [promptData, setPromptData] = useState<PromptData | null>(null);

    // Keep the ref updated without triggering remounts
    useEffect(() => {
        onCodeChangeRef.current = onCodeChange;
    }, [onCodeChange]);

    useEffect(() => {
        if (workspace.current) {
            workspace.current.setTheme(theme === 'light' ? lightTheme : darkTheme);
        }
    }, [theme]);

    useEffect(() => {
        if (workspace.current) {
            const selectedToolbox = workspaceType === 'circuit' ? CIRCUIT_TOOLBOX : BUILDER_TOOLBOX;
            workspace.current.updateToolbox(selectedToolbox);
        }
    }, [workspaceType]);

    React.useImperativeHandle(ref, () => ({
        saveWorkspace: () => {
            if (!workspace.current) return;
            try {
                const state = Blockly.serialization.workspaces.save(workspace.current);
                const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'project.roboai';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                if (onToast) onToast('Project saved successfully', 'success');
            } catch (e: any) {
                console.error(e);
                if (onToast) onToast('Failed to save project', 'error');
            }
        },
        loadState: (state: any) => {
            if (workspace.current) {
                workspace.current.clear();
                Blockly.serialization.workspaces.load(state, workspace.current, { recordUndo: false });
            }
        },
        loadWorkspace: () => {
            if (!workspace.current) return;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.roboai,application/json';
            input.onchange = (e: any) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const content = event.target?.result as string;
                        const state = JSON.parse(content);
                        Blockly.serialization.workspaces.load(state, workspace.current!, { recordUndo: false });
                        if (onWorkspaceLoaded) onWorkspaceLoaded(state);
                        if (onToast) onToast('Project loaded successfully', 'success');
                    } catch (err: any) {
                        console.error(err);
                        alert(err.message + '\\n' + err.stack);
                        if (onToast) onToast('Failed to load project file: ' + err.message, 'error');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        },
        saveToCloud: async (uid: string) => {
            console.log("saveToCloud called with uid:", uid);
            if (!workspace.current) {
                console.error("saveToCloud failed: workspace.current is null!");
                if (onToast) onToast('Error: Workspace not initialized', 'error');
                return;
            }
            try {
                if (onToast) onToast('Saving to cloud...', 'info');
                const state = Blockly.serialization.workspaces.save(workspace.current);
                const cleanState = JSON.parse(JSON.stringify(state));
                const docRef = doc(db, 'projects', uid);
                
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('timeout')), 5000)
                );
                
                // Race the Firebase request against a 5 second timeout
                await Promise.race([
                    setDoc(docRef, { state: cleanState, lastUpdated: new Date().toISOString() }),
                    timeoutPromise
                ]);
                
                if (onToast) onToast('Saved to True Cloud Successfully!', 'success');
            } catch (e: any) {
                console.error("Firestore Save Error:", e);
                if (e.message === 'timeout') {
                    if (onToast) onToast(`Save Timeout: Have you enabled Firestore Database in your Firebase Console?`, 'error');
                } else {
                    const msg = e.code === 'permission-denied' ? 'Permission Denied: Check Firebase Rules' : e.message;
                    if (onToast) onToast(`Save failed: ${msg}`, 'error');
                }
            }
        },
        loadFromCloud: async (uid: string) => {
            console.log("loadFromCloud called with uid:", uid);
            if (!workspace.current) {
                console.error("loadFromCloud failed: workspace.current is null!");
                if (onToast) onToast('Error: Workspace not initialized', 'error');
                return;
            }
            try {
                if (onToast) onToast('Loading from cloud...', 'info');
                const docRef = doc(db, 'projects', uid);
                
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('timeout')), 5000)
                );
                
                const docSnap: any = await Promise.race([
                    getDoc(docRef),
                    timeoutPromise
                ]);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    workspace.current.clear();
                    Blockly.serialization.workspaces.load(data.state, workspace.current, { recordUndo: false });
                    if (onWorkspaceLoaded) onWorkspaceLoaded(data.state);
                    if (onToast) onToast('Loaded from True Cloud!', 'success');
                } else {
                    workspace.current.clear();
                    if (onToast) onToast('No cloud save found for this account.', 'info');
                }
            } catch (e: any) {
                console.error("Firestore Load Error:", e);
                if (e.message === 'timeout') {
                    if (onToast) onToast(`Load Timeout: Have you enabled Firestore Database in your Firebase Console?`, 'error');
                } else {
                    const msg = e.code === 'permission-denied' ? 'Permission Denied: Check Firebase Rules' : e.message;
                    if (onToast) onToast(`Load failed: ${msg}`, 'error');
                }
            }
        }
    }));

    useEffect(() => {
        // Override the default browser prompt for a beautiful custom React modal
        Blockly.dialog.setPrompt((message, defaultValue, callback) => {
            setPromptData({ message, defaultValue, callback });
        });

        if (blocklyDiv.current && !workspace.current) {
            const selectedToolbox = workspaceType === 'circuit' ? CIRCUIT_TOOLBOX : BUILDER_TOOLBOX;
            workspace.current = Blockly.inject(blocklyDiv.current, {
                toolbox: selectedToolbox,
                theme: theme === 'light' ? lightTheme : darkTheme,
                grid: {
                    spacing: 25,
                    length: 3,
                    colour: 'rgba(255, 255, 255, 0.1)',
                    snap: true,
                },
                zoom: {
                    controls: true,
                    wheel: true,
                    startScale: 1.0,
                    maxScale: 3,
                    minScale: 0.3,
                    scaleSpeed: 1.2,
                },
                trashcan: true,
            });

            // Workspace starts empty
            if (workspaceType === 'builder' || workspaceType === 'circuit') {
                const project1 = {
                    "blocks": {
                        "languageVersion": 0,
                        "blocks": [
                            {
                                "type": "text_print",
                                "id": "project1_print",
                                "x": 50,
                                "y": 50,
                                "inputs": {
                                    "TEXT": {
                                        "block": {
                                            "type": "roboai_sensor_imu",
                                            "id": "project1_imu",
                                            "fields": {
                                                "AXIS": "AX"
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                };
                Blockly.serialization.workspaces.load(project1, workspace.current);
            }

            // Register custom category callback to combine standard and custom variable blocks
            workspace.current.registerToolboxCategoryCallback('MY_VARIABLE_CATEGORY', (ws: Blockly.Workspace) => {
                const xmlList: Element[] = [];
                
                // Get standard variable blocks
                const standardVars = (Blockly.Variables.flyoutCategory as any)(ws);
                for (let i = 0; i < standardVars.length; i++) {
                    xmlList.push(standardVars[i]);
                }
                
                // Add separator
                const sep = document.createElement('sep');
                sep.setAttribute('gap', '24');
                xmlList.push(sep);
                
                // Add custom inline variable blocks
                const setBlock = document.createElement('block');
                setBlock.setAttribute('type', 'variables_set_inline');
                xmlList.push(setBlock);
                
                const getBlock = document.createElement('block');
                getBlock.setAttribute('type', 'variables_get_inline');
                xmlList.push(getBlock);
                
                return xmlList;
            });

            // Handle code generation events
            const generateAndNotify = () => {
                if (workspace.current && onCodeChangeRef.current) {
                    let cppCode = "// Error generating C++ code\n";
                    let jsCode = "";

                    try {
                        cppCode = cppGenerator.workspaceToCode(workspace.current);
                    } catch (e: any) {
                        cppCode += "// " + e.message + "\n// Some standard blocks might not have C++ translations yet.";
                    }

                    try {
                        jsCode = javascriptGenerator.workspaceToCode(workspace.current);
                    } catch (e: any) {
                        console.error("Javascript generator error:", e);
                    }

                    onCodeChangeRef.current(cppCode, jsCode);
                }
            };

            workspace.current.addChangeListener(generateAndNotify);
            
            // Trigger initial generation for the demo code loaded
            generateAndNotify();

            // Handle container resize using ResizeObserver so it responds to CSS display changes
            const resizeObserver = new ResizeObserver(() => {
                if (workspace.current) {
                    Blockly.svgResize(workspace.current);
                }
            });
            
            if (blocklyDiv.current) {
                resizeObserver.observe(blocklyDiv.current);
            }

            return () => {
                resizeObserver.disconnect();
                if (workspace.current) {
                    workspace.current.dispose();
                    workspace.current = null;
                }
            };
        }
    }, []); // Empty dependency array prevents workspace destruction on code edit

    return (
        <>
            <div
                ref={blocklyDiv}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px'
                }}
            />
            {promptData && (
                <div className="prompt-overlay">
                    <div className="prompt-modal">
                        <h3 style={{ margin: '0 0 8px 0', color: 'var(--accent-purple)' }}>{promptData.message}</h3>
                        <input
                            autoFocus
                            className="prompt-input"
                            defaultValue={promptData.defaultValue}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') {
                                    promptData.callback(e.currentTarget.value);
                                    setPromptData(null);
                                }
                                if (e.key === 'Escape') {
                                    promptData.callback(null);
                                    setPromptData(null);
                                }
                            }}
                            ref={(input) => { if (input) input.focus(); }}
                        />
                        <div className="prompt-actions">
                            <button className="btn btn-outline" onClick={() => {
                                promptData.callback(null);
                                setPromptData(null);
                            }}>Cancel</button>
                            <button className="btn btn-primary" onClick={(e) => {
                                const inputElement = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                                promptData.callback(inputElement ? inputElement.value : null);
                                setPromptData(null);
                            }}>OK</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});
