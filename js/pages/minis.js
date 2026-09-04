/* 衍 · door sigils — each hall's door holds a tiny living window:
   a miniature of what waits inside. Seven small looms, one shared shuttle. */

import { mulberry32, TAU, hslCss } from '../core/math.js';

/* each mini: { init(g, w, h, rng), draw(g, w, h, t, dt) } — css pixel space */

function lorenzMini() {
  let pts = [[1, 1, 1]], alt = [1.01, 1, 1];
  const trails = [[], []];
  let ang = 0;
  const step = (p, dt) => {
    const s = 10, r = 28, b = 8 / 3;
    const h = dt * 4.2;
    const dx = s * (p[1] - p[0]);
    const dy = p[0] * (r - p[2]) - p[1];
    const dz = p[0] * p[1] - b * p[2];
    p[0] += dx * h; p[1] += dy * h; p[2] += dz * h;
  };
  return {
    init() { trails[0].length = 0; trails[1].length = 0; },
    draw(g, w, h, t, dt) {
      g.fillStyle = 'rgba(13,12,10,.16)'; g.fillRect(0, 0, w, h);
      ang += dt * .12;
      const S = Math.min(w, h) / 55;
      for (let k = 0; k < 2; k++) {
        const p = k ? alt : pts[0];
        for (let i = 0; i < 3; i++) step(p, dt);
        const c = Math.cos(ang), s = Math.sin(ang);
        const x = (p[0] * c - p[1] * s) * S;
        const y = (p[1] * c + p[0] * s) * S * .35 - (p[2] - 25) * S * .8;
        trails[k].push([w / 2 + x, h * .62 + y]);
        if (trails[k].length > 260) trails[k].shift();
        g.strokeStyle = k ? 'rgba(233,225,207,.75)' : 'rgba(166,58,43,.8)';
        g.lineWidth = 1;
        g.beginPath();
        trails[k].forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py));
        g.stroke();
      }
    },
  };
}

function juliaMini() {
  return {
    draw(g, w, h, t) {
      const W = 54, H = Math.round(54 * h / w);
      const img = g.createImageData(W, H);
      const ca = .7885 * Math.cos(t * .1), cb = .7885 * Math.sin(t * .1);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let zx = (x / W - .5) * 2.6, zy = (y / H - .5) * 2.6 * (h / w);
        let i = 0;
        while (i < 36 && zx * zx + zy * zy < 4) {
          const nx = zx * zx - zy * zy + ca;
          zy = 2 * zx * zy + cb; zx = nx; i++;
        }
        const o = (y * W + x) * 4;
        const v = Math.pow(i / 36, .7);
        img.data[o] = 233 * v; img.data[o + 1] = 225 * v; img.data[o + 2] = 207 * v * .9;
        img.data[o + 3] = 255;
      }
      g.imageSmoothingEnabled = true;
      const off = document.createElement('canvas'); off.width = W; off.height = H;
      off.getContext('2d').putImageData(img, 0, 0);
      g.drawImage(off, 0, 0, w, h);
    },
  };
}

function lifeMini() {
  const W = 46, H = 110;
  let grid = new Uint8Array(W * H);
  const seed = () => { for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < .28 ? 1 : 0; };
  seed();
  let acc = 0;
  return {
    init() { seed(); },
    draw(g, w, h, t, dt) {
      acc += dt;
      if (acc > .16) {
        acc = 0;
        const n = new Uint8Array(W * H);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          let s = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            s += grid[((y + dy + H) % H) * W + ((x + dx + W) % W)];
          }
          const i = y * W + x;
          n[i] = grid[i] ? (s === 2 || s === 3 ? 1 : 0) : (s === 3 ? 1 : 0);
        }
        grid = n;
        if (grid.reduce((a, b) => a + b, 0) < 40) seed();
      }
      g.fillStyle = '#0D0C0A'; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(233,225,207,.85)';
      const cw = w / W, ch = h / H;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
        if (grid[y * W + x]) g.fillRect(x * cw, y * ch, cw * .8, ch * .8);
    },
  };
}

function waveMini() {
  return {
    draw(g, w, h, t) {
      g.fillStyle = '#0D0C0A'; g.fillRect(0, 0, w, h);
      const s1 = w * .3 + Math.sin(t * .2) * w * .1, s2 = w * .7 + Math.sin(t * .17) * w * .1;
      for (let x = 0; x < w; x += 1.5) {
        let a = 0;
        for (let y = 0; y < h; y += 3) {
          const d1 = Math.hypot(x - s1, y - h * .45), d2 = Math.hypot(x - s2, y - h * .45);
          a = Math.sin(d1 * .35 - t * 6) / (1 + d1 * .04) + Math.sin(d2 * .35 - t * 6) / (1 + d2 * .04);
          const v = Math.min(1, Math.abs(a) * .55);
          g.fillStyle = `rgba(233,225,207,${v * .9})`;
          g.fillRect(x, y, 1.5, 3);
        }
      }
    },
  };
}

