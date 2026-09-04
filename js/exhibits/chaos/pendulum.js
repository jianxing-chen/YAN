/* 衍 · 双摆 — five fates differing by one part in ten thousand */

import { hslCss, TAU, clamp } from '../../core/math.js';

const TWINS = 5;
const TRAIL = 1100;

export default {
  id: 'pendulum', hall: 'chaos', engine: 'canvas',

  params: [
    { key: 'g', sym: 'g', label: '重力', min: 1, max: 25, step: .1, value: 9.8 },
    { key: 'split', sym: 'ε', label: '同源分离度', min: 1, max: 5, step: .1, value: 1, format: v => '1e-' + (4 + v * 2 | 0) },
    { key: 'speed', sym: '⌘', label: '时间流速', min: .2, max: 2, step: .05, value: 1 },
  ],
  buttons: [
    { id: 'rethrow', label: '重新掷出', fn: c => resetAll(c, .9 + c.rng() * .8, .9 + c.rng() * .8) },
  ],
  note: '拖动末端摆锤，掷出新的初始条件。放手的一刻，五个宇宙同时出发。',

  async init(ctx) {
    ctx._s = { P: [], trails: [], drag: -1, energy: 0 };
    for (let i = 0; i < TWINS; i++) {
      ctx._s.P.push({ t1: 0, t2: 0, w1: 0, w2: 0 });
      ctx._s.trails.push({ x: new Float32Array(TRAIL), y: new Float32Array(TRAIL), n: 0, head: 0 });
    }
    resetAll(ctx, 2.1, 2.4);
    /* warm start: the calligraphy is already on the wall when the door opens */
    {
      const ax = ctx.w / 2, ay = ctx.h * .3, L = Math.min(ctx.w, ctx.h) * .21;
      const gsnap = ctx.params.g;
      for (let k = 0; k < 1500; k++) {
        for (let i = 0; i < TWINS; i++) stepPendulum(ctx._s.P[i], gsnap, 1 / 120);
        for (let i = 0; i < TWINS; i++) {
          const p = ctx._s.P[i], tr = ctx._s.trails[i];
          tr.x[tr.head] = ax + L * (Math.sin(p.t1) + Math.sin(p.t2));
          tr.y[tr.head] = ay + L * (Math.cos(p.t1) + Math.cos(p.t2));
          tr.head = (tr.head + 1) % TRAIL;
          tr.n = Math.min(tr.n + 1, TRAIL);
        }
      }
    }
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  resize(ctx) {
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    s.t = (s.t || 0) + dt * P.speed;
    const anchorX = ctx.w / 2, anchorY = ctx.h * .3;
    const L = Math.min(ctx.w, ctx.h) * .21;

    /* drag: throw new initial conditions */
    const ptr = ctx.pointer;
    if (ptr.down && s.drag < 0) {
      const p0 = s.P[0];
      const tipX = anchorX + L * (Math.sin(p0.t1) + Math.sin(p0.t2));
      const tipY = anchorY + L * (Math.cos(p0.t1) + Math.cos(p0.t2));
      if (Math.hypot(ptr.x - tipX, ptr.y - tipY) < 40) s.drag = 0;
    }
    if (s.drag >= 0) {
      if (ptr.down) {
        const dx = ptr.x - anchorX, dy = ptr.y - anchorY;
        const t1 = Math.atan2(dx, dy);
        const d2x = dx - L * Math.sin(t1), d2y = dy - L * Math.cos(t1);
        const t2 = Math.atan2(d2x, d2y);
        setAngles(ctx, t1, t2, true);
      } else {
        setAngles(ctx, s.P[0].t1, s.P[0].t2, false);
        s.drag = -1;
      }
    }

    /* integrate RK4 */
    if (s.drag < 0) {
      const steps = 4;
      const h = dt * P.speed / steps;
      for (let k = 0; k < steps; k++)
        for (let i = 0; i < TWINS; i++) stepPendulum(s.P[i], P.g, h);
    }

    /* record trail of bob 2 of each twin */
    for (let i = 0; i < TWINS; i++) {
      const p = s.P[i], tr = s.trails[i];
      tr.x[tr.head] = anchorX + L * (Math.sin(p.t1) + Math.sin(p.t2));
      tr.y[tr.head] = anchorY + L * (Math.cos(p.t1) + Math.cos(p.t2));
      tr.head = (tr.head + 1) % TRAIL;
      tr.n = Math.min(tr.n + 1, TRAIL);
    }

    /* draw */
    g.fillStyle = '#14110D';
    g.fillRect(0, 0, ctx.w, ctx.h);

    g.globalCompositeOperation = 'lighter';
    for (let i = TWINS - 1; i >= 0; i--) {
      const tr = s.trails[i];
      g.strokeStyle = hslCss(ctx.accentHue + i * 13, .65, 52 + i * 5, i === 0 ? .8 : .4);
      g.lineWidth = i === 0 ? 1.4 : .8;
      g.beginPath();
      for (let k = 0; k < tr.n; k++) {
        const idx = (tr.head - tr.n + k + 2 * TRAIL) % TRAIL;
        k ? g.lineTo(tr.x[idx], tr.y[idx]) : g.moveTo(tr.x[idx], tr.y[idx]);
      }
      g.stroke();
    }
    g.globalCompositeOperation = 'source-over';

    /* arms */
    for (let i = TWINS - 1; i >= 0; i--) {
      const p = s.P[i];
      const x1 = anchorX + L * Math.sin(p.t1), y1 = anchorY + L * Math.cos(p.t1);
      const x2 = x1 + L * Math.sin(p.t2), y2 = y1 + L * Math.cos(p.t2);
      g.strokeStyle = i === 0 ? 'rgba(233,225,207,.75)' : 'rgba(233,225,207,.16)';
      g.lineWidth = i === 0 ? 1.5 : .7;
      g.beginPath(); g.moveTo(anchorX, anchorY); g.lineTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.fillStyle = i === 0 ? hslCss(ctx.accentHue, .75, 62, 1) : hslCss(ctx.accentHue + i * 13, .5, 50, .55);
      g.beginPath(); g.arc(x1, y1, i === 0 ? 5 : 3, 0, TAU); g.fill();
      g.beginPath(); g.arc(x2, y2, i === 0 ? 8 : 4.5, 0, TAU); g.fill();
    }
    /* pivot */
    g.fillStyle = 'rgba(233,225,207,.9)';
    g.beginPath(); g.arc(anchorX, anchorY, 3, 0, TAU); g.fill();

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.4)';
    g.fillText(`t = ${s.t.toFixed(1)}s   ε = 1e-${4 + (P.split * 2 | 0)}`, 24, ctx.h - 20);
  },
};

