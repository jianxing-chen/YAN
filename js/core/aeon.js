/* 衍 · the aeon dial — 一昼夜之弧, an eight-hour day
   The museum keeps its own time. It is not clock time; it is vigil time —
   seconds the palace has actually been beheld. One full aeon is eight hours,
   passing through five phases. Hue is the only thing that leaks into the
   exhibits: 混沌 ember → 序 gold → 生 jade → 心 azure → 寂 dusk violet. */

import { get, set } from './store.js';
import { lerp, TAU } from './math.js';

export const AEON_SECONDS = 8 * 3600;        // the full arc: 8 hours
const PHASE_LEN = AEON_SECONDS / 5;

export const PHASES = [
  { key: 'hun',  zh: '混沌', en: 'PRIMORDIAL', hue: 352, sat: .62, note: '万物未分，律法在暗中转动' },
  { key: 'xu',   zh: '序',   en: 'ORDER',      hue: 44,  sat: .58, note: '对称凝结，第一条边界出现' },
  { key: 'sheng',zh: '生',   en: 'GROWTH',     hue: 152, sat: .52, note: '形式开始繁殖，边界学会呼吸' },
  { key: 'xin',  zh: '心',   en: 'MIND',       hue: 206, sat: .56, note: '观察者睁开眼睛，回望万律' },
  { key: 'ji',   zh: '寂',   en: 'DECAY',      hue: 264, sat: .30, note: '热寂不是终结，是下一次混沌的门' },
];

let liveSeconds = 0;   // accumulated but not yet flushed
let lastTick = 0;

function stored() { return get('vigilSec', 0) + liveSeconds; }

setInterval(() => {
  if (document.visibilityState !== 'visible') return;
  if (!lastTick) { lastTick = Date.now(); return; }
  const now = Date.now();
  const dt = Math.min(now - lastTick, 10000);
  lastTick = now;
  if (dt < 2000) return;
  liveSeconds += dt / 1000;
  set('vigilSec', get('vigilSec', 0) + dt / 1000);
}, 4000);

export function vigilSeconds() { return stored(); }

export function firstVisit() { return get('firstVisit', null); }
export function markFirstVisit() {
  if (!get('firstVisit', null)) set('firstVisit', Date.now());
}

/* current position on the arc */
export function aeon() {
  const s = stored();
  const t01 = (s % AEON_SECONDS) / AEON_SECONDS;
  const idx = Math.floor(t01 * 5);
  const within = t01 * 5 - idx;
  const cur = PHASES[idx % 5];
  const next = PHASES[(idx + 1) % 5];

  /* blend hue across the last 8% of a phase */
  const BLEND = .08;
  let hue = cur.hue, sat = cur.sat, mixing = 0;
  if (within > 1 - BLEND) {
    mixing = (within - (1 - BLEND)) / BLEND;
    hue = lerpAngle(cur.hue, next.hue, mixing);
    sat = lerp(cur.sat, next.sat, mixing);
  }
  return {
    seconds: s,
    t01,
    index: idx % 5,
    within,
    phase: cur,
    nextPhase: next,
    hue,
    sat,
    mixing,
    cycle: Math.floor(s / AEON_SECONDS),  // how many full aeons have passed
  };
}

function lerpAngle(a, b, t) {
  let d = ((b - a + 540) % 360) - 180;
  return (a + d * t + 360) % 360;
}

/* ── the dial — a thin bronze ring with one hairline hand ──── */

export function drawDial(canvas, opts = {}) {
  const a = aeon();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const S = opts.size || 46;
  if (canvas.width !== S * dpr) { canvas.width = S * dpr; canvas.height = S * dpr; }
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, S, S);
  const cx = S / 2, cy = S / 2, R = S / 2 - 3;

  /* the arc of five phases */
  g.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const p = PHASES[i];
    const a0 = -Math.PI / 2 + (i / 5) * TAU + .018;
    const a1 = -Math.PI / 2 + ((i + 1) / 5) * TAU - .018;
    g.beginPath();
    g.strokeStyle = `hsla(${p.hue}, ${p.sat * 100}%, 46%, ${i === a.index ? .85 : .3})`;
    g.arc(cx, cy, R, a0, a1);
    g.stroke();
  }

  /* the hand */
  const hand = -Math.PI / 2 + a.t01 * TAU;
  g.beginPath();
  g.strokeStyle = 'rgba(20,17,13,.85)';
  g.moveTo(cx + Math.cos(hand) * (R - 5), cy + Math.sin(hand) * (R - 5));
  g.lineTo(cx + Math.cos(hand) * (R - 0.5), cy + Math.sin(hand) * (R - 0.5));
  g.stroke();

  /* heart dot */
  g.beginPath();
  g.fillStyle = `hsl(${a.hue}, ${a.sat * 100}%, 40%)`;
  g.arc(cx, cy, 1.6, 0, TAU);
  g.fill();

  if (opts.label) {
    g.font = '8px "SF Mono", Menlo, monospace';
    g.fillStyle = 'rgba(20,17,13,.55)';
    g.textAlign = 'center';
    g.fillText(phaseClock(a), cx, cy + R + 9);
  }
}
export function phaseClock(a = aeon()) {
  const left = (1 - a.t01) * AEON_SECONDS;
  const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
