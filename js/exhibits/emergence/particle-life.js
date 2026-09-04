/* 衍 · 粒子生命 — six tribes, an asymmetric heart
   Physics on the CPU (typed arrays + spatial hash), light on the GPU. */

import { makeProgram, makeQuad, drawQuad, setU } from '../../core/gl.js';
import { hsl } from '../../core/math.js';

const VEIL = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 frag;
void main(){ frag = vec4(0.055, 0.047, 0.038, 0.22); }`;

const POINT_VERT = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;   // pixel coordinates
layout(location=1) in float aSp;
uniform vec2 uRes;
uniform float uSize;
out float vSp;
void main(){
  gl_Position = vec4(aPos / uRes * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = uSize;
  vSp = aSp;
}`;

const POINT_FRAG = `#version 300 es
precision highp float;
in float vSp;
uniform float uHue;
out vec4 frag;
vec3 hsl2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z - 1.0));
}
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = 1.0 - smoothstep(0.12, 0.5, d);
  float hue = uHue + vSp * 46.0 - 110.0;
  vec3 col = hsl2rgb(vec3(fract(hue/360.0), 0.62, 0.55));
  frag = vec4(col * a * 0.5, 1.0);
}`;

const SP = 6;

export default {
  id: 'particle-life', hall: 'emergence', engine: 'webgl',

  params: [
    { key: 'rmax', sym: 'r', label: '感知半径', min: 26, max: 90, step: 1, value: 48, format: v => v | 0 },
    { key: 'fric', sym: 'τ', label: '阻尼半衰', min: .015, max: .2, step: .005, value: .045, format: v => v.toFixed(3) },
    { key: 'force', sym: 'F', label: '力度', min: 4, max: 60, step: 1, value: 30 },
  ],
  buttons: [
    { id: 'recast', label: '重掷族谱', fn: c => recast(c) },
  ],
  note: '滚轮亦重掷族谱。观其自发成细胞、成膜、成链——没有蓝图。',

  async init(ctx) {
    const gl = ctx.gl;
    const N = ctx.quality < 1 ? 1300 : 2300;
    const s = ctx._s = {
      N, gl,
      veilProg: makeProgram(gl, VEIL, 'pl-veil'),
      quad: makeQuad(gl),
      prog: makeProgram(gl, POINT_FRAG, 'pl-points', POINT_VERT),
      pos: new Float32Array(N * 2),
      vel: new Float32Array(N * 2),
      sp: new Uint8Array(N),
      mat: [],
      posBuf: gl.createBuffer(),
      spBuf: gl.createBuffer(),
      vao: null,
    };

    /* species VAO */
    s.vao = gl.createVertexArray();
    gl.bindVertexArray(s.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, s.posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, s.pos.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, s.spBuf);
    const spF = new Float32Array(N);
    gl.bufferData(gl.ARRAY_BUFFER, spF.byteLength, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    scatter(ctx);
    recast(ctx, true);
  },


  dispose(ctx) {
    const gl = ctx.gl, s = ctx._s;
    if (!gl || !s) return;
    gl.deleteVertexArray(s.vao);
    gl.deleteBuffer(s.posBuf);
    gl.deleteBuffer(s.spBuf);
    gl.deleteProgram(s.prog);
    gl.deleteProgram(s.veilProg);
    gl.deleteVertexArray(s.quad);
  },
  resize(ctx) {},

  frame(ctx, dt) {
    const s = ctx._s, gl = ctx.gl;
    const { w, h } = ctx;
    if (ctx.pointer.wheel) recast(ctx);
    const rmax = ctx.params.rmax;
    const step = Math.min(dt, .033);

    /* scatter species buffer once */
    if (!s._spUploaded) {
      const spF = new Float32Array(s.N);
      for (let i = 0; i < s.N; i++) spF[i] = s.sp[i];
      gl.bindBuffer(gl.ARRAY_BUFFER, s.spBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, spF);
      s._spUploaded = true;
    }

    physics(ctx, step);

    /* veil */
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(s.veilProg);
    drawQuad(gl, s.quad);

    /* points */
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.bindBuffer(gl.ARRAY_BUFFER, s.posBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, s.pos);
    gl.useProgram(s.prog);
    gl.bindVertexArray(s.vao);
    setU(gl, s.prog, { uRes: [w, h], uSize: 3.4 * Math.min(ctx.dpr, 2), uHue: ctx.accentHue });
    gl.drawArrays(gl.POINTS, 0, s.N);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
  },
};

function scatter(ctx) {
  const s = ctx._s;
  for (let i = 0; i < s.N; i++) {
    s.pos[i * 2] = ctx.rng() * ctx.w;
    s.pos[i * 2 + 1] = ctx.rng() * ctx.h;
    s.vel[i * 2] = 0; s.vel[i * 2 + 1] = 0;
    s.sp[i] = (ctx.rng() * SP) | 0;
  }
  s._spUploaded = false;
}

function recast(ctx, keep = false) {
  const s = ctx._s; if (!s) return;
  s.mat = [];
  for (let i = 0; i < SP; i++) {
    s.mat.push([]);
    for (let j = 0; j < SP; j++) s.mat[i].push(i === j ? .7 + ctx.rng() * .3 : ctx.rng() * 2.4 - 1.15);
  }
  if (!keep) scatter(ctx);
}

function physics(ctx, dt) {
  const s = ctx._s;
  const { pos, vel, mat, sp, N } = s;
  const w = ctx.w, h = ctx.h;
  const rmax = ctx.params.rmax, beta = .32;
  const r2max = rmax * rmax;

  /* uniform grid */
  const gw = Math.max(1, Math.floor(w / rmax)), gh = Math.max(1, Math.floor(h / rmax));
  const cells = gw * gh;
  const count = new Int32Array(cells + 1);
  const idx = new Int32Array(N);
  for (let i = 0; i < N; i++) {
    const gx = Math.min(gw - 1, (pos[i * 2] / w * gw) | 0);
    const gy = Math.min(gh - 1, (pos[i * 2 + 1] / h * gh) | 0);
    count[gy * gw + gx + 1]++;
  }
  for (let c = 0; c < cells; c++) count[c + 1] += count[c];
  const fill = count.slice(0, cells);
  for (let i = 0; i < N; i++) {
    const gx = Math.min(gw - 1, (pos[i * 2] / w * gw) | 0);
    const gy = Math.min(gh - 1, (pos[i * 2 + 1] / h * gh) | 0);
    idx[fill[gy * gw + gx]++] = i;
  }

  /* forces */
  const fric = Math.exp(-dt / ctx.params.fric);
  const F = ctx.params.force;
  for (let i = 0; i < N; i++) {
    const x = pos[i * 2], y = pos[i * 2 + 1], si = sp[i];
    let ax = 0, ay = 0;
    const gx = Math.min(gw - 1, (x / w * gw) | 0), gy = Math.min(gh - 1, (y / h * gh) | 0);
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const cx = (gx + ox + gw) % gw, cy = (gy + oy + gh) % gh;
      const c0 = count[cy * gw + cx], c1 = count[cy * gw + cx + 1];
      for (let k = c0; k < c1; k++) {
        const j = idx[k];
        if (j === i) continue;
        let dx = pos[j * 2] - x, dy = pos[j * 2 + 1] - y;
        if (dx > w / 2) dx -= w; else if (dx < -w / 2) dx += w;
        if (dy > h / 2) dy -= h; else if (dy < -h / 2) dy += h;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2max || d2 < 1e-6) continue;
        const d = Math.sqrt(d2);
        const r = d / rmax;
        let f;
        if (r < beta) f = r / beta - 1;
        else f = mat[si][sp[j]] * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
        ax += f * dx / d;
        ay += f * dy / d;
      }
    }
    vel[i * 2] = (vel[i * 2] + ax * F * dt) * fric;
    vel[i * 2 + 1] = (vel[i * 2 + 1] + ay * F * dt) * fric;
  }

  /* integrate + wrap */
  for (let i = 0; i < N; i++) {
    let x = pos[i * 2] + vel[i * 2] * dt * rmax;
    let y = pos[i * 2 + 1] + vel[i * 2 + 1] * dt * rmax;
    if (x < 0) x += w; else if (x > w) x -= w;
    if (y < 0) y += h; else if (y > h) y -= h;
    pos[i * 2] = x; pos[i * 2 + 1] = y;
  }
}
