class Geometry {
    static createCube() {
        const vertices = [
            // Front face
            -1, -1,  1,   0,  0,  1,
             1, -1,  1,   0,  0,  1,
             1,  1,  1,   0,  0,  1,
            -1,  1,  1,   0,  0,  1,

            // Back face
            -1, -1, -1,   0,  0, -1,
            -1,  1, -1,   0,  0, -1,
             1,  1, -1,   0,  0, -1,
             1, -1, -1,   0,  0, -1,

            // Top face
            -1,  1, -1,   0,  1,  0,
            -1,  1,  1,   0,  1,  0,
             1,  1,  1,   0,  1,  0,
             1,  1, -1,   0,  1,  0,

            // Bottom face
            -1, -1, -1,   0, -1,  0,
             1, -1, -1,   0, -1,  0,
             1, -1,  1,   0, -1,  0,
            -1, -1,  1,   0, -1,  0,

            // Right face
             1, -1, -1,   1,  0,  0,
             1,  1, -1,   1,  0,  0,
             1,  1,  1,   1,  0,  0,
             1, -1,  1,   1,  0,  0,

            // Left face
            -1, -1, -1,  -1,  0,  0,
            -1, -1,  1,  -1,  0,  0,
            -1,  1,  1,  -1,  0,  0,
            -1,  1, -1,  -1,  0,  0
        ];

        const indices = [
            0,  1,  2,    0,  2,  3,    // front
            4,  5,  6,    4,  6,  7,    // back
            8,  9,  10,   8,  10, 11,   // top
            12, 13, 14,   12, 14, 15,   // bottom
            16, 17, 18,   16, 18, 19,   // right
            20, 21, 22,   20, 22, 23    // left
        ];

        return { vertices, indices };
    }

    static createSphere(radius = 1, widthSegments = 32, heightSegments = 16) {
        const vertices = [];
        const indices = [];

        for (let lat = 0; lat <= heightSegments; lat++) {
            const theta = lat * Math.PI / heightSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= widthSegments; lon++) {
                const phi = lon * 2 * Math.PI / widthSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                // Position
                vertices.push(radius * x, radius * y, radius * z);
                // Normal (for sphere, normal is the same as position when normalized)
                vertices.push(x, y, z);
            }
        }

        for (let lat = 0; lat < heightSegments; lat++) {
            for (let lon = 0; lon < widthSegments; lon++) {
                const first = (lat * (widthSegments + 1)) + lon;
                const second = first + widthSegments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        return { vertices, indices };
    }

    static createQuad() {
        const vertices = [
            -1, -1, 0, 0,
             1, -1, 1, 0,
             1,  1, 1, 1,
            -1,  1, 0, 1
        ];

        const indices = [0, 1, 2, 0, 2, 3];

        return { vertices, indices };
    }
}