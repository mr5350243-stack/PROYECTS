// ESCENA 08 — EL PATRÓN PSICOLÓGICO (57.4 – 67.1 s)
// Las cinco situaciones aparecen como viñetas pequeñas alrededor de la protagonista; líneas las conectan y forman
// una red que la rodea y se cierra (limita su libertad y autonomía). «CONTROL COERCITIVO» (fx_data).
// La cámara se desplaza entre las viñetas. «No necesitas esperar a recibir un golpe…»: la red se vuelve roja.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeA, makeSignal, SIGNALS } from '../common.js';
import { RED2, CORAL } from '../style.js';

export const S08 = { start: 57.4, end: 67.1 };
const CEN = { x: 540, y: 900 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  const web = el('path', { fill: 'none', stroke: C.yellow, 'stroke-width': 6, 'stroke-linejoin': 'round', opacity: 0 }, cam);
  const spokes = el('g', {}, cam);
  const a = makeA(cam);
  const pts = [0, 1, 2, 3, 4].map(i => { const ang = -Math.PI / 2 + i * Math.PI * 2 / 5; return { x: CEN.x + Math.cos(ang) * 380, y: CEN.y + Math.sin(ang) * 360 }; });
  const sp = pts.map(() => el('line', { stroke: C.yellow, 'stroke-width': 4, 'stroke-dasharray': '6 10', opacity: 0 }, spokes));
  const vign = pts.map((p, i) => {
    const g = el('g', { opacity: 0 }, cam);
    el('rect', { x: -120, y: -110, width: 240, height: 220, rx: 20, fill: '#16285e', stroke: '#2a4796', 'stroke-width': 4 }, g);
    const s = makeSignal(g, i, 54); set(s, { transform: 'translate(0,-20)' });
    el('text', { x: 0, y: 82, 'font-size': 20, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 1 }, g).textContent = SIGNALS[i];
    return { g, ...p, i };
  });
  return {
    render(t, ctx) {
      const ent = ramp(t, 57.4, 58.1, E.out5);
      // la cámara recorre las viñetas y termina en plano general
      const tour = ramp(t, 58.0, 61.0, E.inOut), all = ramp(t, 61.0, 62.0, E.inOut);
      const ang = -Math.PI / 2 + tour * Math.PI * 2 * 0.8;
      const fx = lerp(CEN.x + Math.cos(ang) * 200, CEN.x, all), fy = lerp(CEN.y + Math.sin(ang) * 180, CEN.y, all);
      set(cam, { transform: `translate(540,820) scale(${f3(lerp(1.35, 0.95, all))}) translate(${f1(-fx)},${f1(-fy)})`, opacity: f3(ent) });
      vign.forEach(v => { const k = ramp(t, 57.6 + v.i * 0.3, 58.0 + v.i * 0.3, E.back); set(v.g, { opacity: f3(clamp(k * 2)), transform: tr(v.x, v.y, lerp(0.4, 1, k)) }); });
      // conexiones: radios hacia ella y el pentágono que la rodea
      sp.forEach((l, i) => { const k = ramp(t, 59.6 + i * 0.12, 60.1 + i * 0.12); set(l, { x1: CEN.x, y1: CEN.y, x2: f1(lerp(CEN.x, pts[i].x, k)), y2: f1(lerp(CEN.y, pts[i].y, k)), opacity: f3(k) }); });
      const wk = ramp(t, 60.4, 61.6, E.inOut), close = ramp(t, 62.8, 64.5, E.inOut);
      const shrink = lerp(1, 0.62, close);
      const pp = pts.map(p => ({ x: CEN.x + (p.x - CEN.x) * shrink, y: CEN.y + (p.y - CEN.y) * shrink }));
      const n = Math.max(1, Math.round(wk * 5));
      set(web, { d: 'M ' + pp.concat([pp[0]]).slice(0, n + 1).map(p => `${f1(p.x)} ${f1(p.y)}`).join(' L '), opacity: f3(wk > 0 ? 1 : 0), stroke: close > 0.5 ? RED2 : C.yellow, 'stroke-width': f1(lerp(6, 12, close)) });
      vign.forEach((v, i) => set(v.g, { transform: tr(pp[i].x, pp[i].y, lerp(1, 0.8, close) * ramp(t, 57.6 + i * 0.3, 58.0 + i * 0.3, E.back)) }));
      sp.forEach((l, i) => set(l, { x2: f1(pp[i].x), y2: f1(pp[i].y) }));
      const sad = ramp(t, 62.0, 64.0);
      drawPerson(a, { x: CEN.x, y: CEN.y + 170, s: 0.9, face: 1, phase: 0, stride: 0, handB: { x: 10, y: -170 }, handF: { x: 30, y: -168 }, headR: lerp(0, 16, sad), smile: lerp(0, -0.5, sad), lean: 3 * sad });
    },
  };
}
