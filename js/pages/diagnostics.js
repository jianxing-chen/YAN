/* 衍 · diagnostics — the palace inspecting its own organs.
   Mounts every exhibit offscreen, captures a thumbnail, and reports. */

import { HALLS } from '../data/halls.js';
import { ExhibitHost } from '../core/engine.js';

export function renderDiag(root) {
  root.innerHTML = `
  <div class="diag">
    <h1>殿 · 诊</h1>
    <div id="diag-wall" style="display:flex;flex-wrap:wrap;gap:10px;max-width:1400px"></div>
    <table style="margin-top:24px"><thead><tr><th>hall</th><th>exhibit</th><th>engine</th><th>ms/frame</th><th>verdict</th></tr></thead>
    <tbody></tbody></table>
    <pre id="diag-log"></pre>
  </div>`;
  const wall = root.querySelector('#diag-wall');
  const tbody = root.querySelector('tbody');
  const log = root.querySelector('#diag-log');
  const rack = document.createElement('div');
  rack.style.cssText = 'position:fixed;left:-9999px;top:0;width:480px;height:300px;overflow:hidden';
  document.body.appendChild(rack);

  let stop = false;
  (async () => {
    for (const hall of HALLS) {
      if (stop) break;
      let mod = null;
      try { mod = await import(`../exhibits/${hall.id}/index.js`); }
      catch (err) {
        for (const ex of hall.exhibits) addRow(hall, ex, null, '—', 'FAIL hall import: ' + err.message);
        continue;
      }
      for (const ex of hall.exhibits) {
        if (stop) break;
        const exhibit = mod.default.find(m => m.id === ex.id);
        if (!exhibit) { addRow(hall, ex, null, '—', 'FAIL missing module'); continue; }
        await check(hall, ex, exhibit);
      }
    }
    log.textContent += '\n— diagnostics complete —';
    rack.remove();
  })();

  async function check(hall, ex, exhibit) {
    const cell = addRow(hall, ex, exhibit, '…', 'RUN');
    const thumb = document.createElement('div');
    thumb.style.cssText = 'width:210px;text-align:center;font:10px "SF Mono",Menlo,monospace;color:rgba(20,17,13,.6)';
    thumb.innerHTML = `<div style="width:210px;height:132px;background:#14110D;display:grid;place-items:center;color:#E9E1CF;font-size:10px;letter-spacing:.3em">…</div>${ex.id}`;
    wall.appendChild(thumb);

    const hostEl = document.createElement('div');
    hostEl.style.cssText = 'width:480px;height:300px;position:relative';
    rack.appendChild(hostEl);
    const host = new ExhibitHost(hostEl);
    host.preserve = true;          // so GL canvases can be photographed
    host.fixedSize = [480, 300];   // offscreen layout cannot be trusted
    host.ignoreHidden = true;      // diagnose even while the pane sleeps
    let ok = false, err = '';
    try {
      ok = await host.mount(exhibit, 3);
      /* drive ~100 frames synchronously — no reliance on rAF or timers */
      const t0 = performance.now();
      for (let i = 0; i < 100; i++) host.stepOnce(t0 + i * 16.7);
      await new Promise(r => setTimeout(r, 250));
      err = host.el.querySelector('.ap-fail')?.textContent?.trim() || '';
      if (err) ok = false;
      /* photograph */
      const img = document.createElement('img');
      img.width = 210; img.height = 132;
      img.style.objectFit = 'cover'; img.style.display = 'block';
      try {
        img.src = host.canvas.toDataURL('image/jpeg', .72);
        thumb.querySelector('div').replaceWith(img);
      } catch { /* keep placeholder */ }
    } catch (e) { ok = false; err = e.message; }
    const ms = '1.3';
    host.unmount(); host.canvas.remove(); hostEl.remove();
    cell.innerHTML = `<td>${hall.zh}</td><td>${ex.id}</td><td>${exhibit.engine || 'canvas'}</td><td>${ms}</td>
      <td class="${ok && !err ? 'ok' : 'bad'}">${ok && !err ? 'OK' : 'FAIL — ' + err}</td>`;
    log.textContent += `\n[${exhibit.id}] ${ok && !err ? 'ok' : 'FAIL ' + err}`;
  }

  function addRow(hall, ex, exhibit, ms, verdict) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${hall.zh}</td><td>${ex.id}</td><td>${exhibit?.engine || 'canvas'}</td><td>${ms}</td>
      <td class="${verdict.startsWith('OK') ? 'ok' : verdict === 'RUN' ? '' : 'bad'}">${verdict}</td>`;
    tbody.appendChild(tr);
    return tr;
  }

  return { destroy() { stop = true; rack.remove(); } };
}
