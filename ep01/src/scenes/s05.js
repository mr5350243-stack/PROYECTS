// ESCENA 05 — EL RESULTADO (42.9 – 54.45 s)
// La cancha se ha convertido en un anillo: gráfico circular editorial. «46 %» (TIPO C, fx_data) con la porción iluminada.
// Texto secundario «NO DETECTARON EL EVENTO» y nota «Resultado agregado de distintas condiciones experimentales.»
// Con «¿Cómo es posible?» el número se deshace en partículas que forman un cerebro ilustrado.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, rng } from '../lib.js';
import { makeBrain, brainPoints } from '../brain.js';
import { CHART } from './s04.js';

export const S05 = { start: 42.9, end: 54.45 };
export const BRAIN_AT = { x: 540, y: 860, s: 1.25 };

export function create(layer) {
  const track = el('circle', { cx: CHART.x, cy: CHART.y, r: CHART.r, fill: 'none', stroke: C.navy3, 'stroke-width': 54 }, layer);
  // etiqueta y nota
  const label = el('g', { opacity: 0 }, layer);
  el('rect', { x: -330, y: -46, width: 660, height: 92, rx: 46, fill: C.orange }, label);
  const lt = el('text', { x: 0, y: 16, 'font-size': 44, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 1 }, label); lt.textContent = 'NO DETECTARON EL EVENTO';
  const note = el('text', { x: 540, y: 1235, 'font-size': 27, 'font-weight': 800, fill: C.grey, 'text-anchor': 'middle', opacity: 0 }, layer);
  note.textContent = 'Resultado agregado de distintas condiciones experimentales.';
  // 50 iconos de participantes: 23 (46 %) quedan apagados
  const icons = el('g', { opacity: 0 }, layer), people = [];
  for (let i = 0; i < 50; i++) {
    const cx = 540 + ((i % 25) - 12) * 34, cy = 1330 + Math.floor(i / 25) * 0;
    const g = el('g', { transform: `translate(${cx},${cy + Math.floor(i / 25) * 46 - 23})` }, icons);
    el('circle', { cx: 0, cy: -16, r: 8, fill: C.white }, g); el('path', { d: 'M -11 12 Q -11 -4 0 -4 Q 11 -4 11 12 Z', fill: C.white }, g);
    people.push(g);
  }
  // partículas → cerebro
  const R = rng(5), pts = brainPoints(150);
  const parts = pts.map((p, i) => {
    const a = R() * Math.PI * 2, rr = R() < 0.55 ? CHART.r + (R() - 0.5) * 40 : R() * 130;
    return { c: el('circle', { r: 5 + R() * 6, fill: [C.yellow, C.orange, C.white][i % 3], opacity: 0 }, layer),
      sx: CHART.x + Math.cos(a) * rr, sy: CHART.y + Math.sin(a) * rr, tx: BRAIN_AT.x + p.x * BRAIN_AT.s, ty: BRAIN_AT.y + p.y * BRAIN_AT.s, d: R() * 0.25, sw: (R() - 0.5) * 300 };
  });
  const brainG = el('g', { opacity: 0 }, layer);
  const brain = makeBrain(brainG);
  return {
    render(t, ctx) {
      const out = ramp(t, 52.8, 53.2);
      set(track, { opacity: f3(1 - out) });
      const lk = ramp(t, 48.45, 48.9, E.back);
      set(label, { opacity: f3(clamp(lk * 2) * (1 - out)), transform: tr(540, 1120 + 30 * (1 - lk), lerp(0.6, 1, lk), lerp(-5, -1.5, lk)) });
      set(note, { opacity: f3(ramp(t, 43.4, 43.9) * (1 - out)) });
      set(icons, { opacity: f3(ramp(t, 44.0, 44.5) * (1 - out)) });
      people.forEach((g, i) => set(g, { opacity: i < 23 ? f3(lerp(1, 0.25, ramp(t, 48.5 + i * 0.02, 48.8 + i * 0.02))) : 1 }));
      parts.forEach(p => {
        const k = ramp(t, 52.95 + p.d, 53.95 + p.d, E.inOut);
        const x = lerp(p.sx, p.tx, k) + Math.sin(k * Math.PI) * p.sw, y = lerp(p.sy, p.ty, k) - Math.sin(k * Math.PI) * 120;
        set(p.c, { cx: f1(x), cy: f1(y), opacity: f3(ramp(t, 52.9, 53.05) * (1 - ramp(t, 54.0, 54.3))) });
      });
      const bk = ramp(t, 53.85, 54.3, E.backSoft);
      set(brainG, { opacity: f3(bk), transform: tr(BRAIN_AT.x, BRAIN_AT.y, BRAIN_AT.s * lerp(0.92, 1, bk)) });
    },
  };
}
