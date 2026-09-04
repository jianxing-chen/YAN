/* 衍 · 扩散限制凝聚 — coral condensed from chance */

import { hsl, TAU } from '../../core/math.js';

const CELL = 2;

export default {
  id: 'dla', hall: 'growth', engine: 'canvas',

  params: [
    { key: 'stick', sym: '◦', label: '黏性', min: .02, max: 1, step: .02, value: 1, format: v => v.toFixed(2) },
    { key: 'walkers', sym: '⌘', label: '游子数', min: 6, max: 60, step: 2, value: 46, format: v => v | 0 },
  ],
  buttons: [
    { id: 'reseed', label: '另凝一核', fn: c => reset(c) },
  ],
  note: '外枝先到者，屏蔽后来者——增长的几何学是不平等的几何学。',

  async init(ctx) {
    const W = Math.min(520, Math.floor(ctx.w / CELL));
    const H = Math.min(400, Math.floor(ctx.h / CELL));
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const octx = off.getContext('2d');
    ctx._s = {
      W, H, off, octx, img: octx.createImageData(W, H),
      grid: new Int32Array(W * H),     // 0 = empty, else freeze order
      frozen: 0, maxR: 2,
      wx: new Float32Array(64), wy: new Float32Array(64), wl: new Uint8Array(64),
      palette: null, palHue: -1,
    };
    reset(ctx);
  },

  frame(ctx, dt) {
    const s = ctx._s, { W, H, grid } = s;
    const cx = W >> 1, cy = H >> 1;
    if (ctx.pointer.wheel) {
      const v = Math.min(1, Math.max(.02, ctx.params.stick + ctx.pointer.wheel * .04));
      ctx.host.setParam('stick', v);
    }
    const stick = ctx.params.stick;
    const nWalkers = ctx.params.walkers | 0;

    const spawn = () => {
      const a = ctx.rng() * TAU;
      const r = s.maxR + 24;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    for (let k = 0; k < nWalkers; k++) {
      if (!s.wl[k]) { const [x, y] = spawn(); s.wx[k] = x; s.wy[k] = y; s.wl[k] = 1; }
      /* random walk (a few steps) */
      for (let step = 0; step < 18; step++) {
        const x = s.wx[k] | 0, y = s.wy[k] | 0;
        if (x <= 1 || y <= 1 || x >= W - 2 || y >= H - 2 || Math.hypot(x - cx, y - cy) > s.maxR + 60) {
          s.wl[k] = 0; break;
        }
        /* sticky check */
        if (grid[(y - 1) * W + x] || grid[(y + 1) * W + x] || grid[y * W + x - 1] || grid[y * W + x + 1]) {
          if (ctx.rng() < stick) {
            grid[y * W + x] = ++s.frozen;
            const rr = Math.hypot(x - cx, y - cy);
            if (rr > s.maxR) s.maxR = rr;
            s.wl[k] = 0;
            break;
          }
        }
        const d = (ctx.rng() * 4) | 0;
        s.wx[k] += (d === 0) - (d === 1);
        s.wy[k] += (d === 2) - (d === 3);
      }
    }

    /* palette by freeze order — rings of history */
    const hue = ctx.accentHue | 0;
    if (!s.palette || s.palHue !== hue) {
      s.palHue = hue;
      s.palette = new Uint8Array(256 * 3);
      for (let a = 0; a < 256; a++) {
        const t = a / 255;
        const [r, g, b] = hsl(hue + 20 - 34 * t, .5 - .15 * t, .12 + .5 * Math.pow(t, .7));
        s.palette[a * 3] = r * 255; s.palette[a * 3 + 1] = g * 255; s.palette[a * 3 + 2] = b * 255;
      }
    }

    const d = s.img.data;
    for (let i = 0; i < W * H; i++) {
      const j = i * 4;
      const f = grid[i];
      if (!f) { d[j] = 20; d[j + 1] = 17; d[j + 2] = 13; d[j + 3] = 255; continue; }
      const a = Math.min(255, (f / Math.max(1, s.frozen) * 255) | 0);
      d[j] = s.palette[a * 3]; d[j + 1] = s.palette[a * 3 + 1]; d[j + 2] = s.palette[a * 3 + 2]; d[j + 3] = 255;
    }
    s.octx.putImageData(s.img, 0, 0);
    const g = ctx.g2;
    g.imageSmoothingEnabled = false;
    const cw = W * CELL, ch = H * CELL;
    g.fillStyle = '#14110D';
    g.fillRect(0, 0, ctx.w, ctx.h);
    g.drawImage(s.off, (ctx.w - cw) / 2, (ctx.h - ch) / 2, cw, ch);

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.42)';
    g.fillText(`frozen = ${s.frozen.toLocaleString()}   R = ${s.maxR.toFixed(0)}`, 24, ctx.h - 20);
  },
};

function reset(ctx) {
  const s = ctx._s; if (!s) return;
  s.grid.fill(0);
  s.frozen = 0; s.maxR = 2;
  const cx = s.W >> 1, cy = s.H >> 1;
  s.grid[cy * s.W + cx] = ++s.frozen;
  s.wl.fill(0);
}
