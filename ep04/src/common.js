// Piezas del episodio 04: la pareja (identidad fija en todo el vídeo), salón en capas, los cinco símbolos y tarjetas.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makePerson } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeScale } from '/ep02/src/common.js';
import { CORAL, GREY } from './style.js';

export const makeWoman = (p) => makePerson(p, { shirt: CORAL, pants: '#2a3a6e', skin: '#d9a37c', hair: '#3b2416', style: 3, shadow: '#000' });
export const makeMan = (p) => makePerson(p, { shirt: '#3a5cb8', pants: '#1d2b5c', skin: '#e8b48c', hair: '#14110f', style: 0, shadow: '#000' });

// salón: pared, ventana, planta, lámpara, suelo (capa de fondo) — mismas piezas en todas las escenas
export function makeLiving(parent) {
  const g = el('g', {}, parent);
  el('rect', { x: -900, y: -600, width: 2900, height: 2000, fill: '#1a2b62' }, g);
  for (let i = 0; i < 24; i++) el('rect', { x: -900 + i * 120, y: -600, width: 60, height: 2000, fill: '#1e3170', opacity: 0.6 }, g);
  const win = el('g', { transform: 'translate(380,300)' }, g);
  el('rect', { x: 0, y: 0, width: 320, height: 380, rx: 10, fill: '#3a4f8f' }, win);
  el('circle', { cx: 230, cy: 90, r: 30, fill: '#f6f3ec', opacity: 0.9 }, win);
  el('rect', { x: -10, y: -10, width: 340, height: 400, rx: 14, fill: 'none', stroke: C.white, 'stroke-width': 16 }, win);
  el('rect', { x: 155, y: -10, width: 10, height: 400, fill: C.white }, win);
  icon(g, 'plant', { transform: 'translate(90,1050) scale(1.6)' });
  const lamp = el('g', { transform: 'translate(980,1180)' }, g);
  el('circle', { cx: 0, cy: -420, r: 280, fill: 'url(#lampWarm)' }, lamp);
  el('rect', { x: -8, y: -400, width: 16, height: 400, fill: '#0b1636' }, lamp); el('path', { d: 'M -70 -470 L 70 -470 L 50 -390 L -50 -390 Z', fill: C.yellow }, lamp);
  el('rect', { x: -900, y: 1180, width: 2900, height: 1000, fill: '#101d48' }, g);
  return g;
}
export function makeChair(parent, flip = 1) {
  const g = el('g', {}, parent);
  el('rect', { x: -60, y: -86, width: 130, height: 22, rx: 8, fill: GREY }, g);
  el('rect', { x: flip > 0 ? -60 : 48, y: -270, width: 22, height: 206, rx: 8, fill: GREY }, g);
  el('rect', { x: -54, y: -64, width: 12, height: 64, fill: GREY }, g); el('rect', { x: 52, y: -64, width: 12, height: 64, fill: GREY }, g);
  return g;
}
export function makeTable(parent) {
  const g = el('g', {}, parent);
  el('ellipse', { cx: 0, cy: -150, rx: 170, ry: 30, fill: C.white }, g);
  el('rect', { x: -14, y: -150, width: 28, height: 150, fill: '#0b1636' }, g);
  el('ellipse', { cx: 0, cy: 0, rx: 70, ry: 12, fill: '#0b1636' }, g);
  icon(g, 'mug', { transform: 'translate(-60,-182) scale(0.38)' }); icon(g, 'mug', { transform: 'translate(70,-182) scale(0.38) scale(-1,1)' });
  return g;
}
// los cinco símbolos (uno por señal)
export const SYMBOLS = [
  (g) => { el('path', { d: 'M -20 -70 L 20 -70 L 70 60 L -70 60 Z', fill: '#fff2c4', opacity: 0.85 }, g); el('path', { d: 'M 0 -10 L 10 14 L 36 16 L 16 32 L 22 58 L 0 44 L -22 58 L -16 32 L -36 16 L -10 14 Z', fill: C.yellow, transform: 'translate(0,-6)' }, g); },        // foco: centro de atención
  (g) => { el('path', { d: 'M 0 -70 L 60 -46 Q 60 30 0 70 Q -60 30 -60 -46 Z', fill: GREY }, g); el('path', { d: 'M -26 -10 L 26 20 M 26 -10 L -26 20', stroke: C.white, 'stroke-width': 12, 'stroke-linecap': 'round' }, g); },  // escudo: no acepta críticas
  (g) => { el('path', { d: 'M 0 50 C -80 0 -60 -70 0 -30 C 60 -70 80 0 0 50 Z', fill: CORAL, opacity: 0.55 }, g); },                                                                            // corazón apagado
  (g) => { const s = makeScale(el('g', { transform: 'scale(0.28) translate(0,60)' }, g)); s.tilt(14); },                                                                                         // balanza inclinada
  (g) => { el('circle', { r: 62, fill: '#3a2a4a', stroke: CORAL, 'stroke-width': 6 }, g); el('text', { x: 0, y: 10, 'font-size': 28, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, g).textContent = 'CULPA'; },       // culpa
];
export const CARD_TITLES = ['CENTRO DE ATENCIÓN', 'NO ACEPTA CRÍTICAS', 'POCA CONSIDERACIÓN', 'TRATO ESPECIAL', 'CULPABILIZACIÓN'];
export function makeCard(parent, i) {
  const g = el('g', {}, parent);
  const body = el('g', {}, g);
  el('rect', { x: -110, y: -160, width: 220, height: 320, rx: 24, fill: '#020617', opacity: 0.35, transform: 'translate(8,10)' }, body);
  el('rect', { x: -110, y: -160, width: 220, height: 320, rx: 24, fill: '#f6f3ec' }, body);
  el('circle', { cx: -66, cy: -116, r: 30, fill: C.navy }, body);
  el('text', { x: -66, y: -104, 'font-size': 34, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle' }, body).textContent = String(i + 1);
  const t = CARD_TITLES[i].split(' '), mid = Math.ceil(t.length / 2);
  [t.slice(0, mid).join(' '), t.slice(mid).join(' ')].forEach((ln, k) => el('text', { x: 0, y: 92 + k * 32, 'font-size': 24, 'font-weight': 900, fill: C.navy, 'text-anchor': 'middle' }, body).textContent = ln);
  const sym = el('g', { transform: 'translate(0,-14) scale(0.8)' }, body);
  el('circle', { r: 76, fill: C.navy }, sym);
  SYMBOLS[i](el('g', {}, sym));
  return { g, body };
}
// burbuja de diálogo (con iconos en lugar de texto)
export function makeSpeech(parent, { w = 260, h = 140, fill = C.white, tail = 1 } = {}) {
  const g = el('g', { opacity: 0 }, parent);
  el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill }, g);
  el('path', { d: `M ${tail * 30} ${h / 2 - 6} L ${tail * 70} ${h / 2 + 40} L ${tail * 80} ${h / 2 - 10} Z`, fill }, g);
  const inner = el('g', {}, g);
  return { g, inner };
}
