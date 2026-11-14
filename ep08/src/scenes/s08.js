// ESCENA 08 — SEGUNDO GIRO (62.1 – 78.3 s)
// Ella mira el teléfono. Dos conceptos: «ESTAR ENAMORADO» (corazón) y «BUSCAR UNA EXPLICACIÓN» (lupa). Se separan
// (sin dejar de solaparse del todo: no son excluyentes). «NO SON LO MISMO» (fx_data). «…una conexión que parecía
// avanzar terminó sin explicación»: una línea ascendente que se corta.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeNote } from '/ep02/src/common.js';
import { makeRoom, makeGirl } from '../common.js';
import { CORAL } from '../style.js';

export const S08 = { start: 62.1, end: 78.3 };

export function create(layer) {
  const cam = el('g', {}, layer);
  const room = makeRoom(cam);
  el('rect', { x: -800, y: -600, width: 2700, height: 2600, fill: '#0b2a6e', opacity: 0.25 }, cam);
  const girl = makeGirl(room.mid);
  const dim = el('rect', { width: 1080, height: 1920, fill: C.navy, opacity: 0 }, layer);
  const mk = (label, col, drawIcon) => { const g = el('g', { opacity: 0 }, layer); el('circle', { r: 210, fill: col, opacity: 0.85 }, g); const ic = el('g', { transform: 'translate(0,-50)' }, g); drawIcon(ic); const lines = label.split('\n'); lines.forEach((ln, i) => el('text', { x: 0, y: 70 + i * 46, 'font-size': 40, 'font-weight': 900, fill: C.navy, 'text-anchor': 'middle' }, g).textContent = ln); return g; };
  const love = mk('ESTAR\nENAMORADO', CORAL, g => el('path', { d: 'M 0 50 C -100 -10 -70 -100 0 -46 C 70 -100 100 -10 0 50 Z', fill: '#fff' }, g));
  const expl = mk('BUSCAR UNA\nEXPLICACIÓN', C.yellow, g => icon(g, 'lens', { transform: 'scale(1.3)' }));
  const note = makeNote(layer, 'Pueden coexistir', { dot: C.yellow });
  // conexión que avanza y se corta
  const line = el('path', { fill: 'none', stroke: C.yellow, 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, layer);
  const cut = el('g', { opacity: 0 }, layer);
  el('line', { x1: -40, y1: -40, x2: 40, y2: 40, stroke: CORAL, 'stroke-width': 12, 'stroke-linecap': 'round' }, cut);
  el('line', { x1: 40, y1: -40, x2: -40, y2: 40, stroke: CORAL, 'stroke-width': 12, 'stroke-linecap': 'round' }, cut);
  return {
    render(t, ctx) {
      set(cam, { transform: `translate(540,900) scale(${f3(lerp(1.5, 1.6, ramp(t, 62, 66)))}) translate(-560,-950)` });
      drawPerson(girl.P, { x: 520, y: 1180, s: 1.3, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 34, y: -246 }, handF: { x: 54, y: -258 }, headR: 14 + Math.sin(t) * 2, smile: -0.2 });
      set(girl.glow, { opacity: 0.9 });
      const dk = ramp(t, 66.2, 66.7) * (1 - ramp(t, 77.6, 78.2));
      set(dim, { opacity: f3(0.82 * dk) });
      // los dos conceptos aparecen juntos (solapados) y se separan sin dejar de tocarse
      const ka = ramp(t, 66.4, 66.8, E.back), kb = ramp(t, 72.6, 73.0, E.back);
      const sep = ramp(t, 68.2, 70.6, E.inOut);
      const gapK = sep * (1 - ramp(t, 73.6, 74.2));
      set(love, { opacity: f3(clamp(ka * 2) * (1 - ramp(t, 73.6, 74.0))), transform: tr(lerp(470, 300, sep), 760, lerp(0.4, 1, ka) * lerp(1, 0.85, sep)) });
      set(expl, { opacity: f3(clamp(Math.max(ka * (1 - ramp(t, 66.4, 66.4)), ramp(t, 66.6, 67.0)) * 2) * (1 - ramp(t, 73.6, 74.0))), transform: tr(lerp(610, 780, sep), 760, lerp(0.4, 1, ramp(t, 66.6, 67.0, E.back)) * lerp(1, 0.85, sep)) });
      note.show(t, 70.8, 73.6, 540, 1090);
      // 73.8–77.5: la conexión sube y termina sin explicación
      const lk = ramp(t, 74.0, 76.0), ck = ramp(t, 76.2, 76.6, E.back);
      const pts = []; for (let k = 0; k <= 20; k++) { const u = k / 20 * lk; pts.push(`${f1(160 + u * 760)} ${f1(1050 - u * 520 + Math.sin(u * 12) * 30)}`); }
      set(line, { d: 'M ' + pts.join(' L '), opacity: f3(ramp(t, 73.9, 74.1) * (1 - ramp(t, 77.6, 78.0))) });
      set(cut, { opacity: f3(clamp(ck * 2) * (1 - ramp(t, 77.6, 78.0))), transform: tr(160 + lk * 760, 1050 - lk * 520, lerp(0.5, 1, ck)) });
    },
  };
}
