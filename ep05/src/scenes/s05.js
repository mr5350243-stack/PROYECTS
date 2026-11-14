// ESCENA 05 — SEÑAL 3: LA INTIMIDACIÓN (35.4 – 42.2 s)
// Discusión de pie junto a la mesa. Él grita (37.6) y golpea la mesa (38.2): las tazas saltan y la cámara tiembla
// ligeramente. Ella retrocede. No hay agresión física contra la persona. «INTIMIDACIÓN» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson, ARMS } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeA, makeB, makeLiving, makeBadge } from '../common.js';
import { RED, RED2 } from '../style.js';

export const S05 = { start: 35.4, end: 42.2 };
const A = { x: 300, y: 1250 }, B = { x: 760, y: 1250 }, S = 1.35, TB = { x: 560, y: 1250 };

export function create(layer) {
  const cam = el('g', {}, layer);
  makeLiving(cam);
  const tint = el('rect', { x: -900, y: -600, width: 2900, height: 2600, fill: RED, opacity: 0 }, cam);
  const a = makeA(cam), b = makeB(cam);
  const table = el('g', { transform: `translate(${TB.x},${TB.y})` }, cam);
  el('rect', { x: -150, y: -170, width: 300, height: 24, rx: 10, fill: C.white }, table);
  el('rect', { x: -130, y: -150, width: 18, height: 150, fill: '#0b1636' }, table); el('rect', { x: 112, y: -150, width: 18, height: 150, fill: '#0b1636' }, table);
  const cups = [-70, 60].map(x => icon(table, 'mug', { transform: `translate(${x},-200) scale(0.36)` }));
  const shout = el('g', { opacity: 0 }, cam);
  [0, 1, 2].forEach(k => el('path', { d: `M 0 ${-20 - k * 22} Q ${-40 - k * 20} 0 0 ${20 + k * 22}`, fill: 'none', stroke: RED2, 'stroke-width': 7, 'stroke-linecap': 'round' }, shout));
  const impact = el('g', { opacity: 0 }, cam);
  for (let k = 0; k < 8; k++) { const ang = Math.PI + k * Math.PI / 7; el('line', { x1: Math.cos(ang) * 40, y1: Math.sin(ang) * 40, x2: Math.cos(ang) * 90, y2: Math.sin(ang) * 90, stroke: C.yellow, 'stroke-width': 7, 'stroke-linecap': 'round' }, impact); }
  const badge = makeBadge(layer, 2);
  return {
    render(t, ctx) {
      const ent = ramp(t, 35.4, 36.0, E.out5);
      const bang = ramp(t, 38.2, 38.35), after = ramp(t, 38.2, 39.4);
      const shake = (t > 37.5 && t < 39.6 ? 1 : 0) * (Math.sin(t * 50) * 3 + (bang > 0 && bang < 1 ? 0 : 0)) + (t > 38.2 && t < 38.6 ? Math.sin(t * 90) * 9 * (1 - ramp(t, 38.2, 38.6)) : 0);
      set(cam, { transform: `translate(${f1(540 + shake)},900) scale(${f3(lerp(1.45, 1.38, ent) * (1 + 0.05 * ramp(t, 36.4, 39.5)))}) translate(-540,-960)`, opacity: f3(ent) });
      set(tint, { opacity: f3(0.22 * ramp(t, 37.4, 37.9) * (1 - ramp(t, 41.2, 42.0))) });
      // él: grita (37.6) y golpea la mesa con la mano (38.2) — sin tocarla a ella
      const yell = ramp(t, 37.5, 37.7) * (1 - ramp(t, 40.8, 41.2));
      const slam = ramp(t, 37.95, 38.2, E.in) * (1 - ramp(t, 38.7, 39.3));
      drawPerson(b, { x: B.x, y: B.y, s: S, face: -1, phase: 0, stride: 0, handB: { x: -30, y: -170 }, handF: slam > 0 ? { x: lerp(60, 150, slam), y: lerp(-240, -120, slam) } : (yell > 0 ? { x: 80, y: -250 + Math.sin(t * 9) * 10 } : ARMS.rest().handF), headR: lerp(0, -8, yell), smile: lerp(-0.2, -0.9, yell), lean: lerp(0, -10, yell) });
      set(shout, { opacity: f3(yell * (0.7 + 0.3 * Math.sin(t * 12))), transform: tr(B.x - 110, B.y - 330 * S, 1.2) });
      // tazas que saltan e impacto
      cups.forEach((c, i) => set(c, { transform: `translate(${i ? 60 : -70},${f1(-200 - 40 * Math.sin(after * Math.PI) * (after < 1 ? 1 : 0))}) rotate(${f1(Math.sin(after * Math.PI) * (i ? 14 : -10))}) scale(0.36)` }));
      const ik = ramp(t, 38.2, 38.7);
      set(impact, { opacity: f3((1 - ik) * (ik > 0 ? 1 : 0)), transform: tr(TB.x + 110, TB.y - 175, lerp(0.6, 1.4, ik)) });
      // ella retrocede, manos delante (defensiva)
      const back = ramp(t, 37.7, 38.6, E.out);
      drawPerson(a, { x: A.x - 90 * back, y: A.y, s: S, face: 1, phase: t * 9, stride: back > 0 && back < 1 ? 0.6 : 0, handB: { x: lerp(-30, 40, back), y: lerp(-160, -250, back) }, handF: { x: lerp(40, 70, back), y: lerp(-150, -260, back) }, headR: lerp(0, -12, back), smile: lerp(-0.2, -0.6, back), lean: lerp(0, -10, back) });
      badge.show(t, 35.6, 42.0);
    },
  };
}
