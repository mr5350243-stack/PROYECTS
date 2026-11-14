// ESCENA 06 — SEÑAL 4: EL AISLAMIENTO (42.0 – 49.9 s)
// Ella aparece rodeada de amistades y familiares unidos por líneas. Las conexiones desaparecen una a una y las
// personas se alejan; el entorno se vacía y la cámara se aleja para mostrar su aislamiento. «TE ALEJA DE LOS DEMÁS» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makePerson, drawPerson } from '/ep01/src/characters.js';
import { makeA, makeBadge } from '../common.js';
import { CORAL } from '../style.js';

export const S06 = { start: 42.0, end: 49.9 };
const CEN = { x: 540, y: 1050 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  const halo = el('ellipse', { cx: CEN.x, cy: CEN.y - 200, rx: 560, ry: 520, fill: 'url(#spot2)' }, cam);
  const lines = el('g', {}, cam);
  const ppl = [['#ff7a6b', '#e8b48c', 1], ['#3a8f6a', '#8a5a3c', 0], ['#ffc93c', '#f1c7a1', 2], ['#3a5cb8', '#a8714b', 0], ['#c9cfe0', '#d9a37c', 3], ['#8a93ad', '#e8b48c', 4]].map(([shirt, skin, st], i) => {
    const a = -Math.PI * 0.95 + i * (Math.PI * 0.9 / 5);
    const P = makePerson(cam, { shirt, pants: '#2a3a6e', skin, hair: ['#3b2416', '#14110f', '#6b3f1f'][i % 3], style: st, shadow: '#000' });
    const ln = el('line', { stroke: C.yellow, 'stroke-width': 6, 'stroke-linecap': 'round' }, lines);
    return { P, ln, x: CEN.x + Math.cos(a) * 400, y: CEN.y - 120 + Math.sin(a) * 300, i, cut: 45.0 + i * 0.4 };
  });
  const a = makeA(cam);
  const badge = makeBadge(layer, 3);
  return {
    render(t, ctx) {
      const ent = ramp(t, 42.0, 42.7, E.out5);
      const away = ramp(t, 47.0, 49.6, E.inOut);   // la cámara se aleja
      set(cam, { transform: `translate(540,860) scale(${f3(lerp(1.05, 0.62, away) * lerp(1.2, 1, ent))}) translate(-540,-900)`, opacity: f3(ent) });
      ppl.forEach(p => {
        const k = ramp(t, 42.2 + p.i * 0.12, 42.6 + p.i * 0.12, E.back);
        const gone = ramp(t, p.cut + 0.2, p.cut + 1.4, E.inOut);
        const dx = (p.x - CEN.x) * 1.4 * gone, dy = (p.y - CEN.y) * 0.8 * gone;
        drawPerson(p.P, { x: p.x + dx, y: p.y + 200 + dy, s: 0.8, face: p.x < CEN.x ? 1 : -1, phase: t * 8, stride: gone > 0 && gone < 1 ? 1 : 0, handB: { x: -36, y: -150 }, handF: { x: 60 + Math.sin(t * 3 + p.i) * 10, y: -200 }, headR: 0, smile: 0.8, opacity: clamp(k * 2) * (1 - ramp(gone, 0.6, 1)) });
        const ln = ramp(t, p.cut, p.cut + 0.35);
        set(p.ln, { x1: CEN.x, y1: CEN.y - 260, x2: f1(lerp(p.x, CEN.x, ln * 0)), y2: f1(p.y + 60), opacity: f3(ramp(t, 42.6, 43.0) * (1 - ln)) });
      });
      set(halo, { opacity: f3(1 - 0.7 * away) });
      const sad = ramp(t, 45.5, 47.5);
      drawPerson(a, { x: CEN.x, y: CEN.y + 120, s: 1.2, face: 1, phase: 0, stride: 0, handB: { x: 10, y: -170 }, handF: { x: 30, y: -168 }, headR: lerp(-2, 16, sad) + Math.sin(t) * 2, smile: lerp(0.8, -0.4, sad), lean: lerp(0, 4, sad) });
      badge.show(t, 42.2, 49.6);
    },
  };
}
