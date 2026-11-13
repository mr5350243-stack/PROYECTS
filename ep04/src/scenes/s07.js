// ESCENA 07 — ADVERTENCIA CIENTÍFICA (56.1 – 71.2 s)
// Las cinco tarjetas se agrupan y aparece una carpeta clínica. «SEÑALES ≠ DIAGNÓSTICO» (fx_data). Distinción
// rasgo / conducta perjudicial / diagnóstico clínico. Movimiento lateral hacia una línea temporal: importan la
// frecuencia, la intensidad y el contexto. «Patrón de desprecio, manipulación o falta de respeto»: los episodios se
// repiten sobre la línea y se unen en un patrón.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makeDoc } from '/ep02/src/docs.js';
import { makeCard } from '../common.js';
import { CORAL, GREY } from '../style.js';

export const S07 = { start: 56.1, end: 71.2 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  const cards = [0, 1, 2, 3, 4].map(i => makeCard(cam, i));
  // carpeta clínica
  const folder = el('g', { opacity: 0 }, cam);
  el('rect', { x: -230, y: -300, width: 460, height: 600, rx: 16, fill: '#c9d4f2' }, folder);
  el('rect', { x: -70, y: -326, width: 140, height: 50, rx: 12, fill: '#8a93ad' }, folder);
  makeDoc(el('g', { transform: 'translate(0,30)' }, folder), { w: 380, h: 480, lines: 12, seed: 2 });
  el('text', { x: 0, y: -200, 'font-size': 30, 'font-weight': 900, fill: C.navy, 'text-anchor': 'middle', 'letter-spacing': 2 }, folder).textContent = 'EVALUACIÓN CLÍNICA';
  // rasgo ≠ conducta ≠ diagnóstico
  const tiers = ['RASGO', 'CONDUCTA', 'DIAGNÓSTICO'].map((s, i) => { const g = el('g', { opacity: 0 }, cam); const t = el('text', { x: 0, y: 11, 'font-size': 30, 'font-weight': 900, fill: C.navy, 'text-anchor': 'middle' }, g); t.textContent = s; const w = t.getComputedTextLength() + 44; g.insertBefore(el('rect', { x: -w / 2, y: -30, width: w, height: 60, rx: 30, fill: [C.white, C.yellow, CORAL][i] }), t); return g; });
  const neqs = [0, 1].map(() => { const t = el('text', { 'font-size': 48, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', opacity: 0 }, cam); t.textContent = '≠'; return t; });
  // línea temporal (a la derecha: la cámara se desplaza)
  const TL = { x0: 1240, x1: 2040, y: 860 };
  const tl = el('g', {}, cam);
  el('rect', { x: TL.x0, y: TL.y - 5, width: TL.x1 - TL.x0, height: 10, rx: 5, fill: GREY }, tl);
  const pattern = el('path', { fill: 'none', stroke: CORAL, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, tl);
  const evts = Array.from({ length: 9 }, (_, i) => { const x = lerp(TL.x0 + 40, TL.x1 - 40, i / 8); const h = [60, 120, 80, 150, 70, 170, 110, 190, 140][i]; const c = el('circle', { cx: x, cy: TL.y - h, r: 0, fill: CORAL }, tl); const st = el('line', { x1: x, y1: TL.y, x2: x, y2: TL.y, stroke: CORAL, 'stroke-width': 4, opacity: 0.6 }, tl); return { c, st, x, h, i }; });
  const crit = [['FRECUENCIA', 61.76], ['INTENSIDAD', 62.66], ['CONTEXTO', 63.52]].map(([s, t0], i) => { const g = el('g', { opacity: 0 }, tl); const t = el('text', { x: 0, y: 11, 'font-size': 32, 'font-weight': 900, fill: C.navy, 'text-anchor': 'middle' }, g); t.textContent = s; const w = t.getComputedTextLength() + 50; g.insertBefore(el('rect', { x: -w / 2, y: -32, width: w, height: 64, rx: 32, fill: C.yellow }), t); return { g, t0, x: lerp(TL.x0 + 130, TL.x1 - 130, i / 2) }; });
  const pats = [['DESPRECIO', 67.86], ['MANIPULACIÓN', 68.78], ['FALTA DE RESPETO', 70.26]].map(([s, t0], i) => { const t = el('text', { 'font-size': 30, 'font-weight': 900, fill: CORAL, 'text-anchor': 'middle', opacity: 0 }, tl); t.textContent = s; return { t, t0, i }; });
  return {
    render(t, ctx) {
      const ent = ramp(t, 56.1, 56.8, E.out5);
      // las cinco tarjetas se agrupan (pila) y aparece la carpeta clínica
      const stack = ramp(t, 56.4, 57.4, E.inOut);
      cards.forEach((c, i) => set(c.g, { transform: tr(lerp(140 + i * 200, 360 + i * 12, stack), lerp(560, 640 - i * 10, stack), lerp(0.8, 0.75, stack), lerp((i - 2) * 6, -8 + i * 3, stack)), opacity: f3(ent * (1 - ramp(t, 60.6, 61.0))) }));
      const fk = ramp(t, 57.3, 57.8, E.back);
      set(folder, { opacity: f3(clamp(fk * 2) * (1 - ramp(t, 60.6, 61.0))), transform: tr(720, 680, lerp(0.6, 0.85, fk), 4) });
      tiers.forEach((g, i) => { const k = ramp(t, 58.6 + i * 0.35, 59.0 + i * 0.35, E.back); set(g, { opacity: f3(clamp(k * 2) * (1 - ramp(t, 60.6, 61.0))), transform: tr(200 + i * 340, 1150, lerp(0.6, 1, k)) }); });
      neqs.forEach((n, i) => set(n, { x: 370 + i * 340, y: 1166, opacity: f3(ramp(t, 59.1 + i * 0.35, 59.4 + i * 0.35) * (1 - ramp(t, 60.6, 61.0))) }));
      // movimiento lateral hacia la línea temporal
      const pan = ramp(t, 60.6, 61.6, E.inOut);
      set(cam, { transform: `translate(${f1(-pan * 1100)},0)`, opacity: f3(ent) });
      crit.forEach(c => { const k = ramp(t, c.t0 - 0.1, c.t0 + 0.3, E.back); set(c.g, { opacity: f3(clamp(k * 2) * (1 - ramp(t, 64.3, 64.8))), transform: tr(c.x, TL.y + 110, lerp(0.6, 1, k)) }); });
      // patrón: los episodios se repiten y se unen
      evts.forEach(e => { const k = ramp(t, 64.6 + e.i * 0.3, 64.9 + e.i * 0.3, E.back); set(e.c, { r: f1(16 * k) }); set(e.st, { y2: f1(TL.y - e.h * clamp(k)) }); });
      const pk = ramp(t, 67.3, 69.0, E.inOut), n = Math.max(1, Math.round(pk * 8));
      set(pattern, { d: 'M ' + evts.slice(0, n + 1).map(e => `${e.x} ${TL.y - e.h}`).join(' L '), opacity: f3(pk > 0 ? 1 : 0) });
      pats.forEach(p => set(p.t, { x: f1(lerp(TL.x0, TL.x1, (p.i + 0.5) / 3)), y: f1(TL.y - 300 - p.i * 50), opacity: f3(ramp(t, p.t0, p.t0 + 0.3)) }));
    },
  };
}
