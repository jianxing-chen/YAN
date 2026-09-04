/* 衍 · 宇宙之网 — "to those who have, more", weaving everything */

import { hslCss, TAU, gaussian } from '../../core/math.js';

const N = 1300;

export default {
  id: 'cosmicweb', hall: 'cosmos', engine: 'canvas',

  params: [
    { key: 'speed', sym: '⌘', label: '时间流速', min: .1, max: 3, step: .1, value: 1 },
    { key: 'soft', sym: 'ε', label: '软化', min: 2, max: 30, step: 1, value: 9, format: v => v | 0 },
  ],
  buttons: [
    { id: 'primordial', label: '回到均匀之初', fn: c => seed(c) },
  ],
  note: '滚轮旋转视角。偏差始于十万分之一，成于一百四十亿年。',

  async init(ctx) {
    ctx._s = { yaw: 0, t: 0 };
    seed(ctx);
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    const step = Math.min(dt, .04) * P.speed;

    if (ctx.pointer.down && ctx.pointer.dx) s.yaw += ctx.pointer.dx * .004;

    /* leapfrog, substeps */
    const sub = 1;
    const h = step / sub;
    const eps2 = P.soft * P.soft;
    const L = Math.min(ctx.w, ctx.h);
    for (let k = 0; k < sub; k++) {
      const F = s.f, X = s.x, Y = s.y, Z = s.z;
      for (let i = 0; i < N; i++) {
        let ax = 0, ay = 0, az = 0;
        const xi = X[i], yi = Y[i], zi = Z[i];
        for (let j = 0; j < N; j++) {
          if (j === i) continue;
          const dx = X[j] - xi, dy = Y[j] - yi, dz = Z[j] - zi;
          const d2 = dx * dx + dy * dy + dz * dz + eps2 * eps2 * 4;
          const inv = 1 / (d2 * Math.sqrt(d2));
          ax += dx * inv; ay += dy * inv; az += dz * inv;
        }
        F[i * 3] = ax; F[i * 3 + 1] = ay; F[i * 3 + 2] = az;
      }
      for (let i = 0; i < N; i++) {
        s.vx[i] += F[i * 3] * h; s.vy[i] += F[i * 3 + 1] * h; s.vz[i] += F[i * 3 + 2] * h;
        X[i] += s.vx[i] * h; Y[i] += s.vy[i] * h; Z[i] += s.vz[i] * h;
      }
      s.t += h;
    }

    /* draw: rotate + project */
    g.fillStyle = 'rgba(20,17,13,.3)';
    g.fillRect(0, 0, ctx.w, ctx.h);
    const cy0 = Math.cos(s.yaw), sy0 = Math.sin(s.yaw);
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < N; i++) {
      const x = s.x[i], y = s.y[i], z = s.z[i];
      const X = x * cy0 - z * sy0, Z = x * sy0 + z * cy0;
      const persp = 1 / (1 + Z * .02);
      const px = ctx.w / 2 + X * (L * .44 / 26) * persp;
      const py = ctx.h / 2 + y * (L * .44 / 26) * persp;
      const v = Math.min(1, Math.hypot(s.vx[i], s.vy[i], s.vz[i]) * .8);
      g.fillStyle = hslCss(ctx.accentHue + 14 - 10 * v, .35, .25 + .3 * v, .35 + .4 * v);
      g.fillRect(px, py, 1.6 * persp + .6, 1.6 * persp + .6);
    }
    g.globalCompositeOperation = 'source-over';

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.42)';
    g.fillText(`t = ${s.t.toFixed(2)}   N = ${N}   视角 ${((s.yaw * 180 / Math.PI) % 360 | 0)}°`, 24, ctx.h - 20);
  },
};

function seed(ctx) {
  const s = ctx._s;
  s.x = new Float32Array(N); s.y = new Float32Array(N); s.z = new Float32Array(N);
  s.vx = new Float32Array(N); s.vy = new Float32Array(N); s.vz = new Float32Array(N);
  s.f = new Float32Array(N * 3);
  s.t = 0;
  const R = 26;
  for (let i = 0; i < N; i++) {
    s.x[i] = (ctx.rng() - .5) * R * 2 + gaussian(ctx.rng) * .7;
    s.y[i] = (ctx.rng() - .5) * R * 2 + gaussian(ctx.rng) * .7;
    s.z[i] = (ctx.rng() - .5) * R * 2 + gaussian(ctx.rng) * .7;
  }
}
