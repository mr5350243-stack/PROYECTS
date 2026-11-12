// ESCENA 11 — LO QUE EL CEREBRO SELECCIONA (101.95 – 111.95 s)
// Gran mosaico de situaciones cotidianas. La cámara sale de la ventana de la cancha y se desplaza entre ventanas;
// un foco de atención se mueve: la ventana atendida gana detalle; las demás conservan su aspecto pero pierden énfasis.
// «TU ATENCIÓN SELECCIONA» (fx_data). Al final todo el mosaico se encoge dentro de la pupila (escena 12, debajo).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '../lib.js';
import { icon } from '../icons.js';
import { makePerson, drawPerson, ARMS, SKIN, HAIR } from '../characters.js';

export const S11 = { start: 101.95, end: 111.95, z: 20 };
const TW = 330, TH = 300, GAP = 28, COLS = 3, ROWS = 6;
const TILES = [
  ['#2a4796', 'mug', 'plant', 'COCINA'], ['#ff7a2f', 'umbrella', 'star', 'LLUVIA'], ['#1f3a80', 'book', 'glasses', 'LECTURA'],
  ['#ffc93c', 'clock', 'phone', 'ESTACIÓN'], ['court', null, null, 'PARTIDO'], ['#3a5cb8', 'headphones', 'star', 'MÚSICA'],
  ['#e2581f', 'phone', 'mug', 'MENSAJES'], ['#16285e', 'key', 'book', 'LLAVES'], ['#ffc93c', 'plant', 'umbrella', 'PARQUE'],
  ['#1f3a80', 'glasses', 'clock', 'OFICINA'], ['#ff7a2f', 'ball', 'star', 'JUEGO'], ['#2a4796', 'umbrella', 'key', 'CALLE'],
  ['#3a5cb8', 'clock', 'mug', 'CAFÉ'], ['#ffc93c', 'headphones', 'phone', 'AUTOBÚS'], ['#16285e', 'star', 'plant', 'NOCHE'],
  ['#e2581f', 'book', 'lens', 'BIBLIOTECA'], ['#2a4796', 'ball', 'headphones', 'GIMNASIO'], ['#1f3a80', 'lens', 'glasses', 'MUSEO'],
];
const FOCUS = [[7, 103.2], [12, 104.9], [9, 106.6], [10, 108.1]];   // ventana atendida desde t
const pos = (i) => ({ x: (i % COLS) * (TW + GAP) + TW / 2 - ((COLS * TW + (COLS - 1) * GAP) / 2) + 540, y: Math.floor(i / COLS) * (TH + GAP) + TH / 2 });

