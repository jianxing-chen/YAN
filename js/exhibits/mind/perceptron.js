/* 衍 · 感知机花园 — a mind learning to draw the line
   A 2-8-8-1 tanh network, trained live by SGD while you watch. */

import { hslCss, TAU } from '../../core/math.js';

const HID = [8, 8];

export default {
  id: 'perceptron', hall: 'mind', engine: 'canvas',

  params: [
    { key: 'lr', sym: 'η', label: '学习率', min: .005, max: .4, step: .005, value: .08, format: v => v.toFixed(3) },
  ],
  buttons: [
    { id: 'clear', label: '清空花园', fn: c => { c._s.samples = []; restartNet(c); } },
    { id: 'hard', label: '投喂双螺旋', fn: c => spiral(c) },
    { id: 'noise', label: '投喂噪声圆', fn: c => rings(c) },
  ],
  note: '点左半种红（+1），右半种蓝（−1）。边界是它此刻的信念。',

  async init(ctx) {
    ctx._s = { samples: [], loss: 1, heat: null };
    restartNet(ctx);
    rings(ctx);   // a living garden, already mid-thought
    ctx.g2.fillStyle = '#14110D';
    ctx.g2.fillRect(0, 0, ctx.w, ctx.h);
  },

  frame(ctx, dt) {
    const g = ctx.g2, s = ctx._s, P = ctx.params;
    const ptr = ctx.pointer;

    /* plant samples */
    if (ptr.click) {
      const label = ptr.click.x < ctx.w / 2 ? 1 : -1;
      s.samples.push({ x: ptr.click.x / ctx.w * 2 - 1, y: -(ptr.click.y / ctx.h * 2 - 1), l: label });
      ptr.click = null;
    }

    /* train a few steps per frame */
    const steps = 6;
    for (let k = 0; k < steps; k++) trainStep(s, P.lr);

    /* decision surface on a low-res grid */
    const HW = 92, HH = Math.round(92 * ctx.h / ctx.w);
    if (!s.heat || s.heat.width !== HW) {
      s.heat = document.createElement('canvas');
      s.heat.width = HW; s.heat.height = HH;
      s.hctx = s.heat.getContext('2d');
      s.himg = s.hctx.createImageData(HW, HH);
    }
    const d = s.himg.data;
    for (let j = 0; j < HH; j++) {
      const wy = -(j / HH * 2 - 1);
      for (let i = 0; i < HW; i++) {
        const wx = i / HW * 2 - 1;
        const out = forward(s, wx, wy);
        const t = (out + 1) / 2;
        const o = (j * HW + i) * 4;
        /* silk for +, bronze-azure for −, ink near the boundary */
        const str = Math.min(1, Math.abs(out) * 1.6);
        d[o] = 20 + (t > .5 ? 233 : 110) * str * .5;
        d[o + 1] = 17 + (t > .5 ? 225 : 140) * str * .5;
        d[o + 2] = 13 + (t > .5 ? 207 : 190) * str * .5;
        d[o + 3] = 255;
      }
    }
    s.hctx.putImageData(s.himg, 0, 0);
    g.imageSmoothingEnabled = true;
    g.drawImage(s.heat, 0, 0, ctx.w, ctx.h);

    /* samples */
    for (const sp of s.samples) {
      const px = (sp.x + 1) / 2 * ctx.w, py = -(sp.y - 1) / 2 * ctx.h;
      g.fillStyle = sp.l > 0 ? 'rgba(233,225,207,.95)' : 'rgba(120,160,200,.95)';
      g.beginPath(); g.arc(px, py, 3.2, 0, TAU); g.fill();
    }

    g.font = '10px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(233,225,207,.45)';
    g.fillText(`samples = ${s.samples.length}   loss = ${s.loss.toFixed(4)}   epoch ≈ ${(s._n || 0).toFixed(0)}`, 24, ctx.h - 20);
  },
};

/* ── the little mind ─────────────────────────────────────────── */

