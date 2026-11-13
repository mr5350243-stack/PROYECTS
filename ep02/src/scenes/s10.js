// ESCENA 10 — EL JUICIO (91.0 – 96.9 s) · recreación editorial
// Sala judicial: estrado, columnas, balanza en el centro. La cámara se acerca a un documento con el sello
// «RESPONSABLE». «RESPONSABILIDAD PENAL» + «Decisión judicial de 1992» (fx_data / texto secundario).
// La balanza se transforma en una línea divisoria vertical (escena 11).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makeDoc } from '../docs.js';
import { makeScale, makeNote } from '../common.js';
import { RED, GREY, PAPER } from '../style.js';

export const S10 = { start: 91.0, end: 96.9 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  el('rect', { x: -600, y: -400, width: 2300, height: 1500, fill: '#16285e' }, cam);
  for (let i = 0; i < 6; i++) { const x = -60 + i * 240; el('rect', { x, y: 120, width: 70, height: 860, fill: '#1f3a80' }, cam); el('rect', { x: x - 14, y: 110, width: 98, height: 24, fill: '#2a4796' }, cam); }
  el('circle', { cx: 540, cy: 300, r: 90, fill: '#2a4796' }, cam); el('circle', { cx: 540, cy: 300, r: 60, fill: 'none', stroke: C.yellow, 'stroke-width': 8 }, cam);
  el('rect', { x: -600, y: 980, width: 2300, height: 1200, fill: '#0e1b44' }, cam);
  // estrado
  el('rect', { x: 140, y: 820, width: 800, height: 260, rx: 10, fill: '#3a2a20' }, cam);
  el('rect', { x: 120, y: 800, width: 840, height: 40, rx: 8, fill: '#4a3628' }, cam);
  for (let i = 0; i < 4; i++) el('rect', { x: 180 + i * 190, y: 870, width: 150, height: 170, rx: 8, fill: '#33251c' }, cam);
  const sc = makeScale(el('g', {}, cam));
  const scG = sc.g.parentNode;
  const doc = el('g', {}, cam);
  makeDoc(doc, { w: 300, h: 380, lines: 10, seed: 5 });
  const stamp = el('g', { transform: 'translate(0,90) rotate(-10)', opacity: 0 }, doc);
  el('rect', { x: -130, y: -36, width: 260, height: 72, rx: 8, fill: 'none', stroke: RED, 'stroke-width': 7 }, stamp);
  el('text', { x: 0, y: 14, 'font-size': 36, 'font-weight': 900, fill: RED, 'text-anchor': 'middle', 'letter-spacing': 2 }, stamp).textContent = 'RESPONSABLE';
  const line = el('rect', { x: 534, y: 960, width: 12, height: 0, rx: 6, fill: C.white, opacity: 0 }, layer);
  const sub = makeNote(layer, 'Decisión judicial de 1992', { dot: C.yellow });
  return {
    render(t, ctx) {
      const ent = ramp(t, 91.0, 91.9, E.out5);
      const zoom = ramp(t, 92.6, 94.0, E.inOut);   // acercamiento al documento
      const morph = ramp(t, 95.6, 96.8, E.inOut);  // la balanza se convierte en línea divisoria
      set(cam, { transform: `translate(540,820) scale(${f3(lerp(0.9, 1, ent) * lerp(1, 1.5, zoom) * lerp(1, 0.8, ramp(t, 94.8, 95.6, E.inOut)))}) translate(${f1(-lerp(540, 640, zoom))},${f1(-lerp(800, 700, zoom))})`, opacity: f3(ent * (1 - morph)) });
      sc.tilt(lerp(Math.sin(t * 2) * 12, 0, ramp(t, 92.8, 94.0, E.backSoft)));
      set(scG, { transform: `translate(540,${f1(560)}) scale(0.95)` });
      set(doc, { transform: tr(760, 660, ramp(t, 91.6, 92.2, E.back), 4) });
      const sk = ramp(t, 93.0, 93.25, E.back);   // «legalmente responsable»
      set(stamp, { opacity: f3(clamp(sk * 2)), transform: `translate(0,90) rotate(-10) scale(${f3(lerp(2.2, 1, sk))})` });
      set(line, { height: f1(1500 * morph), y: f1(960 - 750 * morph), opacity: f3(morph) });
      sub.show(t, 93.4, 95.6, 540, 1250);
    },
  };
}
