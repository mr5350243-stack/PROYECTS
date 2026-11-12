// Cerebro editorial (mismo diseño que la prueba aprobada) + contorno muestreable para partículas.
import { el, set, C } from './lib.js';
export const BRAIN_OUTLINE = 'M -190 30 Q -215 -80 -130 -140 Q -60 -200 30 -180 Q 140 -190 190 -100 Q 230 -20 190 60 Q 160 130 70 130 Q 0 150 -60 120 Q -170 110 -190 30 Z';
export function makeBrain(parent) {
  const g = el('g', {}, parent);
  el('ellipse', { cx: 0, cy: 190, rx: 170, ry: 26, fill: '#020617', opacity: 0.35 }, g);
  el('path', { d: 'M 40 120 Q 60 170 30 200 L 70 200 Q 96 170 92 118 Z', fill: C.orange2 }, g);
  const body = el('path', { d: BRAIN_OUTLINE, fill: '#ffb36a' }, g);
  el('path', { d: 'M 90 70 Q 160 60 190 60 Q 160 130 70 130 Q 60 100 90 70 Z', fill: '#ff8f4a' }, g);
  ['M -150 -40 Q -110 -90 -60 -60 Q -20 -40 -50 0', 'M -120 60 Q -80 20 -30 40 Q 20 60 50 20', 'M -40 -150 Q -10 -100 40 -120 Q 90 -140 110 -90', 'M 30 -60 Q 80 -40 70 10 Q 60 50 120 40',
    'M -180 10 Q -150 0 -140 30', 'M 130 -130 Q 150 -80 190 -70', 'M -90 -130 Q -100 -100 -80 -90']
    .forEach(d => el('path', { d, fill: 'none', stroke: C.orange2, 'stroke-width': 11, 'stroke-linecap': 'round' }, g));
  el('path', { d: 'M -10 -178 Q -30 -60 10 30 Q 30 90 -20 128', fill: 'none', stroke: '#c94a14', 'stroke-width': 7, opacity: 0.7, 'stroke-linecap': 'round' }, g);
  const spot = el('circle', { cx: -70, cy: -30, r: 36, fill: C.yellow, opacity: 0 }, g);
  return { g, body, spot };
}
// puntos repartidos sobre el contorno (coordenadas locales)
export function brainPoints(n) {
  const p = el('path', { d: BRAIN_OUTLINE }, document.querySelector('defs'));
  const L = p.getTotalLength(), pts = [];
  for (let i = 0; i < n; i++) { const q = p.getPointAtLength(L * i / n); pts.push({ x: q.x, y: q.y }); }
  p.remove(); return pts;
}
