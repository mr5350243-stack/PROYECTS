// ESCENA 04 — SEÑAL 3: POCA CONSIDERACIÓN EMOCIONAL (30.6 – 39.5 s)
// Ella está triste en el sofá; él mira su teléfono y minimiza lo que ella expresa (gesto de quitar importancia,
// burbuja «…»). Un corazón ilustrado entre ambos pierde brillo, sin romperse. «MINIMIZA TUS SENTIMIENTOS» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeWoman, makeMan, makeLiving, makeSpeech, makeBadge } from '../common.js';
import { CORAL, GREY } from '../style.js';

export const S04 = { start: 30.6, end: 39.5 };
const W = { x: 330, y: 1200 }, M = { x: 760, y: 1200 }, S = 1.3;

export function create(layer) {
  const cam = el('g', {}, layer);
  makeLiving(cam);
  // sofá
  const sofa = el('g', {}, cam);
  el('rect', { x: 150, y: 920, width: 780, height: 200, rx: 50, fill: '#3a4f8f' }, sofa);
  el('rect', { x: 120, y: 1040, width: 840, height: 120, rx: 40, fill: '#4a5f9f' }, sofa);
  el('rect', { x: 100, y: 980, width: 90, height: 200, rx: 40, fill: '#3a4f8f' }, sofa); el('rect', { x: 890, y: 980, width: 90, height: 200, rx: 40, fill: '#3a4f8f' }, sofa);
  el('rect', { x: 150, y: 1160, width: 20, height: 40, fill: '#0b1636' }, sofa); el('rect', { x: 910, y: 1160, width: 20, height: 40, fill: '#0b1636' }, sofa);
  const woman = makeWoman(cam), man = makeMan(cam);
  const ph = el('g', { transform: 'rotate(-70) scale(0.36)' }, man.held); icon(ph, 'phone');
  el('circle', { r: 80, fill: 'url(#phoneGlow)' }, man.held);
  // corazón entre ambos
  const heart = el('g', {}, cam);
  const glow = el('circle', { r: 150, fill: CORAL, opacity: 0.4, filter: 'url(#soft)' }, heart);
  const hp = el('path', { d: 'M 0 60 C -110 -10 -80 -110 0 -50 C 80 -110 110 -10 0 60 Z', fill: CORAL }, heart);
  const shine = el('path', { d: 'M -50 -40 Q -60 -10 -40 10', stroke: '#fff', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }, heart);
  const herB = makeSpeech(cam, { w: 200, h: 120, fill: C.white, tail: 1 });
  el('path', { d: 'M -20 -20 Q -30 10 -20 30 M 20 -20 Q 30 10 20 30', stroke: '#3a5cb8', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, herB.inner);   // lágrimas
  const hisB = makeSpeech(cam, { w: 170, h: 100, fill: GREY, tail: -1 });
  el('text', { x: 0, y: 14, 'font-size': 56, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, hisB.inner).textContent = '…';
  const badge = makeBadge(layer, 2);
  return {
    render(t, ctx) {
      const ent = ramp(t, 30.6, 31.3, E.out5);
      set(cam, { transform: `translate(540,880) scale(${f3(lerp(1.6, 1.42, ent))}) translate(-545,-950)`, opacity: f3(ent) });
      drawPerson(woman, { x: W.x, y: W.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 50, y: -160 }, handF: { x: 70, y: -156 }, headR: 16 + Math.sin(t * 0.8) * 2, smile: -0.45, lean: 4 });
      // él: mirada en el teléfono; con «minimizar» (34.9) un gesto rápido de quitar importancia
      const wave = ramp(t, 34.9, 35.2) * (1 - ramp(t, 35.9, 36.2));
      drawPerson(man, { x: M.x, y: M.y, s: S, face: -1, sit: 1, phase: 0, stride: 0, handB: { x: 30, y: -246 }, handF: wave > 0 ? { x: 110 + Math.sin(t * 16) * 20, y: -230 } : { x: 54, y: -258 }, headR: 14, smile: 0.3 });
      const hk = ramp(t, 33.6, 34.0, E.back);
      set(herB.g, { opacity: f3(clamp(hk * 2) * (1 - ramp(t, 36.4, 37.0))), transform: tr(W.x + 120, 610, lerp(0.4, 1, hk) * lerp(1, 0.7, ramp(t, 35.5, 36.6))) });
      const mk = ramp(t, 35.0, 35.3, E.back);
      set(hisB.g, { opacity: f3(clamp(mk * 2) * (1 - ramp(t, 38.4, 38.8))), transform: tr(M.x - 60, 600, lerp(0.4, 1, mk)) });
      // el corazón pierde brillo (sin romperse)
      const fade = ramp(t, 35.2, 38.4, E.inOut);
      const pulse = 1 + 0.04 * Math.sin(t * 5) * (1 - fade);
      set(heart, { transform: tr(545, 820 + fade * 20, 0.9 * pulse * lerp(1, 0.88, fade)), opacity: f3(ramp(t, 31.0, 31.5)) });
      set(hp, { fill: `rgb(${Math.round(lerp(255, 120, fade))},${Math.round(lerp(122, 128, fade))},${Math.round(lerp(107, 150, fade))})` });
      set(glow, { opacity: f3(0.4 * (1 - fade)) }); set(shine, { opacity: f3(0.8 * (1 - fade)) });
      badge.show(t, 30.9, 39.2);
    },
  };
}
