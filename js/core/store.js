/* 衍 · persistence — the palace remembers */

const NS = 'yan.';

export function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(NS + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
}

export function set(key, value) {
  try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch {}
}

export function del(key) {
  try { localStorage.removeItem(NS + key); } catch {}
}
