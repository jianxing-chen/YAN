/* 衍 · 格致院 — the academy. A science annex to the palace:
   every lesson's illustration is the real exhibit, alive and touchable. */

import { HALLS, hallById, cnNum } from '../data/halls.js';
import { ExhibitHost } from '../core/engine.js';

const COURSE_META = {
  chaos: { tag: '一只蝴蝶如何咬碎预言', minutes: 35 },
  fractal: { tag: '无限如何折叠进一寸', minutes: 35 },
  emergence: { tag: '无领袖的秩序', minutes: 40 },
  waves: { tag: '世界的通用语言', minutes: 30 },
  growth: { tag: '被时间煮出的形式', minutes: 40 },
  cosmos: { tag: '最古老的雕塑家', minutes: 35 },
  mind: { tag: '会画线的心灵', minutes: 30 },
};

export async function renderLearn(root, a, b) {
  if (a === 'glossary') return renderGlossary(root);
  if (a && hallById(a)) return renderLesson(root, hallById(a), b);
  return renderAcademy(root);
}

/* ── academy home ── */
function renderAcademy(root) {
  root.innerHTML = `
  <div class="academy appear">
    <div class="academy-inner">
      <a class="back" href="#/map">← 殿图</a>
      <div class="acad-hero">
        <h1>格 致 院</h1>
        <span class="en">THE ACADEMY</span>
      </div>
      <p class="acad-mission">
        殿里的每一件展品都由几行律法驱动——格致院的任务，是把这几行律法背后的<b>历史、数学与实验</b>完整摊开。
        七门课对应七座殿，二十九讲对应二十九窗；讲义里的每一幅插图都是殿中真展品的活体——它们<b>此刻正在运行，可以直接上手</b>。
        不需要任何数学基础：需要的公式都会逐个符号解释。建议配一杯茶。
      </p>

      <div class="courses">
        ${HALLS.map((h, i) => {
          const m = COURSE_META[h.id];
          return `
          <a class="course" href="#/learn/${h.id}">
            <span class="no">第${cnNum(i + 1)}课</span>
            <span class="name">${h.zh}<span class="tag">${m.tag} · ${m.minutes} 分钟 · ${h.exhibits.length} 讲</span></span>
            <span class="go">${h.exhibits.length} 讲 →</span>
          </a>`;
        }).join('')}
      </div>

      <div class="acad-box">
        <h3>学 习 路 径</h3>
        <ol>
          <li><b>快速版</b>（约 1.5 小时）：只读每课的「本课脉络」，然后去殿里把每件展品玩一遍——玩过再回来看，讲义会自己长出意义。</li>
          <li><b>标准版</b>（约 4 小时）：按 1→7 课顺序通读，动手实验全做。混沌、分形两课是其余各课的钥匙，请勿跳过。</li>
          <li><b>深耕版</b>（数周）：每讲读完，把「延伸阅读」里的原著找来。思考题先自己想再展开。词汇表放在最后作为回马枪。</li>
        </ol>
      </div>

      <div class="acad-box">
        <h3>词 汇 表</h3>
        <p>从「吸引子」到「混沌的边缘」，四十个术语的两三行短定义，按课序隐含排列。
        <a href="#/learn/glossary" style="color:var(--cinnabar)">进入词汇表 →</a></p>
      </div>

      <div class="acad-colophon">
        格致院 · THE ACADEMY · 殿之书院翼<br>
        讲义与展品互为注脚：文中「活图」皆为真展品的现场运行，非录像非截图<br>
        零依赖 · 公式以排版呈现，不借助任何外部库
      </div>
    </div>
  </div>`;
  return {};
}

