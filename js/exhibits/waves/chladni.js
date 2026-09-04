/* 衍 · 克拉尼之盘 — sand walks to the silence */

import { hslCss, TAU } from '../../core/math.js';

const NP = 5200;

export default {
  id: 'chladni', hall: 'waves', engine: 'canvas',

  params: [
    { key: 'm', sym: 'm', label: '模 m', min: 1, max: 12, step: 1, value: 5, format: v => v | 0 },
    { key: 'n', sym: 'n', label: '模 n', min: 1, max: 12, step: 1, value: 2, format: v => v | 0 },
    { key: 'flow', sym: '⌘', label: '振动强度', min: .1, max: 1.5, step: .05, value: .55 },
  ],
  buttons: [
    { id: 'resand', label: '重撒砂', fn: c => sand(c) },
    { id: 'chord', label: '随机一音', fn: c => {
      c.host.setParam('m', 1 + ((c.rng() * 12) | 0));
      c.host.setParam('n', 1 + ((c.rng() * 12) | 0));
    } },
  ],
  note: '每一粒砂都走向 s=0 的寂静之处。图案是万粒逃亡的统计结果。',

  async init(ctx) {
    ctx._s = { x: new Float32Array(NP), y: new Float32Array(NP), vx: new Float32Array(NP), vy: new Float32Array(NP) };
    sand(ctx);
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    const m = P.m | 0, n = P.n | 0;
    const size = Math.min(ctx.w, ctx.h) * .9;
    const ox = (ctx.w - size) / 2, oy = (ctx.h - size) / 2;

    /* plate rim */
    g.strokeStyle = 'rgba(140,122,80,.4)';
    g.lineWidth = 1;
    g.strokeRect(ox - 6.5, oy - 6.5, size + 13, size + 13);

    const F = P.flow;
    const damp = .86;
    const step = Math.min(dt, .033);
    const pi_m = Math.PI * m, pi_n = Math.PI * n;

    for (let i = 0; i < NP; i++) {
      const X = s.x[i], Y = s.y[i];
      const cx = Math.cos(pi_m * X), cy = Math.cos(pi_n * Y);
      const sx = Math.sin(pi_m * X), sy = Math.sin(pi_n * Y);
      const cxn = Math.cos(pi_n * X), cym = Math.cos(pi_m * Y);
      const sxn = Math.sin(pi_n * X), sym = Math.sin(pi_m * Y);
      /* s = cos(mπX)cos(nπY) − cos(nπX)cos(mπY) */
      const sVal = cx * cy - cxn * cym;
      /* ∇s — descent drives grains toward nodes */
      const dsx = -pi_m * sx * cy + pi_n * sxn * cym;
      const dsy = -pi_n * cx * sy + pi_m * cxn * sym;
      s.vx[i] = (s.vx[i] - dsx * F * step) * damp;
      s.vy[i] = (s.vy[i] - dsy * F * step) * damp;
      let x = X + s.vx[i] * step * 40;
      let y = Y + s.vy[i] * step * 40;
      /* a hint of Brownian life from the bow */
      x += (ctx.rng() - .5) * .0012;
      y += (ctx.rng() - .5) * .0012;
      s.x[i] = Math.min(1, Math.max(0, x));
      s.y[i] = Math.min(1, Math.max(0, y));
    }

    /* draw */
    g.fillStyle = 'rgba(20,17,13,.5)';
    g.fillRect(ox, oy, size, size);
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < NP; i++) {
      const px = ox + s.x[i] * size, py = oy + s.y[i] * size;
      const deep = 1;
      g.fillStyle = hslCss(ctx.accentHue + 12, .42, 30 + 26 * deep, .5);
      g.fillRect(px, py, 1.6, 1.6);
    }
    g.globalCompositeOperation = 'source-over';

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.4)';
    g.fillText(`mode (m,n) = (${m},${n})`, 24, ctx.h - 20);
  },
};

function sand(ctx) {
  const s = ctx._s; if (!s) return;
  for (let i = 0; i < NP; i++) {
    s.x[i] = ctx.rng(); s.y[i] = ctx.rng();
    s.vx[i] = 0; s.vy[i] = 0;
  }
}