function phylloMini() {
  const pts = [];
  return {
    init() { pts.length = 0; },
    draw(g, w, h, t) {
      g.fillStyle = 'rgba(13,12,10,.22)'; g.fillRect(0, 0, w, h);
      const GA = 2.39996;
      const n = Math.floor((t * 4) % 260) + 40;
      if (pts.length < n) for (let i = pts.length; i < n; i++) pts.push(i);
      const S = Math.min(w, h) / 34;
      for (const i of pts) {
        const r = S * Math.sqrt(i), a = i * GA;
        const x = w / 2 + r * Math.cos(a), y = h / 2 + r * Math.sin(a);
        g.fillStyle = hslCss((i * 3 + t * 20) % 360, .25, .75, .8);
        g.beginPath(); g.arc(x, y, 1.1, 0, TAU); g.fill();
      }
      if (pts.length > 300) pts.length = 0;
    },
  };
}

function cosmosMini() {
  const stars = [];
  const rng = mulberry32(99);
  for (let i = 0; i < 130; i++) {
    const r = 6 + Math.pow(rng(), .7) * 52, a = rng() * TAU;
    stars.push({ r, a, sp: .5 / Math.sqrt(r) });
  }
  return {
    draw(g, w, h, t, dt) {
      g.fillStyle = 'rgba(13,12,10,.3)'; g.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) / 96;
      g.fillStyle = 'rgba(233,225,207,.8)';
      for (const s of stars) {
        s.a += s.sp * dt;
        const x = cx + Math.cos(s.a) * s.r * S * (w / h);
        const y = cy + Math.sin(s.a) * s.r * S * .55;
        g.globalAlpha = .3 + .5 * (s.r / 58);
        g.fillRect(x, y, 1.1, 1.1);
      }
      g.globalAlpha = 1;
    },
  };
}

function mindMini() {
  const W = 46;
  let row = new Uint8Array(W), hist = [];
  row[Math.floor(W / 2)] = 1;
  let acc = 0;
  return {
    draw(g, w, h, t, dt) {
      acc += dt;
      if (acc > .07) {
        acc = 0;
        const n = new Uint8Array(W);
        for (let x = 0; x < W; x++) {
          const l = row[(x - 1 + W) % W], r = row[(x + 1) % W];
          n[x] = l ^ r; // rule 90
        }
        row = n;
        hist.push(row.slice());
        if (hist.length > 200) { hist.shift(); hist[0][Math.floor(W / 2)] = 1; }
      }
      g.fillStyle = '#0D0C0A'; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(233,225,207,.8)';
      const cw = w / W, ch = h / Math.max(hist.length, 1);
      hist.forEach((r, y) => r.forEach((v, x) => v && g.fillRect(x * cw, y * ch, cw * .85, ch * .8)));
    },
  };
}

const FACTORIES = {
  chaos: lorenzMini, fractal: juliaMini, emergence: lifeMini,
  waves: waveMini, growth: phylloMini, cosmos: cosmosMini, mind: mindMini,
};

/* one shuttle: a single rAF for all visible doors at ~30fps */
export function doorMinis(doors) {
  const items = [];
  for (const [hallId, canvas] of doors) {
    const make = FACTORIES[hallId];
    if (!make) continue;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const m = make();
    const item = { canvas, m, visible: true, t: Math.random() * 100 };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, r.width * dpr); canvas.height = Math.max(2, r.height * dpr);
      const g = canvas.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      item.w = r.width; item.h = r.height;
      m.init?.(g, item.w, item.h);
    };
    resize();
    item.resize = resize;
    items.push(item);
  }
  const io = new IntersectionObserver(es => {
    for (const e of es) {
      const it = items.find(i => i.canvas === e.target);
      if (it) it.visible = e.isIntersecting;
    }
  }, { rootMargin: '80px' });
  items.forEach(i => io.observe(i.canvas));

  let raf = 0, last = performance.now(), run = true, acc = 0;
  function loop(now) {
    if (!run) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, .1);
    last = now;
    acc += dt;
    if (acc < 1 / 30) return;
    const step = acc; acc = 0;
    for (const it of items) {
      if (!it.visible) continue;
      it.t += step;
      try { it.m.draw(it.canvas.getContext('2d'), it.w, it.h, it.t, step); }
      catch (e) { it.visible = false; console.warn('mini', e); }
    }
  }
  raf = requestAnimationFrame(loop);
  const onRz = () => items.forEach(i => i.resize());
  addEventListener('resize', onRz);
  return { destroy() { run = false; cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', onRz); } };
}
