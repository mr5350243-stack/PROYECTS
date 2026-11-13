// ESCENA 07 — PENSAR EN ALGUIEN (50.0 – 57.2 s)
// La joven rodeada de burbujas de pensamiento; dentro se repite el mismo perfil. Las burbujas giran lentamente.
// Una lupa intenta comprender lo que siente la otra persona. «PENSAR MÁS ≠ AMAR MÁS» (fx_data).
// Nota: hipótesis de los investigadores, no explicación causal definitiva.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeNote } from '/ep02/src/common.js';
import { makeGirl, makeAvatar } from '../common.js';

export const S07 = { start: 50.0, end: 57.2 };
const HEAD = { x: 540, y: 820 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  el('ellipse', { cx: 540, cy: 860, rx: 560, ry: 600, fill: 'url(#spot2)' }, layer);
  const ringG = el('g', {}, layer);
  const bubbles = Array.from({ length: 8 }, (_, i) => { const g = el('g', { opacity: 0 }, ringG); el('circle', { r: 78, fill: '#f6f3ec' }, g); makeAvatar(g, { r: 58 }); return { g, i }; });
  const girl = makeGirl(layer);
  const lens = el('g', {}, layer); icon(lens, 'lens');
  const note = makeNote(layer, 'Hipótesis de los investigadores', { dot: C.yellow });
  return {
    render(t, ctx) {
      const ent = ramp(t, 50.0, 50.7, E.out5);
      drawPerson(girl.P, { x: 540, y: 1280, s: 1.45, face: 1, phase: 0, stride: 0, handB: { x: 34, y: -246 }, handF: { x: 54, y: -258 }, headR: 10 + Math.sin(t * 0.9) * 2, smile: 0.2, opacity: ent });
      // «pensar repetidamente»: el mismo perfil se repite en burbujas que giran
      bubbles.forEach(B => {
        const k = ramp(t, 50.3 + B.i * 0.25, 50.7 + B.i * 0.25, E.back);
        const a = B.i / 8 * Math.PI * 2 + (t - 50) * 0.32;
        set(B.g, { opacity: f3(clamp(k * 2)), transform: tr(HEAD.x + Math.cos(a) * 390, HEAD.y - 60 + Math.sin(a) * 330, lerp(0.3, 0.95, k) * (0.85 + 0.15 * Math.sin(a))) });
      });
      // la lupa pasa de burbuja en burbuja
      const la = (t - 50) * 0.32 + Math.PI * 0.25 + Math.sin(t * 0.8) * 0.3;
      set(lens, { transform: tr(HEAD.x + Math.cos(la) * 300, HEAD.y - 60 + Math.sin(la) * 250, 1.3 * ramp(t, 51.0, 51.5, E.back), -20), opacity: f3(ramp(t, 51.0, 51.3)) });
      note.show(t, 50.4, 56.8, 540, 1270);
    },
  };
}
