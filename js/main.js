/* 衍 · main — the doorkeeper. Routes, grain, first light. */

import { renderGate } from './pages/gate.js';
import { renderMap } from './pages/map.js';
import { renderExhibit } from './pages/exhibit.js';
import { renderManifesto } from './pages/manifesto.js';
import { renderDiag } from './pages/diagnostics.js';
import { markFirstVisit } from './core/aeon.js';
import { wander } from './ui/wander.js';

/* film grain — one noise tile, generated once */
(function grain() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const img = g.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 165 | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 26 + Math.random() * 42 | 0;
  }
  g.putImageData(img, 0, 0);
  document.getElementById('grain').style.backgroundImage = `url(${c.toDataURL()})`;
})();

function parse() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return parts;
}

let current = null;

async function render() {
  if (current?.destroy) { try { current.destroy(); } catch {} }
  current = null;
  wander.exit();
  const root = document.getElementById('root');
  root.innerHTML = '';
  markFirstVisit();

  const p = parse();
  let page;
  if (p[0] === 'map') page = renderMap(root);
  else if (p[0] === 'hall' && p[1]) page = await renderExhibit(root, p[1], p[2]);
  else if (p[0] === 'manifesto') page = renderManifesto(root);
  else if (p[0] === 'diagnostics') page = renderDiag(root);
  else page = renderGate(root);

  current = { destroy: () => page?.destroy?.() };
}

window.addEventListener('hashchange', render);
render();
