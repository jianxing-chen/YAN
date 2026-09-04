/* 衍 · 阿贝尔砂堆 — the sand remembers */

import { hsl } from '../../core/math.js';

export default {
  id: 'sandpile', hall: 'emergence', engine: 'canvas',

  params: [
    { key: 'rate', sym: '⌘', label: '落砂速率', min: 2, max: 160, step: 2, value: 36, format: v => (v | 0) + '/s' },
  ],
  buttons: [
    { id: 'flat', label: '归于平', fn: c => reset(c) },
    { id: 'pinch', label: '再落一撮 ×1500', fn: c => drop(c, 1500) },
  ],
  note: '点击可在任意处落砂。落砂次序无关紧要——终局之形分毫不差。',

  async init(ctx) {
    const cell = 3;
    const W = Math.min(420, Math.floor(ctx.w / cell));
    const H = Math.min(300, Math.floor(ctx.h / cell));
    ctx._s = {
      cell, W, H,
      grid: new Uint8Array(W * H),
      off: document.createElement('canvas'),
      total: 0, acc: 0, palette: null, palHue: -1,
      stack: new Int32Array(W * H),
    };
    ctx._s.off.width = W; ctx._s.off.height = H;
    ctx._s.octx = ctx._s.off.getContext('2d');
    ctx._s.img = ctx._s.octx.createImageData(W, H);
    reset(ctx);
  },

  frame(ctx, dt) {
    const s = ctx._s, g = ctx.g2;
    const { W, H, grid } = s;

    s.acc += dt * ctx.params.rate;
    let n = Math.min(s.acc | 0, 400);
    s.acc -= n;
    if (n) drop(ctx, n);

    /* click */
    if (ctx.pointer.click) {
      const gx = (ctx.pointer.click.x / s.cell) | 0, gy = (ctx.pointer.click.y / s.cell) | 0;
      if (gx > 1 && gy > 1 && gx < W - 1 && gy < H - 1) {
        const i = gy * W + gx;
        grid[i] += 400; propagate(s);
        s.total += 400;
      }
      ctx.pointer.click = null;
    }

    /* palette */
    const hue = ctx.accentHue | 0;
    if (!s.palette || s.palHue !== hue) {
      s.palHue = hue;
      s.palette = [[20, 17, 13]];
      for (let v = 1; v <= 3; v++) {
        const [r, gg, b] = hsl(hue + 14 - v * 12, .5, .28 + v * .15);
        s.palette.push([r * 255 | 0, gg * 255 | 0, b * 255 | 0]);
      }
    }

    const d = s.img.data;
    for (let i = 0; i < W * H; i++) {
      const v = grid[i] & 3;
      const c = s.palette[v];
      const j = i * 4;
      d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255;
    }
    s.octx.putImageData(s.img, 0, 0);
    g.imageSmoothingEnabled = false;
    const cw = W * s.cell, ch = H * s.cell;
    g.drawImage(s.off, (ctx.w - cw) / 2, (ctx.h - ch) / 2, cw, ch);

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.42)';
    g.fillText(`grains = ${s.total.toLocaleString()}`, 24, ctx.h - 20);
  },
};

function reset(ctx) {
  const s = ctx._s; if (!s) return;
  s.grid.fill(0);
  s.total = 0;
}

function drop(ctx, n) {
  const s = ctx._s;
  const cx = s.W >> 1, cy = s.H >> 1;
  s.grid[cy * s.W + cx] += n;
  s.total += n;
  propagate(s);
}

function propagate(s) {
  const { W, H, grid, stack } = s;
  let sp = 0;
  const cx = W >> 1, cy = H >> 1;
  if (grid[cy * W + cx] >= 4) stack[sp++] = cy * W + cx;
  let guard = 2_000_000;
  while (sp > 0 && guard-- > 0) {
    const i = stack[--sp];
    if (grid[i] < 4) continue;
    const x = i % W, y = (i / W) | 0;
    const q = (grid[i] / 4) | 0;
    grid[i] -= q * 4;
    const push = (j, ok) => {
      if (!ok) { s.total -= q; return; }   // grains fall off the table
      grid[j] += q;
      if (grid[j] >= 4 && sp < stack.length - 4) stack[sp++] = j;
    };
    push(i - 1, x > 0); push(i + 1, x < W - 1);
    push(i - W, y > 0); push(i + W, y < H - 1);
  }
}
