/* 衍 · 倍分岔图 — one parabola, the whole landscape of complexity */

import { hslCss } from '../../core/math.js';

export default {
  id: 'bifurcation', hall: 'chaos', engine: 'canvas',

  params: [
    { key: 'bright', sym: '✦', label: '尘亮度', min: .2, max: 2, step: .05, value: 1 },
    { key: 'flow', sym: '⌘', label: '巡游速度', min: 0, max: 1, step: .02, value: .12 },
  ],
  buttons: [
    { id: 'recalc', label: '重算全图', fn: c => renderMap(c) },
    { id: 'sweep', label: '自动巡游 · 开/关', fn: c => { c._s.auto = !c._s.auto; } },
  ],
  note: '拖动或滚轮移动游标 r。下方实时条带是选定 r 的种群时间序列；「周期」由末 256 代检得。',

  async init(ctx) {
    ctx._s = { r: 3.2, auto: true, series: [], map: document.createElement('canvas'), needMap: true };
    ctx._s.map.width = 1600; ctx._s.map.height = 800;
    renderMap(ctx);
  },

  resize(ctx) { renderMap(ctx); },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    const ptr = ctx.pointer;

    if (ptr.inside && (ptr.down || (ptr.x !== 0 && !ptr.down))) s.r = 2.4 + 1.6 * Math.min(1, Math.max(0, ptr.x / ctx.w));
    if (ptr.wheel) s.r = Math.min(4, Math.max(2.4, s.r + ptr.wheel * .004));
    if (s.auto && !ptr.inside && P.flow > 0) {
      s.r += dt * P.flow * .3;
      if (s.r > 3.99) s.r = 2.4;
    }

    g.fillStyle = '#14110D';
    g.fillRect(0, 0, ctx.w, ctx.h);
    g.drawImage(s.map, 0, 0, ctx.w, ctx.h);

    /* marker */
    const mx = (s.r - 2.4) / 1.6 * ctx.w;
    g.strokeStyle = 'rgba(166,58,43,.85)';
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(mx, 0); g.lineTo(mx, ctx.h); g.stroke();

    /* live series for chosen r */
    const r = s.r, stripH = Math.min(120, ctx.h * .18), sy = ctx.h - stripH;
    let x = s._x ?? .5;
    const series = s.series;
    for (let i = 0; i < 3; i++) {
      x = r * x * (1 - x);
      series.push(x);
    }
    if (series.length > 160) series.splice(0, series.length - 160);
    s._x = x;

    g.fillStyle = 'rgba(20,17,13,.75)';
    g.fillRect(0, sy, ctx.w, stripH);
    g.strokeStyle = 'rgba(233,225,207,.14)';
    g.strokeRect(.5, sy + .5, ctx.w - 1, stripH - 1);

    g.fillStyle = hslCss(ctx.accentHue, .62, 60, .85);
    for (let i = 0; i < series.length; i++) {
      const px = i / 160 * ctx.w;
      const py = sy + stripH - series[i] * (stripH - 10) - 5;
      g.fillRect(px, py, 1.6, 1.6);
    }

    /* period detection */
    const period = detectPeriod(r);
    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.55)';
    g.fillText(`r = ${r.toFixed(4)}   ${period}`, 24, sy + 16);

    g.fillStyle = 'rgba(233,225,207,.3)';
    g.fillText('2.4', 8, ctx.h * .5 - stripH / 2 - 8);
    g.fillText('4.0', ctx.w - 34, ctx.h * .5 - stripH / 2 - 8);
  },
};

function renderMap(ctx) {
  const s = ctx._s; if (!s) return;
  const W = s.map.width, H = s.map.height, g = s.map.getContext('2d');
  g.fillStyle = '#14110D';
  g.fillRect(0, 0, W, H);
  const bright = ctx.params.bright;
  g.fillStyle = `rgba(233,225,207,${.3 * bright})`;
  for (let px = 0; px < W; px++) {
    const r = 2.4 + 1.6 * px / W;
    let x = .5;
    for (let i = 0; i < 300; i++) x = r * x * (1 - x);
    for (let i = 0; i < 420; i++) {
      x = r * x * (1 - x);
      const py = H - x * H;
      g.fillRect(px, py, 1, 1);
    }
  }
}

function detectPeriod(r) {
  let x = .5;
  for (let i = 0; i < 600; i++) x = r * x * (1 - x);
  const hist = [];
  for (let i = 0; i < 512; i++) { x = r * x * (1 - x); hist.push(x); }
  for (let p = 1; p <= 16; p++) {
    let ok = true;
    for (let i = 512 - 8 * p; i < 512 - p; i++) {
      if (Math.abs(hist[i] - hist[i + p]) > 1e-3) { ok = false; break; }
    }
    if (ok) return p === 1 ? '周期一 · 稳态 STEADY' : `周期 ${p}`;
  }
  if (x !== x) return '发散 DIVERGED';
  return '混沌 CHAOS';
}
