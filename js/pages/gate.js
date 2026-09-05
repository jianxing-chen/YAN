/* 衍 · the gate — 太初之门.
   A mote of light breathes in the ink. Enter directly, or cast coins:
   the cast hexagram becomes the patron of your visit, tinting every hall
   by a few degrees for as long as you stay. */

import { cast, seedFrom } from '../data/iching.js';
import { mulberry32 } from '../core/math.js';
import { set } from '../core/store.js';
import { sound } from '../core/audio.js';

export function renderGate(root) {
  root.innerHTML = `
  <div class="gate">
    <canvas class="mote"></canvas>
    <div class="mount"></div>
    <div class="gate-center rise">
      <div class="gate-char">衍</div>
      <div class="gate-sub">无 尽 之 殿 · THE PALACE WITHOUT END</div>
      <div class="gate-actions">
        <button class="gate-act" data-act="enter">入 殿</button>
        <span class="gate-or">或</span>
        <button class="gate-act" data-act="cast">起 卦</button>
        <span class="gate-or">或</span>
        <button class="gate-act gate-quiet" data-act="learn" title="格致院 · 讲义与学习路径">格 致</button>
      </div>
      <div class="gate-hex" hidden>
        <div class="hex-lines"></div>
        <div class="hex-name"></div>
        <div class="hex-gloss"></div>
        <button class="hex-act">携 卦 入 殿</button>
      </div>
    </div>
    <div class="gate-foot eyebrow">殿有三律 · 万物生于简律 · 观者亦是展品 · 殿无恒形</div>
  </div>`;

  /* ── the breathing mote ── */
  const canvas = root.querySelector('.mote');
  const g = canvas.getContext('2d');
  let raf = 0, run = true, t0 = performance.now();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const size = () => {
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
  };
  size();
  addEventListener('resize', size);

  function frame(now) {
    if (!run) return;
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
    g.fillStyle = '#14110D';
    g.fillRect(0, 0, w, h);

    /* faint breathing halo */
    const breathe = .5 + .5 * Math.sin(t / 3.2);
    const R = (Math.min(w, h) * .38) * (1 + .04 * Math.sin(t / 5));
    const grd = g.createRadialGradient(cx, cy, 0, cx, cy, R);
    grd.addColorStop(0, `rgba(233,225,207,${.05 + .03 * breathe})`);
    grd.addColorStop(1, 'rgba(233,225,207,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);

    /* drifting motes of dust */
    g.fillStyle = 'rgba(233,225,207,.5)';
    for (let i = 0; i < 40; i++) {
      const sd = mulberry32(i * 7919 + 13);
      const bx = sd() * w, by = sd() * h, sp = 6 + sd() * 20, ph = sd() * 7;
      const y = (by + t * sp) % h;
      const x = bx + Math.sin(t * .3 + ph) * 14;
      const a = .05 + .12 * (0.5 + 0.5 * Math.sin(t * .8 + ph * 3));
      g.globalAlpha = a * dpr;
      g.fillRect(x, y, 1.4 * dpr, 1.4 * dpr);
    }
    g.globalAlpha = 1;

    /* the central mote */
    const mr = (5 + 2.4 * breathe) * dpr;
    const mg = g.createRadialGradient(cx, cy, 0, cx, cy, mr * 6);
    mg.addColorStop(0, 'rgba(233,225,207,.95)');
    mg.addColorStop(.25, `rgba(233,225,207,${.28 + .1 * breathe})`);
    mg.addColorStop(1, 'rgba(233,225,207,0)');
    g.fillStyle = mg;
    g.beginPath(); g.arc(cx, cy, mr * 6, 0, 7); g.fill();
  }
  raf = requestAnimationFrame(frame);

  /* ── actions ── */
  const hexBox = root.querySelector('.gate-hex');
  const actions = root.querySelector('.gate-actions');

  const go = () => { sound.unlock(); location.hash = '#/map'; };
  root.querySelector('[data-act="learn"]').addEventListener('click', () => { sound.unlock(); location.hash = '#/learn'; });

  root.querySelector('[data-act="enter"]').addEventListener('click', () => {
    set('hex', null);
    go();
  });

  root.querySelector('[data-act="cast"]').addEventListener('click', () => {
    sound.unlock();
    actions.style.display = 'none';
    hexBox.hidden = false;

    const rng = mulberry32((Date.now() ^ (Math.random() * 0xFFFFFFFF)) >>> 0);
    const result = cast(rng);
    const linesBox = root.querySelector('.hex-lines');
    linesBox.innerHTML = result.lines.map(v =>
      `<div class="hex-line ${v % 2 ? 'yang' : 'yin'}">${
        v % 2 ? '<i></i>' : '<i></i><i></i>'
      }</div>`).join('');
    const bars = linesBox.querySelectorAll('i');
    bars.forEach(b => { /* draw one by one, bottom-up */ });
    const barsByLine = result.lines.map((v, li) =>
      linesBox.querySelectorAll(`.hex-line:nth-child(${li + 1}) i`));

    let li = 0;
    (function drawLine() {
      if (li >= 6) {
        const nameEl = root.querySelector('.hex-name');
        const h = result.hex;
        nameEl.textContent = `${h.n} · ${h.zh}` + (result.next ? ` 之 ${result.next.zh}` : '');
        root.querySelector('.hex-gloss').innerHTML =
          `${h.g}<br><span style="opacity:.6">${h.en} — ${h.ge}</span>` +
          (result.next ? `<br><span style="opacity:.6">将变 · ${result.next.en}</span>` : '');
        nameEl.style.opacity = 0;
        nameEl.style.transition = 'opacity 1200ms';
        requestAnimationFrame(() => { nameEl.style.opacity = 1; });
        return;
      }
      barsByLine[li].forEach(b => b.classList.add('on'));
      li++;
      setTimeout(drawLine, 340);
    })();

    root.querySelector('.hex-act').addEventListener('click', () => {
      set('hex', { n: result.hex.n, zh: result.hex.zh, en: result.hex.en, seed: seedFrom(result.lines) });
      go();
    });
  });

  return {
    destroy() {
      run = false;
      cancelAnimationFrame(raf);
      removeEventListener('resize', size);
    },
  };
}
