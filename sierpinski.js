const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');
let points = [];


let currentMode = 'TRI_REC'; 
let depth = 0;               
let iterations = 0;          

const vsSource = `
    attribute vec4 aVertexPosition;
    void main() { 
        gl_Position = aVertexPosition; 
        gl_PointSize = 1.5; 
    }
`;
const fsSource = `
    void main() { gl_FragColor = vec4(0.0, 0.4, 0.8, 1.0); }
`;

const shaderProgram = createProgram(gl, vsSource, fsSource);
gl.useProgram(shaderProgram);

// ==========================================
// THUẬT TOÁN 1: ĐỆ QUY TAM GIÁC
// ==========================================
function mix(a, b, t) {
    return [ a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t ];
}

function divideTriangle(a, b, c, d) {
    if (d === 0) {
        points.push(...a, ...b, ...c);
        return;
    }
    const ab = mix(a, b, 0.5);
    const bc = mix(b, c, 0.5);
    const ca = mix(c, a, 0.5);

    divideTriangle(a, ab, ca, d - 1);
    divideTriangle(ab, b, bc, d - 1);
    divideTriangle(ca, bc, c, d - 1);
}

// ==========================================
// THUẬT TOÁN 2: CHAOS GAME
// ==========================================
function chaosGame(iters) {
    if (iters === 0) return; 
    
    const vertices = [ [-0.8, -0.8], [0.8, -0.8], [0.0, 0.8] ];
    let p = [0.0, 0.0]; 

    for (let i = 0; i < iters; i++) {
        let j = Math.floor(Math.random() * 3); 
        p = [ (p[0] + vertices[j][0]) / 2, (p[1] + vertices[j][1]) / 2 ];
        points.push(p[0], p[1]);
    }
}

// ==========================================
// THUẬT TOÁN 3: HÌNH VUÔNG SIERPINSKI 
// ==========================================
function divideSquare(x, y, size, d) {
    if (d === 0) {
        points.push(
            x, y,               x + size, y,        x + size, y + size,
            x, y,               x + size, y + size, x, y + size
        );
        return;
    }
    let newSize = size / 3;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (row === 1 && col === 1) continue; 
            divideSquare(x + col * newSize, y + row 
                * newSize, newSize, d - 1);
        }
    }
}

// ==========================================
// RENDER ĐỒ HỌA WEBGL 
// ==========================================
function render() {
    resizeCanvas(canvas); 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    points = [];

    if (currentMode === 'TRI_REC') {
        const v = [ [-0.8, -0.8], [0.8, -0.8], [0.0, 0.8] ];
        divideTriangle(v[0], v[1], v[2], depth);
    } 
    else if (currentMode === 'TRI_CHAOS') {
        chaosGame(iterations);
    } 
    else if (currentMode === 'CARPET') {
        divideSquare(-0.8, -0.8, 1.6, depth);
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0.95, 0.95, 0.95, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (points.length > 0) {
        if (currentMode === 'TRI_CHAOS') {
            gl.drawArrays(gl.POINTS, 0, points.length / 2); 
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, points.length / 2); 
        }
    }
}

// ==========================================
// SỰ KIỆN NÚT BẤM (UI)
// ==========================================
const btnTriRec = document.getElementById('btnTriRec');
const btnTriChaos = document.getElementById('btnTriChaos');
const btnCarpet = document.getElementById('btnCarpet');
const lblTitle = document.getElementById('levelLabel');
const lblValue = document.getElementById('levelVal');

function setActiveBtn(activeBtn) {
    [btnTriRec, btnTriChaos, btnCarpet].forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
}

function updateUI() {
    if (currentMode === 'TRI_CHAOS') {
        lblTitle.innerText = "Số lượng điểm (Iterations):";
        lblValue.innerText = iterations;
    } else {
        lblTitle.innerText = "Độ sâu đệ quy (Depth):";
        lblValue.innerText = depth;
    }
    render();
}

// SỰ KIỆN CHUYỂN TAB: RESET VỀ 0
btnTriRec.addEventListener('click', () => { 
    currentMode = 'TRI_REC'; 
    depth = 0; 
    setActiveBtn(btnTriRec); 
    updateUI(); 
});

btnTriChaos.addEventListener('click', () => { 
    currentMode = 'TRI_CHAOS'; 
    iterations = 0; 
    setActiveBtn(btnTriChaos); 
    updateUI(); 
});

btnCarpet.addEventListener('click', () => { 
    currentMode = 'CARPET'; 
    depth = 0; 
    setActiveBtn(btnCarpet); 
    updateUI(); 
});

// SỰ KIỆN TĂNG GIẢM
document.getElementById('btnIncrease').addEventListener('click', () => {
    if (currentMode === 'TRI_CHAOS') {
        if (iterations < 100000) iterations += 10000;
    } else {
        if (depth < 7) depth++;
    }
    updateUI();
});

document.getElementById('btnDecrease').addEventListener('click', () => {
    if (currentMode === 'TRI_CHAOS') {
        if (iterations > 0) iterations -= 10000;
    } else {
        if (depth > 0) depth--;
    }
    updateUI();
});

// Chạy lần đầu
updateUI();
window.addEventListener('resize', render);

document.getElementById('btnReset').addEventListener('click',() => {
    depth = 0;
    iterations = 0;
    updateUI();
})