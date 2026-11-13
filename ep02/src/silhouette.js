// Silueta editorial (busto) sin rasgos faciales: solo contorno, peinado con raya y montura de gafas. Luz de recorte lateral.
import { el, set, C } from '/ep01/src/lib.js';
const BUST = 'M -340 330 C -330 120 -200 60 -95 40 L -80 -40 C -150 -90 -165 -200 -150 -280 C -140 -400 -60 -440 10 -438 C 100 -436 160 -380 160 -270 C 162 -190 140 -100 85 -45 L 100 40 C 210 60 330 120 340 330 Z';
export function makeSilhouette(parent) {
  const g = el('g', {}, parent);
  const rim = el('path', { d: BUST, fill: '#8fa3d8', opacity: 0.55, transform: 'translate(7,-3)' }, g);
  el('path', { d: BUST, fill: '#050b1f' }, g);
  el('path', { d: 'M -150 -280 C -150 -400 -60 -445 10 -442 C 110 -440 168 -380 162 -280 C 120 -340 30 -362 -60 -322 C -100 -306 -132 -296 -150 -280 Z', fill: '#111a38' }, g);
  const glasses = el('g', { opacity: 0.85 }, g);
  el('rect', { x: -112, y: -276, width: 92, height: 62, rx: 18, fill: 'none', stroke: '#3a4a78', 'stroke-width': 7 }, glasses);
  el('rect', { x: 26, y: -276, width: 92, height: 62, rx: 18, fill: 'none', stroke: '#3a4a78', 'stroke-width': 7 }, glasses);
  el('path', { d: 'M -20 -250 Q 3 -262 26 -250', stroke: '#3a4a78', 'stroke-width': 7, fill: 'none' }, glasses);
  const glint = el('path', { d: 'M 40 -266 L 62 -266', stroke: '#c9d4f2', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.8 }, glasses);
  return { g, rim, glasses, glint };
}
