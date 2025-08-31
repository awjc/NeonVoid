class NeonRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.setupWebGL();
        this.setupShaders();
        this.setupBuffers();
        this.setupFramebuffers();

        this.currentShape = 'cube';
        this.currentColor = [1, 0, 0]; // Red
        this.rotation = { x: 0, y: 0, z: 0 };
        this.glowIntensity = 1.8;
        this.bloomThreshold = 0.25;
        this.bloomStrength = 3.5;

        this.camera = {
            position: [0, 0, 5],
            rotation: [0, 0, 0],
            baseDistance: 5,
            minDistance: 1.5,
            maxDistance: 15
        };
    }

    setupWebGL() {
        const gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 1);
    }

    setupShaders() {
        const gl = this.gl;

        // Main shader program
        const vertexShader = WebGLUtils.createShader(gl, gl.VERTEX_SHADER, Shaders.vertex);
        const fragmentShader = WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, Shaders.fragment);
        this.program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);

        // Bloom shader programs
        const bloomVertexShader = WebGLUtils.createShader(gl, gl.VERTEX_SHADER, Shaders.bloomVertexShader);
        const bloomFragmentShader = WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, Shaders.bloomFragmentShader);
        this.bloomProgram = WebGLUtils.createProgram(gl, bloomVertexShader, bloomFragmentShader);

        const blurFragmentShader = WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, Shaders.blurFragmentShader);
        this.blurProgram = WebGLUtils.createProgram(gl, bloomVertexShader, blurFragmentShader);

        const compositeFragmentShader = WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, Shaders.compositeFragmentShader);
        this.compositeProgram = WebGLUtils.createProgram(gl, bloomVertexShader, compositeFragmentShader);

        // Get uniform and attribute locations
        this.setupAttributes();
    }

    setupAttributes() {
        const gl = this.gl;

        // Main program attributes
        this.attribs = {
            position: gl.getAttribLocation(this.program, 'a_position'),
            normal: gl.getAttribLocation(this.program, 'a_normal')
        };

        // Main program uniforms
        this.uniforms = {
            modelMatrix: gl.getUniformLocation(this.program, 'u_modelMatrix'),
            viewMatrix: gl.getUniformLocation(this.program, 'u_viewMatrix'),
            projectionMatrix: gl.getUniformLocation(this.program, 'u_projectionMatrix'),
            normalMatrix: gl.getUniformLocation(this.program, 'u_normalMatrix'),
            color: gl.getUniformLocation(this.program, 'u_color'),
            lightPosition: gl.getUniformLocation(this.program, 'u_lightPosition'),
            cameraPosition: gl.getUniformLocation(this.program, 'u_cameraPosition'),
            glowIntensity: gl.getUniformLocation(this.program, 'u_glowIntensity')
        };

        // Quad attributes for post-processing (get from each program)
        this.quadAttribs = {
            bloom: {
                position: gl.getAttribLocation(this.bloomProgram, 'a_position'),
                texCoord: gl.getAttribLocation(this.bloomProgram, 'a_texCoord')
            },
            blur: {
                position: gl.getAttribLocation(this.blurProgram, 'a_position'),
                texCoord: gl.getAttribLocation(this.blurProgram, 'a_texCoord')
            },
            composite: {
                position: gl.getAttribLocation(this.compositeProgram, 'a_position'),
                texCoord: gl.getAttribLocation(this.compositeProgram, 'a_texCoord')
            }
        };
    }

    setupBuffers() {
        this.geometries = {
            cube: this.createGeometry(Geometry.createCube()),
            sphere: this.createGeometry(Geometry.createSphere()),
            cylinder: this.createGeometry(Geometry.createCylinder()),
            pyramid: this.createGeometry(Geometry.createPyramid())
        };

        // Create quad for post-processing
        const quadData = Geometry.createQuad();
        this.quad = {
            vertexBuffer: WebGLUtils.createBuffer(this.gl, quadData.vertices),
            indexBuffer: WebGLUtils.createIndexBuffer(this.gl, quadData.indices),
            indexCount: quadData.indices.length
        };
    }

    createGeometry(data) {
        return {
            vertexBuffer: WebGLUtils.createBuffer(this.gl, data.vertices),
            indexBuffer: WebGLUtils.createIndexBuffer(this.gl, data.indices),
            indexCount: data.indices.length
        };
    }

    setupFramebuffers() {
        const gl = this.gl;
        const width = this.canvas.width || 800;
        const height = this.canvas.height || 600;

        console.log('Setting up framebuffers with size:', width, 'x', height);

        // Clean up existing framebuffers and textures
        this.cleanupFramebuffers();

        // Scene framebuffer
        this.sceneTexture = WebGLUtils.createTexture(gl, width, height);
        this.sceneFramebuffer = WebGLUtils.createFramebuffer(gl, this.sceneTexture);

        // Bloom framebuffers
        this.bloomTexture = WebGLUtils.createTexture(gl, width, height);
        this.bloomFramebuffer = WebGLUtils.createFramebuffer(gl, this.bloomTexture);

        this.blurTexture1 = WebGLUtils.createTexture(gl, width, height);
        this.blurFramebuffer1 = WebGLUtils.createFramebuffer(gl, this.blurTexture1);

        this.blurTexture2 = WebGLUtils.createTexture(gl, width, height);
        this.blurFramebuffer2 = WebGLUtils.createFramebuffer(gl, this.blurTexture2);

        // Check framebuffer completeness
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFramebuffer);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('Scene framebuffer not complete');
        }
    }

    cleanupFramebuffers() {
        const gl = this.gl;
        
        if (this.sceneFramebuffer) gl.deleteFramebuffer(this.sceneFramebuffer);
        if (this.bloomFramebuffer) gl.deleteFramebuffer(this.bloomFramebuffer);
        if (this.blurFramebuffer1) gl.deleteFramebuffer(this.blurFramebuffer1);
        if (this.blurFramebuffer2) gl.deleteFramebuffer(this.blurFramebuffer2);
        
        if (this.sceneTexture) gl.deleteTexture(this.sceneTexture);
        if (this.bloomTexture) gl.deleteTexture(this.bloomTexture);
        if (this.blurTexture1) gl.deleteTexture(this.blurTexture1);
        if (this.blurTexture2) gl.deleteTexture(this.blurTexture2);
    }

    createMatrix4() {
        return new Float32Array(16);
    }

    identity(out) {
        out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
        out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
        return out;
    }

    perspective(out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = (far + near) / (near - far); out[11] = -1;
        out[12] = 0; out[13] = 0; out[14] = (2 * far * near) / (near - far); out[15] = 0;
        return out;
    }

    rotateX(out, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = c; out[6] = -s; out[7] = 0;
        out[8] = 0; out[9] = s; out[10] = c; out[11] = 0;
        out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
        return out;
    }

    rotateY(out, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        out[0] = c; out[1] = 0; out[2] = s; out[3] = 0;
        out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
        out[8] = -s; out[9] = 0; out[10] = c; out[11] = 0;
        out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
        return out;
    }

    rotateZ(out, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        out[0] = c; out[1] = -s; out[2] = 0; out[3] = 0;
        out[4] = s; out[5] = c; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
        out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
        return out;
    }

    multiply(out, a, b) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
        const b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
        const b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
        const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

        out[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
        out[1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
        out[2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
        out[3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

        out[4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
        out[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
        out[6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
        out[7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

        out[8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
        out[9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
        out[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
        out[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

        out[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
        out[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
        out[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
        out[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

        return out;
    }

    translate(out, x, y, z) {
        out[12] = x; out[13] = y; out[14] = z;
        return out;
    }

    render() {
        const gl = this.gl;
        
        if (WebGLUtils.resizeCanvas(this.canvas)) {
            this.setupFramebuffers();
        }

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Re-enable bloom pipeline for glow effect
        try {
            // 1. Render scene to framebuffer
            this.renderScene();

            // 2. Extract bloom
            this.extractBloom();

            // 3. Blur bloom
            this.blurBloom();

            // 4. Composite final image
            this.composite();
        } catch (error) {
            console.warn('Bloom pipeline failed, falling back to direct rendering:', error);
            this.renderSceneDirect();
        }

        // Update rotations with different speeds for interesting motion
        this.rotation.x += 0.007; // Slightly slower X rotation
        this.rotation.y += 0.01;  // Standard Y rotation
        this.rotation.z += 0.004; // Slower Z rotation
    }

    renderSceneDirect() {
        const gl = this.gl;
        
        console.log('Direct render - current shape:', this.currentShape, 'color:', this.currentColor);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (!this.program) {
            console.error('Shader program is null!');
            return;
        }

        gl.useProgram(this.program);

        // Set up matrices
        const modelMatrix = this.createMatrix4();
        const viewMatrix = this.createMatrix4();
        const projectionMatrix = this.createMatrix4();
        const normalMatrix = this.createMatrix4();

        this.identity(modelMatrix);
        
        // Apply combined rotations for better 3D visibility
        const rotX = this.createMatrix4();
        const rotY = this.createMatrix4();
        const rotZ = this.createMatrix4();
        const tempMatrix = this.createMatrix4();
        
        this.rotateX(rotX, this.rotation.x);
        this.rotateY(rotY, this.rotation.y);
        this.rotateZ(rotZ, this.rotation.z);
        
        // Combine rotations: modelMatrix = rotZ * rotY * rotX
        this.multiply(tempMatrix, rotY, rotX);
        this.multiply(modelMatrix, rotZ, tempMatrix);

        this.identity(viewMatrix);
        this.translate(viewMatrix, -this.camera.position[0], -this.camera.position[1], -this.camera.position[2]);

        this.perspective(projectionMatrix, Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 100);

        // Set uniforms
        gl.uniformMatrix4fv(this.uniforms.modelMatrix, false, modelMatrix);
        gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, viewMatrix);
        gl.uniformMatrix4fv(this.uniforms.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(this.uniforms.normalMatrix, false, modelMatrix);
        gl.uniform3fv(this.uniforms.color, this.currentColor);
        gl.uniform3fv(this.uniforms.lightPosition, [2, 2, 2]);
        gl.uniform3fv(this.uniforms.cameraPosition, this.camera.position);
        gl.uniform1f(this.uniforms.glowIntensity, this.glowIntensity);

        // Render geometry
        const geometry = this.geometries[this.currentShape];
        
        if (!geometry) {
            console.error('Geometry not found for shape:', this.currentShape);
            console.log('Available geometries:', Object.keys(this.geometries));
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer);

        gl.enableVertexAttribArray(this.attribs.position);
        gl.enableVertexAttribArray(this.attribs.normal);

        gl.vertexAttribPointer(this.attribs.position, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(this.attribs.normal, 3, gl.FLOAT, false, 24, 12);

        console.log('About to draw', geometry.indexCount, 'triangles');
        gl.drawElements(gl.TRIANGLES, geometry.indexCount, gl.UNSIGNED_SHORT, 0);
        
        // Check for WebGL errors
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
            console.error('WebGL error during draw:', error);
        }
    }

    renderScene() {
        const gl = this.gl;
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFramebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.program);

        // Set up matrices
        const modelMatrix = this.createMatrix4();
        const viewMatrix = this.createMatrix4();
        const projectionMatrix = this.createMatrix4();
        const normalMatrix = this.createMatrix4();

        this.identity(modelMatrix);
        
        // Apply combined rotations for better 3D visibility
        const rotX = this.createMatrix4();
        const rotY = this.createMatrix4();
        const rotZ = this.createMatrix4();
        const tempMatrix = this.createMatrix4();
        
        this.rotateX(rotX, this.rotation.x);
        this.rotateY(rotY, this.rotation.y);
        this.rotateZ(rotZ, this.rotation.z);
        
        // Combine rotations: modelMatrix = rotZ * rotY * rotX
        this.multiply(tempMatrix, rotY, rotX);
        this.multiply(modelMatrix, rotZ, tempMatrix);

        this.identity(viewMatrix);
        this.translate(viewMatrix, -this.camera.position[0], -this.camera.position[1], -this.camera.position[2]);

        this.perspective(projectionMatrix, Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 100);

        // Set uniforms
        gl.uniformMatrix4fv(this.uniforms.modelMatrix, false, modelMatrix);
        gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, viewMatrix);
        gl.uniformMatrix4fv(this.uniforms.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(this.uniforms.normalMatrix, false, modelMatrix);
        gl.uniform3fv(this.uniforms.color, this.currentColor);
        gl.uniform3fv(this.uniforms.lightPosition, [2, 2, 2]);
        gl.uniform3fv(this.uniforms.cameraPosition, this.camera.position);
        gl.uniform1f(this.uniforms.glowIntensity, this.glowIntensity);

        // Render geometry
        const geometry = this.geometries[this.currentShape];
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer);

        gl.enableVertexAttribArray(this.attribs.position);
        gl.enableVertexAttribArray(this.attribs.normal);

        gl.vertexAttribPointer(this.attribs.position, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(this.attribs.normal, 3, gl.FLOAT, false, 24, 12);

        gl.drawElements(gl.TRIANGLES, geometry.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    extractBloom() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomFramebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        gl.useProgram(this.bloomProgram);
        gl.uniform1i(gl.getUniformLocation(this.bloomProgram, 'u_texture'), 0);
        gl.uniform2f(gl.getUniformLocation(this.bloomProgram, 'u_resolution'), this.canvas.width, this.canvas.height);
        gl.uniform1f(gl.getUniformLocation(this.bloomProgram, 'u_bloomThreshold'), this.bloomThreshold);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.sceneTexture);

        this.renderQuad(this.quadAttribs.bloom);
    }

    blurBloom() {
        const gl = this.gl;
        gl.useProgram(this.blurProgram);
        gl.uniform1i(gl.getUniformLocation(this.blurProgram, 'u_texture'), 0);
        gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_resolution'), this.canvas.width, this.canvas.height);

        // Horizontal blur
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFramebuffer1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_direction'), 1, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.bloomTexture);
        this.renderQuad(this.quadAttribs.blur);

        // Vertical blur
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFramebuffer2);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_direction'), 0, 1);
        gl.bindTexture(gl.TEXTURE_2D, this.blurTexture1);
        this.renderQuad(this.quadAttribs.blur);
    }

    composite() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        gl.useProgram(this.compositeProgram);
        gl.uniform1i(gl.getUniformLocation(this.compositeProgram, 'u_scene'), 0);
        gl.uniform1i(gl.getUniformLocation(this.compositeProgram, 'u_bloom'), 1);
        gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'u_bloomStrength'), this.bloomStrength);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.sceneTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.blurTexture2);

        this.renderQuad(this.quadAttribs.composite);
    }

    renderQuad(attribs) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quad.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quad.indexBuffer);

        if (attribs.position >= 0) {
            gl.enableVertexAttribArray(attribs.position);
            gl.vertexAttribPointer(attribs.position, 2, gl.FLOAT, false, 16, 0);
        }
        
        if (attribs.texCoord >= 0) {
            gl.enableVertexAttribArray(attribs.texCoord);
            gl.vertexAttribPointer(attribs.texCoord, 2, gl.FLOAT, false, 16, 8);
        }

        gl.drawElements(gl.TRIANGLES, this.quad.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    setShape(shape) {
        this.currentShape = shape;
    }

    setColor(color) {
        const colors = {
            red: [1, 0.1, 0.1],
            green: [0.1, 1, 0.1],
            blue: [0.1, 0.1, 1],
            cyan: [0.1, 1, 1],
            magenta: [1, 0.1, 1],
            yellow: [1, 1, 0.1]
        };
        this.currentColor = colors[color] || colors.red;
    }

    adjustZoom(delta) {
        // Adjust camera distance based on zoom delta
        this.camera.baseDistance += delta;
        
        // Clamp to min/max distances
        this.camera.baseDistance = Math.max(
            this.camera.minDistance, 
            Math.min(this.camera.maxDistance, this.camera.baseDistance)
        );
        
        // Update camera position
        this.camera.position[2] = this.camera.baseDistance;
    }
}