/* ── hall lesson ── */
async function renderLesson(root, hall, anchor) {
  let mod = null;
  try { mod = await import(`../data/lessons.${hall.id}.js`); } catch {}
  const L = mod?.default;
  const idx = HALLS.indexOf(hall);
  const prev = HALLS[(idx - 1 + HALLS.length) % HALLS.length];
  const next = HALLS[(idx + 1) % HALLS.length];

  root.innerHTML = `
  <div class="academy appear">
    <div class="academy-inner">
      <a class="back" href="#/learn">← 格致院</a>
      <header class="lesson-head">
        <div class="eyebrow">第${cnNum(idx + 1)}课 · ${hall.en}</div>
        <h1>${hall.zh}</h1>
        <div class="lesson-meta">
          <span>${L ? L.intro.minutes : '?'} 分钟</span>
          <span>${hall.exhibits.length} 讲</span>
          <span>${COURSE_META[hall.id].tag}</span>
        </div>
        ${L ? L.intro.lead.map(p => `<p class="lead">${p}</p>`).join('') : '<p class="lead">讲义尚未铸成。</p>'}
      </header>

      <nav class="section-nav">
        ${hall.exhibits.map(ex => `<a href="#/learn/${hall.id}/${ex.id}">${ex.title.zh}</a>`).join('')}
        <a href="#/hall/${hall.id}/${hall.exhibits[0].id}" style="color:var(--cinnabar);border-color:rgba(166,58,43,.4)">直入此殿 →</a>
      </nav>

      ${L ? `<div class="map-block lesson-flow">
        <h2>本 课 脉 络</h2>
        ${L.intro.map.map(p => `<p>${p}</p>`).join('')}
      </div>` : ''}

      <div class="lesson-flow">
        ${hall.exhibits.map(ex => {
          const les = L?.lessons?.[ex.id];
          return `
          <section class="lesson-section" id="sec-${ex.id}">
            <div class="head">
              <h2>${ex.title.zh}</h2>
              <a class="go" href="#/hall/${hall.id}/${ex.id}">入殿观看 →</a>
            </div>
            <div class="sub-en">${ex.title.en.toUpperCase()}</div>
            ${les ? renderLessonBody(les) : '<p>此窗的讲义尚未铸成——先去殿中赏玩。</p>'}
            <div class="demo" data-demo="${ex.id}">
              <div class="demo-slot" style="width:${DEMO_W}px;height:${DEMO_H}px;position:relative"></div>
              <div class="demo-cap">
                <span class="live">活图</span>
                <span>${ex.subtitle.zh} · 图为殿中真展品的现场运行，可直接上手</span>
                <a href="#/hall/${hall.id}/${ex.id}">入殿 →</a>
              </div>
            </div>
          </section>`;
        }).join('')}
      </div>

      <div class="acad-box lesson-outro">
        <h3>课 毕</h3>
        <p>此刻回到殿中，这些名字——吸引子、分岔、临界、共振——会开始在每一扇窗里向你打招呼。<a href="#/hall/${hall.id}/${hall.exhibits[0].id}">携讲义入殿 →</a></p>
      </div>

      <nav class="lesson-nav">
        <a href="#/learn/${prev.id}">← 第${cnNum(((idx - 1 + HALLS.length) % HALLS.length) + 1)}课 · ${prev.zh}</a>
        <a href="#/learn/${next.id}">第${cnNum((idx + 1) % HALLS.length + 1)}课 · ${next.zh} →</a>
      </nav>
    </div>
  </div>`;

  /* mount live demos lazily */
  const hosts = [];
  const slots = [...root.querySelectorAll('.demo')];
  const io = new IntersectionObserver(async entries => {
    for (const e of entries) {
      const exId = e.target.dataset.demo;
      const ex = hall.exhibits.find(x => x.id === exId);
      if (!ex) continue;
      if (e.isIntersecting) {
        if (e.target._mounted) continue;
        e.target._mounted = true;
        const host = await mountDemo(e.target.querySelector('.demo-slot'), hall.id, ex.id);
        if (host) hosts.push({ el: e.target, host });
      } else {
        const i = hosts.findIndex(h => h.el === e.target);
        if (i >= 0) {
          hosts[i].host.unmount();
          hosts[i].host.canvas.remove();
          hosts.splice(i, 1);
          e.target._mounted = false;
        }
      }
    }
  }, { rootMargin: '220px' });
  slots.forEach(s => io.observe(s));

  if (anchor) {
    requestAnimationFrame(() => {
      root.querySelector(`#sec-${CSS.escape(anchor)}`)?.scrollIntoView({ block: 'start' });
    });
  }

  return {
    destroy() {
      io.disconnect();
      for (const h of hosts) { h.host.unmount(); h.host.canvas.remove(); }
    },
  };
}

const DEMO_W = 360, DEMO_H = 240;

async function mountDemo(slot, hallId, exId) {
  try {
    const mod = await import(`../exhibits/${hallId}/index.js`);
    const exhibit = mod.default.find(m => m.id === exId);
    if (!exhibit) return null;
    const host = new ExhibitHost(slot);
    host.fixedSize = [DEMO_W, DEMO_H];
    host.captureWheel = false;   // the reading page keeps its scroll
    await host.mount(exhibit, 7);
    return host;
  } catch (err) {
    console.warn('demo', exId, err);
    slot.textContent = '此窗暂未点亮';
    return null;
  }
}

function renderLessonBody(les) {
  let html = '';
  for (const p of les.what || []) html += `<p>${p}</p>`;
  if (les.history?.length) html += `<p>${les.history.map(x => x).join('')}</p>`;
  /* math is a flow: prose paragraphs interleaved with formula blocks */
  for (const b of les.math || []) {
    if (typeof b === 'string') { html += `<p>${b}</p>`; continue; }
    html += `<div class="formula">${b.f}${
      b.legend ? `<div class="flegend">${b.legend.map(([sy, m]) => `<span class="s">${sy}</span><span class="m">${m}</span>`).join('')}</div>` : ''
    }</div>`;
  }
  if (les.mathFormula) html += `<div class="formula">${les.mathFormula}</div>`;   // legacy
  if (les.mathAfter?.length) for (const p of les.mathAfter) html += `<p>${p}</p>`;
  if (les.try?.length) {
    html += `<div class="try-box"><h4>动 手 实 验</h4><ul>${les.try.map(t => `<li>${t}</li>`).join('')}</ul></div>`;
  }
  if (les.params?.length) {
    html += `<div class="param-list"><dl>${les.params.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>`;
  }
  if (les.extend?.length) {
    html += `<div class="extend"><h4>延 伸 阅 读</h4><ul>${
      les.extend.map(([t, note]) => `<li><b>${t}</b> — ${note}</li>`).join('')
    }</ul></div>`;
  }
  return html;
}

/* ── glossary ── */
async function renderGlossary(root) {
  let terms = [];
  try { terms = (await import('../data/lessons.glossary.js')).default; } catch {}
  root.innerHTML = `
  <div class="academy appear">
    <div class="academy-inner">
      <a class="back" href="#/learn">← 格致院</a>
      <div class="acad-hero"><h1>词 汇 表</h1><span class="en">GLOSSARY</span></div>
      <p class="acad-mission">四十个术语，按课序隐含排列。每一条都只有两三行——它们不是定义的完整版，是你从殿中回来时的回马枪。</p>
      <div class="glossary">
        ${terms.map(([zh, en, def]) => `
          <div class="g-item"><b>${zh}</b><span class="g-en">${en}</span><p>${def}</p></div>`).join('')}
      </div>
    </div>
  </div>`;
  return {};
}
