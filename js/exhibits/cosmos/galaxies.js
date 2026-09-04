/* 衍 · 星之碰撞 — tidal tails, the universe's handwriting
   Star-star forces ignored; cores + halo do the sculpting. */

import { hslCss, TAU } from '../../core/math.js';

export default {
  id: 'galaxies', hall: 'cosmos', engine: 'canvas',

  params: [
    { key: 'halo', sym: '◉', label: '暗物质晕', min: 0, max: 2, step: .05, value: .9 },
    { key: 'speed', sym: '⌘', label: '纪元流速', min: .2, max: 2, step: .05, value: 1 },
    { key: 'trail', sym: '✧', label: '余迹', min: .02, max: .3, step: .01, value: .08 },
  ],
  buttons: [
    { id: 'collide', label: '掷向彼此', fn: c => seed(c, true) },
    { id: 'solo', label: '孤盘自旋', fn: c => seed(c, false) },
  ],
  note: '碰撞是引力对「格局」的重排，不是物质的对接。看潮汐尾如何被写下。',

  async init(ctx) {
    seed(ctx, true);
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    if (ctx.pointer.wheel) {
      const v = Math.min(2, Math.max(0, P.halo + ctx.pointer.wheel * .05));
      ctx.host.setParam('halo', v);
    }
    const step = Math.min(dt, .033) * P.speed;

    g.fillStyle = `rgba(20,17,13,${P.trail})`;
    g.fillRect(0, 0, ctx.w, ctx.h);

    /* cores attract each other */
    {
      const [A, B] = s.cores;
      const dx = B.x - A.x, dy = B.y - A.y;
      const d = Math.hypot(dx, dy) + 20;
      const a = 2400 / (d * d);
      A.vx += dx / d * a * d * .01 * step * 60;
      A.vy += dy / d * a * d * .01 * step * 60;
      B.vx -= dx / d * a * d * .01 * step * 60;
      B.vy -= dy / d * a * d * .01 * step * 60;
      A.x += A.vx * step; A.y += A.vy * step;
      B.x += B.vx * step; B.y += B.vy * step;
    }

    /* stars feel both cores + soft halo term */
    const halo = P.halo;
    for (const st of s.stars) {
      let ax = 0, ay = 0;
      for (const C of s.cores) {
        const dx = C.x - st.x, dy = C.y - st.y;
        const d2 = dx * dx + dy * dy + 240;
        const d = Math.sqrt(d2);
        const f = (st.home === C ? 3200 : 2200) / d2 + halo * 180 / d2 * d * .2;
        ax += dx / d * f; ay += dy / d * f;
      }
      st.vx += ax * step; st.vy += ay * step;
      st.x += st.vx * step; st.y += st.vy * step;
    }

    /* draw */
    g.globalCompositeOperation = 'lighter';
    for (const st of s.stars) {
      g.fillStyle = st.col;
      g.fillRect(st.x, st.y, 1.5, 1.5);
    }
    for (const C of s.cores) {
      g.fillStyle = 'rgba(233,225,207,.95)';
      g.beginPath(); g.arc(C.x, C.y, 3, 0, TAU); g.fill();
    }
    g.globalCompositeOperation = 'source-over';

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.4)';
    g.fillText(`stars = ${s.stars.length}   t = ${(s.t += step).toFixed(1)}`, 24, ctx.h - 20);
  },
};

function seed(ctx, colliding) {
  const S = ctx.quality < 1 ? 700 : 1200;
  const stars = [];
  const w = ctx.w, h = ctx.h;
  const scale = Math.min(w, h) / 2 * .9;
  const cores = [
    { x: w * .32, y: h * .5, vx: colliding ? 26 : 0, vy: colliding ? 4 : 0, home: null },
    { x: w * .68, y: h * .5, vx: colliding ? -26 : 0, vy: colliding ? -4 : 0, home: null },
  ];
  cores.forEach((C, ci) => {
    C.home = C;
    const n = S / 2;
    for (let i = 0; i < n; i++) {
      const r = 8 + Math.sqrt(ctx.rng()) * scale * .45;
      const a = ctx.rng() * TAU;
      const x = C.x + Math.cos(a) * r;
      const y = C.y + Math.sin(a) * r * .8;
      const v = Math.sqrt(3200 * 40 / (r + 10)) * 2.2;
      stars.push({
        x, y,
        vx: C.vx + Math.cos(a + Math.PI / 2) * v * (ci ? -1 : 1) * .9,
        vy: C.vy + Math.sin(a + Math.PI / 2) * v * (ci ? -1 : 1) * .9 * .8,
        home: C,
        col: hslCss(ctx.accentHue + (ci ? 20 : -14) + (r / scale) * 30, .4, .45 + ctx.rng() * .25, .8),
      });
    }
  });
  ctx._s = { stars, cores, t: 0 };
  ctx.g2.fillStyle = '#14110D';
  ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
}
