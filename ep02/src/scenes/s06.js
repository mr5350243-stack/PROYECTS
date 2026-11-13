// ESCENA 06 — LAS FANTASÍAS VIOLENTAS (56.6 – 68.2 s) · representación abstracta, sin escenas sexuales ni violentas
// Una silueta rodeada de burbujas de pensamiento con símbolos de dominación, aislamiento, hostilidad y pensamientos
// intrusivos. Las burbujas se acumulan y se funden en una nube oscura; la cámara la atraviesa y revela un cerebro
// (escena 07). Nota: «Interpretación de algunos especialistas». «FANTASÍAS VIOLENTAS» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, rng } from '/ep01/src/lib.js';
import { makeSilhouette } from '../silhouette.js';
import { makeNote } from '../common.js';
import { RED, GREY } from '../style.js';

export const S06 = { start: 56.6, end: 68.2 };
const HEAD = { x: 540, y: 600 };
// símbolos abstractos
const SYM = [
  (g) => { el('path', { d: 'M 0 -40 L 0 30 M -26 6 L 0 34 L 26 6', stroke: C.white, 'stroke-width': 12, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); el('rect', { x: -34, y: 38, width: 68, height: 10, rx: 5, fill: RED }, g); },   // dominación: fuerza hacia abajo
  (g) => { el('rect', { x: -34, y: -34, width: 68, height: 68, rx: 6, fill: 'none', stroke: C.white, 'stroke-width': 9 }, g); el('circle', { r: 8, fill: C.yellow }, g); },                          // aislamiento: punto encerrado
  (g) => { el('path', { d: 'M -40 20 L -20 -24 L 0 16 L 20 -30 L 40 18', stroke: RED, 'stroke-width': 11, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g); },              // hostilidad: línea quebrada
  (g) => { el('path', { d: 'M -36 0 C -36 -40 30 -40 26 -4 C 22 30 -24 26 -20 0 C -16 -22 14 -18 12 0', stroke: C.white, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, g); },          // pensamiento intrusivo: espiral
];
const LABELS = ['DOMINACIÓN', 'AISLAMIENTO', 'HOSTILIDAD', 'PENSAMIENTOS INTRUSIVOS'];

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  el('ellipse', { cx: 540, cy: 760, rx: 560, ry: 640, fill: 'url(#spot2)' }, cam);
  const sil = makeSilhouette(el('g', {}, cam)); set(sil.g, { transform: tr(540, 1000, 0.85) });
  const R = rng(21);
  const bubbles = [];
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + (i - 6.5) * 0.36, rr = 300 + (i % 3) * 70;
    const g = el('g', { opacity: 0 }, cam);
    const c = el('circle', { r: 70 + (i % 4) * 10, fill: '#2a3a6e', stroke: '#8fa3d8', 'stroke-width': 4 }, g);
    const sym = el('g', {}, g); SYM[i % 4](sym);
    bubbles.push({ g, c, sym, x: HEAD.x + Math.cos(a) * rr, y: HEAD.y - 40 + Math.sin(a) * rr * 0.75, t0: 59.2 + i * 0.32, i, ph: R() * 6 });
  }
  const labels = LABELS.map((L, i) => { const t = el('text', { 'font-size': 30, 'font-weight': 900, fill: i === 2 ? '#f08a96' : C.white, 'text-anchor': 'middle', 'letter-spacing': 2, opacity: 0 }, cam); t.textContent = L; return t; });
  const cloud = el('g', { opacity: 0 }, cam);
  for (let i = 0; i < 12; i++) el('circle', { cx: HEAD.x + Math.cos(i) * 180 * (i % 3 ? 1 : 0.5), cy: HEAD.y - 60 + Math.sin(i * 1.7) * 120, r: 170 + (i % 4) * 30, fill: i % 2 ? '#141a33' : '#1e1b30' }, cloud);
  el('circle', { cx: HEAD.x, cy: HEAD.y - 40, r: 260, fill: RED, opacity: 0.18, filter: 'url(#soft)' }, cloud);
  const note = makeNote(layer, 'Interpretación de algunos especialistas');
  return {
    render(t, ctx) {
      const ent = ramp(t, 56.6, 57.6, E.out5);
      const thru = ramp(t, 66.3, 68.2, E.inExpo);   // la cámara atraviesa la nube
      set(cam, { transform: `translate(540,${HEAD.y}) scale(${f3(lerp(0.92, 1, ent) * lerp(1, 7, thru))}) translate(-540,${-HEAD.y})`, opacity: f3(ent) });
      const merge = ramp(t, 64.4, 66.0, E.inOut);
      bubbles.forEach(B => {
        const k = ramp(t, B.t0, B.t0 + 0.45, E.back);
        const x = lerp(B.x, HEAD.x + (B.x - HEAD.x) * 0.3, merge) + Math.sin(t * 1.3 + B.ph) * 8, y = lerp(B.y, HEAD.y - 40 + (B.y - HEAD.y) * 0.3, merge) + Math.cos(t * 1.1 + B.ph) * 8;
        set(B.g, { opacity: f3(clamp(k * 2) * (1 - ramp(merge, 0.6, 1))), transform: tr(x, y, lerp(0.3, 1, k) * lerp(1, 1.3, merge)) });
        set(B.c, { fill: merge > 0.3 ? '#1b1d33' : '#2a3a6e' });
      });
      // etiquetas con las palabras de la narración: «dominación» (63.0) · «hostilidad» (64.4)
      [[63.0, 0, 260, 380], [64.4, 2, 820, 380]].forEach(([s, i, x, y]) => { const k = ramp(t, s, s + 0.35, E.back); set(labels[i], { x, y, opacity: f3(clamp(k * 2) * (1 - merge)), transform: `translate(${x},${y}) scale(${f3(lerp(0.6, 1, k))}) translate(${-x},${-y})` }); });
      set(cloud, { opacity: f3(merge), transform: `translate(${HEAD.x},${HEAD.y}) scale(${f3(lerp(0.6, 1.1, merge))}) translate(${-HEAD.x},${-HEAD.y})` });
      note.show(t, 59.3, 64.2, 540, 1250);
    },
  };
}