function mkWeights(seedRng) {
  const layers = [];
  let prev = 2;
  for (const h of HID) {
    layers.push(mkLayer(prev, h, seedRng));
    prev = h;
  }
  layers.push(mkLayer(prev, 1, seedRng));
  return layers;
}
function mkLayer(nin, nout, rng) {
  const w = new Float32Array(nin * nout);
  const scale = Math.sqrt(2 / nin);
  for (let i = 0; i < w.length; i++) w[i] = (rng() * 2 - 1) * scale;
  return { w, b: new Float32Array(nout), nin, nout };
}

function forward(s, x, y) {
  let a = [x, y];
  for (const L of s.net) {
    const out = new Float32Array(L.nout);
    for (let j = 0; j < L.nout; j++) {
      let z = L.b[j];
      for (let i = 0; i < L.nin; i++) z += L.w[j * L.nin + i] * a[i];
      out[j] = Math.tanh(z);
    }
    a = out;
  }
  return a[0];
}

function trainStep(s, lr) {
  if (!s.samples.length) return;
  s._n = (s._n || 0) + 1;
  let loss = 0;
  const idx = s._n % s.samples.length;
  /* a small random batch of 8 */
  for (let k = 0; k < 8; k++) {
    const sp = s.samples[(Math.random() * s.samples.length) | 0];
    loss += backprop(s, sp, lr);
  }
  s.loss = s.loss * .95 + (loss / 8) * .05;
}

function backprop(s, sp, lr) {
  /* forward storing activations */
  const acts = [[sp.x, sp.y]];
  let a = acts[0];
  for (const L of s.net) {
    const out = new Float32Array(L.nout);
    for (let j = 0; j < L.nout; j++) {
      let z = L.b[j];
      for (let i = 0; i < L.nin; i++) z += L.w[j * L.nin + i] * a[i];
      out[j] = Math.tanh(z);
    }
    acts.push(out);
    a = out;
  }
  const pred = a[0];
  const err = pred - sp.l;   // dL/d(pred) for L = ½(pred − label)²
  lossOf = err * err / 2;

  /* backward */
  let delta = [err * (1 - pred * pred)];
  for (let li = s.net.length - 1; li >= 0; li--) {
    const L = s.net[li];
    const aPrev = acts[li];
    const newDelta = li > 0 ? new Float32Array(L.nin) : null;
    for (let j = 0; j < L.nout; j++) {
      const dj = delta[j];
      for (let i = 0; i < L.nin; i++) {
        if (newDelta) newDelta[i] += L.w[j * L.nin + i] * dj;
        L.w[j * L.nin + i] -= lr * dj * aPrev[i];
      }
      L.b[j] -= lr * dj;
    }
    if (newDelta) for (let i = 0; i < L.nin; i++) newDelta[i] *= (1 - aPrev[i] * aPrev[i]);
    delta = newDelta;
  }
  return lossOf;
}

let lossOf = 0;

function restartNet(ctx) {
  const s = ctx._s; if (!s) return;
  s.net = mkWeights(ctx.rng);
  s._n = 0; s.loss = 1;
}

function spiral(ctx) {
  const s = ctx._s;
  for (let i = 0; i < 60; i++) {
    for (const sign of [1, -1]) {
      const t = i / 60;
      const a = t * TAU * 1.75 + (sign > 0 ? 0 : Math.PI);
      const r = .15 + t * .8;
      s.samples.push({ x: Math.cos(a) * r + (ctx.rng() - .5) * .12, y: Math.sin(a) * r + (ctx.rng() - .5) * .12, l: sign });
    }
  }
  restartNet(ctx);
}

function rings(ctx) {
  const s = ctx._s;
  for (let i = 0; i < 70; i++) {
    const inner = i < 30;
    const a = ctx.rng() * TAU;
    const r = inner ? ctx.rng() * .35 : .6 + ctx.rng() * .3;
    s.samples.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, l: inner ? -1 : 1 });
  }
  restartNet(ctx);
}
