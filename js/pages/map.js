/* 衍 · the hall map — 殿图.
   Seven doors set into silk, each with its own small living window. */

import { HALLS, cnNum } from '../data/halls.js';
import { doorMinis } from './minis.js';
import { mountDial } from '../ui/dial.js';
import { vigilSeconds, firstVisit, aeon, PHASES } from '../core/aeon.js';
import { sound } from '../core/audio.js';
import { get } from '../core/store.js';

export function renderMap(root) {
  const hex = get('hex', null);
  const days = firstVisit() ? Math.max(1, Math.ceil((Date.now() - firstVisit()) / 86400000)) : 1;
  const vs = Math.floor(vigilSeconds());
  const vh = Math.floor(vs / 3600), vm = Math.floor((vs % 3600) / 60);
  const a = aeon();

  root.innerHTML = `
  <div class="map appear">
    <div class="map-inner">
      <div class="map-head">
        <div class="map-char vtext">衍<small>YÁN</small></div>
        <div>
          <div class="eyebrow">THE PALACE WITHOUT END</div>
          <h1>殿 图</h1>
          <p class="map-intro">
            ${hex ? `你所携之卦为 <b style="color:var(--cinnabar)">${hex.n} · ${hex.zh}</b>（${hex.en}），它已为今日的殿色调了三分色。` : ''}
            七殿二十九窗。每扇门后是一件活的展品：它由几条简律驱动，此刻正在发生，不会重演。
            殿以守夜计时——你凝视的每一秒都被记入一昼夜之弧，此刻正处于
            <b>${a.phase.zh} · ${a.phase.en}</b>（${a.phase.note}）。
          </p>
        </div>
        <div style="margin-left:auto; text-align:right">
          <canvas class="dial" width="46" height="46"></canvas>
          <div class="eyebrow" style="margin-top:6px">${vh}时${String(vm).padStart(2, '0')}分 · 第${cnNum(a.cycle + 1)}昼</div>
        </div>
      </div>

      <div class="doors">
        ${HALLS.map((h, i) => `
          <a class="door" href="#/hall/${h.id}/${h.exhibits[0].id}" data-hall="${h.id}" title="${h.en}">
            <canvas></canvas>
            <span class="door-no num">${cnNum(i + 1)}</span>
            <span class="door-name vtext">${h.zh}</span>
            <span class="door-en">${h.en.replace('HALL OF ', '')}</span>
            <span class="door-count num">${h.exhibits.length} 窗</span>
          </a>`).join('')}
      </div>

      <footer class="map-foot">
        <a href="#/manifesto">殿 志</a>
        <a href="#/" >太初之门</a>
        <button id="soundToggle" class="chip" style="letter-spacing:.3em">殿 声 · 静</button>
        <span class="vigil-note">殿龄 ${days} 日 · 守夜 <span class="num">${vh}:${String(vm).padStart(2, '0')}</span></span>
      </footer>
    </div>
  </div>`;

  const destroyDial = mountDial(root.querySelector('.dial'), { size: 46 });

  const doors = [...root.querySelectorAll('.door')].map(d => [d.dataset.hall, d.querySelector('canvas')]);
  const minis = doorMinis(doors);

  const st = root.querySelector('#soundToggle');
  const paint = () => { st.textContent = sound.on ? '殿 声 · 鸣' : '殿 声 · 静'; };
  paint();
  st.addEventListener('click', () => { sound.setOn(!sound.on); paint(); });
  sound.setHall('map');

  return { destroy() { destroyDial(); minis.destroy(); } };
}
