/* 衍 · 叶序之螺 — number theory, already waiting */

import { hslCss, TAU } from '../../core/math.js';

export default {
  id: 'phyllotaxis', hall: 'growth', engine: 'canvas',

  params: [
    { key: 'angle', sym: '∠', label: '偏离角', min: 130, max: 145, step: .01, value: 137.508, format: v => v.toFixed(2) + '°' },
    { key: 'bloom', sym: '⌘', label: '绽放速度', min: .2, max: 4, step: .1, value: 1.6 },
    { key: 'dot', sym: '·', label: '籽径', min: 1.2, max: 5, step: .1, value: 2.4, format: v => v.toFixed(1) },
  ],
  buttons: [
    { id: 'golden', label: '回到黄金角', fn: c => c.host.setParam('angle', 137.508) },
    { id: 'replant', label: '重新落籽', fn: c => { c._s.n = 0; } },
  ],
  note: '137.508°——最抗拒有理数逼近的角度，最公平的排列。滑离它，看秩序瓦解。',

  async init(ctx) {
    ctx._s = { n: 0, hueJit: [] };
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  resize(ctx) {
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    const cx = ctx.w / 2, cy = ctx.h / 2;

    s.n += dt * P.bloom * 14;
    const count = Math.min(s.n | 0, 2200);
    const S = Math.min(ctx.w, ctx.h) * .46 / Math.sqrt(2200);
    const GA = P.angle * Math.PI / 180;

    /* slight persistence — petals leave soft trails */
    g.fillStyle = 'rgba(20,17,13,.32)';
    g.fillRect(0, 0, ctx.w, ctx.h);

    const from = Math.max(0, count - 90);
    g.globalCompositeOperation = 'lighter';
    for (let i = from; i < count; i++) {
      const r = S * Math.sqrt(i);
      const a = i * GA;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      const age = (i - from) / Math.max(1, count - from);
      const rr = Math.sqrt(i) / Math.sqrt(2200);
      g.fillStyle = hslCss(ctx.accentHue + 16 * rr + 10 * Math.sin(i * .05), .55 - .2 * rr, .45 + .25 * age, .5 + .4 * age);
      g.beginPath();
      g.arc(x, y, P.dot * (0.7 + rr * .8), 0, TAU);
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';

    /* measure of order: how close to golden */
    const dev = Math.abs(P.angle - 137.508);
    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = dev < .05 ? 'rgba(233,225,207,.55)' : 'rgba(166,58,43,.85)';
    g.fillText(dev < .05
      ? `θ = ${P.angle.toFixed(2)}°  · 黄金角 THE GOLDEN ANGLE`
      : `θ = ${P.angle.toFixed(2)}°  · 偏离 ${dev.toFixed(2)}°`, 24, ctx.h - 20);
  },
};
