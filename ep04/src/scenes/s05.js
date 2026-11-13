// ESCENA 05 — SEÑAL 4: TRATO ESPECIAL (39.3 – 48.2 s)
// Una balanza: en un platillo, lo que él exige (comprensión, atención, concesiones); en el otro, la reciprocidad que
// ella solicita / lo que él ofrece. La balanza se inclina. «EXIGE MÁS DE LO QUE OFRECE» (fx_data).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson, ARMS } from '/ep01/src/characters.js';
import { icon } from '/ep01/src/icons.js';
import { makeScale } from '/ep02/src/common.js';
import { makeWoman, makeMan, makeBadge } from '../common.js';
import { CORAL, GREY } from '../style.js';

export const S05 = { start: 39.3, end: 48.2 };
const SC = { x: 540, y: 820, s: 1.25 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  el('ellipse', { cx: 540, cy: 860, rx: 600, ry: 620, fill: 'url(#spot2)' }, layer);
  const scG = el('g', { transform: `translate(${SC.x},${SC.y}) scale(${SC.s})` }, layer);
  const sc = makeScale(scG);
  // objetos que caen en el platillo de él (izquierda): comprensión · atención · concesiones
  const demands = [['COMPRENSIÓN', 'headphones', 42.76], ['ATENCIÓN', 'star', 43.88], ['CONCESIONES', 'key', 44.72]].map(([label, ic, t0]) => {
    const g = el('g', { opacity: 0 }, layer);
    el('circle', { r: 58, fill: C.yellow }, g); icon(g, ic, { transform: 'scale(0.6)' });
    const lt = el('text', { x: 0, y: 92, 'font-size': 24, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 1 }, g); lt.textContent = label;
    return { g, t0 };
  });
  const recip = el('g', { opacity: 0 }, layer);
  el('circle', { r: 58, fill: CORAL }, recip);
  el('path', { d: 'M -30 -12 L 30 -12 M 18 -26 L 32 -12 L 18 2 M 30 14 L -30 14 M -18 0 L -32 14 L -18 28', stroke: C.white, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, recip);
  el('text', { x: 0, y: 92, 'font-size': 24, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 1 }, recip).textContent = 'RECIPROCIDAD';
  const man = makeMan(layer), woman = makeWoman(layer);
  const labs = ['LO QUE EXIGE', 'LO QUE OFRECE'].map((s, i) => { const t = el('text', { 'font-size': 30, 'font-weight': 900, fill: i ? CORAL : C.yellow, 'text-anchor': 'middle', 'letter-spacing': 2, opacity: 0 }, layer); t.textContent = s; return t; });
  const badge = makeBadge(layer, 3);
  return {
    render(t, ctx) {
      const tilt = -lerp(0, 18, ramp(t, 42.8, 45.6, E.backSoft)) + Math.sin(t * 1.6) * 1.5;   // se inclina hacia lo que él exige
      sc.tilt(tilt);
      const a = tilt * Math.PI / 180, arm = 210 * SC.s;
      const pan = (side) => ({ x: SC.x + side * Math.cos(a) * arm, y: SC.y - 150 * SC.s + side * Math.sin(a) * arm + 180 * SC.s });
      const L = pan(-1), R = pan(1);
      demands.forEach((d, i) => { const k = ramp(t, d.t0 - 0.1, d.t0 + 0.35, E.back); set(d.g, { opacity: f3(clamp(k * 2)), transform: tr(L.x + (i - 1) * 90, L.y - 90 - (i === 1 ? 60 : 0) - 200 * (1 - k), 0.75) }); });
      const rk = ramp(t, 45.6, 46.0, E.back);
      set(recip, { opacity: f3(clamp(rk * 2)), transform: tr(R.x, R.y - 90 - 120 * (1 - rk), 0.75) });
      labs.forEach((l, i) => set(l, { x: f1(i ? R.x : L.x), y: f1((i ? R.y : L.y) + 120), opacity: f3(ramp(t, 41.0 + i * 0.4, 41.4 + i * 0.4)) }));
      // él exige (señala su platillo); ella pide reciprocidad (palmas abiertas)
      const demand = ramp(t, 42.4, 42.8);
      drawPerson(man, { x: 150, y: 1290, s: 1.05, face: 1, phase: 0, stride: 0, ...(demand > 0.5 ? ARMS.point(0.6 + 0.2 * Math.sin(t * 5)) : ARMS.hips()), headR: -6, smile: 0.6 });
      drawPerson(woman, { x: 930, y: 1290, s: 1.05, face: -1, phase: 0, stride: 0, handB: { x: 60, y: -200 }, handF: { x: 100, y: -220 }, headR: 4, smile: lerp(0.3, -0.2, ramp(t, 45.5, 46.5)) });
      badge.show(t, 39.5, 47.9);
    },
  };
}
