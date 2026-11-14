// ESCENA 07 — RUMIACIÓN (53.4 – 62.3 s)
// Ella repite mentalmente una conversación: una burbuja recorre un circuito y vuelve siempre al mismo punto; la cámara
// recorre el circuito. «RUMIACIÓN» y «PENSAMIENTOS REPETITIVOS» (fx_data). Se presenta como una posibilidad, no como
// diagnóstico (nota).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeNote } from '/ep02/src/common.js';
import { makeGirl, phoneMsg } from '../common.js';
import { CORAL } from '../style.js';

export const S07 = { start: 53.4, end: 62.3 };
const TR = { x: 540, y: 660, rx: 380, ry: 250 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  el('ellipse', { cx: TR.x, cy: TR.y, rx: TR.rx, ry: TR.ry, fill: 'none', stroke: '#2a4796', 'stroke-width': 44 }, cam);
  el('ellipse', { cx: TR.x, cy: TR.y, rx: TR.rx, ry: TR.ry, fill: 'none', stroke: '#3a5cb8', 'stroke-width': 4, 'stroke-dasharray': '16 18' }, cam);
  const start = el('g', { transform: `translate(${TR.x},${TR.y - TR.ry})` }, cam);
  el('rect', { x: -6, y: -40, width: 12, height: 80, fill: C.yellow }, start);
  const trail = el('path', { fill: 'none', stroke: C.yellow, 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0.8 }, cam);
  const bub = phoneMsg(cam, { w: 220, text: '¿y si…?' });
  set(bub, { opacity: 1 });
  const laps = el('text', { x: TR.x, y: TR.y + 20, 'font-size': 120, 'font-weight': 900, fill: '#3a5cb8', 'text-anchor': 'middle' }, cam);
  const girl = makeGirl(layer);
  const note = makeNote(layer, 'Una posibilidad, no un diagnóstico', { dot: C.yellow });
  const pos = (u) => { const a = -Math.PI / 2 + u * Math.PI * 2; return { x: TR.x + Math.cos(a) * TR.rx, y: TR.y + Math.sin(a) * TR.ry }; };
  return {
    render(t, ctx) {
      const ent = ramp(t, 53.4, 54.1, E.out5);
      const u = Math.max(0, t - 54.0) / 1.9;      // una vuelta cada 1,9 s
      const p = pos(u % 1);
      // la cámara sigue a la burbuja por el circuito
      const fol = ramp(t, 54.5, 55.5) * (1 - ramp(t, 59.0, 60.0));
      const cx = lerp(TR.x, p.x, 0.35 * fol), cy = lerp(TR.y, p.y, 0.35 * fol);
      set(cam, { transform: `translate(540,760) scale(${f3(lerp(1.15, 1, ent) * (1 + 0.15 * fol))}) translate(${f1(-cx)},${f1(-cy)})` });
      set(bub, { transform: `translate(${f1(p.x - 20)},${f1(p.y)})` });
      const pts = []; for (let k = 0; k <= 24; k++) { const q = pos(((u % 1) - k * 0.012 + 1) % 1); pts.push(`${f1(q.x)} ${f1(q.y)}`); }
      set(trail, { d: 'M ' + pts.join(' L ') });
      laps.textContent = t > 54.0 ? `×${Math.floor(u) + 1}` : '';
      drawPerson(girl.P, { x: 540, y: 1300, s: 0.95, face: 1, phase: 0, stride: 0, handB: { x: 10, y: -170 }, handF: { x: 34, y: -300 }, headR: 10 + Math.sin(t * 2) * 3, smile: -0.3 });
      set(girl.P.held, { opacity: 0 });
      note.show(t, 54.3, 61.9, 540, 1215);
    },
  };
}
