/* 衍 · 线世界 — electrons run through four states */

import { hsl } from '../../core/math.js';

const CELL = 6;

export default {
  id: 'wireworld', hall: 'mind', engine: 'canvas',

  params: [
    { key: 'speed', sym: '⌘', label: '世代速率', min: 1, max: 20, step: 1, value: 8, format: v => (v | 0) + '/s' },
  ],
  buttons: [
    { id: 'bWire', label: '笔 · 导线', fn: c => { c._s.brush = 3; }, active: c => c._s.brush === 3 },
    { id: 'bHead', label: '笔 · 电子头', fn: c => { c._s.brush = 1; }, active: c => c._s.brush === 1 },
    { id: 'bErase', label: '笔 · 擦除', fn: c => { c._s.brush = 0; }, active: c => c._s.brush === 0 },
    { id: 'clock', label: '载入时钟回路', fn: c => circuit(c) },
    { id: 'clear', label: '清空', fn: c => clearAll(c) },
  ],
  note: '点击画布绘制。律法：头变尾，尾变线，线遇 1–2 个头则点亮。',

  async init(ctx) {
    const W = Math.min(190, Math.floor(ctx.w / CELL));
    const H = Math.min(120, Math.floor(ctx.h / CELL));
    ctx._s = {
      W, H, brush: 3, acc: 0,
      grid: new Uint8Array(W * H), next: new Uint8Array(W * H),
      off: document.createElement('canvas'), palette: null, palHue: -1,
    };
    ctx._s.off.width = W; ctx._s.off.height = H;
    ctx._s.octx = ctx._s.off.getContext('2d');
    ctx._s.img = ctx._s.octx.createImageData(W, H);
    circuit(ctx);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, { W, H } = s;
    const ptr = ctx.pointer;
    /* the board is centered; the cursor must cross the same moat */
    const ox = (ctx.w - W * CELL) / 2, oy = (ctx.h - H * CELL) / 2;

    /* paint — interpolated along the stroke, so fast hands leave no gaps */
    if (ptr.down || ptr.click) {
      const stamp = (gx, gy) => {
        for (let dy = 0; dy <= 1; dy++) for (let dx = 0; dx <= 1; dx++) {
          const x = gx + dx, y = gy + dy;
          if (x >= 0 && y >= 0 && x < W && y < H) s.grid[y * W + x] = s.brush;
        }
      };
      const gx = Math.floor((ptr.x - ox) / CELL), gy = Math.floor((ptr.y - oy) / CELL);
      const last = s._last || [gx, gy];
      const steps = Math.max(Math.abs(gx - last[0]), Math.abs(gy - last[1]), ptr.click ? 0 : 1);
      for (let i = 0; i <= steps; i++) {
        stamp(
          Math.round(last[0] + (gx - last[0]) * i / steps),
          Math.round(last[1] + (gy - last[1]) * i / steps),
        );
      }
      s._last = [gx, gy];
      ptr.click = null;
    }
    if (!ptr.down) s._last = null;

    /* step */
    s.acc += dt * ctx.params.speed;
    let n = Math.min(s.acc | 0, 6);
    s.acc -= n;
    while (n--) step(s);

    /* palette */
    const hue = ctx.accentHue | 0;
    if (!s.palette || s.palHue !== hue) {
      s.palHue = hue;
      const mk = (v) => { const [r, gg, b] = hsl(v[1], v[2], v[3]); return [r, gg, b].map(x => x * 255 | 0); };
      s.palette = [
        [20, 17, 13],                                  // empty
        mk([0, hue + 6, .7, .62]),                     // head — bright accent
        mk([0, hue + 6, .7, .4]),                      // tail
        mk([0, 40, .28, .22]),                         // wire — dim bronze
      ];
    }

    /* raster */
    const d = s.img.data;
    for (let i = 0; i < W * H; i++) {
      const c = s.palette[s.grid[i]];
      const j = i * 4;
      d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255;
    }
    s.octx.putImageData(s.img, 0, 0);
    g.imageSmoothingEnabled = false;
    const cw = W * CELL, ch = H * CELL;
    const ox2 = (ctx.w - cw) / 2, oy2 = (ctx.h - ch) / 2;
    g.fillStyle = '#14110D';
    g.fillRect(0, 0, ctx.w, ctx.h);
    g.drawImage(s.off, ox2, oy2, cw, ch);

    /* the board's rim, so the domain is visible */
    g.strokeStyle = 'rgba(140,122,80,.4)';
    g.lineWidth = 1;
    g.strokeRect(ox2 - 4.5, oy2 - 4.5, cw + 9, ch + 9);

    /* the brush — a quiet square that always tells the truth about where you are */
    if (ptr.inside) {
      const gx = Math.floor((ptr.x - ox2) / CELL), gy = Math.floor((ptr.y - oy2) / CELL);
      if (gx >= 0 && gy >= 0 && gx < W - 1 && gy < H - 1) {
        g.strokeStyle = 'rgba(233,225,207,.55)';
        g.lineWidth = 1;
        g.strokeRect(ox2 + gx * CELL + .5, oy2 + gy * CELL + .5, CELL * 2 - 1, CELL * 2 - 1);
      }
    }
  },
};

function step(s) {
  const { W, H, grid, next } = s;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const v = grid[i];
      if (v === 1) next[i] = 2;
      else if (v === 2) next[i] = 3;
      else if (v === 3) {
        let heads = 0;
        for (let dy = -1; dy <= 1 && heads < 3; dy++)
          for (let dx = -1; dx <= 1 && heads < 3; dx++) {
            if (!dx && !dy) continue;
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
            if (grid[yy * W + xx] === 1) heads++;
          }
        next[i] = (heads === 1 || heads === 2) ? 1 : 3;
      } else next[i] = 0;
    }
  }
  s.grid = next; s.next = grid;
}

function clearAll(ctx) {
  ctx._s.grid.fill(0);
}

/* a clock feeding an OR gate — logic you can watch */
function circuit(ctx) {
  const s = ctx._s;
  const { W, H } = s;
  s.grid.fill(0);
  const wire = (x0, y0, x1, y1) => {
    const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
    let x = x0, y = y0;
    s.grid[y * W + x] = 3;
    while (x !== x1 || y !== y1) {
      if (x !== x1) x += dx; else if (y !== y1) y += dy;
      if (x >= 0 && y >= 0 && x < W && y < H) s.grid[y * W + x] = 3;
    }
  };
  const rectLoop = (x0, y0, x1, y1) => {
    wire(x0, y0, x1, y0); wire(x1, y0, x1, y1);
    wire(x1, y1, x0, y1); wire(x0, y1, x0, y0);
  };

  /* two clock loops with different periods */
  rectLoop(10, 14, 50, 30);
  rectLoop(10, 58, 50, 78);

  /* fan-out into an OR merge at (118, 46) */
  wire(50, 22, 100, 22); wire(100, 22, 100, 44); wire(100, 44, 118, 44);
  wire(50, 68, 100, 68); wire(100, 68, 100, 48); wire(100, 48, 118, 48);
  wire(118, 44, 118, 48);
  /* output wire to a dead end */
  wire(118, 46, 150, 46);

  /* seed one head on each loop */
  s.grid[14 * W + 30] = 1;
  s.grid[58 * W + 30] = 1;
}
