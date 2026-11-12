// ESCENA 10 — EL SEGUNDO DESCUBRIMIENTO (83.05 – 101.95 s) · recreación conceptual (no es la grabación del estudio)
// Una persona que ya conoce el experimento observa otra escena con el gorila y esta vez lo identifica (✓).
// Mientras tanto, la cortina del fondo cambia de color y un jugador sale de escena. Repetición visual que marca
// ambos cambios. «DETECTAR UNA COSA NO ES DETECTARLO TODO» (fx_data, TIPO S).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr } from '../lib.js';
import { makeGame } from '../court.js';
import { makePerson, drawPerson, ARMS } from '../characters.js';

export const S10 = { start: 83.05, end: 101.95 };
const SCR = { x: 50, y: 330, w: 980, h: 690 };
const CS = 0.62, CC = { x: 540, y: 960 };                   // escala y centro de la cancha dentro de la pantalla
const G = (t) => t - 83.05 + 5;                             // reloj del partido
export const SCREEN10 = SCR;

export function create(layer) {
  const cam = el('g', {}, layer);
  el('rect', { x: -400, y: -400, width: 1880, height: 2800, fill: '#0f1d48' }, cam);
  el('rect', { x: -400, y: 1500, width: 1880, height: 900, fill: '#0b1636' }, cam);
  el('ellipse', { cx: 540, cy: 680, rx: 700, ry: 520, fill: '#3a5cb8', opacity: 0.12, filter: 'url(#soft)' }, cam);
  el('rect', { x: SCR.x - 22, y: SCR.y - 22, width: SCR.w + 44, height: SCR.h + 44, rx: 26, fill: C.ink }, cam);
  el('rect', { x: SCR.x + SCR.w / 2 - 30, y: SCR.y + SCR.h + 22, width: 60, height: 120, fill: C.ink }, cam);
  el('clipPath', { id: 's10scr' }, cam).appendChild(el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: SCR.h, rx: 8 }));
  const scr = el('g', { 'clip-path': 'url(#s10scr)' }, cam);
  const courtCam = el('g', { transform: `translate(${SCR.x + SCR.w / 2},${SCR.y + SCR.h / 2}) scale(${CS}) translate(${-CC.x},${-CC.y})` }, scr);
  const game = makeGame(courtCam, { t0: 4.0, trail: false, curtain: true,
    gorilla: { enter: G(88.4), center: G(90.2), resume: G(90.9), exit: G(92.9), uFrom: 1.45, uStop: 0.05, uTo: -1.5, v: 0.5 },
    leave: { team: 1, i: 1, s: G(92.0), e: G(93.8) } });
  const dim = el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: SCR.h, fill: C.ink, opacity: 0 }, scr);
  const scan = el('g', { opacity: 0 }, scr);
  for (let i = 0; i < 46; i++) el('rect', { x: SCR.x, y: SCR.y + i * 15, width: SCR.w, height: 4, fill: '#9fd3ff', opacity: 0.25 }, scan);
  const rep = el('g', { opacity: 0 }, scr);
  el('rect', { x: SCR.x + 24, y: SCR.y + 24, width: 300, height: 62, rx: 31, fill: '#ff4a4a' }, rep);
  const rt = el('text', { x: SCR.x + 174, y: SCR.y + 66, 'font-size': 30, 'font-weight': 900, fill: '#fff', 'text-anchor': 'middle', 'letter-spacing': 3 }, rep); rt.textContent = '◀◀ REPETICIÓN';
  const tagG = el('g', { opacity: 0 }, scr);
  el('rect', { x: SCR.x + SCR.w - 400, y: SCR.y + 24, width: 376, height: 56, rx: 28, fill: C.ink, opacity: 0.85 }, tagG);
  const tg = el('text', { x: SCR.x + SCR.w - 212, y: SCR.y + 61, 'font-size': 25, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 2 }, tagG); tg.textContent = 'RECREACIÓN CONCEPTUAL';
  // marcas: ✓ sobre el gorila, círculos en la cortina y en el jugador que sale
  const check = el('g', { opacity: 0 }, scr);
  el('circle', { r: 40, fill: C.yellow }, check); el('path', { d: 'M -18 2 L -4 16 L 20 -14', stroke: C.ink, 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, check);
  const mark = (label) => {
    const g = el('g', { opacity: 0 }, scr);
    const c = el('ellipse', { rx: 10, ry: 10, fill: 'none', stroke: C.yellow, 'stroke-width': 8 }, g);
    const bg = el('rect', { height: 52, rx: 26, fill: C.yellow }, g);
    const t = el('text', { 'font-size': 26, 'font-weight': 900, fill: C.ink, 'text-anchor': 'middle' }, g); t.textContent = label;
    return { g, c, bg, t };
  };
  const mCurtain = mark('LA CORTINA CAMBIÓ DE COLOR'), mPlayer = mark('UN JUGADOR SALIÓ');
  // espectador en primer plano
  const viewer = makePerson(cam, { shirt: '#3a5cb8', pants: '#1d2b5c', skin: '#f1c7a1', hair: '#6b3f1f', style: 2, shadow: '#000' });
  const toScr = (p) => ({ x: SCR.x + SCR.w / 2 + (p.x - CC.x) * CS, y: SCR.y + SCR.h / 2 + (p.y - CC.y) * CS });
  const placeMark = (m, x, y, rx, ry, k, lx, ly) => {
    set(m.g, { opacity: f3(clamp(k * 2)) });
    set(m.c, { cx: f1(x), cy: f1(y), rx: f1(rx * E.back(clamp(k))), ry: f1(ry * E.back(clamp(k))) });
    const w = m.t.getComputedTextLength() + 44;
    set(m.bg, { x: f1(lx - w / 2), y: f1(ly - 36), width: f1(w) }); set(m.t, { x: f1(lx), y: f1(ly) });
  };
  return {
    render(t, ctx) {
      // reloj del partido: directo → rebobinado → repetición → congelado
      let gt = G(t);
      if (t > 95.9) {
        const a = G(95.9), b = G(91.3), c = G(94.3);
        gt = t < 96.5 ? lerp(a, b, ramp(t, 95.9, 96.5, E.inOut)) : lerp(b, c, ramp(t, 96.5, 99.2));
      }
      const r = game.render(gt, { curtain: ramp(gt, G(91.8), G(93.4), E.inOut) });
      // entrada (desde el teléfono de la escena 09) y deriva lenta
      const ent = ramp(t, 83.05, 83.9, E.out5);
      const z = lerp(1.7, 1, ent) * (1 + 0.04 * ramp(t, 84, 95));
      set(cam, { transform: `translate(540,${f1(lerp(820, 900, ent))}) scale(${f3(z)}) translate(-540,-900)` });
      set(tagG, { opacity: f3(ramp(t, 86.3, 86.7)) });
      // espectador: mira, señala al gorila (lo detecta) y no ve lo demás
      const pt = ramp(t, 90.55, 90.9, E.out) * (1 - ramp(t, 93.0, 93.4));
      const arms = t > 95.9 ? ARMS.chin() : pt > 0 ? ARMS.point(pt) : ARMS.rest();
      drawPerson(viewer, { x: 170, y: 1840, s: 1.75, face: 1, phase: 0, stride: 0, ...arms, headR: -8 + Math.sin(t * 0.9) * 2, smile: pt > 0.5 ? 1 : 0.5 });
      // ✓ sobre el gorila cuando lo detecta
      if (r.gor) { const gp = toScr({ x: r.gor.x, y: r.gor.y - 400 * r.gor.s }); const ck = ramp(t, 90.9, 91.25, E.back) * (1 - ramp(t, 95.6, 95.9)); set(check, { opacity: f3(clamp(ck * 2) * (r.gor.visible ? 1 : 0)), transform: tr(gp.x, gp.y, ck) }); }
      // repetición: líneas de rebobinado, etiqueta y marcas sobre los cambios
      set(scan, { opacity: f3(0.8 * ramp(t, 95.9, 96.0) * (1 - ramp(t, 96.45, 96.6))) });
      set(rep, { opacity: f3(ramp(t, 95.9, 96.1) * (1 - ramp(t, 99.2, 99.4))) });
      const cu = toScr({ x: 540, y: 430 }), kc = ramp(t, 97.3, 97.7) * (1 - ramp(t, 99.15, 99.35));
      placeMark(mCurtain, cu.x, cu.y, 300, 140, kc, cu.x, cu.y + 190);
      const pl = r.people.find(p => p.team === 1 && p.i === 1);
      const pp = toScr({ x: pl.x, y: pl.y - 170 * pl.s }), kp = ramp(t, 97.9, 98.3) * (1 - ramp(t, 99.15, 99.35));
      placeMark(mPlayer, pp.x, pp.y, 70, 140, kp, clamp(pp.x, 230, 850), pp.y + 200);
      set(dim, { opacity: f3(0.62 * ramp(t, 99.2, 99.5)) });
      ctx.anchors.screen = { x: SCR.x + 260, y: SCR.y + 60, s: 1, skew: -2 };
    },
  };
}
