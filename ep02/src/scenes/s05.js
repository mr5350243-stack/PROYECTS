// ESCENA 05 — LA NECESIDAD DE CONTROL (47.4 – 56.9 s)
// Una mano ilustrada intenta mantener varios objetos dentro de un círculo. Los objetos representan independencia,
// autonomía y libertad. El círculo se cierra y los comprime (con «privar… de autonomía» pierden el color).
// La cámara gira lentamente alrededor de la composición (inclinación 2.5D). El círculo se convierte en un expediente.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makeHand } from '../common.js';
import { RED, GREY, PAPER } from '../style.js';

export const S05 = { start: 47.4, end: 56.9 };
const CEN = { x: 540, y: 800 };

function bird(g) { el('path', { d: 'M -60 0 Q -20 -40 0 -6 Q 20 -40 60 0 Q 20 -16 0 10 Q -20 -16 -60 0 Z', fill: C.white }, g); }
function openDoor(g) { el('rect', { x: -40, y: -60, width: 80, height: 120, rx: 6, fill: '#ffe2a0' }, g); el('path', { d: 'M -40 -60 L 0 -50 L 0 70 L -40 60 Z', fill: '#3a4f8f' }, g); }
function walker(g) { el('circle', { cx: 0, cy: -46, r: 16, fill: C.white }, g); el('path', { d: 'M 0 -28 L 0 18 M 0 18 L -20 56 M 0 18 L 22 54 M 0 -14 L -26 10 M 0 -14 L 24 4', stroke: C.white, 'stroke-width': 12, 'stroke-linecap': 'round', fill: 'none' }, g); }

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  el('ellipse', { cx: CEN.x, cy: CEN.y, rx: 520, ry: 520, fill: 'url(#spot2)' }, cam);
  const ring = el('circle', { cx: CEN.x, cy: CEN.y, r: 330, fill: 'none', stroke: RED, 'stroke-width': 30, 'stroke-linecap': 'round', transform: `rotate(-90 ${CEN.x} ${CEN.y})` }, cam);
  const ringIn = el('circle', { cx: CEN.x, cy: CEN.y, r: 330, fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.25, 'stroke-dasharray': '10 18' }, cam);
  const file = el('rect', { fill: PAPER, opacity: 0 }, cam);
  const fileTab = el('path', { fill: '#b9ad8a', opacity: 0 }, cam);
  const objs = [['INDEPENDENCIA', walker, -150, -90], ['AUTONOMÍA', openDoor, 150, -40], ['LIBERTAD', bird, -10, 150]].map(([label, fn, dx, dy], i) => {
    const g = el('g', {}, cam), inner = el('g', {}, g);
    el('circle', { r: 86, fill: '#2a3a6e' }, inner); fn(inner);
    const veil = el('circle', { r: 86, fill: C.ink, opacity: 0 }, g);
    const lt = el('text', { x: 0, y: 128, 'font-size': 28, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 2 }, g); lt.textContent = label;
    return { g, veil, lt, dx, dy, i };
  });
  const hand = makeHand(el('g', {}, cam));
  return {
    render(t, ctx) {
      const ent = ramp(t, 47.4, 48.2, E.out5);
      // giro lento de cámara alrededor de la composición
      const rot = lerp(-8, 8, ramp(t, 47.4, 56.9, E.inOut)), tiltY = lerp(1, 0.9, ramp(t, 49, 54));
      set(cam, { transform: `translate(${CEN.x},${CEN.y}) rotate(${f1(rot)}) scale(${f3(lerp(1.15, 1, ent))},${f3(lerp(1.15, 1, ent) * tiltY)}) translate(${-CEN.x},${-CEN.y})`, opacity: f3(ent) });
      // el círculo se cierra (hueco → anillo completo) y luego se estrecha
      const close = ramp(t, 48.3, 50.6, E.inOut), shrink = ramp(t, 51.0, 55.0, E.inOut);
      const R = lerp(330, 220, shrink), circ = 2 * Math.PI * R;
      set(ring, { r: f1(R), 'stroke-dasharray': `${f1(circ * lerp(0.62, 1, close))} ${f1(circ)}`, transform: `rotate(${f1(-90 + 70 * (1 - close))} ${CEN.x} ${CEN.y})` });
      set(ringIn, { r: f1(R) });
      const grey = ramp(t, 54.1, 55.4);   // «privar… de autonomía»
      objs.forEach(o => {
        const push = lerp(1, 0.48, shrink), jit = Math.sin(t * 9 + o.i * 2) * 4 * (1 - shrink) * close;
        const tryOut = Math.max(0, Math.sin((t - 48 - o.i * 0.7) * 1.4)) * 50 * (1 - shrink);
        const ang = Math.atan2(o.dy, o.dx);
        set(o.g, { transform: tr(CEN.x + o.dx * push + Math.cos(ang) * tryOut + jit, CEN.y + o.dy * push + Math.sin(ang) * tryOut, lerp(1, 0.66, shrink) * ramp(t, 47.6 + o.i * 0.2, 48.2 + o.i * 0.2, E.back), -rot) });
        set(o.veil, { opacity: f3(0.6 * grey) });
        set(o.lt, { opacity: f3(1 - ramp(t, 52.5, 53.2)) });
      });
      // la mano empuja el borde del círculo desde abajo a la derecha
      const hp = ramp(t, 47.8, 48.8, E.out5);
      set(hand, { transform: tr(CEN.x + lerp(560, 300, hp) - 60 * shrink, CEN.y + lerp(640, 360, hp) - 80 * shrink + Math.sin(t * 2) * 6, 0.9, -38) });
      // el círculo se transforma en un expediente
      const fk = ramp(t, 55.6, 56.6, E.inOut);
      const w = lerp(2 * R, 420, fk), h = lerp(2 * R, 560, fk);
      set(file, { x: f1(CEN.x - w / 2), y: f1(CEN.y - h / 2), width: f1(w), height: f1(h), rx: f1(lerp(R, 12, fk)), opacity: f3(fk) });
      set(fileTab, { d: `M ${f1(CEN.x - w / 2 + 30)} ${f1(CEN.y - h / 2)} L ${f1(CEN.x - w / 2 + 50)} ${f1(CEN.y - h / 2 - 40)} L ${f1(CEN.x - w / 2 + 210)} ${f1(CEN.y - h / 2 - 40)} L ${f1(CEN.x - w / 2 + 230)} ${f1(CEN.y - h / 2)} Z`, opacity: f3(fk) });
      set(ring, { opacity: f3(1 - fk) });
      objs.forEach(o => set(o.g, { opacity: f3(1 - fk) }));
      set(hand, { opacity: f3(1 - ramp(t, 55.2, 55.8)) });
    },
  };
}