export function create(layer) {
  const clipC = el('circle', { cx: 540, cy: 880, r: 3000 }, el('clipPath', { id: 's11clip' }, layer));
  const root = el('g', { 'clip-path': 'url(#s11clip)' }, layer);
  el('rect', { x: -200, y: -200, width: 1480, height: 2320, fill: C.ink }, root);
  const cam = el('g', {}, root);
  const tiles = TILES.map(([bg, a, b, label], i) => {
    const p = pos(i);
    const g = el('g', {}, cam), inner = el('g', {}, g);
    const cid = `s11t${i}`;
    el('clipPath', { id: cid }, g).appendChild(el('rect', { x: -TW / 2, y: -TH / 2, width: TW, height: TH, rx: 18 }));
    const cg = el('g', { 'clip-path': `url(#${cid})` }, inner);
    if (bg === 'court') {
      el('rect', { x: -TW / 2, y: -TH / 2, width: TW, height: TH, fill: '#13255a' }, cg);
      el('path', { d: `M -120 -40 L 120 -40 L 200 160 L -200 160 Z`, fill: '#f6c47e' }, cg);
      el('path', { d: 'M -60 -40 L -70 40 L 70 40 L 60 -40', fill: 'none', stroke: '#fff', 'stroke-width': 4 }, cg);
      [[-90, 60, C.white], [40, 20, '#1f2340'], [90, 90, C.white], [-30, 100, '#1f2340']].forEach(([x, y, c]) => { el('circle', { cx: x, cy: y - 34, r: 10, fill: '#e8b48c' }, cg); el('rect', { x: x - 12, y: y - 24, width: 24, height: 34, rx: 8, fill: c }, cg); });
      el('circle', { cx: 0, cy: 10, r: 9, fill: C.orange }, cg);
    } else {
      el('rect', { x: -TW / 2, y: -TH / 2, width: TW, height: TH, fill: bg }, cg);
      el('circle', { cx: 90, cy: -80, r: 120, fill: '#fff', opacity: 0.08 }, cg);
      el('rect', { x: -TW / 2, y: 70, width: TW, height: 90, fill: C.ink, opacity: 0.18 }, cg);
      icon(cg, a, { transform: 'translate(-30,0) scale(0.95)' });
    }
    // detalle extra que aparece cuando la ventana recibe atención
    const det = el('g', { opacity: 0 }, cg);
    if (b) icon(det, b, { transform: 'translate(95,30) scale(0.6)' });
    for (let k = 0; k < 4; k++) el('circle', { cx: -120 + k * 22, cy: -110, r: 5, fill: C.white, opacity: 0.8 }, det);
    const pill = el('g', { transform: `translate(0,${TH / 2 - 40})` }, det);
    el('rect', { x: -96, y: -24, width: 192, height: 48, rx: 24, fill: C.ink, opacity: 0.85 }, pill);
    const lt = el('text', { x: 0, y: 10, 'font-size': 24, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 2 }, pill); lt.textContent = label;
    const veil = el('rect', { x: -TW / 2, y: -TH / 2, width: TW, height: TH, rx: 18, fill: C.ink, opacity: 0 }, inner);
    const frame = el('rect', { x: -TW / 2, y: -TH / 2, width: TW, height: TH, rx: 18, fill: 'none', stroke: C.yellow, 'stroke-width': 10, opacity: 0 }, inner);
    return { g, inner, det, veil, frame, p };
  });
  const spot = el('ellipse', { rx: 260, ry: 230, fill: C.yellow, opacity: 0, filter: 'url(#soft)' }, cam);
  cam.insertBefore(spot, cam.firstChild);
  return {
    render(t, ctx) {
      let cur = null, prev = null;
      for (const f of FOCUS) if (t >= f[1]) { prev = cur; cur = f; }
      const fk = cur ? ramp(t, cur[1], cur[1] + 0.5, E.inOut) : 0;
      // cámara: sale de la ventana de la cancha, recorre el mosaico y sigue al foco
      const start = pos(4), out = ramp(t, 101.95, 103.2, E.inOut);
      const tgt = cur ? (prev ? { x: lerp(pos(prev[0]).x, pos(cur[0]).x, fk), y: lerp(pos(prev[0]).y, pos(cur[0]).y, fk) } : pos(cur[0])) : start;
      const drift = { x: lerp(540, tgt.x, 0.45), y: lerp(start.y, tgt.y, 0.75) };
      const cx = lerp(start.x, drift.x, out), cy = lerp(start.y, drift.y, out);
      const z = lerp(3.3, 1.12, out) * (1 + 0.05 * ramp(t, 103.2, 111));
      set(cam, { transform: `translate(540,900) scale(${f3(z)}) translate(${f1(-cx)},${f1(-cy)})` });
      tiles.forEach((T, i) => {
        const on = cur && cur[0] === i ? fk : (prev && prev[0] === i ? 1 - fk : 0);
        const any = cur ? 1 : 0;
        set(T.g, { transform: tr(T.p.x, T.p.y, 1 + 0.1 * on) });
        set(T.det, { opacity: f3(on) });
        set(T.veil, { opacity: f3(0.58 * any * (1 - on) * ramp(t, 103.0, 103.4)) });
        set(T.frame, { opacity: f3(on) });
        if (on > 0.5) cam.appendChild(T.g);
      });
      if (cur) set(spot, { cx: f1(tgt.x), cy: f1(tgt.y), opacity: f3(0.3 * ramp(t, 103.0, 103.4)) });
      // final: el mosaico se encoge dentro de la pupila del ojo (escena 12)
      const sh = ramp(t, 111.0, 111.9, E.inOut);
      set(clipC, { r: f1(lerp(1500, 82, sh)) });
      set(root, { transform: `translate(540,880) scale(${f3(lerp(1, 0.16, sh))}) translate(-540,-880)` });
      if (sh > 0) set(clipC, { r: f1(lerp(1500, 82 / lerp(1, 0.16, sh), sh)) });
    },
  };
}
