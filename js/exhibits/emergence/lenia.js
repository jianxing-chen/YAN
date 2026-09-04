/* 衍 · 连续生命 Lenia (SmoothLife) — creatures of breathing light
   Rafler's continuous cellular automaton: inner disk + outer ring means,
   two sigmoids, one breath. */

import { makeProgram, makeQuad, drawQuad, setU, PingPong, seedTarget } from '../../core/gl.js';

const UPDATE = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uRi, uRa, uNi, uNm, uDt;
out vec4 frag;

float ss(float a, float b, float x){ return smoothstep(a, b, x); }
float sig(float x, float a, float w){ return 1.0 / (1.0 + exp(-(x - a) * 4.0 / w)); }

void main(){
  vec2 c = uv;
  float m = 0.0, n = 0.0;
  int R = 14;
  for (int dy = -R; dy <= R; dy++) {
    for (int dx = -R; dx <= R; dx++) {
      float d = sqrt(float(dx*dx + dy*dy));
      float f = 1.0 - ss(uRi - 0.5, uRi + 0.5, d);
      float ring = (1.0 - ss(uRa - 0.5, uRa + 0.5, d)) - f;
      float s = texture(uState, c + vec2(float(dx), float(dy)) * uTexel).r;
      m += ring * s;
      n += f * s;
    }
  }
  m /= uNm; n /= uNi;
  float alive = sig(n, 0.5, 0.147) * (1.0 - sig(m, 0.257, 0.067));
  float f2 = alive * 2.0 - 1.0;
  float cur = texture(uState, c).r;
  frag = vec4(clamp(cur + f2 * uDt, 0.0, 1.0));
}`;

const DISPLAY = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uState;
uniform float uAspect;   // canvas w/h
uniform float uHue;
out vec4 frag;

vec3 hsl2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z - 1.0));
}

void main(){
  /* fit the square grid into the wide canvas — a hanging scroll */
  vec2 p = (uv - 0.5) * 2.0;
  if (uAspect > 1.0) p.x *= uAspect; else p.y /= uAspect;
  if (max(abs(p.x), abs(p.y)) > 1.0) { frag = vec4(0.055, 0.047, 0.038, 1.0); return; }
  float v = texture(uState, (p * 0.5 + 0.5)).r;
  float core = smoothstep(0.12, 0.8, v);
  vec3 col = hsl2rgb(vec3(fract(uHue/360.0 + 0.04*(1.0-core)), 0.6, 0.05 + 0.55*core));
  col += vec3(0.9, 0.85, 0.7) * pow(v, 6.0) * 0.35;
  frag = vec4(col, 1.0);
}`;

