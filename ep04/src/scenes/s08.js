// ESCENA 08 — CONCLUSIÓN (71.0 – 82.0 s)
// La pareja conversando en una composición equilibrada (misma luz para ambos). Surgen «RESPETO», «LÍMITES» y
// «RECIPROCIDAD». Texto final «¿CUÁL ES LA PEOR SEÑAL?» (fx_data) con las cinco tarjetas. Logo y fundido.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeWoman, makeMan, makeLiving, makeChair, makeTable, makeCard } from '../common.js';
import { CORAL } from '../style.js';

export const S08 = { start: 71.0, end: 82.0 };
const W = { x: 330, y: 1180 }, M = { x: 750, y: 1180 }, S = 1.3;

export function create(layer) {
  const cam = el('g', {}, layer);
  makeLiving(cam);
  const chW = makeChair(cam, 1), chM = makeChair(cam, -1);
  set(chW, { transform: `translate(${W.x},${W.y})` }); set(chM, { transform: `translate(${M.x},${M.y}) scale(-1,1)` });
  const woman = makeWoman(cam), man = makeMan(cam);
  const table = makeTable(cam); set(table, { transform: 'translate(540,1180)' });
  const words = [['RESPETO', C.white, 72.0], ['LÍMITES', C.yellow, 74.28], ['RECIPROCIDAD', CORAL, 75.0]].map(([s, col, t0], i) => { const t = el('text', { 'font-size': 64, 'font-weight': 900, fill: col, 'text-anchor': 'middle', stroke: C.ink, 'stroke-width': 8, 'paint-order': 'stroke', opacity: 0 }, layer); t.textContent = s; return { t, t0, i }; });
  const dim = el('rect', { width: 1080, height: 1920, fill: C.navy, opacity: 0 }, layer);
  const cards = [0, 1, 2, 3, 4].map(i => { const c = makeCard(layer, i); set(c.g, { opacity: 0 }); return c; });
  const brand = el('g', { opacity: 0 }, layer);
  el('rect', { x: -80, y: -80, width: 160, height: 160, rx: 40, fill: C.orange }, brand);
  el('text', { x: 0, y: 46, 'font-size': 128, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, brand).textContent = '?';
  el('circle', { cx: 62, cy: -62, r: 22, fill: C.yellow, stroke: C.navy, 'stroke-width': 6 }, brand);
  el('text', { x: 0, y: 160, 'font-size': 44, 'font-weight': 800, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 10 }, brand).textContent = 'DETRÁS DEL';
  el('text', { x: 0, y: 250, 'font-size': 104, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle' }, brand).textContent = 'PORQUÉ';
  const black = el('rect', { width: 1080, height: 1920, fill: '#000', opacity: 0 }, layer);
  return {
    render(t, ctx) {
      const ent = ramp(t, 71.0, 71.7, E.out5);
      set(cam, { transform: `translate(540,880) scale(${f3(lerp(1.3, 1.42, ramp(t, 71, 76.5)))}) translate(-540,-940)`, opacity: f3(ent) });
      // conversación tranquila y equilibrada: ambos gesticulan por turnos y sonríen
      const tw = Math.sin(t * 1.4) > 0, g1 = tw ? Math.sin(t * 7) * 12 : 0, g2 = tw ? 0 : Math.sin(t * 7) * 12;
      drawPerson(woman, { x: W.x, y: W.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 60, y: -160 }, handF: { x: 100 + g1, y: -200 - g1 }, headR: -2 + Math.sin(t) * 2, smile: 0.7 });
      drawPerson(man, { x: M.x, y: M.y, s: S, face: -1, sit: 1, phase: 0, stride: 0, handB: { x: 60, y: -160 }, handF: { x: 100 + g2, y: -200 - g2 }, headR: -2 + Math.sin(t + 1) * 2, smile: 0.7 });
      words.forEach(w => { const k = ramp(t, w.t0, w.t0 + 0.4, E.back); set(w.t, { x: 540, y: 330 + w.i * 90, opacity: f3(clamp(k * 2) * (1 - ramp(t, 76.2, 76.6))), transform: `translate(540,${330 + w.i * 90}) scale(${f3(lerp(0.5, 1, k))}) translate(-540,${-(330 + w.i * 90)})` }); });
      // pregunta final con las cinco tarjetas
      const q = ramp(t, 76.5, 77.1, E.inOut);
      set(dim, { opacity: f3(0.88 * q) });
      cards.forEach((c, i) => { const k = ramp(t, 77.0 + i * 0.12, 77.4 + i * 0.12, E.back); set(c.g, { opacity: f3(clamp(k * 2) * (1 - ramp(t, 80.0, 80.3))), transform: tr(140 + i * 200, 900 + Math.abs(i - 2) * 30, lerp(0.4, 0.82, k), (i - 2) * 5) }); });
      const bk = ramp(t, 80.3, 80.8, E.back);
      set(brand, { opacity: f3(clamp(bk * 2) * (1 - ramp(t, 81.4, 81.8))), transform: tr(540, 820, lerp(0.5, 1.1, bk), lerp(-8, 0, bk)) });
      set(black, { opacity: f3(ramp(t, 81.6, 82.0)) });
      ctx.capHide = ramp(t, 80.2, 80.4);
    },
  };
}
