// ESCENA 02 — EL EXPEDIENTE (8.55 – 31.3 s)
// Escritorio ilustrado en capas. Los documentos de la escena 01 caen sobre la mesa; aparece la carpeta y se abre.
// «Entre 1978 y 1991…»: una línea temporal se despliega y la cámara la recorre con un travelling lateral; fotos
// ilustradas no gráficas (lugares) y documentos. Las 17 luces reaparecen sobre la línea. La hoja del expediente gira
// y se transforma en la escena 03.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, rng, noise1 } from '/ep01/src/lib.js';
import { makeDoc, makePhoto } from '../docs.js';
import { RED, PAPER, PAPER2, GREY } from '../style.js';

export const S02 = { start: 8.55, end: 31.3 };
const F = { x: 420, y: 560, w: 440, h: 600 };          // carpeta (cerrada)
const YX = (yr) => 150 + (yr - 1978) * 150;             // posición de cada año en la línea temporal

export function create(layer) {
  const cam = el('g', {}, layer);
  // mesa
  el('rect', { x: -1200, y: -600, width: 4600, height: 3200, fill: 'url(#deskTop)' }, cam);
  for (let i = 0; i < 40; i++) el('path', { d: `M -1200 ${-500 + i * 80} Q 600 ${-470 + i * 80 + (i % 3) * 20} 3400 ${-500 + i * 80}`, stroke: '#24335f', 'stroke-width': 3, fill: 'none', opacity: 0.6 }, cam);
  // objetos de mesa (capa de fondo)
  const props = el('g', {}, cam);
  const lens = el('g', { transform: 'translate(950,1180) rotate(-30)' }, props);
  el('line', { x1: 0, y1: 60, x2: 0, y2: 180, stroke: '#3a2a20', 'stroke-width': 22, 'stroke-linecap': 'round' }, lens);
  el('circle', { r: 64, fill: '#9fd3ff', 'fill-opacity': 0.15, stroke: '#c9cfe0', 'stroke-width': 12 }, lens);
  const pen = el('g', { transform: 'translate(250,1240) rotate(30)' }, props);
  el('rect', { x: -8, y: -110, width: 16, height: 220, rx: 8, fill: '#c9cfe0' }, pen); el('path', { d: 'M -8 110 L 0 140 L 8 110 Z', fill: C.ink }, pen);
  const cup = el('g', { transform: 'translate(110,420)' }, props);
  el('circle', { r: 74, fill: '#0e1530' }, cup); el('circle', { r: 60, fill: '#3a2a20' }, cup); el('circle', { r: 60, fill: 'none', stroke: '#c9cfe0', 'stroke-width': 10 }, cup);
  // línea temporal (cinta de papel con años)
  const tl = el('g', {}, cam);
  const tape = el('rect', { x: YX(1978) - 70, y: 230, width: 0, height: 64, rx: 8, fill: PAPER }, tl);
  const ticks = [];
  for (let yr = 1978; yr <= 1991; yr++) {
    const g = el('g', { transform: `translate(${YX(yr)},262)`, opacity: 0 }, tl);
    const big = yr === 1978 || yr === 1991;
    el('line', { x1: 0, y1: -32, x2: 0, y2: big ? -60 : -46, stroke: big ? RED : GREY, 'stroke-width': big ? 6 : 4 }, g);
    el('text', { x: 0, y: big ? 18 : 12, 'font-size': big ? 44 : 26, 'font-weight': 900, fill: big ? RED : C.ink, 'text-anchor': 'middle' }, g).textContent = String(yr);
    ticks.push({ g, yr });
  }
  // fotos y documentos colgando de la línea (lugares, sin personas)
  const pins = [[1979, 'photo', 0], [1982, 'doc', 1], [1985, 'photo', 1], [1987, 'doc', 2], [1989, 'photo', 2], [1990.6, 'doc', 3]].map(([yr, kind, k], i) => {
    const g = el('g', { opacity: 0 }, tl);
    if (kind === 'photo') makePhoto(g, k); else makeDoc(g, { w: 150, h: 190, lines: 5, seed: k, stamp: i === 5 });
    el('circle', { cx: 0, cy: -100, r: 10, fill: RED }, g);
    return { g, x: YX(yr), rot: (i % 2 ? 4 : -5), i };
  });
  const tlLights = [];
  for (let i = 0; i < 17; i++) { const g = el('g', { opacity: 0 }, tl); el('circle', { r: 22, fill: '#ffe9a0', opacity: 0.3, filter: 'url(#soft)' }, g); el('circle', { r: 7, fill: '#fff6d8' }, g); tlLights.push({ g, x: lerp(YX(1978), YX(1991), i / 16) }); }
  // documentos que llegan de la escena 01
  const R = rng(9), loose = [];
  for (let i = 0; i < 9; i++) { const d = makeDoc(cam, { w: 150, h: 196, lines: 5, seed: i + 4 }); loose.push({ d, x: 140 + R() * 800, y: 300 + R() * 900, r: (R() - 0.5) * 50, delay: R() * 0.4 }); }
  // carpeta: trasera, hoja interior, portada (gira sobre el lomo)
  const folder = el('g', {}, cam);
  el('rect', { x: F.x + 10, y: F.y + 14, width: F.w, height: F.h, rx: 12, fill: '#020617', opacity: 0.4 }, folder);
  el('path', { d: `M ${F.x} ${F.y} L ${F.x + 150} ${F.y} L ${F.x + 170} ${F.y - 40} L ${F.x + 330} ${F.y - 40} L ${F.x + 350} ${F.y} L ${F.x + F.w} ${F.y} L ${F.x + F.w} ${F.y + F.h} L ${F.x} ${F.y + F.h} Z`, fill: '#b9ad8a' }, folder);
  const sheet = el('g', {}, folder);
  const sheetInner = el('g', {}, sheet);
  makeDoc(el('g', { transform: `translate(${F.x + F.w / 2},${F.y + F.h / 2})` }, sheetInner), { w: F.w - 40, h: F.h - 40, lines: 13, photo: true, stamp: true, seed: 7 });
  const qmark = el('text', { x: F.x + F.w / 2 + 120, y: F.y + 210, 'font-size': 150, 'font-weight': 900, fill: RED, 'text-anchor': 'middle', opacity: 0 }, sheetInner); qmark.textContent = '?';
  const cover = el('g', {}, folder);
  const coverFront = el('g', {}, cover);
  el('rect', { x: F.x, y: F.y, width: F.w, height: F.h, rx: 12, fill: '#d9cba3' }, coverFront);
  el('rect', { x: F.x + 40, y: F.y + 70, width: 260, height: 70, rx: 8, fill: PAPER }, coverFront);
  el('text', { x: F.x + 60, y: F.y + 117, 'font-size': 32, 'font-weight': 900, fill: C.ink, 'letter-spacing': 3 }, coverFront).textContent = 'EXPEDIENTE';
  for (let i = 0; i < 3; i++) el('rect', { x: F.x + 40, y: F.y + 200 + i * 34, width: 300 - i * 60, height: 12, rx: 6, fill: '#c3b590' }, coverFront);
  const stampG = el('g', { transform: `translate(${F.x + F.w / 2 + 40},${F.y + F.h - 150}) rotate(-10)` }, coverFront);
  el('rect', { x: -150, y: -42, width: 300, height: 84, rx: 8, fill: 'none', stroke: RED, 'stroke-width': 7 }, stampG);
  el('text', { x: 0, y: 14, 'font-size': 40, 'font-weight': 900, fill: RED, 'text-anchor': 'middle', 'letter-spacing': 3 }, stampG).textContent = 'CASO DAHMER';
  const coverBack = el('rect', { x: F.x, y: F.y, width: F.w, height: F.h, rx: 12, fill: '#b9ad8a' }, cover);
  // luz de flexo
  el('rect', { x: -1200, y: -600, width: 4600, height: 3200, fill: 'url(#lampLight)', 'pointer-events': 'none' }, layer);
  // cubierta para la transición a la escena 03 (la hoja gira y llena la pantalla)
  const flip = el('rect', { x: 0, y: 0, width: 1080, height: 1920, fill: C.navy, opacity: 0 }, layer);

  return {
    render(t, ctx) {
      // llegada: la mesa sube desde abajo (la cámara baja desde la silueta)
      const arrive = ramp(t, 8.55, 9.6, E.inOut);
      // cámara: acercamiento suave; travelling lateral por la línea temporal; regreso a la carpeta
      const pan = ramp(t, 16.2, 19.6, E.inOut) * (1 - ramp(t, 22.4, 23.6, E.inOut));
      const toTL = ramp(t, 15.6, 16.4, E.inOut) * (1 - ramp(t, 22.4, 23.6, E.inOut));
      const cx = lerp(F.x + F.w / 2 + 40, lerp(540, YX(1991) - 360, pan), toTL);
      const cy = lerp(lerp(860, 840, ramp(t, 9.6, 15)), 640, toTL);
      const z = lerp(lerp(1.0, 1.08, ramp(t, 9.6, 15.5, E.inOut)), 0.95, toTL) * lerp(1, 1.06, ramp(t, 24, 30));
      set(cam, { transform: `translate(540,${f1(860 + 1300 * (1 - arrive))}) scale(${f3(z)}) translate(${f1(-cx + noise1(t * 0.3, 4) * 6)},${f1(-cy)})` });
      // documentos sueltos: caen sobre la mesa y se recogen en la carpeta
      loose.forEach(L => {
        const k = ramp(t, 8.8 + L.delay, 9.5 + L.delay, E.out5), g = ramp(t, 9.9 + L.delay * 0.5, 10.5 + L.delay * 0.5, E.inOut);
        set(L.d, { opacity: f3(clamp(k * 3) * (1 - ramp(g, 0.85, 1))), transform: tr(lerp(L.x, F.x + F.w / 2, g), lerp(L.y - 400 * (1 - k), F.y + F.h / 2, g), lerp(1.4, 1, k) * lerp(1, 0.6, g), lerp(L.r * 2, L.r, k) * (1 - g)) });
      });
      // carpeta: aparece, se abre con «El caso de Jeffrey Dahmer» (10.32 s)
      const fin = ramp(t, 9.3, 9.9, E.backSoft);
      set(folder, { opacity: f3(clamp(fin * 2)), transform: `translate(${F.x + F.w / 2},${F.y + F.h / 2}) scale(${f3(lerp(0.8, 1, fin))}) translate(${-(F.x + F.w / 2)},${-(F.y + F.h / 2)})` });
      const op = ramp(t, 10.5, 11.4, E.inOut);
      const sx = Math.cos(op * Math.PI);
      set(cover, { transform: `translate(${F.x},0) scale(${f3(sx)},1) skewY(${f1(-8 * Math.sin(op * Math.PI))}) translate(${-F.x},0)` });
      set(coverFront, { opacity: sx > 0 ? 1 : 0 }); set(coverBack, { opacity: sx > 0 ? 0 : 1 });
      // línea temporal: la cinta se despliega y aparecen los años (1978 → 1991)
      const un = ramp(t, 15.9, 18.6, E.inOut);
      set(tape, { width: f1((YX(1991) - YX(1978) + 140) * un) });
      ticks.forEach(T => set(T.g, { opacity: f3(ramp(un, (T.yr - 1978) / 13 - 0.04, (T.yr - 1978) / 13 + 0.04)) }));
      pins.forEach(P => {
        const k = ramp(t, 16.4 + P.i * 0.45, 16.9 + P.i * 0.45, E.backSoft) * (1 - ramp(t, 23.0, 23.5));
        set(P.g, { opacity: f3(clamp(k * 2)), transform: tr(P.x, 460 - 40 * (1 - k), lerp(0.7, 1, k), P.rot + Math.sin(t * 1.4 + P.i) * 1.5) });
      });
      set(tl, { opacity: f3(1 - ramp(t, 23.2, 23.8)) });
      tlLights.forEach((L, i) => set(L.g, { opacity: f3(ramp(t, 20.0 + i * 0.08, 20.3 + i * 0.08) * (0.85 + 0.15 * Math.sin(t * 2 + i))), transform: `translate(${f1(L.x)},${f1(176 - Math.sin(i * 1.3) * 8)})` }));
      // «motivaciones»: la lupa se desliza sobre la hoja y aparece una interrogación
      const lz = ramp(t, 24.5, 26.0, E.inOut);
      set(lens, { transform: `translate(${f1(lerp(950, F.x + F.w / 2 + 60, lz))},${f1(lerp(1180, F.y + 300, lz))}) rotate(-30) scale(${f3(lerp(1, 1.5, lz))})` });
      set(qmark, { opacity: f3(ramp(t, 28.2, 28.6)) });
      // transición: la hoja gira sobre su eje y se convierte en el fondo de la escena 03
      const fl = ramp(t, 30.2, 31.2, E.inOut);
      set(sheet, { transform: `translate(${F.x + F.w / 2},${F.y + F.h / 2}) scale(${f3(Math.max(0.02, Math.abs(Math.cos(fl * Math.PI / 2)) * lerp(1, 1.6, fl)))},${f3(lerp(1, 1.6, fl))}) translate(${-(F.x + F.w / 2)},${-(F.y + F.h / 2)})` });
      set(flip, { opacity: f3(ramp(t, 30.7, 31.25)) });
      ctx.anchors.folder = { x: 540 + (F.x + 250 - cx) * z, y: 860 + 1300 * (1 - arrive) + (F.y - 40 - cy) * z, s: 1, skew: -2 };
    },
  };
}
