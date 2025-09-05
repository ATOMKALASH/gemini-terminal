// Renderer process JavaScript
// This file handles the UI interactions and communicates with the main process

class GeminiTerminalApp {
    constructor() {
        this.isReady = false;
        this.terminals = new Map();
        this.activeTerminal = null;
        
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    async setup() {
        console.log('Setting up Gemini Terminal App...');
        
        // Load app information
        await this.loadAppInfo();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup window controls
        this.setupWindowControls();
        
        this.isReady = true;
        console.log('Gemini Terminal App ready!');
    }

    async loadAppInfo() {
        try {
            // Load app version
            if (window.electronAPI && window.electronAPI.getAppVersion) {
                const version = await window.electronAPI.getAppVersion();
                document.getElementById('app-version').textContent = version;
            }

            // Load platform info
            if (window.electronAPI && window.electronAPI.getPlatformInfo) {
                const platformInfo = await window.electronAPI.getPlatformInfo();
                document.getElementById('platform-info').textContent = 
                    `${platformInfo.platform} ${platformInfo.arch}`;
            }
        } catch (error) {
            console.error('Error loading app info:', error);
            document.getElementById('app-version').textContent = 'Unknown';
            document.getElementById('platform-info').textContent = 'Unknown';
        }
    }

    setupEventListeners() {
        // New Terminal button
        const newTerminalBtn = document.getElementById('new-terminal-btn');
        if (newTerminalBtn) {
            newTerminalBtn.addEventListener('click', () => this.createNewTerminal());
        }

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    setupWindowControls() {
        // Minimize button
        const minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                if (window.electronAPI && window.electronAPI.minimize) {
                    window.electronAPI.minimize();
                }
            });
        }

        // Maximize button
        const maximizeBtn = document.getElementById('maximize-btn');
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                if (window.electronAPI && window.electronAPI.maximize) {
                    window.electronAPI.maximize();
                }
            });
        }

        // Close button
        const closeBtn = document.getElementById('close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (window.electronAPI && window.electronAPI.close) {
                    window.electronAPI.close();
                }
            });
        }
    }

    handleKeyboardShortcuts(event) {
        // Ctrl+Shift+T: New Terminal
        if (event.ctrlKey && event.shiftKey && event.key === 'T') {
            event.preventDefault();
            this.createNewTerminal();
        }

        // Ctrl+Shift+I: Toggle DevTools (handled by main process)
        if (event.ctrlKey && event.shiftKey && event.key === 'I') {
            event.preventDefault();
            // DevTools toggle is handled in main process
        }

        // Escape: Close current modal/dialog
        if (event.key === 'Escape') {
            this.closeModals();
        }
    }

    async createNewTerminal() {
        console.log('Creating new terminal...');
        
        try {
            // Hide welcome screen and show terminal container
            const welcomeScreen = document.querySelector('.welcome-screen');
            const terminalContainer = document.getElementById('terminal-container');
            
            if (welcomeScreen) {
                welcomeScreen.style.display = 'none';
            }
            
            if (terminalContainer) {
                terminalContainer.style.display = 'block';
                terminalContainer.innerHTML = '<div class="terminal-placeholder">Terminal functionality will be implemented here</div>';
            }

            // Update status
            this.updateStatus('Terminal created');
            
        } catch (error) {
            console.error('Error creating terminal:', error);
            this.showError('Failed to create terminal');
        }
    }

    openSettings() {
        console.log('Opening settings...');
        this.showInfo('Settings panel will be implemented in future versions');
    }

    closeModals() {
        // Close any open modals or dialogs
        const modals = document.querySelectorAll('.modal, .dialog');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    updateStatus(message) {
        const statusItems = document.querySelectorAll('.status-item');
        if (statusItems.length > 0) {
            statusItems[0].textContent = message;
        }
    }

    showError(message) {
        console.error(message);
        this.updateStatus(`Error: ${message}`);
        
        // You could implement a toast notification system here
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        console.info(message);
        this.updateStatus(message);
        
        // You could implement a toast notification system here
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Simple notification system - could be enhanced with a proper toast library
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#ff4444' : '#4444ff'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    // Utility method to check if Electron APIs are available
    isElectronAvailable() {
        return typeof window.electronAPI !== 'undefined';
    }

    // Utility method to check if Node APIs are available
    isNodeAvailable() {
        return typeof window.nodeAPI !== 'undefined';
    }
}

// Initialize the app when the script loads
const app = new GeminiTerminalApp();

// Add some CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .terminal-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 18px;
        color: #666;
        background: #1e1e1e;
        border-radius: 8px;
        margin: 20px;
        padding: 40px;
    }
`;
document.head.appendChild(style);

// Export for potential use by other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiTerminalApp;
}