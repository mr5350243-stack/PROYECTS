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
