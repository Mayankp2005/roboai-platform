@echo off
echo Creating build directory...
mkdir build 2>nul
echo Copying the AI generated icon...
copy "C:\Users\mayan\.gemini\antigravity\brain\6e39faba-a672-4964-b557-215ed0855ce3\roboai_icon_1778491401999.png" "build\icon.png"

echo Installing necessary Electron dependencies...
call npm install

echo Building the portable .exe file...
call npm run electron:build

echo =======================================================
echo Build Complete! 
echo You can find your new standalone executable file in:
echo %CD%\dist_electron\
echo =======================================================
pause
