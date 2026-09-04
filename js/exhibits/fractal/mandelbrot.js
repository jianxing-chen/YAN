/* 衍 · 曼德博深潜 — the honest infinity, float-bound and unashamed */

import { makeProgram, makeQuad, drawQuad, setU } from '../../core/gl.js';

const FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform vec2 uCenter;
uniform float uScale;   // view height in complex plane
uniform float uAspect;  // w/h
uniform float uIter;
uniform float uHue;
out vec4 frag;

vec3 hsl2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z - 1.0));
}

void main(){
  vec2 p = uCenter + (uv * 2.0 - 1.0) * vec2(uScale * uAspect, uScale) * 0.5;
  vec2 z = vec2(0.0);
  float n = -1.0;
  for (float i = 0.0; i < 900.0; i++) {
    if (i >= uIter) break;
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + p;
    if (dot(z,z) > 512.0) { n = i; break; }
  }
  if (n < 0.0) { frag = vec4(0.055, 0.047, 0.038, 1.0); return; }
  float sn = n + 1.0 - log2(log2(dot(z,z)) * 0.5);
  float t = sn / uIter;
  float b = pow(t, 2.8);                 // boundary proximity: rim glows, far field rests
  float band = 0.5 + 0.5 * sin(sn * 0.35);
  float slow = 0.5 + 0.5 * sin(log2(sn + 1.0) * 2.4);   // slow bands over the open sea
  float depth = 1.0 / (1.0 + sn * 0.05);
  float light = 0.045 + 0.085 * slow * depth + (0.38 * band) * b;
  float hue = uHue + 130.0 * t - 26.0 * slow * depth;
  vec3 col = hsl2rgb(vec3(fract(hue/360.0), 0.52 + 0.28 * b, clamp(light, 0.0, 0.95)));
  col += vec3(0.40, 0.36, 0.28) * pow(b, 9.0); // white-hot rim
  frag = vec4(col, 1.0);
}`;

/* curated dive targets — {re, im, scale} within float-honest limits */
const SPOTS = [
  { re: -0.746806, im: 0.10793, scale: 0.00016, name: '海马谷' },
  { re: 0.2925755, im: 0.0149977, scale: 0.00008, name: '象群谷' },
  { re: -0.088, im: 0.654, scale: 0.0006, name: '三旋谷' },
  { re: -1.7492046, im: 0.0000578, scale: 0.00008, name: '小曼德博' },
  { re: -0.7269, im: 0.1889, scale: 0.0004, name: '双螺旋' },
];

export default {
  id: 'mandelbrot', hall: 'fractal', engine: 'webgl',

  params: [
    { key: 'detail', sym: '∘', label: '迭代深度', min: 80, max: 800, step: 10, value: 260, format: v => v | 0 },
  ],
  buttons: [
    { id: 'dive', label: '自动深潜 · 开/关', fn: c => { c._s.diving = !c._s.diving; } },
    { id: 'surface', label: '回到海面', fn: c => { c._s.center = [-0.6, 0]; c._s.scale = 3.0; c._s.diving = false; } },
  ],
  note: '拖动平移 · 滚轮以指针为锚缩放。浮点之诚：约两万倍为深潜之底。',

  async init(ctx) {
    const gl = ctx.gl;
    ctx._s = {
      prog: makeProgram(gl, FS, 'mandelbrot'),
      quad: makeQuad(gl),
      center: [-0.6, 0], scale: 3.0,
      diving: true, spot: 0, dwell: 0,
      need: true,
    };
    this.resize(ctx);
  },

  resize(ctx) {
    /* deep iteration is dear; a partial dpr still beats blur */
    const k = Math.min(ctx.dpr, 1.5);
    const w = Math.min(2200, Math.round(ctx.w * k)), h = Math.min(1300, Math.round(ctx.h * k));
    if (ctx.canvas.width !== w || ctx.canvas.height !== h) {
      ctx.canvas.width = w; ctx.canvas.height = h;
    }
    ctx.gl.viewport(0, 0, w, h);
    ctx._s.need = true;
  },

  frame(ctx, dt, t) {
    const s = ctx._s, gl = ctx.gl;
    const ptr = ctx.pointer;

    /* interaction */
    if (ptr.down && (ptr.dx || ptr.dy)) {
      const f = s.scale / ctx.h;
      s.center[0] -= ptr.dx * f; s.center[1] += ptr.dy * f;
      s.diving = false; s.need = true;
    }
    if (ptr.wheel) {
      const f = Math.exp(-ptr.wheel * .0016 * 8);
      const px = (ptr.x / ctx.w * 2 - 1) * s.scale * (ctx.w / ctx.h) * .5;
      const py = -(ptr.y / ctx.h * 2 - 1) * s.scale * .5;
      s.center[0] += px * (1 - f);
      s.center[1] += py * (1 - f);
      s.scale *= f;
      s.scale = Math.max(6e-5, Math.min(4, s.scale));
      s.diving = false; s.need = true;
    }

    /* auto-dive */
    if (s.diving) {
      const target = SPOTS[s.spot % SPOTS.length];
      const ts = target.scale;
      s.scale *= Math.exp(-dt * .34);
      const k = 1 - Math.exp(-dt * .5);
      s.center[0] += (target.re - s.center[0]) * k;
      s.center[1] += (target.im - s.center[1]) * k;
      if (s.scale < ts * 1.06) {
        s.dwell += dt;
        if (s.dwell > 5) { s.dwell = 0; s.spot++; s.scale = 2.6; s.center = [-0.6, 0]; }
      }
      s.need = true;
    }

    if (!s.need) return;
    s.need = false;

    const iter = Math.min(ctx.params.detail, 140 + 80 * Math.log2(3.0 / s.scale));
    gl.useProgram(s.prog);
    setU(gl, s.prog, {
      uCenter: s.center,
      uScale: s.scale,
      uAspect: ctx.w / ctx.h,
      uIter: Math.min(ctx.params.detail, iter),
      uHue: ctx.accentHue,
    });
    drawQuad(gl, s.quad);

    /* location plaque */
    const g = ctx.g2;
    if (!g) {
      const label = s.diving ? `深潜中 · ${SPOTS[s.spot % SPOTS.length].name}` : `re ${s.center[0].toFixed(6)}  im ${s.center[1].toFixed(6)}  ×${(3.0 / s.scale).toExponential(1)}`;
      drawOverlayText(ctx.canvas, label);
    }
  },
};

/* GL canvases have no 2d context; overlay text is drawn into a corner via a 2d layer */
function drawOverlayText(canvas, text) {
  let el = canvas.parentElement.querySelector('.gl-readout');
  if (!el) {
    el = document.createElement('div');
    el.className = 'gl-readout';
    el.style.cssText = 'position:absolute;left:24px;bottom:18px;font:10px "SF Mono",Menlo,monospace;color:rgba(233,225,207,.45);letter-spacing:.06em;pointer-events:none;white-space:pre';
    canvas.parentElement.appendChild(el);
  }
  el.textContent = text;
}
