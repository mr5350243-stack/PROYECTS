// ESCENA 01 — EL OJO QUE NO VE (0 – 8.3 s)
// Ojo enorme sobre azul oscuro; la pupila sigue una pelota amarilla. Un personaje sale de detrás del ojo y saluda,
// pero el ojo no lo nota. La pelota salta a la pupila, la cámara entra y revela un pequeño mundo (la cancha).
// «¿MIRAR ES VER?»: «VER?» se fragmenta en piezas que se convierten en formas geométricas → laboratorio.
import { el, set, clamp, lerp, ramp, E, C, f1, f3, tr, rng } from '../lib.js';
import { makeEye } from '../eye.js';
import { makeGame } from '../court.js';
import { makePerson, drawPerson, ARMS } from '../characters.js';

export const S01 = { start: 0, end: 8.45 };
const EYE = { x: 540, y: 880 };

export function create(layer) {
  const deco = el('g', {}, layer);
  for (let i = 0; i < 60; i++) el('circle', { cx: (i * 197) % 1080, cy: (i * 331) % 1920, r: 2 + (i % 3), fill: '#2a4796', opacity: 0.35 }, deco);
  const eyeCam = el('g', {}, layer);
  // personaje detrás del ojo (se dibuja antes que el ojo)
  const guy = makePerson(eyeCam, { shirt: C.white, pants: '#1d2b5c', skin: '#e8b48c', hair: '#3b2416', style: 0, shadow: '#050b20' });
  const eyeWrap = el('g', { transform: `translate(${EYE.x},${EYE.y})` }, eyeCam);
  const eye = makeEye(eyeWrap);
  // pelota amarilla
  const yb = el('g', {}, layer);
  const trail = [0, 1, 2, 3].map(i => el('circle', { r: 26 - i * 4, fill: C.yellow, opacity: 0.25 }, yb));
  const ybSh = el('ellipse', { rx: 30, ry: 8, fill: '#020617', opacity: 0.4 }, yb);
  const ybBall = el('circle', { r: 28, fill: 'url(#yball)' }, yb);
  const yPos = (t) => ({ x: 540 + 300 * Math.sin(t * 2.3 - 0.4), y: 1330 - 220 * Math.abs(Math.sin(t * 4.6)) });
  // pequeño mundo dentro de la pupila
  const clipC = el('circle', { r: 0 }, el('clipPath', { id: 's01pupil' }, layer));
  const world = el('g', { 'clip-path': 'url(#s01pupil)', opacity: 0 }, layer);
  const worldCam = el('g', {}, world);
  const game = makeGame(worldCam, { t0: 3.0, trail: true });
  // título «¿MIRAR ES VER?» (entrada) y versión final con fragmentación
  const titles = el('g', {}, layer);
  const mk = (txt, size, color) => { const t = el('text', { 'font-size': size, 'font-weight': 900, 'text-anchor': 'middle', fill: color, stroke: C.ink, 'stroke-width': size * 0.12, 'paint-order': 'stroke', 'stroke-linejoin': 'round', 'letter-spacing': -size * 0.02 }, titles); t.textContent = txt; return t; };
  const tA = [mk('¿MIRAR', 96, C.white), mk('ES', 96, C.white), mk('VER?', 96, C.yellow)];
  const fin1 = mk('¿MIRAR ES', 120, C.white), fin2 = mk('VER?', 300, C.yellow);
  // fragmentos de «VER?» y formas geométricas de transición
  const shardsG = el('g', {}, layer);
  const R = rng(11), shards = [];
  for (let i = 0; i < 46; i++) {
    const sz = 16 + R() * 34, kind = i % 3;
    const col = [C.yellow, C.orange, C.white][i % 3];
    const shape = kind === 0 ? el('path', { d: `M 0 ${-sz} L ${sz * 0.9} ${sz * 0.6} L ${-sz * 0.9} ${sz * 0.6} Z`, fill: col }, shardsG)
      : kind === 1 ? el('rect', { x: -sz / 2, y: -sz / 2, width: sz, height: sz, rx: 3, fill: col }, shardsG)
      : el('circle', { r: sz * 0.5, fill: col }, shardsG);
    shards.push({ shape, ox: (R() - 0.5) * 420, oy: (R() - 0.5) * 220 - 20, vx: (R() - 0.5) * 1700, vy: (R() - 0.65) * 1500, rot: (R() - 0.5) * 720, d: R() * 0.12 });
  }
  const wipe = el('g', {}, layer);
  const wCircle = el('circle', { r: 0, fill: C.yellow }, wipe);
  const wSquare = el('rect', { fill: C.orange }, wipe);
  const wTri = el('path', { fill: C.navy2 }, wipe);

  let widths = null;
  return {
    render(t, ctx) {
      const intro = ramp(t, 0, 0.55, E.out);
      const zoom = ramp(t, 5.35, 7.35, E.inExpo);
      const blink = 1 - Math.max(0, Math.sin(clamp((t - 2.1) / 0.22) * Math.PI)) * 0.95;
      const o = blink * lerp(0.2, 1, ramp(t, 0, 0.45, E.out));
      // pelota y mirada
      const yp = yPos(t), dive = ramp(t, 4.85, 5.4, E.inOut);
      const dx = yp.x - EYE.x, dy = yp.y - EYE.y, d = Math.hypot(dx, dy) || 1;
      const off = Math.min(d * 0.2, 110) * (1 - dive);
      const px = dx / d * off, py = dy / d * off * 0.55;
      const pupilR = 66 * (1 + 0.3 * ramp(t, 4.9, 5.4, E.out));
      eye.render({ o, look: { x: px, y: py }, pupilR });
      const P = { x: EYE.x + px, y: EYE.y + py };
      const b2 = { x: lerp(yp.x, P.x, dive), y: lerp(yp.y, P.y, dive) - Math.sin(dive * Math.PI) * 260 };
      const bs = lerp(1, 0.25, dive) * intro;
      set(ybBall, { transform: tr(b2.x, b2.y, bs) });
      trail.forEach((c, i) => { const q = yPos(t - (i + 1) * 0.045); set(c, { transform: tr(lerp(q.x, P.x, dive), lerp(q.y, P.y, dive) - Math.sin(dive * Math.PI) * 260, bs), opacity: f3((0.28 - i * 0.06) * (1 - dive)) }); });
      set(ybSh, { cx: f1(yp.x), cy: 1365, opacity: f3(0.35 * (1 - dive) * intro) });
      set(yb, { opacity: f3(1 - ramp(t, 5.35, 5.45)) });
      // cámara: respiración suave y empuje final dentro de la pupila
      const eyeS = lerp(0.82, 1, intro) * (1 + 0.04 * Math.sin(t * 1.3)) * lerp(1, 26, zoom) * (1 + ramp(t, 0.5, 5.35, E.inOut) * 0.06);
      set(eyeCam, { transform: `translate(${f1(P.x)},${f1(P.y)}) scale(${f3(eyeS)}) translate(${f1(-P.x)},${f1(-P.y)})` });
      set(deco, { transform: `translate(540,960) scale(${f3(1 + zoom * 0.6)}) translate(-540,-960)` });
      // personaje: sale de detrás del ojo, saluda (el ojo sigue mirando la pelota) y vuelve
      const walkOut = ramp(t, 1.7, 2.9, E.inOut), walkBack = ramp(t, 4.6, 5.5, E.inOut);
      const gx = lerp(lerp(620, 990, walkOut), 640, walkBack);
      const moving = (t > 1.7 && t < 2.9) || (t > 4.6 && t < 5.5);
      const waving = t > 3.0 && t < 4.5;
      const arms = waving ? ARMS.wave(t) : (t > 4.5 && t < 4.65 ? ARMS.hips() : ARMS.rest());
      drawPerson(guy, { x: gx, y: 1075, s: 0.8, face: walkBack > 0 && walkBack < 1 ? -1 : (waving ? -1 : 1), phase: t * 9, stride: moving ? 1 : 0.15, ...arms, headR: waving ? -6 : 0, smile: waving ? 1 : 0.5 });
      set(guy.sh, { opacity: 0.25 });
      // mundo dentro de la pupila
      const pr = pupilR * eyeS;
      set(clipC, { cx: f1(P.x), cy: f1(P.y), r: f1(t > 7.35 ? 3000 : pr) });
      const cs = lerp(0.3, 1.0, zoom) * (1 + 0.035 * (1 - ramp(t, 7.35, 8.2, E.out)));
      set(worldCam, { transform: `translate(${f1(P.x)},${f1(P.y)}) scale(${f3(cs)}) translate(${f1(-P.x)},${f1(-P.y)})` });
      set(world, { opacity: f3(ramp(t, 4.9, 5.3)) });
      if (t > 4.8) game.render(t);
      // título de entrada (palabra a palabra con la voz: «mirar» 0.6 · «verlo» 1.54)
      if (!widths) widths = tA.map(x => x.getComputedTextLength());
      const total = widths.reduce((a, b) => a + b, 0) + 36 * 2; let x0 = 540 - total / 2;
      [0.5, 0.95, 1.45].forEach((s, i) => {
        const k = ramp(t, s, s + 0.4, E.back), out = ramp(t, 2.7, 3.1, E.in);
        const cx = x0 + widths[i] / 2; x0 += widths[i] + 36;
        set(tA[i], { x: f1(cx), y: 300, opacity: f3(clamp(k * 1.5) * (1 - out)), transform: `translate(${f1(cx)},300) scale(${f3(lerp(0.4, 1, k))}) translate(${f1(-cx)},${f1(-300 + lerp(60, 0, clamp(k)) - out * 120)})` });
      });
      // título final sobre el mundo y fragmentación de «VER?»
      const f1k = ramp(t, 6.75, 7.2, E.back), f2k = ramp(t, 7.0, 7.45, E.back), brk = ramp(t, 7.72, 8.35);
      const out1 = ramp(t, 7.72, 8.0, E.in);
      set(fin1, { x: 540, y: 700, opacity: f3(clamp(f1k * 2) * (1 - out1)), transform: `translate(540,700) scale(${f3(lerp(0.5, 1, f1k) * (1 + out1 * 0.2))}) translate(-540,${f1(-700 - out1 * 60)})` });
      const shake = t > 7.55 && t < 7.72 ? Math.sin(t * 140) * 6 * ramp(t, 7.55, 7.72) : 0;
      set(fin2, { x: 540, y: 960, opacity: f3(clamp(f2k * 2) * (t < 7.72 ? 1 : 0)), transform: `translate(${f1(540 + shake)},960) scale(${f3(lerp(0.3, 1, f2k))}) rotate(${f1(lerp(-10, -2, f2k))}) translate(-540,-960)` });
      shards.forEach(s => {
        const k = clamp((t - 7.72 - s.d) / 0.6);
        const x = 540 + s.ox + s.vx * (1 - Math.pow(1 - k, 2)) * 0.55, y = 870 + s.oy + s.vy * (1 - Math.pow(1 - k, 2)) * 0.55 + 300 * k * k;
        set(s.shape, { transform: tr(x, y, lerp(1, 2.6, k), s.rot * k), opacity: f3(t < 7.72 ? 0 : 1 - ramp(k, 0.6, 1)) });
      });
      // formas geométricas: círculo amarillo → cuadrado naranja → triángulo azul (el laboratorio se abre detrás)
      const c1 = ramp(t, 7.85, 8.2, E.inOut), c2 = ramp(t, 7.97, 8.3, E.inOut), c3 = ramp(t, 8.05, 8.38, E.inOut);
      set(wCircle, { cx: 540, cy: 900, r: f1(1300 * c1) });
      const sq = 2600 * c2; set(wSquare, { x: f1(540 - sq / 2), y: f1(960 - sq / 2), width: f1(sq), height: f1(sq), transform: `rotate(${f1(lerp(45, 0, c2))} 540 960)` });
      const tri = 3600 * c3; set(wTri, { d: `M 540 ${f1(960 - tri)} L ${f1(540 + tri)} ${f1(960 + tri * 0.8)} L ${f1(540 - tri)} ${f1(960 + tri * 0.8)} Z` });
    },
  };
}
