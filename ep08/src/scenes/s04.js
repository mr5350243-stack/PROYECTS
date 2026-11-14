// ESCENA 04 — LA BÚSQUEDA DE RESPUESTAS (18.7 – 31.4 s)
// Vuelve a leer las conversaciones anteriores (la pantalla se desplaza hacia arriba). Aparecen preguntas a su
// alrededor: «¿PERDIÓ EL INTERÉS?», «¿QUÉ PASÓ?», «¿DIJE ALGO MAL?». Movimiento circular de cámara.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeRoom, makeGirl, makeBigPhone, phoneMsg, makeQ } from '../common.js';
import { CORAL } from '../style.js';

export const S04 = { start: 18.7, end: 31.4 };
const SEAT = { x: 520, y: 1180 }, S = 1.35;

export function create(layer) {
  const cam = el('g', {}, layer);
  const room = makeRoom(cam);
  const tint = el('rect', { x: -800, y: -600, width: 2700, height: 2600, fill: '#0b2a6e', opacity: 0.3 }, cam);
  const girl = makeGirl(room.mid);
  const ph = makeBigPhone(layer);
  ph.status.textContent = 'últ. vez hoy a las 9:12';
  const scroll = el('g', {}, ph.chat);
  const hist = Array.from({ length: 14 }, (_, i) => phoneMsg(scroll, { w: 220 + (i * 47) % 140, out: i % 3 === 1, lines: 1 + (i % 2), text: i === 13 ? 'Buenos días' : null, heart: i === 13 }));
  const qs = [['¿PERDIÓ EL INTERÉS?', 27.7, 280, 470], ['¿QUÉ PASÓ?', 28.4, 800, 560], ['¿DIJE ALGO MAL?', 29.4, 540, 340]].map(([s, t0, x, y]) => ({ g: makeQ(layer, s, { bg: s === '¿DIJE ALGO MAL?' ? CORAL : '#f6f3ec' }), t0, x, y }));
  return {
    render(t, ctx) {
      // primer plano de la pantalla mientras relee (22.8–27.2) → plano de ella con preguntas alrededor
      const phK = ramp(t, 22.6, 23.0) * (1 - ramp(t, 27.0, 27.4));
      set(ph.g, { opacity: f3(phK), transform: tr(540, 760, 0.98) });
      const sc = ramp(t, 23.0, 26.8, E.inOut);
      hist.forEach((m, i) => { const out = i % 3 === 1; set(m, { opacity: 1, transform: `translate(${out ? 225 : -225},${f1(330 - (13 - i) * 110 + sc * 900)})` }); });
      // movimiento circular de cámara alrededor de ella
      const a = (t - 18.7) * 0.5;
      set(room.back, { transform: `translate(${f1(Math.sin(a) * 80)},0)` });
      set(cam, { transform: `translate(540,880) rotate(${f1(Math.sin(a) * 2)}) scale(${f3(1.45 + 0.08 * Math.cos(a))}) translate(${f1(-560 - Math.sin(a) * 30)},-930)` });
      const read = phK;
      drawPerson(girl.P, { x: SEAT.x, y: SEAT.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 34, y: -246 }, handF: { x: 54, y: -258 }, headR: lerp(16, 6, ramp(t, 27.2, 28)) + Math.sin(t * 0.9) * 2, smile: -0.35, lean: 3 });
      set(girl.glow, { opacity: 0.9 });
      qs.forEach((q, i) => { const k = ramp(t, q.t0, q.t0 + 0.35, E.back); const orb = a * 0.6 + i * 2.1; set(q.g, { opacity: f3(clamp(k * 2) * (1 - ramp(t, 30.9, 31.3))), transform: tr(q.x + Math.sin(orb) * 30, q.y + Math.cos(orb) * 20, lerp(0.5, 1, k), (i - 1) * 3) }); });
    },
  };
}
