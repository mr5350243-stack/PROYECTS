// ESCENA 01 — LA CONEXIÓN (0 – 9.3 s)
// Primer fotograma: un teléfono en primer plano; llega «Buenos días ♥». La cámara se aleja y revela a la protagonista
// sonriendo. Se suceden conversaciones y una videollamada («hablaron durante horas»). La cámara vuelve rápido al teléfono.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeRoom, makeGirl, makeBigPhone, phoneMsg } from '../common.js';

export const S01 = { start: 0, end: 9.3 };
const SEAT = { x: 520, y: 1180 }, S = 1.3;

export function create(layer) {
  const roomCam = el('g', {}, layer);
  const room = makeRoom(roomCam);
  const girl = makeGirl(room.mid);
  const ph = makeBigPhone(layer);
  const msgs = [
    phoneMsg(ph.chat, { w: 330, text: 'Buenos días', heart: true }), phoneMsg(ph.chat, { w: 300, out: true, lines: 1 }), phoneMsg(ph.chat, { w: 340, lines: 2 }),
    phoneMsg(ph.chat, { w: 260, out: true, lines: 2 }), phoneMsg(ph.chat, { w: 300, lines: 1 }), phoneMsg(ph.chat, { w: 320, out: true, lines: 2 }),
  ];
  const MT = [0.35, 4.9, 5.5, 6.0, 6.5, 7.0];
  return {
    render(t, ctx) {
      // teléfono: primer plano → se aparta (revela a la protagonista) → vuelve a ocupar el plano
      const away = ramp(t, 2.6, 3.6, E.inOut) * (1 - ramp(t, 4.6, 5.2, E.inOut));
      const back = ramp(t, 8.3, 9.3, E.inExpo);
      const callK = ramp(t, 7.5, 7.8);
      set(ph.g, { transform: tr(lerp(540, 820, away), lerp(760, 1080, away), lerp(0.98, 0.4, away) * lerp(1, 1.6, back), lerp(0, 8, away)) });
      // conversación: los mensajes se apilan desde abajo
      const n = MT.filter(m => t >= m).length;
      msgs.forEach((m, i) => {
        const k = ramp(t, MT[i], MT[i] + 0.3, E.back);
        const slot = n - 1 - i;      // el más reciente abajo
        const out = i % 2 === 1;
        set(m, { opacity: f3(clamp(k * 2)), transform: `translate(${out ? 225 : -225},${f1(330 - slot * 120 + 20 * (1 - k))}) scale(${f3(lerp(0.6, 1, k))})` });
      });
      set(ph.chat, { opacity: f3(1 - callK) }); set(ph.call, { opacity: f3(callK) });
      set(ph.status, { textContent: '' }); ph.status.textContent = t < 7.5 ? 'en línea' : 'videollamada · 1:24:07';
      // la protagonista sonríe (visible cuando el teléfono se aparta)
      set(roomCam, { transform: `translate(540,900) scale(1.4) translate(-580,-950)`, opacity: f3(ramp(t, 2.5, 3.0) * (1 - ramp(t, 5.0, 5.4))) });
      drawPerson(girl.P, { x: SEAT.x, y: SEAT.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 34, y: -246 }, handF: { x: 54, y: -258 }, headR: 10 + Math.sin(t) * 2, smile: 1 });
      set(girl.glow, { opacity: 0.9 });
    },
  };
}
