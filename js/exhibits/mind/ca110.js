/* 衍 · 元胞巡礼 — two hundred fifty-six skies */

import { hsl } from '../../core/math.js';

export default {
  id: 'ca110', hall: 'mind', engine: 'canvas',

  params: [
    { key: 'rule', sym: '§', label: '宇宙编号', min: 0, max: 255, step: 1, value: 110, format: v => 'Rule ' + (v | 0) },
    { key: 'speed', sym: '⌘', label: '世代速率', min: 1, max: 40, step: 1, value: 12, format: v => (v | 0) + '/s' },
  ],
  buttons: [
    { id: 'r110', label: '110 · 能思考者', fn: c => c.host.setParam('rule', 110) },
    { id: 'r90', label: '90 · 谢尔宾斯基', fn: c => c.host.setParam('rule', 90) },
    { id: 'r30', label: '30 · 混沌之海', fn: c => c.host.setParam('rule', 30) },
    { id: 'r184', label: '184 · 交通流', fn: c => c.host.setParam('rule', 184) },
    { id: 'center', label: '播种 · 单点', fn: c => { c._s.mode = 0; reseed(c); } },
    { id: 'random', label: '播种 · 随机之海', fn: c => { c._s.mode = 1; reseed(c); } },
  ],
  note: '八枚开关即一个宇宙。拨动编号，毁灭一个世界，再看哪个世界还能思考。',

  async init(ctx) {
    const cell = ctx.w > 1200 ? 5 : 4;
    const W = Math.floor(ctx.w / cell);
    const H = Math.ceil(ctx.h / cell);
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const octx = off.getContext('2d');
    ctx._s = {
      cell, W, H, off, octx, img: octx.createImageData(W, H),
      rows: [], mode: 0, acc: 0, palette: null, palHue: -1,
    };
    reseed(ctx);
  },

  frame(ctx, dt) {
    const s = ctx._s, { W, H } = s;
    s.acc += dt * ctx.params.speed;
    let n = Math.min(s.acc | 0, 8);
    s.acc -= n;
    const rule = ctx.params.rule | 0;
    while (n--) {
      const cur = s.rows[s.rows.length - 1];
      const next = new Uint8Array(W);
      for (let x = 0; x < W; x++) {
        const l = cur[(x - 1 + W) % W], r = cur[(x + 1) % W];
        const bits = (l << 2) | (cur[x] << 1) | r;
        next[x] = (rule >> bits) & 1;
      }
      s.rows.push(next);
      if (s.rows.length > H) s.rows.shift();
    }

    const hue = ctx.accentHue | 0;
    if (!s.palette || s.palHue !== hue) {
      s.palHue = hue;
      s.palette = new Uint8Array(256 * 3);
      for (let a = 0; a < 256; a++) {
        const t = a / 255;
        const [r, gg, b] = hsl(hue + 8, .42, .05 + .5 * t);
        s.palette[a * 3] = r * 255; s.palette[a * 3 + 1] = gg * 255; s.palette[a * 3 + 2] = b * 255;
      }
    }

    const d = s.img.data;
    for (let y = 0; y < H; y++) {
      const row = s.rows[Math.max(0, s.rows.length - 1 - y)] || s.rows[0];
      for (let x = 0; x < W; x++) {
        const v = row[x] ? 255 : 0;
        const j = (y * W + x) * 4;
        if (v) { d[j] = s.palette[v * 3]; d[j + 1] = s.palette[v * 3 + 1]; d[j + 2] = s.palette[v * 3 + 2]; }
        else { d[j] = 20; d[j + 1] = 17; d[j + 2] = 13; }
        d[j + 3] = 255;
      }
    }
    s.octx.putImageData(s.img, 0, 0);
    const g = ctx.g2;
    g.imageSmoothingEnabled = false;
    g.drawImage(s.off, 0, 0, W * s.cell, H * s.cell);

    /* the eight switches of law */
    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.45)';
    const bits = rule.toString(2).padStart(8, '0');
    g.fillText(`Rule ${rule} · ${bits.split('').join(' ')}`, 24, ctx.h - 20);
  },
};

function reseed(ctx) {
  const s = ctx._s; if (!s) return;
  const row = new Uint8Array(s.W);
  if (s.mode === 0) row[s.W >> 1] = 1;
  else for (let x = 0; x < s.W; x++) row[x] = ctx.rng() < .5 ? 1 : 0;
  s.rows = [row];
}
