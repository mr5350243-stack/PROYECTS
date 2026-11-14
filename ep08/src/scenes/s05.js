// ESCENA 05 — PRIMER GIRO (31.2 – 41.2 s)
// Rodeada de recuerdos de la conversación (mensajes, la cita, la videollamada). Con «incertidumbre» (38.9) los
// recuerdos se convierten en signos de interrogación. «NO ES SOLO LA PERSONA» → «ES LA INCERTIDUMBRE» (fx_data).
// La composición cambia de perspectiva (giro de cámara).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeGirl, makeAvatar, phoneMsg } from '../common.js';
import { CORAL } from '../style.js';

export const S05 = { start: 31.2, end: 41.2 };
const CEN = { x: 540, y: 820 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  el('ellipse', { cx: CEN.x, cy: CEN.y, rx: 560, ry: 600, fill: 'url(#spot2)' }, cam);
  const girl = makeGirl(cam);
  const mems = Array.from({ length: 8 }, (_, i) => {
    const g = el('g', { opacity: 0 }, cam);
    const m = el('g', {}, g);
    if (i % 4 === 0) phoneMsg(m, { w: 230, text: 'Buenos días', heart: true }).setAttribute('opacity', 1);
    else if (i % 4 === 1) { el('rect', { x: -90, y: -70, width: 180, height: 140, rx: 18, fill: '#f6f3ec' }, m); el('circle', { cx: 0, cy: -10, r: 34, fill: 'none', stroke: CORAL, 'stroke-width': 8 }, m); el('text', { x: 0, y: 50, 'font-size': 26, 'font-weight': 900, fill: C.navy, 'text-anchor': 'middle' }, m).textContent = '20:00'; }
    else if (i % 4 === 2) { el('rect', { x: -80, y: -110, width: 160, height: 220, rx: 22, fill: '#1f3a80', stroke: '#fff', 'stroke-width': 5 }, m); makeAvatar(el('g', { transform: 'translate(0,-10)' }, m), { r: 52, shirt: '#3a5cb8', skin: '#e8b48c', hair: '#14110f' }); }
    else phoneMsg(m, { w: 220, out: true, lines: 2 }).setAttribute('opacity', 1);
    if (i % 4 === 0 || i % 4 === 3) set(m.firstChild, { transform: 'translate(-110,0)' });
    const q = el('text', { x: 0, y: 50, 'font-size': 150, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle', opacity: 0, stroke: C.ink, 'stroke-width': 12, 'paint-order': 'stroke' }, g); q.textContent = '?';
    const a = i / 8 * Math.PI * 2;
    return { g, m, q, a, i };
  });
  return {
    render(t, ctx) {
      // cambio de perspectiva con «incertidumbre»: el plano gira y se inclina
      const flip = ramp(t, 38.5, 39.6, E.inOut);
      set(cam, { transform: `translate(540,820) rotate(${f1(lerp(0, -8, flip))}) scale(${f3(lerp(1.1, 1.0, ramp(t, 31.2, 32.2, E.out5)) * lerp(1, 1.12, flip))},${f3(lerp(1, 0.92, flip) * lerp(1.1, 1.0, ramp(t, 31.2, 32.2, E.out5)))}) translate(-540,-820)` });
      drawPerson(girl.P, { x: CEN.x, y: CEN.y + 380, s: 1.3, face: 1, phase: 0, stride: 0, handB: { x: 34, y: -246 }, handF: { x: 54, y: -258 }, headR: Math.sin(t) * 3, smile: -0.2 });
      set(girl.glow, { opacity: 0.6 });
      mems.forEach(M => {
        const k = ramp(t, 31.5 + M.i * 0.25, 31.9 + M.i * 0.25, E.back);
        const a = M.a + (t - 31) * 0.18;
        const toQ = ramp(t, 38.9 + M.i * 0.06, 39.4 + M.i * 0.06, E.inOut);
        set(M.g, { opacity: f3(clamp(k * 2)), transform: tr(CEN.x + Math.cos(a) * 400, CEN.y - 40 + Math.sin(a) * 330, lerp(0.4, 0.85, k), Math.sin(t + M.i) * 4) });
        set(M.m, { opacity: f3(1 - toQ), transform: `scale(${f3(lerp(1, 0.4, toQ))})` });
        set(M.q, { opacity: f3(toQ), transform: `scale(${f3(lerp(0.3, 1, toQ))})` });
      });
    },
  };
}
