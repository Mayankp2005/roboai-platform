const { app, BrowserWindow, shell, session, Menu } = require('electron');
const path = require('path');
const url = require('url');

// IMPORTANT: Define this globally so server.js can know it's running in Electron
global.isElectron = true;


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    show: false, // Don't show until ready-to-show
    autoHideMenuBar: true, // Hide the native menu bar to keep the UI clean but keep shortcuts active
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../build/icon.png')
  });

  // Enable copy/paste in Electron by defining an application menu with EXPLICIT accelerators
  const template = [
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));


  // Start the backend compile server
  try {
    require('../compile-server/server.js');
    console.log('Compile server started from Electron.');
  } catch (error) {
    console.error('Failed to start compile server:', error);
  }

  // Load the React app
  const isDev = !app.isPackaged;
  if (isDev) {
    // In dev mode, wait for Vite to start and load it
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools automatically in dev
  // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built static files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });



  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });


  // Handle Hardware Connections (Web Serial & Web Bluetooth)
  const session = mainWindow.webContents.session;

  // CRITICAL: Clear cache on startup to prevent stale Vite bundles!
  session.clearCache().then(() => {
      console.log('Electron Cache cleared successfully.');
  });

  // Native Context Menu for Right-Click (Copy/Paste)
  mainWindow.webContents.on('context-menu', (event, params) => {
    const contextMenu = Menu.buildFromTemplate([
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { type: 'separator' },
      { role: 'selectAll' }
    ]);
    contextMenu.popup({ window: mainWindow });
  });

  session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => true);
  session.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });
  session.setDevicePermissionHandler((details) => true);

  // Replicate Chrome's Serial Port chooser
  session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();
    if (portList && portList.length > 0) {
      const { dialog } = require('electron');
      const options = portList.map(p => `${p.portName} (${p.displayName || 'USB Serial'})`);
      dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: [...options, 'Cancel'],
        title: 'Select Hardware Port',
        message: 'Please select your ESP32 device from the list:',
      }).then(result => {
        if (result.response < portList.length) {
          callback(portList[result.response].portId);
        } else {
          callback('');
        }
      });
    } else {
      require('electron').dialog.showErrorBox('No Devices Found', 'Could not find any connected serial devices. Please ensure the ESP32 is plugged in via USB.');
      callback('');
    }
  });

  // Replicate Chrome's Bluetooth device chooser
  session.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    if (deviceList && deviceList.length > 0) {
      const { dialog } = require('electron');
      const options = deviceList.map(d => d.deviceName || d.deviceId);
      dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: [...options, 'Cancel'],
        title: 'Select Bluetooth Device',
        message: 'Please select the ESP32 robot:',
      }).then(result => {
        if (result.response < deviceList.length) {
          callback(deviceList[result.response].deviceId);
        } else {
          callback('');
        }
      });
    } else {
      callback('');
    }
  });
}

// Ensure single instance
const gotTheLock = true; // TEMPORARILY BYPASSED
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });
}
