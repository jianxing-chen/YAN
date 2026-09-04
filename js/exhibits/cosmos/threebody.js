/* 衍 · 三体 — three suns keep no calendar */

import { hslCss, TAU } from '../../core/math.js';

const G = 1;

export default {
  id: 'threebody', hall: 'cosmos', engine: 'canvas',

  params: [
    { key: 'speed', sym: '⌘', label: '时间流速', min: .1, max: 1.5, step: .05, value: .5 },
    { key: 'trail', sym: '✧', label: '余迹', min: .01, max: .2, step: .005, value: .035 },
  ],
  buttons: [
    { id: 'eight', label: '八字解 · 1993', fn: c => loadEight(c) },
    { id: 'chaos', label: '无历之初', fn: c => loadChaos(c) },
  ],
  note: '拖动任一颗星并掷出——绝大多数命运没有日历。八字解是那件被原谅的例外。',

  async init(ctx) {
    ctx._s = { bodies: [], drag: -1 };
    loadEight(ctx);
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    const B = s.bodies;
    const step = Math.min(dt, .03) * P.speed;

    /* throw: drag the nearest body */
    const ptr = ctx.pointer;
    if (ptr.down && s.drag < 0) {
      let best = -1, bd = 60;
      B.forEach((b, i) => {
        const [sx, sy] = toScreen(ctx, b);
        const d = Math.hypot(ptr.x - sx, ptr.y - sy);
        if (d < bd) { bd = d; best = i; }
      });
      s.drag = best;
      if (best >= 0) { s.grab = { x: ptr.x, y: ptr.y }; }
    }
    if (s.drag >= 0) {
      const b = B[s.drag];
      if (ptr.down) {
        const [sx, sy] = toScreen(ctx, b);
        b.vx = (ptr.x - sx) * .02;
        b.vy = (ptr.y - sy) * .02;
      } else { s.drag = -1; }
    }

    /* leapfrog (kick-drift) with substeps */
    const sub = 8;
    const h = step / sub;
    for (let k = 0; k < sub; k++) {
      for (let i = 0; i < 3; i++) {
        const a = accel(B, i);
        if (s.drag === i) continue;
        B[i].vx += a[0] * h; B[i].vy += a[1] * h;
        B[i].x += B[i].vx * h; B[i].y += B[i].vy * h;
      }
      s.t = (s.t || 0) + h;
    }

    g.fillStyle = `rgba(20,17,13,${P.trail})`;
    g.fillRect(0, 0, ctx.w, ctx.h);

    g.globalCompositeOperation = 'lighter';
    g.lineWidth = 1;
    for (const b of B) {
      const [sx, sy] = toScreen(ctx, b);
      g.strokeStyle = b.col;
      g.beginPath(); g.arc(sx, sy, 5, 0, TAU); g.stroke();
      g.fillStyle = b.col;
      g.beginPath(); g.arc(sx, sy, 2.6, 0, TAU); g.fill();
    }
    g.globalCompositeOperation = 'source-over';

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.42)';
    g.fillText(`t = ${(s.t || 0).toFixed(2)}   ${s.mode}`, 24, ctx.h - 20);
  },
};

function accel(B, i) {
  let ax = 0, ay = 0;
  for (let j = 0; j < 3; j++) {
    if (i === j) continue;
    const dx = B[j].x - B[i].x, dy = B[j].y - B[i].y;
    const d2 = dx * dx + dy * dy + 1e-6;
    const d = Math.sqrt(d2);
    const f = G / d2;
    ax += dx / d * f; ay += dy / d * f;
  }
  return [ax, ay];
}

function toScreen(ctx, b) {
  const S = Math.min(ctx.w, ctx.h) * .3;
  return [ctx.w / 2 + b.x * S, ctx.h / 2 + b.y * S];
}

function fromScreen(ctx, x, y) {
  const S = Math.min(ctx.w, ctx.h) * .3;
  return [(x - ctx.w / 2) / S, (y - ctx.h / 2) / S];
}

const HUES = [0, 120, 200];

function mk(ctx, arr, mode) {
  const colors = [0, 1, 2].map(i => hslCss(ctx.accentHue + i * 110 - 30, .58, 58, 1));
  ctx._s.bodies = arr.map(([x, y, vx, vy], i) => ({ x, y, vx, vy, col: colors[i] }));
  ctx._s.t = 0; ctx._s.mode = mode; ctx._s.drag = -1;
}

function loadEight(ctx) {
  /* Chenciner–Montgomery figure eight (G=1, m=1) */
  const v1x = 0.93240737, v1y = 0.86473146;
  mk(ctx, [
    [-0.97000436, 0.24308753, v1x / 2, v1y / 2],
    [0.97000436, -0.24308753, v1x / 2, v1y / 2],
    [0, 0, -v1x, -v1y],
  ], '八字解 FIGURE-EIGHT');
}

function loadChaos(ctx) {
  const r = ctx.rng;
  const pos = [];
  for (let i = 0; i < 3; i++) {
    const a = r() * TAU, rr = .2 + r() * .8;
    pos.push([Math.cos(a) * rr, Math.sin(a) * rr, (r() - .5) * .5, (r() - .5) * .5]);
  }
  /* zero total momentum */
  let vx = 0, vy = 0;
  for (const p of pos) { vx += p[2]; vy += p[3]; }
  pos.forEach(p => { p[2] -= vx / 3; p[3] -= vy / 3; });
  mk(ctx, pos, '无历之初 NO CALENDAR');
}
