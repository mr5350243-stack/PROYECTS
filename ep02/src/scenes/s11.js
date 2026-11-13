// ESCENA 11 — EXPLICAR NO ES JUSTIFICAR (96.6 – 112.0 s)
// Una línea vertical divide la pantalla. Primero: varias explicaciones (factores) apuntan a un recuadro «causa
// definitiva» que sigue con una interrogación (la psicología no siempre puede identificarla).
// Después: «EXPLICAR» y «JUSTIFICAR» a ambos lados; con «comprender» se ilumina EXPLICAR y con «justificarlo»
// la palabra JUSTIFICAR se aleja. Transición editorial contundente, sin efectos exagerados.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { RED, GREY } from '../style.js';

export const S11 = { start: 96.6, end: 112.0 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const divider = el('rect', { x: 534, y: 210, width: 12, height: 1080, rx: 6, fill: C.white }, layer);
  // parte A: factores → ¿causa definitiva?
  const A = el('g', {}, layer);
  const box = el('g', { transform: 'translate(540,980)' }, A);
  el('rect', { x: -230, y: -110, width: 460, height: 220, rx: 18, fill: C.navy, stroke: C.white, 'stroke-width': 6, 'stroke-dasharray': '22 14' }, box);
  el('text', { x: 0, y: -40, 'font-size': 30, 'font-weight': 900, fill: GREY, 'text-anchor': 'middle', 'letter-spacing': 3 }, box).textContent = 'CAUSA DEFINITIVA';
  const q = el('text', { x: 0, y: 80, 'font-size': 130, 'font-weight': 900, fill: RED, 'text-anchor': 'middle' }, box); q.textContent = '?';
  const factors = [['ABANDONO', 220, 420], ['CONTROL', 860, 420], ['FANTASÍAS', 200, 650], ['ALTERACIONES', 880, 650]].map(([label, x, y], i) => {
    const g = el('g', {}, A);
    const arrow = el('path', { fill: 'none', stroke: C.yellow, 'stroke-width': 6, 'stroke-dasharray': '4 12', 'stroke-linecap': 'round' }, g);
    const pill = el('g', { transform: `translate(${x},${y})` }, g);
    const t = el('text', { x: 0, y: 11, 'font-size': 30, 'font-weight': 900, fill: C.ink, 'text-anchor': 'middle', 'letter-spacing': 1 }, pill); t.textContent = label;
    const w = t.getComputedTextLength() + 50;
    pill.insertBefore(el('rect', { x: -w / 2, y: -30, width: w, height: 60, rx: 30, fill: C.white }), t);
    return { g, arrow, pill, x, y, i };
  });
  // parte B: EXPLICAR | JUSTIFICAR
  const B = el('g', {}, layer);
  const mk = (txt, x, color) => { const t = el('text', { x, y: 0, 'font-size': 78, 'font-weight': 900, fill: color, 'text-anchor': 'middle', 'letter-spacing': -2 }, B); t.textContent = txt; return t; };
  const ex = mk('EXPLICAR', 270, C.white), ju = mk('JUSTIFICAR', 810, C.white);
  const exBar = el('rect', { x: 110, y: 30, width: 0, height: 14, rx: 7, fill: C.yellow }, B);
  return {
    render(t, ctx) {
      const ent = ramp(t, 96.6, 97.2, E.out5);
      set(divider, { opacity: f3(1), transform: `translate(540,750) scale(1,${f3(lerp(1, 1, ent))}) translate(-540,-750)` });
      // A: 97.3 «explicaciones» → 101.2 «pero no siempre… causa definitiva»
      const aOut = ramp(t, 104.6, 105.2, E.in);
      set(A, { opacity: f3(1 - aOut) });
      set(divider, { height: f1(lerp(1080, 0, ramp(t, 97.0, 97.6) * (1 - ramp(t, 104.9, 105.4)))), y: f1(210) });
      factors.forEach(F => {
        const k = ramp(t, 97.4 + F.i * 0.35, 97.9 + F.i * 0.35, E.back);
        set(F.pill, { transform: tr(F.x, F.y + 30 * (1 - k), lerp(0.5, 1, k)), opacity: f3(clamp(k * 2)) });
        const ak = ramp(t, 99.0 + F.i * 0.2, 99.8 + F.i * 0.2, E.out);
        const bx = 540 + (F.x < 540 ? -150 : 150), by = 870;
        set(F.arrow, { d: `M ${F.x} ${F.y + 34} Q ${f1((F.x + bx) / 2)} ${f1(F.y + 160)} ${f1(lerp(F.x, bx, ak))} ${f1(lerp(F.y + 34, by, ak))}`, opacity: f3(ak > 0 ? 1 : 0) });
      });
      const qk = ramp(t, 101.6, 102.1, E.back);
      set(box, { transform: tr(540, 980, ramp(t, 98.6, 99.2, E.back)) });
      set(q, { opacity: f3(0.35 + 0.65 * qk), transform: `translate(0,40) scale(${f3(lerp(0.7, 1, qk) * (1 + 0.04 * Math.sin(t * 5)))}) translate(0,-40)` });
      // B: 105.2 «distinguir entre comprender… y justificarlo» (110.7)
      const bk = ramp(t, 105.2, 105.7, E.out5);
      set(B, { opacity: f3(bk), transform: `translate(0,${f1(760 + 30 * (1 - bk))})` });
      const dv = ramp(t, 105.1, 105.6, E.out5);
      if (t > 105) set(divider, { height: f1(700 * dv), y: f1(760 - 350 * dv) });
      set(exBar, { width: f1(320 * ramp(t, 108.4, 108.9, E.out)) });
      set(ex, { fill: t > 108.5 ? C.yellow : C.white });
      const go = ramp(t, 110.7, 111.8, E.inOut);
      set(ju, { opacity: f3(1 - go), transform: `translate(${f1(810 + 260 * go)},0) scale(${f3(lerp(1, 0.6, go))}) translate(-810,0)`, fill: go > 0 ? GREY : C.white });
    },
  };
}
