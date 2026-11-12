// Objetos cotidianos vectoriales (~140 px, centrados en 0,0) para las escenas 06, 07, 08 y 11.
import { el, C } from './lib.js';
const S = { 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
export const ICONS = {
  ball(g) { el('circle', { r: 62, fill: 'url(#ballGrad)' }, g); el('path', { d: 'M -62 0 L 62 0 M 0 -62 L 0 62 M -44 -44 Q 0 0 -44 44 M 44 -44 Q 0 0 44 44', stroke: '#8a2f0c', 'stroke-width': 5, fill: 'none' }, g); },
  clock(g) { el('circle', { r: 64, fill: C.white, stroke: C.ink, 'stroke-width': 10 }, g); el('path', { d: 'M 0 0 L 0 -40 M 0 0 L 28 14', stroke: C.ink, 'stroke-width': 9, ...S }, g); el('circle', { r: 7, fill: C.orange }, g); },
  key(g) { el('circle', { cx: -40, cy: 0, r: 30, fill: 'none', stroke: C.yellow, 'stroke-width': 16 }, g); el('path', { d: 'M -10 0 L 66 0 M 44 0 L 44 22 M 60 0 L 60 16', stroke: C.yellow, 'stroke-width': 14, fill: 'none', ...S }, g); },
  phone(g) { el('rect', { x: -40, y: -70, width: 80, height: 140, rx: 14, fill: C.ink }, g); el('rect', { x: -32, y: -58, width: 64, height: 112, rx: 6, fill: '#3a5cb8' }, g); el('rect', { x: -24, y: -44, width: 40, height: 14, rx: 7, fill: C.white }, g); el('rect', { x: -10, y: -20, width: 34, height: 14, rx: 7, fill: C.yellow }, g); },
  mug(g) { el('rect', { x: -44, y: -50, width: 80, height: 96, rx: 12, fill: C.orange }, g); el('path', { d: 'M 36 -30 Q 74 -20 36 18', stroke: C.orange, 'stroke-width': 14, fill: 'none' }, g); el('path', { d: 'M -20 -66 Q -10 -80 -20 -94 M 4 -66 Q 14 -80 4 -94', stroke: C.white, 'stroke-width': 6, fill: 'none', ...S, opacity: 0.7 }, g); },
  book(g) { el('rect', { x: -60, y: -46, width: 120, height: 92, rx: 8, fill: '#3a5cb8' }, g); el('rect', { x: -60, y: -46, width: 18, height: 92, rx: 4, fill: C.ink }, g); el('rect', { x: -26, y: -24, width: 66, height: 12, rx: 6, fill: C.white }, g); },
  umbrella(g) { el('path', { d: 'M -70 0 Q -70 -70 0 -70 Q 70 -70 70 0 Q 52 -14 35 0 Q 18 -14 0 0 Q -18 -14 -35 0 Q -52 -14 -70 0 Z', fill: C.yellow }, g); el('path', { d: 'M 0 0 L 0 56 Q 0 72 -16 66', stroke: C.ink, 'stroke-width': 9, fill: 'none', ...S }, g); },
  headphones(g) { el('path', { d: 'M -54 20 Q -54 -60 0 -60 Q 54 -60 54 20', stroke: C.ink, 'stroke-width': 14, fill: 'none' }, g); el('rect', { x: -70, y: 6, width: 34, height: 54, rx: 14, fill: C.orange }, g); el('rect', { x: 36, y: 6, width: 34, height: 54, rx: 14, fill: C.orange }, g); },
  star(g) { el('path', { d: 'M 0 -66 L 18 -20 L 66 -18 L 28 12 L 42 60 L 0 32 L -42 60 L -28 12 L -66 -18 L -18 -20 Z', fill: C.yellow }, g); },
  plant(g) { el('path', { d: 'M -36 20 L 36 20 L 28 70 L -28 70 Z', fill: C.orange }, g); [[-30, -20], [0, -40], [30, -20]].forEach(([r, y]) => el('path', { d: 'M 0 20 Q 30 -30 0 -70 Q -30 -30 0 20 Z', fill: '#2f8a5f', transform: `rotate(${r})` }, g)); },
  glasses(g) { el('circle', { cx: -36, cy: 0, r: 28, fill: '#9fd3ff', stroke: C.ink, 'stroke-width': 9, 'fill-opacity': 0.5 }, g); el('circle', { cx: 36, cy: 0, r: 28, fill: '#9fd3ff', stroke: C.ink, 'stroke-width': 9, 'fill-opacity': 0.5 }, g); el('path', { d: 'M -8 -4 Q 0 -12 8 -4', stroke: C.ink, 'stroke-width': 8, fill: 'none' }, g); },
  lens(g) { el('line', { x1: 40, y1: 40, x2: 90, y2: 90, stroke: C.orange2, 'stroke-width': 18, ...S }, g); el('circle', { r: 56, fill: 'url(#lensGlass)', stroke: C.white, 'stroke-width': 12 }, g); },
};
export function icon(parent, name, attrs = {}) { const g = el('g', attrs, parent); ICONS[name](g); return g; }
