// ESCENA 09 — EL TELÉFONO (78.0 – 83.2 s) · ejemplo cotidiano ilustrativo
// Una joven lee un mensaje en su teléfono. Mientras está concentrada, una planta de la estantería del fondo cambia
// de sitio; la cámara lo muestra sin exagerarlo y ella sigue leyendo. «NO LO NOTÓ» (fx_data).
// El teléfono gira y se transforma en la pantalla de laboratorio de la escena 10.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '../lib.js';
import { makePerson, drawPerson, ARMS } from '../characters.js';
import { icon } from '../icons.js';

export const S09 = { start: 78.0, end: 83.2 };
const GIRL = { x: 400, y: 1660, s: 1.72 };

export function create(layer) {
  const cam = el('g', {}, layer);
  el('rect', { x: -500, y: -400, width: 2100, height: 2000, fill: '#22376f' }, cam);
  el('rect', { x: -500, y: 1400, width: 2100, height: 900, fill: '#16285e' }, cam);
  el('rect', { x: -500, y: 1392, width: 2100, height: 16, fill: '#0b1636' }, cam);
  // cuadro y lámpara de pie
  const fr = el('g', { transform: 'translate(170,600)' }, cam);
  el('rect', { x: -110, y: -140, width: 220, height: 280, rx: 8, fill: C.white }, fr); el('rect', { x: -92, y: -122, width: 184, height: 244, fill: C.orange }, fr);
  el('circle', { cx: 0, cy: -20, r: 48, fill: C.yellow }, fr);
  // estantería del fondo con la planta que cambia de sitio
  const shelf = el('g', { transform: 'translate(0,0)' }, cam);
  el('rect', { x: 560, y: 820, width: 460, height: 22, rx: 8, fill: '#0b1636' }, shelf);
  icon(shelf, 'book', { transform: 'translate(700,776) scale(0.7)' }); icon(shelf, 'clock', { transform: 'translate(820,770) scale(0.55)' });
  const plant = icon(shelf, 'plant', { transform: 'translate(620,760) scale(0.85)' });
  el('rect', { x: 560, y: 1080, width: 460, height: 22, rx: 8, fill: '#0b1636' }, shelf);
  icon(shelf, 'mug', { transform: 'translate(640,1040) scale(0.6)' }); icon(shelf, 'star', { transform: 'translate(930,1030) scale(0.5)' });
  const girl = makePerson(cam, { shirt: C.orange, pants: '#1d2b5c', skin: '#c98d63', hair: '#14110f', style: 3, shadow: '#000' });
  const ph = el('g', { transform: 'rotate(-70) scale(0.36)' }, girl.held); icon(ph, 'phone');
  const glow = el('circle', { r: 70, fill: '#9fd3ff', opacity: 0.25, filter: 'url(#soft)' }, girl.held);
  // teléfono grande para la transición
  const big = el('g', { opacity: 0 }, layer);
  el('rect', { x: -120, y: -210, width: 240, height: 420, rx: 34, fill: C.ink }, big);
  const bscr = el('rect', { x: -100, y: -186, width: 200, height: 372, rx: 14, fill: '#3a5cb8' }, big);
  const msgs = el('g', {}, big);
  [[-60, -140, 120, C.white], [-20, -90, 110, C.yellow], [-60, -40, 140, C.white], [-20, 10, 100, C.yellow]].forEach(([x, y, w, c]) => el('rect', { x, y, width: w, height: 36, rx: 18, fill: c }, msgs));
  return {
    render(t, ctx) {
      // la joven lee: cabeza inclinada, respiración lenta, pulgar que desliza
      const sc = Math.sin(t * 3) * 3;
      drawPerson(girl, { ...GIRL, face: 1, phase: 0, stride: 0, handB: { x: 34 + sc, y: -246 }, handF: { x: 54, y: -258 }, headR: 14 + Math.sin(t * 0.8) * 2, lean: Math.sin(t * 1.1) * 1.2, smile: 0.6 });
      set(glow, { opacity: f3(0.22 + 0.05 * Math.sin(t * 4)) });
      // el cambio en el fondo (con «cambio» 81.4 s): la planta se desplaza a la otra punta de la estantería
      const mv = ramp(t, 80.7, 81.5, E.inOut);
      set(plant, { transform: `translate(${f1(lerp(620, 960, mv))},${f1(760 - Math.sin(mv * Math.PI) * 14)}) scale(0.85)` });
      // cámara: plano medio de ella; deriva suave hacia la estantería durante el cambio y vuelve
      const look = ramp(t, 80.3, 80.9, E.inOut) * (1 - ramp(t, 81.7, 82.3, E.inOut));
      const push = ramp(t, 82.35, 83.2, E.inExpo);
      const cx = lerp(560, 760, look), cy = lerp(1080, 930, look), z = lerp(1.08, 1.0, ramp(t, 78, 80)) * lerp(1, 1.12, look);
      set(cam, { transform: `translate(540,960) scale(${f3(z * lerp(1, 1.6, push))}) translate(${f1(-cx)},${f1(-cy)})` });
      // transición: el teléfono sale de su mano, gira 90° y crece hasta convertirse en pantalla
      const hand = { x: 540 + (GIRL.x + 52 * GIRL.s - cx) * z, y: 960 + (GIRL.y - 262 * GIRL.s - cy) * z };
      const k = ramp(t, 82.25, 83.2, E.inOut);
      set(big, { opacity: f3(ramp(t, 82.25, 82.4)), transform: tr(lerp(hand.x, 540, k), lerp(hand.y, 820, k), lerp(0.3, 5.5, ramp(t, 82.25, 83.2, E.inExpo)), lerp(-70, -90, k)) });
      set(bscr, { fill: k > 0.7 ? '#0b1636' : '#3a5cb8' }); set(msgs, { opacity: f3(1 - ramp(t, 82.7, 82.95)) });
    },
  };
}
