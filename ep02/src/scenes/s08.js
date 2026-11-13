// ESCENA 08 — LOS EXPERTOS DISCREPARON (75.2 – 86.1 s)
// Tres especialistas ilustrados en paneles separados examinan un expediente. Cada panel muestra una interpretación
// distinta con símbolos y diagramas (indicador de capacidad de control: bajo, dudoso, y un tercero «en estudio»).
// «LOS EXPERTOS NO COINCIDIERON» (fx_data). «Algunos consideraban…» resalta los paneles 1 y 2. Los paneles se
// desplazan y dejan paso al escritorio de la escena 09.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makePerson, drawPerson, ARMS } from '/ep01/src/characters.js';
import { makeDoc } from '../docs.js';
import { RED, GREY } from '../style.js';

export const S08 = { start: 75.2, end: 86.1 };
const PW = 316, PH = 820, PY = 330;

function gauge(g) {
  el('path', { d: 'M -90 0 A 90 90 0 0 1 90 0', fill: 'none', stroke: '#2a3a6e', 'stroke-width': 22 }, g);
  el('path', { d: 'M -90 0 A 90 90 0 0 1 -64 -64', fill: 'none', stroke: RED, 'stroke-width': 22 }, g);
  el('path', { d: 'M 64 -64 A 90 90 0 0 1 90 0', fill: 'none', stroke: '#3a8f6a', 'stroke-width': 22 }, g);
  const needle = el('line', { x1: 0, y1: 0, x2: 0, y2: -78, stroke: C.white, 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
  el('circle', { r: 12, fill: C.white }, g);
  return needle;
}

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const panels = [0, 1, 2].map(i => {
    const g = el('g', {}, layer);
    el('rect', { x: 0, y: 0, width: PW, height: PH, rx: 22, fill: '#16285e', stroke: '#2a4796', 'stroke-width': 4 }, g);
    const hl = el('rect', { x: 0, y: 0, width: PW, height: PH, rx: 22, fill: 'none', stroke: C.yellow, 'stroke-width': 8, opacity: 0 }, g);
    el('text', { x: 24, y: 52, 'font-size': 26, 'font-weight': 900, fill: GREY, 'letter-spacing': 3 }, g).textContent = `PERITO ${i + 1}`;
    const sym = el('g', { transform: `translate(${PW / 2},210)` }, g);
    const needle = gauge(sym);
    const cap = el('text', { x: PW / 2, y: 262, 'font-size': 20, 'font-weight': 800, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 1 }, g); cap.textContent = 'CAPACIDAD DE CONTROL';
    const person = makePerson(g, { shirt: ['#3a5cb8', '#5a6a96', '#2a3a6e'][i], pants: '#1d2b5c', skin: ['#f1c7a1', '#a8714b', '#e8b48c'][i], hair: ['#6b3f1f', '#14110f', '#8a8a8a'][i], style: [0, 2, 4][i], coat: '#f6f3ec', glasses: i !== 1, shadow: '#000' });
    const doc = el('g', {}, person.held); makeDoc(el('g', { transform: 'rotate(-12) translate(10,-40)' }, doc), { w: 70, h: 90, lines: 4, seed: i });
    return { g, hl, needle, person, i };
  });
  const flash = el('rect', { width: 1080, height: 1920, fill: C.navy, opacity: 0 }, layer);
  return {
    render(t, ctx) {
      panels.forEach(P => {
        const k = ramp(t, 75.3 + P.i * 0.25, 76.0 + P.i * 0.25, E.backSoft);
        const out = ramp(t, 85.2 + P.i * 0.1, 86.0 + P.i * 0.1, E.inOut);
        const x = 32 + P.i * (PW + 24) + (P.i - 1) * 900 * out;
        set(P.g, { transform: `translate(${f1(x)},${f1(PY + 120 * (1 - k))})`, opacity: f3(clamp(k * 2)) });
        // agujas: cada perito llega a una conclusión diferente (77.6 «conclusiones diferentes»)
        const dec = ramp(t, 77.4 + P.i * 0.3, 78.4 + P.i * 0.3, E.backSoft);
        const target = [-62, -8, 48][P.i] + Math.sin(t * 3 + P.i) * 3;
        set(P.needle, { transform: `rotate(${f1(lerp(Math.sin(t * 2 + P.i) * 40, target, dec))})` });
        // «Algunos consideraban que… afectaban gravemente su capacidad de control» (80.1–85.3): paneles 1 y 2
        set(P.hl, { opacity: f3(P.i < 2 ? ramp(t, 80.1, 80.5) * (1 - ramp(t, 85.2, 85.6)) : 0) });
        const look = Math.sin(t * 1.3 + P.i * 2);
        drawPerson(P.person, { x: PW / 2, y: PH - 50, s: 1.05, face: P.i === 2 ? -1 : 1, phase: 0, stride: 0, ...ARMS.phone(), headR: 14 + look * 3, lean: look, smile: 0.35 });
      });
    },
  };
}
