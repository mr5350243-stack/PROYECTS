// ESCENA 09 — RECONOCER Y BUSCAR APOYO (67.0 – 77.5 s)
// La protagonista habla con una persona de confianza (sin enfrentar al agresor). Aparecen símbolos de apoyo
// profesional y de seguridad. Una línea separa las conductas de control de las relaciones basadas en respeto.
// «RECONOCER ES IMPORTANTE» (fx_data). Después, en un entorno tranquilo, acompañada por su red de apoyo, surgen
// «RESPETO», «LIBERTAD» y «SEGURIDAD». Nota: si hay peligro, contactar a los servicios de emergencia del país.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makePerson, drawPerson } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeNote } from '/ep02/src/common.js';
import { makeA, makeSignal } from '../common.js';
import { CORAL, RED2 } from '../style.js';

export const S09 = { start: 67.0, end: 77.5 };
const A = { x: 360, y: 1250 }, F = { x: 720, y: 1250 }, S = 1.3;

export function create(layer) {
  const cam = el('g', {}, layer);
  // exterior tranquilo: cielo cálido, árboles, banco
  el('rect', { x: -800, y: -600, width: 2700, height: 2000, fill: '#2a4796' }, cam);
  el('circle', { cx: 820, cy: 360, r: 120, fill: '#ffd98a', opacity: 0.9 }, cam);
  [[120, 980, 1.4], [980, 1000, 1.2], [-40, 1020, 1.0]].forEach(([x, y, s]) => { const g = el('g', { transform: `translate(${x},${y}) scale(${s})` }, cam); el('rect', { x: -14, y: -120, width: 28, height: 140, fill: '#3a2a20' }, g); el('circle', { cx: 0, cy: -190, r: 110, fill: '#2f8a5f' }, g); el('circle', { cx: -60, cy: -140, r: 70, fill: '#3a9a6a' }, g); });
  el('rect', { x: -800, y: 1080, width: 2700, height: 1000, fill: '#3a8f6a' }, cam);
  el('rect', { x: -800, y: 1250, width: 2700, height: 1000, fill: '#2f7a58' }, cam);
  const bench = el('g', { transform: 'translate(540,1250)' }, cam);
  el('rect', { x: -300, y: -90, width: 600, height: 24, rx: 10, fill: '#c98d63' }, bench); el('rect', { x: -300, y: -200, width: 600, height: 22, rx: 10, fill: '#c98d63' }, bench);
  el('rect', { x: -280, y: -66, width: 16, height: 66, fill: '#0b1636' }, bench); el('rect', { x: 264, y: -66, width: 16, height: 66, fill: '#0b1636' }, bench);
  const a = makeA(cam);
  const friend = makePerson(cam, { shirt: C.yellow, pants: '#2a3a6e', skin: '#8a5a3c', hair: '#14110f', style: 1, shadow: '#000' });
  const net = [['#ff7a6b', '#e8b48c', 0], ['#3a5cb8', '#f1c7a1', 2]].map(([shirt, skin, st]) => makePerson(cam, { shirt, pants: '#1d2b5c', skin, hair: '#3b2416', style: st, shadow: '#000' }));
  // símbolos de apoyo y seguridad
  const sym = [['APOYO', 69.3], ['ORIENTACIÓN', 70.9], ['SEGURIDAD', 73.4]].map(([label, t0], i) => {
    const g = el('g', { opacity: 0 }, layer);
    el('circle', { r: 66, fill: C.white }, g);
    if (i === 0) el('path', { d: 'M 0 30 C -60 -6 -44 -56 0 -24 C 44 -56 60 -6 0 30 Z', fill: CORAL }, g);
    else if (i === 1) { el('rect', { x: -14, y: -40, width: 28, height: 80, rx: 6, fill: '#3a5cb8' }, g); el('rect', { x: -40, y: -14, width: 80, height: 28, rx: 6, fill: '#3a5cb8' }, g); }
    else el('path', { d: 'M 0 -46 L 40 -30 Q 40 20 0 46 Q -40 20 -40 -30 Z', fill: '#3a8f6a' }, g);
    el('text', { x: 0, y: 100, 'font-size': 26, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 2 }, g).textContent = label;
    return { g, t0, i };
  });
  // línea que separa control (izquierda) y respeto (derecha)
  const split = el('g', { opacity: 0 }, layer);
  el('rect', { x: 534, y: 0, width: 12, height: 0, rx: 6, fill: C.white }, split);
  const words = [['RESPETO', C.white, 74.0], ['LIBERTAD', C.yellow, 74.8], ['SEGURIDAD', CORAL, 73.42]].map(([s, col, t0], i) => { const t = el('text', { 'font-size': 64, 'font-weight': 900, fill: col, 'text-anchor': 'middle', stroke: C.ink, 'stroke-width': 8, 'paint-order': 'stroke', opacity: 0 }, layer); t.textContent = s; return { t, t0, i }; });
  const note = makeNote(layer, 'Si estás en peligro, llama a emergencias de tu país', { dot: C.yellow });
  return {
    render(t, ctx) {
      const ent = ramp(t, 67.0, 67.7, E.out5);
      const wide = ramp(t, 72.4, 73.4, E.inOut);   // plano más abierto: la red de apoyo
      set(cam, { transform: `translate(540,900) scale(${f3(lerp(1.4, 1.1, wide) * lerp(1.15, 1, ent))}) translate(-540,-980)`, opacity: f3(ent) });
      const talk = t < 72.4 ? Math.sin(t * 6) * 10 : 0;
      drawPerson(a, { x: A.x, y: A.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 50, y: -160 }, handF: { x: 90 + talk, y: -200 - talk }, headR: Math.sin(t) * 2, smile: lerp(0.1, 0.8, ramp(t, 71.0, 73.0)) });
      drawPerson(friend, { x: F.x, y: F.y, s: S, face: -1, sit: 1, phase: 0, stride: 0, handB: { x: 50, y: -160 }, handF: { x: 70, y: -170 }, headR: 6, smile: 0.7 });
      net.forEach((P, i) => { const k = ramp(t, 72.6 + i * 0.3, 73.2 + i * 0.3, E.out); drawPerson(P, { x: [140, 940][i] + (i ? 80 : -80) * (1 - k), y: 1290, s: 1.15, face: i ? -1 : 1, phase: t * 8, stride: k < 1 ? 1 : 0, handB: { x: -36, y: -150 }, handF: { x: 40, y: -150 }, headR: 0, smile: 0.9, opacity: k }); });
      sym.forEach(s => { const k = ramp(t, s.t0, s.t0 + 0.35, E.back); set(s.g, { opacity: f3(clamp(k * 2) * (1 - ramp(t, 72.4, 72.8))), transform: tr(220 + s.i * 320, 520, lerp(0.4, 1, k)) }); });
      set(split, { opacity: f3(ramp(t, 71.6, 71.9) * (1 - ramp(t, 72.4, 72.7))) });
      words.forEach(w => { const k = ramp(t, w.t0, w.t0 + 0.4, E.back); set(w.t, { x: 540, y: 300 + w.i * 90, opacity: f3(clamp(k * 2) * (1 - ramp(t, 77.0, 77.4))), transform: `translate(540,${300 + w.i * 90}) scale(${f3(lerp(0.5, 1, k))}) translate(-540,${-(300 + w.i * 90)})` }); });
      note.show(t, 73.6, 77.4, 540, 1290);
    },
  };
}
