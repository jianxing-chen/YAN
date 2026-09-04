/* 衍 · 朱利亚之眼 — the moods of a constant */

import { makeProgram, makeQuad, drawQuad, setU } from '../../core/gl.js';

const FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform vec2 uC;
uniform float uAspect;
uniform float uHue;
out vec4 frag;

vec3 hsl2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z - 1.0));
}

void main(){
  vec2 p = (uv * 2.0 - 1.0) * vec2(1.75 * uAspect, 1.75);
  vec2 z = p;
  float n = -1.0;
  for (float i = 0.0; i < 400.0; i++) {
    if (i >= 240.0) break;
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + uC;
    if (dot(z,z) > 256.0) { n = i; break; }
  }
  if (n < 0.0) { frag = vec4(0.055, 0.047, 0.038, 1.0); return; }
  float sn = n + 1.0 - log2(log2(dot(z,z)) * 0.5);
  float t = sn / 240.0;
  float b = pow(t, 2.6);
  float band = 0.5 + 0.5 * sin(sn * 0.4);
  float slow = 0.5 + 0.5 * sin(log2(sn + 1.0) * 2.4);
  float depth = 1.0 / (1.0 + sn * 0.06);
  float light = 0.045 + 0.09 * slow * depth + (0.42 * band) * b;
  float hue = uHue + 130.0 * t - 26.0 * slow * depth;
  vec3 col = hsl2rgb(vec3(fract(hue/360.0), 0.52 + 0.28 * b, clamp(light, 0.0, 0.95)));
  col += vec3(0.40, 0.36, 0.28) * pow(b, 9.0);
  frag = vec4(col, 1.0);
}`;

export default {
  id: 'julia', hall: 'fractal', engine: 'webgl',

  params: [
    { key: 'speed', sym: '⌘', label: 'c 之漂流', min: 0, max: 2, step: .02, value: .5 },
    { key: 'radius', sym: 'r', label: '漂流半径', min: .3, max: .95, step: .01, value: .7885, format: v => v.toFixed(3) },
  ],
  buttons: [
    { id: 'freeze', label: '凝住 c · 开/关', fn: c => { c._s.frozen = !c._s.frozen; } },
  ],
  note: '点击画布：指针位置即是新的 c。c 的表面长度 0.7885 恰在连通与尘埃的岸边。',

  async init(ctx) {
    const gl = ctx.gl;
    ctx._s = {
      prog: makeProgram(gl, FS, 'julia'),
      quad: makeQuad(gl),
      theta: ctx.rng() * 6.28,
      c: [0, 0], frozen: false,
    };
    this.resize(ctx);
  },


  dispose(ctx) {
    const gl = ctx.gl, s = ctx._s;
    if (!gl || !s) return;
    gl.deleteProgram(s.prog);
    gl.deleteVertexArray(s.quad);
  },
  resize(ctx) {
    const k = Math.min(ctx.dpr, 1.5);
    const w = Math.min(2000, Math.round(ctx.w * k)), h = Math.min(1250, Math.round(ctx.h * k));
    if (ctx.canvas.width !== w || ctx.canvas.height !== h) {
      ctx.canvas.width = w; ctx.canvas.height = h;
    }
    ctx.gl.viewport(0, 0, w, h);
  },

  frame(ctx, dt) {
    const s = ctx._s, gl = ctx.gl;
    const ptr = ctx.pointer;

    if (ptr.click) {
      const cx = (ptr.click.x / ctx.w * 2 - 1) * 1.35;
      const cy = -(ptr.click.y / ctx.h * 2 - 1) * 1.35;
      const mag = Math.hypot(cx, cy) || 1;
      s.c = [cx, cy];
      s.theta = Math.atan2(cy, cx);
      ctx.params.radius = Math.min(.95, Math.max(.3, mag));
      ctx.host.setParam('radius', ctx.params.radius);
    }

    if (!s.frozen && ctx.params.speed > 0) {
      s.theta += dt * ctx.params.speed * .25;
      s.c = [ctx.params.radius * Math.cos(s.theta), ctx.params.radius * Math.sin(s.theta)];
    }

    gl.useProgram(s.prog);
    setU(gl, s.prog, { uC: s.c, uAspect: ctx.w / ctx.h, uHue: ctx.accentHue });
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
      el.textContent = `c = ${s.c[0].toFixed(4)} ${s.c[1] >= 0 ? '+' : ''}${s.c[1].toFixed(4)}i` + (s.frozen ? '   (frozen)' : '');
    }
  },
};
