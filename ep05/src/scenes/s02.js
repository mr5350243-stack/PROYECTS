// ESCENA 02 — INTRODUCCIÓN ABSTRACTA (12.4 – 20.5 s)
// En la composición psicológica, la pareja en silueta. «…el control (13.9), la intimidación (14.8) y el miedo (16.0)»:
// tres palabras-nodo se conectan con él. «Hay cinco señales» (17.1): aparecen las cinco insignias; la primera avanza.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeA, makeB, makeSignal } from '../common.js';
import { RED, RED2, CORAL } from '../style.js';

export const S02 = { start: 12.4, end: 20.5 };

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const glow = el('ellipse', { cx: 540, cy: 760, rx: 520, ry: 560, fill: 'url(#spot2)' }, layer);
  const cam = el('g', {}, layer);
  const a = makeA(cam), b = makeB(cam);
  const words = [['CONTROL', 13.94, 270, 470], ['INTIMIDACIÓN', 14.78, 810, 420], ['MIEDO', 15.98, 540, 300]].map(([s, t0, x, y]) => {
    const g = el('g', { opacity: 0 }, cam);
    const line = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: RED2, 'stroke-width': 5, 'stroke-dasharray': '6 10' }, g);
    const tg = el('g', {}, g);
    const tt = el('text', { x: 0, y: 14, 'font-size': 46, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle' }, tg); tt.textContent = s;
    const w = tt.getComputedTextLength() + 60;
    tg.insertBefore(el('rect', { x: -w / 2, y: -38, width: w, height: 76, rx: 38, fill: RED }), tt);
    return { g, line, tg, t0, x, y };
  });
  const sigs = [0, 1, 2, 3, 4].map(i => { const g = makeSignal(layer, i, 76); set(g, { opacity: 0 }); return g; });
  return {
    render(t, ctx) {
      const out = ramp(t, 17.0, 17.6, E.inOut);
      set(cam, { transform: `translate(540,880) scale(${f3(lerp(1.5, 1.15, ramp(t, 12.4, 13.4, E.out5)))}) translate(-540,-940)`, opacity: f3(1 - 0.75 * out) });
      drawPerson(a, { x: 330, y: 1180, s: 1.3, face: 1, phase: 0, stride: 0, handB: { x: 30, y: -170 }, handF: { x: 50, y: -168 }, headR: 10, smile: -0.4, lean: -3 });
      drawPerson(b, { x: 750, y: 1180, s: 1.3, face: -1, phase: 0, stride: 0, handB: { x: -36, y: -150 }, handF: { x: 40, y: -150 }, headR: -4, smile: -0.2 });
      words.forEach(w => {
        const k = ramp(t, w.t0, w.t0 + 0.4, E.back);
        set(w.g, { opacity: f3(clamp(k * 2)) });
        set(w.tg, { transform: tr(w.x, w.y + 20 * (1 - k), lerp(0.5, 1, k)) });
        set(w.line, { x1: w.x, y1: w.y + 30, x2: f1(lerp(w.x, 750, ramp(t, w.t0 + 0.2, w.t0 + 0.7))), y2: f1(lerp(w.y + 30, 800, ramp(t, w.t0 + 0.2, w.t0 + 0.7))) });
      });
      // las cinco señales
      sigs.forEach((g, i) => {
        const k = ramp(t, 17.1 + i * 0.15, 17.5 + i * 0.15, E.back);
        const go = ramp(t, 19.6, 20.5, E.inOut);
        const x = 140 + i * 200, y = 820;
        set(g, { opacity: f3(clamp(k * 2) * (i === 0 ? 1 : 1 - go)), transform: tr(lerp(x, 540, i === 0 ? go : 0), lerp(y, 760, i === 0 ? go : 0), lerp(0.4, 1, k) * (i === 0 ? lerp(1, 2.4, go) : 1)) });
      });
    },
  };
}
