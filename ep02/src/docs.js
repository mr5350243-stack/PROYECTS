// Documentos de investigación (hojas, fotos ilustradas no gráficas, sello) — componentes del episodio 02.
import { el, set, C } from '/ep01/src/lib.js';
import { RED, PAPER, PAPER2, GREY } from './style.js';
export function makeDoc(parent, { w = 220, h = 290, stamp = false, photo = false, lines = 7, seed = 0 } = {}) {
  const g = el('g', {}, parent);
  el('rect', { x: -w / 2 + 6, y: -h / 2 + 8, width: w, height: h, rx: 6, fill: '#020617', opacity: 0.35 }, g);
  el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 6, fill: PAPER }, g);
  let y = -h / 2 + 34;
  if (photo) {
    el('rect', { x: -w / 2 + 20, y: y - 10, width: w * 0.45, height: w * 0.36, fill: '#c9cfe0' }, g);
    el('path', { d: `M ${-w / 2 + 20} ${y - 10 + w * 0.36} l ${w * 0.14} ${-w * 0.16} l ${w * 0.1} ${w * 0.08} l ${w * 0.08} ${-w * 0.05} l ${w * 0.13} ${w * 0.13} Z`, fill: GREY }, g);
    y += w * 0.42;
  }
  for (let i = 0; i < lines; i++) { const lw = (w - 40) * (0.55 + 0.45 * Math.abs(Math.sin(seed * 3.1 + i * 1.7))); el('rect', { x: -w / 2 + 20, y, width: lw, height: 8, rx: 4, fill: PAPER2 }, g); y += 22; }
  if (stamp) {
    const s = el('g', { transform: `translate(${w / 2 - 60},${h / 2 - 50}) rotate(-12)` }, g);
    el('rect', { x: -50, y: -22, width: 100, height: 44, rx: 6, fill: 'none', stroke: RED, 'stroke-width': 5 }, s);
    el('text', { x: 0, y: 9, 'font-size': 22, 'font-weight': 900, fill: RED, 'text-anchor': 'middle', 'letter-spacing': 2 }, s).textContent = 'CASO';
  }
  return g;
}
// foto instantánea ilustrada (lugares neutros, sin personas ni escenas violentas)
export function makePhoto(parent, kind = 0) {
  const g = el('g', {}, parent);
  el('rect', { x: -86, y: -100, width: 172, height: 200, rx: 4, fill: '#020617', opacity: 0.35, transform: 'translate(5,7)' }, g);
  el('rect', { x: -86, y: -100, width: 172, height: 200, rx: 4, fill: '#f6f3ec' }, g);
  el('rect', { x: -72, y: -86, width: 144, height: 140, fill: ['#3a4f8f', '#5a6a96', '#2a3a6e'][kind % 3] }, g);
  if (kind % 3 === 0) { el('rect', { x: -40, y: -30, width: 80, height: 84, fill: '#c9cfe0' }, g); el('path', { d: 'M -50 -30 L 0 -66 L 50 -30 Z', fill: '#8a93ad' }, g); el('rect', { x: -10, y: 18, width: 20, height: 36, fill: '#3a4f8f' }, g); }
  else if (kind % 3 === 1) { [[-60, 10, 30, 44], [-24, -26, 36, 80], [18, -6, 30, 60], [52, 20, 18, 34]].forEach(([x, y, w, h]) => el('rect', { x, y, width: w, height: h, fill: '#c9cfe0' }, g)); }
  else { el('circle', { cx: 30, cy: -50, r: 16, fill: '#ece6d6' }, g); el('path', { d: 'M -72 54 L -20 0 L 20 30 L 72 -10 L 72 54 Z', fill: '#8a93ad' }, g); }
  return g;
}
