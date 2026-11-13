// Piezas reutilizables del episodio 02: nota editorial, balanza, carpeta, mano, símbolos de las hipótesis y luces.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makeDoc } from './docs.js';
import { RED, PAPER, PAPER2, GREY } from './style.js';

// nota editorial pequeña (aclaraciones de rigor: «metáfora visual», «hipótesis, no causas demostradas»…)
export function makeNote(parent, text, { color = GREY, dot = RED } = {}) {
  const g = el('g', { opacity: 0 }, parent);
  const t = el('text', { x: 14, y: 10, 'font-size': 26, 'font-weight': 800, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 2 }, g); t.textContent = text.toUpperCase();
  const w = t.getComputedTextLength() + 80;
  const bg = el('rect', { x: -w / 2, y: -30, width: w, height: 60, rx: 30, fill: C.ink, opacity: 0.88, stroke: color, 'stroke-width': 2 }, g);
  const d = el('circle', { cx: -w / 2 + 30, cy: 0, r: 9, fill: dot }, g);
  g.insertBefore(bg, t); g.insertBefore(d, t);
  return { g, show(t, a, b, x = 540, y = 1250) { const k = ramp(t, a, a + 0.35, E.back), o = ramp(t, b - 0.25, b); set(g, { opacity: f3(clamp(k * 2) * (1 - o)), transform: tr(x, y + 20 * (1 - k), lerp(0.7, 1, k)) }); } };
}

// balanza (la cruz puede inclinarse: tilt en grados)
export function makeScale(parent, color = C.white) {
  const g = el('g', {}, parent);
  el('rect', { x: -70, y: 210, width: 140, height: 26, rx: 10, fill: color }, g);
  el('rect', { x: -12, y: -160, width: 24, height: 380, rx: 10, fill: color }, g);
  el('circle', { cx: 0, cy: -170, r: 26, fill: C.yellow }, g);
  const beam = el('g', { transform: 'translate(0,-150)' }, g);
  el('rect', { x: -230, y: -10, width: 460, height: 20, rx: 10, fill: color }, beam);
  const pans = [-210, 210].map(x => {
    const p = el('g', {}, beam);
    el('path', { d: `M ${x} 0 L ${x - 70} 150 M ${x} 0 L ${x + 70} 150`, stroke: GREY, 'stroke-width': 4 }, p);
    el('path', { d: `M ${x - 90} 150 Q ${x} 210 ${x + 90} 150 Z`, fill: color }, p);
    return p;
  });
  return { g, beam, pans, tilt(a) { set(beam, { transform: `translate(0,-150) rotate(${f1(a)})` }); pans.forEach((p, i) => { const x = i ? 210 : -210; set(p, { transform: `rotate(${f1(-a)} ${x} 0)` }); }); } };
}

// carpeta del expediente (abre/cierra con k: 0 cerrada … 1 abierta)
export function makeFolder(parent, { w = 440, h = 600 } = {}) {
  const g = el('g', {}, parent);
  el('rect', { x: -w / 2 + 10, y: -h / 2 + 14, width: w, height: h, rx: 12, fill: '#020617', opacity: 0.4 }, g);
  el('path', { d: `M ${-w / 2} ${-h / 2} L ${-w / 2 + 150} ${-h / 2} L ${-w / 2 + 170} ${-h / 2 - 40} L ${-w / 2 + 330} ${-h / 2 - 40} L ${-w / 2 + 350} ${-h / 2} L ${w / 2} ${-h / 2} L ${w / 2} ${h / 2} L ${-w / 2} ${h / 2} Z`, fill: '#b9ad8a' }, g);
  makeDoc(g, { w: w - 40, h: h - 40, lines: 13, photo: true, stamp: true, seed: 7 });
  const cover = el('g', {}, g);
  const front = el('g', {}, cover);
  el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: '#d9cba3' }, front);
  el('rect', { x: -w / 2 + 40, y: -h / 2 + 70, width: 260, height: 70, rx: 8, fill: PAPER }, front);
  el('text', { x: -w / 2 + 60, y: -h / 2 + 117, 'font-size': 32, 'font-weight': 900, fill: C.ink, 'letter-spacing': 3 }, front).textContent = 'EXPEDIENTE';
  for (let i = 0; i < 3; i++) el('rect', { x: -w / 2 + 40, y: -h / 2 + 200 + i * 34, width: 300 - i * 60, height: 12, rx: 6, fill: '#c3b590' }, front);
  const st = el('g', { transform: `translate(40,${h / 2 - 150}) rotate(-10)` }, front);
  el('rect', { x: -150, y: -42, width: 300, height: 84, rx: 8, fill: 'none', stroke: RED, 'stroke-width': 7 }, st);
  el('text', { x: 0, y: 14, 'font-size': 40, 'font-weight': 900, fill: RED, 'text-anchor': 'middle', 'letter-spacing': 3 }, st).textContent = 'CASO DAHMER';
  const back = el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: '#b9ad8a' }, cover);
  return { g, open(k) { const sx = Math.cos(k * Math.PI); set(cover, { transform: `translate(${-w / 2},0) scale(${f3(sx)},1) skewY(${f1(-8 * Math.sin(k * Math.PI))}) translate(${w / 2},0)` }); set(front, { opacity: sx > 0 ? 1 : 0 }); set(back, { opacity: sx > 0 ? 0 : 1 }); } };
}

