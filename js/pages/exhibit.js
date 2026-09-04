/* 衍 · the exhibit page — one aperture, one plaque, two sliding panels.
   道 comes from the register of halls; 器 is dynamically imported. */

import { hallById, neighbors, cnNum } from '../data/halls.js';
import { ExhibitHost } from '../core/engine.js';
import { mountDial } from '../ui/dial.js';
import { sound } from '../core/audio.js';
import { get, set } from '../core/store.js';
import { wander } from '../ui/wander.js';
import { aeon } from '../core/aeon.js';

export async function renderExhibit(root, hallId, exId) {
  const hall = hallById(hallId);
  if (!hall) { location.hash = '#/map'; return {}; }
  const ex = hall.exhibits.find(e => e.id === exId)
    || hall.exhibits[0];
  if (ex.id !== exId) { location.hash = `#/hall/${hallId}/${ex.id}`; return {}; }

  let module = null, essays = {};
  try { module = await import(`../exhibits/${hallId}/index.js`); }
  catch (err) { console.error(err); }
  try { essays = (await import(`../data/essays.${hallId}.js`)).default; } catch {}

  const exhibit = module?.default?.find(m => m.id === ex.id) || null;
  const nb = neighbors(hallId, ex.id);
  const idxInHall = hall.exhibits.indexOf(ex);
  const a = aeon();
  const hex = get('hex', null);
  /* on touch, the wheel's lines are rewritten for fingers */
  const coarse = matchMedia('(pointer: coarse)').matches;
  const hintZh = coarse ? ex.hint.zh.replace(/滚轮/g, '双指') : ex.hint.zh;
  const hintEn = coarse ? (ex.hint.en || '').replace(/wheel/gi, 'pinch').replace(/scroll/gi, 'pinch') : (ex.hint.en || '');

  root.innerHTML = `
  <div class="ex-page">
    <div class="aperture"></div>
    <div class="mount"></div>

    <aside class="plaque appear">
      <a class="plaque-hall vtext" href="#/map" title="${hall.en}">${hall.zh}</a>
      <div class="plaque-rule"></div>
      <div class="seal">衍</div>
      <div class="plaque-title vtext">${ex.title.zh}</div>
      <div class="plaque-sub vtext-mixed">${ex.title.en}</div>
      <div class="plaque-index num">${cnNum(idxInHall + 1)} / ${cnNum(hall.exhibits.length)}</div>
      <canvas class="dial"></canvas>
    </aside>

    <nav class="crumb">
      <a href="#/map">殿图</a><span class="sep">/</span>
      <span>${hall.zh}</span><span class="sep">/</span>
      <span style="color:var(--silk)">${ex.title.zh}</span>
    </nav>
    <div class="hint">${hintZh}${hintEn ? ' · ' + hintEn : ''}</div>

    <nav class="ex-nav">
      <button class="arrow" data-nav="prev" title="上一件 ←">←</button>
      <span class="counter">${ex.subtitle.zh}</span>
      <button class="arrow" data-nav="next" title="下一件 →">→</button>
    </nav>

    <div class="toolrow">
      ${essays[ex.id] ? '<button class="tool" data-tool="essay" title="品 · 铭文 (E)">品</button>' : ''}
      <button class="tool" data-tool="params" title="律 · 参数 (P)">律</button>
      <button class="tool" data-tool="sound" title="殿声 (M)">声</button>
      <button class="tool" data-tool="vigil" title="守夜 (V)">游</button>
    </div>

    <aside class="panel essay-panel">
      <div class="panel-head">
        <span class="glyph">品</span><span class="t">${ex.title.zh}</span>
        <button class="close" data-close>合 · ESC</button>
      </div>
      <div class="panel-body essay">
        ${essays._hall ? `<div class="eyebrow">${hall.zh} · ${hall.en}</div>` : ''}
        <div class="zh">${(essays[ex.id]?.zh || ['此窗尚未留下铭文。']).map(p => `<p>${p}</p>`).join('')}</div>
        <div class="en">
          <div class="eyebrow">ON THIS EXHIBIT</div>
          ${(essays[ex.id]?.en || ['No inscription yet for this window.']).map(p => `<p>${p}</p>`).join('')}
        </div>
      </div>
    </aside>

    <aside class="panel params-panel">
      <div class="panel-head">
        <span class="glyph">律</span><span class="t">参数 · PARAMETERS</span>
        <button class="close" data-close>合 · ESC</button>
      </div>
      <div class="panel-body params-body"></div>
    </aside>

    <div class="vigil-clock num"></div>
    <div class="vigil-phase">${a.phase.zh} · ${a.phase.note}</div>
  </div>`;

  const q = s => root.querySelector(s);

  /* ── mount the exhibit ── */
  const host = new ExhibitHost(q('.aperture'));
  const loading = document.createElement('div');
  loading.className = 'ap-loading';
  loading.textContent = '入 殿 中';
  q('.aperture').appendChild(loading);

  const seedSalt = hex ? (hex.seed % 97) + 1 : 0;
  let mounted = false;
  if (exhibit) mounted = await host.mount(exhibit, seedSalt);
  else {
    const div = document.createElement('div');
    div.className = 'ap-fail';
    div.innerHTML = `<p>此窗的机构尚未铸成。<br><span style="font-size:11px;opacity:.5">the mechanism of this window is not yet cast</span></p>`;
    q('.aperture').appendChild(div);
  }
  loading.remove();

  /* ── dial ── */
  const destroyDial = mountDial(q('.dial'));

  /* ── params panel ── */
  const paramsBody = q('.params-body');
  const hasParams = (exhibit?.params?.length ?? 0) > 0 || (exhibit?.buttons?.length ?? 0) > 0;
  if (!hasParams) q('[data-tool="params"]').style.display = 'none';

  function buildParams() {
    if (!exhibit) return;
    const rows = [];
    for (const p of exhibit.params || []) {
      const v = host.ctx.params[p.key];
      const shown = p.format ? p.format(v) : (+v).toFixed(Math.abs(p.step ?? 1) < 1 ? 2 : 0);
      rows.push(`
        <div class="param">
          <div class="param-head">
            <span class="sym">${p.sym || ''}</span>
            <span class="k">${p.label}</span>
            <span class="v" data-v="${p.key}">${shown}</span>
          </div>
          <input type="range" data-p="${p.key}" min="${p.min}" max="${p.max}" step="${p.step ?? (p.max - p.min) / 200}" value="${v}">
        </div>`);
    }
    if (exhibit.buttons?.length) {
      rows.push(`<div class="param-actions">${
        exhibit.buttons.map(b => `<button class="chip" data-b="${b.id}">${b.label}</button>`).join('')
      }</div>`);
    }
    if (exhibit.note) rows.push(`<div class="param-note">${exhibit.note}</div>`);
    paramsBody.innerHTML = rows.join('');

    paramsBody.querySelectorAll('input[type=range]').forEach(inp => {
      inp.addEventListener('input', () => {
        const key = inp.dataset.p;
        const v = parseFloat(inp.value);
        host.setParam(key, v);
        set('p.' + exhibit.id + '.' + key, v);
        const p = exhibit.params.find(pp => pp.key === key);
        const shown = p.format ? p.format(v) : v.toFixed(Math.abs(p.step ?? 1) < 1 ? 2 : 0);
        paramsBody.querySelector(`[data-v="${key}"]`).textContent = shown;
      });
    });
    paramsBody.querySelectorAll('[data-b]').forEach(btn => {
      btn.addEventListener('click', () => {
        const b = exhibit.buttons.find(bb => bb.id === btn.dataset.b);
        try { b?.fn(host.ctx); } catch (e) { console.warn(e); }
      });
    });
  }
  buildParams();

  /* ── panels & tools ── */
  const essayPanel = q('.essay-panel'), paramsPanel = q('.params-panel');
  function toggle(panel, btn) {
    const open = panel.classList.contains('open');
    [essayPanel, paramsPanel].forEach(p => p.classList.remove('open'));
    q('[data-tool="essay"]')?.classList.remove('on');
    q('[data-tool="params"]')?.classList.remove('on');
    if (!open) { panel.classList.add('open'); btn?.classList.add('on'); }
  }
  q('[data-tool="essay"]')?.addEventListener('click', e => toggle(essayPanel, e.currentTarget));
  q('[data-tool="params"]').addEventListener('click', e => toggle(paramsPanel, e.currentTarget));
  root.querySelectorAll('[data-close]').forEach(b =>
    b.addEventListener('click', () => { essayPanel.classList.remove('open'); paramsPanel.classList.remove('open'); q('.tool.on')?.classList.remove('on'); }));

  const soundBtn = q('[data-tool="sound"]');
  const paintSound = () => { soundBtn.classList.toggle('on', sound.on); soundBtn.style.opacity = sound.on ? 1 : .75; };
  soundBtn.addEventListener('click', () => { sound.setOn(!sound.on); paintSound(); });
  paintSound();
  sound.setHall(hallId);

  /* ── navigation ── */
  const go = f => { wander.exit(); location.hash = f; };
  q('[data-nav="prev"]').addEventListener('click', () =>
    go(`#/hall/${nb.prev.hall.id}/${nb.prev.exhibit.id}`));
  q('[data-nav="next"]').addEventListener('click', () =>
    go(`#/hall/${nb.next.hall.id}/${nb.next.exhibit.id}`));

  const vigilBtn = q('[data-tool="vigil"]');
  vigilBtn.addEventListener('click', () => wander.enter());

  /* ── keyboard ── */
  function onKey(e) {
    if (e.target.matches('input, textarea')) return;
    switch (e.key) {
      case 'ArrowRight': q('[data-nav="next"]').click(); break;
      case 'ArrowLeft': q('[data-nav="prev"]').click(); break;
      case 'e': case 'E': q('[data-tool="essay"]')?.click(); break;
      case 'p': case 'P': q('[data-tool="params"]').click(); break;
      case 'm': case 'M': soundBtn.click(); break;
      case 'v': case 'V': wander.enter(); break;
      case 'f': case 'F':
        document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
        break;
      case 'r': case 'R': if (exhibit) host.mount(exhibit, seedSalt); break;
      case 'Escape':
        if (wander.active) { wander.exit(); break; }
        if (essayPanel.classList.contains('open') || paramsPanel.classList.contains('open')) {
          essayPanel.classList.remove('open'); paramsPanel.classList.remove('open');
          q('.tool.on')?.classList.remove('on');
        } else go('#/map');
        break;
    }
  }
  addEventListener('keydown', onKey);

  return {
    destroy() {
      removeEventListener('keydown', onKey);
      destroyDial();
      host.unmount();
      host.canvas.remove();
    },
  };
}
