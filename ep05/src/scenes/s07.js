// ESCENA 07 — SEÑAL 5: VIVIR CON MIEDO (49.8 – 57.5 s)
// En la cocina. Antes de hablar, ella observa la expresión de él. Varias burbujas de diálogo aparecen y desaparecen
// (se tachan o encogen): cómo modifica sus palabras para evitar una reacción. «MIEDO A SU REACCIÓN» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson, ARMS } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeA, makeB, makeBadge } from '../common.js';
import { CORAL, RED2 } from '../style.js';

export const S07 = { start: 49.8, end: 57.5 };
const A = { x: 330, y: 1250 }, B = { x: 790, y: 1250 }, S = 1.35;

export function create(layer) {
  const cam = el('g', {}, layer);
  // cocina
  el('rect', { x: -800, y: -600, width: 2700, height: 2000, fill: '#22376f' }, cam);
  for (let i = 0; i < 10; i++) for (let j = 0; j < 6; j++) el('rect', { x: 120 + i * 90, y: 620 + j * 60, width: 84, height: 54, fill: '#2a4796', opacity: 0.35 }, cam);
  for (let i = 0; i < 4; i++) el('rect', { x: 120 + i * 220, y: 300, width: 200, height: 260, rx: 10, fill: '#efe3c8' }, cam);
  el('rect', { x: -800, y: 1000, width: 2700, height: 30, fill: C.white }, cam);
  el('rect', { x: -800, y: 1030, width: 2700, height: 300, fill: '#c9cfe0' }, cam);
  el('rect', { x: 900, y: 360, width: 230, height: 900, rx: 20, fill: '#d9dde8' }, cam);
  icon(cam, 'plant', { transform: 'translate(220,960) scale(0.8)' }); icon(cam, 'mug', { transform: 'translate(560,975) scale(0.4)' });
  el('rect', { x: -800, y: 1250, width: 2700, height: 1000, fill: '#16285e' }, cam);
  const a = makeA(cam), b = makeB(cam);
  const bubbles = [[52.6, 1.0, 340, 'big'], [53.9, 0.75, 300, 'mid'], [55.2, 0.55, 260, 'small']].map(([t0, sc, w, kind], i) => {
    const g = el('g', { opacity: 0 }, layer);
    el('rect', { x: -w / 2, y: -60, width: w, height: 120, rx: 60, fill: C.white }, g);
    el('path', { d: 'M -60 56 L -90 100 L -20 58 Z', fill: C.white }, g);
    for (let k = 0; k < 3 - i; k++) el('rect', { x: -w / 2 + 40, y: -26 + k * 24, width: (w - 80) * (1 - k * 0.2), height: 12, rx: 6, fill: '#c9cfe0' }, g);
    if (i === 2) el('text', { x: 0, y: 14, 'font-size': 56, 'font-weight': 900, fill: '#8a93ad', 'text-anchor': 'middle' }, g).textContent = '…';
    const strike = el('line', { x1: -w / 2 + 30, y1: 0, x2: w / 2 - 30, y2: 0, stroke: RED2, 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0 }, g);
    return { g, strike, t0, sc, i };
  });
  const badge = makeBadge(layer, 4);
  return {
    render(t, ctx) {
      const ent = ramp(t, 49.8, 50.5, E.out5);
      const look = ramp(t, 51.2, 51.8, E.inOut);
      set(cam, { transform: `translate(540,900) scale(${f3(lerp(1.5, 1.38, ent) * lerp(1, 1.08, look))}) translate(${f1(-lerp(560, 470, look))},-960)`, opacity: f3(ent) });
      // ella mira la expresión de él antes de hablar; él, serio, con el teléfono
      drawPerson(a, { x: A.x, y: A.y, s: S, face: 1, phase: 0, stride: 0, handB: { x: 10, y: -170 }, handF: { x: 30, y: -168 }, headR: lerp(6, -6, look) + Math.sin(t * 1.3) * 2, smile: -0.3, lean: lerp(0, -3, look) });
      drawPerson(b, { x: B.x, y: B.y, s: S, face: -1, phase: 0, stride: 0, ...ARMS.chin(), headR: 6, smile: -0.4 });
      // burbujas que empiezan grandes y se van tachando o encogiendo
      bubbles.forEach(B_ => {
        const k = ramp(t, B_.t0, B_.t0 + 0.35, E.back), x = ramp(t, B_.t0 + 0.7, B_.t0 + 0.95), out = ramp(t, B_.t0 + 1.05, B_.t0 + 1.3);
        set(B_.g, { opacity: f3(clamp(k * 2) * (1 - out)), transform: tr(A.x + 240, 540 - B_.i * 30, lerp(0.3, B_.sc, k) * lerp(1, 0.6, out)) });
        set(B_.strike, { opacity: f3(B_.i < 2 ? x : 0) });
      });
      badge.show(t, 50.0, 57.2);
    },
  };
}
