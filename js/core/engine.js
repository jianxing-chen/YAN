/* 衍 · engine — the host that lets an exhibit live.
   One canvas, one loop, one contract:
     init(ctx) → frame(ctx, dt, t) → resize(ctx) → dispose(ctx)
   The ctx is the little world an exhibit inhabits: its canvas, its
   parameters, the pointer, the hue of the current aeon phase. */

import { createGL } from './gl.js';
import { aeon } from './aeon.js';
import { mulberry32 } from './math.js';
import { get } from './store.js';

export const INK = [0.078, 0.067, 0.051];   // #14110D

export class ExhibitHost {
  constructor(hostEl) {
    this.el = hostEl;
    this.canvas = document.createElement('canvas');
    hostEl.appendChild(this.canvas);
    this.running = false;
    this.exhibit = null;
    this.mountId = 0;
    this.slowFrames = 0;
    this.quality = 1;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* pointer state, in CSS pixels relative to the canvas */
    this.pointer = { x: 0, y: 0, px: 0, py: 0, dx: 0, dy: 0, down: false, inside: false, wheel: 0, click: null };
    this._bindPointer();

    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this.el);
  }

  /* ── lifecycle ─────────────────────────────────────────────── */

  async mount(exhibit, seedSalt = 0) {
    this.unmount();
    const id = ++this.mountId;
    this.exhibit = exhibit;
    this.t = 0;
    this.last = performance.now();
    this.slowFrames = 0;

    this._sizeCanvas();
    const dimW = this.fixedSize ? this.fixedSize[0] : this.canvas.clientWidth;
    const dimH = this.fixedSize ? this.fixedSize[1] : this.canvas.clientHeight;
    const ctx = this.ctx = {
      host: this,
      canvas: this.canvas,
      el: this.el,
      w: dimW,
      h: dimH,
      dpr: this.fixedSize ? 1 : this._dpr(),
      quality: this.quality,
      reduced: this.reduced,
      params: Object.fromEntries((exhibit.params || []).map(p => [p.key, get('p.' + exhibit.id + '.' + p.key, p.value)])),
      pointer: this.pointer,
      rng: mulberry32((Date.now() ^ (seedSalt * 2654435761)) >>> 0),
      accentHue: 44, aeonT: 0,
      frame: 0,
      gl: null, g2: null,
      fail: (msg) => this._fail(msg),
    };

    try {
      if (exhibit.engine === 'webgl') {
        const gl = createGL(this.canvas, { preserve: !!this.preserve });
        if (!gl) throw new Error('此浏览器不支持 WebGL2');
        ctx.gl = gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      } else {
        ctx.g2 = this.canvas.getContext('2d');
        this._apply2dTransform(ctx);
      }
      await exhibit.init(ctx);
    } catch (err) {
      console.error('[yan] exhibit init failed:', exhibit.id, err);
      this._fail(err.message || String(err));
      return false;
    }

    if (id !== this.mountId) return false;   // superseded while initializing
    this.running = true;
    this._loop = (now) => this._tick(now, id);
    requestAnimationFrame(this._loop);
    if (typeof window !== 'undefined') window.__yan = ctx;   // palace diagnostics
    return true;
  }

  unmount() {
    this.mountId++;
    this.running = false;
    if (this.exhibit?.dispose && this.ctx) {
      try { this.exhibit.dispose(this.ctx); } catch (e) { console.warn(e); }
    }
    this.exhibit = null;
  }

  _tick(now, id) {
    if (!this.running || id !== this.mountId) return;
    requestAnimationFrame(this._loop);
    this.stepOnce(now, id);
  }

  /* one deterministic frame — diagnostics drive this directly,
     immune to the sleeping-pane throttling that suspends rAF */
  stepOnce(now, id = this.mountId) {
    if (!this.running || id !== this.mountId) return;
    if (document.hidden && !this.ignoreHidden) { this.last = now; return; }

    let dt = Math.min((now - this.last) / 1000, .1);
    this.last = now;
    if (dt <= 0) dt = 1 / 120;
    this.t += dt;

    const a = aeon();
    this.ctx.accentHue = a.hue;
    this.ctx.aeonT = a.t01;
    this.ctx.frame++;

    try {
      this.exhibit.frame(this.ctx, dt, this.t);
    } catch (err) {
      console.error('[yan] exhibit frame failed:', this.exhibit.id, err);
      this.running = false;
      this._fail(err.message || String(err));
      return;
    }

    /* pointer deltas are only meaningful during the frame that saw them */
    const p = this.pointer;
    p.wheel = 0; p.click = null; p.dx = 0; p.dy = 0;

    /* graceful degradation: nothing stutters for long */
    if (dt > .05 && this.quality > .55) {
      if (++this.slowFrames > 45) {
        this.quality = .55;
        this.ctx.quality = .55;
        this.canvas.style.width = '100%'; this.canvas.style.height = '100%';
        this._sizeCanvas(1);
        this.ctx.dpr = 1;
        if (this.ctx.g2) this._apply2dTransform(this.ctx);
        if (this.ctx.gl) this.ctx.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        try { this.exhibit.resize?.(this.ctx); } catch (e) { console.warn(e); }
        this.slowFrames = 0;
      }
    } else if (dt < .04) this.slowFrames = Math.max(0, this.slowFrames - 1);
  }

  /* ── sizing ────────────────────────────────────────────────── */

  _dpr() { return Math.min(window.devicePixelRatio || 1, 2); }

  _sizeCanvas(forceDpr) {
    if (this.fixedSize) {
      const [fw, fh] = this.fixedSize;
      this.canvas.width = fw; this.canvas.height = fh;
      this.canvas.style.width = fw + 'px';
      this.canvas.style.height = fh + 'px';
      return;
    }
    const dpr = forceDpr || this._dpr();
    this.canvas.width = Math.max(2, Math.round(this.canvas.clientWidth * dpr));
    this.canvas.height = Math.max(2, Math.round(this.canvas.clientHeight * dpr));
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
  }

  _resize() {
    if (!this.exhibit || !this.ctx) return;
    if (this.fixedSize) return;
    this._sizeCanvas();
    this.ctx.w = this.canvas.clientWidth;
    this.ctx.h = this.canvas.clientHeight;
    this.ctx.dpr = this._dpr();
    if (this.ctx.gl) this.ctx.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    if (this.ctx.g2) this._apply2dTransform(this.ctx);
    try { this.exhibit.resize?.(this.ctx); } catch (e) { console.warn(e); }
  }

  /* exhibits draw in CSS pixels; the backing store is dpr× — keep the
     2d context's coordinate system matched to what they can see */
  _apply2dTransform(ctx) {
    const dpr = this.fixedSize ? 1 : ctx.dpr;
    ctx.g2.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _fail(msg) {
    if (this.el.querySelector('.ap-fail')) return;
    const div = document.createElement('div');
    div.className = 'ap-fail';
    div.innerHTML = `<p><span class="eyebrow">此窗暂暗 · THIS WINDOW IS DARK</span><br><br>${msg}<br><br>
      <span style="font-size:11px;opacity:.5">殿中尚有他窗 · other windows remain open</span></p>`;
    this.el.appendChild(div);
  }

  /* ── pointer ───────────────────────────────────────────────── */

  _bindPointer() {
    const c = this.canvas;
    const pos = (e) => {
      const r = c.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    c.addEventListener('pointerdown', e => {
      c.setPointerCapture(e.pointerId);
      const [x, y] = pos(e);
      Object.assign(this.pointer, { x, y, px: x, py: y, down: true, inside: true });
      this.pointer._downAt = [x, y, performance.now()];
      e.preventDefault();
    });
    c.addEventListener('pointermove', e => {
      const [x, y] = pos(e);
      const p = this.pointer;
      p.dx = x - p.x; p.dy = y - p.y;
      p.x = x; p.y = y; p.inside = true;
    });
    const up = e => {
      const p = this.pointer;
      p.down = false;
      if (p._downAt) {
        const [x0, y0, t0] = p._downAt;
        if (performance.now() - t0 < 400 && Math.hypot(p.x - x0, p.y - y0) < 6) {
          p.click = { x: p.x, y: p.y, alt: e.altKey, shift: e.shiftKey };
        }
        p._downAt = null;
      }
    };
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('pointerleave', () => { this.pointer.inside = false; });
    c.addEventListener('wheel', e => {
      e.preventDefault();
      this.pointer.wheel += Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) / 120;
    }, { passive: false });
  }

  setParam(key, v) {
    if (!this.ctx || !this.exhibit) return;
    this.ctx.params[key] = v;
    try { this.exhibit.paramChange?.(this.ctx, key, v); } catch (e) { console.warn(e); }
  }
}
