const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// Check if WebGL is available
if (!gl) {
    console.error('WebGL initialization failed.');
} else {
    console.log('WebGL initialized successfully.');
}

// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying highp vec2 vTextureCoord;
    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
`;

// Fragment shader program
const fsSource = `
    varying highp vec2 vTextureCoord;
    uniform sampler2D uSampler;
    void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`;

// Initialize a shader program
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
};

// Generate a sphere for the panorama
const sphereData = generateSphere(60, 60);
const buffers = initBuffers(gl, sphereData);

// Load the panorama texture
const texture = loadTexture(gl, 'e.mp4');  // Replace with a valid panorama image URL

// Variables for controlling the view
let viewRotationX = 0;
let viewRotationY = 0;
let lastMouseX = null;
let lastMouseY = null;
let isDragging = false;

// Mouse events for controlling rotation
canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
lastMouseX = event.clientX;
lastMouseY = event.clientY;
render();  // Start rendering when the mouse is pressed
});

canvas.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

const deltaX = event.clientX - lastMouseX;
const deltaY = event.clientY - lastMouseY;

// Adjust the view's rotation based on the mouse movement
viewRotationX += deltaX * 0.01;  // Scale the movement for smooth control
viewRotationY += deltaY * 0.01;

// Constrain the vertical rotation to avoid "flipping" over
viewRotationY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, viewRotationY));

lastMouseX = event.clientX;
lastMouseY = event.clientY;

render();  // Re-render after each movement
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// Initialize shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Create shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Initialize buffers
function initBuffers(gl, sphereData) {
    // Position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.positions), gl.STATIC_DRAW);

    // Texture coord buffer
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.textureCoords), gl.STATIC_DRAW);

    // Index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereData.indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
    };
}

// Load texture from URL
function loadTextures(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Temporary 1x1 pixel white texture
    const pixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    const image = new Image();
    image.crossOrigin = '';
    image.src = url;

    image.onload = function () {
        console.log('Image loaded successfully');
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        // Render after image load
        render();
    };

    return texture;
}


// Load video stream as texture
function loadTexture(gl, videoUrl) {
    const video = document.createElement('video');
    video.crossOrigin = '';
    video.src = videoUrl;
    video.loop = true;  // Optionally loop the video
    video.autoplay = true;  // Autoplay the video
    video.muted = true;  // Mute video to avoid feedback noise if necessary
    video.play();

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set up the texture with an initial 1x1 white pixel
    const pixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    function updateTexture() {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

            /*
            if (isPowerOf2(video.videoWidth) && isPowerOf2(video.videoHeight)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            */

            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        requestAnimationFrame(updateTexture);
    }

    video.addEventListener('play', updateTexture);

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

// Generate a sphere for the panorama


function generateSphere(Y_SEGMENTS, X_SEGMENTS) {


    const positions = [];
    const textureCoords = [];
    const indices = [];


    for (let y = 0; y <= Y_SEGMENTS; ++y) {

        const theta = Math.PI * y / Y_SEGMENTS;
        for (let x = 0; x <= X_SEGMENTS; ++x) {
            const phi = 2 * Math.PI * x / X_SEGMENTS;

            //const xSegment = x / X_SEGMENTS;
            //const ySegment = y / Y_SEGMENTS;
            const xPos = Math.sin(theta) * Math.cos(phi);
            const yPos = Math.cos(theta);
            const zPos = Math.sin(theta) * Math.sin(phi);

            positions.push(xPos, yPos, zPos);
           

            textureCoords.push(x/X_SEGMENTS,y/Y_SEGMENTS);
 

            indices.push(y * (Y_SEGMENTS + 1) + x);
            indices.push((y + 1) * (Y_SEGMENTS + 1) + x);
            indices.push(y * (Y_SEGMENTS + 1) + (x+1));

            indices.push(y * (Y_SEGMENTS + 1) + (x+1));
            indices.push((y + 1) * (Y_SEGMENTS + 1) + x);
            indices.push((y + 1) * (Y_SEGMENTS + 1) + (x+1));

        }
    }



    console.log('Positions:', positions);
    console.log('Texture Coords:', textureCoords);
    console.log('Indices:', indices);

    return {
        positions: positions,
        textureCoords: textureCoords,
        indices: indices,
    };
}


// Draw the scene

var p = 0;

function drawScene(gl, programInfo, buffers, texture) {

    // p++;
    //console.log("this is run  "+p);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // 摄像机位置设置为离圆心 (0, 0, 0) 一定距离
    const cameraPosition = [0.0, 0.0, 0.0];  // 摄像机位于 z 轴上的 (0, 0, 5)
    const target = [1.0, 0.0, 0.0];          // 圆形中心，即摄像机朝向的位置
    const up = [0.0, 1.0, 0.0];              // 指定摄像机的“上”方向为 y 轴


    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();
    //mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, 0.0]);
// 使用 lookAt 函数设置视角
    mat4.lookAt(modelViewMatrix, cameraPosition, target, up);

    // Apply the mouse-controlled rotations
    mat4.rotate(modelViewMatrix, modelViewMatrix, viewRotationY, [0, 0, 1]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, viewRotationX, [0, 1, 0]);

    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    const vertexCount = sphereData.indices.length;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);


    cleanup(gl, texture);
}
render();

// Render function is only called when needed
function render() {
    //cleanup(gl, texture);
    //console.log('Rendering scene');
    drawScene(gl, programInfo, buffers, texture);

    // 每一帧都请求下一次渲染
    requestAnimationFrame(render);
}
function cleanup(gl, texture) {
    if (texture) {
        gl.bindTexture(gl.TEXTURE_2D, null);
        //gl.deleteTexture(texture);
        //console.log('Texture cleaned up');
    }
}