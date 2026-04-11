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

function createInitialTriangle() {
    const size = 0.85; 
    const height = size * Math.sqrt(3) / 2;
    const top = [0, height * 2 / 3];
    const right = [size / 2, -height / 3];  
    const left = [-size / 2, -height / 3];
    return [top, right, left, top];
}

function kochSubdivide(points) {
    const result = [];
    const cos60 = 0.5;
    const sin60 = Math.sqrt(3) / 2;

    for (let i = 0; i < points.length - 1; i++) {
        const [ax, ay] = points[i];
        const [bx, by] = points[i + 1];
        const p1x = ax + (bx - ax) / 3;
        const p1y = ay + (by - ay) / 3;
        const p2x = ax + 2 * (bx - ax) / 3;
        const p2y = ay + 2 * (by - ay) / 3;
        const dx = p2x - p1x;
        const dy = p2y - p1y;
        const peakX = p1x + dx * cos60 - dy * (-sin60);  
        const peakY = p1y + dx * (-sin60) + dy * cos60;   
        result.push([ax, ay]);
        result.push([p1x, p1y]);
        result.push([peakX, peakY]);
        result.push([p2x, p2y]);
    }

    result.push(points[points.length - 1]);

    return result;
}

function generateKochSnowflake(depth) {
    let points = createInitialTriangle();

    for (let i = 0; i < depth; i++) {
        points = kochSubdivide(points);
    }

    const flat = new Float32Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
        flat[i * 2] = points[i][0];
        flat[i * 2 + 1] = points[i][1];
    }

    return flat;
}

function initKoch() {
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

        const vertices = generateKochSnowflake(currentDepth);
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
        }, 800); 

        render();
    });

    window.addEventListener('resize', render);

    render();
}

window.addEventListener('load', initKoch);
