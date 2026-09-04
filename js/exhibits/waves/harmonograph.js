/* 衍 · 谐振记录仪 — a drawing in the act of dying */

import { hslCss, TAU } from '../../core/math.js';

export default {
  id: 'harmonograph', hall: 'waves', engine: 'canvas',

  params: [
    { key: 'ratio', sym: 'p:q', label: '频率比', min: .9, max: 3.2, step: .001, value: 1.5, format: v => v.toFixed(3) },
    { key: 'detune', sym: 'δ', label: '失谐', min: 0, max: .02, step: .0002, value: .004, format: v => v.toFixed(4) },
    { key: 'damp', sym: 'd', label: '阻尼', min: .05, max: .6, step: .01, value: .18 },
    { key: 'speed', sym: '⌘', label: '笔速', min: .2, max: 2, step: .05, value: .8 },
  ],
  note: '滚轮微调频率之比——有理则闭合如印，无理则织满全域。画至力竭，自换新章。',

  async init(ctx) {
    ctx._s = { t: 0, gen: 0, seedPhase: ctx.rng() * TAU };
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    const ptr = ctx.pointer;
    if (ptr.wheel) {
      const v = Math.min(3.2, Math.max(.9, P.ratio - ptr.wheel * .002));
      ctx.host.setParam('ratio', v);
      restart(ctx);
    }

    const A = Math.min(ctx.w, ctx.h) * .38;
    const cx = ctx.w / 2, cy = ctx.h / 2;
    const f1 = 1, f2 = P.ratio, f3 = 1 + P.detune * 10, f4 = P.ratio + P.detune * 10;
    const T_MAX = 7 / P.damp;   // amplitude e-fold lifetime

    const px = (t) => cx + A * 0.55 * Math.sin(TAU * f1 * t + s.seedPhase) * Math.exp(-P.damp * t)
      + A * 0.45 * Math.sin(TAU * f2 * t) * Math.exp(-P.damp * .8 * t);
    const py = (t) => cy + A * 0.55 * Math.sin(TAU * f3 * t + s.seedPhase * 1.7) * Math.exp(-P.damp * t)
      + A * 0.45 * Math.sin(TAU * f4 * t + Math.PI / 2) * Math.exp(-P.damp * .8 * t);

    /* draw a step of the pen */
    const steps = 90;
    const t0 = s.t;
    const t1 = s.t + dt * P.speed * 2.2;
    const hueDrift = (s.gen * 13 + t0 * 2) % 60;
    g.strokeStyle = hslCss(ctx.accentHue + hueDrift - 30, .5, 52, .22);
    g.lineWidth = .8;
    g.beginPath();
    g.moveTo(px(t0), py(t0));
    for (let i = 1; i <= steps; i++) {
      const t = t0 + (t1 - t0) * i / steps;
      g.lineTo(px(t), py(t));
    }
    g.stroke();
    s.t = t1;

    if (s.t > T_MAX) restart(ctx);

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.4)';
    g.fillText(`f₂:f₁ = ${P.ratio.toFixed(4)}   量 ${s.gen}   t = ${s.t.toFixed(1)}`, 24, ctx.h - 20);
  },
};

function restart(ctx) {
  const s = ctx._s; if (!s) return;
  s.t = 0; s.gen++;
  s.seedPhase = ctx.rng() * TAU;
  ctx.g2.globalCompositeOperation = 'source-over';
  ctx.g2.fillStyle = 'rgba(20,17,13,.65)';
  ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  ctx.g2.fillStyle = '#14110D';
}
