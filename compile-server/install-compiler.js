const { execSync } = require('child_process');
const fs = require('fs');

try {
    console.log("🚀 [1/6] Downloading the official Arduino CLI...");
    execSync(`powershell -Command "Invoke-WebRequest -Uri 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip' -OutFile 'arduino-cli.zip'"`, { stdio: 'inherit' });

    console.log("\n📦 [2/6] Extracting the Arduino CLI...");
    execSync(`powershell -Command "Expand-Archive -Path 'arduino-cli.zip' -DestinationPath '.' -Force"`, { stdio: 'inherit' });

    console.log("\n⚙️ [3/6] Initializing compiler config...");
    execSync(`.\\arduino-cli.exe config init`, { stdio: 'inherit' });

    console.log("\n🌐 [4/6] Adding ESP32 source URL...");
    execSync(`.\\arduino-cli.exe config add board_manager.additional_urls https://espressif.github.io/arduino-esp32/package_esp32_index.json`, { stdio: 'inherit' });

    console.log("\n🔄 [5/6] Updating package index...");
    execSync(`.\\arduino-cli.exe core update-index`, { stdio: 'inherit' });

    console.log("\n⏳ [6/6] Installing ESP32 compiler files... (this will download ~500MB, please be patient!)");
    execSync(`.\\arduino-cli.exe core install esp32:esp32`, { stdio: 'inherit' });

    console.log("\n🧹 Cleaning up downloaded zip...");
    if (fs.existsSync('arduino-cli.zip')) {
        fs.unlinkSync('arduino-cli.zip');
    }

    console.log("\n✅ ALL DONE! The compiler is fully installed locally.");
    console.log("You can now start the server by running: node server.js");
} catch (error) {
    console.error("\n❌ An error occurred during installation:", error.message);
}
