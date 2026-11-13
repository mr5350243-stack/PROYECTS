// ESCENA 05 — TRES CONDICIONES (33.9 – 42.7 s)
// Tres columnas animadas: mucho interés · interés moderado · interés incierto (la tercera con «?»).
// Una figura femenina observa cada condición cuando la narración la nombra (34.1 · 36.6 · 39.3).
// Transición: las columnas se transforman en las barras del gráfico de la escena 06.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makePerson, drawPerson, ARMS } from '/ep01/src/characters.js';
import { HEART } from '../common.js';
import { CORAL } from '../style.js';

export const S05 = { start: 33.9, end: 42.7 };
export const COLS = [{ x: 210, col: CORAL, t: 34.1, label: 'MUCHO', sub: 'INTERÉS' }, { x: 540, col: C.orange, t: 36.6, label: 'MODERADO', sub: 'INTERÉS' }, { x: 870, col: C.yellow, t: 39.3, label: 'INCIERTO', sub: 'INTERÉS' }];
export const BASE_Y = 1120, COL_W = 250;

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  el('rect', { x: 0, y: BASE_Y, width: 1080, height: 12, fill: '#2a4796' }, layer);
  const cols = COLS.map((c, i) => {
    const g = el('g', {}, layer);
    const body = el('rect', { x: -COL_W / 2, y: 0, width: COL_W, height: 0, rx: 24, fill: '#16285e', stroke: c.col, 'stroke-width': 6 }, g);
    const icon = el('g', {}, g);
    if (i < 2) for (let k = 0; k < 3; k++) el('path', { d: HEART, fill: k < [3, 1][i] ? c.col : '#3a4f8f', transform: `translate(${(k - 1) * 62},0) scale(2)` }, icon);
    else el('text', { x: 0, y: 50, 'font-size': 190, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle' }, icon).textContent = '?';
    const l1 = el('text', { 'font-size': 38, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, g); l1.textContent = c.label;
    const l2 = el('text', { 'font-size': 24, 'font-weight': 800, fill: '#a9b3cf', 'text-anchor': 'middle', 'letter-spacing': 3 }, g); l2.textContent = c.sub;
    const glow = el('rect', { x: -COL_W / 2 - 10, y: 0, width: COL_W + 20, height: 0, rx: 30, fill: 'none', stroke: c.col, 'stroke-width': 4, opacity: 0 }, g);
    return { g, body, icon, l1, l2, glow, ...c, i };
  });
  const girl = makePerson(layer, { shirt: CORAL, pants: '#1d2b5c', skin: '#c98d63', hair: '#2a1b12', style: 3, shadow: '#000' });
  return {
    render(t, ctx) {
      const toBars = ramp(t, 41.7, 42.7, E.inOut);
      cols.forEach(c => {
        const k = ramp(t, 34.0 + c.i * 0.2, 34.6 + c.i * 0.2, E.backSoft);
        const H = lerp(620 * k, 150, toBars), top = BASE_Y - H;
        set(c.g, { transform: `translate(${c.x},0)` });
        set(c.body, { y: f1(top), height: f1(H), fill: toBars > 0.5 ? c.col : '#16285e', opacity: f3(1) });
        set(c.icon, { transform: `translate(0,${f1(top + 200)}) scale(${f3(ramp(t, c.t - 0.1, c.t + 0.35, E.back) * (1 - toBars))})` });
        set(c.l1, { x: 0, y: f1(top + 420), opacity: f3(ramp(t, c.t, c.t + 0.3) * (1 - toBars)) });
        set(c.l2, { x: 0, y: f1(top + 460), opacity: f3(ramp(t, c.t, c.t + 0.3) * (1 - toBars)) });
        const on = ramp(t, c.t, c.t + 0.3) * (1 - ramp(t, c.t + 2.3, c.t + 2.6));
        set(c.glow, { y: f1(top - 10), height: f1(H + 20), opacity: f3(on * (1 - toBars)) });
      });
      // la figura observa cada columna en su momento
      const tgt = t < 36.6 ? 0 : t < 39.3 ? 1 : 2;
      const pos = lerp(lerp(COLS[0].x, COLS[1].x, ramp(t, 36.3, 36.9, E.inOut)), COLS[2].x, ramp(t, 39.0, 39.6, E.inOut));
      const walking = (t > 36.3 && t < 36.9) || (t > 39.0 && t < 39.6);
      drawPerson(girl, { x: pos - 150, y: 1300, s: 0.9, face: 1, phase: t * 9, stride: walking ? 1 : 0, ...(tgt === 2 ? ARMS.chin() : ARMS.rest()), headR: -14, smile: tgt === 2 ? 0.1 : 0.6, opacity: 1 - toBars });
    },
  };
}
