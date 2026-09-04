/* 衍 · 双缝之影 — the classical wave equation, quantified honesty
   State texture packs (u, u_prev) in (R, G); toroidal grid; barrier via shader test. */

import { makeProgram, makeQuad, drawQuad, setU, PingPong, Target } from '../../core/gl.js';

const SIM = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uT;       // source time
uniform float uOmega;   // angular frequency
uniform float uGap;     // slit separation (uv)
uniform float uAspect;  // grid aspect (w/h)
out vec4 frag;

bool inBarrier(vec2 p) {
  // vertical barrier at x = 0.45, two slits symmetric about y = 0.5
  if (abs(p.x - 0.45) > 0.004) return false;
  float half_gap = uGap * 0.5;
  float width = 0.028;
  float d1 = abs(p.y - (0.5 - half_gap));
  float d2 = abs(p.y - (0.5 + half_gap));
  return (d1 > width) && (d2 > width);
}

void main(){
  vec2 p = uv;
  vec4 s = texture(uState, p);
  float u = s.r, up = s.g;
  vec4 l = texture(uState, p + vec2(-uTexel.x, 0.));
  vec4 r = texture(uState, p + vec2(uTexel.x, 0.));
  vec4 d = texture(uState, p + vec2(0., -uTexel.y));
  vec4 t = texture(uState, p + vec2(0., uTexel.y));
  float lap = (l.r + r.r + d.r + t.r) * 0.25 - u;
  float un = 2.0 * u - up + lap * 1.9;
  un *= 0.9992;

  /* source: soft line at x = 0.06 */
  float src = exp(-pow((p.y - 0.5) * 6.0, 2.0)) * exp(-pow((p.x - 0.06) * 40.0, 2.0));
  un += src * 0.22 * sin(uOmega * uT * 60.0);

  if (inBarrier(p)) un = 0.0;
  frag = vec4(un, u, 0.0, 1.0);
}`;

const SHOW = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uState;
uniform float uAspect;
uniform float uHue;
uniform float uGap;
out vec4 frag;

vec3 hsl2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z - 1.0));
}
bool inBarrier(vec2 p, float gap) {
  if (abs(p.x - 0.45) > 0.004) return false;
  float half_gap = gap * 0.5;
  float width = 0.028;
  float d1 = abs(p.y - (0.5 - half_gap));
  float d2 = abs(p.y - (0.5 + half_gap));
  return (d1 > width) && (d2 > width);
}

void main(){
  /* the grid is taller than wide; map square uv into it, letterbox */
  vec2 p = uv;
  p.x = (uv.x - 0.5) / uAspect * (uAspect < 1.0 ? 1.0 : 1.0); // grid uv == canvas uv (same rect)
  float u = texture(uState, p).r;
  float a = abs(u);
  vec3 col = hsl2rgb(vec3(fract(uHue / 360.0), 0.5, 0.42));
  vec3 ink = vec3(0.055, 0.047, 0.038);
  vec3 outc = mix(ink, col, clamp(pow(a, 0.5) * 0.6, 0.0, 1.0));
  outc += vec3(0.9, 0.85, 0.7) * pow(clamp(a, 0.0, 1.0), 5.0) * 0.5;
  if (inBarrier(p, uGap)) outc = mix(vec3(0.30, 0.26, 0.18), outc, 0.15);
  frag = vec4(outc, 1.0);
}`;

const GW = 520, GH = 340;

export default {
  id: 'doubleslit', hall: 'waves', engine: 'webgl',

  params: [
    { key: 'omega', sym: 'ω', label: '频率', min: .05, max: .6, step: .005, value: .26, format: v => v.toFixed(3) },
    { key: 'gap', sym: '⇔', label: '缝距', min: .08, max: .42, step: .005, value: .2, format: v => v.toFixed(2) },
  ],
  buttons: [
    { id: 'calm', label: '止水', fn: c => seedZero(c) },
  ],
  note: '滚轮调频率 · 拖动调缝距。右侧是幕：暗纹即「两种可能的抵消」。',

  async init(ctx) {
    const gl = ctx.gl;
    ctx._s = {
      prog: makeProgram(gl, SIM, 'slit-sim'),
      show: makeProgram(gl, SHOW, 'slit-show'),
      quad: makeQuad(gl),
      pp: new PingPong(gl, GW, GH, { float: true, filter: true }),
      texel: [1 / GW, 1 / GH],
      t: 0,
    };
    seedZero(ctx);
  },


  dispose(ctx) {
    const gl = ctx.gl, s = ctx._s;
    if (!gl || !s) return;
    s.pp.dispose();
    gl.deleteProgram(s.prog);
    gl.deleteProgram(s.show);
    gl.deleteVertexArray(s.quad);
  },
  resize(ctx) {},

  frame(ctx, dt) {
    const s = ctx._s, gl = ctx.gl;
    s.t += dt;

    if (ctx.pointer.wheel) {
      const v = Math.min(.6, Math.max(.05, ctx.params.omega - ctx.pointer.wheel * .01));
      ctx.host.setParam('omega', v);
    }
    if (ctx.pointer.down && ctx.pointer.dy) {
      const v = Math.min(.42, Math.max(.08, ctx.params.gap + ctx.pointer.dy * .001));
      ctx.host.setParam('gap', v);
    }

    /* two sim substeps */
    for (let i = 0; i < 2; i++) {
      gl.useProgram(s.prog);
      s.pp.write.bind();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, s.pp.read.tex);
      setU(gl, s.prog, {
        uState: 0, uTexel: s.texel, uT: s.t + i * .016,
        uOmega: ctx.params.omega, uGap: ctx.params.gap, uAspect: GW / GH,
      });
      drawQuad(gl, s.quad);
      s.pp.swap();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
    gl.useProgram(s.show);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, s.pp.read.tex);
    setU(gl, s.show, { uState: 0, uAspect: GW / GH, uHue: ctx.accentHue, uGap: ctx.params.gap });
    drawQuad(gl, s.quad);
  },
};

function seedZero(ctx) {
  const s = ctx._s; if (!s) return;
  const zero = new Float32Array(GW * GH * 4);
  const put = (t) => {
    ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, t.tex);
    ctx.gl.texImage2D(ctx.gl.TEXTURE_2D, 0, ctx.gl.RGBA16F, GW, GH, 0, ctx.gl.RGBA, ctx.gl.FLOAT, zero);
  };
  put(s.pp.a); put(s.pp.b);
}
