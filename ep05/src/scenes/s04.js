// ESCENA 04 — SEÑAL 2: LOS CELOS (27.0 – 35.5 s)
// Un corazón se transforma en un candado («los celos con el amor», 29.5). Él exige revisar el teléfono (32.0);
// ella expresa incomodidad. La cámara enfoca el teléfono y después sus expresiones.
// «LOS CELOS NO JUSTIFICAN EL CONTROL» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson, ARMS } from '/ep01/src/characters.js';
import { makeA, makeB, makeLiving, givePhone, makeBadge } from '../common.js';
import { RED, RED2, CORAL } from '../style.js';

export const S04 = { start: 27.0, end: 35.5 };
const A = { x: 360, y: 1250 }, B = { x: 760, y: 1250 }, S = 1.35;

export function create(layer) {
  const cam = el('g', {}, layer);
  makeLiving(cam);
  const a = makeA(cam), b = makeB(cam);
  const glow = givePhone(a);
  const hl = el('g', {}, layer);
  const heart = el('path', { d: 'M 0 60 C -110 -10 -80 -110 0 -50 C 80 -110 110 -10 0 60 Z', fill: CORAL }, hl);
  const lock = el('g', { opacity: 0 }, hl);
  el('path', { d: 'M -40 -10 L -40 -50 Q -40 -90 0 -90 Q 40 -90 40 -50 L 40 -10', fill: 'none', stroke: '#c9cfe0', 'stroke-width': 18 }, lock);
  el('rect', { x: -70, y: -14, width: 140, height: 110, rx: 18, fill: RED2 }, lock);
  el('circle', { cx: 0, cy: 30, r: 14, fill: '#f6f3ec' }, lock); el('rect', { x: -5, y: 34, width: 10, height: 30, fill: '#f6f3ec' }, lock);
  const badge = makeBadge(layer, 1);
  return {
    render(t, ctx) {
      const ent = ramp(t, 27.0, 27.7, E.out5);
      // cámara: plano de ambos → foco en el teléfono (32.3) → sus expresiones (33.6)
      const ph = ramp(t, 32.2, 32.9, E.inOut) * (1 - ramp(t, 33.5, 34.2, E.inOut));
      const face = ramp(t, 33.5, 34.2, E.inOut);
      const phone = { x: A.x + 54 * S, y: A.y - 262 * S };
      const cx = lerp(lerp(560, phone.x, ph), 560, 0), cy = lerp(lerp(960, phone.y, ph), 860, face);
      const z = lerp(1.4, 1.5, ent) * (1 + 0.45 * ph + 0.2 * face);
      set(cam, { transform: `translate(540,900) scale(${f3(z)}) translate(${f1(-cx)},${f1(-cy)})`, opacity: f3(ent) });
      // él exige el teléfono (mano extendida); ella lo aparta hacia sí, incómoda
      const dem = ramp(t, 31.8, 32.3, E.out);
      const away = ramp(t, 32.4, 32.9, E.out);
      drawPerson(a, { x: A.x - 20 * away, y: A.y, s: S, face: 1, phase: 0, stride: 0, handB: { x: lerp(34, 0, away), y: -246 }, handF: { x: lerp(54, 10, away), y: lerp(-258, -230, away) }, headR: lerp(10, -6, away) + Math.sin(t) * 1.5, smile: lerp(0, -0.5, away), lean: lerp(0, -6, away) });
      set(glow, { opacity: 0.8 });
      drawPerson(b, { x: B.x, y: B.y, s: S, face: -1, phase: 0, stride: 0, ...(dem > 0.5 ? { handB: { x: -36, y: -150 }, handF: { x: 140, y: -210 } } : ARMS.hips()), headR: lerp(0, 6, dem), smile: lerp(-0.2, -0.6, dem), lean: lerp(0, -8, dem) });
      // corazón → candado
      const hk = ramp(t, 28.3, 28.7, E.back), morph = ramp(t, 29.6, 30.4, E.inOut);
      set(hl, { opacity: f3(clamp(hk * 2) * (1 - ramp(t, 31.6, 32.1))), transform: tr(540, 560, lerp(0.4, 0.95, hk) * (1 + 0.05 * Math.sin(t * 4) * (1 - morph))) });
      set(heart, { opacity: f3(1 - morph), transform: `scale(${f3(lerp(1, 0.6, morph))},${f3(lerp(1, 0.9, morph))})` });
      set(lock, { opacity: f3(morph), transform: `scale(${f3(lerp(0.6, 1, morph))})` });
      badge.show(t, 27.2, 35.2);
    },
  };
}
