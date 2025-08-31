export class Geometry {
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

    static createCylinder(radius = 1, height = 2, radialSegments = 32) {
        const vertices = [];
        const indices = [];

        // Create vertices for top and bottom circles + side
        for (let i = 0; i <= radialSegments; i++) {
            const angle = (i / radialSegments) * 2 * Math.PI;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Bottom circle
            vertices.push(x, -height / 2, z);
            vertices.push(0, -1, 0); // Normal pointing down

            // Top circle
            vertices.push(x, height / 2, z);
            vertices.push(0, 1, 0); // Normal pointing up

            // Side vertices (duplicate for proper normals)
            vertices.push(x, -height / 2, z);
            vertices.push(x, 0, z); // Normal pointing outward

            vertices.push(x, height / 2, z);
            vertices.push(x, 0, z); // Normal pointing outward
        }

        // Center vertices for top and bottom caps
        const centerBottomIndex = vertices.length / 6;
        vertices.push(0, -height / 2, 0, 0, -1, 0); // Bottom center

        const centerTopIndex = vertices.length / 6;
        vertices.push(0, height / 2, 0, 0, 1, 0); // Top center

        // Create indices for side faces
        for (let i = 0; i < radialSegments; i++) {
            const sideBottomCurrent = i * 4 + 2; // Side bottom vertex
            const sideTopCurrent = i * 4 + 3;    // Side top vertex
            const sideBottomNext = ((i + 1) % radialSegments) * 4 + 2;
            const sideTopNext = ((i + 1) % radialSegments) * 4 + 3;

            // Two triangles per side face
            indices.push(sideBottomCurrent, sideTopCurrent, sideBottomNext);
            indices.push(sideTopCurrent, sideTopNext, sideBottomNext);
        }

        // Create indices for bottom cap
        for (let i = 0; i < radialSegments; i++) {
            const current = i * 4; // Bottom vertex
            const next = ((i + 1) % radialSegments) * 4;
            indices.push(centerBottomIndex, next, current);
        }

        // Create indices for top cap
        for (let i = 0; i < radialSegments; i++) {
            const current = i * 4 + 1; // Top vertex
            const next = ((i + 1) % radialSegments) * 4 + 1;
            indices.push(centerTopIndex, current, next);
        }

        return { vertices, indices };
    }

    static createPyramid(size = 1) {
        const vertices = [
            // Base vertices (square)
            -size, -size, -size,   0, -1,  0, // Bottom-left
             size, -size, -size,   0, -1,  0, // Bottom-right
             size, -size,  size,   0, -1,  0, // Top-right
            -size, -size,  size,   0, -1,  0, // Top-left

            // Apex vertex (duplicated with different normals for each face)
            // Front face normal
             0,  size,  0,   0,  0.7071,  0.7071,
            // Right face normal
             0,  size,  0,   0.7071,  0.7071,  0,
            // Back face normal
             0,  size,  0,   0, 0.7071, -0.7071,
            // Left face normal
             0,  size,  0,  -0.7071,  0.7071,  0,

            // Base vertices duplicated for proper face normals
            // Front face vertices
            -size, -size,  size,   0,  0.7071,  0.7071,
             size, -size,  size,   0,  0.7071,  0.7071,

            // Right face vertices
             size, -size,  size,   0.7071,  0.7071,  0,
             size, -size, -size,   0.7071,  0.7071,  0,

            // Back face vertices
             size, -size, -size,   0,  0.7071, -0.7071,
            -size, -size, -size,   0,  0.7071, -0.7071,

            // Left face vertices
            -size, -size, -size,  -0.7071,  0.7071,  0,
            -size, -size,  size,  -0.7071,  0.7071,  0
        ];

        const indices = [
            // Base (bottom face)
            0, 1, 2,  0, 2, 3,

            // Front face
            4, 8, 9,

            // Right face
            5, 10, 11,

            // Back face
            6, 12, 13,

            // Left face
            7, 14, 15
        ];

        return { vertices, indices };
    }
}
