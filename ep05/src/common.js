// Piezas del episodio 05: la pareja con identidad fija (A: ropa crema y cabello oscuro · B: camisa azul grisácea),
// reutiliza el salón, sillas, mesa, burbujas y posturas del episodio 04.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makePerson } from '/ep01/src/characters.js';
export { makeLiving, makeChair, makeTable, makeSpeech, CROSS, OPEN_PALM } from '/ep04/src/common.js';
import { CREAM, RED, RED2 } from './style.js';

export const makeA = (p) => makePerson(p, { shirt: CREAM, pants: '#3a4f8f', skin: '#c98d63', hair: '#1a120c', style: 3, shadow: '#000' });
export const makeB = (p) => makePerson(p, { shirt: '#5d6f8f', pants: '#1d2b5c', skin: '#e8b48c', hair: '#14110f', style: 0, shadow: '#000' });
// símbolo de alerta (triángulo con «!»)
export function makeAlert(parent) {
  const g = el('g', {}, parent);
  el('circle', { r: 260, fill: 'url(#alertGlow)' }, g);
  el('path', { d: 'M 0 -130 L 130 100 L -130 100 Z', fill: RED2, stroke: '#f6f3ec', 'stroke-width': 10, 'stroke-linejoin': 'round' }, g);
  el('rect', { x: -12, y: -60, width: 24, height: 100, rx: 10, fill: '#f6f3ec' }, g); el('circle', { cx: 0, cy: 70, r: 14, fill: '#f6f3ec' }, g);
  return g;
}

// insignias de las cinco señales (icono circular) — mismas en la introducción, en las escenas y en el patrón
export const SIGNALS = ['CONTROLA TU VIDA', 'CELOS Y CONTROL', 'INTIMIDACIÓN', 'AISLAMIENTO', 'VIVIR CON MIEDO'];
export function signalIcon(g, i) {
  const W = '#f6f3ec';
  if (i === 0) { el('path', { d: 'M -40 -10 L 40 -10 M -40 20 L 40 20 M -20 -40 L -20 50 M 20 -40 L 20 50', stroke: W, 'stroke-width': 9, 'stroke-linecap': 'round' }, g); }            // rejilla (control)
  else if (i === 1) { el('rect', { x: -26, y: -46, width: 52, height: 92, rx: 10, fill: W }, g); el('circle', { cx: 0, cy: 0, r: 30, fill: 'none', stroke: '#b3273a', 'stroke-width': 8 }, g); el('line', { x1: 20, y1: 20, x2: 44, y2: 44, stroke: '#b3273a', 'stroke-width': 9, 'stroke-linecap': 'round' }, g); } // teléfono vigilado
  else if (i === 2) { el('path', { d: 'M -50 -30 L -20 -10 L -44 14 L -10 18 L -24 50 M 10 -40 L 20 -6 M 30 -30 L 46 0 M 36 20 L 56 30', stroke: W, 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); }  // grito
  else if (i === 3) { el('circle', { cx: 0, cy: 0, r: 14, fill: W }, g); [0, 1, 2, 3, 4].forEach(k => { const a = k * 1.256; el('circle', { cx: Math.cos(a) * 46, cy: Math.sin(a) * 46, r: 9, fill: W, opacity: 0.4 }, g); }); }   // aislamiento
  else { el('rect', { x: -48, y: -34, width: 96, height: 60, rx: 26, fill: W }, g); el('path', { d: 'M -16 26 L -30 48 L 0 26 Z', fill: W }, g); el('text', { x: 0, y: 8, 'font-size': 40, 'font-weight': 900, fill: '#0b1636', 'text-anchor': 'middle' }, g).textContent = '…'; }  // palabras medidas
}
export function makeSignal(parent, i, r = 70) {
  const g = el('g', {}, parent);
  el('circle', { r, fill: '#16285e', stroke: i === 2 ? '#b3273a' : '#ffc93c', 'stroke-width': 6 }, g);
  signalIcon(el('g', { transform: `scale(${(r / 70).toFixed(3)})` }, g), i);
  return g;
}
export function makeBadge(parent, i) {
  const g = el('g', { opacity: 0 }, parent);
  el('circle', { r: 44, fill: C.yellow }, g);
  el('text', { x: 0, y: 17, 'font-size': 50, 'font-weight': 900, fill: C.navy, 'text-anchor': 'middle' }, g).textContent = String(i + 1);
  el('text', { x: 66, y: 12, 'font-size': 34, 'font-weight': 900, fill: C.white, 'letter-spacing': 2 }, g).textContent = `SEÑAL ${i + 1} · ${SIGNALS[i]}`;
  return { g, show(t, a, b) { const k = ramp(t, a, a + 0.4, E.back), o = ramp(t, b - 0.3, b); set(g, { opacity: f3(clamp(k * 2) * (1 - o)), transform: tr(90 - 40 * (1 - k), 150, lerp(0.6, 0.8, k)) }); } };
}
// sofá (como en el episodio 04)
export function makeSofa(parent) {
  const s = el('g', {}, parent);
  el('rect', { x: 150, y: 920, width: 780, height: 200, rx: 50, fill: '#3a4f8f' }, s);
  el('rect', { x: 120, y: 1040, width: 840, height: 120, rx: 40, fill: '#4a5f9f' }, s);
  el('rect', { x: 100, y: 980, width: 90, height: 200, rx: 40, fill: '#3a4f8f' }, s); el('rect', { x: 890, y: 980, width: 90, height: 200, rx: 40, fill: '#3a4f8f' }, s);
  return s;
}
// la mano sujeta un teléfono
export function givePhone(P) { const ph = el('g', { transform: 'rotate(-70) scale(0.36)' }, P.held); el('rect', { x: -40, y: -70, width: 80, height: 140, rx: 14, fill: '#081128' }, ph); el('rect', { x: -32, y: -58, width: 64, height: 112, rx: 6, fill: '#3a5cb8' }, ph); const glow = el('circle', { r: 80, fill: 'url(#phoneGlow)' }, P.held); return glow; }
