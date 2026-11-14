// ESCENA 10 — CONCLUSIÓN (77.4 – 82.0 s): «CONTROLAR NO ES AMAR» (fx_data) e identidad DETRÁS DEL PORQUÉ.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';

export const S10 = { start: 77.4, end: 82.0 };
export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  el('ellipse', { cx: 540, cy: 860, rx: 600, ry: 640, fill: 'url(#spot2)' }, layer);
  const brand = el('g', { opacity: 0 }, layer);
  el('rect', { x: -80, y: -80, width: 160, height: 160, rx: 40, fill: C.orange }, brand);
  el('text', { x: 0, y: 46, 'font-size': 128, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, brand).textContent = '?';
  el('circle', { cx: 62, cy: -62, r: 22, fill: C.yellow, stroke: C.navy, 'stroke-width': 6 }, brand);
  el('text', { x: 0, y: 160, 'font-size': 44, 'font-weight': 800, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 10 }, brand).textContent = 'DETRÁS DEL';
  el('text', { x: 0, y: 250, 'font-size': 104, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle' }, brand).textContent = 'PORQUÉ';
  const black = el('rect', { width: 1080, height: 1920, fill: '#000', opacity: 0 }, layer);
  return {
    render(t, ctx) {
      const bk = ramp(t, 80.3, 80.8, E.back);
      set(brand, { opacity: f3(clamp(bk * 2) * (1 - ramp(t, 81.4, 81.8))), transform: tr(540, 820, lerp(0.5, 1.1, bk), lerp(-8, 0, bk)) });
      set(black, { opacity: f3(ramp(t, 81.6, 82.0)) });
      ctx.capHide = ramp(t, 80.2, 80.4);
    },
  };
}
