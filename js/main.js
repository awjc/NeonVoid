class NeonVoidApp {
    constructor() {
        this.canvas = document.getElementById('glCanvas');
        this.renderer = null;
        this.animationId = null;

        this.init();
    }

    async init() {
        try {
            // Load shaders first
            await shaderManager.loadAll();

            // Now initialize the renderer
            this.renderer = new NeonRenderer(this.canvas);
            console.log('NeonVoid initialized successfully');
            console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
            console.log('WebGL context:', this.renderer.gl.getParameter(this.renderer.gl.VERSION));

            // Setup controls and start after renderer is ready
            this.setupControls();
            this.start();
        } catch (error) {
            console.error('Failed to initialize NeonVoid:', error);
            console.error('Error stack:', error.stack);
            this.showError('WebGL not supported or failed to initialize: ' + error.message);
        }
    }

    setupControls() {
        const shapeSelect = document.getElementById('shapeSelect');
        const colorSelect = document.getElementById('colorSelect');

        // Set initial values from dropdown state
        if (this.renderer) {
            this.renderer.setShape(shapeSelect.value);
            this.renderer.setColor(colorSelect.value);
        }

        shapeSelect.addEventListener('change', (e) => {
            if (this.renderer) {
                this.renderer.setShape(e.target.value);
            }
        });

        colorSelect.addEventListener('change', (e) => {
            if (this.renderer) {
                this.renderer.setColor(e.target.value);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Add zoom controls
        this.setupZoomControls();

        this.handleResize();
    }

    setupZoomControls() {
        // Desktop: Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            if (this.renderer) {
                const zoomSpeed = 0.1;
                const zoomDelta = e.deltaY > 0 ? zoomSpeed : -zoomSpeed;
                this.renderer.adjustZoom(zoomDelta);
            }
        }, { passive: false });

        // Mobile: Touch events for pinch zoom
        let touches = [];
        let lastDistance = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touches = Array.from(e.touches);
            if (touches.length === 2) {
                lastDistance = this.getTouchDistance(touches[0], touches[1]);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            touches = Array.from(e.touches);

            if (touches.length === 2 && this.renderer) {
                const currentDistance = this.getTouchDistance(touches[0], touches[1]);
                const deltaDistance = currentDistance - lastDistance;

                const zoomSpeed = 0.01;
                const zoomDelta = -deltaDistance * zoomSpeed; // Invert for natural feel
                this.renderer.adjustZoom(zoomDelta);

                lastDistance = currentDistance;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            touches = Array.from(e.touches);
            if (touches.length < 2) {
                lastDistance = 0;
            }
        }, { passive: false });

        // Global touch handler to prevent any remaining zoom gestures
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false });

        // Prevent double-tap zoom
        document.addEventListener('touchend', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handleResize() {
        const canvas = this.canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log('Canvas resized to:', canvas.width, 'x', canvas.height);

        // Force framebuffer recreation if renderer exists
        if (this.renderer) {
            this.renderer.setupFramebuffers();
        }
    }

    start() {
        if (!this.renderer) return;

        const animate = () => {
            this.renderer.render();
            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    showError(message) {
        const canvas = this.canvas;
        canvas.style.display = 'none';

        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff4444;
            font-family: Arial, sans-serif;
            font-size: 18px;
            text-align: center;
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #ff4444;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
}

import { shaderManager } from './shaders.js';
import { NeonRenderer } from './renderer.js';

// Start the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new NeonVoidApp();
});
