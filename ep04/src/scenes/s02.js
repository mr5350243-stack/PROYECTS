// ESCENA 02 — SEÑAL 1: CENTRO DE ATENCIÓN (11.0 – 21.4 s)
// Ella intenta contar un problema (burbuja con nube); él la interrumpe y habla de sí mismo (burbujas con estrellas
// y trofeo). Una luz de escenario lo ilumina; ella queda fuera del foco. «TODO GIRA A SU ALREDEDOR» (fx_data).
// Transición: el círculo de luz se cierra (iris) y abre la escena 03.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson, ARMS } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeWoman, makeMan, makeLiving, makeChair, makeTable, makeSpeech, makeBadge } from '../common.js';
import { CORAL, GREY } from '../style.js';

export const S02 = { start: 11.0, end: 21.4 };
const W = { x: 330, y: 1180 }, M = { x: 750, y: 1180 }, S = 1.3;

export function create(layer) {
  const cam = el('g', {}, layer);
  makeLiving(cam);
  const chW = makeChair(cam, 1), chM = makeChair(cam, -1);
  set(chW, { transform: `translate(${W.x},${W.y})` }); set(chM, { transform: `translate(${M.x},${M.y}) scale(-1,1)` });
  const woman = makeWoman(cam), man = makeMan(cam);
  const table = makeTable(cam); set(table, { transform: 'translate(540,1180)' });
  // sombra sobre ella y luz de escenario sobre él
  const shade = el('rect', { x: -900, y: -600, width: 2900, height: 2600, fill: '#050b20', opacity: 0 }, cam);
  const beam = el('path', { d: `M ${M.x - 40} -200 L ${M.x + 40} -200 L ${M.x + 230} 1200 L ${M.x - 230} 1200 Z`, fill: 'url(#stageLight)', opacity: 0 }, cam);
  const pool = el('ellipse', { cx: M.x, cy: 1190, rx: 240, ry: 40, fill: '#fff2c4', opacity: 0 }, cam);
  cam.appendChild(man.g); cam.appendChild(chM); cam.appendChild(man.g);
  // burbujas
  const herB = makeSpeech(cam, { w: 220, h: 130, fill: C.white, tail: 1 });
  const cloud = el('g', { transform: 'scale(0.55)' }, herB.inner);
  [[-40, 0, 40], [0, -20, 50], [40, 0, 40]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: GREY }, cloud));
  el('path', { d: 'M -30 40 L -40 70 M 0 40 L -10 70 M 30 40 L 20 70', stroke: '#3a5cb8', 'stroke-width': 8, 'stroke-linecap': 'round' }, cloud);
  const hisB = makeSpeech(cam, { w: 300, h: 150, fill: C.yellow, tail: -1 });
  icon(hisB.inner, 'star', { transform: 'translate(-70,0) scale(0.6)' });
  el('text', { x: 40, y: 22, 'font-size': 64, 'font-weight': 900, fill: C.navy, 'text-anchor': 'middle' }, hisB.inner).textContent = 'YO';
  const hisB2 = makeSpeech(cam, { w: 220, h: 130, fill: C.yellow, tail: -1 });
  const trophy = el('g', { transform: 'scale(0.8)' }, hisB2.inner);
  el('path', { d: 'M -40 -50 L 40 -50 L 30 10 Q 0 34 -30 10 Z', fill: C.orange }, trophy); el('rect', { x: -8, y: 18, width: 16, height: 24, fill: C.orange }, trophy); el('rect', { x: -30, y: 40, width: 60, height: 12, rx: 4, fill: C.navy }, trophy);
  const badge = makeBadge(layer, 0);
  const iris = el('circle', { cx: 0, cy: 0, r: 3000 }, el('clipPath', { id: 'e4s02iris' }, layer));
  cam.setAttribute('clip-path', 'url(#e4s02iris)');
  return {
    render(t, ctx) {
      const ent = ramp(t, 11.0, 11.8, E.out5);
      set(cam, { transform: `translate(540,880) scale(${f3(lerp(1.7, 1.45, ent))}) translate(-540,-940)` });
      // ella empieza a contar (12.0); él interrumpe (13.2) y sigue hablando de sí mismo
      const cut = ramp(t, 13.2, 13.6, E.out);
      const herTalk = t > 12.0 && t < 13.3 ? Math.sin(t * 8) * 10 : 0;
      const dim = ramp(t, 13.6, 14.4);
      drawPerson(woman, { x: W.x, y: W.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 60, y: -150 }, handF: { x: 100 + herTalk, y: -200 - herTalk }, headR: lerp(-2, 12, cut) + Math.sin(t) * 1.5, smile: lerp(0.2, -0.3, cut), lean: lerp(4, -4, cut) });
      const talk = Math.sin(t * 7) * 20 * cut;
      drawPerson(man, { x: M.x, y: M.y, s: S, face: -1, sit: 1, phase: 0, stride: 0, handB: { x: 50 + talk * 0.5, y: -200 }, handF: { x: 120 + talk, y: -260 - talk * 0.5 }, headR: -8 + Math.sin(t * 2.4) * 4, smile: lerp(0.3, 0.9, cut), lean: lerp(0, -6, cut) });
      // burbujas
      const hk = ramp(t, 12.0, 12.35, E.back), hshrink = ramp(t, 18.1, 19.4, E.inOut);
      set(herB.g, { opacity: f3(clamp(hk * 2) * (1 - 0.6 * hshrink) * (1 - dim * 0.35)), transform: tr(lerp(W.x + 150, W.x - 40, hshrink), lerp(620, 520, hshrink), lerp(0.4, 1, hk) * lerp(1, 0.45, hshrink)) });
      const mk = ramp(t, 13.25, 13.6, E.back), grow = ramp(t, 16.1, 17.4, E.inOut);
      set(hisB.g, { opacity: f3(clamp(mk * 2)), transform: tr(lerp(M.x - 120, 600, grow), lerp(560, 520, grow), lerp(0.4, 1, mk) * lerp(1, 1.35, grow)) });
      const m2 = ramp(t, 15.0, 15.35, E.back);
      set(hisB2.g, { opacity: f3(clamp(m2 * 2)), transform: tr(M.x + 20, lerp(760, 700, grow), lerp(0.4, 1, m2) * lerp(1, 1.2, grow)) });
      // foco sobre él; ella queda en sombra
      set(beam, { opacity: f3(dim) }); set(pool, { opacity: f3(0.35 * dim) }); set(shade, { opacity: f3(0.42 * dim) });
      badge.show(t, 11.3, 21.0);
      // transición: iris que se cierra sobre él
      const ir = ramp(t, 20.55, 21.4, E.inOut);
      const p = { x: 540 + (M.x - 540) * 1.45, y: 880 + (M.y - 300 - 940) * 1.45 };
      set(iris, { cx: f1(p.x), cy: f1(p.y), r: f1(lerp(1800, 0, ir)) });
    },
  };
}
