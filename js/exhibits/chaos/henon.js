/* 衍 · 埃农映射 — stretch, fold, remember */

import { hslCss } from '../../core/math.js';

export default {
  id: 'henon', hall: 'chaos', engine: 'canvas',

  params: [
    { key: 'a', sym: 'a', label: '拉伸', min: .2, max: 1.55, step: .005, value: 1.4, format: v => v.toFixed(3) },
    { key: 'b', sym: 'b', label: '折叠', min: .05, max: .99, step: .005, value: .3, format: v => v.toFixed(3) },
    { key: 'dust', sym: '◦', label: '每帧尘量', min: 200, max: 9000, step: 100, value: 4200, format: v => v | 0 },
  ],
  buttons: [
    { id: 'reclear', label: '重落尘埃', fn: c => { reseed(c); } },
  ],
  note: '滚轮微调拉伸 a。a≈1.4、b≈0.3 是那条著名的尘埃之岸；a 越过 1.4 岸线开始断裂。',

  async init(ctx) {
    ctx._s = { x: 0, y: 0, n: 0 };
    reseed(ctx, true);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    const ptr = ctx.pointer;
    if (ptr.wheel) {
      P.a = Math.min(1.55, Math.max(.2, P.a - ptr.wheel * .008));
      ctx.host.setParam('a', P.a);
      reseed(ctx, true);
    }

    /* slow breath of the old dust */
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(20,17,13,.006)';
    g.fillRect(0, 0, ctx.w, ctx.h);

    const sc = Math.min(ctx.w / 3.4, ctx.h / 3.2);
    const cx = ctx.w / 2, cy = ctx.h / 2;
    const M = Math.max(P.dust, 3000) | 0;
    g.globalCompositeOperation = 'lighter';
    const col = hslCss(ctx.accentHue, .72, 60, .1);
    g.fillStyle = col;
    for (let i = 0; i < M; i++) {
      const nx = 1 - P.a * s.x * s.x + s.y;
      const ny = P.b * s.x;
      s.x = nx; s.y = ny;
      s.n++;
      if (Math.abs(s.x) > 1e4) { reseed(ctx); continue; }
      g.fillRect(cx + s.x * sc, cy + s.y * sc * 1.15, 1, 1);
    }

    /* the present moment */
    g.fillStyle = 'rgba(233,225,207,.95)';
    g.fillRect(cx + s.x * sc - 1, cy + s.y * sc * 1.15 - 1, 2.4, 2.4);
    g.globalCompositeOperation = 'source-over';

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.4)';
    g.fillText(`a = ${P.a.toFixed(3)}   b = ${P.b.toFixed(3)}   n = ${s.n.toLocaleString()}`, 24, ctx.h - 20);
  },
};

function reseed(ctx, clear = false) {
  const s = ctx._s; if (!s) return;
  const r = ctx.rng;
  s.x = .1 + r() * .2; s.y = .1 + r() * .2; s.n = 0;
  const g = ctx.g2;
  if (clear) {
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#14110D';
    g.fillRect(0, 0, ctx.w, ctx.h);
    /* settle onto the attractor */
    for (let i = 0; i < 120; i++) {
      const nx = 1 - ctx.params.a * s.x * s.x + s.y;
      s.y = ctx.params.b * s.x; s.x = nx;
    }
    /* initial dust */
    const sc = Math.min(ctx.w / 3.4, ctx.h / 3.2);
    const cx = ctx.w / 2, cy = ctx.h / 2;
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = hslCss(ctx.accentHue, .72, 60, .075);
    for (let i = 0; i < 430000; i++) {
      const nx = 1 - ctx.params.a * s.x * s.x + s.y;
      s.y = ctx.params.b * s.x; s.x = nx;
      g.fillRect(cx + s.x * sc, cy + s.y * sc * 1.15, 1, 1);
    }
    g.globalCompositeOperation = 'source-over';
  }
}
