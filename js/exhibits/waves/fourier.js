/* 衍 · 傅里叶之轮 — every shape is a chord of circles */

import { hslCss, TAU } from '../../core/math.js';

/* default path: a lemniscate ∞ — "the finite drawn without lifting the pen" */
function lemniscate(n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / n * TAU;
    const d = 1 + Math.sin(t) * Math.sin(t);
    pts.push([Math.cos(t) / d, Math.sin(t) * Math.cos(t) / d]);
  }
  return pts;
}

function star(n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * TAU * 2.5;
    const r = t < .5 ? .5 : .5 * (1 - (t - .5) * 2);
    pts.push([Math.cos(a) * .8 * (0.35 + .45 * Math.sin(t * Math.PI * 3)), Math.sin(a) * .8 * (0.35 + .45 * Math.sin(t * Math.PI * 3))]);
  }
  return pts;
}

export default {
  id: 'fourier', hall: 'waves', engine: 'canvas',

  params: [
    { key: 'terms', sym: 'Σ', label: '轮数', min: 4, max: 200, step: 1, value: 60, format: v => v | 0 },
    { key: 'speed', sym: '⌘', label: '转速', min: .2, max: 2, step: .05, value: .9 },
  ],
  buttons: [
    { id: 'inf', label: '画 ∞', fn: c => setPath(c, lemniscate(400)) },
    { id: 'draw', label: '请我作画（拖动画布）', fn: c => { c._s.armed = true; } },
  ],
  note: '在画布上拖动画一笔，殿会为你分解它的轮系。左轮右迹。',

  async init(ctx) {
    ctx._s = { path: null, coef: null, t: 0, trace: [], armed: false, drawing: false, raw: [] };
    setPath(ctx, lemniscate(400));
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    const ptr = ctx.pointer;

    /* freehand capture */
    if (s.drawing) {
      if (ptr.down) s.raw.push([ptr.x, ptr.y]);
      else if (s.raw.length > 24) {
        const path = resample(s.raw, 480);
        const bbox = normBounds(path);
        setPath(ctx, path.map(([x, y]) => bbox(x, y)));
        s.drawing = false; s.raw = [];
      } else if (!ptr.down && s.raw.length) { s.drawing = false; s.raw = []; }
    } else if (s.armed && ptr.down) {
      s.drawing = true; s.armed = false; s.raw = [[ptr.x, ptr.y]];
      s.trace = [];
      ctx.g2.fillStyle = '#14110D';
      ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
    }

    const K = Math.min(P.terms | 0, s.coef.length);
    s.t = (s.t + dt * P.speed * .5) % 1;

    const S = Math.min(ctx.w, ctx.h) * .3;
    const cx = ctx.w * .3, cy = ctx.h * .52;
    const ox = ctx.w * .3 + S * 1.15, oy = cy;

    g.fillStyle = 'rgba(20,17,13,.10)';
    g.fillRect(0, 0, ctx.w, ctx.h);

    /* epicycles */
    let x = cx, y = cy;
    g.strokeStyle = 'rgba(233,225,207,.14)';
    g.fillStyle = 'rgba(233,225,207,.35)';
    for (let k = 0; k < K; k++) {
      const c = s.coef[k];
      const r = c.mag * S;
      if (r < .8) break;
      const ph = c.phase + s.t * TAU * c.freq;
      const nx = x + Math.cos(ph) * r;
      const ny = y + Math.sin(ph) * r;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
      g.beginPath(); g.arc(nx, ny, 1.1, 0, TAU); g.fill();
      x = nx; y = ny;
    }

    /* trace */
    s.trace.push([x, y]);
    const maxTrace = 900;
    if (s.trace.length > maxTrace) s.trace.shift();
    g.save();
    g.translate(ox, 0);
    g.strokeStyle = hslCss(ctx.accentHue + 8, .55, 55, .85);
    g.lineWidth = 1.6;
    g.lineJoin = 'round';
    g.beginPath();
    s.trace.forEach(([tx, ty], i) => {
      const px = tx - cx + 0, py = ty;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    });
    g.stroke();
    g.restore();

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.4)';
    g.fillText(`wheels = ${K}   t = ${s.t.toFixed(2)}`, 24, ctx.h - 20);
  },
};

function setPath(ctx, path) {
  const s = ctx._s; if (!s) return;
  s.path = path;
  s.coef = dft(path, 220);
  s.trace = [];
  s.t = 0;
}

function resample(raw, n) {
  /* arc-length resample */
  const d = [0];
  for (let i = 1; i < raw.length; i++)
    d.push(d[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  const total = d[d.length - 1] || 1;
  const out = [];
  for (let k = 0; k < n; k++) {
    const target = k / n * total;
    let i = 1;
    while (i < d.length && d[i] < target) i++;
    const t = (target - d[i - 1]) / ((d[i] - d[i - 1]) || 1);
    out.push([
      raw[i - 1][0] + (raw[i][0] - raw[i - 1][0]) * t,
      raw[i - 1][1] + (raw[i][1] - raw[i - 1][1]) * t,
    ]);
  }
  return out;
}

function normBounds(path) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of path) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const sc = 2 / Math.max(x1 - x0, y1 - y0, 1);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return (x, y) => [(x - cx) * sc, (y - cy) * sc];
}

function dft(path, K) {
  const N = path.length;
  const coef = [];
  for (let k = -Math.floor(K / 2); k <= Math.floor(K / 2); k++) {
    let re = 0, im = 0;
    for (let i = 0; i < N; i++) {
      const ph = -TAU * k * i / N;
      const c = Math.cos(ph), s = Math.sin(ph);
      re += path[i][0] * c - path[i][1] * s;
      im += path[i][0] * s + path[i][1] * c;
    }
    re /= N; im /= N;
    coef.push({ freq: k, mag: Math.hypot(re, im), phase: Math.atan2(im, re) });
  }
  coef.sort((a, b) => b.mag - a.mag);
  return coef;
}
