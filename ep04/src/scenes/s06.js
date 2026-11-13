// ESCENA 06 — SEÑAL 5: CULPABILIZACIÓN (48.0 – 56.3 s)
// Ella establece un límite en una conversación tranquila (gesto de mano abierta, línea en el suelo). Él responde con
// reproche. Una esfera «CULPA» pasa simbólicamente de él a ella. «TE HACE SENTIR EGOÍSTA» (fx_data).
// Nota: esta conducta no es exclusiva del narcisismo.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson, ARMS } from '/ep01/src/characters.js';
import { makeNote } from '/ep02/src/common.js';
import { makeWoman, makeMan, makeLiving, makeBadge, OPEN_PALM } from '../common.js';
import { CORAL } from '../style.js';

export const S06 = { start: 48.0, end: 56.3 };
const W = { x: 320, y: 1250 }, M = { x: 780, y: 1250 }, S = 1.35;

export function create(layer) {
  const cam = el('g', {}, layer);
  makeLiving(cam);
  const line = el('rect', { x: 548, y: 1240, width: 0, height: 10, rx: 5, fill: C.yellow }, cam);
  const woman = makeWoman(cam), man = makeMan(cam);
  const ball = el('g', { opacity: 0 }, cam);
  el('circle', { r: 70, fill: '#3a2a4a', stroke: CORAL, 'stroke-width': 7 }, ball);
  el('circle', { r: 90, fill: CORAL, opacity: 0.25, filter: 'url(#soft)' }, ball);
  el('text', { x: 0, y: 11, 'font-size': 32, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, ball).textContent = 'CULPA';
  const note = makeNote(layer, 'No es exclusiva del narcisismo', { dot: C.yellow });
  const badge = makeBadge(layer, 4);
  return {
    render(t, ctx) {
      const ent = ramp(t, 48.0, 48.7, E.out5);
      set(cam, { transform: `translate(540,860) scale(${f3(lerp(1.5, 1.35, ent))}) translate(-550,-960)`, opacity: f3(ent) });
      // «Cuando estableces un límite» (52.1–52.9): palma abierta y línea en el suelo
      const lim = ramp(t, 52.1, 52.7, E.out);
      const slump = ramp(t, 54.4, 55.0, E.inOut);
      drawPerson(woman, { x: W.x, y: W.y, s: S, face: 1, phase: 0, stride: 0, ...(slump > 0.5 ? { handB: { x: 20, y: -170 }, handF: { x: 40, y: -168 } } : OPEN_PALM(lim)), headR: lerp(0, 16, slump), smile: lerp(0.2, -0.4, slump), lean: lerp(0, 6, slump) });
      set(line, { width: f1(300 * lim), x: f1(548 - 150 * lim) });
      // reproche: señala con el dedo
      const rep = ramp(t, 53.0, 53.4);
      drawPerson(man, { x: M.x, y: M.y, s: S, face: -1, phase: 0, stride: 0, ...(rep > 0.5 ? ARMS.point(0.5 + 0.1 * Math.sin(t * 6)) : ARMS.rest()), headR: lerp(0, -8, rep), smile: lerp(0.3, -0.6, rep), lean: lerp(0, -5, rep) });
      // la esfera CULPA pasa de él a ella (53.4 → 54.6)
      const k = ramp(t, 53.6, 54.7, E.inOut);
      const appear = ramp(t, 53.3, 53.6, E.back);
      set(ball, { opacity: f3(clamp(appear * 2) * (1 - ramp(t, 55.8, 56.2))), transform: tr(lerp(M.x - 90, W.x + 40, k), lerp(820, 860, k) - Math.sin(k * Math.PI) * 180 + slump * 40, lerp(0.4, 1, appear) * lerp(1, 0.85, k)) });
      note.show(t, 48.6, 52.0, 540, 250);
      badge.show(t, 48.3, 56.0);
    },
  };
}
