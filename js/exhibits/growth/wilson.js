/* 衍 · 威尔逊迷宫 — randomness completing itself */

import { hslCss } from '../../core/math.js';

export default {
  id: 'wilson', hall: 'growth', engine: 'canvas',

  params: [
    { key: 'pace', sym: '⌘', label: '步速', min: .3, max: 3, step: .1, value: 1.2 },
  ],
  note: '什么都不必做。随机游走抹去自身的环，直到踏遍每一格。完工即重新开始。',

  async init(ctx) {
    const cw = 26;
    const W = Math.max(20, Math.floor((ctx.w - 40) / cw));
    const H = Math.max(14, Math.floor((ctx.h - 40) / cw));
    ctx._s = {
      cw, W, H,
      inTree: new Uint8Array(W * H),
      dir: new Int8Array(W * H),          // carved passage direction per cell
      walker: -1,
      walkFrom: null,
      visitedInWalk: null,
      steps: 0, done: false, doneT: 0,
      total: 0,
    };
    const s = ctx._s;
    /* start from a random cell */
    const first = (ctx.rng() * W * H) | 0;
    s.inTree[first] = 1; s.total = 1;
    newWalker(ctx);
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  resize(ctx) {},

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s;
    const { W, H, cw } = s;
    const ox = (ctx.w - W * cw) / 2, oy = (ctx.h - H * cw) / 2;

    /* advance walk */
    if (!s.done) {
      const steps = Math.max(1, (dt * 160 * ctx.params.pace) | 0);
      for (let i = 0; i < steps && !s.done; i++) step(ctx);
    } else {
      s.doneT += dt;
      if (s.doneT > 2.2) {
        /* rebirth */
        s.inTree.fill(0);
        s.dir.fill(0);
        const first = (ctx.rng() * W * H) | 0;
        s.inTree[first] = 1; s.total = 1; s.done = false; s.doneT = 0; s.steps = 0;
        g.fillStyle = '#14110D';
        g.fillRect(0, 0, ctx.w, ctx.h);
        newWalker(ctx);
      }
    }

    /* draw walls as hairlines between unconnected cells */
    g.fillStyle = 'rgba(20,17,13,.22)';
    g.fillRect(ox, oy, W * cw, H * cw);
    g.strokeStyle = 'rgba(233,225,207,.5)';
    g.lineWidth = 1;
    g.beginPath();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!s.inTree[i]) continue;
      const px = ox + x * cw, py = oy + y * cw;
      if (!(s.dir[i] & 1) && (x === 0 || !s.inTree[i - 1])) { g.moveTo(px + .5, py); g.lineTo(px + .5, py + cw); }      // wall left
      if (!(s.dir[i] & 2) && (y === 0 || !s.inTree[i - W])) { g.moveTo(px, py + .5); g.lineTo(px + cw, py + .5); }     // wall up
      if (!(s.dir[i] & 4)) { g.moveTo(px + cw + .5, py); g.lineTo(px + cw + .5, py + cw); }                            // wall right
      if (!(s.dir[i] & 8)) { g.moveTo(px, py + cw + .5); g.lineTo(px + cw, py + cw + .5); }                            // wall down
    }
    g.stroke();

    /* the walker and its loop-erased trail */
    if (s.walkFrom) {
      g.fillStyle = hslCss(ctx.accentHue + 8, .6, 58, .9);
      for (const c of s.walkFrom) {
        const px = ox + (c % W) * cw + cw / 2, py = oy + ((c / W) | 0) * cw + cw / 2;
        g.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
    }

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.42)';
    g.fillText(s.done
      ? `完工 · ${W}×${H} 全格贯通 — 正在重启`
      : `贯通 ${s.total} / ${W * H}`, 24, ctx.h - 20);
  },
};

const DIRS = [[-1, 0, 1], [0, -1, 2], [1, 0, 4], [0, 1, 8]];

function newWalker(ctx) {
  const s = ctx._s;
  const { W, H } = s;
  let c;
  do { c = (ctx.rng() * W * H) | 0; } while (s.inTree[c]);
  s.walker = c;
  s.walkFrom = [c];
  s.visitedInWalk = new Uint8Array(W * H);
  s.visitedInWalk[c] = 1;
}

function step(ctx) {
  const s = ctx._s;
  const { W, H, inTree, dir, visitedInWalk } = s;
  if (s.walker < 0) { if (!s.done) newWalker(ctx); return; }

  const d = DIRS[(ctx.rng() * 4) | 0];
  const x = s.walker % W + d[0], y = ((s.walker / W) | 0) + d[1];
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const nc = y * W + x;
  s.steps++;

  if (inTree[nc]) {
    /* carve the recorded, loop-erased path into the tree */
    for (let i = 0; i < s.walkFrom.length; i++) {
      const c = s.walkFrom[i];
      const next = i + 1 < s.walkFrom.length ? s.walkFrom[i + 1] : nc;
      const dx = (next % W) - (c % W), dy = ((next / W) | 0) - ((c / W) | 0);
      const side = dx < 0 ? 1 : dx > 0 ? 4 : dy < 0 ? 2 : 8;
      const rev = dx < 0 ? 4 : dx > 0 ? 1 : dy < 0 ? 8 : 2;
      if (!inTree[c]) { inTree[c] = 1; s.total++; }
      dir[c] |= side;
      if (!inTree[next]) {          // newly claimed path cell
        inTree[next] = 1; s.total++;
        dir[next] |= rev;
      } else if (i + 1 < s.walkFrom.length) {
        dir[next] |= rev;           // earlier cell of this same path
      }
      // else: next is the pre-existing tree — leave its walls alone
    }
    if (s.total >= W * H) s.done = true;
    s.walker = -1; s.walkFrom = null;
    if (!s.done) newWalker(ctx);
    return;
  }

  if (visitedInWalk[nc]) {
    /* loop-erase */
    let idx = s.walkFrom.indexOf(nc);
    for (let i = idx + 1; i < s.walkFrom.length; i++) visitedInWalk[s.walkFrom[i]] = 0;
    s.walkFrom.length = idx + 1;
  } else {
    visitedInWalk[nc] = 1;
    s.walkFrom.push(nc);
  }
  s.walker = nc;
}
