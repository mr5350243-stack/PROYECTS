// ESCENA 07 — CEGUERA POR FALTA DE ATENCIÓN (65.6 – 72.3 s)
// Composición editorial: un ojo, una lupa y varios objetos delante de la palabra «ATENCIÓN» (partes del texto quedan
// ocultas tras los objetos, en capas 2.5D). Con «ceguera» (67.3 s) la composición se reorganiza y revela
// «CEGUERA / POR FALTA DE / ATENCIÓN». Sin representación literal de ceguera médica. Salida con formas geométricas.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '../lib.js';
import { makeEye } from '../eye.js';
import { icon } from '../icons.js';
import { makeGeoWipe } from '../transitions.js';

export const S07 = { start: 65.6, end: 72.35 };

export function create(layer) {
  const back = el('g', {}, layer);
  for (let i = 0; i < 40; i++) el('circle', { cx: (i * 263) % 1080, cy: 200 + (i * 397) % 1300, r: 3 + (i % 4), fill: '#2a4796', opacity: 0.4 }, back);
  const txt = el('g', {}, layer);
  const mk = (s, size, color) => { const t = el('text', { 'font-size': size, 'font-weight': 900, 'text-anchor': 'middle', fill: color, stroke: C.ink, 'stroke-width': size * 0.08, 'paint-order': 'stroke', 'letter-spacing': -size * 0.02 }, txt); t.textContent = s; return t; };
  const tAt = mk('ATENCIÓN', 210, C.white), tCeg = mk('CEGUERA', 190, C.yellow), tPor = mk('POR FALTA DE', 96, C.white);
  // objetos delante del texto (sombra + objeto); posiciones A (tapando letras) → B (enmarcando)
  const front = el('g', {}, layer);
  const mkObj = (build, A, B, depth) => {
    const g = el('g', {}, front);
    const sh = el('ellipse', { cx: 0, cy: 150, rx: 90, ry: 18, fill: '#020617', opacity: 0.35 }, g);
    const inner = el('g', {}, g); build(inner);
    return { g, inner, sh, A, B, depth };
  };
  let eye;
  const objs = [
    mkObj(g => { const w = el('g', { transform: 'scale(0.42)' }, g); eye = makeEye(w, { brow: false, shadow: false }); }, { x: 205, y: 900, s: 1.15, r: -8 }, { x: 250, y: 420, s: 0.95, r: -6 }, 1.2),
    mkObj(g => icon(g, 'lens', { transform: 'scale(1.5)' }), { x: 560, y: 950, s: 1.25, r: 10 }, { x: 860, y: 470, s: 1.0, r: 12 }, 1.4),
    mkObj(g => icon(g, 'ball'), { x: 860, y: 930, s: 1.05, r: 0 }, { x: 180, y: 1260, s: 0.8, r: 0 }, 1.1),
    mkObj(g => icon(g, 'key'), { x: 395, y: 1010, s: 1.0, r: -20 }, { x: 880, y: 1255, s: 0.9, r: 15 }, 1.3),
  ];
  const wipe = makeGeoWipe(el('g', {}, layer), [C.orange, C.yellow, '#1d2f63']);
  return {
    render(t, ctx) {
      const lt = t - 65.6;
      // entrada de la palabra ATENCIÓN y de los objetos (desde distintas profundidades)
      const ka = ramp(t, 65.65, 66.15, E.back);
      const re = ramp(t, 67.15, 67.85, E.inOut);           // reorganización con «ceguera»
      const atY = lerp(990, 1160, re), atS = lerp(1, 0.86, re);
      set(tAt, { x: 540, y: f1(atY), transform: `translate(540,${f1(atY)}) scale(${f3(lerp(0.6, 1, ka) * atS)}) translate(-540,${f1(-atY)})`, opacity: f3(clamp(ka * 2)), fill: re > 0.5 ? C.yellow : C.white });
      const kc = ramp(t, 67.3, 67.75, E.back), kp = ramp(t, 67.55, 68.0, E.back);
      set(tCeg, { x: 540, y: 820, opacity: f3(clamp(kc * 2)), transform: `translate(540,820) scale(${f3(lerp(1.6, 1, kc))}) rotate(${f1(lerp(-8, -2, kc))}) translate(-540,-820)` });
      set(tPor, { x: 540, y: 960, opacity: f3(clamp(kp * 2)), transform: `translate(0,${f1(40 * (1 - kp))})` });
      objs.forEach((o, i) => {
        const ki = ramp(t, 65.7 + i * 0.12, 66.3 + i * 0.12, E.backSoft);
        const p = { x: lerp(o.A.x, o.B.x, re), y: lerp(o.A.y, o.B.y, re) - Math.sin(re * Math.PI) * 120 * o.depth, s: lerp(o.A.s, o.B.s, re), r: lerp(o.A.r, o.B.r, re) };
        const fl = Math.sin(t * 1.5 + i * 1.7) * 10 * o.depth;
        const par = (lt * 6) * (o.depth - 1);            // paralaje: los objetos más cercanos derivan más
        set(o.g, { transform: tr(p.x + par, p.y + fl + (1 - ki) * 400 * o.depth, p.s * lerp(0.5, 1, ki), p.r), opacity: f3(clamp(ki * 2)) });
      });
      eye.render({ o: 1 - Math.max(0, Math.sin(clamp((t - 68.4) / 0.22) * Math.PI)) * 0.95, look: { x: Math.sin(t * 1.3) * 60, y: 10 } });
      // «Y no ocurre solamente en los laboratorios» → transición a un ejemplo cotidiano
      wipe(t, 71.75, 540, 1000);
    },
  };
}
