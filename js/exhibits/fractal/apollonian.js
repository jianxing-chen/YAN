/* 衍 · 阿波罗尼奥斯之垫 — between any circles, one more circle */

import { hslCss, TAU } from '../../core/math.js';

export default {
  id: 'apollonian', hall: 'fractal', engine: 'canvas',

  params: [
    { key: 'minr', sym: '·', label: '最细圆径(px)', min: 1, max: 12, step: .5, value: 3.5, format: v => v.toFixed(1) },
    { key: 'alpha', sym: '✎', label: '墨色', min: .2, max: 1, step: .05, value: 1 },
  ],
  buttons: [
    { id: 'rebuild', label: '回到整垫', fn: c => build(c, { x: 0, y: 0, r: 1 }) },
  ],
  note: '点击任意圆，进入其内部——那里有另一整座垫子。',

  async init(ctx) {
    ctx._s = { world: { x: 0, y: 0, r: 1 }, circles: [], need: true };
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
    build(ctx, { x: 0, y: 0, r: 1 });
  },

  resize(ctx) {
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
    ctx._s.need = true;
  },

  frame(ctx) {
    const s = ctx._s, g = ctx.g2;
    const ptr = ctx.pointer;

    if (ptr.click) {
      /* find smallest circle containing the click, enter it */
      const v = view(ctx);
      const wx = (ptr.click.x - ctx.w / 2) / v + s.world.x;
      const wy = (ptr.click.y - ctx.h / 2) / v + s.world.y;
      let hit = null;
      for (const c of s.circles) {
        if (c.r < s.world.r * .999 && Math.hypot(wx - c.x, wy - c.y) < c.r * .985) {
          if (!hit || c.r < hit.r) hit = c;
        }
      }
      if (hit) { build(ctx, hit); ptr.click = null; }
    }

    if (!s.need) return;
    s.need = false;

    g.fillStyle = '#14110D';
    g.fillRect(0, 0, ctx.w, ctx.h);
    const v = view(ctx);
    const cx = ctx.w / 2, cy = ctx.h / 2;

    /* depth-sorted, outer first: darker fill, bronze-ink strokes */
    for (const c of s.circles) {
      const px = cx + (c.x - s.world.x) * v;
      const py = cy + (c.y - s.world.y) * v;
      const pr = c.r * v;
      if (px + pr < -40 || px - pr > ctx.w + 40 || py + pr < -40 || py - pr > ctx.h + 40) continue;
      const depth = Math.min(1, c.r / s.world.r);
      g.beginPath();
      g.arc(px, py, pr, 0, TAU);
      g.fillStyle = hslCss(42, .18, 7 + 5 * (1 - depth), 1);
      g.fill();
      g.strokeStyle = hslCss(ctx.accentHue * depth + 44 * (1 - depth), .46, 34 + 46 * depth, ctx.params.alpha * (0.55 + .45 * depth));
      g.lineWidth = .6 + 1.2 * depth;
      g.stroke();
    }

    /* a few highlights */
    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.4)';
    g.fillText(`circles = ${s.circles.length}   depth ×${(1 / s.world.r).toExponential(1)}`, 24, ctx.h - 20);
  },
};

function view(ctx) {
  return Math.min(ctx.w, ctx.h) / 2 * .96;
}

/* Descartes in complex form: for four mutually tangent circles,
   k4 = k1+k2+k3 ± 2√(k1k2+k2k3+k3k1), and each coordinate obeys the same
   algebra with curvature-weighted centers. The enclosing circle carries
   NEGATIVE curvature — the sign that makes the whole gasket possible. */
function build(ctx, outer) {
  const s = ctx._s; if (!s) return;
  const v = view(ctx);
  const minR = ctx.params.minr / v;
  s.world = { x: outer.x, y: outer.y, r: outer.r };
  s.circles = [];

  const R = outer.r;
  const r = R * .4641;                 // three equal circles mutually tangent, inside outer
  const d = R - r;
  const C = (x, y, rr, k) => ({ x, y, r: rr, k, key: `${k.toFixed(4)}|${x.toFixed(5)}|${y.toFixed(5)}` });
  const seed = [
    C(outer.x, outer.y, R, -1 / R),
    C(outer.x, outer.y + d, r, 1 / r),
    C(outer.x + d * .8660254, outer.y - d * .5, r, 1 / r),
    C(outer.x - d * .8660254, outer.y - d * .5, r, 1 / r),
  ];
  const seen = new Set(seed.map(c => c.key));
  for (const c of seed) s.circles.push(c);

  const queue = [
    [seed[0], seed[1], seed[2]],
    [seed[0], seed[1], seed[3]],
    [seed[0], seed[2], seed[3]],
    [seed[1], seed[2], seed[3]],
  ];
  while (queue.length && s.circles.length < 9000) {
    const [a, b, c] = queue.shift();
    const { k: k1, x: x1, y: y1 } = a, { k: k2, x: x2, y: y2 } = b, { k: k3, x: x3, y: y3 } = c;
    const sum = k1 + k2 + k3;
    const curv = 2 * Math.sqrt(k1 * k2 + k2 * k3 + k3 * k1);
    /* complex S = Σ_{i<j} k_i k_j z_i z_j — squared once, rooted once */
    const mul = (ax, ay, bx, by) => [ax * bx - ay * by, ax * by + ay * bx];
    let Sx = 0, Sy = 0;
    for (const [[ka, za], [kb, zb]] of [
      [[k1, [x1, y1]], [k2, [x2, y2]]], [[k2, [x2, y2]], [k3, [x3, y3]]], [[k3, [x3, y3]], [k1, [x1, y1]]],
    ]) {
      const t = mul(ka * za[0], ka * za[1], kb * zb[0], kb * zb[1]);
      Sx += t[0]; Sy += t[1];
    }
    const [Srx, Sry] = csqrt(Sx, Sy);
    const bx0 = k1 * x1 + k2 * x2 + k3 * x3;
    const by0 = k1 * y1 + k2 * y2 + k3 * y3;
    for (const sgn of [1, -1]) {
      const k4 = sum + sgn * curv;
      if (k4 < 1e-7) continue;                       // the outer-scale twin; already present
      const r4 = 1 / k4;
      if (r4 < minR) continue;
      const px = (bx0 + sgn * 2 * Srx) / k4;
      const py = (by0 + sgn * 2 * Sry) / k4;
      const key = `${k4.toFixed(4)}|${px.toFixed(5)}|${py.toFixed(5)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const c4 = C(px, py, r4, k4);
      s.circles.push(c4);
      queue.push([a, b, c4], [b, c, c4], [c, a, c4]);
    }
  }
}

function csqrt(re, im) {
  const r = Math.hypot(re, im);
  if (r === 0) return [0, 0];
  if (re >= 0) {
    const sr = Math.sqrt((r + re) / 2);
    return [sr, im / (2 * sr)];
  }
  const si = Math.sign(im || 1) * Math.sqrt((r - re) / 2);
  return [im / (2 * si), si];
}
