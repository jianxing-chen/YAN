/* 衍 · 牛顿花园 — three roots contest a territory */

import { makeProgram, makeQuad, drawQuad, setU } from '../../core/gl.js';

const FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform float uPower;   // p, 3..8
uniform float uOmega;   // relaxation
uniform float uHue;
out vec4 frag;

vec3 hsl2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z - 1.0));
}

vec2 cdiv(vec2 a, vec2 b){
  float d = dot(b,b);
  return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / d;
}
vec2 cexp(float th){ return vec2(cos(th), sin(th)); }

void main(){
  vec2 z = (uv * 2.0 - 1.0) * vec2(1.6, 1.6);
  float p = uPower;
  int roots = int(p);
  float n = -1.0;
  int which = 0;
  for (float i = 0.0; i < 64.0; i++) {
    if (i >= 48.0) break;
    // z^p
    float r = length(z);
    float th = atan(z.y, z.x);
    vec2 zp = pow(r, p) * cexp(th * p);
    // f'(z) = p z^(p-1)
    vec2 zm1 = pow(r, p - 1.0) * cexp(th * (p - 1.0));
    vec2 step = cdiv(zp - vec2(1.0, 0.0), p * zm1);
    z -= uOmega * step;
    if (length(step) < 1e-5) { n = i; break; }
  }
  // identify root by angle
  if (n >= -0.5) {
    float th = atan(z.y, z.x);
    float seg = mod((th + 3.14159265) / (6.28318530 / p) + 0.5, float(roots));
    which = int(seg);
    n = seg; // fractional → blend on boundary
  }
  vec3 col = vec3(0.055, 0.047, 0.038);
  if (n >= -0.5) {
    float t = n / 48.0;
    float hue = uHue + float(which) * (360.0 / float(roots));
    float light = 0.10 + 0.44 * pow(t, 1.2) * (0.55 + 0.45 * sin(n * 1.2));
    col = hsl2rgb(vec3(fract(hue / 360.0), 0.46, clamp(light, 0.0, 0.85)));
  }
  frag = vec4(col, 1.0);
}`;

export default {
  id: 'newton', hall: 'fractal', engine: 'webgl',

  params: [
    { key: 'power', sym: 'p', label: '方程次数', min: 3, max: 9, step: 1, value: 3, format: v => v | 0 },
    { key: 'omega', sym: 'ω', label: '松弛度', min: .2, max: 1.6, step: .01, value: 1, format: v => v.toFixed(2) },
  ],
  buttons: [
    { id: 'shake', label: '微扰 ω', fn: c => { const v = Math.min(1.6, .86 + c.rng() * .5); c.host.setParam('omega', v); } },
  ],
  note: 'ω=1 是教科书；ω 偏离 1，领土地图进入地质剧变。滚轮亦可微调 ω。',

  async init(ctx) {
    const gl = ctx.gl;
    ctx._s = { prog: makeProgram(gl, FS, 'newton'), quad: makeQuad(gl), lastP: -1 };
    this.resize(ctx);
  },


  dispose(ctx) {
    const gl = ctx.gl, s = ctx._s;
    if (!gl || !s) return;
    gl.deleteProgram(s.prog);
    gl.deleteVertexArray(s.quad);
  },
  resize(ctx) {
    const k = Math.min(ctx.dpr, 2);
    const w = Math.min(2600, Math.round(ctx.w * k)), h = Math.min(1600, Math.round(ctx.h * k));
    if (ctx.canvas.width !== w || ctx.canvas.height !== h) {
      ctx.canvas.width = w; ctx.canvas.height = h;
    }
    ctx.gl.viewport(0, 0, w, h);
  },

  frame(ctx) {
    const s = ctx._s, gl = ctx.gl;
    if (ctx.pointer.wheel) {
      const v = Math.min(1.6, Math.max(.2, ctx.params.omega - ctx.pointer.wheel * .01));
      ctx.host.setParam('omega', v);
    }
    gl.useProgram(s.prog);
    setU(gl, s.prog, {
      uPower: Math.round(ctx.params.power),
      uOmega: ctx.params.omega,
      uHue: ctx.accentHue,
    });
    drawQuad(gl, s.quad);

    const g = ctx.g2;
    if (!g) {
      let el = ctx.canvas.parentElement.querySelector('.gl-readout');
      if (!el) {
        el = document.createElement('div');
        el.className = 'gl-readout';
        el.style.cssText = 'position:absolute;left:24px;bottom:18px;font:10px "SF Mono",Menlo,monospace;color:rgba(233,225,207,.45);letter-spacing:.06em;pointer-events:none;white-space:pre';
        ctx.canvas.parentElement.appendChild(el);
      }
      el.textContent = `z^${Math.round(ctx.params.power)} − 1 = 0    ω = ${ctx.params.omega.toFixed(2)}`;
    }
  },
};
