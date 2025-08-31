// Shader loader utility
async function loadShader(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load shader: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error loading shader from ${url}:`, error);
        throw error;
    }
}

// Shader manager class
class ShaderManager {
    constructor() {
        this.shaders = {};
        this.loaded = false;
    }

    async loadAll() {
        if (this.loaded) return this.shaders;

        try {
            const [vertex, fragment, bloomVertex, bloomFragment, blur, composite] = await Promise.all([
                loadShader('./js/shaders/vertex.glsl'),
                loadShader('./js/shaders/fragment.glsl'),
                loadShader('./js/shaders/bloom-vertex.glsl'),
                loadShader('./js/shaders/bloom-fragment.glsl'),
                loadShader('./js/shaders/blur.glsl'),
                loadShader('./js/shaders/composite.glsl')
            ]);

            this.shaders = {
                vertex,
                fragment,
                bloomVertexShader: bloomVertex,
                bloomFragmentShader: bloomFragment,
                blurFragmentShader: blur,
                compositeFragmentShader: composite
            };

            this.loaded = true;
            console.log('All shaders loaded successfully');
            return this.shaders;
        } catch (error) {
            console.error('Failed to load shaders:', error);
            throw error;
        }
    }

    getShaders() {
        if (!this.loaded) {
            throw new Error('Shaders not loaded yet. Call loadAll() first.');
        }
        return this.shaders;
    }

    isLoaded() {
        return this.loaded;
    }
}

// Create and export the shader manager instance
const shaderManager = new ShaderManager();

// Legacy compatibility - maintain the Shaders object for existing code
// This will be populated after loadAll() is called
const Shaders = new Proxy({}, {
    get(target, prop) {
        if (!shaderManager.isLoaded()) {
            console.warn('Accessing shader before loading. Make sure to call shaderManager.loadAll() first.');
            return '';
        }
        return shaderManager.getShaders()[prop] || '';
    }
});

// Export both the manager and the legacy Shaders object
export { shaderManager, Shaders };
