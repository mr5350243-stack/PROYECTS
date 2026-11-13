// ESCENA 02 — LA ESPERA (7.95 – 19.8 s)
// Un reloj gira rápido (pasa el tiempo; el cielo de la ventana oscurece). «¿Le escribes?» → nuevo mensaje;
// «No responde». Ella revisa el teléfono una y otra vez. Pequeñas burbujas de pensamiento (con el perfil de la otra
// persona) se multiplican alrededor de su cabeza. Órbita suave de cámara (paralaje). «¿AMOR O INCERTIDUMBRE?» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeRoom, makeChat, makeGirl, makeAvatar } from '../common.js';
import { CORAL } from '../style.js';

export const S02 = { start: 7.95, end: 19.8 };
const SEAT = { x: 560, y: 1200 }, S = 1.4;
const CHECKS = [10.55, 11.55, 12.5];        // «Revisas el teléfono una y otra vez»

export function create(layer) {
  const cam = el('g', {}, layer);
  const room = makeRoom(cam);
  // reloj de pared
  const clock = el('g', { transform: 'translate(250,420)' }, room.back);
  el('circle', { r: 130, fill: C.white, stroke: C.ink, 'stroke-width': 14 }, clock);
  for (let i = 0; i < 12; i++) el('line', { x1: 0, y1: -112, x2: 0, y2: -96, stroke: C.ink, 'stroke-width': 6, transform: `rotate(${i * 30})` }, clock);
  const hH = el('line', { x1: 0, y1: 0, x2: 0, y2: -60, stroke: C.ink, 'stroke-width': 12, 'stroke-linecap': 'round' }, clock);
  const hM = el('line', { x1: 0, y1: 0, x2: 0, y2: -95, stroke: CORAL, 'stroke-width': 8, 'stroke-linecap': 'round' }, clock);
  el('circle', { r: 10, fill: C.ink }, clock);
  const girl = makeGirl(room.mid);
  const chat = makeChat(layer, '¿Estás ahí?');
  const noMsg = el('g', { opacity: 0 }, layer);
  el('rect', { x: -170, y: -32, width: 340, height: 64, rx: 32, fill: C.ink, opacity: 0.9 }, noMsg);
  el('text', { x: 0, y: 10, 'font-size': 28, 'font-weight': 800, fill: '#c9cfe0', 'text-anchor': 'middle' }, noMsg).textContent = 'Sin mensajes nuevos';
  const thoughts = el('g', {}, layer);
  const bubbles = Array.from({ length: 7 }, (_, i) => {
    const g = el('g', { opacity: 0 }, thoughts);
    el('circle', { r: 62, fill: '#f6f3ec' }, g);
    makeAvatar(g, { r: 46 });
    el('circle', { cx: -50, cy: 60, r: 12, fill: '#f6f3ec' }, g);
    return { g, a: -Math.PI / 2 + (i - 3) * 0.55, t0: 13.4 + i * 0.35, i };
  });
  return {
    render(t, ctx) {
      const ent = ramp(t, 7.95, 8.6, E.out5);
      // órbita suave: la pared se desplaza más que la protagonista (paralaje) y el encuadre gira ligeramente
      const orb = Math.sin((t - 8) * 0.45) * 1;
      set(room.back, { transform: `translate(${f1(-orb * 90)},0)` });
      set(cam, { transform: `translate(540,880) rotate(${f1(orb * 1.6)}) scale(${f3(lerp(1.6, 1.45, ent))}) translate(${f1(-580 + orb * 30)},-950)` });
      // el tiempo pasa: reloj veloz y cielo que oscurece
      const tt = (t - 8) * 2.4;
      set(hM, { transform: `rotate(${f1(tt * 360)})` }); set(hH, { transform: `rotate(${f1(tt * 30)})` });
      const night = ramp(t, 8, 19);
      set(room.sky, { fill: `rgb(${Math.round(lerp(58, 14, night))},${Math.round(lerp(78, 27, night))},${Math.round(lerp(150, 68, night))})` });
      // revisa el teléfono: lo levanta en cada comprobación, si no lo deja en el regazo
      const up = Math.max(0, ...CHECKS.map(c => ramp(t, c, c + 0.2, E.out) * (1 - ramp(t, c + 0.55, c + 0.8, E.inOut))), ramp(t, 8.2, 8.4) * (1 - ramp(t, 9.5, 9.8)));
      const hands = { handB: { x: lerp(60, 34, up), y: lerp(-150, -246, up) }, handF: { x: lerp(80, 54, up), y: lerp(-148, -258, up) } };
      const worry = ramp(t, 9.2, 10.0);
      drawPerson(girl.P, { x: SEAT.x, y: SEAT.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, ...hands, headR: lerp(24, 12, up) + Math.sin(t * 0.8) * 2, smile: lerp(0.4, -0.3, worry), lean: 2 });
      set(girl.glow, { opacity: f3(up) });
      // «¿Le escribes?» (8.24): mensaje nuevo · «No responde» (9.22): visto sin respuesta
      chat.show(t, 8.3, 560, 420, 9.25);
      set(chat.g, { opacity: f3(ramp(t, 8.3, 8.5) * (1 - ramp(t, 10.3, 10.6))) });
      const nm = Math.max(...CHECKS.map(c => ramp(t, c + 0.15, c + 0.3) * (1 - ramp(t, c + 0.6, c + 0.75))));
      set(noMsg, { opacity: f3(nm), transform: tr(560, 470 - 20 * nm, 1.2) });
      // «cuanto más dudas, más piensas en esa persona»: burbujas que se multiplican y giran
      bubbles.forEach(B => {
        const k = ramp(t, B.t0, B.t0 + 0.4, E.back) * (1 - ramp(t, 16.4, 16.9));
        const a = B.a + (t - 13) * 0.25;
        set(B.g, { opacity: f3(clamp(k * 2)), transform: tr(560 + Math.cos(a) * 360, 560 + Math.sin(a) * 230, lerp(0.3, 1.1 + 0.12 * (B.i % 2), k)) });
      });
    },
  };
}
