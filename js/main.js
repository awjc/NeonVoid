class NeonVoidApp {
    constructor() {
        this.canvas = document.getElementById('glCanvas');
        this.renderer = null;
        this.animationId = null;

        this.init();
        this.setupControls();
        this.start();
    }

    init() {
        try {
            this.renderer = new NeonRenderer(this.canvas);
            console.log('NeonVoid initialized successfully');
            console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
            console.log('WebGL context:', this.renderer.gl.getParameter(this.renderer.gl.VERSION));
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

        this.handleResize();
    }

    handleResize() {
        const canvas = this.canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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

// Start the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new NeonVoidApp();
});