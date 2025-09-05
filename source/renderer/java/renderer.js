// Renderer process JavaScript
// This file handles the UI interactions and communicates with the main process

class GeminiTerminalApp {
    constructor() {
        this.isReady = false;
        this.terminals = new Map();
        this.activeTerminal = null;
        this.tabCounter = 0;
        
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

        // New Tab button
        const newTabBtn = document.getElementById('new-tab-btn');
        if (newTabBtn) {
            newTabBtn.addEventListener('click', () => this.createNewTab());
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
        // Ctrl+Shift+T: New Terminal Tab
        if (event.ctrlKey && event.shiftKey && event.key === 'T') {
            event.preventDefault();
            this.createNewTab();
        }

        // Ctrl+W: Close current tab
        if (event.ctrlKey && event.key === 'w') {
            event.preventDefault();
            if (this.activeTerminal) {
                this.closeTab(this.activeTerminal);
            }
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
            }

            // Create first tab
            this.createNewTab();
            
        } catch (error) {
            console.error('Error creating terminal:', error);
            this.showError('Failed to create terminal');
        }
    }

    createNewTab() {
        console.log('Creating new tab...');
        
        try {
            this.tabCounter++;
            const tabId = `terminal-${this.tabCounter}`;
            const tabName = `Terminal ${this.tabCounter.toString().padStart(2, '0')}`;
            
            // Create tab element
            const tab = this.createTabElement(tabId, tabName);
            
            // Create terminal pane
            const pane = this.createTerminalPane(tabId);
            
            // Add to containers
            const tabsContainer = document.getElementById('tabs-container');
            const terminalContent = document.getElementById('terminal-content');
            
            if (tabsContainer && terminalContent) {
                tabsContainer.appendChild(tab);
                terminalContent.appendChild(pane);
                
                // Switch to new tab
                this.switchToTab(tabId);
                
                // Store terminal reference
                this.terminals.set(tabId, {
                    id: tabId,
                    name: tabName,
                    element: pane,
                    tab: tab
                });
                
                this.updateStatus(`Created ${tabName}`);
            }
            
        } catch (error) {
            console.error('Error creating tab:', error);
            this.showError('Failed to create tab');
        }
    }

    createTabElement(tabId, tabName) {
        const tab = document.createElement('button');
        tab.className = 'terminal-tab';
        tab.dataset.tabId = tabId;
        
        tab.innerHTML = `
            <span class="tab-title">${tabName}</span>
            <button class="tab-close" title="Close tab">
                <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            </button>
        `;
        
        // Add event listeners
        tab.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                this.switchToTab(tabId);
            }
        });
        
        const closeBtn = tab.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tabId);
        });
        
        return tab;
    }

    createTerminalPane(tabId) {
        const pane = document.createElement('div');
        pane.className = 'terminal-pane';
        pane.dataset.tabId = tabId;
        
        pane.innerHTML = `
            <div class="terminal-placeholder">
                Terminal functionality will be implemented here
                <br><br>
                <small>Tab ID: ${tabId}</small>
            </div>
        `;
        
        return pane;
    }

    switchToTab(tabId) {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.terminal-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.terminal-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        // Add active class to selected tab and pane
        const selectedTab = document.querySelector(`[data-tab-id="${tabId}"]`);
        const selectedPane = document.querySelector(`.terminal-pane[data-tab-id="${tabId}"]`);
        
        if (selectedTab && selectedPane) {
            selectedTab.classList.add('active');
            selectedPane.classList.add('active');
            this.activeTerminal = tabId;
            
            const terminal = this.terminals.get(tabId);
            if (terminal) {
                this.updateStatus(`Active: ${terminal.name}`);
            }
        }
    }

    closeTab(tabId) {
        const terminal = this.terminals.get(tabId);
        if (!terminal) return;
        
        // Remove elements
        terminal.tab.remove();
        terminal.element.remove();
        
        // Remove from terminals map
        this.terminals.delete(tabId);
        
        // Renumber remaining tabs
        this.renumberTabs();
        
        // If this was the active terminal, switch to another tab
        if (this.activeTerminal === tabId) {
            const remainingTabs = Array.from(this.terminals.keys());
            if (remainingTabs.length > 0) {
                this.switchToTab(remainingTabs[0]);
            } else {
                this.activeTerminal = null;
                this.updateStatus('No active terminals');
                
                // Show welcome screen if no tabs left
                const welcomeScreen = document.querySelector('.welcome-screen');
                const terminalContainer = document.getElementById('terminal-container');
                
                if (welcomeScreen && terminalContainer) {
                    welcomeScreen.style.display = 'flex';
                    terminalContainer.style.display = 'none';
                }
            }
        }
        
        this.updateStatus(`Closed ${terminal.name}`);
    }

    renumberTabs() {
        const tabElements = document.querySelectorAll('.terminal-tab');
        const paneElements = document.querySelectorAll('.terminal-pane');
        
        // Create new terminals map with renumbered entries
        const newTerminals = new Map();
        let counter = 1;
        
        tabElements.forEach((tabElement, index) => {
            const oldTabId = tabElement.dataset.tabId;
            const oldTerminal = this.terminals.get(oldTabId);
            
            if (oldTerminal) {
                // Create new IDs and names
                const newTabId = `terminal-${counter}`;
                const newTabName = `Terminal ${counter.toString().padStart(2, '0')}`;
                
                // Update tab element
                tabElement.dataset.tabId = newTabId;
                const tabTitle = tabElement.querySelector('.tab-title');
                if (tabTitle) {
                    tabTitle.textContent = newTabName;
                }
                
                // Update pane element
                const paneElement = paneElements[index];
                if (paneElement) {
                    paneElement.dataset.tabId = newTabId;
                    
                    // Update placeholder text to show new tab ID
                    const placeholder = paneElement.querySelector('.terminal-placeholder small');
                    if (placeholder) {
                        placeholder.textContent = `Tab ID: ${newTabId}`;
                    }
                }
                
                // Update close button event listener
                const closeBtn = tabElement.querySelector('.tab-close');
                if (closeBtn) {
                    // Remove old event listener by cloning the element
                    const newCloseBtn = closeBtn.cloneNode(true);
                    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                    
                    // Add new event listener with correct tabId
                    newCloseBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.closeTab(newTabId);
                    });
                }
                
                // Update tab click event listener
                const newTabElement = tabElement.cloneNode(true);
                tabElement.parentNode.replaceChild(newTabElement, tabElement);
                
                newTabElement.addEventListener('click', (e) => {
                    if (!e.target.closest('.tab-close')) {
                        this.switchToTab(newTabId);
                    }
                });
                
                // Re-add close button listener to the cloned element
                const newCloseBtn2 = newTabElement.querySelector('.tab-close');
                if (newCloseBtn2) {
                    newCloseBtn2.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.closeTab(newTabId);
                    });
                }
                
                // Store in new terminals map
                newTerminals.set(newTabId, {
                    id: newTabId,
                    name: newTabName,
                    element: paneElement,
                    tab: newTabElement
                });
                
                // Update active terminal reference if needed
                if (this.activeTerminal === oldTabId) {
                    this.activeTerminal = newTabId;
                }
                
                counter++;
            }
        });
        
        // Replace terminals map
        this.terminals = newTerminals;
        
        // Update tab counter for next new tab
        this.tabCounter = counter - 1;
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