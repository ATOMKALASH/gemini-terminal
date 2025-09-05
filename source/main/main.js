const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Hot reload removed - use npm run dev for SASS watching only

class MainWindow {
  constructor() {
    this.window = null;
    this.createWindow();
  }

  createWindow() {
    // Create the browser window with security best practices
    this.window = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false, // Don't show until ready-to-show
      frame: false, // Remove default frame for custom titlebar
      icon: path.join(__dirname, '..', 'assets', 'icons', 'icon.png'),
      titleBarStyle: 'hidden',
      webPreferences: {
        // Security: Enable context isolation
        contextIsolation: true,
        // Security: Disable node integration in renderer
        nodeIntegration: false,
        // Security: Disable remote module
        enableRemoteModule: false,
        // Security: Enable sandbox
        sandbox: false, // Set to true for maximum security, false if you need Node.js APIs
        // Preload script for secure communication
        preload: path.join(__dirname, 'preload.js'),
        // Security: Disable web security in development only
        webSecurity: !isDev
      }
    });

    // Load the app
    const startUrl = isDev 
      ? 'file://' + path.join(__dirname, '..', 'renderer', 'index.html')
      : 'file://' + path.join(__dirname, '..', 'renderer', 'index.html');
    
    this.window.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

    // Show window when ready to prevent visual flash
    this.window.once('ready-to-show', () => {
      this.window.show();
      
      // Focus on window
      if (isDev) {
        this.window.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.window.on('closed', () => {
      this.window = null;
    });

    // Security: Prevent new window creation
    this.window.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Security: Prevent navigation to external URLs
    this.window.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      
      if (parsedUrl.origin !== 'file://') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    });
  }

  getWindow() {
    return this.window;
  }
}

// App event handlers
app.whenReady().then(() => {
  // Create main window
  const mainWindow = new MainWindow();

  // Set application menu (remove default menu for security)
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      new MainWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // macOS: Keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation from renderer
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// IPC handlers for secure communication
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('platform-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.version
  };
});

// Window control handlers
ipcMain.handle('window-minimize', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    if (focusedWindow.isMaximized()) {
      focusedWindow.unmaximize();
    } else {
      focusedWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.close();
  }
});

// Handle app certificate errors (for development)
if (isDev) {
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
  });
}