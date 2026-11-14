// ESCENA 03 — SEÑAL 1: EL CONTROL (20.3 – 27.1 s)
// En el sofá, ella recibe mensajes de amistades; él se inclina y decide a quién puede responder (marca «no»).
// Aparecen tres iconos: amistades (23.6), ropa (24.9) y ubicación (25.7), rodeados por líneas de control.
// «CONTROLA TU VIDA» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson, ARMS } from '/ep01/src/characters.js';
import { makeA, makeB, makeLiving, makeSofa, givePhone, makeBadge } from '../common.js';
import { makeAvatar } from '/ep03/src/common.js';
import { RED, RED2, CORAL } from '../style.js';

export const S03 = { start: 20.3, end: 27.1 };
const A = { x: 400, y: 1200 }, B = { x: 700, y: 1200 }, S = 1.3;

export function create(layer) {
  const cam = el('g', {}, layer);
  makeLiving(cam); makeSofa(cam);
  const a = makeA(cam), b = makeB(cam);
  const glow = givePhone(a);
  // notificaciones de amistades
  const notes = [0, 1, 2].map(i => {
    const g = el('g', { opacity: 0 }, cam);
    el('rect', { x: -170, y: -46, width: 340, height: 92, rx: 46, fill: C.white }, g);
    makeAvatar(el('g', { transform: 'translate(-118,0)' }, g), { r: 32, shirt: ['#ff7a6b', '#3a8f6a', '#ffc93c'][i], skin: ['#e8b48c', '#8a5a3c', '#f1c7a1'][i], hair: '#3b2416' });
    el('rect', { x: -66, y: -16, width: 180, height: 14, rx: 7, fill: '#c9cfe0' }, g); el('rect', { x: -66, y: 8, width: 120, height: 12, rx: 6, fill: '#d9dde8' }, g);
    const no = el('g', { opacity: 0 }, g);
    el('circle', { cx: 150, cy: -34, r: 30, fill: RED2 }, no); el('path', { d: 'M 136 -48 L 164 -20 M 164 -48 L 136 -20', stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round' }, no);
    return { g, no, i };
  });
  // amistades · ropa · ubicación, rodeados por líneas de control
  const icons = [['AMISTADES', 23.6], ['ROPA', 24.9], ['UBICACIÓN', 25.7]].map(([label, t0], i) => {
    const g = el('g', { opacity: 0 }, layer);
    el('circle', { r: 78, fill: '#16285e' }, g);
    const ic = el('g', {}, g);
    if (i === 0) { [-30, 0, 30].forEach((x, k) => { el('circle', { cx: x, cy: -14 + (k === 1 ? -8 : 0), r: 16, fill: C.white }, ic); el('path', { d: `M ${x - 20} 34 Q ${x} 0 ${x + 20} 34 Z`, fill: C.white }, ic); }); }
    else if (i === 1) el('path', { d: 'M -40 -40 L -16 -50 Q 0 -36 16 -50 L 40 -40 L 54 -10 L 36 -2 L 34 46 L -34 46 L -36 -2 L -54 -10 Z', fill: C.white }, ic);
    else { el('path', { d: 'M 0 50 C -50 0 -44 -50 0 -50 C 44 -50 50 0 0 50 Z', fill: C.white }, ic); el('circle', { cx: 0, cy: -14, r: 16, fill: '#16285e' }, ic); }
    const cage = el('g', { opacity: 0 }, g);
    for (let k = 0; k < 6; k++) el('line', { x1: -70 + k * 28, y1: -90, x2: -70 + k * 28, y2: 90, stroke: RED2, 'stroke-width': 6, 'stroke-linecap': 'round' }, cage);
    el('circle', { r: 92, fill: 'none', stroke: RED2, 'stroke-width': 8 }, cage);
    const lt = el('text', { x: 0, y: 132, 'font-size': 30, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 2 }, g); lt.textContent = label;
    return { g, cage, t0, i };
  });
  const badge = makeBadge(layer, 0);
  return {
    render(t, ctx) {
      const ent = ramp(t, 20.3, 21.0, E.out5);
      set(cam, { transform: `translate(540,880) scale(${f3(lerp(1.7, 1.5, ent))}) translate(-550,-950)`, opacity: f3(ent) });
      // ella mira su teléfono; él se inclina hacia la pantalla y señala (decide)
      const lean = ramp(t, 22.7, 23.3, E.out);
      drawPerson(a, { x: A.x, y: A.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 34, y: -246 }, handF: { x: 54, y: -258 }, headR: lerp(14, 4, lean) + Math.sin(t) * 1.5, smile: lerp(0.5, -0.3, lean), lean: lerp(0, -4, lean) });
      set(glow, { opacity: 0.9 });
      drawPerson(b, { x: B.x, y: B.y, s: S, face: -1, sit: 1, phase: 0, stride: 0, ...(lean > 0.5 ? ARMS.point(0.7 + 0.1 * Math.sin(t * 5)) : { handB: { x: 50, y: -160 }, handF: { x: 70, y: -156 } }), headR: lerp(0, 14, lean), smile: -0.2, lean: lerp(0, -12, lean) });
      notes.forEach(n => {
        const k = ramp(t, 20.8 + n.i * 0.45, 21.2 + n.i * 0.45, E.back);
        set(n.g, { opacity: f3(clamp(k * 2) * (1 - ramp(t, 26.4, 26.9))), transform: tr(560, 520 + n.i * 110 - 30 * (1 - k), lerp(0.6, 1, k)) });
        set(n.no, { opacity: f3(n.i !== 1 ? ramp(t, 23.3 + n.i * 0.3, 23.5 + n.i * 0.3) : 0) });
      });
      set(cam, { opacity: f3(ent * (1 - 0.6 * ramp(t, 23.4, 23.9))) });
      icons.forEach(ic => {
        const k = ramp(t, ic.t0 - 0.15, ic.t0 + 0.25, E.back);
        set(ic.g, { opacity: f3(clamp(k * 2)), transform: tr(200 + ic.i * 340, 760, lerp(0.4, 1, k)) });
        set(ic.cage, { opacity: f3(ramp(t, ic.t0 + 0.3, ic.t0 + 0.6)), transform: `scale(${f3(lerp(1.4, 1, ramp(t, ic.t0 + 0.3, ic.t0 + 0.7, E.out)))})` });
      });
      badge.show(t, 20.5, 26.9);
    },
  };
}
