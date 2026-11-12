// ESCENA 06 — ¿CÓMO ES POSIBLE? (54.3 – 65.75 s)
// El cerebro, rodeado de objetos flotantes en órbita 2.5D. Una linterna (la atención) proyecta un haz que ilumina
// solo algunos objetos; los demás siguen visibles pero fuera de foco. La cámara sigue el haz.
// «ATENCIÓN SELECTIVA» viaja anclada al punto iluminado (TIPO D, fx_data, ancla «beam»).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '../lib.js';
import { makeBrain } from '../brain.js';
import { icon } from '../icons.js';
import { BRAIN_AT } from './s05.js';

export const S06 = { start: 54.3, end: 65.75 };
const NAMES = ['clock', 'phone', 'key', 'mug', 'book', 'umbrella', 'headphones', 'star', 'plant', 'glasses'];
// objetivos del haz (índice de objeto, desde t)
const FOCUS = [[1, 54.6], [4, 57.0], [7, 59.4], [2, 61.6], [8, 63.5]];

export function create(layer) {
  const cam = el('g', {}, layer);
  const back = el('g', {}, cam), mid = el('g', {}, cam), front = el('g', {}, cam);
  const beam = el('path', { fill: 'url(#beamGrad)', opacity: 0 }, mid);
  const beamSpot = el('ellipse', { rx: 120, ry: 90, fill: C.yellow, opacity: 0, filter: 'url(#soft)' }, mid);
  const brainG = el('g', {}, mid); makeBrain(brainG);
  // linterna sujeta al cerebro
  const torch = el('g', {}, mid);
  el('rect', { x: -26, y: -16, width: 92, height: 32, rx: 10, fill: C.ink }, torch);
  el('path', { d: 'M 60 -26 L 96 -36 L 96 36 L 60 26 Z', fill: '#3a5cb8' }, torch);
  el('rect', { x: 92, y: -36, width: 10, height: 72, rx: 4, fill: C.yellow }, torch);
  el('rect', { x: 0, y: -8, width: 20, height: 16, rx: 4, fill: C.orange }, torch);
  const objs = NAMES.map((n, i) => {
    const g = el('g', {}, mid);
    const inner = icon(g, n);
    const veil = el('circle', { r: 86, fill: C.ink, opacity: 0.5 }, g);
    const halo = el('circle', { r: 96, fill: 'none', stroke: C.yellow, 'stroke-width': 8, opacity: 0 }, g);
    g.insertBefore(halo, inner);
    return { g, veil, halo, a: i / NAMES.length * Math.PI * 2, rx: 400, ry: 520, lit: 0 };
  });
  const posOf = (o, t) => {
    const a = o.a + t * 0.12;
    const depth = Math.sin(a);                        // −1 detrás … 1 delante
    return { x: BRAIN_AT.x + Math.cos(a) * o.rx * 0.95, y: BRAIN_AT.y + Math.sin(a) * o.ry * 0.62 + Math.cos(a * 2) * 30, s: lerp(0.62, 1.05, (depth + 1) / 2), depth };
  };
  return {
    render(t, ctx) {
      // a quién apunta el haz (transición suave entre objetivos)
      let cur = FOCUS[0], prev = FOCUS[0];
      for (const f of FOCUS) if (t >= f[1]) { prev = cur; cur = f; }
      const P = objs.map(o => posOf(o, t));
      const k = ramp(t, cur[1], cur[1] + 0.7, E.inOut);
      const target = { x: lerp(P[prev[0]].x, P[cur[0]].x, k), y: lerp(P[prev[0]].y, P[cur[0]].y, k) };
      // cámara: sigue el haz (desplazamiento parcial hacia el objetivo) con ligero zoom
      const enter = ramp(t, 54.3, 55.2, E.out);
      const cx = lerp(BRAIN_AT.x, target.x, 0.32 * enter), cy = lerp(BRAIN_AT.y, target.y, 0.25 * enter);
      set(cam, { transform: `translate(540,900) scale(${f3(lerp(1, 1.08, enter))}) translate(${f1(-cx)},${f1(-cy + 40)})` });
      set(brainG, { transform: tr(BRAIN_AT.x, BRAIN_AT.y + Math.sin(t * 1.4) * 8, BRAIN_AT.s) });
      // linterna: delante del cerebro, apuntando al objetivo
      const src = { x: BRAIN_AT.x + 40, y: BRAIN_AT.y + 150 };
      const ang = Math.atan2(target.y - src.y, target.x - src.x);
      set(torch, { transform: `translate(${f1(src.x)},${f1(src.y)}) rotate(${f1(ang * 180 / Math.PI)})`, opacity: f3(enter) });
      const tip = { x: src.x + Math.cos(ang) * 100, y: src.y + Math.sin(ang) * 100 };
      const nx = -Math.sin(ang), ny = Math.cos(ang), w0 = 34, w1 = 130;
      set(beam, { d: `M ${f1(tip.x + nx * w0)} ${f1(tip.y + ny * w0)} L ${f1(target.x + nx * w1)} ${f1(target.y + ny * w1)} L ${f1(target.x - nx * w1)} ${f1(target.y - ny * w1)} L ${f1(tip.x - nx * w0)} ${f1(tip.y - ny * w0)} Z`, opacity: f3(0.75 * enter) });
      set(beamSpot, { cx: f1(target.x), cy: f1(target.y), opacity: f3(0.35 * enter) });
      // objetos: profundidad (orden y escala) + foco
      objs.forEach((o, i) => {
        const p = P[i];
        const d = Math.hypot(p.x - target.x, p.y - target.y);
        const lit = clamp(1 - (d - 60) / 140);
        set(o.g, { transform: tr(p.x, p.y, p.s * lerp(0.85, 1.12, lit), Math.sin(t + i) * 8), opacity: f3(ramp(t, 54.3 + i * 0.05, 54.8 + i * 0.05)) });
        set(o.veil, { opacity: f3(0.55 * (1 - lit)) });
        set(o.halo, { opacity: f3(lit) });
        (p.depth < -0.2 ? back : front).appendChild(o.g);
      });
      ctx.anchors.beam = { x: target.x * 1 + 0, y: target.y, s: 1, skew: -3 };
      // el ancla está en coordenadas de cámara → pasarla a pantalla
      const S_ = lerp(1, 1.08, enter);
      ctx.anchors.beam = { x: 540 + (target.x - cx) * S_, y: 900 + (target.y - cy + 40) * S_, s: 1, skew: -3 };
    },
  };
}
