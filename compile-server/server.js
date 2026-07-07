const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const port = 3001;

// Allow the RoboAI platform to call this server
app.use(cors());
app.use(express.text({ limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

// Configuration
const FQBN = 'esp32:esp32:esp32';

// Track current compile status for heartbeat polling
let compileStatus = { busy: false, stage: 'idle', startedAt: null };

// Global persistent build directory to cache ESP32 core
const buildCacheDir = path.join(os.tmpdir(), 'roboai-build-cache');
if (!fs.existsSync(buildCacheDir)) {
    fs.mkdirSync(buildCacheDir, { recursive: true });
}
const sketchName = 'roboaisketch';
const sketchFolder = path.join(buildCacheDir, sketchName);
if (!fs.existsSync(sketchFolder)) {
    fs.mkdirSync(sketchFolder, { recursive: true });
}
const sketchPath = path.join(sketchFolder, `${sketchName}.ino`);
const buildPath = path.join(buildCacheDir, 'build');
const coreCachePath = path.join(buildCacheDir, 'core-cache');

// Heartbeat endpoint — frontend polls this to show "still compiling" progress
app.get('/status', (req, res) => {
    const elapsed = compileStatus.startedAt
        ? Math.round((Date.now() - compileStatus.startedAt) / 1000)
        : 0;
    res.json({ ...compileStatus, elapsedSeconds: elapsed });
});

// Basic health check
app.get('/ping', (req, res) => {
    res.send('pong');
});

// Endpoint to capture UI errors from the frontend
app.post('/log-error', express.text(), (req, res) => {
    const fs = require('fs');
    fs.writeFileSync('CRASH_REPORT.txt', req.body);
    console.log("!!! AGENT CAUGHT CRASH REPORT !!! Saved to CRASH_REPORT.txt");
    res.send('ok');
});

app.post('/compile', (req, res) => {
    try {
        let sourceCode = '';

        const requestedFqbn = req.body && req.body.fqbn ? req.body.fqbn : FQBN;

        // Check if it's sent as text body
        if (typeof req.body === 'string') {
            sourceCode = req.body;
        } else if (req.body && req.body.code) {
            sourceCode = req.body.code;
        } else {
            return res.status(400).json({ error: 'No C++ code provided in body' });
        }

        if (!sourceCode.trim()) {
            return res.status(400).json({ error: 'Source code is empty' });
        }

        // Ensure the sketch directory exists in case the OS cleared the temp folder
        if (!fs.existsSync(sketchFolder)) {
            fs.mkdirSync(sketchFolder, { recursive: true });
        }

        // Write the source code to the persistent sketch file
        fs.writeFileSync(sketchPath, sourceCode);

        let cliCmd = process.platform === 'win32' ? '.\\arduino-cli.exe' : './arduino-cli';
        
        // Check if running inside packaged Electron app
        if (global.isElectron && process.versions.electron && !process.defaultApp && process.argv.length > 0 && !process.argv[0].endsWith('electron.exe')) {
            // We are packaged, arduino-cli is in extraResources folder
            const resourcePath = process.resourcesPath || path.join(process.execPath, '..', 'resources');
            cliCmd = path.join(resourcePath, process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli');
            // Add quotes to handle spaces in path
            cliCmd = `"${cliCmd}"`;
        } else {
            // We are in dev mode, resolve relative to server.js
            cliCmd = path.join(__dirname, process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli');
            cliCmd = `"${cliCmd}"`;
        }

        const compileCmd = `${cliCmd} compile --fqbn ${requestedFqbn} --build-path "${buildPath}" --build-cache-path "${coreCachePath}" "${sketchFolder}"`;

        console.log(`[RoboAI] Compiling sketch in ${sketchFolder} for ${requestedFqbn}...`);
        console.log(`[RoboAI] Using cached build to speed up compilation.`);

        compileStatus = { busy: true, stage: `Compiling C++ for ${requestedFqbn}...`, startedAt: Date.now() };

        // 5 minute timeout — needed for first-time arduino-cli package downloads
        exec(compileCmd, { timeout: 5 * 60 * 1000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            compileStatus = { busy: false, stage: 'idle', startedAt: null };

            if (error) {
                console.error(`[RoboAI] Compilation error: ${error.message}`);
                console.error(stderr);
                return res.status(500).json({
                    error: 'Compilation failed',
                    details: stderr || stdout || error.message
                });
            }

            // Compilation successful, find all generated component binaries
            const isAvr = requestedFqbn.includes('avr');
            
            const appBinPath = path.join(buildPath, `${sketchName}.ino.bin`);
            const appHexPath = path.join(buildPath, `${sketchName}.ino.hex`);
            const bootBinPath = path.join(buildPath, `${sketchName}.ino.bootloader.bin`);
            const partBinPath = path.join(buildPath, `${sketchName}.ino.partitions.bin`);

            if (isAvr && fs.existsSync(appHexPath)) {
                console.log(`[RoboAI] AVR Compilation successful! Sending hex...`);
                const hexContent = fs.readFileSync(appHexPath).toString('utf-8');
                return res.json({ hex: hexContent });
            }

            if (!fs.existsSync(appBinPath)) {
                return res.status(500).json({ error: 'Binary file not found after compilation' });
            }

            console.log(`[RoboAI] ESP32 Compilation successful! Sending binaries...`);

            // Return a JSON payload with base64 encoded binaries
            const result = {
                app: fs.readFileSync(appBinPath).toString('base64'),
                bootloader: fs.existsSync(bootBinPath) ? fs.readFileSync(bootBinPath).toString('base64') : null,
                partitions: fs.existsSync(partBinPath) ? fs.readFileSync(partBinPath).toString('base64') : null
            };

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
            
            // Note: We DO NOT clean up the directory anymore! 
            // Keeping the generated .o files is what makes subsequent compilations take 2 seconds instead of 60 seconds.
        });
    } catch (err) {
        console.error('Server error during compile:', err);
        compileStatus = { busy: false, stage: 'idle', startedAt: null };
        res.status(500).json({ error: 'Internal server error during compilation', details: err.message });
    }
});



app.listen(port, () => {
    console.log(`✅ RoboAI Local Compiler Server running at http://localhost:${port}`);
    console.log(`   Board: ${FQBN}`);
    console.log(`   NOTE: First compilation downloads ESP32 board packages — this can take 1-5 minutes.`);
    console.log(`   SUPERFAST MODE ACTIVE: Build caching is enabled.`);
});