// mano ilustrada (palma abierta, dedos redondeados)
export function makeHand(parent, skin = '#e8b48c') {
  const g = el('g', {}, parent);
  el('rect', { x: -60, y: 40, width: 120, height: 260, rx: 50, fill: '#3a4f8f' }, g);          // manga
  el('rect', { x: -70, y: 20, width: 140, height: 40, rx: 20, fill: '#2a3a6e' }, g);
  el('path', { d: 'M -70 30 Q -80 -60 -60 -110 L 60 -110 Q 80 -60 70 30 Z', fill: skin }, g);   // palma
  [[-52, -150, 36], [-18, -180, 38], [18, -175, 38], [50, -140, 34]].forEach(([x, y, w]) => el('rect', { x: x - w / 2, y, width: w, height: 120, rx: w / 2, fill: skin }, g));
  el('rect', { x: -120, y: -70, width: 40, height: 110, rx: 20, fill: skin, transform: 'rotate(-35 -100 -20)' }, g); // pulgar
  return g;
}

// símbolos de las hipótesis
export const SYMBOLS = {
  door(g) { el('rect', { x: -70, y: -110, width: 140, height: 220, rx: 8, fill: '#3a4f8f' }, g); el('rect', { x: -56, y: -96, width: 112, height: 206, fill: '#ffe2a0', opacity: 0.85 }, g); const d = el('path', { d: 'M -56 -96 L 20 -80 L 20 126 L -56 110 Z', fill: '#2a3a6e' }, g); el('circle', { cx: 6, cy: 20, r: 6, fill: C.yellow }, g); return d; },
  ring(g) { el('circle', { r: 92, fill: 'none', stroke: RED, 'stroke-width': 26 }, g); el('circle', { r: 92, fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.4, 'stroke-dasharray': '10 16' }, g); el('circle', { r: 14, fill: C.white }, g); },
  cloud(g) { [[-50, 10, 52], [0, -20, 64], [52, 8, 50], [10, 34, 48]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#c9cfe0' }, g)); el('circle', { cx: -70, cy: 90, r: 16, fill: '#c9cfe0' }, g); el('circle', { cx: -96, cy: 120, r: 9, fill: '#c9cfe0' }, g); },
};
export function makeSymbol(parent, kind, label) {
  const g = el('g', {}, parent);
  el('ellipse', { cx: 0, cy: 170, rx: 90, ry: 18, fill: '#020617', opacity: 0.35 }, g);
  const inner = el('g', {}, g); SYMBOLS[kind](inner);
  const lt = el('text', { x: 0, y: 200, 'font-size': 30, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 3 }, g); lt.textContent = label;
  return { g, inner, lt };
}

// las 17 luces (misma imagen que la escena 01)
export function makeLights(parent, pts) {
  return pts.map(([x, y]) => { const g = el('g', { opacity: 0, transform: `translate(${f1(x)},${f1(y)})` }, parent); el('circle', { r: 30, fill: '#ffe9a0', opacity: 0.25, filter: 'url(#soft)' }, g); el('circle', { r: 8, fill: '#fff6d8' }, g); return g; });
}
export const ringPts = (cx, cy, rx, ry, a0 = -200, a1 = 20, n = 17) => Array.from({ length: n }, (_, i) => { const a = (a0 + i * (a1 - a0) / (n - 1)) * Math.PI / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
