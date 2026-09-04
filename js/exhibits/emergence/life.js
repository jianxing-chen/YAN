/* 衍 · 康威生命游戏 — a cosmos of three laws */

import { hsl, clamp } from '../../core/math.js';

export default {
  id: 'life', hall: 'emergence', engine: 'canvas',

  params: [
    { key: 'speed', sym: '⌘', label: '世代速率', min: 1, max: 30, step: 1, value: 12, format: v => (v | 0) + '/s' },
    { key: 'density', sym: '◔', label: '播种密度', min: .05, max: .6, step: .01, value: .22 },
  ],
  buttons: [
    { id: 'soup', label: '随机汤', fn: c => soup(c) },
    { id: 'gun', label: '高斯帕滑翔机枪', fn: c => gun(c) },
    { id: 'clear', label: '归于寂', fn: c => clearAll(c) },
  ],
  note: '在暗处点画，播下生命。此界为环面：越界的生命会从另一侧归来。',

  async init(ctx) {
    const cell = 5;
    const W = Math.max(120, Math.floor(ctx.w / cell));
    const H = Math.max(80, Math.floor(ctx.h / cell));
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const octx = off.getContext('2d');
    ctx._s = {
      cell, W, H,
      cur: new Uint8Array(W * H),
      nxt: new Uint8Array(W * H),
      age: new Uint8Array(W * H),
      off, octx,
      img: octx.createImageData(W, H),
      acc: 0, palette: null, palHue: -1,
    };
    soup(ctx);
    /* a welcoming gun */
    gun(ctx, .18, .3);
  },

  frame(ctx, dt) {
    const s = ctx._s, g = ctx.g2;
    const { W, H } = s;

    /* painting */
    const ptr = ctx.pointer;
    if (ptr.down) {
      const gx = Math.floor(ptr.x / s.cell), gy = Math.floor(ptr.y / s.cell);
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (dx * dx + dy * dy > 6) continue;
        s.cur[((gy + dy + H) % H) * W + ((gx + dx + W) % W)] = 1;
        s.age[((gy + dy + H) % H) * W + ((gx + dx + W) % W)] = 60;
      }
    }

    /* step at chosen rate */
    s.acc += dt * ctx.params.speed;
    let steps = 0;
    while (s.acc >= 1 && steps < 4) {
      s.acc -= 1; steps++;
      step(s, W, H);
    }

    /* palette LUT follows the aeon hue */
    const hue = ctx.accentHue | 0;
    if (!s.palette || s.palHue !== hue) {
      s.palHue = hue;
      s.palette = new Uint8Array(256 * 3);
      for (let a = 0; a < 256; a++) {
        const t = a / 255;
        const [r, gg, b] = hsl(hue + 18 - 30 * t, .5 - .2 * t, clamp(.16 + .42 * Math.pow(t, .55), 0, .9));
        s.palette[a * 3] = r * 255; s.palette[a * 3 + 1] = gg * 255; s.palette[a * 3 + 2] = b * 255;
      }
    }

    /* raster */
    const d = s.img.data;
    for (let i = 0; i < W * H; i++) {
      const alive = s.cur[i];
      const j = i * 4;
      if (alive) {
        const a = s.age[i];
        d[j] = s.palette[a * 3]; d[j + 1] = s.palette[a * 3 + 1]; d[j + 2] = s.palette[a * 3 + 2]; d[j + 3] = 255;
      } else {
        d[j] = 20; d[j + 1] = 17; d[j + 2] = 13; d[j + 3] = 255;
      }
    }
    s.octx.putImageData(s.img, 0, 0);
    g.imageSmoothingEnabled = false;
    g.drawImage(s.off, 0, 0, W * s.cell, H * s.cell);
  },
};

function step(s, W, H) {
  const { cur, nxt, age } = s;
  for (let y = 0; y < H; y++) {
    const ym = ((y - 1 + H) % H) * W, y0 = y * W, yp = ((y + 1) % H) * W;
    for (let x = 0; x < W; x++) {
      const xm = (x - 1 + W) % W, xp = (x + 1) % W;
      const n = cur[ym + xm] + cur[ym + x] + cur[ym + xp]
        + cur[y0 + xm] + cur[y0 + xp]
        + cur[yp + xm] + cur[yp + x] + cur[yp + xp];
      const i = y0 + x;
      nxt[i] = cur[i] ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
      age[i] = nxt[i] ? Math.min(255, age[i] + 2) : 0;
    }
  }
  s.cur = nxt; s.nxt = cur;
}

function soup(ctx) {
  const s = ctx._s;
  const d = ctx.params.density;
  for (let i = 0; i < s.cur.length; i++) {
    const v = ctx.rng() < d ? 1 : 0;
    s.cur[i] = v;
    s.age[i] = v ? 40 : 0;
  }
}

function clearAll(ctx) {
  ctx._s.cur.fill(0);
  ctx._s.age.fill(0);
}

/* Gosper glider gun, placed in fractional grid coords */
function gun(ctx, fx = .12, fy = .12) {
  const s = ctx._s, W = s.W;
  const ox = Math.floor(s.W * fx), oy = Math.floor(s.H * fy);
  const P = [
    [24, 0], [22, 1], [24, 1], [12, 2], [13, 2], [20, 2], [21, 2], [34, 2], [35, 2],
    [11, 3], [15, 3], [20, 3], [21, 3], [34, 3], [35, 3],
    [0, 4], [1, 4], [10, 4], [16, 4], [20, 4], [21, 4],
    [0, 5], [1, 5], [10, 5], [14, 5], [16, 5], [17, 5], [22, 5], [24, 5],
    [10, 6], [16, 6], [24, 6],
    [11, 7], [15, 7],
    [12, 8], [13, 8],
  ];
  for (const [x, y] of P) {
    const gx = ox + x, gy = oy + y;
    if (gx < W && gy < s.H) { s.cur[gy * W + gx] = 1; s.age[gy * W + gx] = 100; }
  }
}
