# NeonVoid

A WebGL application that displays glowing neon shapes (cubes, spheres, cylinders, pyramids) with RGB LED colors and atmospheric bloom effects against a dark background.

![NeonVoid Demo](https://via.placeholder.com/800x400/000000/00ff00?text=NeonVoid+Demo)

## ✨ Features

- **4 3D Shapes**: Cube, Sphere, Cylinder, Pyramid
- **6 Neon Colors**: Red, Green, Blue, Cyan, Magenta, Yellow  
- **WebGL Rendering**: Hardware-accelerated 3D graphics
- **Bloom Effects**: Atmospheric glow and halo effects
- **3D Rotation**: Multi-axis rotation for dynamic viewing
- **Responsive Design**: Works on desktop and mobile browsers

## 🚀 Live Demo

**[View Live Demo](https://yourusername.github.io/NeonVoid)**

## 🛠️ Local Development

### Requirements
- Modern web browser with WebGL support
- Python 3.x (for local server)

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NeonVoid.git
   cd NeonVoid
   ```

2. Run the development server:
   ```bash
   python server.py
   ```

3. Open your browser to `http://localhost:8000`

### Alternative Servers
```bash
# Python 2/3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

## 📁 Project Structure

```
NeonVoid/
├── index.html          # Main HTML page
├── styles.css          # Dark theme styling
├── server.py           # Development server
├── js/
│   ├── main.js         # Application entry point
│   ├── renderer.js     # WebGL renderer with bloom effects  
│   ├── shaders.js      # GLSL shaders for rendering
│   ├── geometry.js     # 3D shape generators
│   └── webgl-utils.js  # WebGL utility functions
└── README.md
```

## 🎮 Controls

- **Shape Dropdown**: Select between Cube, Sphere, Cylinder, Pyramid
- **Color Dropdown**: Choose from 6 neon colors
- **Auto-Rotation**: Shapes automatically rotate on multiple axes

## 🚀 Deploying to GitHub Pages

### Method 1: Using GitHub Web Interface

1. **Create a new repository** on GitHub named `NeonVoid`

2. **Upload your files** using GitHub's web interface:
   - Click "uploading an existing file"
   - Drag and drop all project files
   - Commit the changes

3. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section  
   - Source: Deploy from a branch
   - Branch: `main` / `master`
   - Folder: `/ (root)`
   - Click Save

4. **Access your site** at: `https://yourusername.github.io/NeonVoid`

### Method 2: Using Git Commands

1. **Initialize and push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit: NeonVoid WebGL app"
   git branch -M main
   git remote add origin https://github.com/yourusername/NeonVoid.git
   git push -u origin main
   ```

2. **Enable Pages** via Settings > Pages as described above

### Method 3: Using GitHub CLI

```bash
# Create repo and push
gh repo create NeonVoid --public --push --source .

# Enable Pages
gh api repos/yourusername/NeonVoid/pages -X POST -f source='{"branch":"main","path":"/"}'
```

## 🌐 Browser Compatibility

- ✅ Chrome 56+
- ✅ Firefox 51+  
- ✅ Safari 10+
- ✅ Edge 79+
- ⚠️ IE 11 (limited support)

## 🛠️ Technology Stack

- **WebGL**: 3D graphics rendering
- **JavaScript ES6+**: Core application logic
- **HTML5 Canvas**: Rendering surface
- **CSS3**: UI styling and animations
- **GLSL**: Vertex and fragment shaders

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## 🐛 Issues

Found a bug or have a suggestion? Please open an [issue](https://github.com/yourusername/NeonVoid/issues).

---

**Built with ❤️ and WebGL**