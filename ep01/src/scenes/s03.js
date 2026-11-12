// ESCENA 03 — CUENTA LOS PASES (23.2 – 33.75 s)
// Tras atravesar la pantalla aparece la cancha: dos equipos de tres se pasan la pelota. Cámara estable.
// Contador lateral de pases (equipo blanco) desde «Su misión…». Texto «CUENTA LOS PASES» (fx_data). Sin gorila.
import { el, set, clamp, lerp, ramp, E, C, f1, f3 } from '../lib.js';
import { makeGame } from '../court.js';
import { GAME } from './game_opts.js';

export const S03 = { start: 23.2, end: 33.75 };

// contador lateral reutilizable (también en la escena 04)
export function makeCounter(parent) {
  const g = el('g', { opacity: 0 }, parent);
  el('rect', { x: -96, y: -150, width: 192, height: 300, rx: 34, fill: C.ink, opacity: 0.88 }, g);
  el('rect', { x: -96, y: -150, width: 192, height: 300, rx: 34, fill: 'none', stroke: C.yellow, 'stroke-width': 5 }, g);
  const lab = el('text', { x: 0, y: -98, 'font-size': 28, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 4 }, g); lab.textContent = 'PASES';
  // camiseta blanca
  el('path', { d: 'M -26 -78 L -10 -84 Q 0 -76 10 -84 L 26 -78 L 36 -60 L 24 -54 L 22 -22 L -22 -22 L -24 -54 L -36 -60 Z', fill: C.white }, g);
  const num = el('text', { x: 0, y: 92, 'font-size': 120, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle' }, g);
  return {
    render(t, count, a, x = 975, y = 760) {
      const k = clamp(a);
      set(g, { opacity: f3(k), transform: `translate(${f1(x + 160 * (1 - E.out(k)))},${y})` });
      num.textContent = String(count);
    },
  };
}

export function create(layer) {
  const cam = el('g', {}, layer);
  const game = makeGame(cam, GAME);
  const counter = makeCounter(layer);
  const base = game.render(27.3).whiteCount;   // la cuenta empieza con «Su misión…»
  return {
    render(t, ctx) {
      // llegada desde la pantalla del laboratorio: el plano se asienta
      const s = lerp(1.55, 1, ramp(t, 23.2, 24.2, E.out5));
      set(cam, { transform: `translate(540,1000) scale(${f3(s)}) translate(-540,-1000)` });
      const r = game.render(t);
      counter.render(t, Math.max(0, r.whiteCount - base), ramp(t, 27.3, 27.8, E.out));
    },
  };
}
