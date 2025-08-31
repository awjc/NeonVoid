const Shaders = {
    vertex: `
        attribute vec3 a_position;
        attribute vec3 a_normal;
        
        uniform mat4 u_modelMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_projectionMatrix;
        uniform mat4 u_normalMatrix;
        
        varying vec3 v_normal;
        varying vec3 v_position;
        
        void main() {
            vec4 worldPosition = u_modelMatrix * vec4(a_position, 1.0);
            v_position = worldPosition.xyz;
            v_normal = (u_normalMatrix * vec4(a_normal, 0.0)).xyz;
            
            gl_Position = u_projectionMatrix * u_viewMatrix * worldPosition;
        }
    `,

    fragment: `
        precision mediump float;
        
        varying vec3 v_normal;
        varying vec3 v_position;
        
        uniform vec3 u_color;
        uniform vec3 u_lightPosition;
        uniform vec3 u_cameraPosition;
        uniform float u_glowIntensity;
        
        void main() {
            vec3 normal = normalize(v_normal);
            vec3 lightDir = normalize(u_lightPosition - v_position);
            vec3 viewDir = normalize(u_cameraPosition - v_position);
            
            // Basic lighting calculations
            float NdotL = max(dot(normal, lightDir), 0.0);
            float NdotV = max(dot(normal, viewDir), 0.0);
            
            // Smooth fresnel for glass-like rim lighting
            float fresnel = pow(1.0 - NdotV, 3.0);
            
            // Glass-like material properties
            vec3 glassBase = u_color * 0.15; // Subtle base color
            vec3 diffuse = u_color * NdotL * 0.3; // Soft lighting
            
            // Clean rim highlight for glass effect
            float rimIntensity = smoothstep(0.0, 1.0, fresnel);
            vec3 rimLight = u_color * rimIntensity * u_glowIntensity;
            
            // Subtle internal glow for neon effect
            float centerGlow = (1.0 - rimIntensity) * 0.4;
            vec3 innerGlow = u_color * centerGlow;
            
            // Combine for clean glassy neon look
            vec3 finalColor = glassBase + diffuse + rimLight + innerGlow;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,

    // Bloom pass shaders
    bloomVertexShader: `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        
        varying vec2 v_texCoord;
        
        void main() {
            v_texCoord = a_texCoord;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `,

    bloomFragmentShader: `
        precision mediump float;
        
        uniform sampler2D u_texture;
        uniform vec2 u_resolution;
        uniform float u_bloomThreshold;
        
        varying vec2 v_texCoord;
        
        void main() {
            vec4 color = texture2D(u_texture, v_texCoord);
            
            // Extract bright areas
            float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
            
            if (brightness > u_bloomThreshold) {
                gl_FragColor = color;
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        }
    `,

    blurFragmentShader: `
        precision mediump float;
        
        uniform sampler2D u_texture;
        uniform vec2 u_resolution;
        uniform vec2 u_direction;
        
        varying vec2 v_texCoord;
        
        void main() {
            vec4 color = vec4(0.0);
            vec2 texelSize = 1.0 / u_resolution;
            
            // Clean gaussian blur for smooth glow
            vec2 off1 = vec2(1.3846153846) * u_direction * texelSize * 3.0;
            vec2 off2 = vec2(3.2307692308) * u_direction * texelSize * 3.0;
            vec2 off3 = vec2(5.1769230769) * u_direction * texelSize * 3.0;
            
            // Gaussian weights for smoother falloff
            color += texture2D(u_texture, v_texCoord) * 0.2270270270;
            color += texture2D(u_texture, v_texCoord + off1) * 0.3162162162;
            color += texture2D(u_texture, v_texCoord - off1) * 0.3162162162;
            color += texture2D(u_texture, v_texCoord + off2) * 0.0702702703;
            color += texture2D(u_texture, v_texCoord - off2) * 0.0702702703;
            color += texture2D(u_texture, v_texCoord + off3) * 0.0100000000;
            color += texture2D(u_texture, v_texCoord - off3) * 0.0100000000;
            
            gl_FragColor = color;
        }
    `,

    compositeFragmentShader: `
        precision mediump float;
        
        uniform sampler2D u_scene;
        uniform sampler2D u_bloom;
        uniform float u_bloomStrength;
        
        varying vec2 v_texCoord;
        
        void main() {
            vec4 sceneColor = texture2D(u_scene, v_texCoord);
            vec4 bloomColor = texture2D(u_bloom, v_texCoord);
            
            gl_FragColor = sceneColor + bloomColor * u_bloomStrength;
        }
    `
};