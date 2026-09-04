/* 衍 · webgl2 — a very small kernel: programs, fullscreen triangle,
   render targets, ping-pong. Everything the halls need to compute on GPU. */

export function createGL(canvas, opts = {}) {
  const gl = canvas.getContext('webgl2', {
    antialias: false, alpha: false, depth: false, stencil: false,
    preserveDrawingBuffer: !!opts.preserve, powerPreference: 'high-performance',
  });
  if (!gl) return null;
  gl.floatOK = !!gl.getExtension('EXT_color_buffer_float');
  return gl;
}

const VERT = `#version 300 es
layout(location=0) in vec2 p;
out vec2 uv;
void main(){ uv = p*.5+.5; gl_Position = vec4(p,0.,1.); }`;

function compile(gl, type, src, label) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`shader ${label}: ${log}`);
  }
  return sh;
}

export function makeProgram(gl, fsSrc, label = 'prog', vsSrc = VERT) {
  const p = gl.createProgram();
  const v = compile(gl, gl.VERTEX_SHADER, vsSrc, label + '.vert');
  const f = compile(gl, gl.FRAGMENT_SHADER, fsSrc, label + '.frag');
  gl.attachShader(p, v); gl.attachShader(p, f);
  gl.linkProgram(p);
  gl.deleteShader(v); gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error(`link ${label}: ${log}`);
  }
  p.u = (name) => {
    if (!p._u) p._u = {};
    if (!(name in p._u)) p._u[name] = gl.getUniformLocation(p, name);
    return p._u[name];
  };
  return p;
}

/* one VAO with a single oversized triangle — the cheapest fullscreen */
export function makeQuad(gl) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  return vao;
}

export function drawQuad(gl, vao) {
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindVertexArray(null);
}

/* ── render targets ────────────────────────────────────────── */

export class Target {
  constructor(gl, w, h, { float = true, filter = true } = {}) {
    this.gl = gl;
    this.float = float && gl.floatOK;
    this.filter = filter;
    this.w = w; this.h = h;
    this.tex = gl.createTexture();
    this.fbo = gl.createFramebuffer();
    this._alloc(w, h);
  }
  _alloc(w, h) {
    const gl = this.gl;
    this.w = w; this.h = h;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0,
      this.float ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA,
      this.float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  resize(w, h) {
    if (w === this.w && h === this.h) return;
    this._alloc(w, h);
  }
  bind() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.w, this.h);
  }
  dispose() { this.gl.deleteTexture(this.tex); this.gl.deleteFramebuffer(this.fbo); }
}

export class PingPong {
  constructor(gl, w, h, opts) {
    this.gl = gl;
    this.a = new Target(gl, w, h, opts);
    this.b = new Target(gl, w, h, opts);
  }
  get read() { return this.a; }
  get write() { return this.b; }
  swap() { const t = this.a; this.a = this.b; this.b = t; }
  resize(w, h) { this.a.resize(w, h); this.b.resize(w, h); }
  dispose() { this.a.dispose(); this.b.dispose(); }
}

export function bindTex(gl, unit, tex) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  return unit;
}

/* set uniforms from a plain object; arrays pick vec sizes */
export function setU(gl, prog, obj) {
  for (const k in obj) {
    const loc = prog.u(k);
    if (!loc) continue;
    const v = obj[k];
    if (typeof v === 'number') gl.uniform1f(loc, v);
    else if (typeof v === 'boolean') gl.uniform1i(loc, v ? 1 : 0);
    else if (Array.isArray(v)) {
      if (v.length <= 4 && typeof v[0] === 'number') gl['uniform' + v.length + 'fv'](loc, v);
      else gl.uniform1iv(loc, v);
    }
  }
}

/* seed a target with data — Float32Array (0..1 RGBA) or Uint8Array */
export function seedTarget(gl, target, data) {
  gl.bindTexture(gl.TEXTURE_2D, target.tex);
  if (target.float) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, target.w, target.h, 0, gl.RGBA, gl.FLOAT, data);
  } else {
    const bytes = data instanceof Uint8Array ? data : Uint8Array.from(data, v => Math.round(v * 255));
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, target.w, target.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
  }
}
