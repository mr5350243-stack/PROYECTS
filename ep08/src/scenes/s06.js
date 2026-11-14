// ESCENA 06 — LA MENTE BUSCA EXPLICACIONES (41.0 – 53.5 s)
// Las conversaciones aparecen como piezas de rompecabezas. Ella intenta completar una pieza faltante; las piezas se
// reorganizan sin formar una respuesta definitiva. «BUSCAR RESPUESTAS» (fx_data). «…más presente puede volverse esa
// historia»: el rompecabezas crece y ocupa más espacio.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, rng } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeGirl } from '../common.js';
import { CORAL } from '../style.js';

export const S06 = { start: 41.0, end: 53.5 };
// pieza de puzle 140×140 con pestañas
const PIECE = 'M -70 -70 L -20 -70 Q -20 -100 0 -100 Q 20 -100 20 -70 L 70 -70 L 70 -20 Q 100 -20 100 0 Q 100 20 70 20 L 70 70 L 20 70 Q 20 40 0 40 Q -20 40 -20 70 L -70 70 L -70 20 Q -40 20 -40 0 Q -40 -20 -70 -20 Z';

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  const R = rng(4);
  const grid = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    if (r === 1 && c === 2) continue;   // pieza que falta
    const g = el('g', {}, cam);
    el('path', { d: PIECE, fill: ['#f6f3ec', '#c9d4f2', '#ffd0c8'][(r + c) % 3], stroke: C.navy, 'stroke-width': 5 }, g);
    el('rect', { x: -44, y: -16, width: 88, height: 12, rx: 6, fill: '#8a93ad' }, g); el('rect', { x: -44, y: 6, width: 60, height: 12, rx: 6, fill: '#a9b3cf' }, g);
    grid.push({ g, x: 300 + c * 160, y: 480 + r * 160, sx: 120 + R() * 840, sy: 300 + R() * 700, rot: (R() - 0.5) * 120, i: grid.length });
  }
  const hole = el('path', { d: PIECE, fill: 'none', stroke: C.yellow, 'stroke-width': 6, 'stroke-dasharray': '14 10', transform: 'translate(620,640) scale(0.78)' }, cam);
  const girl = makeGirl(cam);
  set(girl.P.held, { opacity: 0 });
  const piece = el('path', { d: PIECE, fill: C.yellow, stroke: C.navy, 'stroke-width': 5 }, cam);
  return {
    render(t, ctx) {
      const big = ramp(t, 50.4, 52.4, E.inOut);
      set(cam, { transform: `translate(540,700) scale(${f3(lerp(1.0, 1.25, big) * lerp(1.1, 1, ramp(t, 41.0, 41.8, E.out5)))}) translate(-540,-700)` });
      // las piezas se juntan (41.5–44.0) y se reorganizan sin cerrar (48.0–50.4)
      const join = ramp(t, 41.4, 43.8, E.inOut), shuffle = ramp(t, 48.0, 50.0, E.inOut);
      grid.forEach(P => {
        const j = ramp(join, P.i / 22, P.i / 22 + 0.55);
        const nx = grid[(P.i + 3) % grid.length].x, ny = grid[(P.i + 3) % grid.length].y;
        const x = lerp(lerp(P.sx, P.x, j), nx, shuffle * 0.999 * Math.sin(shuffle * Math.PI) + 0), y = lerp(lerp(P.sy, P.y, j), ny, Math.sin(shuffle * Math.PI) * 0.6);
        set(P.g, { transform: tr(x, y, 0.78, lerp(P.rot, 0, j) + Math.sin(shuffle * Math.PI) * 12 * ((P.i % 2) * 2 - 1)) });
      });
      set(hole, { opacity: f3(ramp(t, 43.8, 44.2)) });
      // ella intenta encajar la pieza que falta: se acerca, no encaja, se aleja
      const tryK = ramp(t, 44.2, 45.4, E.inOut) * (1 - ramp(t, 46.4, 47.4, E.inOut));
      const wob = t > 45.4 && t < 46.4 ? Math.sin(t * 22) * 8 : 0;
      set(piece, { transform: tr(lerp(820, 640, tryK) + wob, lerp(1000, 650, tryK), 0.78, lerp(30, 14, tryK)) });
      drawPerson(girl.P, { x: 760, y: 1290, s: 1.2, face: -1, phase: 0, stride: 0, handB: { x: -30, y: -160 }, handF: { x: lerp(60, 140, tryK), y: lerp(-200, -330, tryK) }, headR: -12, smile: lerp(-0.1, -0.4, ramp(t, 46, 47)) });
    },
  };
}
