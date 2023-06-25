// get contents of .frag, .vert, etc. files
function getSourceSynch(url) {
  const req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send();
	if (req.status === 200) return req.responseText;
	else console.log("GET failed. Status code: " + req.status);
}

// resize canvas
function resizeGlCanvas(gl) {
	const canvas = gl.canvas;
	// size of canvas in css pixels
	const w = canvas.clientWidth;
	const h = canvas.clientWidth;
	// set size if needed
	if (canvas.width !== w || canvas.height !== h) {
		canvas.width = w;
		canvas.height = h;
	}
	gl.viewport(0, 0, canvas.width, canvas.height);
}

// get webgl2 context
function getWEBGL2(canvasId) {
	const gl = document.getElementById(canvasId).getContext("webgl2");
	if (gl) {
		// ensure correct canvas size
		resizeGlCanvas(gl);
		return gl;
	}
	else console.log("No WebGL2 for you! :(((")
}

function createShader(gl, srcId) {
	// get source
	const scriptTag = document.getElementById(srcId)
	const source = getSourceSynch(scriptTag.src);
	if (!source) {
		console.log("Unknown script element.");
		return;
	}
	// get type of source
	let type;
	if (scriptTag.type === "x-shader/x-vertex") {
		type = gl.VERTEX_SHADER;
	} else if (scriptTag.type === "x-shader/x-fragment") {
		type = gl.FRAGMENT_SHADER;
	} else {
		console.log("Wrong type for script tag.");
	}
	// create shader, set source code, and compile
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	// check if success
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	} else {
		// log error and delete shader
		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}
}

// link two shaders into a program
function createProgram(gl, vsId, fsId) {
	const program = gl.createProgram();
	// create and attach shaders
	const vShader = createShader(gl, vsId);
	const fShader = createShader(gl, fsId);
	gl.attachShader(program, vShader);
	gl.attachShader(program, fShader);
	// link and validate
	gl.linkProgram(program);
	gl.validateProgram(program);
	// check
	if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
		return program;
	} else {
		// log error and delete program
		console.log(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
	}
}

function attribute(gl, program, name, size, type, normalize, stride = 0, offset = 0) {
	const location = gl.getAttribLocation(program, name);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, size, type, normalize, stride, offset);
	return location;
}

function buffer(gl, target, data, usage) {
	const b = gl.createBuffer();
	gl.bindBuffer(target, b);
	gl.bufferData(target, data, usage);
	return b;
}

function texture(gl) {

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// options for texture
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	return texture;
	
}

function programLog(gl, program) {
	const log = gl.getProgramInfoLog(program);
	if (log.length > 0) console.log(log);
}
