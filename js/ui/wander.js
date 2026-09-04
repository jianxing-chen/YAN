/* 衍 · the vigil — 守夜.
   In vigil mode the palace wanders itself: halls crossfade one into the
   next, chrome dissolves, and the only clock is the aeon. Built to hold
   an eight-hour arc without repeating itself exactly. */

import { flatExhibits } from '../data/halls.js';
import { sound } from '../core/audio.js';
import { vigilSeconds } from '../core/aeon.js';

let veilEl = null;
let timer = null;
let seq = 0;
let idleAt = 0;

function veil() {
  if (!veilEl) {
    veilEl = document.createElement('div');
    veilEl.id = 'vigil-veil';
    veilEl.style.cssText = `position:fixed;inset:0;background:#14110D;z-index:70;
      opacity:0;transition:opacity 1000ms cubic-bezier(.22,.8,.24,1);pointer-events:none`;
    document.body.appendChild(veilEl);
  }
  return veilEl;
}

function setVeil(on) { veil().style.opacity = on ? '1' : '0'; }

function route() { return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean); }

function nextHash() {
  const flat = flatExhibits();
  const r = route();
  let i = flat.findIndex(f => f.hall.id === r[1] && f.exhibit.id === r[2]);
  i = (i + 1) % flat.length;
  return `#/hall/${flat[i].hall.id}/${flat[i].exhibit.id}`;
}

function schedule(delay) {
  clearTimeout(timer);
  timer = setTimeout(advance, delay);
}

function advance() {
  if (!wander.active) return;
  const idleFor = (performance.now() - idleAt) / 1000;
  if (idleFor < 8) { schedule(20000); return; }   // someone is watching closely; wait
  setVeil(true);
  setTimeout(() => {
    if (!wander.active) { setVeil(false); return; }
    if (++seq % 8 === 0) sound.bell();
    location.hash = nextHash();
    setTimeout(() => setVeil(false), 900);
    schedule(52000 + Math.random() * 34000);
  }, 1050);
}

function onInput() {
  idleAt = performance.now();
  if (!wander.active) return;
  document.body.classList.add('vigil');
  showClock(true);
  clearTimeout(wander._clockTimer);
  wander._clockTimer = setTimeout(() => showClock(false), 2600);
}

function showClock(on) {
  const c = document.querySelector('.vigil-clock');
  const p = document.querySelector('.vigil-phase');
  if (c && on) {
    const vs = Math.floor(vigilSeconds());
    const h = Math.floor(vs / 3600), m = Math.floor((vs % 3600) / 60);
    const sec = vs % 60;
    c.textContent = `守夜 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  if (c) c.classList.toggle('show', on);
  if (p) p.classList.toggle('show', on);
  const x = document.getElementById('vigil-exit');
  if (x) x.classList.toggle('show', on);
}

export const wander = {
  active: false,
  _clockTimer: null,

  enter() {
    if (this.active) return;
    this.active = true;
    idleAt = performance.now();
    document.body.classList.add('vigil');
    veil();
    /* an exit for those without Esc — a pill that surfaces with the clock */
    if (!document.getElementById('vigil-exit')) {
      const btn = document.createElement('button');
      btn.id = 'vigil-exit';
      btn.textContent = '离 开 守 夜';
      btn.addEventListener('click', () => this.exit());
      document.body.appendChild(btn);
    }
    showClock(true);
    clearTimeout(this._clockTimer);
    this._clockTimer = setTimeout(() => showClock(false), 4200);
    this._bind();
    schedule(42000);
  },

  exit() {
    this.active = false;
    clearTimeout(timer);
    document.body.classList.remove('vigil');
    setVeil(false);
    showClock(false);
  },

  toggle() { this.active ? this.exit() : this.enter(); return this.active; },

  _bound: false,
  _bind() {
    if (this._bound) return;
    this._bound = true;
    for (const ev of ['pointermove', 'pointerdown', 'keydown'])
      window.addEventListener(ev, onInput, { passive: true });
  },
};
