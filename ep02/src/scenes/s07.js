// ESCENA 07 — LA PREGUNTA PSIQUIÁTRICA (67.9 – 75.4 s)
// Un cerebro sobre una mesa de investigación; a un lado una carpeta médica, al otro una balanza jurídica.
// La cámara se desplaza entre ambos. «¿ENFERMEDAD MENTAL O RESPONSABILIDAD?» (fx_data). Al final, un diagrama
// de dos círculos que se solapan aclara que ambas condiciones no son necesariamente excluyentes.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makeBrain } from '/ep01/src/brain.js';
import { makeScale, makeNote } from '../common.js';
import { makeDoc } from '../docs.js';
import { RED, GREY, PAPER } from '../style.js';

export const S07 = { start: 67.9, end: 75.4 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  // mesa
  el('rect', { x: -900, y: 980, width: 2900, height: 1200, fill: 'url(#deskTop)' }, cam);
  el('rect', { x: -900, y: 970, width: 2900, height: 16, fill: '#2a3a6e' }, cam);
  el('ellipse', { cx: 540, cy: 760, rx: 900, ry: 600, fill: 'url(#spot2)' }, cam);
  // carpeta médica (izquierda)
  const med = el('g', { transform: 'translate(-60,860) rotate(-6)' }, cam);
  el('rect', { x: -170, y: -220, width: 340, height: 440, rx: 14, fill: '#c9d4f2' }, med);
  makeDoc(el('g', { transform: 'translate(10,10) rotate(4)' }, med), { w: 280, h: 360, lines: 9, seed: 3 });
  const cross = el('g', { transform: 'translate(-90,-150)' }, med);
  el('rect', { x: -14, y: -40, width: 28, height: 80, rx: 6, fill: RED }, cross); el('rect', { x: -40, y: -14, width: 80, height: 28, rx: 6, fill: RED }, cross);
  // cerebro (centro, sobre una bandeja)
  el('ellipse', { cx: 540, cy: 990, rx: 270, ry: 34, fill: '#2a3a6e' }, cam);
  const brain = makeBrain(el('g', { transform: 'translate(540,800) scale(1.05)' }, cam));
  // balanza (derecha)
  const sc = makeScale(el('g', { transform: 'translate(1140,750) scale(0.9)' }, cam));
  // diagrama: dos círculos que se solapan
  const venn = el('g', { opacity: 0 }, layer);
  const c1 = el('circle', { cx: -130, cy: 0, r: 200, fill: '#3a4f8f', opacity: 0.75 }, venn);
  const c2 = el('circle', { cx: 130, cy: 0, r: 200, fill: RED, opacity: 0.75 }, venn);
  el('text', { x: -200, y: 10, 'font-size': 30, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, venn).textContent = 'TRASTORNO';
  el('text', { x: 200, y: -6, 'font-size': 30, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, venn).textContent = 'RESPONSA-';
  el('text', { x: 200, y: 28, 'font-size': 30, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, venn).textContent = 'BILIDAD';
  const note = makeNote(layer, 'No son necesariamente excluyentes', { dot: C.yellow });
  return {
    render(t, ctx) {
      const ent = ramp(t, 67.9, 68.8, E.out5);
      // cámara: del cerebro a la carpeta médica (enfermedad mental) y a la balanza (responsabilidad)
      const toMed = ramp(t, 70.9, 71.9, E.inOut) * (1 - ramp(t, 72.7, 73.6, E.inOut));
      const toLaw = ramp(t, 72.7, 73.6, E.inOut) * (1 - ramp(t, 74.0, 74.8, E.inOut));
      const cx = 540 + lerp(0, -560, toMed) + lerp(0, 560, toLaw);
      const z = lerp(1.25, 1, ent) * (1 + 0.12 * (toMed + toLaw));
      set(cam, { transform: `translate(540,800) scale(${f3(z * (1 - 0.15 * ramp(t, 74.0, 74.8)))}) translate(${f1(-cx)},-800)`, opacity: f3(1 - 0.75 * ramp(t, 74.0, 74.6)) });
      set(brain.g, { transform: `translate(0,${f1(Math.sin(t * 1.4) * 6)})` });
      set(brain.spot, { opacity: f3(0.6 * ramp(t, 68.5, 69.2) * (0.6 + 0.4 * Math.sin(t * 4))) });
      sc.tilt(Math.sin(t * 1.8) * 9 * (1 - ramp(t, 74, 75)));
      // ambas condiciones pueden coexistir: los círculos se solapan
      const vk = ramp(t, 74.0, 74.6, E.back);
      set(venn, { opacity: f3(clamp(vk * 2)), transform: tr(540, 800, lerp(0.6, 1, vk)) });
      set(c1, { cx: f1(lerp(-260, -130, ramp(t, 74.2, 74.9, E.inOut))) }); set(c2, { cx: f1(lerp(260, 130, ramp(t, 74.2, 74.9, E.inOut))) });
      note.show(t, 74.5, 75.4, 540, 1100);
    },
  };
}
