/* 衍 · 轨道之诗 — orbital music, not as a metaphor */

import { hslCss, TAU } from '../../core/math.js';

const RATIOS = [[2, 1], [3, 2], [5, 3], [5, 2], [4, 3], [9, 5]];

export default {
  id: 'resonance', hall: 'cosmos', engine: 'canvas',

  params: [
    { key: 'p', sym: 'p', label: '外轮 p', min: 1, max: 9, step: 1, value: 3, format: v => v | 0 },
    { key: 'q', sym: 'q', label: '内轮 q', min: 1, max: 9, step: 1, value: 2, format: v => v | 0 },
    { key: 'speed', sym: '⌘', label: '公转速度', min: .2, max: 2, step: .05, value: .8 },
  ],
  buttons: RATIOS.map(([p, q]) => ({
    id: `r${p}${q}`, label: `${p}:${q}`,
    fn: c => { c.host.setParam('p', p); c.host.setParam('q', q); },
  })),
  note: '有理数绽放然后闭合；无理数铺满然后成为背景。换比时，纸会重新铺开。',

  async init(ctx) {
    ctx._s = { t: 0, lastpq: '' };
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    const p = P.p | 0, q = P.q | 0;
    const key = `${p}:${q}`;
    if (key !== s.lastpq) {
      s.lastpq = key;
      s.t = 0;
      ctx.g2.fillStyle = '#14110D';
      ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
    }

    const cx = ctx.w / 2, cy = ctx.h / 2;
    const R1 = Math.min(ctx.w, ctx.h) * .36;
    const R2 = R1 * .45;

    g.fillStyle = 'rgba(20,17,13,.06)';
    g.fillRect(0, 0, ctx.w, ctx.h);

    /* orbit guides */
    g.strokeStyle = 'rgba(233,225,207,.07)';
    g.lineWidth = 1;
    g.beginPath(); g.arc(cx, cy, R1, 0, TAU); g.stroke();
    g.beginPath(); g.arc(cx, cy, R2, 0, TAU); g.stroke();

    const w = dt * P.speed * TAU * .5;
    s.t += w;
    const a1 = s.t * q, a2 = s.t * p + Math.PI;
    const x1 = cx + Math.cos(a1) * R1, y1 = cy + Math.sin(a1) * R1;
    const x2 = x1 + Math.cos(a2) * R2, y2 = y1 + Math.sin(a2) * R2;

    /* trace the epi-planet */
    s.pts = s.pts || [];
    s.pts.push([x2, y2]);
    if (s.pts.length > 4200) s.pts.shift();
    g.strokeStyle = hslCss(ctx.accentHue + 8, .55, 52, .55);
    g.lineWidth = 1.1;
    g.beginPath();
    s.pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
    g.stroke();

    /* bodies */
    g.fillStyle = 'rgba(233,225,207,.75)';
    g.beginPath(); g.arc(x1, y1, 3.4, 0, TAU); g.fill();
    g.fillStyle = hslCss(ctx.accentHue + 8, .6, 62, 1);
    g.beginPath(); g.arc(x2, y2, 4.6, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(233,225,207,.2)';
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();

    /* sun */
    g.fillStyle = 'rgba(166,58,43,.9)';
    g.beginPath(); g.arc(cx, cy, 5, 0, TAU); g.fill();

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.45)';
    let a = p, b = q;
    while (b) { const t = a % b; a = b; b = t; }
    const petals = (p * q) / (a || 1);
    g.fillText(`${p}:${q} · ${petals} 拍后闭合 · phase ${(s.t / TAU % 1).toFixed(2)}`, 24, ctx.h - 20);
  },
};
