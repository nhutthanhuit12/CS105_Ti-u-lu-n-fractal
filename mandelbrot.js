const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');

const vsSource = `
    attribute vec4 aVertexPosition;
    void main() { gl_Position = aVertexPosition; }
`;

const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_offset;
    uniform float u_zoom;
    uniform vec2 u_mouse;
    uniform int u_isJulia;

    void main() {
        // BƯỚC 1: Ánh xạ pixel sang số phức 
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / 
                min(u_resolution.y, u_resolution.x);
        vec2 c_pos = uv / u_zoom + u_offset;

        vec2 z, c;
        if (u_isJulia == 1) {
            z = c_pos; 
            c = u_mouse; // BƯỚC 1 (Julia)
            // : Lấy tọa độ chuột làm hằng số c
        } else {
            z = vec2(0.0);
            c = c_pos; // BƯỚC 1 (Mandelbrot)
            // : c biến thiên theo vị trí pixel
        }

        float iter = 0.0;
        const float MAX_ITER = 150.0;

        // BƯỚC 3 & 4: Vòng lặp tính toán và Kiểm tra điều kiện thoát
        for (float i = 0.0; i < 150.0; i++) {
            // z = z^2 + c
            z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
            if (dot(z, z) > 16.0) break; 
            iter++;
        }

        // BƯỚC 5: Tô màu 
        if (iter == MAX_ITER) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
            // Công thức nội suy làm mịn dải màu
            float sn = iter - log2(log2(dot(z,z))) + 4.0;
            float r = 0.5 + 0.5 * sin(0.1 * sn + 0.0);
            float g = 0.5 + 0.5 * sin(0.1 * sn + 2.0);
            float b = 0.5 + 0.5 * sin(0.1 * sn + 4.0);
            gl_FragColor = vec4(r, g, b, 1.0);
        }
    }
`;

const shaderProgram = createProgram(gl, vsSource, fsSource);
gl.useProgram(shaderProgram);

// Setup Buffer
const positions = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
const posLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition");
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

// Uniform Locations
const uLoc = {
    res: gl.getUniformLocation(shaderProgram, "u_resolution"),
    offset: gl.getUniformLocation(shaderProgram, "u_offset"),
    zoom: gl.getUniformLocation(shaderProgram, "u_zoom"),
    mouse: gl.getUniformLocation(shaderProgram, "u_mouse"),
    isJulia: gl.getUniformLocation(shaderProgram, "u_isJulia")
};

// State Variables
let state = {
    isJulia: 0,
    zoom: 1.0,
    offset: { x: -0.5, y: 0.0 },
    mouse: { x: -0.7, y: 0.27 },
    isDragging: false,
    lastMouse: { x: 0, y: 0 }
};

function render() {
    resizeCanvas(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uLoc.res, canvas.width, canvas.height);
    gl.uniform2f(uLoc.offset, state.offset.x, state.offset.y);
    gl.uniform1f(uLoc.zoom, state.zoom);
    gl.uniform2f(uLoc.mouse, state.mouse.x, state.mouse.y);
    gl.uniform1i(uLoc.isJulia, state.isJulia);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    document.getElementById('zoomVal').innerText = state.zoom.toFixed(1) + "x";
}

// Event Listeners
canvas.onwheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    state.zoom *= zoomFactor;
    render();
};

canvas.onmousedown = (e) => {
    state.isDragging = true;
    state.lastMouse = { x: e.clientX, y: e.clientY };
};

window.onmouseup = () => state.isDragging = false;

window.onmousemove = (e) => {
    if (state.isDragging) {
        const dx = (e.clientX - state.lastMouse.x) / (canvas.width * state.zoom);
        const dy = (e.clientY - state.lastMouse.y) / (canvas.height * state.zoom);
        state.offset.x -= dx * 2.0;
        state.offset.y += dy * 2.0;
        state.lastMouse = { x: e.clientX, y: e.clientY };
        render();
    }
    if (state.isJulia === 1) {
        state.mouse.x = (e.clientX / canvas.width) * 2.0 - 1.0;
        state.mouse.y = (e.clientY / canvas.height) * 2.0 - 1.0;
        render();
    }
};

document.getElementById('toggleBtn').onclick = (e) => {
    state.isJulia = state.isJulia === 0 ? 1 : 0;
    e.target.innerText = state.isJulia === 1 ? "Đang xem: JULIA" : "Đang xem: MANDELBROT";
    render();
};

document.getElementById('btnReset').onclick = () => {
    state.zoom = 1.0;
    state.offset = { x: -0.5, y: 0.0 };
    render();
};

render();