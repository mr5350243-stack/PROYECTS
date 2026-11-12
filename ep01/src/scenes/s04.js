// ESCENA 04 — ALGO INESPERADO (33.75 – 43.0 s)
// El partido sigue; la figura disfrazada de gorila cruza la cancha sin ningún realce. Luego la escena se congela,
// aparecen las huellas de su recorrido y la cámara se acerca al lugar por donde pasó. «¿LO NOTASTE?» e «INCREÍBLE» (fx_data).
// Final: la cancha se encoge en un círculo que se convierte en el gráfico de la escena 05.
import { el, set, clamp, lerp, ramp, E, C, f1, f3 } from '../lib.js';
import { makeGame, proj } from '../court.js';
import { GAME, FREEZE } from './game_opts.js';
import { makeCounter } from './s03.js';

export const S04 = { start: 33.75, end: 43.05 };
export const CHART = { x: 540, y: 800, r: 230 };

export function create(layer) {
  const clipC = el('circle', { cx: CHART.x, cy: CHART.y, r: 3000 }, el('clipPath', { id: 's04clip' }, layer));
  const root = el('g', { 'clip-path': 'url(#s04clip)' }, layer);
  const cam = el('g', {}, root);
  const game = makeGame(cam, GAME);
  // huellas del recorrido (sobre el suelo, en perspectiva)
  const prints = [];
  const pg = el('g', {}, cam);
  for (let i = 0; i < 16; i++) {
    const u = lerp(1.25, -1.25, i / 15), v = 0.44 + (i % 2 ? 0.025 : -0.025), p = proj(u, v);
    prints.push(el('ellipse', { cx: f1(p.x), cy: f1(p.y), rx: f1(22 * p.s), ry: f1(9 * p.s), fill: C.yellow, opacity: 0 }, pg));
  }
  const dim = el('rect', { x: -500, y: -500, width: 2080, height: 2920, fill: C.ink, opacity: 0 }, root);
  root.appendChild(pg);
  const ring = el('circle', { cx: CHART.x, cy: CHART.y, r: 0, fill: 'none', stroke: C.navy3, 'stroke-width': 54, opacity: 0 }, layer);
  const counter = makeCounter(layer);
  const base = game.render(27.3).whiteCount;
  return {
    render(t, ctx) {
      const tc = Math.min(t, FREEZE);
      const r = game.render(tc);
      const zoom = ramp(t, FREEZE + 0.1, 42.0, E.inOut);
      const fp = proj(0, 0.44);
      set(cam, { transform: `translate(${f1(fp.x)},${f1(fp.y)}) scale(${f3(1 + 0.32 * zoom)}) translate(${f1(-fp.x)},${f1(-fp.y)})` });
      // congelado: la escena se oscurece un poco y aparecen las huellas de derecha a izquierda
      set(dim, { opacity: f3(0.45 * ramp(t, FREEZE, FREEZE + 0.25)) });
      prints.forEach((p, i) => set(p, { opacity: f3(0.9 * ramp(t, FREEZE + 0.15 + i * 0.05, FREEZE + 0.3 + i * 0.05)) }));
      set(pg, { transform: cam.getAttribute('transform') });
      // contador: se mantiene hasta el congelado
      counter.render(t, Math.max(0, r.whiteCount - base), 1 - ramp(t, FREEZE, FREEZE + 0.3));   // continúa la cuenta de la escena 03
      // salida: la cancha se encoge en un círculo → anillo del gráfico
      const shrink = ramp(t, 42.2, 42.95, E.inOut);
      set(clipC, { r: f1(lerp(1500, CHART.r, shrink)) });
      set(ring, { r: CHART.r, opacity: f3(ramp(t, 42.7, 42.95)) });
    },
  };
}
