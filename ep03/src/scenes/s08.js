// ESCENA 08 — LA ADVERTENCIA (57.0 – 69.9 s)
// «Pero cuidado» (CUIDADO, fx_data). Ignorar o manipular ≠ amor (iconos tachados). Balanza editorial con
// «INCERTIDUMBRE» y «RELACIÓN SALUDABLE»; aparece una línea divisoria entre ambos. Travelling lateral.
// «NO ES UNA REGLA UNIVERSAL» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { makeScale } from '/ep02/src/common.js';
import { HEART } from '../common.js';
import { CORAL } from '../style.js';

export const S08 = { start: 57.0, end: 69.9 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  // parte A: ignorar / manipular ≠ amor
  const A = el('g', {}, cam);
  const mk = (label, x, draw) => { const g = el('g', { transform: `translate(${x},780)` }, A); el('circle', { r: 150, fill: '#16285e' }, g); draw(g); const t = el('text', { x: 0, y: 220, 'font-size': 36, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 2 }, g); t.textContent = label; return g; };
  const ign = mk('IGNORAR', 280, g => { el('rect', { x: -50, y: -80, width: 100, height: 160, rx: 16, fill: C.ink, transform: 'rotate(80)' }, g); el('path', { d: 'M -70 -60 L 70 60', stroke: '#a9b3cf', 'stroke-width': 10, 'stroke-linecap': 'round' }, g); });
  const man = mk('MANIPULAR', 800, g => { el('path', { d: 'M -60 -100 L -60 -20 M 0 -110 L 0 0 M 60 -100 L 60 -20', stroke: '#a9b3cf', 'stroke-width': 5 }, g); el('rect', { x: -90, y: -116, width: 180, height: 16, rx: 8, fill: C.orange }, g); el('circle', { cx: 0, cy: 30, r: 26, fill: '#c9cfe0' }, g); el('path', { d: 'M -60 -20 L -30 60 M 60 -20 L 30 60 M 0 56 L 0 110', stroke: '#c9cfe0', 'stroke-width': 12, 'stroke-linecap': 'round' }, g); });
  const neq = el('g', { opacity: 0 }, A);
  el('text', { x: 540, y: 450, 'font-size': 120, 'font-weight': 900, fill: CORAL, 'text-anchor': 'middle' }, neq).textContent = '≠';
  el('path', { d: HEART, fill: CORAL, transform: 'translate(540,560) scale(5)' }, neq);
  const strikes = [ign, man].map(g => el('line', { x1: -170, y1: 170, x2: 170, y2: -170, stroke: CORAL, 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0 }, g));
  // parte B: balanza
  const B = el('g', { opacity: 0 }, cam);
  const sc = makeScale(el('g', { transform: 'translate(1640,880) scale(1.2)' }, B));
  const chip = (txt, col, x) => { const g = el('g', {}, B); const t = el('text', { x: 0, y: 12, 'font-size': 34, 'font-weight': 900, fill: C.ink, 'text-anchor': 'middle' }, g); t.textContent = txt; const w = t.getComputedTextLength() + 50; g.insertBefore(el('rect', { x: -w / 2, y: -34, width: w, height: 68, rx: 34, fill: col }), t); return g; };
  const c1 = chip('INCERTIDUMBRE', C.yellow), c2 = chip('RELACIÓN SALUDABLE', CORAL);
  const divider = el('rect', { x: 1634, y: 300, width: 12, height: 0, rx: 6, fill: C.white }, B);
  return {
    render(t, ctx) {
      const ent = ramp(t, 57.0, 57.6, E.out5);
      // ignorar (58.6) · manipular (59.3) · «produzca amor» (61.5): tachados
      [ign, man].forEach((g, i) => { const k = ramp(t, 58.4 + i * 0.6, 58.9 + i * 0.6, E.back); set(g, { transform: tr(i ? 800 : 280, 780 + 40 * (1 - k), lerp(0.5, 1, k)), opacity: f3(clamp(k * 2)) }); });
      set(neq, { opacity: f3(ramp(t, 61.0, 61.4)) });
      strikes.forEach((s, i) => set(s, { opacity: f3(ramp(t, 61.6 + i * 0.15, 61.8 + i * 0.15)) }));
      // travelling lateral hacia la balanza
      const pan = ramp(t, 62.4, 63.6, E.inOut);
      set(A, { opacity: f3(1 - ramp(t, 62.4, 63.0)) });
      set(B, { opacity: f3(ramp(t, 62.6, 63.2)) });
      const pan2 = ramp(t, 63.6, 68.8, E.inOut);
      set(cam, { transform: `translate(${f1(-pan * 1100 - pan2 * 120 + 60 * pan2)},0)`, opacity: f3(ent) });
      // la balanza: la incertidumbre pesa en la atracción, pero no garantiza una relación saludable
      sc.tilt(lerp(0, 14, ramp(t, 64.5, 65.6, E.backSoft)) + Math.sin(t * 1.6) * 2);
      const bx = 1640, by = 880 - 150 * 1.2;
      const a = lerp(0, 14, ramp(t, 64.5, 65.6, E.backSoft)) * Math.PI / 180;
      set(c1, { transform: tr(bx - Math.cos(a) * 250 * 1.2, by - Math.sin(a) * 250 * 1.2 + 260, ramp(t, 63.2, 63.6, E.back)) });
      set(c2, { transform: tr(bx + Math.cos(a) * 250 * 1.2, by + Math.sin(a) * 250 * 1.2 + 260, ramp(t, 63.5, 63.9, E.back)) });
      set(divider, { height: f1(900 * ramp(t, 67.6, 68.4, E.inOut)) });
    },
  };
}
