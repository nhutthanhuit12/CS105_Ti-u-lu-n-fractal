const VERTEX_SHADER_SOURCE = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;

    void main() {
        float scale = min(u_resolution.x, u_resolution.y);
        vec2 pos = a_position * scale / u_resolution;
        gl_Position = vec4(pos, 0.0, 1.0);
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;
    uniform vec3 u_color;

    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

function createInitialSquare() {
    const s = 0.5; 
    return [
        [-s,  s],   
        [ s,  s],   
        [ s, -s],   
        [-s, -s],   
        [-s,  s]    
    ];
}

function minkowskiSubdivide(points) {
    const result = [];

    for (let i = 0; i < points.length - 1; i++) {
        const [ax, ay] = points[i];
        const [bx, by] = points[i + 1];
        const dx = (bx - ax) / 4;
        const dy = (by - ay) / 4;
        const nx = -dy;
        const ny = dx;

        const q1 = [ax + dx,         ay + dy];          
        const q2 = [q1[0] + nx,      q1[1] + ny];       
        const q3 = [q2[0] + dx,      q2[1] + dy];       
        const q4 = [q3[0] - nx,      q3[1] - ny];       
        const q5 = [q4[0] - nx,      q4[1] - ny];       
        const q6 = [q5[0] + dx,      q5[1] + dy];       
        const q7 = [q6[0] + nx,      q6[1] + ny];       

        result.push([ax, ay]);
        result.push(q1);
        result.push(q2);
        result.push(q3);
        result.push(q4);
        result.push(q5);
        result.push(q6);
        result.push(q7);
    }

    result.push(points[points.length - 1]);

    return result;
}

function generateMinkowskiIsland(depth) {
    let points = createInitialSquare();

    for (let i = 0; i < depth; i++) {
        points = minkowskiSubdivide(points);
    }

    const flat = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
        flat[i * 2] = points[i][0];
        flat[i * 2 + 1] = points[i][1];
    }

    return flat;
}

function initMinkowski() {
    const canvas = document.getElementById('glcanvas');
    const depthSlider = document.getElementById('depth-slider');
    const depthDisplay = document.getElementById('depth-display');
    const colorPicker = document.getElementById('color-picker');
    const btnAnimate = document.getElementById('btn-animate');

    const statDepth = document.getElementById('stat-depth');
    const statVertices = document.getElementById('stat-vertices');
    const statSegments = document.getElementById('stat-segments');

    const gl = canvas.getContext('webgl', { antialias: true });
    if (!gl) {
        alert('Trình duyệt không hỗ trợ WebGL!');
        return;
    }

    const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    const aPosition = gl.getAttribLocation(program, 'a_position');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uColor = gl.getUniformLocation(program, 'u_color');
    const positionBuffer = gl.createBuffer();

    let currentDepth = 0;
    let isAnimating = false;
    let animationTimer = null;

    function updateStats(depth, vertexCount) {
        statDepth.textContent = depth;
        statVertices.textContent = vertexCount.toLocaleString();
        statSegments.textContent = (vertexCount - 1).toLocaleString();
        depthDisplay.textContent = depth;
    }

    function render() {
        resizeCanvas(canvas);

        const vertices = generateMinkowskiIsland(currentDepth);
        const vertexCount = vertices.length / 2;

        updateStats(currentDepth, vertexCount);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.02, 0.02, 0.06, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.uniform2f(uResolution, canvas.width, canvas.height);

        const color = hexToRgb(colorPicker.value);
        gl.uniform3f(uColor, color[0], color[1], color[2]);

        gl.enableVertexAttribArray(aPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINE_STRIP, 0, vertexCount);
    }

    depthSlider.addEventListener('input', function () {
        currentDepth = parseInt(this.value);
        render();
    });

    colorPicker.addEventListener('input', function () {
        render();
    });

    btnAnimate.addEventListener('click', function () {
        if (isAnimating) {
            isAnimating = false;
            clearInterval(animationTimer);
            btnAnimate.textContent = '▶ Chạy hoạt ảnh';
            btnAnimate.classList.remove('active');
            return;
        }

        isAnimating = true;
        currentDepth = 0;
        depthSlider.value = 0;
        btnAnimate.textContent = '⏸ Dừng hoạt ảnh';
        btnAnimate.classList.add('active');

        animationTimer = setInterval(function () {
            currentDepth++;
            if (currentDepth > parseInt(depthSlider.max)) {
                currentDepth = 0;
            }
            depthSlider.value = currentDepth;
            render();
        }, 1000); 

        render();
    });

    window.addEventListener('resize', render);
    render();
}

window.addEventListener('load', initMinkowski);
