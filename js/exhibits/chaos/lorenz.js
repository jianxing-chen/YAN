/* 衍 · 洛伦兹吸引子 — twin trajectories, one butterfly */

import { hslCss, hsl, clamp, TAU } from '../../core/math.js';

const N = 3400;

export default {
  id: 'lorenz', hall: 'chaos', engine: 'canvas',

  params: [
    { key: 'sigma', sym: 'σ', label: '湍流系数', min: 1, max: 20, step: .1, value: 10 },
    { key: 'rho', sym: 'ρ', label: '温差', min: 5, max: 60, step: .1, value: 28 },
    { key: 'beta', sym: 'β', label: '耗散', min: .5, max: 5, step: .01, value: 2.667, format: v => v.toFixed(3) },
    { key: 'speed', sym: '⌘', label: '时间流速', min: .2, max: 3, step: .05, value: 1 },
  ],
  buttons: [
    { id: 'reseed', label: '重掷初值', fn: c => reseed(c) },
    { id: 'resetview', label: '回正视角', fn: c => { c._s.yaw = .9; c._s.pitch = .28; c._s.zoom = 0; } },
  ],
  note: '两条轨迹初值相差 0.0001。若图中分离度突破 1，预言已经失效。',

  async init(ctx) {
    const s = ctx._s = {
      p: [0, 0, 0], q: [0, 0, 0],
      buf: [new Float32Array(N * 3), new Float32Array(N * 3)],
      head: 0, count: 0,
      yaw: .9, pitch: .28, zoom: 0,
      dragging: false, lastSep: 0,
    };
    reseed(ctx);
    /* warm start: the butterfly is already mid-flight when the door opens */
    const P0 = { sigma: ctx.params.sigma, rho: ctx.params.rho, beta: ctx.params.beta };
    for (let i = 0; i < N; i++) {
      rk4(s.p, .008, P0); rk4(s.q, .008, P0);
      push(s.buf[0], s.head, s.p); push(s.buf[1], s.head, s.q);
      s.count++; s.head = (s.head + 1) % N;
    }
    s.lastSep = Math.hypot(s.p[0] - s.q[0], s.p[1] - s.q[1], s.p[2] - s.q[2]);
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  resize(ctx) {
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;

    /* integrate — substeps for stability */
    const sub = 3;
    const h = .017 * P.speed * Math.min(dt * 60, 2) / sub;
    for (let k = 0; k < sub; k++) {
      rk4(s.p, h, P);
      rk4(s.q, h, P);
      push(s.buf[0], s.head, s.p);
      push(s.buf[1], s.head, s.q);
      s.count = Math.min(s.count + 1, N);
      s.head = (s.head + 1) % N;
    }
    s.lastSep = Math.hypot(s.p[0] - s.q[0], s.p[1] - s.q[1], s.p[2] - s.q[2]);

    /* camera */
    const ptr = ctx.pointer;
    if (ptr.down && ptr.dx) { s.yaw += ptr.dx * .006; s.pitch = clamp(s.pitch + ptr.dy * .005, -1.2, 1.2); }
    if (ptr.wheel) s.zoom = clamp(s.zoom - ptr.wheel * .08, -3, 6);
    if (!ptr.down && !ctx.reduced) s.yaw += dt * .05;
    const zoom = (Math.min(ctx.w, ctx.h) / 74) * Math.pow(1.7, s.zoom);

    g.fillStyle = '#14110D';
    g.fillRect(0, 0, ctx.w, ctx.h);
    g.save();
    g.translate(ctx.w / 2, ctx.h * .56);
    g.globalCompositeOperation = 'lighter';
    g.lineJoin = 'round';

    const cy = Math.cos(s.yaw), sy = Math.sin(s.yaw);
    const cp = Math.cos(s.pitch), sp = Math.sin(s.pitch);

    const project = (x, y, z) => {
      const X = x * cy - y * sy, Y = x * sy + y * cy;
      const Yr = Y * cp - z * sp, Zr = Y * sp + z * cp;
      return [X * zoom, -(Zr - 25) * zoom, Yr];
    };

    const hues = [ctx.accentHue, 44];
    for (let k = 0; k < 2; k++) {
      const buf = s.buf[k];
      const M = s.count;
      for (let i = 1; i < M; i++) {
        const i0 = ((s.head - M + i - 1 + 2 * N) % N) * 3;
        const i1 = i0 + 3 === buf.length ? 0 : i0 + 3;
        const a = project(buf[i0], buf[i0 + 1], buf[i0 + 2]);
        const b = project(buf[i1], buf[i1 + 1], buf[i1 + 2]);
        const age = i / M;
        g.strokeStyle = k === 0
          ? hslCss(hues[0], .85, 24 + 38 * age, .045 + .1 * age + .5 * Math.pow(age, 6))
          : hslCss(hues[1], .2, 52 + 26 * age, .05 + .09 * age + .46 * Math.pow(age, 6));
        g.lineWidth = .6 + 1.5 * Math.pow(age, 3);
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.stroke();
      }
      /* comet tail: the last stretch, bright — the star always sits on its line */
      {
        const tail = 26;
        g.strokeStyle = k === 0 ? hslCss(hues[0], .8, 66, .9) : hslCss(hues[1], .25, 80, .9);
        g.lineWidth = 1.6;
        g.beginPath();
        for (let j = tail; j >= 0; j--) {
          const p = (s.head - 1 - j + 2 * N) % N;
          const a = project(buf[p * 3], buf[p * 3 + 1], buf[p * 3 + 2]);
          j === tail ? g.moveTo(a[0], a[1]) : g.lineTo(a[0], a[1]);
        }
        g.stroke();
      }

      /* head star */
      const hp = s.count ? project(buf[(s.head - 1 + N) % N], buf[(s.head - 1 + N) % N + 1], buf[(s.head - 1 + N) % N + 2]) : null;
      if (hp) {
        g.fillStyle = k === 0 ? hslCss(hues[0], .8, 72, .95) : 'rgba(233,225,207,.8)';
        g.beginPath(); g.arc(hp[0], hp[1], k === 0 ? 2.6 : 2, 0, TAU); g.fill();
      }
    }
    g.restore();

    /* separation readout */
    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.42)';
    const log10 = s.lastSep > 0 ? Math.log10(s.lastSep) : -99;
    g.fillText(`Δ = ${s.lastSep.toExponential(2)}   log₁₀Δ = ${log10.toFixed(2)}`, 24, ctx.h - 34);
    g.fillStyle = s.lastSep > 1 ? 'rgba(166,58,43,.9)' : 'rgba(233,225,207,.3)';
    g.fillText(s.lastSep > 1 ? '预言失效 PROPHECY EXPIRED' : '预言有效 PROPHECY HOLDING', 24, ctx.h - 18);
  },
};

function reseed(ctx) {
  const s = ctx._s; if (!s) return;
  const r = ctx.rng;
  const base = [r() * 4 - 2, r() * 4 - 2, 20 + r() * 10];
  s.p = base.slice();
  s.q = base.map((v, i) => v + (i === 0 ? 1e-4 : 0));
  s.head = 0; s.count = 0;
}

function push(buf, head, p) {
  const i = head * 3;
  buf[i] = p[0]; buf[i + 1] = p[1]; buf[i + 2] = p[2];
}

function deriv(p, P) {
  return [
    P.sigma * (p[1] - p[0]),
    p[0] * (P.rho - p[2]) - p[1],
    p[0] * p[1] - P.beta * p[2],
  ];
}

function rk4(p, h, P) {
  const k1 = deriv(p, P);
  const p2 = p.map((v, i) => v + k1[i] * h / 2);
  const k2 = deriv(p2, P);
  const p3 = p.map((v, i) => v + k2[i] * h / 2);
  const k3 = deriv(p3, P);
  const p4 = p.map((v, i) => v + k3[i] * h);
  const k4 = deriv(p4, P);
  for (let i = 0; i < 3; i++) p[i] += h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
}
