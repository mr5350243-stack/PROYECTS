// Personajes vectoriales de la prueba aprobada (mismas proporciones, colores y animación de piernas/brazos),
// extraídos como componentes: makePerson/drawPerson y makeGorilla/drawGorilla. Coordenadas: pies en (x, y), escala s.
import { el, set, clamp, C, f1, f3 } from './lib.js';

export const SKIN = ['#f1c7a1', '#c98d63', '#8a5a3c', '#e8b48c', '#a8714b', '#f3d2b4', '#d9a37c', '#b77b55'];
export const HAIR = ['#2a1b12', '#14110f', '#3b2416', '#6b3f1f', '#121212', '#c58b3a', '#5a3a22', '#2b2b33'];

// cinemática de 2 segmentos
export function ik(ox, oy, tx, ty, l1, l2, bend) {
  let dx = tx - ox, dy = ty - oy; let d = Math.hypot(dx, dy);
  const maxd = l1 + l2 - 0.5; if (d > maxd) { tx = ox + dx / d * maxd; ty = oy + dy / d * maxd; dx = tx - ox; dy = ty - oy; d = maxd; }
  const a = Math.atan2(dy, dx), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const b = a + bend * Math.acos(c);
  return { jx: ox + Math.cos(b) * l1, jy: oy + Math.sin(b) * l1, tx, ty };
}

