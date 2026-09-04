/* 衍 · 群鸟 — flight without a leader */

import { hslCss, TAU } from '../../core/math.js';

const N = 760;

export default {
  id: 'boids', hall: 'emergence', engine: 'canvas',

  params: [
    { key: 'cohere', sym: '聚', label: '群聚', min: 0, max: 2.4, step: .05, value: 1 },
    { key: 'sepr', sym: '离', label: '疏离', min: .2, max: 2.4, step: .05, value: 1.3 },
    { key: 'vmax', sym: '⌁', label: '速限', min: 30, max: 140, step: 5, value: 70 },
    { key: 'trail', sym: '✧', label: '余迹', min: .04, max: .5, step: .01, value: .17 },
  ],

  note: '移动指针，扮演捕食者。群体的每一次转身，都是几千次局部商议的同时发生。',

  async init(ctx) {
    const s = ctx._s = { x: new Float32Array(N), y: new Float32Array(N), vx: new Float32Array(N), vy: new Float32Array(N) };
    for (let i = 0; i < N; i++) {
      s.x[i] = ctx.rng() * ctx.w; s.y[i] = ctx.rng() * ctx.h;
      const a = ctx.rng() * TAU;
      s.vx[i] = Math.cos(a) * 60; s.vy[i] = Math.sin(a) * 60;
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
    const step = Math.min(dt, .04);

    /* fade — the sky forgets slowly */
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = `rgba(20,17,13,${P.trail})`;
    g.fillRect(0, 0, ctx.w, ctx.h);

    const R = 46, R2 = R * R, SR = 22, SR2 = SR * SR;
    const hawk = ctx.pointer.inside ? ctx.pointer : null;

    for (let i = 0; i < N; i++) {
      let cxs = 0, cys = 0, axs = 0, ays = 0, sx = 0, sy = 0, cnt = 0;
      const xi = s.x[i], yi = s.y[i];
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        let dx = s.x[j] - xi, dy = s.y[j] - yi;
        const d2 = dx * dx + dy * dy;
        if (d2 > R2) continue;
        cxs += s.x[j]; cys += s.y[j];
        axs += s.vx[j]; ays += s.vy[j];
        if (d2 < SR2 && d2 > 1e-4) { sx -= dx / d2 * 60; sy -= dy / d2 * 60; }
        cnt++;
      }
      let ax = 0, ay = 0;
      if (cnt) {
        ax += ((cxs / cnt - xi) * .012) * P.cohere;
        ay += ((cys / cnt - yi) * .012) * P.cohere;
        ax += ((axs / cnt - s.vx[i]) * .06);
        ay += ((ays / cnt - s.vy[i]) * .06);
        ax += sx * P.sepr / 40; ay += sy * P.sepr / 40;
      }
      if (hawk) {
        let dx = xi - hawk.x, dy = yi - hawk.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && d2 > 1) {
          const d = Math.sqrt(d2);
          const panic = (130 - d) * .55;
          ax += dx / d * panic; ay += dy / d * panic;
        }
      }
      s.vx[i] += ax * step; s.vy[i] += ay * step;

      /* clamp speed */
      const sp = Math.hypot(s.vx[i], s.vy[i]) || 1;
      const lim = P.vmax;
      if (sp > lim) { s.vx[i] *= lim / sp; s.vy[i] *= lim / sp; }
      else if (sp < lim * .35) { s.vx[i] *= lim * .35 / sp; s.vy[i] *= lim * .35 / sp; }

      let x = xi + s.vx[i] * step, y = yi + s.vy[i] * step;
      if (x < 0) x += ctx.w; else if (x > ctx.w) x -= ctx.w;
      if (y < 0) y += ctx.h; else if (y > ctx.h) y -= ctx.h;
      s.x[i] = x; s.y[i] = y;
    }

    /* draw as strokes along heading */
    g.globalCompositeOperation = 'lighter';
    g.lineWidth = 1.2;
    for (let i = 0; i < N; i++) {
      const sp = Math.hypot(s.vx[i], s.vy[i]) || 1;
      const ux = s.vx[i] / sp, uy = s.vy[i] / sp;
      g.strokeStyle = hslCss(ctx.accentHue + (ux * 20), .5, 38 + sp / P.vmax * 30, .5);
      g.beginPath();
      g.moveTo(s.x[i] - ux * 7, s.y[i] - uy * 7);
      g.lineTo(s.x[i] + ux * 2.5, s.y[i] + uy * 2.5);
      g.stroke();
    }
    g.globalCompositeOperation = 'source-over';

    /* the hawk — a quiet ring */
    if (hawk) {
      g.strokeStyle = 'rgba(166,58,43,.5)';
      g.lineWidth = 1;
      g.beginPath(); g.arc(hawk.x, hawk.y, 14, 0, TAU); g.stroke();
    }
  },
};
