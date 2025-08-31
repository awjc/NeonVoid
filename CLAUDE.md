# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeonVoid is a WebGL application that displays glowing neon shapes (cubes, spheres) with RGB LED colors and bloom/glow effects against a dark background.

## Technology Stack

- Pure JavaScript (ES6+) - No build process required
- WebGL for 3D rendering
- HTML5 Canvas
- CSS3 for UI styling

## Development Setup

No build tools required. Simply open `index.html` in a modern web browser that supports WebGL.

To run locally:
```bash
# Using the included Python server (recommended):
python server.py

# Or serve with any static file server:
python -m http.server 8000
# or
npx serve .
```

The included `server.py` will automatically open your browser to the application.

## Project Structure

```
/
├── index.html          # Main HTML page with canvas and controls
├── styles.css          # Dark theme styling with neon UI elements
└── js/
    ├── main.js         # Application entry point and controls
    ├── renderer.js     # Main WebGL renderer with bloom effects
    ├── shaders.js      # Vertex and fragment shaders for rendering and post-processing
    ├── geometry.js     # 3D geometry generators (cube, sphere)
    └── webgl-utils.js  # WebGL utility functions
```

## Architecture

### Core Components

- **NeonVoidApp**: Main application class handling initialization and controls
- **NeonRenderer**: WebGL renderer implementing:
  - Scene rendering with lighting and glow effects
  - Multi-pass bloom post-processing pipeline
  - Framebuffer management for effects
- **Geometry**: Static geometry generators for 3D shapes
- **Shaders**: GLSL shader definitions for rendering and effects

### Rendering Pipeline

1. Render scene to framebuffer with glow materials
2. Extract bright areas for bloom effect
3. Apply gaussian blur to bloom texture
4. Composite final image with bloom overlay

### WebGL Features Used

- Vertex/Fragment shaders for custom lighting
- Framebuffer objects for post-processing
- Multiple render targets for bloom pipeline
- Matrix transformations for 3D positioning
- "remember to update the version string in index.html after each batch of actions. v1234 should be incremented and replaced with v1235, for example"