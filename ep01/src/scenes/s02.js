// ESCENA 02 — EL EXPERIMENTO (8.1 – 23.4 s)
// Laboratorio editorial en capas 2.5D (fondo, escritorio, investigadores, primer plano) que se abre con formas geométricas.
// Dos investigadores ilustrados observan una pantalla con el partido. Calendario 3D → 1999. Tarjetas con los nombres.
// Al final la cámara atraviesa la pantalla (enlace con la escena 03).
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, noise1 } from '../lib.js';
import { makePerson, drawPerson, ARMS } from '../characters.js';
import { makeGame } from '../court.js';

export const S02 = { start: 8.1, end: 23.45 };
const SCR = { x: 560, y: 640, w: 440, h: 330 };   // pantalla (coordenadas de su capa)
const DEPTH = { wall: 0.25, cal: 0.35, people: 0.58, desk: 0.6, fg: 1.35 };   // orden = orden de dibujo

export function create(layer) {
  const clip = el('circle', { cx: 540, cy: 900, r: 0 }, el('clipPath', { id: 's02reveal' }, layer));
  const root = el('g', { 'clip-path': 'url(#s02reveal)' }, layer);
  el('rect', { width: 1080, height: 1920, fill: '#122455' }, root);
  const OFF = 220;   // la composición se centra verticalmente
  const BASE = { s: 1.2, cx: 540, cy: 1060 };   // encuadre: la composición llena el formato vertical
  const zoomG = el('g', { transform: `translate(${BASE.cx},${BASE.cy}) scale(${BASE.s}) translate(${-BASE.cx},${-BASE.cy})` }, root);
  const L = {}, LO = {}; for (const k in DEPTH) { LO[k] = el('g', {}, zoomG); L[k] = el('g', { transform: `translate(0,${OFF})` }, LO[k]); }

  // ---- pared, ventana y estanterías
  const wall = el('g', {}, L.wall);
  el('rect', { x: -200, y: -500, width: 1480, height: 1800, fill: 'url(#labWall)' }, wall);
  for (let i = 0; i < 9; i++) el('rect', { x: -120 + i * 170, y: -200, width: 4, height: 1450, fill: '#0f1f4c', opacity: 0.5 }, wall);
  const win = el('g', { transform: 'translate(640,170)' }, wall);
  el('rect', { x: 0, y: 0, width: 380, height: 360, rx: 10, fill: '#ffd98a' }, win);
  el('rect', { x: 0, y: 0, width: 380, height: 360, rx: 10, fill: 'url(#winGlow)' }, win);
  for (let i = 0; i < 12; i++) el('rect', { x: 0, y: 12 + i * 29, width: 380, height: 12, fill: '#f3c56a', opacity: 0.8 }, win);
  el('rect', { x: -8, y: -8, width: 396, height: 376, rx: 14, fill: 'none', stroke: '#0b1636', 'stroke-width': 16 }, win);
  el('path', { d: 'M 380 360 L 520 900 L -140 900 L 0 360 Z', fill: '#ffd98a', opacity: 0.06 }, win);
  const shelf = el('g', { transform: 'translate(70,250)' }, wall);
  for (let r = 0; r < 2; r++) {
    el('rect', { x: 0, y: 120 + r * 150, width: 420, height: 14, rx: 7, fill: '#0b1636' }, shelf);
    const cols = [C.orange, C.yellow, '#f6f3ec', '#3a5cb8', C.orange2, '#8fa3d8'];
    for (let i = 0; i < 9; i++) el('rect', { x: 12 + i * 30, y: 120 + r * 150 - (70 + (i * 13) % 30), width: 24, height: 70 + (i * 13) % 30, rx: 4, fill: cols[(i + r * 2) % 6] }, shelf);
    el('path', { d: `M 310 ${120 + r * 150} L 330 ${60 + r * 150} L 350 ${60 + r * 150} L 370 ${120 + r * 150} Z`, fill: '#9fd3ff', opacity: 0.8 }, shelf);
    el('circle', { cx: 395, cy: 100 + r * 150, r: 18, fill: '#9fd3ff', opacity: 0.8 }, shelf);
  }
  // ---- calendario 3D (pasa hojas hasta 1999)
  const cal = el('g', { transform: 'translate(250,700) skewY(-6)' }, L.cal);
  el('rect', { x: -130, y: -110, width: 260, height: 250, rx: 16, fill: '#0b1636', opacity: 0.5, transform: 'translate(10,12)' }, cal);
  el('rect', { x: -130, y: -110, width: 260, height: 250, rx: 16, fill: C.white }, cal);
  el('rect', { x: -130, y: -110, width: 260, height: 60, rx: 16, fill: C.orange }, cal);
  const calTop = el('text', { x: 0, y: -68, 'font-size': 30, 'font-weight': 900, fill: C.white, 'text-anchor': 'middle', 'letter-spacing': 4 }, cal); calTop.textContent = 'AÑO';
  const pages = ['1996', '1997', '1998', '1999'].map((yr, i) => {
    const p = el('g', {}, cal);
    el('rect', { x: -122, y: -46, width: 244, height: 178, rx: 8, fill: i === 3 ? C.white : '#eef0f6' }, p);
    for (let k = 0; k < 3; k++) el('rect', { x: -96, y: 74 + k * 18, width: 192, height: 7, rx: 3, fill: '#c9cfe0' }, p);
    const tx = el('text', { x: 0, y: 52, 'font-size': 92, 'font-weight': 900, fill: i === 3 ? C.navy : '#3a4a78', 'text-anchor': 'middle', 'letter-spacing': -3 }, p);
    tx.textContent = yr;
    return { p, tx };
  });
  for (let i = 3; i >= 0; i--) cal.appendChild(pages[i].p);   // 1996 delante; 1999 debajo de todas
  for (let i = 0; i < 5; i++) el('rect', { x: -100 + i * 50, y: -122, width: 10, height: 30, rx: 5, fill: '#0b1636' }, cal);
  const calRing = el('rect', { x: -126, y: -50, width: 252, height: 186, rx: 10, fill: 'none', stroke: C.yellow, 'stroke-width': 8, opacity: 0 }, cal);

  // ---- escritorio con monitor
  const desk = L.desk;
  el('path', { d: 'M -100 1080 L 1180 1080 L 1220 1140 L -140 1140 Z', fill: '#f6f3ec' }, desk);
  el('rect', { x: -140, y: 1140, width: 1360, height: 700, fill: '#c3c9db' }, desk);
  el('rect', { x: -140, y: 1140, width: 1360, height: 12, fill: '#b9bfd2' }, desk);
  for (let i = 0; i < 4; i++) el('rect', { x: 20 + i * 270, y: 1190, width: 230, height: 120, rx: 10, fill: '#c9cfe0' }, desk);
  for (let i = 0; i < 4; i++) el('rect', { x: 110 + i * 270, y: 1240, width: 50, height: 10, rx: 5, fill: '#9aa3bf' }, desk);
  const mon = el('g', {}, desk);
  el('rect', { x: SCR.x + SCR.w / 2 - 22, y: SCR.y + SCR.h + 10, width: 44, height: 100, fill: '#0b1636' }, mon);
  el('rect', { x: SCR.x + SCR.w / 2 - 90, y: SCR.y + SCR.h + 100, width: 180, height: 18, rx: 9, fill: '#0b1636' }, mon);
  el('rect', { x: SCR.x - 18, y: SCR.y - 18, width: SCR.w + 36, height: SCR.h + 36, rx: 22, fill: '#0b1636' }, mon);
  el('clipPath', { id: 's02screen' }, mon).appendChild(el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: SCR.h, rx: 6 }));
  const screen = el('g', { 'clip-path': 'url(#s02screen)' }, mon);
  el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: SCR.h, fill: '#0b1636' }, screen);
  const screenCam = el('g', {}, screen);
  const game = makeGame(screenCam, { t0: 8.0, trail: false });
  const scan = el('g', { opacity: 0.12 }, screen);
  for (let i = 0; i < 40; i++) el('rect', { x: SCR.x, y: SCR.y + i * 8.5, width: SCR.w, height: 2, fill: '#000' }, scan);
  el('circle', { cx: SCR.x + 26, cy: SCR.y + 24, r: 9, fill: '#ff4a4a' }, screen);
  const rec = el('text', { x: SCR.x + 44, y: SCR.y + 33, 'font-size': 24, 'font-weight': 800, fill: '#fff' }, screen); rec.textContent = 'REC';
  const tc = el('text', { x: SCR.x + SCR.w - 18, y: SCR.y + 33, 'font-size': 22, 'font-weight': 800, fill: '#fff', 'text-anchor': 'end' }, screen);
  el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: SCR.h, rx: 6, fill: 'url(#screenGlare)' }, screen);
  // objetos del escritorio
  const plant = el('g', { transform: 'translate(40,1090)' }, desk);
  el('path', { d: 'M -34 0 L 34 0 L 26 -60 L -26 -60 Z', fill: C.orange }, plant);
  [[-40, -150, -25], [0, -190, 0], [40, -150, 25], [-20, -120, -50], [24, -125, 50]].forEach(([x, y, r]) => el('path', { d: 'M 0 0 Q 30 -50 0 -110 Q -30 -50 0 0 Z', fill: '#2f8a5f', transform: `translate(${x * 0.3},-56) rotate(${r})` }, plant));
  const mug = el('g', { transform: 'translate(470,1095)' }, desk);
  el('rect', { x: -26, y: -60, width: 52, height: 62, rx: 8, fill: C.orange }, mug);
  el('path', { d: 'M 26 -46 Q 50 -40 26 -16', stroke: C.orange, 'stroke-width': 9, fill: 'none' }, mug);
  el('rect', { x: 330, y: 1086, width: 110, height: 14, rx: 3, fill: '#f6f3ec', transform: 'rotate(-4 380 1093)' }, desk);
  el('rect', { x: 326, y: 1074, width: 110, height: 14, rx: 3, fill: '#c9cfe0', transform: 'rotate(3 380 1080)' }, desk);

  // ---- investigadores (detrás del escritorio, a la izquierda, mirando la pantalla)
  const resA = makePerson(L.people, { shirt: '#3a5cb8', pants: '#1d2b5c', skin: '#f1c7a1', hair: '#6b3f1f', style: 0, coat: '#f6f3ec', glasses: true, shadow: '#000' });
  const resB = makePerson(L.people, { shirt: C.orange, pants: '#1d2b5c', skin: '#a8714b', hair: '#14110f', style: 4, coat: '#f6f3ec', shadow: '#000' });
  const clipboard = el('g', {}, resB.held);
  el('rect', { x: -6, y: -60, width: 54, height: 70, rx: 6, fill: '#c98d63', transform: 'rotate(-20)' }, clipboard);
  el('rect', { x: 0, y: -52, width: 42, height: 54, rx: 3, fill: '#fff', transform: 'rotate(-20)' }, clipboard);

  // ---- primer plano desenfocado
  const fg = L.fg;
  const leaf = (x, y, r, s) => el('path', { d: 'M 0 0 Q 60 -120 0 -260 Q -60 -120 0 0 Z', fill: '#1f6b4a', transform: `translate(${x},${y}) rotate(${r}) scale(${s})`, filter: 'url(#blurFg)' }, fg);
  leaf(-10, 1960, 20, 1.6); leaf(60, 1980, -10, 1.3); leaf(-40, 1900, 45, 1.2);
  const flask = el('g', { transform: 'translate(1010,1900)', filter: 'url(#blurFg)' }, fg);
  el('path', { d: 'M -30 -320 L 30 -320 L 30 -200 L 120 0 L -120 0 L -30 -200 Z', fill: '#9fd3ff', opacity: 0.55 }, flask);
  el('path', { d: 'M -78 -90 L 78 -90 L 120 0 L -120 0 Z', fill: C.orange, opacity: 0.7 }, flask);

  // ---- tarjetas con los nombres
  const card = (name, x, y) => {
    const g = el('g', { opacity: 0 }, root);
    const wd = name.length > 14 ? 560 : 460;
    el('rect', { x: -230, y: -62, width: wd, height: 124, rx: 22, fill: '#0b1636', opacity: 0.4, transform: 'translate(8,10)' }, g);
    el('rect', { x: -230, y: -62, width: wd, height: 124, rx: 22, fill: C.white }, g);
    el('rect', { x: -230, y: -62, width: 18, height: 124, rx: 9, fill: C.orange }, g);
    const t1 = el('text', { x: -192, y: -4, 'font-size': 38, 'font-weight': 900, fill: C.navy }, g); t1.textContent = name;
    const t2 = el('text', { x: -192, y: 38, 'font-size': 24, 'font-weight': 800, fill: C.orange2, 'letter-spacing': 4 }, g); t2.textContent = 'PSICÓLOGO';
    return { g, x, y };
  };
  const cards = [card('DANIEL SIMONS', 300, 560), card('CHRISTOPHER CHABRIS', 560, 720)];
  cards[0].s = 18.45; cards[1].s = 19.5;

  // mapeo de un punto de una capa a pantalla (para anclar la tipografía de seguimiento)
  const toScreen = (p, cam, d) => { const s = 1 + (cam.zoom - 1) * d; const x = 540 - cam.x * d + (p.x - 540) * s, y = 960 - cam.y * d + (p.y + OFF - 960) * s;
    return { x: BASE.cx + (x - BASE.cx) * BASE.s, y: BASE.cy + (y - BASE.cy) * BASE.s, s: s * BASE.s }; };

  return {
    render(t, ctx) {
      const lt = t - S02.start;
      set(clip, { r: f1(1400 * ramp(t, 8.12, 8.65, E.inOut)) });
      // cámara: asentamiento + dolly lento + deriva lateral; al final atraviesa la pantalla
      const settle = 1 - ramp(t, 8.1, 9.4, E.out);
      const push = ramp(t, 22.3, 23.45, E.inExpo);
      const cam = { x: lerp(55, 95, ramp(t, 8.1, 22.3, E.inOut)) + noise1(t * 0.3, 2) * 6, y: noise1(t * 0.3, 5) * 5, zoom: 1.0 + 0.08 * ramp(t, 8.1, 22.3, E.inOut) + settle * 0.1 };
      const scrC = { x: SCR.x + SCR.w / 2, y: SCR.y + SCR.h / 2 };
      for (const k in DEPTH) {
        const d = DEPTH[k];
        const s = 1 + (cam.zoom - 1) * d, build = ramp(t, 8.2 + d * 0.25, 8.75 + d * 0.25, E.backSoft);
        const dy = (1 - build) * 160 * d;
        set(LO[k], { transform: `translate(${f1(540 - cam.x * d)},${f1(960 - cam.y * d + dy)}) scale(${f3(s)}) translate(-540,-960)` });
      }
      // empuje a través de la pantalla: escala alrededor del centro de la pantalla
      if (push > 0) {
        const sc = toScreen(scrC, cam, DEPTH.desk);
        const Z = lerp(1, 7.5, push);
        set(root, { transform: `translate(${f1(sc.x)},${f1(sc.y)}) scale(${f3(Z)}) translate(${f1(-sc.x)},${f1(-sc.y)})` });
      } else set(root, { transform: '' });
      // partido en la pantalla
      const S = 0.43;
      set(screenCam, { transform: `translate(${f1(scrC.x)},${f1(scrC.y)}) scale(${S}) translate(-540,-1080)` });
      game.render(t);
      const secs = Math.max(0, t - 8.1); tc.textContent = `00:${String(Math.floor(secs)).padStart(2, '0')}:${String(Math.floor((secs % 1) * 30)).padStart(2, '0')}`;
      set(rec, { opacity: Math.sin(t * 6) > 0 ? 1 : 0.3 });
      // investigadores
      const point = ramp(t, 10.6, 11.0, E.out) * (1 - ramp(t, 13.2, 13.6, E.in));
      const armsA = point > 0 ? ARMS.point(point) : ARMS.chin();
      drawPerson(resA, { x: 215, y: 1185, s: 1.02, face: 1, phase: 0, stride: 0, ...armsA, headR: -4 + Math.sin(t * 1.3) * 2, lean: Math.sin(t * 1.1) * 1.5, smile: 0.4 });
      const write = Math.sin(t * 9) * 4;
      drawPerson(resB, { x: 395, y: 1205, s: 1.06, face: 1, phase: 0, stride: 0, handB: { x: 30 + write, y: -205 }, handF: { x: 60, y: -228 }, headR: 8 + Math.sin(t * 0.9 + 1) * 3, lean: Math.sin(t * 0.8 + 2) * 1.5, smile: 0.5 });
      // calendario: pasa hojas con «En 1999» (15.94 s)
      pages.slice(0, 3).forEach((pg, i) => {
        const k = ramp(t, 15.55 + i * 0.16, 15.75 + i * 0.16, E.in);
        set(pg.p, { transform: `translate(0,-50) scale(1,${f3(Math.cos(k * Math.PI))}) skewX(${f1(-14 * Math.sin(k * Math.PI))}) translate(0,50)`, opacity: k < 0.5 ? 1 : 0 });
      });
      const hl = ramp(t, 16.05, 16.4, E.out) * (1 - ramp(t, 21.5, 22.0));
      set(calRing, { opacity: f3(hl) });
      set(pages[3].tx, { fill: hl > 0.5 ? C.orange2 : C.navy });
      // tarjetas con los nombres (flotan junto a los investigadores)
      cards.forEach((c, i) => {
        const k = ramp(t, c.s, c.s + 0.45, E.back), out = ramp(t, 22.0, 22.35, E.in);
        const fl = Math.sin(t * 1.6 + i) * 6;
        set(c.g, { opacity: f3(clamp(k * 2) * (1 - out)), transform: tr(c.x - cam.x * 0.8, c.y + fl + (1 - k) * 40, lerp(0.6, 1, k), lerp(-6, i ? 2 : -2, k)) });
      });
      // ancla para la tipografía de seguimiento (TIPO D): borde superior de la pantalla, con la perspectiva de su capa
      const a = toScreen({ x: scrC.x, y: SCR.y - 18 }, cam, DEPTH.desk);
      ctx.anchors.monitor = { x: a.x, y: a.y, s: a.s, skew: -2 };
    },
  };
}
