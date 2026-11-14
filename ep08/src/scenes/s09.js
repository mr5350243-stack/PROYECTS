// ESCENA 09 — LO QUE NO SABEMOS (78.1 – 85.1 s)
// El segundo personaje en una composición neutral. Varias explicaciones posibles, solo como signos de interrogación:
// no se confirma ninguna intención. «NO CONOCEMOS SUS MOTIVOS» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeHim } from '../common.js';

export const S09 = { start: 78.1, end: 85.1 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: '#1b2a55' }, layer);
  el('ellipse', { cx: 540, cy: 1250, rx: 300, ry: 40, fill: '#0b1636', opacity: 0.6 }, layer);
  const him = makeHim(layer);
  const qs = Array.from({ length: 6 }, (_, i) => { const g = el('g', { opacity: 0 }, layer); el('circle', { r: 64, fill: '#2a3f7a', stroke: '#8a93ad', 'stroke-width': 4 }, g); el('text', { x: 0, y: 30, 'font-size': 86, 'font-weight': 900, fill: '#c9d4f2', 'text-anchor': 'middle' }, g).textContent = '?'; return { g, a: -Math.PI + i * Math.PI / 5, i }; });
  return {
    render(t, ctx) {
      const ent = ramp(t, 78.1, 78.8, E.out5);
      drawPerson(him, { x: 540, y: 1250, s: 1.5 * lerp(0.95, 1, ent), face: 1, phase: 0, stride: 0, handB: { x: -36, y: -150 }, handF: { x: 40, y: -150 }, headR: Math.sin(t * 0.7) * 2, smile: 0.3, opacity: ent });
      qs.forEach(Q => { const k = ramp(t, 79.0 + Q.i * 0.3, 79.4 + Q.i * 0.3, E.back); const a = Q.a + Math.sin(t * 0.5 + Q.i) * 0.05; set(Q.g, { opacity: f3(clamp(k * 2) * (1 - ramp(t, 84.6, 85.0))), transform: tr(540 + Math.cos(a) * 380, 760 + Math.sin(a) * 340, lerp(0.4, 0.95, k)) }); });
    },
  };
}
