const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getPlatformInfo: () => ipcRenderer.invoke('platform-info'),
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // File operations (for future use)
  openFile: () => ipcRenderer.invoke('dialog-open-file'),
  saveFile: (content) => ipcRenderer.invoke('dialog-save-file', content),
  
  // Terminal operations (for future terminal functionality)
  createTerminal: (options) => ipcRenderer.invoke('terminal-create', options),
  writeToTerminal: (id, data) => ipcRenderer.invoke('terminal-write', id, data),
  resizeTerminal: (id, cols, rows) => ipcRenderer.invoke('terminal-resize', id, cols, rows),
  
  // Event listeners
  onTerminalData: (callback) => {
    ipcRenderer.on('terminal-data', (event, ...args) => callback(...args));
  },
  
  onTerminalExit: (callback) => {
    ipcRenderer.on('terminal-exit', (event, ...args) => callback(...args));
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Expose a limited set of Node.js APIs for development
contextBridge.exposeInMainWorld('nodeAPI', {
  platform: process.platform,
  arch: process.arch,
  versions: process.versions
});

// Security: Log any attempts to access Node.js APIs directly
if (process.contextIsolated) {
  console.log('Context isolation is enabled - secure communication established');
} else {
  console.warn('Context isolation is disabled - security risk!');
}