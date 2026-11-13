// ESCENA 09 — LA PREGUNTA FINAL (69.7 – 80.8 s)
// Regresamos a la joven con su teléfono. Dos burbujas: «¿ME GUSTA?» y «¿QUIERO QUE ME ELIJA?», que se transforman
// en un gran signo de interrogación. Texto final «¿AMOR O NECESIDAD DE VALIDACIÓN?» (fx_data). Logo y fundido.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeRoom, makeGirl } from '../common.js';
import { CORAL } from '../style.js';

export const S09 = { start: 69.7, end: 80.8 };
const SEAT = { x: 520, y: 1180 }, S = 1.25;

export function create(layer) {
  const cam = el('g', {}, layer);
  const room = makeRoom(cam);
  const girl = makeGirl(room.mid);
  const bub = (txt, col) => { const g = el('g', { opacity: 0 }, layer); const t = el('text', { x: 0, y: 14, 'font-size': 46, 'font-weight': 900, fill: C.ink, 'text-anchor': 'middle' }, g); t.textContent = txt; const w = t.getComputedTextLength() + 80; g.insertBefore(el('rect', { x: -w / 2, y: -50, width: w, height: 100, rx: 50, fill: col }), t); g.insertBefore(el('circle', { cx: -w / 4, cy: 70, r: 16, fill: col }), t); return g; };
  const b1 = bub('¿ME GUSTA?', C.white), b2 = bub('¿QUIERO QUE ME ELIJA?', CORAL);
  const q = el('text', { x: 540, y: 820, 'font-size': 600, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle', stroke: C.ink, 'stroke-width': 30, 'paint-order': 'stroke', opacity: 0 }, layer); q.textContent = '?';
  const dim = el('rect', { width: 1080, height: 1920, fill: C.navy, opacity: 0 }, layer);
  const brand = el('g', { opacity: 0 }, layer);
  el('rect', { x: -80, y: -80, width: 160, height: 160, rx: 40, fill: C.orange }, brand);
  el('text', { x: 0, y: 46, 'font-size': 128, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, brand).textContent = '?';
  el('circle', { cx: 62, cy: -62, r: 22, fill: C.yellow, stroke: C.navy, 'stroke-width': 6 }, brand);
  el('text', { x: 0, y: 160, 'font-size': 44, 'font-weight': 800, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 10 }, brand).textContent = 'DETRÁS DEL';
  el('text', { x: 0, y: 250, 'font-size': 104, 'font-weight': 900, fill: C.yellow, 'text-anchor': 'middle' }, brand).textContent = 'PORQUÉ';
  const black = el('rect', { width: 1080, height: 1920, fill: '#000', opacity: 0 }, layer);
  return {
    render(t, ctx) {
      const ent = ramp(t, 69.7, 70.4, E.out5);
      set(cam, { transform: `translate(540,900) scale(${f3(lerp(1.5, 1.38, ent))}) translate(-580,-950)` });
      drawPerson(girl.P, { x: SEAT.x, y: SEAT.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 34, y: -246 }, handF: { x: 54, y: -258 }, headR: 12 + Math.sin(t * 0.9) * 2, smile: 0.1 });
      set(girl.glow, { opacity: f3(0.8 + 0.2 * Math.sin(t * 3)) });
      // «¿Te gusta realmente…?» (71.8) · «…necesidad de saber si le gustas?» (75.4)
      const merge = ramp(t, 76.4, 77.2, E.inOut);
      [[b1, 71.9, 320, 380], [b2, 75.0, 700, 560]].forEach(([b, s, x, y], i) => {
        const k = ramp(t, s, s + 0.4, E.back);
        set(b, { opacity: f3(clamp(k * 2) * (1 - merge)), transform: tr(lerp(x, 540, merge), lerp(y + Math.sin(t * 1.5 + i) * 8, 700, merge), lerp(0.5, 1, k) * lerp(1, 0.3, merge), (i ? 2 : -2)) });
      });
      const qk = ramp(t, 76.9, 77.4, E.back);
      set(q, { opacity: f3(clamp(qk * 2) * (1 - ramp(t, 77.4, 77.8))), transform: `translate(540,620) scale(${f3(lerp(0.3, 1, qk))}) translate(-540,-620)` });
      set(dim, { opacity: f3(0.85 * ramp(t, 77.2, 77.7)) });
      const bk = ramp(t, 79.0, 79.5, E.back);
      set(brand, { opacity: f3(clamp(bk * 2) * (1 - ramp(t, 80.2, 80.6))), transform: tr(540, 820, lerp(0.5, 1.1, bk), lerp(-8, 0, bk)) });
      set(black, { opacity: f3(ramp(t, 80.3, 80.75)) });
      ctx.capHide = ramp(t, 78.9, 79.2);
    },
  };
}
