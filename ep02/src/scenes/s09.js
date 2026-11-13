// ESCENA 09 — LA PLANIFICACIÓN (85.8 – 91.3 s)
// Escritorio con calendario, reloj y documentos que se ordenan con movimientos fluidos. Travelling lateral.
// Una balanza aparece al fondo. «PLANIFICACIÓN Y CONCIENCIA» (fx_data). Nota de rigor: es la interpretación de otros
// peritos y planificar no descarta por sí solo un trastorno.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, rng } from '/ep01/src/lib.js';
import { icon } from '/ep01/src/icons.js';
import { makeDoc } from '../docs.js';
import { makeScale, makeNote } from '../common.js';
import { RED, GREY, PAPER } from '../style.js';

export const S09 = { start: 85.8, end: 91.3 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  const back = el('g', {}, cam);
  el('rect', { x: -800, y: -400, width: 3000, height: 1500, fill: '#16285e' }, back);
  const sc = makeScale(el('g', { transform: 'translate(1080,560) scale(0.75)', opacity: 0.9 }, back));
  const scG = sc.g.parentNode;
  el('rect', { x: -800, y: 1000, width: 3000, height: 1200, fill: 'url(#deskTop)' }, cam);
  el('rect', { x: -800, y: 990, width: 3000, height: 16, fill: '#2a3a6e' }, cam);
  // calendario con días marcados
  const cal = el('g', {}, cam);
  el('rect', { x: -170, y: -150, width: 340, height: 300, rx: 14, fill: PAPER }, cal);
  el('rect', { x: -170, y: -150, width: 340, height: 60, rx: 14, fill: RED }, cal);
  const marks = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { el('rect', { x: -150 + c * 52, y: -76 + r * 52, width: 40, height: 40, rx: 6, fill: '#d9d1bc' }, cal); if ((r * 6 + c) % 5 === 2) marks.push(el('circle', { cx: -130 + c * 52, cy: -56 + r * 52, r: 0, fill: 'none', stroke: RED, 'stroke-width': 5 }, cal)); }
  const clock = icon(cam, 'clock');
  const hand = el('line', { x1: 0, y1: 0, x2: 0, y2: -46, stroke: RED, 'stroke-width': 6, 'stroke-linecap': 'round' }, clock);
  const R = rng(4);
  const docs = Array.from({ length: 6 }, (_, i) => ({ d: makeDoc(cam, { w: 170, h: 220, lines: 6, seed: i + 10 }), sx: 200 + R() * 1200, sy: 1080 + R() * 200, sr: (R() - 0.5) * 70, tx: 1250 + (i % 3) * 190, ty: 790 + Math.floor(i / 3) * 40, i }));
  const note = makeNote(layer, 'Interpretación de otros peritos');
  return {
    render(t, ctx) {
      const ent = ramp(t, 85.8, 86.6, E.out5);
      const pan = ramp(t, 86.0, 90.8, E.inOut);   // travelling lateral
      set(cam, { transform: `translate(${f1(lerp(160, -620, pan))},${f1(60 * (1 - ent))})`, opacity: f3(ent) });
      set(cal, { transform: tr(330, 760, ramp(t, 85.9, 86.5, E.back), -3) });
      marks.forEach((m, i) => set(m, { r: f1(20 * ramp(t, 86.6 + i * 0.18, 86.9 + i * 0.18, E.back)) }));
      set(clock, { transform: tr(760, 880, 1.1 * ramp(t, 86.2, 86.8, E.back)) });
      set(hand, { transform: `rotate(${f1((t - 86) * 160)})` });
      // los documentos se ordenan en montones alineados
      docs.forEach(D => { const k = ramp(t, 86.8 + D.i * 0.22, 87.6 + D.i * 0.22, E.inOut); set(D.d, { transform: tr(lerp(D.sx, D.tx, k), lerp(D.sy, D.ty, k) - Math.sin(k * Math.PI) * 120, 1, lerp(D.sr, 0, k)) }); });
      set(scG, { transform: `translate(${f1(1700)},560) scale(0.75)`, opacity: f3(ramp(t, 88.4, 89.2)) });
      sc.tilt(Math.sin(t * 1.5) * 6);
      note.show(t, 87.0, 91.1, 540, 1250);
    },
  };
}
