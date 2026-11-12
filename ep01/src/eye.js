// Ojo ilustrado de la prueba aprobada como componente (escenas 01, 07 y 12). Coordenadas locales centradas en (0,0).
import { el, set, id, C, f1 } from './lib.js';

const almond = (o, w = 380, h = 250) => `M ${-w} 0 Q 0 ${f1(-h * o)} ${w} 0 Q 0 ${f1(h * o)} ${-w} 0 Z`;
function qpt(t, w, h) {
  const x = (1 - t) * (1 - t) * -w + t * t * w, y = 2 * (1 - t) * t * -h;
  const dx = 2 * w, dy = 2 * (1 - t) * -h + 2 * t * h;
  return { x, y, nx: dy, ny: -dx };
}
export function makeEye(parent, { brow = true, shadow = true } = {}) {
  const g = el('g', {}, parent);
  const clipId = id('eyeclip');
  const cp = el('clipPath', { id: clipId }, g); const clipPath = el('path', {}, cp);
  if (shadow) el('ellipse', { cx: 0, cy: 30, rx: 420, ry: 250, fill: '#050b20', opacity: 0.45, filter: 'url(#soft)' }, g);
  const scl = el('path', { fill: 'url(#scleraShade)' }, g);
  const irisG = el('g', { 'clip-path': `url(#${clipId})` }, g);
  const irisInner = el('g', {}, irisG);
  el('circle', { r: 150, fill: 'url(#iris)' }, irisInner);
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * Math.PI * 2;
    el('line', { x1: Math.cos(a) * 72, y1: Math.sin(a) * 72, x2: Math.cos(a) * 140, y2: Math.sin(a) * 140, stroke: '#c94a14', 'stroke-width': 4, opacity: 0.35, 'stroke-linecap': 'round' }, irisInner);
  }
  el('circle', { r: 150, fill: 'none', stroke: '#9b3510', 'stroke-width': 8, opacity: 0.6 }, irisInner);
  const pupil = el('circle', { r: 66, fill: C.ink }, irisInner);
  const pupilSlot = el('g', {}, irisInner);          // contenido opcional dentro de la pupila
  const hl1 = el('circle', { cx: -40, cy: -44, r: 22, fill: '#fff', opacity: 0.95 }, irisInner);
  const hl2 = el('circle', { cx: 46, cy: 40, r: 9, fill: '#fff', opacity: 0.7 }, irisInner);
  const lidTop = el('path', { fill: 'none', stroke: C.white, 'stroke-width': 16, 'stroke-linecap': 'round' }, g);
  const lidBot = el('path', { fill: 'none', stroke: '#8fa3d8', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.7 }, g);
  const lashes = [];
  for (let i = 0; i < 7; i++) lashes.push(el('line', { stroke: C.white, 'stroke-width': 10, 'stroke-linecap': 'round' }, g));
  const browEl = brow ? el('path', { d: 'M -300 -330 Q 0 -420 300 -330', fill: 'none', stroke: '#2f4c9c', 'stroke-width': 26, 'stroke-linecap': 'round' }, g) : null;
  // o: apertura (0 cerrado – 1 abierto) · look: desplazamiento del iris · pupilR: radio de pupila
  function render({ o = 1, look = { x: 0, y: 0 }, pupilR = 66, highlights = 1 }) {
    set(scl, { d: almond(o) }); set(clipPath, { d: almond(o) });
    set(lidTop, { d: `M -380 0 Q 0 ${f1(-250 * o)} 380 0` }); set(lidBot, { d: `M -360 6 Q 0 ${f1(244 * o)} 360 6` });
    lashes.forEach((l, i) => { const q = qpt(0.2 + i * 0.1, 380, 250 * o); const n = Math.hypot(q.nx, q.ny) || 1; set(l, { x1: f1(q.x), y1: f1(q.y), x2: f1(q.x + q.nx / n * 42), y2: f1(q.y + q.ny / n * 42) }); });
    if (browEl) set(browEl, { transform: `translate(0,${f1(-20 * (1 - o))})` });
    set(irisInner, { transform: `translate(${f1(look.x)},${f1(look.y)})` });
    set(pupil, { r: f1(pupilR) });
    set(hl1, { opacity: 0.95 * highlights }); set(hl2, { opacity: 0.7 * highlights });
  }
  return { g, render, irisInner, pupil, pupilSlot };
}
