/* 衍 · 图灵斑图 — Gray–Scott on the GPU, nine curated pelts */

import { makeProgram, makeQuad, drawQuad, setU, PingPong, seedTarget } from '../../core/gl.js';

const SIM = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uF, uK, uDt;
out vec4 frag;
void main(){
  vec2 c = uv;
  vec2 s = texture(uState, c).rg;
  vec2 l = texture(uState, c - vec2(uTexel.x, 0.)).rg;
  vec2 r = texture(uState, c + vec2(uTexel.x, 0.)).rg;
  vec2 d = texture(uState, c - vec2(0., uTexel.y)).rg;
  vec2 t = texture(uState, c + vec2(0., uTexel.y)).rg;
  vec2 lap = (l + r + d + t) - 4.0 * s;
  float u = s.x, v = s.y;
  float uvv = u * v * v;
  float du = 0.2097 * lap.x - uvv + uF * (1.0 - u);
  float dv = 0.1050 * lap.y + uvv - (uF + uK) * v;
  frag = vec4(clamp(u + du * uDt, 0.0, 1.0), clamp(v + dv * uDt, 0.0, 1.0), 0.0, 1.0);
}`;

const SHOW = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uState;
uniform float uHue;
out vec4 frag;
vec3 hsl2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z - 1.0));
}
void main(){
  float v = texture(uState, uv).g;
  float u = texture(uState, uv).r;
  vec3 ink = vec3(0.055, 0.047, 0.038);
  vec3 col = hsl2rgb(vec3(fract(uHue / 360.0 + 0.05 * (1.0 - v)), 0.52, 0.16 + 0.5 * v));
  col += vec3(0.85, 0.8, 0.65) * pow(v, 5.0) * 0.3;
  frag = vec4(mix(ink, col, smoothstep(0.02, 0.5, v) + v * 0.7), 1.0);
}`;

/* nine curated pelts: [F, K, name] */
const PELTS = [
  [.037, .060, '珊瑚 coral'],
  [.034, .0618, '有丝分裂 mitosis'],
  [.029, .057, '迷宫 labyrinth'],
  [.026, .051, '脉纹 fingerprint'],
  [.014, .039, '自复制 self-replica'],
  [.030, .062, '泡 bubble'],
  [.025, .060, '苔 soliton'],
  [.019, .055, '兽皮 pelt'],
  [.046, .063, '涌流 flow'],
];

const STAMP = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D uState;
uniform vec2 uPos;
uniform float uRadius;
out vec4 frag;
void main(){
  vec2 s = texture(uState, uv).rg;
  float d = distance(uv, uPos);
  float disc = 1.0 - smoothstep(uRadius * .7, uRadius, d);
  frag = vec4(mix(s, vec2(.5, .25), disc), 0.0, 1.0);
}`;

export default {
  id: 'turing', hall: 'growth', engine: 'webgl',

  params: [
    { key: 'f', sym: 'F', label: '补给率 F', min: .005, max: .08, step: .0005, value: .034, format: v => v.toFixed(4) },
    { key: 'k', sym: 'K', label: '移除率 K', min: .03, max: .07, step: .0002, value: .0618, format: v => v.toFixed(4) },
    { key: 'dt', sym: '⌘', label: '步幅', min: .2, max: 1.2, step: .05, value: 1 },
  ],
  buttons: PELTS.map(([F, K, name], i) => ({
    id: 'pelt' + i,
    label: `${i + 1} · ${name}`,
    fn: c => {
      c.host.setParam('f', F);
      c.host.setParam('k', K);
      seed(c);
    },
  })),
  note: '点击注入颜料 · 斑纹会愈合、竞争、遗忘你的痕迹。',

  async init(ctx) {
    const gl = ctx.gl;
    const N = ctx.quality < 1 ? 300 : 400;
    ctx._s = {
      N,
      prog: makeProgram(gl, SIM, 'gs-sim'),
      show: makeProgram(gl, SHOW, 'gs-show'),
      stamp: makeProgram(gl, STAMP, 'gs-stamp'),
      quad: makeQuad(gl),
      pp: new PingPong(gl, N, N, { float: true, filter: false }),
    };
    seed(ctx);
    /* warm start: the pelt is already grown when the door opens */
    for (let i = 0; i < 600; i++) simStep(ctx);
  },

  resize(ctx) {},

  frame(ctx) {
    const s = ctx._s, gl = ctx.gl;

    if (ctx.pointer.click || (ctx.pointer.down && ctx.frame % 4 === 0)) {
      const p = ctx.pointer.click || ctx.pointer;
      /* the display stretches the square grid across the canvas — uv IS canvas uv */
      inject(ctx, p.x / ctx.w, 1 - p.y / ctx.h);
      ctx.pointer.click = null;
    }

    simStep(ctx);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
    gl.useProgram(s.show);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, s.pp.read.tex);
    setU(gl, s.show, { uState: 0, uHue: ctx.accentHue });
    drawQuad(gl, s.quad);
  },
};

function simStep(ctx) {
  const s = ctx._s, gl = ctx.gl;
  gl.useProgram(s.prog);
  s.pp.write.bind();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, s.pp.read.tex);
  setU(gl, s.prog, {
    uState: 0, uTexel: [1 / s.N, 1 / s.N],
    uF: ctx.params.f, uK: ctx.params.k, uDt: ctx.params.dt,
  });
  drawQuad(gl, s.quad);
  s.pp.swap();
}

function inject(ctx, u, v) {
  const s = ctx._s, gl = ctx.gl;
  gl.useProgram(s.stamp);
  s.pp.write.bind();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, s.pp.read.tex);
  setU(gl, s.stamp, { uState: 0, uPos: [u, v], uRadius: 6 / s.N });
  drawQuad(gl, s.quad);
  s.pp.swap();
}

function seed(ctx) {
  const s = ctx._s; if (!s) return;
  const N = s.N;
  const data = new Float32Array(N * N * 4);
  for (let i = 0; i < N * N; i++) {
    data[i * 4] = 1;      // u
    data[i * 4 + 1] = 0;  // v
    data[i * 4 + 3] = 1;
  }
  /* seed patches — generous, so the pelt establishes quickly */
  for (let b = 0; b < 26; b++) {
    const cx = N * .15 + ctx.rng() * N * .7, cy = N * .15 + ctx.rng() * N * .7;
    const r = 7;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = (((cx + dx) | 0) + N) % N, y = (((cy + dy) | 0) + N) % N;
      const i = (y * N + x) * 4;
      data[i] = .5; data[i + 1] = .25; data[i + 3] = 1;
    }
  }
  seedTarget(ctx.gl, s.pp.a, data);
  seedTarget(ctx.gl, s.pp.b, new Float32Array(N * N * 4));
}
