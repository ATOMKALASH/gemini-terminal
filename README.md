# Gemini Terminal

AI Enhanced Smart Terminal built with Electron

## Features

- Modern, clean UI with dark theme
- Secure Electron architecture with context isolation
- Cross-platform support (Windows, macOS, Linux)
- Ready for terminal and AI integration
- Hot reload in development mode

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building

- Build for current platform: `npm run build`
- Build for Windows: `npm run build:win`
- Build for macOS: `npm run build:mac`
- Build for Linux: `npm run build:linux`

## Project Structure

```
source/
├── main/           # Main Electron process
│   ├── main.js     # Application entry point
│   └── preload.js  # Secure preload script
├── renderer/       # Renderer process (UI)
│   ├── index.html  # Main HTML file
│   ├── java/       # JavaScript files
│   └── sass/       # Stylesheets
├── config/         # Configuration files
└── assets/         # Static assets
```

## Security

This application follows Electron security best practices:

- Context isolation enabled
- Node integration disabled in renderer
- Secure preload script for IPC communication
- Content Security Policy implemented
- External URL navigation prevented

## Development

- `npm start` - Start the application
- `npm run dev` - Start with hot reload and dev tools
- `npm run sass:watch` - Watch SASS files for changes
- `npm run sass:build` - Build SASS to CSS

## License

MIT License - see LICENSE file for details