// opts: shirt, pants, skin, hair, style (0 corto, 1 moño, 2 melena), coat (bata), glasses, shoes, shadow (color sombra)
export function makePerson(parent, o) {
  const g = el('g', {}, parent);
  const sh = el('ellipse', { rx: 64, ry: 15, fill: o.shadow || '#7a4316', opacity: 0.35 }, g);
  const body = el('g', {}, g);
  const lw = { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const legB = el('path', { ...lw, stroke: o.pants, 'stroke-width': 30 }, body);
  const armB = el('path', { ...lw, stroke: o.coat ? o.coat : o.skin, 'stroke-width': o.coat ? 24 : 21 }, body);
  const handBk = el('circle', { r: 11, fill: o.skin }, body);
  const legF = el('path', { ...lw, stroke: o.pants, 'stroke-width': 30 }, body);
  const shoeB = el('ellipse', { rx: 22, ry: 11, fill: o.shoes || '#1c1c28' }, body);
  const shoeF = el('ellipse', { rx: 22, ry: 11, fill: o.shoes || '#1c1c28' }, body);
  let coat = null;
  if (o.coat) coat = el('path', { fill: o.coat, d: 'M -48 -268 Q -58 -190 -56 -96 L 56 -96 Q 58 -190 48 -268 Q 0 -284 -48 -268 Z' }, body);
  const torso = el('path', { fill: o.shirt, d: 'M -44 -160 Q -50 -230 -40 -268 Q 0 -284 40 -268 Q 50 -230 44 -160 Q 0 -146 -44 -160 Z' }, body);
  if (o.coat) {
    el('path', { d: 'M -46 -268 Q -30 -200 -22 -96 L -56 -96 Q -58 -190 -48 -268 Z', fill: o.coat }, body);
    el('path', { d: 'M 46 -268 Q 30 -200 22 -96 L 56 -96 Q 58 -190 48 -268 Z', fill: o.coat }, body);
    el('path', { d: 'M -22 -96 Q -30 -200 -10 -270 M 22 -96 Q 30 -200 10 -270', stroke: '#c9cfe0', 'stroke-width': 3, fill: 'none' }, body);
    el('rect', { x: 26, y: -232, width: 18, height: 22, rx: 3, fill: '#c9cfe0' }, body);
    el('line', { x1: 32, y1: -236, x2: 32, y2: -222, stroke: C.orange, 'stroke-width': 3 }, body);
  }
  const num = el('text', { 'font-size': 34, 'font-weight': 900, fill: o.shirt === C.white ? '#0b1636' : '#f6f3ec', 'text-anchor': 'middle', opacity: 0.8, x: 0, y: -196 }, body);
  el('rect', { x: -11, y: -296, width: 22, height: 24, fill: o.skin }, body);
  const head = el('g', {}, body);
  el('ellipse', { cx: 0, cy: 0, rx: 37, ry: 40, fill: o.skin }, head);
  const st = o.style || 0;
  if (st === 0) el('path', { d: 'M -38 -6 Q -40 -46 0 -46 Q 40 -46 38 -6 Q 22 -26 -38 -6 Z', fill: o.hair }, head);
  else if (st === 1) { el('path', { d: 'M -38 -2 Q -42 -48 0 -48 Q 42 -48 38 -2 Q 10 -30 -38 -2 Z', fill: o.hair }, head); el('circle', { cx: -6, cy: -50, r: 16, fill: o.hair }, head); }
  else if (st === 2) el('path', { d: 'M -39 4 Q -44 -50 0 -48 Q 44 -50 39 4 L 34 -14 Q 0 -30 -34 -14 Z', fill: o.hair }, head);
  else if (st === 3) { el('path', { d: 'M -40 30 Q -50 -50 0 -50 Q 50 -50 40 30 L 30 -10 Q 0 -30 -30 -10 Z', fill: o.hair }, head); }  // melena larga
  else if (st === 4) { el('path', { d: 'M -36 -10 Q -36 -40 0 -42 Q 36 -40 36 -10 Q 20 -22 -36 -10 Z', fill: o.hair }, head); el('path', { d: 'M -30 14 Q 6 52 34 14 Q 30 34 4 38 Q -24 36 -30 14 Z', fill: o.hair }, head); } // barba
  el('circle', { cx: 13, cy: 2, r: 4, fill: '#1a1a24' }, head);
  el('circle', { cx: -9, cy: 2, r: 4, fill: '#1a1a24' }, head);
  const mouth = el('path', { d: 'M -6 18 Q 4 24 14 18', fill: 'none', stroke: '#6a3a28', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, head);
  if (o.glasses) {
    el('circle', { cx: 13, cy: 2, r: 11, fill: 'none', stroke: '#1a1a24', 'stroke-width': 3.5 }, head);
    el('circle', { cx: -10, cy: 2, r: 11, fill: 'none', stroke: '#1a1a24', 'stroke-width': 3.5 }, head);
    el('line', { x1: 1, y1: 2, x2: 2, y2: 2, stroke: '#1a1a24', 'stroke-width': 3.5 }, head);
  }
  const armF = el('path', { ...lw, stroke: o.coat ? o.coat : o.skin, 'stroke-width': o.coat ? 24 : 21 }, body);
  const handFr = el('circle', { r: 11, fill: o.skin }, body);
  const sleeveF = el('circle', { r: 17, fill: o.coat || o.shirt, cx: 30, cy: -256 }, body);
  const held = el('g', {}, body); // objeto en la mano delantera (teléfono, carpeta…)
  return { g, sh, body, legB, legF, armB, armF, shoeB, shoeF, torso, num, head, mouth, sleeveF, handBk, handFr, held, o };
}

// st: x, y, s, face (±1), phase, stride, handB/handF {x,y} locales, num, lean, headR, headX, smile (0..1), sit (0..1)
export function drawPerson(P, st) {
  set(P.g, { transform: `translate(${f1(st.x)},${f1(st.y)}) scale(${f3(st.s * st.face)},${f3(st.s)})` });
  if (st.opacity !== undefined) set(P.g, { opacity: f3(st.opacity) });
  const bob = Math.abs(Math.sin(st.phase)) * 6 * st.stride;
  set(P.body, { transform: `translate(0,${f1(-bob)}) rotate(${f1(st.lean || 0)})` });
  const hipY = -150, sw = Math.sin(st.phase) * 34 * st.stride, lift = (k) => Math.max(0, Math.sin(st.phase + k)) * 26 * st.stride;
  const legs = [[P.legB, P.shoeB, -12, sw, lift(0)], [P.legF, P.shoeF, 12, -sw, lift(Math.PI)]];
  if (st.sit) {   // sentado: el cuerpo baja 70 px; muslo horizontal y espinilla vertical (silla a cargo de la escena)
    set(P.body, { transform: `translate(0,${f1(70 * st.sit - bob)}) rotate(${f1(st.lean || 0)})` });
    for (const [path, shoe, hx] of legs) {
      const kx = hx + 78 * st.sit, ky = hipY, fy = -80 + 70 * (1 - st.sit);
      set(path, { d: `M ${hx} ${hipY} L ${f1(kx)} ${f1(ky + (1 - st.sit) * 70)} L ${f1(kx)} ${f1(fy)}` });
      set(shoe, { cx: f1(kx + 8), cy: f1(fy + 6) });
    }
  } else
  for (const [path, shoe, hx, fx, fl] of legs) {
    const k = ik(hx, hipY, hx + fx, -10 - fl + bob, 78, 78, -1);
    set(path, { d: `M ${hx} ${hipY} L ${f1(k.jx)} ${f1(k.jy)} L ${f1(k.tx)} ${f1(k.ty)}` });
    set(shoe, { cx: f1(k.tx + 8), cy: f1(k.ty + 6) });
  }
  P.num.textContent = st.num || '';
  set(P.head, { transform: `translate(${st.headX ?? 4},-322) rotate(${f1(st.headR || 0)})` });
  const sm = st.smile ?? 0.5;
  set(P.mouth, { d: `M -6 18 Q 4 ${f1(18 + 8 * sm - 2)} 14 18` });
  const arms = [[P.armB, P.handBk, -30, st.handB], [P.armF, P.handFr, 30, st.handF]];
  for (const [path, hand, sx, h] of arms) {
    const k = ik(sx, -258, h.x, h.y, 64, 62, 1);
    set(path, { d: `M ${sx} -258 L ${f1(k.jx)} ${f1(k.jy)} L ${f1(k.tx)} ${f1(k.ty)}` });
    set(hand, { cx: f1(k.tx), cy: f1(k.ty) });
    if (path === P.armF) set(P.held, { transform: `translate(${f1(k.tx)},${f1(k.ty)})` });
  }
}

// figura disfrazada de gorila (idéntica a la prueba)
export function makeGorilla(parent) {
  const g = el('g', {}, parent);
  const sh = el('ellipse', { rx: 90, ry: 20, fill: '#7a4316', opacity: 0.4 }, g);
  const body = el('g', {}, g);
  const fur = '#2b2a33', fur2 = '#3b3a46';
  const lw = { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const legB = el('path', { ...lw, stroke: fur, 'stroke-width': 46 }, body);
  const armB = el('path', { ...lw, stroke: fur, 'stroke-width': 38 }, body);
  const legF = el('path', { ...lw, stroke: fur2, 'stroke-width': 46 }, body);
  el('path', { fill: fur2, d: 'M -70 -150 Q -86 -250 -54 -300 Q 0 -330 54 -300 Q 86 -250 70 -150 Q 0 -122 -70 -150 Z' }, body);
  el('path', { d: 'M -40 -190 Q 0 -170 40 -190 Q 30 -250 0 -262 Q -30 -250 -40 -190 Z', fill: '#4a4856' }, body);
  const head = el('g', {}, body);
  el('ellipse', { cx: 0, cy: 0, rx: 46, ry: 48, fill: fur }, head);
  el('ellipse', { cx: 4, cy: 10, rx: 30, ry: 28, fill: '#6d6676' }, head);
  el('rect', { x: -26, y: -16, width: 60, height: 14, rx: 7, fill: fur2 }, head);
  el('circle', { cx: -6, cy: -4, r: 5, fill: '#f6f3ec' }, head); el('circle', { cx: 18, cy: -4, r: 5, fill: '#f6f3ec' }, head);
  el('circle', { cx: -6, cy: -4, r: 2.5, fill: '#111' }, head); el('circle', { cx: 18, cy: -4, r: 2.5, fill: '#111' }, head);
  el('ellipse', { cx: 6, cy: 14, rx: 12, ry: 6, fill: '#3b3640' }, head);
  el('path', { d: 'M -8 28 Q 6 34 20 28', stroke: '#2a2530', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, head);
  const armF = el('path', { ...lw, stroke: fur2, 'stroke-width': 38 }, body);
  const handF = el('circle', { r: 22, fill: '#3b3a46' }, body), handB = el('circle', { r: 22, fill: fur }, body);
  return { g, sh, body, legB, legF, armB, armF, head, handF, handB };
}
export function drawGorilla(G, st) {
  set(G.g, { transform: `translate(${f1(st.x)},${f1(st.y)}) scale(${f3(st.s * st.face)},${f3(st.s)})` });
  const bob = Math.abs(Math.sin(st.phase)) * 10 * st.stride;
  set(G.body, { transform: `translate(0,${f1(-bob)}) rotate(${f1(4 + Math.sin(st.phase) * 2 * st.stride)})` });
  const hipY = -150, sw = Math.sin(st.phase) * 40 * st.stride, lift = (k) => Math.max(0, Math.sin(st.phase + k)) * 24 * st.stride;
  [[G.legB, -24, sw, lift(0)], [G.legF, 24, -sw, lift(Math.PI)]].forEach(([path, hx, fx, fl]) => {
    const k = ik(hx, hipY, hx + fx, -16 - fl + bob, 76, 76, -1);
    set(path, { d: `M ${hx} ${hipY} L ${f1(k.jx)} ${f1(k.jy)} L ${f1(k.tx)} ${f1(k.ty)}` });
  });
  set(G.head, { transform: `translate(14,-334) rotate(${f1(st.headR || 0)})` });
  [[G.armB, G.handB, -52, st.handB], [G.armF, G.handF, 52, st.handF]].forEach(([path, hand, sx, h]) => {
    const k = ik(sx, -280, h.x, h.y, 96, 92, 1);
    set(path, { d: `M ${sx} -280 L ${f1(k.jx)} ${f1(k.jy)} L ${f1(k.tx)} ${f1(k.ty)}` });
    set(hand, { cx: f1(k.tx), cy: f1(k.ty) });
  });
}

// poses de brazos reutilizables (coordenadas locales del personaje)
export const ARMS = {
  rest: () => ({ handB: { x: -36, y: -150 }, handF: { x: 40, y: -150 } }),
  hold: () => ({ handB: { x: 20, y: -232 }, handF: { x: 52, y: -226 } }),
  wave: (t) => ({ handB: { x: -36, y: -150 }, handF: { x: 70 + Math.sin(t * 14) * 22, y: -380 } }),
  point: (k = 1) => ({ handB: { x: -30, y: -160 }, handF: { x: 40 + 90 * k, y: -150 - 110 * k } }),
  hips: () => ({ handB: { x: -50, y: -170 }, handF: { x: 54, y: -170 } }),
  phone: () => ({ handB: { x: 30, y: -250 }, handF: { x: 52, y: -262 } }),
  chin: () => ({ handB: { x: -30, y: -175 }, handF: { x: 34, y: -300 } }),
};
