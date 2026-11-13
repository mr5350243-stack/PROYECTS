// ESCENA 06 — EL RESULTADO (42.5 – 50.2 s)
// Gráfico editorial (sin cifras ni porcentajes): la condición de incertidumbre registró mayor atracción.
// La tercera barra se destaca en amarillo y crece; la cámara la sigue. «MAYOR ATRACCIÓN» (fx_data).
// «…y pensaron más en esos hombres»: burbuja de pensamiento sobre la barra.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makeNote, } from '/ep02/src/common.js';
import { makeAvatar } from '../common.js';
import { COLS, BASE_Y, COL_W } from './s05.js';
import { CORAL } from '../style.js';

export const S06 = { start: 42.5, end: 50.2 };
const H = [430, 330, 640];     // alturas ilustrativas (solo el orden: la incertidumbre, la mayor)

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  el('rect', { x: -200, y: BASE_Y, width: 1480, height: 12, fill: '#2a4796' }, cam);
  el('line', { x1: 70, y1: BASE_Y, x2: 70, y2: 300, stroke: '#2a4796', 'stroke-width': 8, 'stroke-linecap': 'round' }, cam);
  el('path', { d: 'M 50 320 L 70 290 L 90 320', stroke: '#2a4796', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, cam);
  const ax = el('text', { x: 0, y: 0, 'font-size': 28, 'font-weight': 900, fill: '#a9b3cf', 'letter-spacing': 4, transform: 'translate(40,820) rotate(-90)', 'text-anchor': 'middle' }, cam); ax.textContent = 'ATRACCIÓN';
  const bars = COLS.map((c, i) => {
    const g = el('g', { transform: `translate(${c.x},0)` }, cam);
    const b = el('rect', { x: -COL_W / 2 + 20, y: BASE_Y - 150, width: COL_W - 40, height: 150, rx: 18, fill: i === 2 ? C.yellow : '#3a4f8f' }, g);
    const lab = el('text', { x: 0, y: BASE_Y + 60, 'font-size': 30, 'font-weight': 900, fill: i === 2 ? C.yellow : C.white, 'text-anchor': 'middle' }, g); lab.textContent = c.label;
    return { b, i };
  });
  const thought = el('g', { opacity: 0 }, cam);
  el('circle', { r: 90, fill: '#f6f3ec' }, thought); el('circle', { cx: -70, cy: 100, r: 18, fill: '#f6f3ec' }, thought); el('circle', { cx: -96, cy: 136, r: 10, fill: '#f6f3ec' }, thought);
  makeAvatar(thought, { r: 66 });
  const note = makeNote(layer, 'Ilustrativo · sin cifras', { dot: C.yellow });
  return {
    render(t, ctx) {
      const grow = ramp(t, 44.0, 46.6, E.inOut);
      bars.forEach(B => {
        const h = lerp(150, H[B.i], B.i === 2 ? ramp(t, 45.6, 47.2, E.backSoft) : grow);
        set(B.b, { y: f1(BASE_Y - h), height: f1(h), fill: B.i === 2 ? C.yellow : (t < 43.3 ? COLS[B.i].col : '#3a4f8f'), opacity: f3(B.i === 2 ? 1 : lerp(1, 0.9, ramp(t, 42.8, 43.4))) });
      });
      // la cámara sigue la barra destacada hacia arriba
      const follow = ramp(t, 45.8, 47.6, E.inOut);
      const topY = BASE_Y - H[2];
      set(cam, { transform: `translate(540,${f1(lerp(960, 700, follow))}) scale(${f3(lerp(1, 1.18, follow))}) translate(${f1(-lerp(540, COLS[2].x - 60, follow))},${f1(-lerp(860, topY + 160, follow))})` });
      const th = ramp(t, 47.7, 48.1, E.back);
      set(thought, { opacity: f3(clamp(th * 2)), transform: tr(COLS[2].x - 40, topY - 150, lerp(0.4, 1, th) * (1 + 0.03 * Math.sin(t * 4))) });
      note.show(t, 44.2, 50.0, 540, 1260);
    },
  };
}
