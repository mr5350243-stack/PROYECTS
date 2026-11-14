// ESCENA 02 — LOS PLANES (9.0 – 11.9 s)
// Dentro del teléfono: el calendario con la cita marcada («hicieron planes para verse»). La protagonista se prepara
// para salir (se mira y elige una chaqueta). El calendario se transforma en la pantalla de mensajes, ahora vacía.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeRoom, makeGirl, makeBigPhone } from '../common.js';
import { CORAL } from '../style.js';

export const S02 = { start: 9.0, end: 11.9 };

export function create(layer) {
  const roomCam = el('g', {}, layer);
  const room = makeRoom(roomCam);
  // espejo de pie y chaqueta
  const mirror = el('g', { transform: 'translate(860,1180)' }, room.mid);
  el('rect', { x: -90, y: -560, width: 180, height: 540, rx: 90, fill: '#c9d4f2', stroke: '#f6f3ec', 'stroke-width': 14 }, mirror);
  el('path', { d: 'M -40 -480 L 40 -400', stroke: '#fff', 'stroke-width': 10, opacity: 0.6, 'stroke-linecap': 'round' }, mirror);
  const girl = makeGirl(room.mid);
  set(girl.P.held, { opacity: 0 });
  const jacket = el('path', { d: 'M -40 -60 L 40 -60 L 50 50 L -50 50 Z', fill: '#ffc93c' }, girl.P.held);
  const ph = makeBigPhone(layer);
  return {
    render(t, ctx) {
      // el calendario dentro del teléfono (9.0–10.3) → ella se prepara (10.3–11.3) → pantalla de mensajes vacía
      const cal = 1 - ramp(t, 10.15, 10.4);
      const ready = ramp(t, 10.2, 10.5) * (1 - ramp(t, 11.15, 11.4));
      const back = ramp(t, 11.15, 11.9, E.inOut);
      set(ph.cal, { opacity: f3(1 - back * 0) }); set(ph.chat, { opacity: 0 }); set(ph.call, { opacity: 0 });
      const d = ph.days[19], mk = ramp(t, 9.5, 9.85, E.back);
      set(ph.mark, { cx: d.x, cy: d.y, r: f1(40 * mk) });
      set(ph.plan, { opacity: f3(ramp(t, 9.75, 10.0)), transform: `translate(0,${f1(20 * (1 - ramp(t, 9.75, 10.05, E.out)))})` });
      set(ph.g, { opacity: f3(cal * (1 - 0) + back), transform: tr(540, 760, lerp(1.6, 0.98, ramp(t, 9.0, 9.5, E.out5)) * (1 - 0.0 * back)) });
      if (back > 0) { set(ph.cal, { opacity: f3(1 - back) }); set(ph.chat, { opacity: f3(back) }); ph.status.textContent = 'últ. vez hoy a las 9:12'; }
      set(roomCam, { transform: 'translate(540,900) scale(1.35) translate(-640,-950)', opacity: f3(ready) });
      drawPerson(girl.P, { x: 700, y: 1260, s: 1.3, face: 1, phase: 0, stride: 0, handB: { x: 40, y: -200 }, handF: { x: 60 + Math.sin(t * 8) * 10, y: -240 }, headR: -4, smile: 0.95 });
    },
  };
}
