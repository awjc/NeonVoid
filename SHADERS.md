# Shader Files Structure

The shaders have been extracted from `js/shaders.js` into individual `.glsl` files for better editing experience with syntax highlighting.

## File Structure

```
js/
├── shaders/
│   ├── vertex.glsl          # Main vertex shader
│   ├── fragment.glsl        # Main fragment shader
│   ├── bloom-vertex.glsl    # Bloom pass vertex shader
│   ├── bloom-fragment.glsl  # Bloom pass fragment shader
│   ├── blur.glsl            # Blur fragment shader
│   └── composite.glsl       # Composite fragment shader
├── shaders.js               # Shader loader and manager
├── renderer.js              # WebGL renderer
├── main.js                  # Main application
├── geometry.js              # Geometry generation
└── webgl-utils.js           # WebGL utility functions
```

## Shader Files

### `vertex.glsl`
- **Purpose**: Main vertex shader for 3D objects
- **Features**: Position and normal transformation, world space calculations
- **Uniforms**: Model, view, projection matrices, normal matrix
- **Attributes**: Position, normal
- **Varyings**: World position, world normal

### `fragment.glsl`
- **Purpose**: Main fragment shader with lighting and glow effects
- **Features**: Basic lighting, fresnel effect, rim glow for bloom
- **Uniforms**: Color, light position, camera position, glow intensity
- **Varyings**: World position, world normal

### `bloom-vertex.glsl`
- **Purpose**: Vertex shader for post-processing passes
- **Features**: Simple quad rendering for screen-space effects
- **Attributes**: Position, texture coordinates
- **Varyings**: Texture coordinates

### `bloom-fragment.glsl`
- **Purpose**: Bloom threshold shader
- **Features**: Brightness calculation, threshold-based extraction
- **Uniforms**: Texture, resolution, bloom threshold
- **Output**: Bright areas only for bloom processing

### `blur.glsl`
- **Purpose**: Gaussian blur shader for bloom effects
- **Features**: Multi-sample blur with configurable direction
- **Uniforms**: Texture, resolution, blur direction
- **Output**: Blurred texture for atmospheric glow

### `composite.glsl`
- **Purpose**: Final composition shader
- **Features**: Combines scene and bloom textures
- **Uniforms**: Scene texture, bloom texture, bloom strength
- **Output**: Final rendered image

## Usage

### Loading Shaders
```javascript
import { shaderManager } from './js/shaders.js';

// Load all shaders
await shaderManager.loadAll();

// Access shaders
const shaders = shaderManager.getShaders();
const vertexShader = shaders.vertex;
const fragmentShader = shaders.fragment;
```

### Legacy Compatibility
The `Shaders` object is still available for backward compatibility:
```javascript
import { Shaders } from './js/shaders.js';

// These will work after shaderManager.loadAll() is called
const vertexShader = Shaders.vertex;
const fragmentShader = Shaders.fragment;
```

## Benefits

1. **Syntax Highlighting**: Each shader file can be edited with proper GLSL syntax highlighting
2. **Individual Editing**: Shaders can be modified independently without affecting others
3. **Better Organization**: Clear separation of concerns for different shader types
4. **Easier Debugging**: Individual shader compilation errors are easier to identify
5. **Version Control**: Better diff tracking for shader changes
6. **IDE Support**: Better autocomplete and error checking in modern editors

## Migration Notes

- The application now uses ES6 modules (`import`/`export`)
- Shaders are loaded asynchronously before WebGL initialization
- All existing functionality is preserved through the legacy `Shaders` object
- The `shaderManager` provides a modern API for shader management

## File Extensions

- `.glsl` - Standard extension for GLSL shader files
- `.vert` - Alternative extension for vertex shaders
- `.frag` - Alternative extension for fragment shaders

The `.glsl` extension is used for all shaders as it's widely supported by most editors and provides good syntax highlighting.
