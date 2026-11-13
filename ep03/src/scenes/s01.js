// ESCENA 01 — LA PREGUNTA (0 – 8.3 s)
// Una joven mira su teléfono; una burbuja de mensaje aparece frente a ella y queda sin respuesta («Visto»).
// La cámara se acerca a su expresión. «¿POR QUÉ TE ATRAE?» (fx_data). El teléfono se transforma en un signo de
// interrogación que abre la escena 02.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeRoom, makeChat, makeGirl } from '../common.js';
import { makeGeoWipe } from '/ep01/src/transitions.js';
import { CORAL } from '../style.js';

export const S01 = { start: 0, end: 8.5 };
const SEAT = { x: 520, y: 1180 }, S = 1.25;

export function create(layer) {
  const cam = el('g', {}, layer);
  const room = makeRoom(cam);
  const girl = makeGirl(room.mid);
  const chat = makeChat(layer, '¿Nos vemos mañana?');
  // teléfono → interrogación
  const big = el('g', { opacity: 0 }, layer);
  const phone = el('g', {}, big);
  el('rect', { x: -120, y: -210, width: 240, height: 420, rx: 34, fill: C.ink }, phone);
  el('rect', { x: -100, y: -186, width: 200, height: 372, rx: 14, fill: '#3a5cb8' }, phone);
  const q = el('text', { x: 0, y: 150, 'font-size': 520, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle', stroke: C.ink, 'stroke-width': 30, 'paint-order': 'stroke', opacity: 0 }, big); q.textContent = '?';
  const wipe = makeGeoWipe(el('g', {}, layer), [C.yellow, CORAL, C.navy]);
  return {
    render(t, ctx) {
      const ent = ramp(t, 0, 0.8, E.out);
      // cámara: plano medio → acercamiento a su expresión
      const push = ramp(t, 3.8, 7.2, E.inOut);
      const head = { x: SEAT.x + 4 * S, y: SEAT.y - 252 * S };
      const cx = lerp(580, head.x, push), cy = lerp(950, head.y + 40, push), z = lerp(1.42, 1.35, ent) * lerp(1, 1.75, push);
      set(cam, { transform: `translate(540,${f1(lerp(900, 820, push))}) scale(${f3(z)}) translate(${f1(-cx)},${f1(-cy)})`, opacity: f3(ent) });
      // expresión: ilusión al enviar → espera → decepción
      const sad = ramp(t, 4.2, 6.0, E.inOut);
      drawPerson(girl.P, { x: SEAT.x, y: SEAT.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 34, y: -246 }, handF: { x: 54, y: -258 }, headR: lerp(10, 16, sad) + Math.sin(t * 0.9) * 1.5, smile: lerp(0.8, -0.35, sad), lean: lerp(0, 3, sad) });
      set(girl.glow, { opacity: f3(0.8 + 0.2 * Math.sin(t * 3)) });
      set(girl.P.held, { opacity: f3(1 - ramp(t, 7.15, 7.3)) });
      // la burbuja: enviada (0.3) → vista (1.7) → «escribiendo…» que desaparece (sin respuesta)
      chat.show(t, 0.35, lerp(420, 300, push), lerp(500, 300, push), 1.7);
      chat.typing(t, 2.9, 4.1);
      set(chat.g, { opacity: f3(ramp(t, 0.35, 0.6) * (1 - ramp(t, 6.8, 7.2))) });
      // el teléfono sale de su mano y se convierte en «?»
      const k = ramp(t, 7.1, 8.0, E.inOut);
      const hand = { x: 540 + (SEAT.x + 54 * S - cx) * z, y: lerp(900, 820, push) + (SEAT.y - 262 * S + 70 * S - cy) * z };
      set(big, { opacity: f3(ramp(t, 7.1, 7.2)), transform: tr(lerp(hand.x, 540, k), lerp(hand.y, 760, k), lerp(0.35 * z / 1.75, 1, k), lerp(-70, 0, k)) });
      set(phone, { opacity: f3(1 - ramp(t, 7.55, 7.8)), transform: `scale(${f3(lerp(1, 0.4, ramp(t, 7.5, 7.8)))})` });
      set(q, { opacity: f3(ramp(t, 7.55, 7.8)), transform: `scale(${f3(lerp(0.4, 1, ramp(t, 7.55, 8.0, E.back)))})` });
      wipe(t, 7.95, 540, 760);
    },
  };
}
