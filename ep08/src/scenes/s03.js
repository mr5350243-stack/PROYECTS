// ESCENA 03 — EL SILENCIO (11.6 – 18.9 s)
// El teléfono, inmóvil sobre la mesilla. Un reloj avanza. Ella revisa la pantalla («nada… no responde… no llama»).
// La iluminación pasa de cálida a fría. «¿QUÉ CAMBIÓ?» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeRoom, makeGirl, makeBigPhone } from '../common.js';

export const S03 = { start: 11.6, end: 18.9 };
const SEAT = { x: 480, y: 1180 }, S = 1.35;
const CHECKS = [12.6, 13.7, 14.8];

export function create(layer) {
  const cam = el('g', {}, layer);
  const room = makeRoom(cam);
  const clock = el('g', { transform: 'translate(250,430)' }, room.back);
  el('circle', { r: 110, fill: C.white, stroke: C.ink, 'stroke-width': 12 }, clock);
  const hM = el('line', { x1: 0, y1: 0, x2: 0, y2: -80, stroke: '#ff7a6b', 'stroke-width': 8, 'stroke-linecap': 'round' }, clock);
  const hH = el('line', { x1: 0, y1: 0, x2: 0, y2: -52, stroke: C.ink, 'stroke-width': 11, 'stroke-linecap': 'round' }, clock);
  el('circle', { r: 9, fill: C.ink }, clock);
  // mesilla con el teléfono boca arriba
  const night = el('g', { transform: 'translate(840,1180)' }, room.mid);
  el('rect', { x: -90, y: -160, width: 180, height: 160, rx: 10, fill: '#3a4f8f' }, night);
  const lying = el('g', { transform: 'translate(0,-172) scale(0.32,0.12)' }, night); icon(lying, 'phone');
  const girl = makeGirl(room.mid);
  const cold = el('rect', { x: -800, y: -600, width: 2700, height: 2600, fill: '#5a8cff', opacity: 0, 'mix-blend-mode': 'multiply' }, cam);
  const coldTint = el('rect', { width: 1080, height: 1920, fill: '#0b2a6e', opacity: 0 }, layer);
  const ph = makeBigPhone(layer);
  ph.status.textContent = 'últ. vez hoy a las 9:12';
  set(ph.chat, { opacity: 1 });
  const empty = el('text', { x: 0, y: 40, 'font-size': 34, 'font-weight': 800, fill: '#8a93ad', 'text-anchor': 'middle' }, ph.chat); empty.textContent = 'Sin mensajes nuevos';
  return {
    render(t, ctx) {
      const ent = ramp(t, 11.6, 12.0);
      set(cam, { transform: `translate(540,900) scale(${f3(lerp(1.3, 1.45, ramp(t, 11.6, 18.9)))}) translate(-600,-960)` });
      const tt = (t - 11.6) * 1.6;
      set(hM, { transform: `rotate(${f1(tt * 360)})` }); set(hH, { transform: `rotate(${f1(tt * 30)})` });
      // revisa el teléfono en cada comprobación (primer plano breve de la pantalla vacía)
      const up = Math.max(...CHECKS.map(c => ramp(t, c, c + 0.15, E.out) * (1 - ramp(t, c + 0.6, c + 0.75, E.inOut))));
      drawPerson(girl.P, { x: SEAT.x, y: SEAT.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: lerp(60, 34, up), y: lerp(-150, -246, up) }, handF: { x: lerp(80, 54, up), y: lerp(-148, -258, up) }, headR: lerp(20, 12, up) + Math.sin(t * 0.8) * 2, smile: lerp(0.1, -0.4, ramp(t, 12, 17)), lean: 3 });
      set(girl.glow, { opacity: f3(up) });
      set(ph.g, { opacity: f3(Math.max(up, 1 - ramp(t, 11.6, 12.0))), transform: tr(540, 760, lerp(0.9, 0.98, up)) });
      // de cálida a fría
      set(coldTint, { opacity: f3(0.32 * ramp(t, 12.5, 17.5, E.inOut)) });
    },
  };
}
