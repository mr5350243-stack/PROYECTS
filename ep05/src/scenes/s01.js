// ESCENA 01 — EL GANCHO (0 – 12.6 s)
// La pareja conversa en la sala; ella lo mira con preocupación. Acercamiento lento. Un símbolo de alerta aparece
// detrás de ambos (con «…nunca te ha golpeado»). «¿VIOLENCIA SIN GOLPES?» (fx_data). La sala se transforma en una
// composición psicológica abstracta: paredes y muebles se disuelven en formas; la pareja queda en silueta.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, rng } from '/ep01/src/lib.js';
import { drawPerson } from '/ep01/src/characters.js';
import { makeA, makeB, makeLiving, makeChair, makeTable, makeAlert } from '../common.js';
import { RED, RED2, CORAL } from '../style.js';

export const S01 = { start: 0, end: 12.6 };
const W = { x: 330, y: 1180 }, M = { x: 750, y: 1180 }, S = 1.3;

export function create(layer) {
  el('rect', { width: 1080, height: 1920, fill: C.navy }, layer);
  const cam = el('g', {}, layer);
  const room = el('g', {}, cam);
  makeLiving(room);
  const alert = makeAlert(cam);
  const furn = el('g', {}, cam);
  const chW = makeChair(furn, 1), chM = makeChair(furn, -1);
  set(chW, { transform: `translate(${W.x},${W.y})` }); set(chM, { transform: `translate(${M.x},${M.y}) scale(-1,1)` });
  const a = makeA(cam), b = makeB(cam);
  const table = makeTable(furn); set(table, { transform: 'translate(540,1180)' });
  cam.appendChild(table);
  // composición abstracta: formas que sustituyen a la sala
  const abs = el('g', { opacity: 0 }, cam);
  cam.insertBefore(abs, a.g);   // las formas quedan detrás de los personajes
  const R = rng(5), shapes = [];
  for (let i = 0; i < 16; i++) {
    const kind = i % 3, s = 60 + R() * 160, col = [RED, '#1f3a80', '#2a4796', CORAL][i % 4];
    const sh = kind === 0 ? el('circle', { r: s / 2, fill: 'none', stroke: col, 'stroke-width': 10 }, abs) : kind === 1 ? el('rect', { x: -s / 2, y: -s / 2, width: s, height: s, fill: col, opacity: 0.6 }, abs) : el('path', { d: `M 0 ${-s / 2} L ${s / 2} ${s / 2} L ${-s / 2} ${s / 2} Z`, fill: col, opacity: 0.7 }, abs);
    // fuera de la zona de los personajes: banda superior y laterales
    const top = i % 2 === 0, x = top ? 120 + R() * 840 : (i % 4 === 1 ? 40 + R() * 150 : 900 + R() * 150), y = top ? 360 + R() * 260 : 650 + R() * 500;
    shapes.push({ sh, x, y, r: R() * 360, d: R() * 0.6 });
  }
  const tension = el('path', { fill: 'none', stroke: RED2, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0 }, cam);
  return {
    render(t, ctx) {
      const ent = ramp(t, 0, 0.8, E.out);
      const push = ramp(t, 0.4, 8.2, E.inOut);
      set(cam, { transform: `translate(540,880) scale(${f3(lerp(1.3, 1.5, push) * lerp(1.05, 1, ent))}) translate(${f1(-lerp(540, 500, push))},-940)`, opacity: f3(ent) });
      // ella: preocupación creciente · él: conversación (gesto contenido)
      const worry = ramp(t, 1.0, 3.0, E.inOut);
      drawPerson(a, { x: W.x, y: W.y, s: S, face: 1, sit: 1, phase: 0, stride: 0, handB: { x: 50, y: -160 }, handF: { x: 70, y: -156 }, headR: lerp(-2, 9, worry) + Math.sin(t * 0.8) * 1.5, smile: lerp(0.4, -0.4, worry), lean: lerp(0, -4, worry) });
      const talk = Math.sin(t * 6) * 12;
      drawPerson(b, { x: M.x, y: M.y, s: S, face: -1, sit: 1, phase: 0, stride: 0, handB: { x: 60, y: -170 }, handF: { x: 100 + talk, y: -215 - talk * 0.5 }, headR: -4 + Math.sin(t * 2) * 2, smile: lerp(0.4, -0.1, worry) });
      // símbolo de alerta detrás de ambos (5.8 s «…nunca te ha golpeado»)
      const ak = ramp(t, 5.7, 6.2, E.back);
      set(alert, { opacity: f3(clamp(ak * 2)), transform: tr(540, 760, lerp(0.4, 0.75, ak) * (1 + 0.04 * Math.sin(t * 5))) });
      // la sala se transforma en composición abstracta (8.2 s «La violencia…»)
      const ab = ramp(t, 8.2, 9.6, E.inOut);
      set(room, { opacity: f3(1 - ab) }); set(furn, { opacity: f3(1 - ab) });
      set(abs, { opacity: f3(ab) });
      shapes.forEach(s => { const k = ramp(t, 8.2 + s.d, 9.4 + s.d, E.backSoft); set(s.sh, { transform: tr(s.x + Math.sin(t * 0.6 + s.r) * 14, s.y + Math.cos(t * 0.5 + s.r) * 14, lerp(0.2, 1, k), s.r + t * 6) }); });
      // los personajes quedan como siluetas enfrentadas, unidas por una línea de tensión
      [a, b].forEach(P => set(P.g, { opacity: f3(1 - 0.0 * ab) }));
      const tk = ramp(t, 9.6, 10.6, E.inOut);
      set(tension, { d: `M ${W.x + 120} 870 Q 540 ${f1(820 + Math.sin(t * 9) * 12 * tk)} ${f1(lerp(W.x + 120, M.x - 120, tk))} 870`, opacity: f3(tk) });
    },
  };
}