function resetAll(ctx, t1, t2) {
  const s = ctx._s; if (!s) return;
  const eps = Math.pow(10, -(4 + ctx.params.split * 2));
  for (let i = 0; i < TWINS; i++) {
    const p = s.P[i];
    p.t1 = t1 + i * eps; p.t2 = t2 + i * eps;
    p.w1 = 0; p.w2 = 0;
    s.trails[i].n = 0; s.trails[i].head = 0;
  }
}

function setAngles(ctx, t1, t2, holding) {
  const s = ctx._s;
  const eps = Math.pow(10, -(4 + ctx.params.split * 2));
  for (let i = 0; i < TWINS; i++) {
    const p = s.P[i];
    p.t1 = t1 + i * eps; p.t2 = t2 + i * eps;
    p.w1 = 0; p.w2 = 0;
    if (holding) { s.trails[i].n = 0; s.trails[i].head = 0; }
  }
}

function stepPendulum(p, g, h) {
  const d = (st) => {
    const { t1, t2, w1, w2 } = st;
    const sD = Math.sin(t1 - t2), cD = Math.cos(t1 - t2);
    const den = 3 - Math.cos(2 * (t1 - t2));
    const a1 = (-3 * g * Math.sin(t1) - g * Math.sin(t1 - 2 * t2) - 2 * sD * (w2 * w2 + w1 * w1 * cD)) / den;
    const a2 = (2 * sD * (2 * w1 * w1 + 2 * g * Math.cos(t1) + w2 * w2 * cD)) / den;
    return [w1, w2, a1, a2];
  };
  const k1 = d(p);
  const s2 = { t1: p.t1 + k1[0] * h / 2, t2: p.t2 + k1[1] * h / 2, w1: p.w1 + k1[2] * h / 2, w2: p.w2 + k1[3] * h / 2 };
  const k2 = d(s2);
  const s3 = { t1: p.t1 + k2[0] * h / 2, t2: p.t2 + k2[1] * h / 2, w1: p.w1 + k2[2] * h / 2, w2: p.w2 + k2[3] * h / 2 };
  const k3 = d(s3);
  const s4 = { t1: p.t1 + k3[0] * h, t2: p.t2 + k3[1] * h, w1: p.w1 + k3[2] * h, w2: p.w2 + k3[3] * h };
  const k4 = d(s4);
  p.t1 += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
  p.t2 += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  p.w1 += h / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
  p.w2 += h / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]);
}
