/* 衍 · core math — the small laws everything else is derived from */

export const TAU = Math.PI * 2;

export const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const invLerp = (a, b, x) => clamp((x - a) / (b - a), 0, 1);

export const easeInOut = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
export const easeOut = t => 1 - Math.pow(1 - t, 3);

/* deterministic RNG — mulberry32 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function rngFor(key, salt = 0) {
  return mulberry32(hashStr(String(key)) ^ (salt * 2654435761));
}

/* hsl → rgb. h in degrees; s, l accept 0..1 or 0..100 (normalized) */
export function hsl(h, s, l) {
  if (s > 1) s /= 100;
  if (l > 1) l /= 100;
  h = ((h % 360) + 360) % 360 / 360;
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

export function hslCss(h, s, l, a = 1) {
  const [r, g, b] = hsl(h, s, l);
  return `rgba(${(r*255)|0},${(g*255)|0},${(b*255)|0},${a})`;
}

export function rgbCss([r, g, b], a = 1) {
  return `rgba(${(r*255)|0},${(g*255)|0},${(b*255)|0},${a})`;
}

/* gaussian via Box–Muller */
export function gaussian(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

/* value noise, 1d — smooth wandering scalar */
export function wobble(seed, t, speed = 1) {
  const x = t * speed;
  const i = Math.floor(x), f = x - i;
  const r = mulberry32(seed ^ (i * 73856093));
  const a = r() * TAU;
  const r2 = mulberry32(seed ^ ((i + 1) * 73856093));
  const b = r2() * TAU;
  const s = f * f * (3 - 2 * f);
  return lerp(a, b, s);
}

export const fmt = (v, d = 2) => Number(v).toFixed(d);
