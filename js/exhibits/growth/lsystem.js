/* 衍 · 文法花园 — trees that were recited, not drawn */

import { hslCss, TAU } from '../../core/math.js';

const GRAMMARS = [
  {
    name: '灌木 3°', axiom: 'F', rules: { F: 'FF-[-F+F+F]+[+F-F-F]' }, angle: 22.5, iters: 4,
  },
  {
    name: ' fern 蕨', axiom: 'X', rules: {
      X: 'F+[[X]-X]-F[-FX]+X', F: 'FF',
    }, angle: 22.5, iters: 5,
  },
  {
    name: '分叉树', axiom: 'F', rules: { F: 'F[+F]F[-F][F]' }, angle: 20, iters: 5,
  },
  {
    name: '垂柳', axiom: 'F', rules: { F: 'FF-[-F+F+F]+[+F-F-F]' }, angle: 16, iters: 5,
  },
];

export default {
  id: 'lsystem', hall: 'growth', engine: 'canvas',

  params: [
    { key: 'grow', sym: '⌘', label: '生长速度', min: .2, max: 2, step: .05, value: .8 },
    { key: 'wind', sym: '風', label: '风', min: 0, max: 1, step: .05, value: .35 },
  ],
  buttons: GRAMMARS.map((gr, i) => ({ id: 'g' + i, label: gr.name, fn: c => { c._s.g = i; restart(c); } })),
  note: '这里的树没有一笔是画出来的——它们是被「念」出来的。',

  async init(ctx) {
    ctx._s = { g: 0, t: 0, segs: null, order: null };
    restart(ctx);
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  resize(ctx) {
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    s.t = Math.min(1, s.t + dt * P.grow * .22);
    if (s.t >= 1 && s._done !== true) { s._done = true; }
    const g2 = GRAMMARS[s.g];

    /* expand string once (cached) */
    if (!s.segs) expand(s, g2);

    const visible = s.segs.length * easeOut(s.t);
    const windT = s.windT = (s.windT || 0) + dt;

    g.fillStyle = 'rgba(20,17,13,.14)';
    g.fillRect(0, 0, ctx.w, ctx.h);

    const S = Math.min(ctx.w, ctx.h) / (2 + g2.iters * .8);

    /* draw back-to-front with slight wind sway per depth */
    g.globalCompositeOperation = 'lighter';
    const n = Math.min(s.segs.length, visible | 0);
    for (let i = 0; i < n; i++) {
      const seg = s.segs[i];
      const sway = Math.sin(windT * .9 + seg.y0 * 3 + seg.depth * .5) * .012 * P.wind * seg.depth;
      const x0 = ctx.w / 2 + seg.x0 * S, y0 = ctx.h * .96 - seg.y0 * S;
      const x1 = ctx.w / 2 + (seg.x1 + sway) * S, y1 = ctx.h * .96 - seg.y1 * S;
      g.strokeStyle = hslCss(ctx.accentHue + 10 - seg.depth * 6, .42, 24 + 12 * seg.depth, .34);
      g.lineWidth = Math.max(.5, 2.4 - seg.depth * .5);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    g.globalCompositeOperation = 'source-over';

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.4)';
    g.fillText(`${g2.name}  ·  F → ${g2.rules.F || Object.values(g2.rules)[0].slice(0, 12) + '…'}  ·  segs = ${s.segs.length}`, 24, ctx.h - 20);
  },
};

function easeOut(t) { return 1 - Math.pow(1 - t, 2.4); }

function restart(ctx) {
  const s = ctx._s; if (!s) return;
  s.segs = null; s.t = 0; s._done = false;
}

function expand(s, gr) {
  let str = gr.axiom;
  for (let i = 0; i < gr.iters; i++) {
    let out = '';
    for (const ch of str) out += gr.rules[ch] ?? ch;
    str = out;
    if (str.length > 400000) break;
  }
  /* interpret with growing lengths — growth is the animation of length */
  const segs = [];
  const stack = [];
  let x = 0, y = 0, ang = Math.PI / 2, depth = 0;
  const dlen = .06;
  for (const ch of str) {
    if (ch === 'F') {
      const nx = x + Math.cos(ang) * dlen;
      const ny = y + Math.sin(ang) * dlen;
      segs.push({ x0: x, y0: y, x1: nx, y1: ny, depth });
      x = nx; y = ny;
    } else if (ch === '+') ang += gr.angle * Math.PI / 180;
    else if (ch === '-') ang -= gr.angle * Math.PI / 180;
    else if (ch === '[') { stack.push([x, y, ang, depth]); depth++; }
    else if (ch === ']') { const [px, py, pa, pd] = stack.pop(); x = px; y = py; ang = pa; depth = pd; }
    if (segs.length > 26000) break;
  }
  s.segs = segs;
}