const INJECT = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uState;
uniform vec2 uPos;      // in uv
uniform float uRadius;  // in uv units
out vec4 frag;
void main(){
  float d = distance(uv, uPos);
  float disc = 1.0 - smoothstep(uRadius * .6, uRadius, d);
  float cur = texture(uState, uv).r;
  frag = vec4(max(cur, disc));
}`;

export default {
  id: 'lenia', hall: 'emergence', engine: 'webgl',

  params: [
    { key: 'dt', sym: '⌘', label: '呼吸率', min: .03, max: .3, step: .005, value: .115, format: v => v.toFixed(3) },
    { key: 'ra', sym: 'R', label: '邻域半径', min: 8, max: 14, step: 1, value: 12, format: v => v | 0 },
  ],
  buttons: [
    { id: 'sow', label: '再播种', fn: c => { seed(c); } },
    { id: 'clear', label: '归于寂', fn: c => seed(c, true) },
  ],
  note: '点击注入一团原生质。此地无常住民——若寂灭，请再播种。',

  async init(ctx) {
    const gl = ctx.gl;
    const N = ctx.quality < 1 ? 288 : 384;
    ctx._s = {
      N,
      prog: makeProgram(gl, UPDATE, 'lenia-update'),
      disp: makeProgram(gl, DISPLAY, 'lenia-display'),
      inj: makeProgram(gl, INJECT, 'lenia-inject'),
      quad: makeQuad(gl),
      pp: new PingPong(gl, N, N, { float: true, filter: false }),
      texel: [1 / N, 1 / N],
    };
    seed(ctx);
  },

  resize(ctx) {},

  frame(ctx, dt) {
    const s = ctx._s, gl = ctx.gl;

    /* 寂后重生 — every ~6s, sample the field; if nothing lives, sow again */
    if (ctx.frame - (s._lastProbe || 0) > 360) {
      s._lastProbe = ctx.frame;
      let mx = 0;
      const buf = new Float32Array(4);
      const st = Math.floor(s.N / 20);
      gl.bindFramebuffer(gl.FRAMEBUFFER, s.pp.read.fbo);
      for (let y = 0; y < s.N; y += st) for (let x = 0; x < s.N; x += st) {
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.FLOAT, buf);
        if (buf[0] > mx) mx = buf[0];
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (mx < .25) seed(ctx);
    }

    /* kernel normalization for current radii */
    const ri = 3, ra = ctx.params.ra | 0;
    let ni = 0, nm = 0;
    const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    for (let dy = -ra - 1; dy <= ra + 1; dy++)
      for (let dx = -ra - 1; dx <= ra + 1; dx++) {
        const d = Math.sqrt(dx * dx + dy * dy);
        const f = 1 - ss(ri - .5, ri + .5, d);
        const ring = (1 - ss(ra - .5, ra + .5, d)) - f;
        ni += f; nm += ring;
      }

    /* click inject — render into the *write* target (never sample and write the same texture) */
    if (ctx.pointer.click) {
      const p = ctx.pointer.click;
      const aspect = ctx.w / ctx.h;
      let px = (p.x / ctx.w - .5) * 2, py = -(p.y / ctx.h - .5) * 2;
      if (aspect > 1) px /= aspect; else py /= aspect;   // undo the display letterbox
      if (Math.max(Math.abs(px), Math.abs(py)) <= 1.05) {
        gl.useProgram(s.inj);
        s.pp.write.bind();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, s.pp.read.tex);
        setU(gl, s.inj, { uState: 0, uPos: [px * .5 + .5, py * .5 + .5], uRadius: 5 / s.N });
        drawQuad(gl, s.quad);
        s.pp.swap();
      }
      ctx.pointer.click = null;
    }

    /* update pass */
    gl.useProgram(s.prog);
    s.pp.write.bind();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, s.pp.read.tex);
    setU(gl, s.prog, {
      uState: 0, uTexel: s.texel,
      uRi: ri, uRa: ra, uNi: ni, uNm: nm,
      uDt: ctx.params.dt,
    });
    drawQuad(gl, s.quad);
    s.pp.swap();

    /* display pass */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
    gl.useProgram(s.disp);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, s.pp.read.tex);
    setU(gl, s.disp, { uState: 0, uAspect: ctx.w / ctx.h, uHue: ctx.accentHue });
    drawQuad(gl, s.quad);
  },
};

function seed(ctx, empty = false) {
  const s = ctx._s; if (!s) return;
  const gl = ctx.gl;
  const N = s.N;
  const data = new Float32Array(N * N * 4);
  if (!empty) {
    /* long thin bands — the only shapes these laws call alive.
       Filled disks overfeed the ring kernel and never wake. */
    const bands = [];
    const nBands = 3 + (ctx.rng() * 2 | 0);
    for (let k = 0; k < nBands; k++) {
      bands.push({
        cx: N * .18 + ctx.rng() * N * .64,
        cy: N * .18 + ctx.rng() * N * .64,
        len: N * (.3 + ctx.rng() * .25),
        ang: ctx.rng() * Math.PI,
      });
    }
    const thick = 7 + ctx.rng() * 1.5;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let v = 0;
      for (const b of bands) {
        const dx = x - b.cx, dy = y - b.cy;
        const u = dx * Math.cos(b.ang) + dy * Math.sin(b.ang);
        const v2 = -dx * Math.sin(b.ang) + dy * Math.cos(b.ang);
        if (Math.abs(u) < b.len / 2 && Math.abs(v2) < thick / 2) { v = 1; break; }
      }
      if (v) { const i = (y * N + x) * 4; data[i] = 1; data[i + 3] = 1; }
    }
  }
  seedTarget(gl, s.pp.a, data);
  seedTarget(gl, s.pp.b, new Float32Array(N * N * 4));
  s._lastProbe = 0;
}
