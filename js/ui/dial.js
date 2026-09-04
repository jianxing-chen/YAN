/* 衍 · dial element — mounts a small aeon clock anywhere */

import { drawDial } from '../core/aeon.js';

export function mountDial(canvas, { size = 46, label = false, period = 4000 } = {}) {
  const tick = () => drawDial(canvas, { size, label });
  tick();
  const iv = setInterval(tick, period);
  return () => clearInterval(iv);
}
