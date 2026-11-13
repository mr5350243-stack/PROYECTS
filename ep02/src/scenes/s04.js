// ESCENA 04 — EL MIEDO AL ABANDONO (35.6 – 47.6 s) · metáfora visual, no reconstrucción de un hecho
// Habitación 2.5D. Un personaje permanece sentado; otra figura se aleja por la puerta. Una línea amarilla une a ambos
// y se rompe. La habitación se expande y el personaje queda pequeño en el centro. «MIEDO AL ABANDONO» (fx_data).
// «…no convierte a alguien en asesino»: el título queda tachado con la cita de la narración.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makePerson, drawPerson, ARMS } from '/ep01/src/characters.js';
import { makeNote } from '../common.js';
import { RED, GREY } from '../style.js';

export const S04 = { start: 35.6, end: 47.6 };
const SEAT = { x: 430, y: 1020 }, DOOR = { x: 860, y: 1000 };

export function create(layer) {
  const cam = el('g', {}, layer);
  // habitación: pared, suelo en perspectiva, ventana alta, puerta
  const room = el('g', {}, cam);
  el('rect', { x: -600, y: -600, width: 2300, height: 1600, fill: '#16285e' }, room);
  for (let i = 0; i < 20; i++) el('rect', { x: -600 + i * 120, y: -600, width: 60, height: 1600, fill: '#1a2e68', opacity: 0.7 }, room);
  el('path', { d: 'M -600 1000 L 1700 1000 L 2400 2400 L -1300 2400 Z', fill: '#0e1b44' }, room);
  for (let i = -8; i < 16; i++) el('line', { x1: 540 + i * 110, y1: 1000, x2: 540 + i * 330, y2: 2400, stroke: '#16285e', 'stroke-width': 4 }, room);
  el('rect', { x: 140, y: 380, width: 240, height: 300, rx: 8, fill: '#3a4f8f' }, room);
  el('rect', { x: 156, y: 396, width: 208, height: 268, fill: '#8fa3d8', opacity: 0.35 }, room);
  el('path', { d: 'M 156 664 L 364 664 L 520 1000 L 0 1000 Z', fill: '#8fa3d8', opacity: 0.06 }, room);
  const door = el('g', { transform: `translate(${DOOR.x},${DOOR.y})` }, room);
  el('rect', { x: -95, y: -380, width: 190, height: 380, fill: '#ffe2a0' }, door);
  el('rect', { x: -110, y: -395, width: 220, height: 395, fill: 'none', stroke: '#0b1636', 'stroke-width': 18 }, door);
  const leaf = el('path', { fill: '#2a3a6e' }, door);
  // silla y personajes
  const chair = el('g', { transform: `translate(${SEAT.x},${SEAT.y})` }, cam);
  el('rect', { x: -60, y: -86, width: 130, height: 22, rx: 8, fill: GREY }, chair);
  el('rect', { x: -60, y: -260, width: 22, height: 196, rx: 8, fill: GREY }, chair);
  el('rect', { x: -54, y: -64, width: 12, height: 64, fill: GREY }, chair); el('rect', { x: 52, y: -64, width: 12, height: 64, fill: GREY }, chair);
  const sitter = makePerson(cam, { shirt: '#c9cfe0', pants: '#2a3a6e', skin: '#e8b48c', hair: '#c58b3a', style: 0, shadow: '#000' });
  const leaver = makePerson(el('g', {}, cam), { shirt: '#5a6a96', pants: '#1d2b5c', skin: '#c98d63', hair: '#14110f', style: 2, shadow: '#000' });
  const doorClip = el('rect', { x: -2000, y: -2000, width: 4000, height: 4000 }, el('clipPath', { id: 's04door' }, cam));
  leaver.g.parentNode.setAttribute('clip-path', 'url(#s04door)');
  // línea amarilla que los une (y se rompe)
  const lineA = el('path', { fill: 'none', stroke: C.yellow, 'stroke-width': 7, 'stroke-linecap': 'round' }, cam);
  const lineB = el('path', { fill: 'none', stroke: C.yellow, 'stroke-width': 7, 'stroke-linecap': 'round' }, cam);
  const spark = el('circle', { r: 0, fill: 'none', stroke: C.yellow, 'stroke-width': 5 }, cam);
  const note = makeNote(layer, 'Metáfora visual');
  const strike = el('g', { opacity: 0 }, layer);
  el('rect', { x: -360, y: -8, width: 720, height: 16, rx: 8, fill: RED, transform: 'rotate(-4)' }, strike);
  const quote = el('text', { x: 540, y: 520, 'font-size': 34, 'font-weight': 800, fill: C.white, 'text-anchor': 'middle', opacity: 0 }, layer);
  quote.textContent = '…no convierte a alguien en asesino';
  return {
    render(t, ctx) {
      // cámara: entra por la puerta de la escena 03; después la habitación «se expande» (zoom out) y él queda pequeño
      const ent = ramp(t, 35.6, 36.6, E.out5);
      const exp = ramp(t, 40.9, 44.2, E.inOut);
      const z = lerp(2.2, 1, ent) * lerp(1, 0.52, exp);
      const fx = lerp(DOOR.x, 600, ent), fy = lerp(DOOR.y - 190, 880, ent);
      set(cam, { transform: `translate(540,${f1(lerp(860, 900, exp))}) scale(${f3(z)}) translate(${f1(-lerp(fx, SEAT.x + 60, exp))},${f1(-lerp(fy, 900, exp))})` });
      // personaje sentado (respiración, mirada hacia la puerta; al final cabeza baja)
      const down = ramp(t, 41.0, 42.0, E.inOut);
      drawPerson(sitter, { x: SEAT.x, y: SEAT.y, s: 1, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 60, y: -150 }, handF: { x: 80, y: -146 }, headR: lerp(-6, 16, down) + Math.sin(t * 0.8) * 1.5, smile: lerp(0.4, 0.05, down), lean: lerp(0, 6, down) });
      // la otra figura se aleja hacia la puerta y sale
      const w = ramp(t, 36.4, 39.9, E.inOut);
      const lx = lerp(SEAT.x + 180, DOOR.x + 40, w);
      drawPerson(leaver, { x: lx, y: lerp(1040, 1000, w), s: lerp(1.0, 0.86, w), face: 1, phase: t * 8, stride: w > 0 && w < 1 ? 1 : 0, ...ARMS.rest(), headR: 0, smile: 0.3, opacity: 1 - ramp(t, 39.8, 40.3) });
      set(doorClip, { x: f1(t > 39.4 ? DOOR.x - 95 : -2000), width: f1(t > 39.4 ? 190 : 4000) });
      const close = ramp(t, 40.1, 40.7, E.inOut);
      set(leaf, { d: `M -95 -380 L ${f1(-95 + 190 * close)} -380 L ${f1(-95 + 190 * close)} 0 L -95 0 Z` });
      // línea: se estira y se rompe cuando se cierra la puerta
      const a = { x: SEAT.x + 40, y: SEAT.y - 240 }, b = { x: lx, y: lerp(1040, 1000, w) - 230 };
      const brk = ramp(t, 40.55, 41.2, E.out);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 30 + 60 * brk };
      set(lineA, { d: `M ${f1(a.x)} ${f1(a.y)} Q ${f1(lerp(mid.x, a.x, 0.3))} ${f1(mid.y)} ${f1(lerp(mid.x, a.x, brk * 0.6))} ${f1(mid.y + 40 * brk)}`, opacity: f3(ramp(t, 36.5, 37.0) * (1 - ramp(t, 43.5, 44.0))) });
      set(lineB, { d: `M ${f1(lerp(mid.x, b.x, brk * 0.6))} ${f1(mid.y + 40 * brk)} Q ${f1(lerp(mid.x, b.x, 0.3))} ${f1(mid.y)} ${f1(b.x)} ${f1(b.y)}`, opacity: f3(ramp(t, 36.5, 37.0) * (1 - ramp(t, 40.4, 40.7))) });
      const sk = ramp(t, 40.55, 41.1);
      set(spark, { cx: f1(mid.x), cy: f1(mid.y), r: f1(70 * sk), opacity: f3((1 - sk) * (sk > 0 ? 1 : 0)) });
      note.show(t, 36.6, 46.9, 540, 260);
      // «Sin embargo… no convierte a alguien en asesino» (41.7–46.9): el título queda tachado
      const sk2 = ramp(t, 45.2, 45.6, E.out);
      set(strike, { opacity: f3(sk2 * (1 - ramp(t, 47.0, 47.4))), transform: `translate(540,420) scale(${f3(sk2)},1)` });
      set(quote, { opacity: f3(ramp(t, 45.5, 45.9) * (1 - ramp(t, 47.0, 47.4))) });
    },
  };
}
